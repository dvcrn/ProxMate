/**
 * ProxMate is created and © by David Mohl.
 * It's pretty cool that you're interested in how this extension works but please don't steal what you'll find here.
 *
 * Interested in helping ProxMate and/or licensing? Contact me at proxmate@dave.cx
 */

/*jslint browser: true*/
/*global checkStatus, sendAction, sendActionWithCallback $*/

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

	/**
	 * Ouputs a debug message (in background.js)
	 * @param  {string} message the debug message
	 */
	var debug = function(message) {
		sendAction("debug", message);
	};

	// TODO: Get service list and explode it (from background, with callback)
	// Iterate over all entries, check status if enabled (background again, with callback)
	// Create box element and tick it if enabled

	var create_option_toggle_for_service = function (service) {
		sendActionWithCallback("checkStatus", "status_" + service, function (data) {
			var is_enabled, packages_area;

			packages_area = $("#packages_area");
			is_enabled = data.enabled;
			// TODO: Create checkbox element and container and tick if is_enabled = true
			console.info(is_enabled);
		});
	};

	sendActionWithCallback("getFromStorage", "services", function (data) {
		var services, service;
		services = data.data.split(",");

		for (var i = 0; i < services.length; i++) {
			create_option_toggle_for_service(services[i]);
		}
	});

	var dummy = function() {

	};

	checkBoxToggle = function (storage, ele) {
		console.info("Reading: " + storage + " - " + localStorage[storage]);
		if (bool(localStorage[storage])) {
			console.info("Checking checkbox");
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

		// Loading packages depending on localStorage entries
		var pa = $("#packages_area");
		var services = localStorage.services;
		services = services.split(",");

		console.info(services);

		for (var i = 0; i < services.length; i++) {
			var service = services[i];
			var service_escaped = service;
			service_escaped = service_escaped.replace(/ /g,"_");
			service_escaped = service_escaped.replace(/\./g,"_");

			var s = "status_" + service;

			console.info("LocalStorage Module: " + s + " - " + localStorage[s]);
			pa.append('<p class="package"><input id="'+service_escaped+'" type="checkbox" value=""><label for="'+service_escaped+'"> Enable module "<span>'+services[i]+'</span>"</label></p>');
			checkBoxToggle(s, $("#"+service_escaped));
		}

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

		var packages = $(".package");
		packages.each(function(index, el) {
			var pkg = $(packages[index]);
			var module = pkg.find("span").html();
			var value = pkg.find("input").prop("checked");
			localStorage["status_" + module] = value;
		});

		// Send action to background page
		sendAction("resetproxy");

		// Change button text
		resetText($(this), 5000);
		$(this).html("Success");
	});
});