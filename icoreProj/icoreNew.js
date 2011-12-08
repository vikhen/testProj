function showRSTResult(qry) {
	/* Another project try 2 */
    var client = new octopart.SearchClient(), i, k, found = false, titleStr = ': технические характеристики', descArr = [], imgPath;
    // jQuery('#P10_DESCR_STAT_ID').dialog({title:qry + titleStr}).dialog('open');
    jQuery('#P22_DESCR_STAT_ID').show();
    jQuery('#descr>tbody').html('');
    client.setQueryString(qry);
    client.submit(null, function(response) {
        for (k in response.results) {
            part = response.results[k].item;
            if (part.mpn === qry) {
                if (part.descriptions.length > 0) {
                    found = true;
                    descArr = part.descriptions[0].text.split(';');
                    for (i = 0; i < descArr.length; i++) {
                        if (typeof descArr[i].split(':')[1] != 'undefined') {
                            jQuery('#descr>tbody').append('<tr><td nowrap>' + descArr[i].split(':')[0] + '</td><td>&nbsp;</td><td>' + descArr[i].split(':')[1] + '</td></tr>');
                        } else {
                            if (part.images.length > 0)
                                imgPath = '<img src="' + part.images[0].url + '" width="55px" />';
                            else
                                imgPath = '&nbsp;';
                            if (part.datasheets.length > 0)
                                dsPath = '<a href="' + part.datasheets[0].url
                                        + '"><img width="30"  align="right" src="/kx3_res/elcotech/images/pdf_small.jpg" title="Документация" /></a>';
                            else
                                dsPath = '&nbsp;';
                            jQuery('#descr>tbody').append('<tr><td><b>' + descArr[i].split(':')[0] + '</b></td><td>' + imgPath + '</td><td></td></tr>');
                        }
                    }
                }
                if (part.datasheets.length > 0) {
                    found = true;
                    dsPath = '<a href="' + part.datasheets[0].url + '"><img width="30" align="left" src="/kx3_res/elcotech/images/pdf_small.png"' + 'title="Документация" /></a>';
                    jQuery('#descr>tbody').append('<tr><td>' + dsPath + '</td><td></td><td></td></tr>');
                }
            }
            if (found)
                break;
        }
        if (!found) {
            jQuery('#descr>tbody').append('<tr><td>Данных нет</td><td>&nbsp;</td><td></td></tr>');
            titleStr = '';
        }
    });
}
jQuery('[id^="PAGE_"]').live('pagecreate', function(e) {
    jQuery('form').bind('submit', function(e) {
        // e.preventDefault();
        return false;
    });
});

jQuery('div').live('pagehide', function(event, ui) { // JSON запрос информации с сайта octopart
    if (ui.nextPage[0].id === 'PAGE_22')
        showRSTResult($v('P22_INGRED_NAME'));
});
jQuery('.pagination a').live('click', function(event, ui) {
    // jQuery(this).ajaxStart(function() {
    jQuery.mobile.showPageLoadingMsg();
    // });
});
jQuery('#PAGE_10').live('pagecreate', function(event) {
    jQuery('#P10_PARTNERS').bind('apexafterrefresh', function(e) {
        jQuery('#P10_PARTNERS').find('[id^="report_"]').trigger('create');
        jQuery.mobile.hidePageLoadingMsg();
    });
});
jQuery('#PAGE_52').live('pagecreate', function(event) {
    jQuery('[name=ingred]').attr('value', $v('P52_NAME_SUBSTR'));
    jQuery('#slider').val($v('P52_ON_OFF'));
});
jQuery('#PAGE_52').live('pageshow', function(event) {
    if ($v('P52_CALLER') === '50')
        jQuery('.req_related').show();
});
jQuery('#PAGE_52,#PAGE_50').live('pagecreate', function() {
    jQuery('select[name=f40]').live('change', function(event) { // выбор кол-ва товара из списка
        var tgt = jQuery(event.target), pg = jQuery.mobile.activePage.find('#pFlowStepId').val(), options = {
            appProcess : 'P50_UPDATE_REQUEST',
            x01 : tgt.find('option:selected').val(), // кол-во
            x02 : tgt.closest('li').prev().find('[name=f42]').val(), // наименование
            x03 : pg, // страница
            async : false,
            success : function(data) {
                if (data === '!OK!') {
                    apex.event.trigger('#P' + pg + '_REQUEST', 'apexrefresh');
                } else {
                    alert(data);
                    jQuery.mobile.hidePageLoadingMsg();
                }

            }, // success
            error : function(xhr, status, err) {
                if (status === 'timeout') {
                    alert('Таймаут Web-соединения');
                } else {
                    alert('Возникла ошибка ' + (typeof err != 'undefined' ? err : ''));
                }
                jQuery.mobile.hidePageLoadingMsg();
            } // error
        };
        jQuery.mobile.showPageLoadingMsg();
        jQuery.jApex.ajax(options);
    }); // выбор кол-ва товара из списка
    jQuery('#P50_REQUEST,#P52_REQUEST').live('apexafterrefresh', function() {
        if ($x('P52_CALLER') && $v('P52_CALLER') === '50') // если страница со списком товаров вызывалась из заявки
            jQuery('.req_related').show();
        jQuery('[id^="report_"]').trigger('create');
        jQuery.mobile.hidePageLoadingMsg();
    });
});

function filterIngreds() {
    var options;
    if ($v('P52_SEARCH').length < 3) {
        alert('Введите не менее 3 символов');
        return;
    }
    $s('P52_ON_OFF', jQuery('#slider option:selected').val());
    $s('P52_NAME_SUBSTR', jQuery('#P52_SEARCH').val());
    options = {
        appProcess : 'DUMMY',
        pageItems : jQuery('#P52_ON_OFF,#P52_NAME_SUBSTR,#P52_NOM_LIST'),
        async : true,
        success : function(data) {
            if (data === '!OK!') {
                apex.event.trigger('#P52_REQUEST', 'apexrefresh');
            } else {
                alert(data);
                jQuery.mobile.hidePageLoadingMsg();
            }

        }, // success
        error : function(xhr, status, err) {
            if (status === 'timeout') {
                alert('Таймаут Web-соединения');
            } else {
                alert('Возникла ошибка ' + (typeof err != 'undefined' ? err : ''));
            }
            jQuery.mobile.hidePageLoadingMsg();
        } // error
    };
    jQuery.mobile.showPageLoadingMsg();
    jQuery.jApex.ajax(options);
}
function filterPartners() {
    var options;
    $s('P10_NAME_SUBSTR', jQuery('#P10_SEARCH').val());
    options = {
        appProcess : 'DUMMY',
        pageItems : jQuery('#P10_NAME_SUBSTR'),
        async : true,
        success : function(data) {
            if (data === '!OK!') {
                apex.event.trigger('#P10_PARTNERS', 'apexrefresh');
            } else {
                alert(data);
                jQuery.mobile.hidePageLoadingMsg();
            }

        }, // success
        error : function(xhr, status, err) {
            if (status === 'timeout') {
                alert('Таймаут Web-соединения');
            } else {
                alert('Возникла ошибка ' + (typeof err != 'undefined' ? err : ''));
            }
            jQuery.mobile.hidePageLoadingMsg();
        } // error
    };
    jQuery.mobile.showPageLoadingMsg();
    jQuery.jApex.ajax(options);
}
function redirect10(app, page, session) {
    var url = 'f?p=' + app + ':' + page + ':' + session + ':::RP:P10_NAME_SUBSTR:' + encodeURIComponent($v('P10_NAME_SUBSTR'));
    redirect(url);
}
function dumpProps(obj, parent) {
    // Go through all the properties of the passed-in object
    for ( var i in obj) {
        // if a parent (2nd parameter) was passed in, then use that to
        // build the message. Message includes i (the object's property name)
        // then the object's property value on a new line
        if (parent) {
            var msg = parent + "." + i + "\n" + obj[i];
        } else {
            var msg = i + "\n" + obj[i];
        }
        // Display the message. If the user clicks "OK", then continue. If they
        // click "CANCEL" then quit this level of recursion
        if (!confirm(msg)) {
            return;
        }
        // If this property (i) is an object, then recursively process the object
        if (typeof obj[i] == "object") { 
            if (parent) {
                dumpProps(obj[i], parent + "." + i);
            } else {
                dumpProps(obj[i], i);
            }
        }
    }
}

function voidVod(par) {
    void (par);
}
function voidVoid(param) {
    void(param);
}