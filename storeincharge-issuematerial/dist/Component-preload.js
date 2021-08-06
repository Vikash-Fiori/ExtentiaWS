//@ui5-bundle com/agel/mmts/storeinchargeissuematerial/Component-preload.js
jQuery.sap.registerPreloadedModules({
"version":"2.0",
"modules":{
	"com/agel/mmts/storeinchargeissuematerial/Component.js":function(){sap.ui.define(["sap/ui/core/UIComponent","sap/ui/Device","com/agel/mmts/storeinchargeissuematerial/model/models","com/agel/mmts/storeinchargeissuematerial/controller/ErrorHandler"],function(t,e,s,i){"use strict";return t.extend("com.agel.mmts.storeinchargeissuematerial.Component",{metadata:{manifest:"json"},init:function(){t.prototype.init.apply(this,arguments);this._oErrorHandler=new i(this);this.getRouter().initialize();this.setModel(s.createDeviceModel(),"device")},destroy:function(){this._oErrorHandler.destroy();t.prototype.destroy.apply(this,arguments)},getContentDensityClass:function(){if(this._sContentDensityClass===undefined){if(document.body.classList.contains("sapUiSizeCozy")||document.body.classList.contains("sapUiSizeCompact")){this._sContentDensityClass=""}else if(!e.support.touch){this._sContentDensityClass="sapUiSizeCompact"}else{this._sContentDensityClass="sapUiSizeCozy"}}return this._sContentDensityClass}})});
},
	"com/agel/mmts/storeinchargeissuematerial/controller/App.controller.js":function(){sap.ui.define(["com/agel/mmts/storeinchargeissuematerial/controller/BaseController","sap/ui/model/json/JSONModel"],function(e,t){"use strict";return e.extend("com.agel.mmts.storeinchargeissuematerial.controller.App",{onInit:function(){this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass())}})});
},
	"com/agel/mmts/storeinchargeissuematerial/controller/BaseController.js":function(){sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/BusyIndicator"],function(e,t){"use strict";return e.extend("com.agel.mmts.storeinchargeissuematerial.controller.BaseController",{getRouter:function(){return sap.ui.core.UIComponent.getRouterFor(this)},addContentDensityClass:function(){return this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass())},getViewModel:function(e){return this.getView().getModel(e)},getComponentModel:function(){return this.getOwnerComponent().getModel()},setModel:function(e,t){return this.getView().setModel(e,t)},getResourceBundle:function(){return this.getOwnerComponent().getModel("i18n").getResourceBundle()},presentBusyDialog:function(){t.show()},dismissBusyDialog:function(){t.hide()},initializeFilterBar:function(){this._addSearchFieldAssociationToFB();this.oFilterBar=null;this.oFilterBar=this.byId("filterbar");this.oFilterBar.registerFetchData(this.fFetchData);this.oFilterBar.registerApplyData(this.fApplyData);this.oFilterBar.registerGetFiltersWithValues(this.fGetFiltersWithValues);this.oFilterBar.fireInitialise()},_addSearchFieldAssociationToFB:function(){let e=this.getView().byId("filterbar");let t=e.getBasicSearch();var i;if(!t){i=new sap.m.SearchField({id:"idSearch",showSearchButton:false,placeholder:"Search"});i.attachLiveChange(this.onFilterChange,this)}else{t=null}e.setBasicSearch(i);i.attachBrowserEvent("keyup",function(e){if(e.which===13){this.onSearch()}}.bind(this))},fFetchData:function(){var e;var t=[];var i;var r=this.getAllFilterItems(true);for(var n=0;n<r.length;n++){e={};i=null;if(r[n].getGroupName){i=r[n].getGroupName();e.groupName=i}e.name=r[n].getName();var a=this.determineControlByFilterItem(r[n]);if(a){e.value=a.getValue();t.push(e)}}return t},fApplyData:function(e){var t;for(var i=0;i<e.length;i++){t=null;if(e[i].groupName){t=e[i].groupName}var r=this.determineControlByName(e[i].name,t);if(r){r.setValue(e[i].value)}}},fGetFiltersWithValues:function(){var e;var t;var i=this.getFilterGroupItems();var r=[];for(e=0;e<i.length;e++){t=this.determineControlByFilterItem(i[e]);if(t&&t.getValue&&t.getValue()){r.push(i[e])}}return r},addHistoryEntry:function(){var e=[];return function(t,i){if(i){e=[]}var r=e.some(function(e){return e.intent===t.intent});if(!r){e.push(t);this.getOwnerComponent().getService("ShellUIService").then(function(t){t.setHierarchy(e)})}}}()})});
},
	"com/agel/mmts/storeinchargeissuematerial/controller/ErrorHandler.js":function(){sap.ui.define(["sap/ui/base/Object","sap/m/MessageBox"],function(e,s){"use strict";return e.extend("com.agel.mmts.storeinchargeissuematerial.controller.ErrorHandler",{constructor:function(e){this._oResourceBundle=e.getModel("i18n").getResourceBundle();this._oComponent=e;this._oModel=e.getModel();this._bMessageOpen=false;this._sErrorText=this._oResourceBundle.getText("errorText");this._oModel.attachMetadataFailed(function(e){var s=e.getParameters();this._showServiceError(s.response)},this);this._oModel.attachRequestFailed(function(e){var s=e.getParameters();if(s.response.statusCode!=="404"||s.response.statusCode===404&&s.response.responseText.indexOf("Cannot POST")===0){this._showServiceError(s.response)}},this)},_showServiceError:function(e){if(this._bMessageOpen){return}this._bMessageOpen=true;s.error(this._sErrorText,{id:"serviceErrorMessageBox",details:e,styleClass:this._oComponent.getContentDensityClass(),actions:[s.Action.CLOSE],onClose:function(){this._bMessageOpen=false}.bind(this)})}})});
},
	"com/agel/mmts/storeinchargeissuematerial/controller/LandingPage.controller.js":function(){sap.ui.define(["sap/ui/core/mvc/Controller"],function(e){"use strict";return e.extend("com.agel.mmts.storeinchargeissuematerial.controller.LandingPage",{onInit:function(){}})});
},
	"com/agel/mmts/storeinchargeissuematerial/controller/NotFound.controller.js":function(){sap.ui.define(["./BaseController"],function(e){"use strict";return e.extend("com.agel.mmts.storeinchargeissuematerial.controller.NotFound",{})});
},
	"com/agel/mmts/storeinchargeissuematerial/i18n/i18n.properties":'title=Issue Material\nappTitle=Issue Material\nappDescription=Issue Material Application for Store In Charge \n\nPageTitle= Issue Material\nerrorText= Error\nmultipleErrorsText= Multiple Errors\n\n\nsONumber= SO Number\ncontractorName= Contractor Name\nissuedDate=Issued Date\n',
	"com/agel/mmts/storeinchargeissuematerial/i18n/i18n_en.properties":'title=Issue Material\r\nappTitle=Issue Material\r\nappDescription=Issue Material Application for Store In Charge ',
	"com/agel/mmts/storeinchargeissuematerial/i18n/i18n_en_GB.properties":'title=Issue Material\r\nappTitle=Issue Material\r\nappDescription=Issue Material Application for Store In Charge ',
	"com/agel/mmts/storeinchargeissuematerial/i18n/i18n_en_US.properties":'title=Issue Material\nappTitle=Issue Material\nappDescription=Issue Material Application for Store In Charge ',
	"com/agel/mmts/storeinchargeissuematerial/manifest.json":'{"_version":"1.32.0","sap.app":{"id":"com.agel.mmts.storeinchargeissuematerial","type":"application","i18n":"i18n/i18n.properties","applicationVersion":{"version":"1.0.0"},"title":"{{appTitle}}","description":"{{appDescription}}","resources":"resources.json","ach":"ach","dataSources":{"default":{"uri":"/AGEL_MMTS_API/api/v2/odata.svc/","type":"OData","settings":{"odataVersion":"2.0","localUri":"localService/metadata.xml"}}},"crossNavigation":{"inbounds":{"com-agel-mmts-storeinchargeissuematerial-inbound":{"signature":{"parameters":{},"additionalParameters":"allowed"},"semanticObject":"storeinchargeissuematerial","action":"manage","title":"Issue Material","subTitle":"","icon":""}}}},"sap.ui":{"technology":"UI5","icons":{"icon":"sap-icon://task","favIcon":"","phone":"","phone@2":"","tablet":"","tablet@2":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":true}},"sap.ui5":{"flexEnabled":false,"rootView":{"viewName":"com.agel.mmts.storeinchargeissuematerial.view.App","type":"XML","async":true,"id":"app"},"dependencies":{"minUI5Version":"1.66.0","libs":{"sap.ui.core":{},"sap.m":{},"sap.ui.layout":{}}},"contentDensities":{"compact":true,"cozy":true},"models":{"i18n":{"type":"sap.ui.model.resource.ResourceModel","settings":{"bundleName":"com.agel.mmts.storeinchargeissuematerial.i18n.i18n"}},"":{"type":"sap.ui.model.odata.v2.ODataModel","settings":{"defaultOperationMode":"Server","defaultBindingMode":"TwoWay","defaultCountMode":"Inline","refreshAfterChange":true,"useBatch":false},"dataSource":"default","preload":true}},"resources":{"css":[{"uri":"css/style.css"}]},"routing":{"config":{"routerClass":"sap.m.routing.Router","viewType":"XML","async":true,"viewPath":"com.agel.mmts.storeinchargeissuematerial.view","controlAggregation":"pages","controlId":"app","clearControlAggregation":false,"bypassed":{"target":["notFound"]}},"routes":[{"name":"RouteLandingPage","pattern":"","target":["TargetLandingPage"]},{"name":"RouteIssueMatDetail","pattern":"IssueMatDetail/{MatNo}","target":["TargetIssueMatDetail"]}],"targets":{"TargetLandingPage":{"viewType":"XML","transition":"slide","clearControlAggregation":false,"viewId":"LandingPage","viewName":"LandingPage"},"TargetIssueMatDetail":{"viewType":"XML","transition":"slide","clearControlAggregation":false,"viewName":"IssueMatDetail"},"notFound":{"viewName":"NotFound"}}}}}',
	"com/agel/mmts/storeinchargeissuematerial/model/models.js":function(){sap.ui.define(["sap/ui/model/json/JSONModel","sap/ui/Device"],function(e,n){"use strict";return{createDeviceModel:function(){var i=new e(n);i.setDefaultBindingMode("OneWay");return i}}});
},
	"com/agel/mmts/storeinchargeissuematerial/view/App.view.xml":'<mvc:View\n\txmlns:mvc="sap.ui.core.mvc"\n\tcontrollerName="com.agel.mmts.storeinchargeissuematerial.controller.App"\n\tdisplayBlock="true"\n\txmlns="sap.m"\n    xmlns:f="sap.f"><App id="app"/></mvc:View>',
	"com/agel/mmts/storeinchargeissuematerial/view/LandingPage.view.xml":'<mvc:View\n    controllerName="com.agel.mmts.storeinchargeissuematerial.controller.LandingPage"\n    xmlns:mvc="sap.ui.core.mvc"\n    xmlns:core="sap.ui.core"\n    displayBlock="true"\n    xmlns="sap.m"\n    xmlns:f="sap.f"><f:DynamicPage headerExpanded="true" busy="{objectViewModel>/busy}"><f:title><f:DynamicPageTitle><f:heading><Title id="pageTitle" text="{i18n>PageTitle}"/></f:heading></f:DynamicPageTitle></f:title><f:header></f:header><f:content><core:Fragment fragmentName="com.agel.mmts.storeinchargeissuematerial.view.fragments.ListTable" type="XML"/></f:content></f:DynamicPage></mvc:View>\n',
	"com/agel/mmts/storeinchargeissuematerial/view/NotFound.view.xml":'<mvc:View controllerName="com.agel.mmts.storeinchargeissuematerial.controller.NotFound"\n    xmlns:mvc="sap.ui.core.mvc"\n    xmlns="sap.m"\n    xmlns:core="sap.ui.core"\n    xmlns:f="sap.f"\n    xmlns:form="sap.ui.layout.form" height="100%"><Page showHeader="false"><VBox height="100%" justifyContent="Center"><f:IllustratedMessage illustrationSize="Auto" description="The requested resource was not found." title="Oops! Page Not Found"><f:additionalContent></f:additionalContent></f:IllustratedMessage></VBox></Page></mvc:View>',
	"com/agel/mmts/storeinchargeissuematerial/view/fragments/ListTable.fragment.xml":'<core:FragmentDefinition xmlns="sap.m"\n    xmlns:smartTable="sap.ui.comp.smarttable"\n    xmlns:core="sap.ui.core"><smartTable:SmartTable class="sapUiResponsiveContentPadding" id="idListTable" editable="false" placeToolbarInTable="true" enableAutoBinding="true" entitySet="IssuedMaterialSet" \n    showFullScreenButton="true" header="Issue Material" showRowCount="true" tableType="ResponsiveTable" demandPopin="false" useExportToExcel="false" useTablePersonalisation="true" useVariantManagement="false" \n    beforeRebindTable="onbeforeRebindListPoTable" ignoreFromPersonalisation="ApprovedBy, ApprovedOn, Description, Reason, RequestedBy, UpdatedAt, UpdatedBy, CreatedAt, CreatedBy, ID, IsArchived"><Table sticky="ColumnHeaders,HeaderToolbar" updateFinished="onListTableUpdateFinished" alternateRowColors="true"><columns><Column ><customData><core:CustomData key="p13nData" value=\'\\{"columnKey": "SONumber", "leadingProperty": "SONumber",\n                                                 "columnIndex": 0 ,"sortProperty": "SONumber","filterProperty": "SONumber"}\'/></customData><Text text="{i18n>sONumber}"/></Column><Column demandPopin="true" minScreenWidth="Desktop"><customData><core:CustomData key="p13nData" value=\'\\{"columnKey": "ContractorName", "leadingProperty": "ContractorName",\n                                                 "columnIndex": 1 ,"sortProperty": "ContractorName","filterProperty": "ContractorName"}\'/></customData><Text text="{i18n>contractorName}"/></Column><Column demandPopin="true" minScreenWidth="Tablet"><customData><core:CustomData key="p13nData" value=\'\\{"columnKey": "IssuedDate", "leadingProperty": "IssuedDate",\n                                                 "columnIndex": 2 ,"sortProperty": "IssuedDate"}\'/></customData><Text text="{i18n>issuedDate}"/></Column></columns><items><ColumnListItem type="Navigation" press="onDetailPress"><cells><ObjectIdentifier title="{SONumber}"/><Text text="{ContractorName}"/><Text text="{path:\'IssuedDate\',\n                                     type: \'sap.ui.model.type.Date\',\n\t\t\t\t                     formatOptions: {\n\t\t\t\t                        pattern: \'MMMM dd, yyyy\'\n\t\t\t\t                     }\n                        }"/></cells></ColumnListItem></items></Table></smartTable:SmartTable></core:FragmentDefinition>'
}});
