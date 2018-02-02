/**
 * http://git.oschina.net/loonhxl/jbase64/blob/master/jbase64.js
 * BASE64 Encode and Decode By UTF-8 unicode
 * 可以和java的BASE64编码和解码互相转化
 */
(function () {
    var BASE64_MAPPING = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
        'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
        'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
        'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
        'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
        'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
        'w', 'x', 'y', 'z', '0', '1', '2', '3',
        '4', '5', '6', '7', '8', '9', '+', '/'
    ];

    /**
     *ascii convert to binary
     */
    var _toBinary = function (ascii) {
        var binary = new Array();
        while (ascii > 0) {
            var b = ascii % 2;
            ascii = Math.floor(ascii / 2);
            binary.push(b);
        }
        /*
         var len = binary.length;
         if(6-len > 0){
         for(var i = 6-len ; i > 0 ; --i){
         binary.push(0);
         }
         }*/
        binary.reverse();
        return binary;
    };

    /**
     *binary convert to decimal
     */
    var _toDecimal = function (binary) {
        var dec = 0;
        var p = 0;
        for (var i = binary.length - 1; i >= 0; --i) {
            var b = binary[i];
            if (b == 1) {
                dec += Math.pow(2, p);
            }
            ++p;
        }
        return dec;
    };

    /**
     *unicode convert to utf-8
     */
    var _toUTF8Binary = function (c, binaryArray) {
        var mustLen = (8 - (c + 1)) + ((c - 1) * 6);
        var fatLen = binaryArray.length;
        var diff = mustLen - fatLen;
        while (--diff >= 0) {
            binaryArray.unshift(0);
        }
        var binary = [];
        var _c = c;
        while (--_c >= 0) {
            binary.push(1);
        }
        binary.push(0);
        var i = 0, len = 8 - (c + 1);
        for (; i < len; ++i) {
            binary.push(binaryArray[i]);
        }

        for (var j = 0; j < c - 1; ++j) {
            binary.push(1);
            binary.push(0);
            var sum = 6;
            while (--sum >= 0) {
                binary.push(binaryArray[i++]);
            }
        }
        return binary;
    };

    var __BASE64 = {
        /**
         *BASE64 Encode
         */
        encoder: function (str) {
            var base64_Index = [];
            var binaryArray = [];
            for (var i = 0, len = str.length; i < len; ++i) {
                var unicode = str.charCodeAt(i);
                var _tmpBinary = _toBinary(unicode);
                if (unicode < 0x80) {
                    var _tmpdiff = 8 - _tmpBinary.length;
                    while (--_tmpdiff >= 0) {
                        _tmpBinary.unshift(0);
                    }
                    binaryArray = binaryArray.concat(_tmpBinary);
                } else if (unicode >= 0x80 && unicode <= 0x7FF) {
                    binaryArray = binaryArray.concat(_toUTF8Binary(2, _tmpBinary));
                } else if (unicode >= 0x800 && unicode <= 0xFFFF) {//UTF-8 3byte
                    binaryArray = binaryArray.concat(_toUTF8Binary(3, _tmpBinary));
                } else if (unicode >= 0x10000 && unicode <= 0x1FFFFF) {//UTF-8 4byte
                    binaryArray = binaryArray.concat(_toUTF8Binary(4, _tmpBinary));
                } else if (unicode >= 0x200000 && unicode <= 0x3FFFFFF) {//UTF-8 5byte
                    binaryArray = binaryArray.concat(_toUTF8Binary(5, _tmpBinary));
                } else if (unicode >= 4000000 && unicode <= 0x7FFFFFFF) {//UTF-8 6byte
                    binaryArray = binaryArray.concat(_toUTF8Binary(6, _tmpBinary));
                }
            }

            var extra_Zero_Count = 0;
            for (var i = 0, len = binaryArray.length; i < len; i += 6) {
                var diff = (i + 6) - len;
                if (diff == 2) {
                    extra_Zero_Count = 2;
                } else if (diff == 4) {
                    extra_Zero_Count = 4;
                }
                //if(extra_Zero_Count > 0){
                //	len += extra_Zero_Count+1;
                //}
                var _tmpExtra_Zero_Count = extra_Zero_Count;
                while (--_tmpExtra_Zero_Count >= 0) {
                    binaryArray.push(0);
                }
                base64_Index.push(_toDecimal(binaryArray.slice(i, i + 6)));
            }

            var base64 = '';
            for (var i = 0, len = base64_Index.length; i < len; ++i) {
                base64 += BASE64_MAPPING[base64_Index[i]];
            }

            for (var i = 0, len = extra_Zero_Count / 2; i < len; ++i) {
                base64 += '=';
            }
            return base64;
        },
        /**
         *BASE64  Decode for UTF-8
         */
        decoder: function (_base64Str) {
            var _len = _base64Str.length;
            var extra_Zero_Count = 0;
            /**
             *计算在进行BASE64编码的时候，补了几个0
             */
            if (_base64Str.charAt(_len - 1) == '=') {
                //alert(_base64Str.charAt(_len-1));
                //alert(_base64Str.charAt(_len-2));
                if (_base64Str.charAt(_len - 2) == '=') {//两个等号说明补了4个0
                    extra_Zero_Count = 4;
                    _base64Str = _base64Str.substring(0, _len - 2);
                } else {//一个等号说明补了2个0
                    extra_Zero_Count = 2;
                    _base64Str = _base64Str.substring(0, _len - 1);
                }
            }

            var binaryArray = [];
            for (var i = 0, len = _base64Str.length; i < len; ++i) {
                var c = _base64Str.charAt(i);
                for (var j = 0, size = BASE64_MAPPING.length; j < size; ++j) {
                    if (c == BASE64_MAPPING[j]) {
                        var _tmp = _toBinary(j);
                        /*不足6位的补0*/
                        var _tmpLen = _tmp.length;
                        if (6 - _tmpLen > 0) {
                            for (var k = 6 - _tmpLen; k > 0; --k) {
                                _tmp.unshift(0);
                            }
                        }
                        binaryArray = binaryArray.concat(_tmp);
                        break;
                    }
                }
            }

            if (extra_Zero_Count > 0) {
                binaryArray = binaryArray.slice(0, binaryArray.length - extra_Zero_Count);
            }

            var unicode = [];
            var unicodeBinary = [];
            for (var i = 0, len = binaryArray.length; i < len;) {
                if (binaryArray[i] == 0) {
                    unicode = unicode.concat(_toDecimal(binaryArray.slice(i, i + 8)));
                    i += 8;
                } else {
                    var sum = 0;
                    while (i < len) {
                        if (binaryArray[i] == 1) {
                            ++sum;
                        } else {
                            break;
                        }
                        ++i;
                    }
                    unicodeBinary = unicodeBinary.concat(binaryArray.slice(i + 1, i + 8 - sum));
                    i += 8 - sum;
                    while (sum > 1) {
                        unicodeBinary = unicodeBinary.concat(binaryArray.slice(i + 2, i + 8));
                        i += 8;
                        --sum;
                    }
                    unicode = unicode.concat(_toDecimal(unicodeBinary));
                    unicodeBinary = [];
                }
            }
            return unicode;
        }
    };

    window.BASE64 = __BASE64;
})();

(function ($, UP) {
    "use strict";

    UP.W = UP.W || {};
    // 工具函数
    UP.W.Util = UP.W.Util || {};
    var util = UP.W.Util;

    /**
     * 将URL查询参数转换为Object
     * @param str：可选参数，如果不传入默认解析当前页面查询参数
     * @returns {{object}}
     */
    util.urlQuery2Obj = function (str) {
        if (!str) {
            str = location.search;
        }

        if (str[0] === '?' || str[0] === '#') {
            str = str.substring(1);
        }
        var query = {};

        str.replace(/\b([^&=]*)=([^&]*)/g, function (m, a, d) {
            if (typeof query[a] !== 'undefined') {
                query[a] += ',' + decodeURIComponent(d);
            } else {
                query[a] = decodeURIComponent(d);
            }
        });

        return query;
    };

    /**
     * 对HTML进行转义
     * @param html 待转义的HTML字符串
     * @returns {*}
     */
    util.htmlEncode = function (html) {
        var temp = document.createElement("div");
        temp.textContent = html;
        var output = temp.innerHTML;
        temp = null;
        return output;
    };

    /**
     * 对HTML进行逆转义
     * @param html 待逆转义的HTML字符串
     * @returns {*}
     */
    util.htmlDecode = function (html) {
        var temp = document.createElement("div");
        temp.innerHTML = html;
        var output = temp.textContent;
        temp = null;
        return output;
    };

    /**
     * Base64编码
     * @param str
     * @returns {string}
     */
    util.base64Encode = function (str) {
        return BASE64.encoder(str);
    };

    /**
     * Base64解码
     * @param str
     * @returns {string}
     */
    util.base64Decode = function (str) {
        var unicode = BASE64.decoder(str);//返回会解码后的unicode码数组。
        str = [];
        for (var i = 0, len = unicode.length; i < len; ++i) {
            str.push(String.fromCharCode(unicode[i]));
        }
        return str.join('');
    };

    /**
     * 移植自underscore的模板
     * @param text 模板文本
     * @param data 数据（可选参数）
     * @returns {*}
     */
    util.template = function (text, data) {
        var render;
        var settings = {
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: /<%=([\s\S]+?)%>/g,
            escape: /<%-([\s\S]+?)%>/g
        };
        var noMatch = /(.)^/;
        var matcher = new RegExp([
            (settings.escape || noMatch).source,
            (settings.interpolate || noMatch).source,
            (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g');
        var escapes = {
            "'": "'",
            '\\': '\\',
            '\r': 'r',
            '\n': 'n',
            '\t': 't',
            '\u2028': 'u2028',
            '\u2029': 'u2029'
        };

        var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset)
                .replace(escaper, function (match) {
                    return '\\' + escapes[match];
                });

            if (escape) {
                source += "'+\n((__t=(" + escape + "))==null?'':_.htmlEncode(__t))+\n'";
            }
            if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            }
            if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }
            index = offset + match.length;
            return match;
        });
        source += "';\n";

        if (!settings.variable) {
            source = 'with(obj||{}){\n' + source + '}\n';
        }

        source = "var __t,__p='',__j=Array.prototype.join," +
            "print=function(){__p+=__j.call(arguments,'');};\n" +
            source + "return __p;\n";
        try {
            render = new Function(settings.variable || 'obj', '_', source);
        } catch (e) {
            e.source = source;
            throw e;
        }

        if (data) {
            return render(data, util);
        }
        var template = function (data) {
            return render.call(this, data, util);
        };

        template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

        return template;
    };

    /**
     * 内部函数，动态加载脚本文件
     * @param url
     */
    util.loadScript = function (url) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        document.getElementsByTagName('head')[0].appendChild(script);
    };

})(window.Zepto || window.jQuery, window.UP = window.UP || {});

// commonUI
(function ($, UP) {
    "use strict";

    UP.W = UP.W || {};
    // H5UI组件
    UP.W.UI = UP.W.UI || {};
    var ui = UP.W.UI;

    /**
     * 显示H5加载动画
     * @param msg
     */
    ui.showLoading = function (msg) {
        clearTimeout(ui.dismissTimer);
        if ($('#commonUILoading').length === 0) {
            //将commonUI-mask和commonUI-loading并行放置，共同放置到 commonUILoading内[Android4.4.4黑条bug]
            var html = '<div id="commonUILoading"><div class="commonUI-loading-mask"></div>';
            html += '<div class="commonUI-loading">';
            html += '<div class="commonUI-loadingPic">';
            html += '</div>';
            html += '<div class="commonUI-loadingText">加载中...</div>';
            html += '</div>';
            html += '</div>';
            $('body').append(html);
        }
        var $el = $('#commonUILoading');
        $el.find('.commonUI-loadingText').text(msg || '加载中...');
        $('body').addClass('commonUI-overflow');
        $el.show();
    };

    /**
     * 隐藏H5加载动画
     */
    ui.dismiss = function () {
        $('#commonUILoading').hide();
        $('body').removeClass('commonUI-overflow');
    };

    /**
     * 延迟隐藏动画
     * @param delay
     */
    ui.dismissTimer = 0;
    ui.dismissDelay = function (delay) {
        if (!delay || delay > 1000) {
            delay = 300;
        }
        ui.dismissTimer = setTimeout(function () {
            UP.W.UI.dismiss();
        }, delay);
    };

    /**
     * 显示H5 Toast提示
     * @param msg
     */
    var toastTimer = null;
    ui.showToast = function (msg, time) {
        time = time || 3000;
        if ($('#commonUIToast').length === 0) {
            var html = '<div id="commonUIToast" class="commonUI-toast">';
            html += '<div class="commonUI-toast-wrapper">';
            html += '<span></span>';
            html += '</div>';
            html += '</div>';
            $('body').append(html);
        }
        var $el = $('#commonUIToast');
        $el.find('span').text(msg);
        // 动画渐显
        $el.show();
        $el.removeClass('fadeOut');
        $el.addClass('fadeIn');
        clearTimeout(toastTimer);
        // 动画渐隐
        toastTimer = setTimeout(function () {
            $el.removeClass('fadeIn');
            $el.addClass('fadeOut');
            setTimeout(function () {
                $el.hide();
            }, 800);
        }, time);
    };

    /**
     * 提示/确认对话框
     * @param message 提示消息
     * @param okCallback “确定/知道了”回调
     * @param cancelCallback “取消”回调
     * @param okText “确定/知道了”按钮自定义文本
     * @param cancelText “取消”按钮自定义文本
     * @param titleText “提示” 标题 文本
     */
    ui.showAlert = function (message, okCallback, cancelCallback, okText, cancelText, titleText, actNm, actCallback) {
        setTimeout(function () {
            if ($('#commonUIAlert').length === 0) {
                var html = '<div id="commonUIAlert" class="commonUI-mask">';
                html += '<div class="commonUI-alert">';
                //头部
                html += '<div class="commonUI-alertTitle">';
                html += '<p>提示</p>';
                html += '</div>';
                // 上部
                html += '<div class="commonUI-alertTop">';
                html += '<p></p>';
                html += '</div>';
                // 下部
                html += '<div class="commonUI-alertBottom">';
                html += '<button class="commonUI-alertButton" data-btn="Yes">确定</button>';
                html += '<button class="commonUI-alertButton" data-btn="No">取消</button>';
                html += '<button class="commonUI-alertButton" data-btn="OK">知道了</button>';
                html += '</div>';

                html += '</div>';
                html += '</div>';
                $('body').append(html);
            }

            $('.commonUI-alertButton').unbind().bind('click', function () {
                $el.hide();
                $('body').removeClass('commonUI-overflow');
                // 确定点击了哪个按钮，调用对应的回调
                var type = $(this).attr('data-btn');
                if (type === 'Yes' || type === 'OK') {
                    if (typeof okCallback === 'function') {
                        okCallback();
                    }
                } else if (type === 'No') {
                    if (typeof cancelCallback === 'function') {
                        cancelCallback();
                    }
                }
            });

            var $el = $('#commonUIAlert');
            // 如果定义了cancelCallback或cancelText则是confirm
            if (cancelCallback || cancelText) {
                $el.find('.commonUI-alertButton[data-btn="Yes"]').text(okText || '确定').show();
                $el.find('.commonUI-alertButton[data-btn="No"]').text(cancelText || '取消').show();
                $el.find('.commonUI-alertButton[data-btn="OK"]').hide();
            } else {
                $el.find('.commonUI-alertButton[data-btn="Yes"]').hide();
                $el.find('.commonUI-alertButton[data-btn="No"]').hide();
                $el.find('.commonUI-alertButton[data-btn="OK"]').text(okText || '知道了').show();
            }
            $el.find('.commonUI-alertTop p').text(message);
            if (message) {
                $el.find('.commonUI-alertTop').show();
            } else {
                $el.find('.commonUI-alertTop').hide();
            }
            if (actNm && actCallback) {
                $el.find('.commonUI-alertTop p').append('<a class="commonUI-actButton">' + actNm + '</a>');
                $('.commonUI-actButton').unbind().bind('click', function () {
                    actCallback();
                });
            }
            //头部提示，允许为空串
            if (typeof titleText !== 'undefined') {
                $el.find('.commonUI-alertTitle p').text(titleText);
            } else if (cancelCallback || cancelText) {
                $el.find('.commonUI-alertTitle p').text("确认");
            } else {
                $el.find('.commonUI-alertTitle p').text("提示");
            }

            $('body').addClass('commonUI-overflow');
            $el.show();
        }, 200)
    };

    /**
     * 提示/确认对话框（含输入框）
     * @param message 提示消息
     * @param okCallback “确定/知道了”回调
     * @param cancelCallback “取消”回调
     * @param okText “确定/知道了”按钮自定义文本
     * @param cancelText “取消”按钮自定义文本
     * @param titleText “提示” 标题 文本
     */
    ui.showAlertWithInput = function (message, okCallback, cancelCallback, okText, cancelText, titleText, placeText) {
        setTimeout(function () {
            if ($('#commonUIAlertWithInput').length === 0) {
                var html = '<div id="commonUIAlertWithInput" class="commonUI-mask">';
                html += '<div class="commonUI-alert">';
                //头部
                html += '<div class="commonUI-alertTitleWithInput">';
                html += '<p>提示</p>';
                html += '</div>';
                // 上部
                html += '<div class="commonUI-alertTopWithInput">';
                html += '<p></p>';
                html += '</div>';
                // 输入框
                html += '<input type="text" placeholder="" class="commonUI-alertInput" maxlength="20">';
                // 下部
                html += '<div class="commonUI-alertBottom">';
                html += '<button class="commonUI-alertButton" data-btn="Yes">确定</button>';
                html += '<button class="commonUI-alertButton" data-btn="No">取消</button>';
                html += '</div>';

                html += '</div>';
                html += '</div>';
                $('body').append(html);
            }

            var $el = $('#commonUIAlertWithInput');

            $('#commonUIAlertWithInput .commonUI-alertButton').unbind().bind('click', function () {
                var type = $(this).attr('data-btn');
                var value = $el.find('.commonUI-alertInput').val().trim();
                if (type === 'Yes' && value.length == 0) {
                    return;
                }
                $el.hide();
                $('body').removeClass('commonUI-overflow');
                // 确定点击了哪个按钮，调用对应的回调
                if (type === 'Yes') {
                    if (typeof okCallback === 'function') {
                        okCallback(value);
                    }
                } else if (type === 'No') {
                    if (typeof cancelCallback === 'function') {
                        cancelCallback();
                    }
                }
            });

            $('.commonUI-alertInput').unbind().bind('input', function () {
                if ($el.find('.commonUI-alertInput').val().trim().length == 0) {
                    $el.find('.commonUI-alertButton[data-btn="Yes"]').addClass('disableYesBtn');
                    return;
                } else {
                    $el.find('.commonUI-alertButton[data-btn="Yes"]').removeClass('disableYesBtn');
                }
            });

            $el.find('.commonUI-alertButton[data-btn="Yes"]').text(okText || '确定').show();
            $el.find('.commonUI-alertButton[data-btn="No"]').text(cancelText || '取消').show();
            if ($el.find('.commonUI-alertInput').val().trim().length == 0) {
                $el.find('.commonUI-alertButton[data-btn="Yes"]').addClass('disableYesBtn');
            }

            $el.find('.commonUI-alertTopWithInput p').text(message);
            if (message) {
                $el.find('.commonUI-alertTopWithInput').show();
            } else {
                $el.find('.commonUI-alertTopWithInput').hide();
            }
            //头部提示，允许为空串
            if (typeof titleText !== 'undefined') {
                $el.find('.commonUI-alertTitleWithInput p').text(titleText);
            } else if (cancelCallback || cancelText) {
                $el.find('.commonUI-alertTitleWithInput p').text("确认");
            } else {
                $el.find('.commonUI-alertTitleWithInput p').text("提示");
            }

            if (placeText) {
                $el.find('.commonUI-alertInput').attr('placeholder', placeText);
            }

            $('body').addClass('commonUI-overflow');
            $el.show();
        }, 200)
    };

})(window.Zepto || window.jQuery, window.UP = window.UP || {});