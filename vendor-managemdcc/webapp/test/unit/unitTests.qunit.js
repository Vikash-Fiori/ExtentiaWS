/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comagel.mmts./vendor-managemdcc/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
