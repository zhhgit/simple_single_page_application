/**
 * Created by zhanghao1 on 2017/11/8.
 */

;(function ($,undefined) {
    "use strict";

    //进页面先去除hash
    var url = window.location.href;
    if(url.indexOf("#") >= 0) {
        window.location.href = url.split("#")[0];
    }

    //定义全局空间，和存储已加载页面的空对象
    window.SPA = window.SPA || {};
    var spa = window.SPA;
    spa.modules = {};

    //监听页面hash值改变，并加载主页面
    setOnHashChangeListener();
    switchContainer("spaPage1");

    //监听页面hash值改变
    function setOnHashChangeListener() {
        //监听锚点的改变，切换页面
        window.addEventListener("hashchange", function(){
            var hash = window.location.hash;
            if(hash.indexOf("#") >= 0){
                hash = hash.substring(1);
            }
            else{
                hash = "";
            }
            var name = (hash === "") ? "spaPage1" : hash;
            switchContainer(name);
        });
    }

    //切换到指定页面
    function switchContainer(name) {
        //隐藏所有
        $(".page-container").hide();

        //切换title
        var titles = {
            "spaPage1":"title1",
            "spaPage2":"title2"
        };
        document.title = titles[name];


        //加载页面
        var $el = $('#page_' + name);
        //已经存在就显示
        if ($el.length > 0) {
            $el.show();
            var module = spa.modules[name];
            if (typeof module.onShow === 'function') {
                module.onShow($el);
            }
            document.body.scrollTop = 0;
        }
        //不存在动态加载
        else {
            var modules = ["../html/" + name + ".html","../js/" + name + ".js"];
            seajs.use(modules, function (html, obj) {
                var $el = $('<div class="page-container"></div>');
                $el.attr('id', 'page_' + name);
                $('.body-wrapper').append($el);
                document.body.scrollTop = 0;
                spa.modules[name] = obj;
                if (typeof obj.onInit === 'function') {
                    obj.onInit($el,html);
                }
                $el.show();
            });
        }
    }

})(Zepto);