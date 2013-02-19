/**
 * ProxMate is created and © by David Mohl.
 * It's pretty cool that you're interested in how this extension works but please don't steal what you'll find here.
 *
 * Interested in helping ProxMate and/or licensing? Contact me at proxmate@dave.cx
 */

/*jslint browser: true*/
/*global checkStatus, $, loadBanner, getUrlParam, getUrlFor*/

var global = checkStatus("global");
var youtube = checkStatus("status_general");

$.when(global, youtube).done(function () {
	"use strict";
	if (!global.response.enabled || !youtube.response.enabled) {
		return;
	}

	$(document).ready(function () {

		if (getUrlParam('proxmate') !== "active") {
			var button = '<button id="proxmate-button" type="button" class="yt-uix-button yt-uix-button-text yt-uix-button-toggle"><span class="yt-uix-button-content">Unblock this search</span></button>';
			// Append it in the option line
			$(button).insertAfter($(".num-results"));
			$("#proxmate-button").click(function () {
				var oldhtml = $("#proxmate-button span").html();
				$("#proxmate-button span").html(oldhtml + " <img src='" + getUrlFor("images/load.gif") + "' />");

				window.location.href = window.location.href + "&proxmate=active";
			});
		}
	});
});