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
			Preferences.get(['addon_is_active', 'first_start'], function (status, first_start) {
				Mediator.publish('do_global_status_change', [status]);
				Mediator.publish('do_offlineconfig_update');

				if (first_start) {
					Preferences.set('first_start', false, function () {
						var tabs = Config.get('first_start_tabs');
						for (var index in tabs) {
							Chrome.create_tab(tabs[index]);
						}
					});
				}

				Chrome.bind_event('test_event', function (p1, send_response) {
					console.info("Received the test event");
					console.info(arguments);
					send_response('arrived');
				});
			});
		});

		Timer.add_timer(Config.get('pull_interval'), 'do_offlineconfig_update');
	}

	return {
		initialise: initialise
	};
});