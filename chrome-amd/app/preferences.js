define(['mediator', 'storage', 'logger', 'jquery'], function (Mediator, Storage, Logger, $) {

	var preference_data = {};
	var save_function;
	var is_ready_defer = $.Deferred();

	/**
	 * Generates a unique identifier to identify a proxmate user
	 * @return {string} uuid
	 */
	var generate_uuid = function () {
		var possible,
		random_string_1,
		random_string_2,
		current_time,
		random_number,
		identifier_put_together,
		identifier;

	    possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

	    for (var i = 0; i < 9; i++ ) {
	        random_string_1 += possible.charAt(Math.floor(Math.random() * possible.length));
	        random_string_2 += possible.charAt(Math.floor(Math.random() * possible.length));
	    }

	    current_time = new Date().getTime();
	    random_number = Math.floor(Math.random()*99999);

	    identifier_put_together = "prox-" + current_time + random_string_1 + random_number + random_string_2;
	    identifier = identifier_put_together.substring(0, 32);

	    return identifier;
	};

	// Key: Default
	var default_config = {
		addon_is_active: true,			// bool
		uuid: generate_uuid(),			// string
		proxmate_token: null,			// string
		allow_data_collection: true,	// bool
		config_overrides: '{}',			// json
		config_extras: '{}',			// json
		first_start: true,				// bool
		disabled_services: null 		// array
	};

	/**
	 * Initialises the preferences. Initially reads from storage and initialises neccessary data
	 */
	var initialise = function () {
		var preference_keys = Object.keys(default_config);

		Storage.get(preference_keys, function (object) {
			preference_data = object;

			// Initialise storage if key is not set
			get(preference_keys, function () {
				for (index in preference_keys) {
					var key = preference_keys[index];

					if (arguments[index] === undefined) {
						Logger.log("[preferences.js]: Preference '{0}' is undefined. Initialising with default value.".format(key));
						set(key, default_config[key]);
					}
				}

				is_ready_defer.resolve();
			}, true);
		});
	};

	/**
	 * Generic setter method for setting preferences. Publishes 'preferences_update' after 3s inactivity
	 * @param  {string} key   preferencek key
	 * @param  {string} value preference value
	 * @param  {Function} callback callback
	 */
	var set = function (key, value, callback) {
		callback = callback || function () {};
		preference_data[key] = value;

		Logger.log("[preferences.js]: Settings '{0}' with value ‘{1}'.".format(key, value));
		Mediator.publish('preferences_update', JSON.stringify(preference_data));
		callback();
	};

	/**
	 * Generic getter method for retrieving storage content
	 * @param  {string|array|none} null returns everything
	 * @param  {Function} callback callback
	 */
	var get = function (key, callback, ignore_ready_state) {
		callback = callback || function () {};
		ignore_ready_state = ignore_ready_state || false;
		key = (key == null ? Object.keys(config) : key);

		var defer = is_ready_defer;

		// Use a different defer object when we are in ignore_ready_state so we can resolve it independently
		if (ignore_ready_state) {
			defer = $.Deferred();
		}

		defer.done(function () {
			if (key instanceof Array) {
				var preference_array = [];

				for (i in key) {
					var current_key = key[i];
					preference_array.push(preference_data[current_key]);
				}

				callback.apply(this, preference_array);

			} else {
				if (ignore_ready_state) {
					callback(preference_data[key]);
					return;
				}

				callback(preference_data[key]);
			}

		});

		if (ignore_ready_state) {
			defer.resolve();
		}
	};

	/**
	 * Sets the UUID for the user
	 * @param  {string} uuid the uuid
	 */
	var set_uuid = function (uuid) {
		set('uuid', uuid);
	};

	/**
	 * Returns the users UUID
	 * @param {Function} callback
	 */
	var get_uuid = function (callback) {
		get('uuid', callback);
	};

	/**
	 * Sets the users proxmate token
	 * @param  {string} token the proxmate token
	 */
	var set_proxmate_token = function(token) {
		set('proxmate_token', token);
	};

	/**
	 * Retrieves the users proxmate token
	 * @param {Function} callback
	 */
	var get_proxmate_token = function (callback) {
		get('proxmate_token', callback);
	};

	/**
	 * Sets the users choice of allow data collection
	 * @param  {bool} bool choice
	 */
	var set_allow_data_collection = function (bool) {
		set('allow_data_collection', bool);
	};

	/**
	 * Retrieves the status if the user allows data collection or not
	 * @param {Function} callback
	 */
	var get_allow_data_collection = function (callback) {
		get('allow_data_collection', callback);
	};

	return {
		initialise: initialise,
		get: get,
		set: set,
		set_uuid: set_uuid,
		get_uuid: get_uuid,
		set_proxmate_token: set_proxmate_token,
		get_proxmate_token: get_proxmate_token,
		set_allow_data_collection: set_allow_data_collection,
		get_allow_data_collection: get_allow_data_collection
	}
});