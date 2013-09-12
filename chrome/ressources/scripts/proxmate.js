(function ($, jQuery) {
	"use strict";

	var Proxmate = function () {
		/**
		 * Emits event to backend
		 * @param  {string}   eventstring event identifier
		 * @param  {Array|string}   parameter   parameter or parameter array
		 * @param  {Function} callback    callback
		 */
		this.emit_event_to_backend = function (eventstring, parameter, callback) {
			callback = callback || function () {};
			parameter = parameter || [];

			if (!(parameter instanceof Array)) {
				parameter = [parameter];
			}

			console.info("Emitting " + eventstring);
		    chrome.runtime.sendMessage(
		        {
		            event_string: eventstring,
		            event_parameter: parameter.join(',,,')
		        },
		        function (response) {
	                callback.call(this, response);
		        }
		    );
		};

		/**
		 * Subscribes to mediator event from backend
		 * @param  {string}   eventstring eventname
		 * @param  {Function} callback    callback
		 */
		this.subscribe_to_event_from_backend = function (eventstring, callback) {
			this.emit_event_to_backend('cs_mediator_bind', [eventstring], function () {

				chrome.runtime.onMessage.addListener(function (request, sender, send_response) {
					// request.event_string;
					if (request.event_string === eventstring) {
						var parameter = request.event_parameter.split(',,,');

						if (request.event_parameter.length === 0) {
							parameter = [];
						}

						parameter.push(send_response);
						callback.apply(this, parameter);
					}

					return true;
				});
			});
		};

		/**
		 * Emits a event to event mediator in backend
		 * @param  {string} eventstring eventstring
		 */
		this.emit_event_to_backend_mediator = function (eventstring) {
			this.emit_event_to_backend('cs_mediator_emit', [eventstring]);
		};

		/**
		 * Calls Storage.get in backend
		 * @param {string} key key for retrieving storage
		 * @param  {Function} callback callback
		 */
		this.storage_get = function (key, callback) {
			this.emit_event_to_backend('cs_storage_get', [key], callback);
		};

		/**
		 * Calls Config.get in backend
		 * @param {string} key key for retrieving
		 * @param  {Function} callback callback
		 */
		this.config_get = function (key, callback) {
			this.emit_event_to_backend('cs_config_get', [key], callback);
		};

		/**
		 * Calls Preferences.get in backend
		 * @param {string} key key for retrieving
		 * @param  {Function} callback callback
		 */
		this.preferences_get = function (key, callback) {
			this.emit_event_to_backend('cs_preferences_get', [key], function (result) {
				callback.apply(this, JSON.parse(result));
			});
		};

		/**
		 * Calls Preferences.set in backend
		 * @param  {string}   key      key
		 * @param  {string}   value    value
		 * @param  {Function} callback callback
		 */
		this.preferences_set = function (key, value, callback) {
			this.emit_event_to_backend('cs_preferences_set', [key, value], callback);
		};

		/**
		 * Sends event do_offlineconfig_update to mediator
		 */
		this.update_offline_config = function () {
			this.emit_event_to_backend_mediator('do_offlineconfig_update');
		};

		/**
		 * Checks back if ProxMate is activated for the id service_id and executes callback
		 * @param  {int} service_id the service id
		 * @param {Function} callback callback to execute in case
		 */
		this.is_active_for_id = function (service_id, callback) {
			this.preferences_get(['disabled_services', 'addon_is_active'], function (disabled_services, addon_is_active) {
				if (!addon_is_active) {
					return;
				}

				if (disabled_services === null) {
					disabled_services = '';
				}

	            var disabled_service_array = $.map(disabled_services.split(','), function(value){
	                return parseInt(value, 10);
	            });

				if ($.inArray(service_id, disabled_service_array) == -1) {
					console.info("Service is in array, executing callback");
					callback.call(this);
				}
			});
		};

		/**
		 * Returns a full url to a packaged ressource
		 * @param  {string} url url
		 * @return {string}     packaged url
		 */
		this.get_addon_url = function (url) {
			return chrome.extension.getURL(url);
		};
	};

	window.Proxmate = new Proxmate();
})($, jQuery);