define(['text!../config.json', 'text!../manifest.json', 'jquery'], function (configfile, manifestfile, $) {
	var config = {};
	var manifest = {};
	var combined = {};

	/**
	 * Initialises the config loader and loads the configfile
	 */
	var initialise = function () {
		config = JSON.parse(configfile);
		manifest = JSON.parse(manifestfile);

		$.extend(combined, manifest, config);
	};

	/**
	 * Returns config/manifest for the key 'key' or undefined
	 * @param  {key} key The config key
	 * @param {Function} callback for those who prefer callbacks...
	 * @return {val}     the config vlaue
	 */
	var get = function (key, callback) {
		callback = callback || function () {};

		callback.call(this, combined[key]);
		return combined[key];
	};

	return {
		initialise: initialise,
		get: get
	}
});