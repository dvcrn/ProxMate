/*jslint browser: true*/
/*global checkStatus, $, loadBanner*/

var global = checkStatus("global");
var hulu = checkStatus("st_hulu.com");
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