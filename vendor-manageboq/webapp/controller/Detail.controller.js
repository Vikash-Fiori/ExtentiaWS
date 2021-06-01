sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    "sap/ui/core/routing/History",
    'sap/m/MessageToast',
    "sap/m/MessageBox",
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("com.agel.mmts.vendormanageboq.controller.Detail", {

        onInit: function () {
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                noParentChildRelationFlag: false,
                isCreatingPCList: false,
                isPCListSelected: false,
                sViewBOQButtonName: "View BOQ List"
            });
            this.setModel(oViewModel, "objectViewModel");

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);

            var oManageBOQModel = new JSONModel({
                boqItems: [{
                    Name: "",
                    MaterialCode: "",
                    Description: "",
                    Qty: "",
                    Remarks: "",
                    UOM: "",
                    MasterBOQItemId: "",
                    UOMSuggestions: null

                }]
            });
            this.setModel(oManageBOQModel, "ManageBOQModel");

            this.mainModel = this.getComponentModel();
        },

        _onObjectMatched: function (oEvent) {
            this.sParentID = oEvent.getParameter("arguments").parentMaterial;
            var sLayout = oEvent.getParameter("arguments").layout;
            if (sLayout == 'TwoColumnsMidExpanded') {
                this.byId("idViewBOQListButton").setPressed(false);
                this.getViewModel("objectViewModel").setProperty("/sViewBOQButtonName", "View BOQ List");
            }
            this.getView().getModel().setProperty("/busy", false);

            this.getView().getModel("layoutModel").setProperty("/layout", sLayout);
            this._bindView("/ParentLineItemSet" + this.sParentID);
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

        onUOMSelected: function (oEvent) {
            var sItemPath = oEvent.getSource().getBindingContext("ManageBOQModel").getPath();
            var sText = oEvent.getParameter("selectedItem").getText();
            this.getView().getModel("ManageBOQModel").setProperty(sItemPath + "/UOM", sText);
        },

        onBOQItemSelected: function (oEvent) {
            //this.getViewModel("UOMSuggestionModel").setData(null);
            var userObj = oEvent.getParameter("selectedItem").getBindingContext().getObject(),
                oBindingContext = oEvent.getParameter("selectedItem").getBindingContext(),
                oBindingContextPath = oEvent.getSource().getSelectedItem().getBindingContext().getPath(),
                aRowCells = oEvent.getSource().getParent().getCells(),
                sItemPath = oEvent.getSource().getBindingContext("ManageBOQModel").getPath();

            for (var i = 1; i < aRowCells.length; i++) {
                if (aRowCells[i] instanceof sap.m.Text) {
                    var cellContextPath = aRowCells[i].data("p");
                    var val = userObj[cellContextPath];
                    aRowCells[i].setText(val);
                }
            }
            this._prepareSuggestionItemsForUOM(oBindingContextPath, sItemPath);
        },

        _prepareSuggestionItemsForUOM: function (oBindingContextPath, sItemPath) {
            var that = this;
            oBindingContextPath = oBindingContextPath + "/UOMs"
            var oModel = this.getView().getModel();
            oModel.read(oBindingContextPath, {
                success: function (oData, oResponse) {
                    if (oData.results.length)
                        this.getView().getModel("ManageBOQModel").setProperty(sItemPath + "/UOMSuggestions", oData.results);
                    else
                        this.getView().getModel("ManageBOQModel").setProperty(sItemPath + "/UOMSuggestions", null);
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error("Error fetching UOMs");
                }
            });
        },

        onAddItemPress: function (oEvent) {
            var oModel = this.getViewModel("ManageBOQModel");
            var oItems = oModel.getProperty("/boqItems").map(function (oItem) {
                return Object.assign({}, oItem);
            });

            oItems.push({
                Name: "",
                MaterialCode: "",
                Description: "",
                Qty: "",
                Remarks: "",
                UOM: "",
                MasterBOQItemId: "",
                UOMSuggestions: null
            });

            oModel.setProperty("/boqItems", oItems);
        },

        openAddRemarksPopupPress: function (oEvent) {
            var sItemPath = oEvent.getSource().getBindingContext("ManageBOQModel").getPath();
            var oDetails = {};
            oDetails.controller = this;
            oDetails.view = this.getView();
            oDetails.sItemPath = sItemPath;
            if (!this.addRemarksDialog) {
                this.addRemarksDialog = Fragment.load({
                    id: oDetails.view.getId(),
                    name: "com.agel.mmts.vendormanageboq.view.fragments.manageBOQ.AddRemarks",
                    controller: oDetails.controller
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sItemPath
                    });
                    oDialog.setModel(oDetails.view.getModel("ManageBOQModel"));
                    return oDialog;
                });
            }
            this.addRemarksDialog.then(function (oDialog) {
                oDetails.view.addDependent(oDialog);
                oDialog.bindElement({
                    path: oDetails.sItemPath
                });
                oDialog.setModel(oDetails.view.getModel("ManageBOQModel"));
                oDialog.open();
            });
        },

        onAddRemarksPress: function (oEvent) {
            var sItemPath = oEvent.getSource().getParent().getBindingContext().getPath();
            var sPropertyName = sItemPath + "/Remarks";
            var sRemarksAdded = this.byId("idRemarksTextArea").getValue();
            var oModel = oEvent.getSource().getModel();
            oModel.setProperty(sPropertyName, sRemarksAdded);
            this.onCloseRemarkPopupPress();
        },

        onCloseRemarkPopupPress: function (oEvent) {
            var that = this;
            this.addRemarksDialog.then(function (oDialog) {
                //that.byId("idRemarksTextArea").setValue(null);
                oDialog.close();
            });
        },

        onDeleteBOQItemPress: function (oEvent) {
            var iRowNumberToDelete = parseInt(oEvent.getSource().getBindingContext("ManageBOQModel").getPath().slice("/boqItems/".length));
            var sChildName = oEvent.getSource().getBindingContext("ManageBOQModel").getObject().Name;

            if (sChildName.length)
                var sMessage = "Are you sure you want to delete this entry with child name - " + sChildName + " ?";
            else
                var sMessage = "Are you sure you want to delete this entry?";

            this._handleMessageBoxOpen(sMessage, "warning", iRowNumberToDelete);
        },

        _handleMessageBoxOpen: function (sMessage, sMessageBoxType, iRowNumberToDelete) {
            MessageBox[sMessageBoxType](sMessage, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (iRowNumberToDelete, oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        this._deleteBOQRow(iRowNumberToDelete);
                    }
                }.bind(this, iRowNumberToDelete)
            });
        },

        _deleteBOQRow: function (iRowNumberToDelete) {
            var aTableData = this.getViewModel("ManageBOQModel").getProperty("/boqItems");
            aTableData.splice(iRowNumberToDelete, 1);
            this.getView().getModel("ManageBOQModel").refresh();
        },

        onSaveManagedBOQItemsPress: function (oEvent) {
            var oPayload = {};
            var aTableData = this.getViewModel("ManageBOQModel").getProperty("/boqItems");
            var aPayloadSelectedItem = aTableData;
            aPayloadSelectedItem.forEach(element => {
                delete element.UOMSuggestions;
            });
            var sVendorID = "1";
            var sParentID = this.getView().getBindingContext().getObject().ID;
            oPayload.ParentLineItemID = sParentID;
            oPayload.PCGroupItems = aPayloadSelectedItem;
            oPayload.VendorID = sVendorID;

            this.mainModel.create("/PCGroupItemListSet", oPayload, {
                success: function (oData, oResponse) {
                    sap.m.MessageBox.success(oData.Message);
                    this.getViewModel("objectViewModel").setProperty("/isCreatingPCList", false);
                    this.getView().getModel().refresh();
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error(JSON.stringify(oError));
                }
            });
        },

        onCreateNewPCListPress: function (oEvent) {
            this.getViewModel("objectViewModel").setProperty("/isCreatingPCList", true)
        },

        onCancelPCListCreationPress: function (oEvent) {
            this.getViewModel("objectViewModel").setProperty("/isCreatingPCList", false)
        },

        onPCListSelectionChange: function (oEvent) {
            var isSelected = oEvent.getParameter("selected");
            this.getViewModel("objectViewModel").setProperty("/isPCListSelected", isSelected);
        },

        onCreateBOQPress: function (oEvent) {
            var isMaterialStandAlone = this.getViewModel("objectViewModel").getProperty("/noParentChildRelationFlag");
            var boqCreationModel = new JSONModel({
                selectedItemData: isMaterialStandAlone ? null : this.byId("idPCListTable").getSelectedItem().getBindingContext().getObject(),
                quantity: null,
                isConfirmButtonEnabled: false,
                valueState: null,
                valueStateText: ""
            });
            this.getView().setModel(boqCreationModel, "boqCreationModel");

            if (!this._oBOQCreationDialog) {
                this._oBOQCreationDialog = sap.ui.xmlfragment("com.agel.mmts.vendormanageboq.view.fragments.detailPage.BOQQuantityGetter", this);
                this.getView().addDependent(this._oBOQCreationDialog);
            }
            this._oBOQCreationDialog.open();
        },

        onQuantityLiveChange: function (oEvent) {
            var oPOData = this.getView().getBindingContext().getObject();
            if (oEvent.getSource().getValue().length)
                this.getViewModel("boqCreationModel").setProperty("/isConfirmButtonEnabled", true);
            else
                this.getViewModel("boqCreationModel").setProperty("/isConfirmButtonEnabled", false);

            if (parseInt(oEvent.getSource().getValue()) > parseInt(oPOData.Quantity)) {
                this.getViewModel("boqCreationModel").setProperty("/valueState", "Error");
                this.getViewModel("boqCreationModel").setProperty("/valueStateText", "BOQ quantity should not exceed PO Material quantity.");
            }
            else {
                this.getViewModel("boqCreationModel").setProperty("/valueState", null);
                this.getViewModel("boqCreationModel").setProperty("/valueStateText", "");
            }
        },

        onCancelBOQCreationProcess: function (oEvent) {
            this._oBOQCreationDialog.close();
        },

        onConfirmCreateBOQPress: function (oEvent) {
            this._oBOQCreationDialog.close();
            var isMaterialStandAlone = this.getViewModel("objectViewModel").getProperty("/noParentChildRelationFlag");
            var sQuantity = this.getViewModel("boqCreationModel").getProperty("/quantity");
            var oModel = this.getComponentModel();
            if (sQuantity !== "0" ) {
                if (isMaterialStandAlone) {
                    var oPayload = {
                        "QTY": parseInt(sQuantity),
                        "PCGroupId": 0,
                        "ParentLineItemId": this.getView().getBindingContext().getObject().ID,
                        "IsOne2OneLineItem":true
                    };
                    sap.m.MessageBox.error("PC List created with no Quantity!");
                } else {
                    var oSelectedItemData = this.byId("idPCListTable").getSelectedItem().getBindingContext().getObject();

                    var oPayload = {
                        "QTY": parseInt(sQuantity),
                        "PCGroupId": parseInt(oSelectedItemData.ID),
                        "ParentLineItemId": parseInt(oSelectedItemData.ParentLineItemID)
                    };
                }
                if (oPayload) {
                    oModel.create("/BOQCalculationSet", oPayload, {
                        success: function (oData) {
                            sap.m.MessageBox.success(oData.Message);
                            this.getComponentModel().refresh();
                        }.bind(this),
                        error: function (oError) {
                            sap.m.MessageBox.error(JSON.stringify(oError));
                        }
                    });
                }
            } else {
                sap.m.MessageBox.error("Please ")
            }

        },

        onViewBOQRequests: function (oEvent) {
            if (oEvent.getParameter("pressed")) {
                this.getViewModel("objectViewModel").setProperty("/sViewBOQButtonName", "Close BOQ List");
                this.oRouter.navTo("detailDetail", {
                    parentMaterial: this.sParentID,
                    pcList: "pc",
                    layout: "ThreeColumnsMidExpanded"
                },
                    false);
            } else {
                this.getViewModel("objectViewModel").setProperty("/sViewBOQButtonName", "View BOQ List");
                this.oRouter.navTo("detail", {
                    parentMaterial: this.sParentID,
                    layout: "TwoColumnsMidExpanded"
                },
                    false
                );
            }

        },

        onUseSelectedPress: function (oEvent) {
            var sSelectedItemPath = this.byId("idPCListTable").getSelectedItem().getBindingContextPath();
            var sItemPath = sSelectedItemPath + "/PCGroupItems";
            var oModel = this.getComponentModel();
            oModel.read(sItemPath, {
                success: function (oData, oResponse) {
                    if (oData.results.length) {
                        var boqData = oData.results;
                        this._setDataInTable(boqData);
                    }
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error(JSON.stringify(oError));
                }
            });

        },

        _setDataInTable: function (data) {
            var aBOQItems = [];

            for (var i = 0; i < data.length; i++) {
                var boqItem = {};
                boqItem.MaterialCode = data[i].MaterialCode;
                boqItem.Name = data[i].Name;
                boqItem.Qty = data[i].Qty;
                boqItem.Description = data[i].Description;
                boqItem.Remarks = data[i].Remarks;
                boqItem.UOM = data[i].UOM;
                boqItem.MasterBOQItemId = data[i].MasterBOQItemId,
                    boqItem.UOMSuggestions = null;
                aBOQItems.push(boqItem);
                this._getUOMSuggestions(aBOQItems, data, i);
            }

            this.getViewModel("ManageBOQModel").setProperty("/boqItems", aBOQItems);
            this.getViewModel("objectViewModel").setProperty("/isCreatingPCList", true);
        },

        _getUOMSuggestions: function (aBOQItems, data, path) {
            var oModel = this.getView().getModel();
            //this.suggestions = [];
            var details = {};
            details.path = path;
            details.aBOQItems = aBOQItems;
            var oBindingContextPath = "/MasterBoQItemSet(" + data[path].Name + ")/UOMs";
            oModel.read(oBindingContextPath, {
                success: function (details, oData, oResponse) {
                    details.aBOQItems[details.path].UOMSuggestions = oData.results;
                    this.getViewModel("ManageBOQModel").refresh();
                }.bind(this, details),
                error: function (oError) {
                    sap.m.MessageBox.error("Error fetching UOMs");
                }
            });
        },

        onViewChildItemsPress: function (oEvent) {
            var sParentItemPath = oEvent.getSource().getBindingContext().getPath();
            var sDialogTitle = "BOQ Items for " + oEvent.getSource().getBindingContext().getObject().Name;
            var oDetails = {};
            oDetails.controller = this;
            oDetails.view = this.getView();
            oDetails.sParentItemPath = sParentItemPath;
            oDetails.title = sDialogTitle;
            if (!this.pDialog) {
                this.pDialog = Fragment.load({
                    id: oDetails.view.getId(),
                    name: "com.agel.mmts.vendormanageboq.view.fragments.detailPage.ViewLineItemsDialog",
                    controller: oDetails.controller
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sParentItemPath,
                        parameters: {
                            "expand": 'PCGroupItems'
                        }
                    });
                    oDialog.setTitle(oDetails.title)
                    if (Device.system.desktop) {
                        oDialog.addStyleClass("sapUiSizeCompact");
                    }
                    return oDialog;
                });
            }
            this.pDialog.then(function (oDialog) {
                oDetails.view.addDependent(oDialog);
                oDialog.bindElement({
                    path: oDetails.sParentItemPath,
                    parameters: {
                        'expand': 'PCGroupItems'
                    }
                });
                oDialog.open();
            });
        },

        onViewChildDialogClose: function (oEvent) {
            this.pDialog.then(function (oDialog) {
                oDialog.close();
            });
        }


    });
});            
