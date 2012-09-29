/*jslint browser: true*/
/*global checkStatus, $, loadBanner, resetProxy, proxifyUri*/

var global = checkStatus("global");
var hulu = checkStatus("status_hulu");

$.when(global, hulu).done(function () {
	"use strict";
	if (!global.response.enabled || !hulu.response.enabled) {
		return;
	}
	$(document).ready(function () {
		loadBanner();
	});
});