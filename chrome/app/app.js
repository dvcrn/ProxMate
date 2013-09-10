define([
	'jquery',
	'storage',
	'logger',
	'mediator',
	'ajax',
	'config',
	'proxmate-config',
	'proxy',
	'chrome',
	'timer',
	'preferences'
], function ($, Storage, Logger, Mediator, Ajax, Config, ProxmateConfig, Proxy, Chrome, Timer, Preferences) {
	"use strict";

	var initialise = function () {
		Logger.log("[app.js]: Initialising app...");

		Chrome.set_badge_text("Init...");
		Storage.apply_from_cloud(function () {
			Preferences.initialise();
			Preferences.get([
				'addon_is_active',
				'first_start',
				'feedback_sent_date',
				'uuid',
				'allow_data_collection'
			], function (status, first_start, feedback_sent_date, uuid, allow_data_collection) {
				Mediator.publish('do_global_status_change', [status]);
				Mediator.publish('do_offlineconfig_update');

				if (first_start) {
					if (localStorage['firststart']) {
						Logger.log('[app.js]: Found used localStorage entry. Trying to migrate from older ProxMate...');
						var migrate = {
							'proxmate_token': 'api_key',
							'uuid': 'uuid'
						};
						var key;
						for (key in migrate) {
							Preferences.set(key, localStorage[migrate[key]]);
						}

						Preferences.set('first_start', false);
						Logger.log('[app.js]: Finished migrating. Deleting old localStorage content...');
						localStorage.clear();
						Mediator.publish('do_global_status_change', [status]);
					} else {
						Preferences.set('first_start', false, function () {
							var tabs = Config.get('first_start_tabs');
							for (var index in tabs) {
								Chrome.create_tab(tabs[index]);
							}
						});
					}
				}

				if ((new Date().getTime() - feedback_sent_date) >= 2592000000) {
					Logger.log('[app.js]: Data collection feedback is due. Pinging server...');
					Ajax.post('{0}/api/feedback.json'.format(Config.get('secondary_server')), {
						'uuid': uuid,
						'allow_feedback': allow_data_collection
					}, function () {
						Preferences.set('feedback_sent_date', new Date().getTime());
					});
		        }
			});
		});

		Timer.add_timer(Config.get('pull_interval'), 'do_offlineconfig_update');
	}

	return {
		initialise: initialise
	};
});