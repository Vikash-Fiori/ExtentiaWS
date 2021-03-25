sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device"
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device) {
    "use strict";

    return BaseController.extend("com.agel.mmts.vendorPersona.controller.DetailPage", {

        onInit: function () {
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: true,
                delay: 0
            });
            this.setModel(oViewModel, "objectViewModel");

            // keeps the search state
            this._aTableSearchState = [];
            // Keeps reference to any of the created dialogs
            this._mViewSettingsDialogs = {};

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteDetailPage").attachPatternMatched(this._onObjectMatched, this);

            this._initializeCreationModel();

            //adding searchfield association to filterbar                                    
            this._addSearchFieldAssociationToFB();
        },

        _addSearchFieldAssociationToFB: function () {
            let oFilterBar = this.getView().byId("filterbar");
            let oSearchField = oFilterBar.getBasicSearch();
            var oBasicSearch;
            if (!oSearchField) {
                // @ts-ignore   
                oBasicSearch = new sap.m.SearchField({ id: "idSearch", showSearchButton: false });
            } else {
                oSearchField = null;
            }
            oFilterBar.setBasicSearch(oBasicSearch);
            oBasicSearch.attachBrowserEvent("keyup", function (e) {
                if (e.which === 13) {
                    this.onSearch();
                }
            }.bind(this));
        },

        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").vendorId;
            this._bindView("/Vendors" + sObjectId);
        },

        _initializeCreationModel: function () {
            var oCreationModel = new JSONModel({
                "invoice_number": "",
                "po_number": "",
                "po_release_date": ""
            });
            this.getView().setModel(oCreationModel, "creationModel")
        },

        _bindView: function (sObjectPath) {
            debugger;
            var objectViewModel = this.getViewModel("objectViewModel");
            var userInfo = sap.ushell.Container.getService("UserInfo");
            var userEmail = userInfo.getEmail();

            userEmail = userEmail || 'symantic.engineering@testemail.com'
            // Open PO table
            this.getView().byId("idPurchaseOrdersTable").bindItems({
                path: "/PurchaseOrders",
                template: this.byId("idPurchaseOrdersTable").removeItem(0),
                parameters: {
                    "$expand": {
                        "vendor": {
                            "$filter": "email eq 'symantic.engineering@testemail.com'"
                        }                    
                    } ,
                    "$filter" : "status eq 'PENDING'"                   
                },
                events: {
                    dataRequested: function () {
                        objectViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        objectViewModel.setProperty("/busy", false);
                    }
                }
            });

            // Confirm PO Table
            this.getView().byId("idConfirmPOTable").bindItems({
                path: "/PurchaseOrders",
                template: this.byId("idConfirmPOTable").removeItem(0),
                parameters: {
                    "$expand": {
                        "vendor": {
                            "$filter": "email eq 'symantic.engineering@testemail.com'"
                        }                    
                    } ,
                    "$filter" : "status eq 'CONFIRMED'"                   
                },
                events: {
                    dataRequested: function () {
                        objectViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        objectViewModel.setProperty("/busy", false);
                    }
                }
            });

            // Dispatched PO Table
            this.getView().byId("idDispatchedPOTable").bindItems({
                path: "/PurchaseOrders",
                template: this.byId("idDispatchedPOTable").removeItem(0),
                parameters: {
                    "$expand": {
                        "vendor": {
                            "$filter": "email eq 'symantic.engineering@testemail.com'"
                        }                    
                    } ,
                    "$filter" : "status eq 'DISPATCHED'"                   
                },
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

        onPurchaseOrderTableUpdateFinished: function (oEvent) {
            //Setting the header context for a property binding to $count
            var oView = this.getView(),
                oTableBinding = oView.byId("idPurchaseOrdersTable").getBinding("items");

            if (oTableBinding.getHeaderContext())
                oView.byId("tableHeader").setBindingContext(oTableBinding.getHeaderContext());
        },

        _getViewSettingsDialog: function (sDialogFragmentName) {
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

        handleSortButtonPressed: function () {
            this._getViewSettingsDialog("com.agel.mmts.vendorPersona.view.fragments.detailPage.SortDialog")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },

        handleFilterButtonPressed: function (oEvent) {
            this._getViewSettingsDialog("com.agel.mmts.vendorPersona.view.fragments.detailPage.FilterDialog")
                .then(
                    function (oViewSettingsDialog) {
                        oViewSettingsDialog.setModel(this.getComponentModel());
                        oViewSettingsDialog.open();
                    }.bind(this)
                );
        },

        handleSortDialogConfirm: function (oEvent) {
            var oTable = this.byId("idPurchaseOrdersTable"),
                mParams = oEvent.getParameters(),
                oBinding = oTable.getBinding("items"),
                sPath,
                bDescending,
                aSorters = [];

            sPath = mParams.sortItem.getKey();
            bDescending = mParams.sortDescending;
            aSorters.push(new Sorter(sPath, bDescending));

            // apply the selected sort and group settings
            oBinding.sort(aSorters);
        },

        handleFilterDialogConfirm: function (oEvent) {
            var oTable = this.byId("idPurchaseOrdersTable"),
                mParams = oEvent.getParameters(),
                oBinding = oTable.getBinding("items"),
                aFilters = [];

            var sPath = Object.keys(mParams.filterCompoundKeys)[0],
                sOperator = "EQ",
                sValue1 = mParams.filterKeys.CONFIRMED ? 'CONFIRMED' : 'PENDING',
                oFilter = new Filter(sPath, sOperator, sValue1);

            aFilters.push(oFilter);

            // apply filter settings
            oBinding.filter(aFilters);

            // update filter bar
            this.byId("vsdFilterBar").setVisible(aFilters.length > 0);
            this.byId("vsdFilterLabel").setText(mParams.filterString);
        },

        //triggers on press of a vendor item from the list
        onPurchaseOrderPress: function (oEvent) {
            // The source is the list item that got pressed
            this._showObject(oEvent.getSource());
        },

        _showObject: function (oItem) {
            var that = this;
            oItem.getBindingContext().requestCanonicalPath().then(function (sObjectPath) {
                that.getRouter().navTo("RoutePODetailPage", {
                    POId: sObjectPath.slice("/PurchaseOrders".length) // /PurchaseOrders(123)->(123)
                });
            });
        },

        //when the breadcrum pressed
        handleToAllVendorsBreadcrumPress: function (oEvent) {
            this.getRouter().navTo("RouteLandingPage");
        },

        // on Go Search 
        onSearch: function (oEvent) {
            var poNumber = this.byId("idNameInput").getValue();
            var releaseDate = this.byId("DP1").getValue();
            var aFilters = [];
            if (poNumber != "") {
                aFilters.push(new Filter("po_number", FilterOperator.EQ, poNumber));
            }

            if (releaseDate != "") {
                var arr = releaseDate.split('.')
                releaseDate = arr[2] + '-' + arr[1] + '-' + arr[0] + 'T00:00:00Z'
                aFilters.push(new Filter("po_release_date", FilterOperator.EQ, releaseDate));
            }


            var mFilters = new Filter({
                filters: aFilters,
                and: true
            });

            var oTableBinding = this.getView().byId("idPurchaseOrdersTable").getBinding("items");
            oTableBinding.filter(mFilters);
        },

        // on Date Change
        onDateChange: function (oEvent) {
            var oDP = oEvent.getSource(),
                sValue = oEvent.getParameter("value"),
                bValid = oEvent.getParameter("valid");

            if (bValid) {
                oDP.setValueState(sap.ui.core.ValueState.None);
            } else {
                oDP.setValueState(sap.ui.core.ValueState.Error);
            }
        },


    });
});
