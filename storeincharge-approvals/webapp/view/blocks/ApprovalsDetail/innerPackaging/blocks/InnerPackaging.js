sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var InnerPackagingTable = BlockBase.extend("com.agel.mmts.storeinchargeapprovals.view.blocks.ApprovalsDetail.innerPackaging.InnerPackaging", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.storeinchargeapprovals.view.blocks.ApprovalsDetail.innerPackaging.InnerPackaging",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.storeinchargeapprovals.view.blocks.ApprovalsDetail.innerPackaging.InnerPackaging",
                    type: "XML"
                }
            },
             events: {
                 "OnViewQRCodePressSmart":{}
			}
        }
    });

    return InnerPackagingTable;
});