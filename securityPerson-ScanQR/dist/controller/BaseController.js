sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/BusyIndicator"],function(e,t){"use strict";return e.extend("com.agel.mmts.securityPerson-ScanQR.controller.BaseController",{getRouter:function(){return sap.ui.core.UIComponent.getRouterFor(this)},addContentDensityClass:function(){return this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass())},getViewModel:function(e){return this.getView().getModel(e)},getComponentModel:function(){return this.getOwnerComponent().getModel()},setModel:function(e,t){return this.getView().setModel(e,t)},getResourceBundle:function(){return this.getOwnerComponent().getModel("i18n").getResourceBundle()},presentBusyDialog:function(){t.show()},dismissBusyDialog:function(){t.hide()},addHistoryEntry:function(){var e=[];return function(t,n){if(n){e=[]}var o=e.some(function(e){return e.intent===t.intent});if(!o){e.push(t);this.getOwnerComponent().getService("ShellUIService").then(function(t){t.setHierarchy(e)})}}}()})});