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

		if (getUrlParam('proxmate') !== "us") {
            if ($(".channel-empty-message").length > 0) {
                $(".channel-empty-message h2").html("ProxMate will unblock this channel in a bit. :)");

                if (window.location.href.indexOf("?") !== -1) {
                	window.location.href = window.location.href + "&proxmate=us";
                } else {
                	window.location.href = window.location.href + "?proxmate=us";
                }
            }
		}
	});
});