/*jslint browser: true*/
/*global chrome, $, console*/

/**
 * Sends a message to background.js
 * @param  {string} actionString messagename
 * @param  {string} param        parameter
 * @return {object}              jQuery promise
 */
var sendAction = function (actionString, param) {
	"use strict";

	var defer;

	if (param === undefined) {
		param = null;
	}

	defer = $.Deferred();

	chrome.extension.sendRequest(
		{
			action: actionString,
			param: param
		},
		function (response) {
			if (response) {
				// Add response to promise and resolve it
				defer.response = response;
				defer.resolve();
			}
		}
	);

	return defer;
};

/**
 * Sends "checkStatus" message for a certain module to background.js
 * @param  {string} module modulename
 * @return {object}        jQuery promise
 */
var checkStatus = function (module) {
	"use strict";
	return sendAction("checkStatus", module);
};

/**
 * Sends "resetproxy" message to background.js
 */
var resetProxy = function () {
	"use strict";
	sendAction("resetproxy");
};

/**
 * Strips a get parameter from url
 * @param  {string} name parameter key
 * @return {string}      parameter value
 */
var getUrlParam = function (name) {
	"use strict";
    return decodeURI((new RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [null])[1]);
};

/**
 * Gets addon internal url for a specific file
 * @param  {string} file filepath
 * @return {string}      full url for internal file
 */
var getUrlFor = function (file) {
	"use strict";
	return chrome.extension.getURL(file);
};

var bool = function (str) {
	"use strict";
	if (str === undefined) {
		return false;
	}

    if (str.toLowerCase() === 'false') {
		return false;
    } else if (str.toLowerCase() === 'true') {
		return true;
    } else {
		return undefined;
    }
};

/**
 * loads ProxMates overlay
 * @param  {Function} callback callback for executing when overlay is clicked
 */
var loadOverlay = function (callback) {
	"use strict";

	// Load the css and html for overlay
	$('<link>').attr('rel', 'stylesheet')
	    .attr('type', 'text/css')
	    .attr('href', getUrlFor("elements/overlay.css"))
	    .appendTo('head');

	$.get(getUrlFor("elements/overlay.html"), function (data) {
		$("body").prepend(data);
		$("#pmOverlay").fadeIn("slow");
		$("#pmOverlay").click(function () {
			callback();
		});
	});
};

/**
 * Loads ProxMates ad banner
 */
var loadBanner = function () {
	"use strict";

	// Load overlay css
	$('<link>').attr('rel', 'stylesheet')
	    .attr('type', 'text/css')
	    .attr('href', getUrlFor("elements/overlay.css"))
	    .appendTo('head');

	// Load banner
	$.get(getUrlFor("elements/banner.html"), function (data) {
		$("body").append(data);
		$("#pmBanner").fadeIn("slow");

		$("#pmBannerClose").click(function () {
			$("#pmBanner").fadeOut("slow", function () {
				$("#pmPusher").slideUp("slow");
			});
		});

		// Cascade banner
		setTimeout(function () {
			$("#pmBanner").addClass("smallBanner");
		}, 5000);
	});
};