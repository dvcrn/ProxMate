/*jslint browser: true*/
/*global checkStatus, sendAction, $*/

$(document).ready(function () {
	"use strict";
	var bool, init, checkBoxToggle, resetText,

		toggle_youtube_autounblock = $("#s-youtube-autounblock-toggle"),
		api_key = $("#g-donationkey"),
		toggle_cproxy = $("#g-cproxy-toggle"),
		cproxy_port = $("#g-cproxy-port"),
		cproxy_url = $("#g-cproxy-url");

	bool = function (str) {
		if (str.toLowerCase() === 'false') {
			return false;
		} else if (str.toLowerCase() === 'true') {
			return true;
		} else {
			return undefined;
		}
	};

	checkBoxToggle = function (storage, ele) {
		if (bool(localStorage[storage])) {
			ele.prop("checked", "true");
		}
	};

	init = (function () {

		checkBoxToggle("status_youtube_autounblock", toggle_youtube_autounblock);

		checkBoxToggle("status_cproxy", toggle_cproxy);
		if (bool(localStorage.status_cproxy)) {
			$("#g-cproxy-area").css("display", "block");
		}

		cproxy_url.val(localStorage.cproxy_url);
		cproxy_port.val(localStorage.cproxy_port);
		api_key.val(localStorage.api_key);

	}());

	resetText = function (ele, time) {
		var text = ele.html();
		setTimeout(function () {
			ele.html(text);
		}, time);
	};

	// Eigener Proxy Bereich
	$("#g-cproxy-toggle").click(function () {
		$("#g-cproxy-area").slideToggle("slow");
	});

	$("#g-cproxy-toggle-label").click(function () {
		$("#g-cproxy-toggle").click();
	});

	// Savebutton. Obvious :D
	$("#savebutton").click(function () {
		var status_youtube_autounblock = toggle_youtube_autounblock.prop("checked"),

			status_cproxy = $("#g-cproxy-toggle").prop("checked"),
			cproxy_port = $("#g-cproxy-port").val(),
			cproxy_url = $("#g-cproxy-url").val(),
			api_key = $("#g-donationkey").val();


		localStorage.status_youtube_autounblock = status_youtube_autounblock;

		localStorage.status_cproxy = status_cproxy;
		localStorage.cproxy_url = cproxy_url;
		localStorage.cproxy_port = cproxy_port;
		localStorage.api_key = api_key;

		// Send action to background page
		sendAction("resetproxy");

		// Change button text
		resetText($(this), 5000);
		$(this).html("Success");
	});
});