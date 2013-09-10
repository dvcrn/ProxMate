define([
	'chrome',
	'storage',
	'config',
	'preferences',
	'jquery',
	'mediator',
	'logger'
], function (Chrome, Storage, Config, Preferences, $, Mediator, Logger) {
	"use strict";

	var bound_events = [];

	/**
	 * tries to cast a string into bool
	 * chrome saves localStorage vars in string only. Needed for conversion
	 * @param  {string} str string to casat
	 * @return {bool}
	 */
	var try_parse_bool = function (str) {
	    "use strict";
	    if (str.toLowerCase() === 'false') {
	        return false;
	    } else if (str.toLowerCase() === 'true') {
	        return true;
	    } else {
	        return str;
	    }
	};

	/**
	 * Used for communication between backend <-> content scripts
	 */
	var initialise = function () {
		Chrome.bind_event('cs_storage_get', function (key, send_response) {
			var is_array = key.split(',');
			if (is_array.length > 1) {
				Storage.get(key.split(','), send_response);
			} else {
				Storage.get(key, send_response);
			}
		});

		Chrome.bind_event('cs_config_get', function (key, send_response) {
			Config.get(key, send_response);
		});

		Chrome.bind_event('cs_preferences_get', function (key, send_response) {
			Preferences.get(key.split(','), function () {
				send_response.call(this, JSON.stringify($.makeArray(arguments)));
			});
		});

		Chrome.bind_event('cs_preferences_set', function (key, value, send_response) {
			Preferences.set(key, try_parse_bool(value), send_response);
		});

		Chrome.bind_event('cs_mediator_emit', function(eventstring) {
			Mediator.publish(eventstring);
		});

		Chrome.bind_event('cs_mediator_bind', function (eventstring, send_response) {
			// To avoid double emits for the same event, we add it into a array
			if ($.inArray(eventstring, bound_events) == -1) {
				bound_events.push(eventstring);
				Logger.log("[cs-communicator.js]: Event passing to content script for '{0}' bound.".format(eventstring));

				Mediator.subscribe(eventstring, function (ev) {
					Chrome.emit_event(ev.type, $.makeArray(arguments).splice(0, 1));
				});
			}

			send_response.call(this);
		});
	};

	return {
		initialise: initialise
	}
});