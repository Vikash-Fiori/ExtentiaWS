
sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("com.agel.mmts.storeinchargeapprovals.view.blocks.ApprovalsDetail.innerPackaging.InnerPackaging", {
        //venkatesh
        onViewQRCodePressSmart: function(oEvent){
            this.oParentBlock.fireOnViewQRCodePressSmart(oEvent);
        }
      

    });
});