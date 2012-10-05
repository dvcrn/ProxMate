/*jslint browser: true*/
/*global checkStatus, $, loadBanner*/

var global = checkStatus("global");
var gplay = checkStatus("status_gplay");

$.when(global, gplay).done(function () {
	"use strict";
	if (!global.response.enabled || !gplay.response.enabled) {
		return;
	}
	$(document).ready(function () {
		loadBanner();
	});
});