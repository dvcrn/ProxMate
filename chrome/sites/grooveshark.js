/*jslint browser: true*/
/*global checkStatus, $, loadBanner, resetProxy, proxifyUri*/

$(window).unload(resetProxy);

var global = checkStatus("global");
var grooveshark = checkStatus("status_grooveshark");

$.when(global, grooveshark).done(function () {
	"use strict";
	if (!global.response.enabled || !grooveshark.response.enabled) {
		return;
	}
	$(document).ready(function () {
		// Check for the broken heart
		var broken = $("#heartbroken");
		if (broken.length > 0) {

			// Change text
			$("#content h2").html("ProxMate will unblock Grooveshark now!");

			proxifyUri(window.location, true);
		} else {
			loadBanner();
		}
	});
});