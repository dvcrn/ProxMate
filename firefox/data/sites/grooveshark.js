/*jslint browser: true*/
/*global checkStatus, $, loadBanner*/

var global = checkStatus("global");
var pandora = checkStatus("st_grooveshark.com");

$.when(global, pandora).done(function () {
	"use strict";
	if (!global.response.enabled || !pandora.response.enabled) {
		return;
	}

	$(document).ready(function () {
		loadBanner();
	});
});