/*jslint browser: true*/
/*global checkStatus, $, loadBanner*/

var global = checkStatus("global");
var gplay = checkStatus("st_play.google.com");

$.when(global, gplay).done(function () {
	"use strict";
	if (!global.response.enabled || !gplay.response.enabled) {
		return;
	}
	$(document).ready(function () {
		loadBanner();
	});
});