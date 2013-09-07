define(['logger'], function (Logger) {
	"use strict";

	var initialise = function () {};

	/**
	 * Resets the proxy back to system default
	 * @param {Function} callback callback after clearing
	 */
	var reset_proxy = function (callback) {
		callback = callback || function () {};

		Logger.log("[proxy.js]: Resetting proxy to system default.");
		chrome.proxy.settings.clear({}, callback);
	}

	/**
	 * Sets 'string' as browser proxy auto config
	 * @param  {string}   string   the pac script to set
	 * @param  {Function} callback callback after setting
	 */
	var set_proxy_autoconfig = function (string, callback) {
		callback = callback || function () {};

		Logger.log("[proxy.js]: Setting proxy auto config to {0}.".format(string));
		var config = {
	        mode: "pac_script",
	        pacScript: {
	            data: string
	        }
	    };

	    chrome.proxy.settings.set({
	    	value: config,
	    	scope: 'regular'
    	}, callback);
	}

	return {
		initialise: initialise,
		reset_proxy: reset_proxy,
		set_proxy_autoconfig: set_proxy_autoconfig
	}
});