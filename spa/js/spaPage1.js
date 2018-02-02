/**
 * Created by zhanghao1 on 2017/11/8.
 */

define(function (require, exports, module) {
    "use strict";

    var $ = window.Zepto;
    var util = window.UP.W.Util;

    module.exports = {
        //初始化
        onInit:function($container,tpl){
            this.$container = $container;
            this.tpl = tpl;
            this.initTemplate(tpl,{});
        },

        //重新显示
        onShow:function ($container) {
            this.$container = $container;
        },

        //渲染模板
        initTemplate: function (tpl, data) {
            this.$container.html(util.template(tpl, data));
        },

        //当前页面选择器
        findDom: function (selector) {
            return this.$container.find(selector);
        },

        //公共变量
        variable1:"",

        //绑定事件
        bindEvents:function () {

        },

        //一系列方法
        methodA:function () {

        },

        methodB:function () {

        }
    }
});