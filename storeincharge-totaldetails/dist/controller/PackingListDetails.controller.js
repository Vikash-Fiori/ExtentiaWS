sap.ui.define(["./BaseController","sap/ui/model/json/JSONModel","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/core/Fragment","sap/ui/model/Sorter","sap/ui/Device","sap/ui/core/routing/History","sap/m/ColumnListItem","sap/m/Input","jquery.sap.global","sap/m/MessageBox","sap/m/MessageToast","../utils/formatter"],function(e,t,i,o,s,n,a,r,l,d,u,g,c,h){"use strict";return e.extend("com.agel.mmts.storeinchargetotaldetails.controller.PackingListDetails",{formatter:h,onInit:function(){u.sap.addUrlWhitelist("blob");var e=new t({busy:true,delay:0});this.setModel(e,"objectViewModel");var i=new t({closeButton:false,submitButton:true});this.setModel(i,"oViewHandlingModel");this.MainModel=this.getComponentModel();this.getView().setModel(this.MainModel);this.oRouter=this.getRouter()},_onObjectMatched:function(e){this.RequestId=e.getParameter("arguments").RequestId;this._bindView("/PackingListSet"+this.RequestId);this.getView().getModel("oViewHandlingModel").setProperty("/type")},_bindView:function(e){var t=this;var i=this.getViewModel("objectViewModel");this.getView().bindElement({path:e,events:{dataRequested:function(){i.setProperty("/busy",true)},dataReceived:function(){i.setProperty("/busy",false)}}})},onClose:function(e){this.oRouter.navTo("RouteLandingPage")},onViewQRCodePress:function(e){var t=e.getSource()._getBindingContext().getPath();var i=e.getSource()._getBindingContext().getProperty();var o={};o.controller=this;o.view=this.getView();o.sParentItemPath=t;o.title="QR Code";if(i.Name)o.title=i.Name;else if(i.PackagingType)o.title=i.PackagingType;if(!this.qrDialog){this.qrDialog=s.load({id:o.view.getId(),name:"com.agel.mmts.storeinchargetotaldetails.view.fragments.QRCodeViewer",controller:o.controller}).then(function(e){o.view.addDependent(e);e.bindElement({path:o.sParentItemPath});if(a.system.desktop){e.addStyleClass("sapUiSizeCompact")}e.setTitle(o.title);return e})}this.qrDialog.then(function(e){o.view.addDependent(e);e.bindElement({path:o.sParentItemPath});e.setTitle(o.title);e.open()})},onQRCodeViewerDialogClosePress:function(e){this.qrDialog.then(function(e){e.close()})}})});