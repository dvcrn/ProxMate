define([
	'config',
	'storage',
	'ajax',
	'logger'
], function (Config, Storage, Ajax, Logger) {
	"use strict";

	var initialise = function () {};

	/**
	 * Retrieves a usable config. Tries: primary -> secondary -> offline storage -> static config
	 * @param  {Function} callback callback to execute after
	 */
	var load_config = function (callback) {
		var primary_url, secondary_url;

		Logger.log("[ad-config.js]: Trying to retrieve config...");

		primary_url = '{0}/api/v3/adconfig.json'.format(Config.get('primary_server'));
		secondary_url = '{0}/api/v3/adconfig.json'.format(Config.get('secondary_server'));

		Ajax.get(primary_url, callback, function () {
			Logger.warn("[ad-config.js]: Primary server not reachable. Trying secondary...");

			Ajax.get(secondary_url, callback, function () {
				Logger.warn("[ad-config.js]: Secondary server not reachable. Trying offline config...");

				Storage.get('offline_ad_config', function (config) {
					if (config === undefined) {
						Logger.warn("[ad-config.js]: No offline config available. Trying static config...");

						Ajax.get(Config.get('fallback_ad_config'), callback, function () {
							Logger.error("[ad-config.js]: No usable config found. Can't proceed.");
						});
						return;
					}

					callback(config);
				});

			});
		});
	};

	return {
		initialise: initialise,
		load_config: load_config
	}
});