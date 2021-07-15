/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comagel.mmts./storeincharge-approvals/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
