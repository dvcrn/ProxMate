define([
	'config',
	'preferences',
	'ajax',
	'mediator',
	'logger',
	'storage',
	'jquery'
], function (Config, Preferences, Ajax, Mediator, Logger, Storage, $) {
	"use strict";

	var initialise = function () {};

	/**
	 * shuffles a array and returns random result
	 * @param  {array} o the array to shuffle
	 * @return {array} the shuffled array
	 */
	var shuffle_array = function (o) {
	    "use strict";
	    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	    return o;
	};

	/**
	 * Build the content url by skipping not needed parameters
	 * @param  {string} server                server url
	 * @param  {string} proxmate_token        users proxmate token
	 * @param  {bool} allow_data_collection whether data collection is allowed or not
	 * @return {string}                       content url
	 */
	var build_content_url = function (server, proxmate_token, allow_data_collection) {
		var content_url_backbone = "{0}/api/v2/config.json"; // ?allow_data_collection={1}&key={2}";
		var url_params = [];

		if (proxmate_token !== null) {
			url_params.push('key={0}'.format(proxmate_token));
		}

		if (allow_data_collection === true) {
			url_params.push('allow_data_collection=true');
		}

		if (url_params.length > 0) {
			content_url_backbone += '?{0}'.format(url_params.join('&'));
		}

		return content_url_backbone.format(server);
	};

	/**
	 * Retrieves a usable config. Tries: primary -> secondary -> offline storage -> static config
	 * @param  {Function} callback callback to execute after
	 */
	var load_config = function (callback) {
		var primary_url, secondary_url;

		Logger.log("[proxmate-config.js]: Trying to retrieve config...");
		Preferences.get(['proxmate_token', 'allow_data_collection'], function (proxmate_token, allow_data_collection) {
			primary_url = build_content_url(Config.get('primary_server'), proxmate_token, allow_data_collection);
			secondary_url = build_content_url(Config.get('secondary_server'), proxmate_token, allow_data_collection);

			Ajax.get(primary_url, callback, function () {
				Logger.warn("[proxmate-config.js]: Primary server not reachable. Trying secondary...");

				Ajax.get(secondary_url, callback, function () {
					Logger.warn("[proxmate-config.js]: Secondary server not reachable. Trying offline config...");

					Storage.get('offline_config', function (config) {
						if (config === undefined) {
							Logger.warn("[proxmate-config.js]: No offline config available. Trying static config...");

							Ajax.get(Config.get('fallback_config'), callback, function () {
								Logger.error("[proxmate-config.js]: No usable config found. Can't proceed.");
							});
							return;
						}

						callback(config);
					});

				});
			});
		});
	};

	/**
	 * Parses configstring and returns a ready-to-set proxy autoconfig script
	 * @param  {Object} config config to use
	 * @param {Object} overrides overrides to use - check examples/overrides.json
	 * @param {Array} extra extras rules to apply - check examples/extra.json
	 * @return {string}              pac script
	 */
	var generate_pac_from_config = function (config, overrides, extras) {
		overrides = overrides || {};
		extras = extras || {};

		var available_services = [];
		var country_specific_rules = {};
		var pac_script = '';
		var countries_available;
		var conditions = [];

		// Apply overrides
		if (overrides.nodes !== undefined) {
			$.extend(config.nodes, overrides.nodes);
		}

		if (overrides.services !== undefined) {
			for (index in overrides.services) {
				$.extend(config.services[index], overrides.services[index]);
			}
		}

		// Add extra rules by creating and adding them to a custom service / custom country
		if (extras.length > 0) {
			var extra_config = {
				'nodes': {},
				'services': {}
			};

			for (index in extras) {
				var extra_element = extras[index];
				if (!extra_element.is_active) {
					continue;
				}

				var config_index = 'CUSTOMRULE{0}'.format(index);
				extra_config.nodes[config_index] = [extra_element['server']];
				extra_config.services[config_index] = {
					'rules': ['{0}'.format(extra_element['rule'])],
					'country': config_index,
					'id': config_index
				}
			}

			$.extend(config.services, extra_config.services);
			$.extend(config.nodes, extra_config.nodes);
		}

		for (index in config.services) {
			var service = config.services[index];

			// Check if we have a server for the service
			if ($.inArray(service.country, config.nodes)) {
				// Merge available rules into global array
				var current_country_specific_rules = country_specific_rules[service.country];
				if (!(current_country_specific_rules instanceof Array)) {
					current_country_specific_rules = [];
				}

				country_specific_rules[service.country] = current_country_specific_rules.concat(service.rules);
			}
		}

		// Generate conditions array containing ready-to-go conditions
		countries_available = Object.keys(country_specific_rules);
		conditions = [];
		for (index in countries_available) {
			var country_identifier = countries_available[index];
			var proxystring = shuffle_array(config.nodes[country_identifier]).join('; PROXY ');
			var condition_head = 'if';

			if (config.nodes[country_identifier].length === 1) {
				proxystring = 'PROXY {0}'.format(proxystring);
			}

			if (index != 0) {
				condition_head = 'else if';
			}

			conditions.push('{0} ({1}) { return "{2}"; }'.format(
					condition_head,
					country_specific_rules[country_identifier].join(' || '),
					proxystring
				));

		}
		conditions.push('else { return "DIRECT"; }');

		// Merge conditions into a pac_script
		pac_script = 'function FindProxyForURL(url, host) { {0} }'.format(conditions.join(' '));

		return pac_script;
	};

	return {
		initialise: initialise,
		load_config: load_config,
		generate_pac_from_config: generate_pac_from_config
	}

});