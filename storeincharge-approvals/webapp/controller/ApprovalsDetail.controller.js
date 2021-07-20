sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    "sap/ui/core/routing/History",
    'sap/m/ColumnListItem',
    'sap/m/Input',
    'sap/base/util/deepExtend',
    'sap/ui/export/Spreadsheet',
    'sap/m/MessageToast',
    "sap/m/MessageBox",
    "sap/m/ObjectIdentifier",
    "sap/m/Text",
    "sap/m/Button",
    "../utils/formatter"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input, deepExtend, Spreadsheet, MessageToast, MessageBox, ObjectIdentifier, Text, Button, formatter) {
        "use strict";

        return BaseController.extend("com.agel.mmts.storeinchargeapprovals.controller.ApprovalsDetail", {
            formatter:formatter,
            
            onInit: function () {
                this.getView().addEventDelegate({
                    onAfterShow: this.onBeforeShow,
                }, this);
                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0,
                    viewQrCode: false
                });
                this.setModel(oViewModel, "objectViewModel");

                this._createBOQApprovalModel();

                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("RouteApprovalsDetail").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched: function (oEvent) {
                var sObjectId = oEvent.getParameter("arguments").PLNo;
                this._bindView("/PrintAssistanceSet(" + sObjectId + ")");
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

            onChildTableUpdateStarted: function (oEvent) {
                oEvent.getSource().setBusy(true);
            },

            onChildItemsTableUpdateFinished: function (oEvent) {
                oEvent.getSource().setBusy(false);
            },

            onClose: function (oEvent) {
                this.oRouter.navTo("RouteLandingPage");
            },


            // QR Code View 
            onViewQRCodePress: function (oEvent) {
                var sParentItemPath = oEvent.getSource().getBindingContext().getPath();
                var sDialogTitleObject = oEvent.getSource()._getBindingContext().getProperty();
                var oDetails = {};
                oDetails.controller = this;
                oDetails.view = this.getView();
                oDetails.sParentItemPath = sParentItemPath;
                oDetails.title = "QR Code";
                if (sDialogTitleObject.Name)
                    oDetails.title = sDialogTitleObject.Name;
                else if (sDialogTitleObject.PackagingType)
                    oDetails.title = sDialogTitleObject.PackagingType;
                if (!this.qrDialog) {
                    this.qrDialog = Fragment.load({
                        id: oDetails.view.getId(),
                        name: "com.agel.mmts.storeinchargeapprovals.view.fragments.QRCodeViewer",
                        controller: oDetails.controller
                    }).then(function (oDialog) {
                        // connect dialog to the root view of this component (models, lifecycle)
                        oDetails.view.addDependent(oDialog);
                        oDialog.bindElement({
                            path: oDetails.sParentItemPath,
                        });
                        if (Device.system.desktop) {
                            oDialog.addStyleClass("sapUiSizeCompact");
                        }
                        oDialog.setTitle(oDetails.title);
                        return oDialog;
                    });
                }
                this.qrDialog.then(function (oDialog) {
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sParentItemPath,
                    });
                    oDialog.setTitle(oDetails.title);
                    oDialog.open();
                });
            },

            // QR Code View 
            onViewQRCodePressSmart: function (oEvent) {
                var sParentItemPath = oEvent.getParameter("oSource").getBindingContext().getPath();
                var sDialogTitleObject = oEvent.getSource()._getBindingContext().getProperty();
                var oDetails = {};
                oDetails.controller = this;
                oDetails.view = this.getView();
                oDetails.sParentItemPath = sParentItemPath;
                oDetails.title = "QR Code";
                if (sDialogTitleObject.Name)
                    oDetails.title = sDialogTitleObject.Name;
                else if (sDialogTitleObject.PackagingType)
                    oDetails.title = sDialogTitleObject.PackagingType;
                if (!this.qrDialog) {
                    this.qrDialog = Fragment.load({
                        id: oDetails.view.getId(),
                        name: "com.agel.mmts.storeinchargeapprovals.view.fragments.QRCodeViewer",
                        controller: oDetails.controller
                    }).then(function (oDialog) {
                        // connect dialog to the root view of this component (models, lifecycle)
                        oDetails.view.addDependent(oDialog);
                        oDialog.bindElement({
                            path: oDetails.sParentItemPath,
                        });
                        if (Device.system.desktop) {
                            oDialog.addStyleClass("sapUiSizeCompact");
                        }
                        oDialog.setTitle(oDetails.title);
                        return oDialog;
                    });
                }
                this.qrDialog.then(function (oDialog) {
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sParentItemPath,
                    });
                    oDialog.setTitle(oDetails.title);
                    oDialog.open();
                });
            },

            onQRCodeViewerDialogClosePress: function (oEvent) {
                this.qrDialog.then(function (oDialog) {
                    oDialog.close();
                });
            },


            _createBOQApprovalModel: function () {

                var oModel = new JSONModel({
                    BOQApprovedRequestId: null,
                    Status: null,
                    Comment: null,
                    BOQGroupId: null,
                    isPostButtonEnabled: false,
                    Label: null
                });

                this.setModel(oModel, "BOQApprovalModel");
            },

            onApprovePress: function (oEvent) {
                // debugger;
                var that = this;
                if (this.getView().getBindingContext().getObject().ID.length) {
                    var PackingListId = this.byId("vBoxid").getBindingContext().getObject().ID;
                    var userName = "Agel_July";


                    // var userName = sap.ushell.Container.getService("UserInfo").getFullName();


                    var oPayload = {
                        "PackingListId": PackingListId,
                        "UserName": userName,
                        "RequestApproved": true,
                        "PrintAssistanceId": this.getView().getBindingContext().getObject().ID
                    };

                    this.getOwnerComponent().getModel().create("/StoreInchargeQRCodePrintingAssistanceSet", oPayload, {
                        success: function (oData, oResponse) {
                            sap.m.MessageBox.success("The pending request is approved");
                            this.getOwnerComponent().getModel().refresh();
                        }.bind(this),
                        error: function (oError) {
                            sap.m.MessageBox.error(JSON.stringify(oError));
                        }
                    });
                } else {
                    sap.m.MessageBox.error("Oops! Error occured please try again in sometime.");
                }
            },

            onRejectPress: function (oEvent) {
                // debugger;
                var that = this;
                if (this.getView().getBindingContext().getObject().ID.length) {
                    var PackingListId = this.byId("vBoxid").getBindingContext().getObject().ID;
                    var userName = "Agel_July";
                    // var userName = sap.ushell.Container.getService("UserInfo").getFullName();


                    var oPayload = {
                        "PackingListId": PackingListId,
                        "UserName": userName,
                        "RequestApproved": false,
                        "PrintAssistanceId": this.getView().getBindingContext().getObject().ID
                    };

                    this.getOwnerComponent().getModel().create("/StoreInchargeQRCodePrintingAssistanceSet", oPayload, {
                        success: function (oData, oResponse) {
                            sap.m.MessageBox.success("The pending request is rejected");
                            this.getOwnerComponent().getModel().refresh();
                        }.bind(this),
                        error: function (oError) {
                            sap.m.MessageBox.error(JSON.stringify(oError));
                        }
                    });
                } else {
                    sap.m.MessageBox.error("Oops! Error occured please try again in sometime.");
                }
            },

            onViewQRCodePackingList: function (oEvent) {
                // debugger;
                if (oEvent.getParameter("state"))
                    this.getView().getModel("objectViewModel").setProperty("/viewQrCode", true);

                else
                    this.getView().getModel("objectViewModel").setProperty("/viewQrCode", false);

            }


        });
    });
