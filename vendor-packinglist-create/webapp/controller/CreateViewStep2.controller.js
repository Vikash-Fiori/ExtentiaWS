sap.ui.define([
    "./BaseController",
    "sap/ui/core/Fragment",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    'sap/m/Token',
    'sap/m/ColumnListItem',
    'sap/m/Label',
    'sap/m/MessageBox',
    '../utils/formatter'

],
    function (BaseController, Fragment, Device, JSONModel, Token, ColumnListItem, Label, MessageBox, formatter) {
        "use strict";

        return BaseController.extend("com.agel.mmts.vendorpackinglistcreate.controller.CreateViewStep2", {
            formatter: formatter,
            onInit: function () {
                jQuery.sap.addUrlWhitelist("blob");
                this.mainModel = this.getOwnerComponent().getModel();
                //Router Object
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("RouteCreateViewStep2").attachPatternMatched(this._onObjectMatched, this);

                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0,
                    isPackagingTableVisible: false,
                    isPackingListInEditMode: false,
                    isOuterPackagingRequired: true

                });
                this.setModel(oViewModel, "objectViewModel");

            },

            _onObjectMatched: function (oEvent) {
                var objectViewModel = this.getViewModel("objectViewModel");
                var that = this;
                this.getView().bindElement({
                    path: "/PackingListSet(5)",
                    events: {
                        dataRequested: function () {
                            objectViewModel.setProperty("/busy", true);
                        },
                        dataReceived: function () {
                            var bIsProcessTwoCompletes = this.getBoundContext().getObject().IsProcessTwoCompletes;
                            var bIsOuterPackagingRequired = this.getBoundContext().getObject().IsOuterPackagingRequired;
                            if (!bIsOuterPackagingRequired.length)
                                objectViewModel.setProperty("/isOuterPackagingRequired", true);
                            if (bIsProcessTwoCompletes)
                                objectViewModel.setProperty("/isPackingListInEditMode", false);
                            else
                                objectViewModel.setProperty("/isPackingListInEditMode", true);
                            objectViewModel.setProperty("/busy", false);
                        }
                    }
                });
                this._getPackingListOuterPackagingData();
                this._getPackingListInnerPackagingData();
                this._createAdditionalDetailsModel();
            },

            _createAdditionalDetailsModel: function (oEvent) {
                var oModel = new JSONModel({
                    VehicleNumber: null,
                    PackagingReferenceNumber: null,
                    InvoiceNumber: null,
                    InvoiceDate: null
                });
                this.getView().setModel(oModel, "AdditionalDetialsModel")
            },

            _getPackingListOuterPackagingData: function () {
                this.mainModel.read("/PackingListSet(5)/OuterPackagings", {
                    success: function (oData, oError) {
                        console.log("Outer packaging get");
                        var oModel = new JSONModel(oData.results);
                        this.getView().setModel(oModel, "outerPackagingModel");
                        this._getRelatedInnerPackagings(oData.results);
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });
            },

            _getRelatedInnerPackagings: function (outerPackagingData) {
                for (let i = 0; i < outerPackagingData.length; i++) {
                    var path = "/OuterPackagingSet(" + outerPackagingData[i].ID + ")/InnerPackagings"

                    this.mainModel.read(path, {
                        success: function (i, oData, oError) {
                            console.log("Inner packaging get");
                            this.getView().getModel("outerPackagingModel").setProperty("/"+i+"/InnerPackagings", oData.results);
                            debugger;
                        }.bind(this, i),
                        error: function (oError) {
                            sap.m.MessageBox.error(JSON.stringify(oError));
                        }
                    });

                }

            },

            _getPackingListInnerPackagingData: function () {
                this.mainModel.read("/PackingListSet(5)/InnerPackagings", {
                    success: function (oData, oError) {
                        console.log("Total Inner get");
                        var oModel = new JSONModel(oData.results);
                        this.getView().setModel(oModel, "valueHelpModel");
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });
            },

            onViewBOQItemDialogClose: function (oEvent) {
                this.boqDialog.then(function (oDialog) {
                    oDialog.close();
                });
            },

            onManageInnerPackagingPress: function (oEvent) {
                this.selectedOuterPackagingObject = oEvent.getSource().getBindingContext("outerPackagingModel").getObject();
                this._getInnerPackagingForSelected(oEvent.getSource());
                var oButton = oEvent.getSource(),
                    oView = this.getView();

                if (!this._pDialog) {
                    this._pDialog = Fragment.load({
                        id: oView.getId(),
                        name: "com.agel.mmts.vendorpackinglistcreate.view.fragments.createViewStep2.ValueHelpDialog",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        if (Device.system.desktop) {
                            oDialog.addStyleClass("sapUiSizeCompact");
                        }
                        return oDialog;
                    });
                }

                this._pDialog.then(function (oDialog) {
                    //this._configDialog(oButton, oDialog);
                    oDialog.open();
                }.bind(this));
            },

            _getInnerPackagingForSelected: function (selected) {
                var sID = selected.getBindingContext("outerPackagingModel").getObject().ID;
                if (sID) {
                    var path = "/OuterPackagingSet(" + sID + ")/InnerPackagings"

                    this.mainModel.read(path, {
                        success: function (oData, oError) {
                            console.log("selected packaging get");
                            this._prepareData(oData.results);
                        }.bind(this),
                        error: function (oError) {
                            sap.m.MessageBox.error(JSON.stringify(oError));
                        }
                    });
                }
                else
                    this._prepareData([]);
            },

            _prepareData: function (aSelctedData) {
                var aAllData = this.getView().getModel("valueHelpModel").getData();
                for (let i = 0; i < aAllData.length; i++) {
                    for (let j = 0; j < aSelctedData.length; j++) {
                        if (aAllData[i].ID == aSelctedData[j].ID)
                            aAllData[i].selected = true;
                    }
                }
                this.getView().getModel("valueHelpModel").setData(aAllData);
            },

            onAddOuterPackagingPress: function (oEvent) {
                var oModel = this.getViewModel("outerPackagingModel");
                var oItems = oModel.getData().map(function (oItem) {
                    return Object.assign({}, oItem);
                });

                oItems.push({
                    PackagingType: "",
                    PackagingDimensions: "",
                    Remarks: "",
                    OuterPackagingTypeId: ""
                });

                oModel.setData(oItems);
            },

            onDeleteOuterPackingListItemPress: function (oEvent) {
                this.packingListObj = oEvent.getSource().getBindingContext("outerPackagingModel").getObject();

                var iRowNumberToDelete = parseInt(oEvent.getSource().getBindingContext("outerPackagingModel").getPath().slice("/".length));
                var sChildName = oEvent.getSource().getBindingContext("outerPackagingModel").getObject().PackagingType;

                if (sChildName.length)
                    var sMessage = "Are you sure you want to delete this entry with packaging type - " + sChildName + " ?";
                else
                    var sMessage = "Are you sure you want to delete this entry?";

                this._handleMessageBoxOpen(sMessage, "warning", iRowNumberToDelete);
            },

            _deleteFromDB: function (ID) {
                this.mainModel.remove("/OuterPackagingRequestEdmSet(" + ID + ")", {
                    success: function (oData, oResponse) {
                        console.log("Delete DB outerpackaging");
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.parse(oError));
                    }
                })
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
                if (this.packingListObj.ID)
                    this._deleteFromDB(this.packingListObj.ID);
                var aTableData = this.getViewModel("outerPackagingModel").getData();
                aTableData.splice(iRowNumberToDelete, 1);
                this.getView().getModel("outerPackagingModel").refresh();
            },

            onPackingListTypeChange: function (oEvent) {
                //this.getViewModel("UOMSuggestionModel").setData(null);
                var packingListObj = oEvent.getParameter("selectedItem").getBindingContext().getObject(),
                    oBindingContext = oEvent.getParameter("selectedItem").getBindingContext(),
                    oBindingContextPath = oEvent.getSource().getSelectedItem().getBindingContext().getPath(),
                    aRowCells = oEvent.getSource().getParent().getCells(),
                    sItemPath = oEvent.getSource().getBindingContext("outerPackagingModel").getPath();

                var sText = oEvent.getParameter("selectedItem").getText();
                this.getView().getModel("outerPackagingModel").setProperty(sItemPath + "/PackagingType", sText);

                var sKey = oEvent.getParameter("selectedItem").getKey();
                this.getView().getModel("outerPackagingModel").setProperty(sItemPath + "/OuterPackagingTypeId", sKey);


                for (var i = 1; i < aRowCells.length; i++) {
                    if (aRowCells[i] instanceof sap.m.Text) {
                        var cellContextPath = aRowCells[i].data("p");
                        var val = packingListObj[cellContextPath];
                        aRowCells[i].setText(val);
                    }
                }
            },

            onSavePackingListPress: function (oEvent) {
                this._getPackingListOuterPackagingData();
                var oAdditionalData = this.getViewModel("AdditionalDetialsModel").getData();
                var oPayload = {};
                oPayload.PackingListId = this.getView().getBindingContext().getObject().ID;
                oPayload.IsDraft = true;
                oPayload.IsProcessTwoCompletes = true;
                oPayload.IsOuterPackagingRequired = this.getViewModel("objectViewModel").getProperty("/isOuterPackagingRequired");
                oPayload.VehicleNumber = oAdditionalData.VehicleNumber;
                oPayload.PackagingReferenceNumber = oAdditionalData.PackagingReferenceNumber;
                oPayload.InvoiceNumber = oAdditionalData.InvoiceNumber;
                oPayload.InvoiceDate = oAdditionalData.InvoiceDate;
                var aOuterPackagingData = this.getViewModel("outerPackagingModel").getData();
                for (let i = 0; i < aOuterPackagingData.length; i++) {
                    if(!aOuterPackagingData[i].ID){
                        aOuterPackagingData[i].InnerPackagings = [];
                    }
                }
                oPayload.OuterPackagings = aOuterPackagingData;


                this.mainModel.create("/OuterPackagingRequestEdmSet", oPayload, {
                    success: function (oData, oResponse) {
                        var objectViewModel = this.getViewModel("objectViewModel");
                        objectViewModel.setProperty("/isPackingListInEditMode", false);         
                    }.bind(this),
                    error: function (oError) {
                        var objectViewModel = this.getViewModel("objectViewModel");
                        objectViewModel.setProperty("/isPackingListInEditMode", false);
                    }.bind(this)
                })
            },

            onSaveInnerPackagingListPress: function (oEvent) {
                var aTotalInnerPackagingData = this.getViewModel("valueHelpModel").getData();
                var aSelectedInnerPackagingData = aTotalInnerPackagingData.filter(item => item.selected === true);
                var payload = {};
                payload.PackingListId = this.getView().getBindingContext().getObject().ID;
                payload.IsDraft = true;
                payload.IsProcessTwoCompletes = true;
                payload.IsOuterPackagingRequired = this.getViewModel("objectViewModel").getProperty("/isOuterPackagingRequired");
                payload.OuterPackagings = [];
                var oOuterPackagingObject = {};
                if (this.selectedOuterPackagingObject.ID)
                    oOuterPackagingObject.ID = this.selectedOuterPackagingObject.ID;
                oOuterPackagingObject.OuterPackagingTypeId = this.selectedOuterPackagingObject.OuterPackagingTypeId;
                oOuterPackagingObject.Remarks = "";
                oOuterPackagingObject.PackagingType = this.selectedOuterPackagingObject.PackagingType;
                oOuterPackagingObject.InnerPackagings = aSelectedInnerPackagingData;
                payload.OuterPackagings.push(oOuterPackagingObject)

                this.mainModel.create("/OuterPackagingRequestEdmSet", payload, {
                    success: function (oData, oResponse) {
                        sap.m.MessageBox.success("Outer Packaging managed succesfully!")
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.oError);

                    }
                });
            },

            onInvoiceFileSelectedForUpload: function (oEvent) {
                // keep a reference of the uploaded file
                var that = this;
                var oFiles = oEvent.getParameters().files;
                var fileName = oFiles[0].name;
                var fileSize = oFiles[0].size;
                var SubType = "INVOICE";
                var Type = "PACKING_LIST";
                this._getImageData(URL.createObjectURL(oFiles[0]), function (base64) {
                    that._addData(base64, fileName, SubType, Type, fileSize);
                }, fileName);
            },

            onMaterialFileSelectedForUpload: function (oEvent) {
                // keep a reference of the uploaded file
                var that = this;
                var oFiles = oEvent.getParameters().files;
                var fileName = oFiles[0].name;
                var SubType = "MATERIAL";
                var Type = "PACKING_LIST";
                var fileSize = oFiles[0].size;
                for (var i = 0; i < oFiles.length; i++) {
                    var fileName = oFiles[i].name;
                    this._getImageData(URL.createObjectURL(oFiles[i]), function (base64) {
                        that._addData(base64, fileName, SubType, Type, fileSize);
                    }, fileName);
                }
            },

            onOtherFileSelectedForUpload: function (oEvent) {
                // keep a reference of the uploaded file
                var that = this
                var oFiles = oEvent.getParameters().files;
                var fileName = oFiles[0].name;
                var SubType = "OTHERS";
                var Type = "PACKING_LIST";
                var fileSize = oFiles[0].size;
                for (var i = 0; i < oFiles.length; i++) {
                    var fileName = oFiles[0].name;
                    this._getImageData(URL.createObjectURL(oFiles[i]), function (base64) {
                        that._addData(base64, fileName, SubType, Type, fileSize);
                    }, fileName);
                }
            },

            _getImageData: function (url, callback) {
                var xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    var reader = new FileReader();
                    reader.onloadend = function () {
                        callback(reader.result);
                    };
                    reader.readAsDataURL(xhr.response);
                };
                xhr.open('GET', url);
                xhr.responseType = 'blob';
                xhr.send();
            },

            _addData: function (data, fileName, SubType, Type, fileSize) {
                var that = this,
                    oViewContext = this.getView().getBindingContext().getObject();

                var documents = {
                    "Documents": [
                        {
                            "UploadTypeId": oViewContext.ID,
                            "Type": Type,
                            "SubType": SubType,
                            "FileName": fileName,
                            "Content": data.split(",")[1],
                            "ContentType": "application/pdf",
                            "UploadedBy": "vendor-1",
                            "FileSize": fileSize
                        }
                    ]
                };

                this.mainModel.create("/DocumentUploadEdmSet", documents, {
                    success: function (oData, oResponse) {
                        console.log("docuymnet UPloaded");
                        this.byId("idMaterialFileUploader").getBinding("items").refresh();
                        this.byId("idInvoiceFileUploader").getBinding("items").refresh();
                        this.byId("idOtherFileUploader").getBinding("items").refresh();
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });


            },

            onDeleteDocumentPress: function (oEvent) {
                var documentID = oEvent.getSource().getBindingContext().getObject().ID;
                this.mainModel.remove("/AttachmentSet(" + documentID + ")", {
                    success: function (oData, oResponse) {
                        sap.m.MessageBox.success("Document deleted successfully!");
                        this.getView().getModel().refresh();
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                })

            },

            onEditPackingListPress: function (oEvent) {
                var objectViewModel = this.getViewModel("objectViewModel");
                objectViewModel.setProperty("/isPackingListInEditMode", true);
            },

            onOuterPackagingRequiredSelectionChange: function (oEvent) {
                var objectViewModel = this.getViewModel("objectViewModel");
                var iSelected = oEvent.getParameter("selectedIndex");
                if (iSelected === 1)
                    objectViewModel.setProperty("/isOuterPackagingRequired", false);
                else if (iSelected === 0)
                    objectViewModel.setProperty("/isOuterPackagingRequired", true);
            }

        });
    });
