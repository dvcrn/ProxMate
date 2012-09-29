/*jslint browser: true*/
/*global checkStatus, $, loadBanner, resetProxy, proxifyUri, getUrlParam, loadOverlay, getUrlFor*/

var global = checkStatus("global");
var youtube = checkStatus("status_youtube");

$.when(global, youtube).done(function () {
	"use strict";
	if (!global.response.enabled || !youtube.response.enabled) {
		return;
	}

	$(document).ready(function () {
		var pmParam, script, scriptcontent, n;
		pmParam = getUrlParam('proxmate');

		if (pmParam === "active") {
			script = $("#watch-video script")[1]; // Get the second script tag inside the #watch-video element
			scriptcontent = $(script).contents()[0].data; // Get the script content (a.k.a the function)

			loadBanner(function () {
				$("#page").css("margin-top", "0px");
			});
			// videoplayback%253F
			n = scriptcontent.replace(/videoplayback%253F/g, "videoplayback%253Fproxmate%253Dactive%2526"); // Append our proxmate param so the pac script wil care of it
			eval(n);

		} else {
			if ($("#watch-player-unavailable").length > 0) {
				loadOverlay(function () {
					// Change text
					$("#unavailable-submessage").html("ProxMate will unblock this video now :)");

					// Change Icon
					$("#watch-player-unavailable-icon-container img").prop("src", getUrlFor("images/waitajax.gif"));
					window.location.href = window.location.href + "&proxmate=active";
				});
			}
		}
	});
});