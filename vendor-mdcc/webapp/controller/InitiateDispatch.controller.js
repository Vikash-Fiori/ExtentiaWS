sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    'sap/m/MessageToast',
    "sap/m/MessageBox",
    "sap/m/ObjectIdentifier",
    "sap/m/Text",
    "sap/m/Button",
    '../utils/formatter',
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, MessageToast, MessageBox, ObjectIdentifier, Text, Button,formatter) {
    "use strict";

    return BaseController.extend("com.agel.mmts.vendormdcc.controller.InitiateDispatch", {
        formatter: formatter,
        onInit: function () {   

            this.MainModel = this.getOwnerComponent().getModel();
            this.getView().setModel(this.MainModel);
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                boqSelection: null
            });
            this.setModel(oViewModel, "objectViewModel");

         //   this._createBOQApprovalModel();

            // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
            this._mViewSettingsDialogs = {};

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteInitiateDispatchPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var that = this;
            var startupParams = this.getOwnerComponent().getComponentData().startupParameters;
            //   var startupParams={MDCCId:163,manage:"false"};

        
            this.sObjectId=parseInt(startupParams.MDCCId[0]);
            this._bindView("/MDCCSet("+this.sObjectId+")");   

              this._getParentDataViewMDCC();
           //   this._getPackingListData();
        },

        _bindView: function (sObjectPath) {
            var objectViewModel = this.getViewModel("objectViewModel");
            var that = this;

            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    dataRequested: function () {
                        objectViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        objectViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        onPressInitiateDispatch : function(oEvent){
            var that = this;
            this.oRouter.navTo("RoutePackingListProceedPage", {
                MDCCId:this.sObjectId
            },false);

        },

         //---------------------- View Data Fragment operation -----------------------//
        // Fragment/Dialog Open
        onViewPress: function (oEvent) {
              //  var oItem = oEvent.getSource();
              var that = this;
             // this._getParentDataViewMDCC();
              //that.sPath = oEvent.getSource().getParent().getBindingContextPath();
               // that.handleViewDialogOpen();
        },

        // Arrange Data For View / Model Set
        _arrangeDataView : function(){        
                var that = this;
                var oModel = new JSONModel({"ChildItemsView":this.ParentDataView});
                this.getView().setModel(oModel,"TreeTableModelView");
                this.getView().getModel("TreeTableModelView").refresh();
              //  this.doExpandAllRow();
               // var sPath = oEvent.getSource().getParent().getBindingContextPath();
              // sPath=  ;
             //   that.handleViewDialogOpen();
                //debugger;
        },

        doExpandAllRow : function() {
            var oTTbl = this.getView().byId("TreeTableBasicViewDispatch");
            for (var i=0; i<oTTbl.getRows().length; i++) {
                oTTbl.expand(i);
            }
        },   

        _getPackingListData : function(){
                this.ParentDataView = [];
                var sPath = "/MDCCSet("+this.sObjectId+")/MDCCParentLineItems";
                that.getComponentModel("app").setProperty("/busy", true);
                this.MainModel.read(sPath,{
                    success:function(oData,oResponse){
                        that.getComponentModel("app").setProperty("/busy", false);
                        if(oData.results.length){
                            this._getChildItemsViewMDCC(oData.results);
                        }
                    }.bind(this),
                    error:function(oError){
                        that.getComponentModel("app").setProperty("/busy", false);
                        sap.m.MessageBox.Error(JSON.stringify(oError));
                    }
                });
        },

            // Parent Data View Fetch / Model Set
        _getParentDataViewMDCC : function(){
                var that = this;
                this.ParentDataView = [];
                var sPath = "/MDCCSet("+this.sObjectId+")/MDCCParentLineItems";
                that.getComponentModel("app").setProperty("/busy", true);
                this.MainModel.read(sPath,{
                    success:function(oData,oResponse){
                        that.getComponentModel("app").setProperty("/busy", false);
                        if(oData.results.length){
                            this._getChildItemsViewMDCC(oData.results);
                        }
                    }.bind(this),
                    error:function(oError){
                        that.getComponentModel("app").setProperty("/busy", false);
                        sap.m.MessageBox.Error(JSON.stringify(oError));
                    }
                });
        },

        // Child Item View Fetch / Model Set
        _getChildItemsViewMDCC : function(ParentDataView){
                this.ParentDataView = ParentDataView;
                for( var i=0; i < ParentDataView.length; i++){
                
                    var sPath = "/MDCCSet("+this.sObjectId+")/MDCCParentLineItems("+ ParentDataView[i].ID +")/MDCCBOQItems";
                    this.MainModel.read(sPath,{
                        success:function(i,oData,oResponse){
                                                        
                            if(oData.results.length){
                                this.ParentDataView[i].isStandAlone=true;
                                this.ParentDataView[i].ChildItemsView=oData.results;
                            }
                            else{
                                this.ParentDataView[i].isStandAlone=false;
                                this.ParentDataView[i].ChildItemsView=[];
                            }
                            if(i==this.ParentDataView.length-1)
                                this._arrangeDataView();
                        }.bind(this,i),
                        error:function(oError){
                            sap.m.MessageBox.Error(JSON.stringify(oError));
                        }
                    });
                }
        },

        getViewSettingsDialog: function (sDialogFragmentName) {
            var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

            if (!pDialog) {
                pDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: sDialogFragmentName,
                    controller: this
                }).then(function (oDialog) {
                    if (Device.system.desktop) {
                        oDialog.addStyleClass("sapUiSizeCompact");
                    }
                    return oDialog;
                });
                this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
            }
            return pDialog;
        },

         onBeforeRebindPackingListTable: function (oEvent) {
            var MDCC_Id ;
            var mBindingParams = oEvent.getParameter("bindingParams");
            if (this.sObjectId){
               MDCC_Id  = this.sObjectId ;
               mBindingParams.filters.push(new sap.ui.model.Filter("MDCC_Id", sap.ui.model.FilterOperator.EQ, MDCC_Id ));
            }
        },
        
        onRowsUpdated :function(oEvent){
           //   debugger;
           //   var oTreeTable = this.getView().byId("TreeTableBasicViewDispatch");
           //   this.getView().getContent()[1].expandToLevel(3); 
        },

        onAfterRendering: function(){
            //   var oTreeTable = this.getView().byId("TreeTableBasicViewDispatch");
            //   oTreeTable.expandToLevel(3); //number of the levels of the tree table.
        }

    });
});