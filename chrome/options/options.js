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
	var bool,
		init,
		checkBoxToggle,
		resetText,
		allow_data_collect = $("#s-data-collect-toggle"),
		api_key = $("#g-donationkey"),
		toggle_cproxy = $("#g-cproxy-toggle"),
		cproxy_port = $("#g-cproxy-port"),
		cproxy_url = $("#g-cproxy-url");

	/**
	 * Ouputs a debug message (in background.js)
	 * @param  {string} message the debug message
	 */
	var debug = function(message) {
		sendAction("debug", message);
	};

	/**
	 * Creates a checkBox plus wrapper for module, checks the box depending on the localStorage state
	 * @param  {string} service the service name
	 */
	var create_option_toggle_for_service = function (service) {
		sendActionWithCallback("checkStatus", "status_" + service, function (data) {
			var is_enabled, packages_area, service_escaped;

			service_escaped = service;
			service_escaped = service_escaped.replace(/ /g,"_");
			service_escaped = service_escaped.replace(/\./g,"_");

			packages_area = $("#packages_area");
			is_enabled = data.enabled;

			packages_area.append('<p class="package"><input id="' + service_escaped + '" type="checkbox" value=""><label for="' + service_escaped + '"> Enable module "<span>' + service + '</span>"</label></p>');

			if (is_enabled) {
				$("#" + service_escaped).prop("checked", "true");
			}
		});
	};

	/**
	 * Toggles a checkbox depending on the localStorage state in storage
	 * @param  {string} storage the storage key
	 * @param  {object} ele     checkbox for toggling
	 */
	checkBoxToggle = function (storage, ele) {
		sendActionWithCallback("checkStatus", storage, function(data) {
			if (data.enabled) {
				ele.prop("checked", "true");
			}
		});
	};

	/**
	 * Resets a text after to previous state a current time
	 * @param  {string} ele  the element to reset
	 * @param  {int} time time for reset
	 */
	resetText = function (ele, time) {
		var text = ele.html();
		setTimeout(function () {
			ele.html(text);
		}, time);
	};

	/**
	 * Starting point for option.js
	 */
	init = (function () {
		checkBoxToggle("status_data_collect", allow_data_collect);
		checkBoxToggle("status_cproxy", toggle_cproxy);

		sendActionWithCallback("getFromStorage", "services", function (data) {
			var services, service;
			services = data.data.split(",");

			for (var i = 0; i < services.length; i++) {
				create_option_toggle_for_service(services[i]);
			}
		});

		sendActionWithCallback("checkStatus", "status_cproxy", function(data) {
			if (data.enabled) {
				$("#g-cproxy-area").css("display", "block");
			}
		});

		sendActionWithCallback("getFromStorage", "cproxy_url", function(data) {
			cproxy_url.val(data.data);
		});

		sendActionWithCallback("getFromStorage", "cproxy_port", function(data) {
			cproxy_port.val(data.data);
		});

		sendActionWithCallback("getFromStorage", "api_key", function(data) {
			api_key.val(data.data);
		});
	}());

	// Slide toggle for custom proxy field
	$("#g-cproxy-toggle").click(function () {
		$("#g-cproxy-area").slideToggle("slow");
	});

	// Little helper, click the label has the same effect as clicking the box
	$("#g-cproxy-toggle-label").click(function () {
		$("#g-cproxy-toggle").click();
	});

	$("#savebutton").click(function () {
		var status_data_collect = allow_data_collect.prop("checked"),

		status_cproxy = $("#g-cproxy-toggle").prop("checked"),
		cproxy_url = $("#g-cproxy-url").val(),
		cproxy_port = $("#g-cproxy-port").val(),
		api_key = $("#g-donationkey").val();

		sendAction("setStorage", {key: "status_data_collect", val: status_data_collect});

		sendAction("setStorage", {key: "status_cproxy", val: status_cproxy});
		sendAction("setStorage", {key: "cproxy_url", val: cproxy_url});
		sendAction("setStorage", {key: "cproxy_port", val: cproxy_port});
		sendAction("setStorage", {key: "api_key", val: api_key});

		var packages = $(".package");
		packages.each(function(index, el) {
			var pkg = $(packages[index]);
			var module = pkg.find("span").html();
			var value = pkg.find("input").prop("checked");
			sendAction("setStorage", {key: "status_" + module, val: value});
		});

		// Tells background page to re-do the proxy config using the new config just set
		sendAction("resetproxy");

		// Change button text for user feedback
		resetText($(this), 5000);
		$(this).html("Success");
	});
});