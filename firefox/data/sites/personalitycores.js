/*jslint browser: true*/
/*global checkStatus, $, loadBanner*/

var global = checkStatus("global");

global.done(function () {
	"use strict";
	if (global.response.enabled === false) {
		return;
	}

	$(document).ready(function () {
		$("#header").append("<h2 class='subhl'>Thanks for installing! You are awesome! :)</h2>");

		$(".subhl").css("margin-top", "-35px");
		$(".subhl").css("font-size", "22px");
	});

});