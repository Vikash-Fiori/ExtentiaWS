sap.ui.define(["sap/ui/core/UIComponent","sap/ui/Device","com/agel/mmts/adminposummary/model/models","com/agel/mmts/adminposummary/controller/ErrorHandler"],function(t,s,e,i){"use strict";return t.extend("com.agel.mmts.adminposummary.Component",{metadata:{manifest:"json"},init:function(){t.prototype.init.apply(this,arguments);this._oErrorHandler=new i(this);this.getRouter().initialize();this.setModel(e.createDeviceModel(),"device")},destroy:function(){this._oErrorHandler.destroy();t.prototype.destroy.apply(this,arguments)},getContentDensityClass:function(){if(this._sContentDensityClass===undefined){if(document.body.classList.contains("sapUiSizeCozy")||document.body.classList.contains("sapUiSizeCompact")){this._sContentDensityClass=""}else if(!s.support.touch){this._sContentDensityClass="sapUiSizeCompact"}else{this._sContentDensityClass="sapUiSizeCozy"}}return this._sContentDensityClass}})});