/**
 * ProxMate is created and © by David Mohl.
 * It's pretty cool that you're interested in how this extension works but please don't steal what you'll find here.
 *
 * Interested in helping ProxMate and/or licensing? Contact me at proxmate@dave.cx
 */

/*jslint browser: true*/
/*global $, self*/

var getUrlFor = function (file) {
	"use strict";
	var dataUri = "resource://jid1-QpHD8URtZWJC2A-at-jetpack/proxmate/data/";
	return dataUri + file;
};

var randomString = function (length) {
	"use strict";
	var alphabet = "", chars = [], str = "", i = 0;
	alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
	chars = alphabet.split("");

	if (!length) {
		length = Math.floor(Math.random() * chars.length);
	}

	str = '';
	for (i = 0; i < length; i += 1) {
		str += chars[Math.floor(Math.random() * chars.length)];
	}
	return str;
};

var addListener = function (event, defer) {
	"use strict";
	self.port.on(event, function (data) {
		defer.response = data;
		defer.resolve();
	});
};

/**
 * Sends a message to background.js, executes callback on done event
 * @param  {string}   actionString event name
 * @param  {string}   param        param for background
 * @param  {function} callback     function to execute on success
 */
var sendActionWithCallback = function (actionString, param, callback) {
    "use strict";
    var defer = sendAction(actionString, param);
    defer.done(function () {
        callback(defer.response);
    });
};

var sendAction = function (actionString, param) {
	"use strict";
	if (param === undefined) {
		param = null;
	}

	var defer = $.Deferred(), hash = randomString();

	self.port.emit(actionString,
		{
			param: param,
			hash: hash
		});

	addListener(hash, defer);

	return defer;
};

var loadResource = function (url) {
	"use strict";
	return sendAction("loadResource", url);
};

var getUrlParam = function (name) {
	"use strict";
	return decodeURI((new RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [null])[1]);
};

var checkStatus = function (module) {
	"use strict";
	return sendAction("checkStatus", module);
};

var loadOverlay = function (callback) {
	"use strict";
	// Load the overlay
	$('<link>').attr('rel', 'stylesheet')
	    .attr('type', 'text/css')
	    .attr('href', getUrlFor("elements/overlay.css"))
	    .appendTo('head');

	var resource = loadResource(getUrlFor("elements/overlay.html"));
	resource.done(function () {
		var data = resource.response.response;
		$("body").prepend(data);
		$("#pmOverlay").fadeIn("slow");
		$("#pmOverlay").click(function () {
			callback();
		});
	});
};

var loadBanner = function (callback) {
	"use strict";

	// Load the overlay
	$('<link>').attr('rel', 'stylesheet')
	    .attr('type', 'text/css')
	    .attr('href', getUrlFor("elements/overlay.css"))
	    .appendTo('head');

	var resource = loadResource(getUrlFor("elements/banner.html"));
	resource.done(function () {
		var data = resource.response.response;
		$("body").append(data);
		$("#pmBanner").fadeIn("slow");
		$("#pmBannerClose").click(function () {
			$("#pmBanner").fadeOut("slow", function () {
				$("#pmPusher").slideUp("slow");
			});
		});

		setTimeout(function () {
			$("#pmBanner").addClass("smallBanner");
		}, 5000);
	});
};

var debug = function (obj) {
	console.log(JSON.stringify(obj));
};

/**
 * Loads jQuery into page context and executes callback
 * @param  {Function} callback callback to execute with jQuery instance
 */
var loadJquery = function(cb) {
    // Load the script
    var script = document.createElement("SCRIPT");
    script.src = getUrlFor("lib/jquery-1.7.1.min.js");
    script.type = 'text/javascript';
    document.getElementsByTagName("head")[0].appendChild(script);

    // Poll for jQuery to come into existance
    var checkReady = function(callback) {
        if (window.jQuery) {
            callback(jQuery);
        }
        else {
            window.setTimeout(function() { checkReady(callback); }, 100);
        }
    };

    // Start polling...
    checkReady(function($) {
        cb($);
    });
}

/**
 * Executes a script in page context
 * @param  {string} script the script itself
 */
var executeScript = function (script) {
    var g, s;
    g = document.createElement('script');
    s = document.getElementsByTagName('script')[0];
    g.text = script;
    s.parentNode.insertBefore(g, s);
};