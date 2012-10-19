/*jslint browser: true*/
/*global checkStatus, $, loadBanner, resetProxy, proxifyUri*/

var global = checkStatus("global");
var pandora = checkStatus("status_pandora");

$.when(global, pandora).done(function () {
	"use strict";
	if (!global.response.enabled || !pandora.response.enabled) {
		return;
	}

	$(document).ready(function () {
		loadBanner();
	});
});