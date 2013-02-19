/**
 * ProxMate is created and © by David Mohl.
 * It's pretty cool that you're interested in how this extension works but please don't steal what you'll find here.
 *
 * Interested in helping ProxMate and/or licensing? Contact me at proxmate@dave.cx
 */

/*jslint browser: true*/
/*global checkStatus, $, loadBanner, proxifyUri, getUrlParam, loadOverlay, getUrlFor*/

var global = checkStatus("global");
var youtube = checkStatus("status_general");
var autounblock = checkStatus("status_youtube_autounblock");

$.when(global, youtube, autounblock).done(function () {
	"use strict";
	if (!global.response.enabled || !youtube.response.enabled) {
		return;
	}

	$(document).ready(function () {
		/*
			This code is for reviewers. To understand what we are doing here and why.

			ProxMate unblocks all links having &proxmate=active in their url.
			Youtube loads the video async after the initial pagecall is done. The videostream checks if the sitecall comes from the same IP as the videocall. If it doesn't, the video will be blocked.
			Means we have to proxy both.

			The way we came up with:
			- Get youtubes script for creating the video
			- Replace the videourl inside that script and append &proxmate=active
			- Execute the script again. This will replace the current video container with a new one, including our altered url.

			Using a pac_script entry for this url doesn't work! Otherways we would unblock ALL youtube videos what we clearly don't want!
		*/
		var pmParam, script, scriptcontent, n;
		pmParam = getUrlParam('proxmate');

		if (pmParam === "active") {
			script = $("#watch-video script")[1]; // Get the second script tag inside the #watch-video element
			if (script === undefined) {
				script = $("#watch7-video script")[1]; // Get the second script tag inside the #watch-video element
			}
			scriptcontent = $(script).contents()[0].data; // Get the script content (a.k.a the function)
			loadBanner(function () {
				$("#page").css("margin-top", "0px");
			});
			// videoplayback%253F
			n = scriptcontent.replace(/videoplayback%253F/g, "videoplayback%253Fproxmate%253Dactive%2526"); // Append our proxmate param so the pac script wil care of it
			$("body").append($("<script />", {
				html: n
			}));

		} else {
			if ($("#watch7-player-unavailable").length > 0) {
				if (autounblock.response.enabled) {
					// Change text
					$(".content .message").html("ProxMate will unblock this video now :)");
					$(".content .submessage").html("Just a moment.");

					// Change Icon
					$("#watch7-player-unavailable img").prop("src", getUrlFor("images/waitajax.gif"));
					window.location.href = window.location.href + "&proxmate=active";
				} else {
					loadOverlay(function () {
						// Change text
						$(".content .message").html("ProxMate will unblock this video now :)");
						$(".content .submessage").html("Just a moment.");

						// Change Icon
						$("#watch7-player-unavailable img").prop("src", getUrlFor("images/waitajax.gif"));
						window.location.href = window.location.href + "&proxmate=active";
					});
				}
			}
		}
	});
});