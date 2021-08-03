sap.ui.define(["./BaseController","sap/ui/model/json/JSONModel","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/core/Fragment","sap/ui/model/Sorter","sap/ui/Device","sap/ui/core/ValueState"],function(e,t,i,a,r,n,o,s){"use strict";return e.extend("com.agel.mmts.storestock.controller.storeStockChildDetail",{onInit:function(){this.oRouter=this.getRouter();this.oRouter.getRoute("storeStockChildDetail").attachPatternMatched(this._onObjectMatched,this)},_onObjectMatched:function(e){var t=e.getParameter("arguments").layout;this.getView().getModel("layoutModel").setProperty("/layout",t)},onSearch:function(e){var t=this.byId("idNameInput").getValue();var r=this.byId("dateRangeSelectionId");var n=this.byId("dateRangeSelectionId").getValue();var o=this.byId("idPlantCode").getValue();var s=this.byId("idMaterialCode").getValue();var l=this.byId("idCompanyCode").getValue();var u=[];var d=[];var h=this.byId("filterbar").getBasicSearchValue();if(h){u.push(new i("PONumber",a.Contains,h));u.push(new i("Buyer/CompanyCode",a.EQ,h));u.push(new i("ParentLineItems/MaterialCode",a.EQ,h));u.push(new i("PlantCode",a.EQ,h));u.push(new i("ParentLineItems/Name",a.Contains,h));d.push(new i(u,false))}if(t!=""){d.push(new i("PONumber",a.EQ,t))}if(n!=""){var g=new Date(r.getFrom());var c=new Date(r.getTo());d.push(new i("POReleaseDate",a.BT,g.toISOString(),c.toISOString()))}if(l!=""){d.push(new i("Buyer/CompanyCode",a.EQ,l))}if(s!=""){d.push(new i("ParentLineItems/MaterialCode",a.EQ,s))}if(o!=""){d.push(new i("PlantCode",a.EQ,o))}var p=this.getView().byId("idPurchaseOrdersTable").getTable().getBinding("items");var f=this.getView().byId("idConfirmPOTable").getTable().getBinding("items");var w=this.getView().byId("idDispatchedPOTable").getTable().getBinding("items");if(d.length==0){d.push(new i("PONumber",a.NE,""));p.filter(new i(d,true));f.filter(new i(d,true));w.filter(new i(d,true))}if(d.length>0){p.filter(new i(d,true));f.filter(new i(d,true));w.filter(new i(d,true))}},loadStoreStockChildTabData:function(e,t){var i=this;e=e+"/UOMs";var a=this.getView().getModel();a.read(e,{success:function(e,i){if(e.results.length)this.getView().getModel("ManageBOQModel").setProperty(t+"/UOMSuggestions",e.results);else this.getView().getModel("ManageBOQModel").setProperty(t+"/UOMSuggestions",null)}.bind(this),error:function(e){sap.m.MessageBox.error("Error fetching UOMs")}})},onPurchaseOrderPress:function(e){this._showObject(e.getSource())},_showObject:function(e){var t=this;this.oRouter.navTo("RouteApp",{parentMaterial:1,layout:"OneColumn"},false);this.getView().getModel("layoutModel").setProperty("/layout","OneColumn")}})});