define([
	'mediator',
	'preferences',
	'chrome',
	'logger',
	'proxy',
	'proxmate-config',
	'storage',
	'jquery'
], function (Mediator, Preferences, Chrome, Logger, Proxy, ProxmateConfig, Storage, $) {
	"use strict";
	var preferences_save_interval,
		storage_sync_interval;

	var initialise = function () {
		bind_chrome_click_to_proxmate_status();
		bind_do_global_status_change();
		bind_do_offlineconfig_update();
		bind_offlineconfig_update();
		bind_preferences_update();
		bind_storage_update();
	};

	/**
	 * Listens to addon_click event, changes the addon status and emits new global status event
	 */
	var bind_chrome_click_to_proxmate_status = function () {
		Mediator.subscribe('on_chrome_addon_icon_click', function () {

			Preferences.get('addon_is_active', function (status) {
				if (status) {
					Logger.log("[event-navigator.js]: Switching addon status to disabled");
					Mediator.publish('do_global_status_change', [false]);
				} else {
					Logger.log("[event-navigator.js]: Switching addon status to enabled");
					Mediator.publish('do_global_status_change', [true]);
				}
			});
		});
	};

	/**
	 * Binds do_global_status_change and changes the browsericon to grey and sets text to "disabled"
	 */
	var bind_do_global_status_change = function () {
		Mediator.subscribe('do_global_status_change', function (ev, new_status) {
			Preferences.set('addon_is_active', new_status, function () {
				if (new_status) {
					Logger.log("[event-navigator.js]: Status switched to 'on'. Removing badge text and coloring icon");
					Chrome.remove_badge_text();
					Chrome.set_browser_icon('ressources/images/icon24.png');
					Mediator.publish('do_proxy_update');

				} else {
					Logger.log("[event-navigator.js]: Status switched to 'off'. Setting badge text and activating grey icon");
					Chrome.set_badge_text("Off");
					Chrome.set_browser_icon('ressources/images/icon24_grey.png');
					Proxy.reset_proxy();
				}
			});
		});
	};

	/**
	 * Binds addon_autoconfig_update for saving new config into offline storage
	 */
	var bind_do_offlineconfig_update = function () {
		Mediator.subscribe('do_offlineconfig_update', function () {
			Logger.log("[event-navigator.js]: Updating offlineconfig.");
			ProxmateConfig.load_config(function (config) {

				var config_as_object = JSON.parse(config);
				Storage.set({'offline_config': config, 'last_config_date': config_as_object.meta.generated_at}, null, function () {
					Mediator.publish('offlineconfig_update');
				});
			});
		});
	};

	/**
	 * Binds offlineconfig_update: Reads proxy from offline storage, applies extras and overrides and sets proxy
	 */
	var bind_offlineconfig_update = function () {
		Mediator.subscribe('offlineconfig_update', function () {

			Preferences.get('addon_is_active', function (is_active) {
				if (is_active) {
					Logger.log("[event-navigator.js]: Updating browser proxy")
					Storage.get('offline_config', function (config) {
						var config = JSON.parse(config);

						Preferences.get([
							'config_extras',
							'config_overrides',
							'disabled_services'
						], function (config_extras, config_overrides, services) {
								var extras = JSON.parse(config_extras);
								var overrides = JSON.parse(config_overrides);
								var disabled_services = [];
								if (services != null) {
									disabled_services = services.split(',');
								}

								for (var service_id in config.services) {
									if ($.inArray(service_id, disabled_services) != -1) {
										Logger.log("[event-navigator.js]: Service '{0}' is disabled. Removing.".format(config.services[service_id].name));
										delete config.services[service_id];
									}
								}

								var pac = ProxmateConfig.generate_pac_from_config(config, overrides, extras);
								Storage.set('offline_pac_script', pac);
								Proxy.set_proxy_autoconfig(pac);
								Mediator.publish('proxy_update');
						});
					});
				}
			});

		});
	};

	/**
	 * Binds preferences_update and saves preferences into local storage after 3 seconds of inactivity
	 */
	var bind_preferences_update = function () {
		Mediator.subscribe('preferences_update', function (ev, preference_data) {
			preference_data = JSON.parse(preference_data);

			clearTimeout(preferences_save_interval);
			preferences_save_interval = setTimeout(function () {
				Storage.set(preference_data);
			}, 3000);
		});
	};

	/**
	 * Binds storage_update and saves storage into google cloud after 10 seconds of inactivity
	 */
	var bind_storage_update = function () {
		Mediator.subscribe('storage_update', function (ev, storage_content) {
			// Mirror allow_data_collection -> !localStorage
			if (Object.keys(storage_content).indexOf('allow_data_collection') != -1) {
				Logger.log("[event-navigator.js]: Found 'allow_data_collection' in update. Mirroring to localStorage.");

				var existing_feedback_opt = localStorage.feedbackOptOut;
				if (existing_feedback_opt !== undefined) {
					if (existing_feedback_opt.toLowerCase() == 'true') {
						existing_feedback_opt = true;
					} else if (existing_feedback_opt.toLowerCase() == 'false') {
						existing_feedback_opt = false;
					}
				}

				if ((storage_content.allow_data_collection) != !existing_feedback_opt) {
					Logger.log("[event-navigator.js]: Found a update in allow_data_collection. Resetting feedback_sent_date.");
					localStorage.feedbackOptOut = !storage_content.allow_data_collection;
					Preferences.set('feedback_sent_date', 0);
				}
			}

			clearTimeout(storage_sync_interval);
			storage_sync_interval = setTimeout(function () {
				Storage.save_in_cloud();
			}, 10000);
		});
	};

	return {
		initialise: initialise
	}
});