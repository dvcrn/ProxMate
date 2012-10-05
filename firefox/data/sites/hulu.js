/*jslint browser: true*/
/*global checkStatus, $, loadBanner, resetProxy, proxifyUri*/

var global = checkStatus("global");
var hulu = checkStatus("status_hulu");
var cproxy = checkStatus("status_cproxy");

$.when(global, hulu, cproxy).done(function () {
	"use strict";
	if (!global.response.enabled || !hulu.response.enabled || !cproxy.response.enabled) {
		return;
	}
	$(document).ready(function () {
		loadBanner();
	});
});