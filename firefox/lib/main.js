/*global require, exports*/

var selfData = require('self').data;
var pageMod = require("page-mod");
var localStorage = require("simple-storage").storage;
var preferences = require("simple-prefs");
var request = require("request");
var timers = require("timers");

exports.main = function () {
	"use strict";
	var setProxy, resetProxy, setPluginStatus, initStorage, initListeners, createPagemod, init, loadExternalConfig, createPacFromConfig;

	/*
	 * Get pac_script form localStorage and set
	 */
	resetProxy = function () {
		var pacurl;

		pacurl = "data:text/javascript," + encodeURIComponent(localStorage.pac_script);

		require("preferences-service").set("network.proxy.type", 2);
		require("preferences-service").set("network.proxy.autoconfig_url", pacurl);
	};

	/*
	 * Parses script and saves generated proxy autoconfig in localStorage
	 *
	 * @param {string} config a json string. If none set, the last in localStorage will be used.
	 */
	createPacFromConfig = function (config) {
		if (config === undefined) {
			config = localStorage.last_config;
		}

		var json, pac_script, counter, list, rule, proxystring, proxy, country, service, service_list, service_rules, rules;
		json = JSON.parse(config);

		// Do we have user infos in answer json? If yes, save them. If no, remove old ones from storage
		if (json.list.auth.user !== undefined) {
			localStorage.proxy_user = json.list.auth.user;
			localStorage.proxy_password = json.list.auth.pass;
		} else {
			delete localStorage.proxy_user;
			delete localStorage.proxy_password;
		}

		// create a proxy auto config string
		pac_script = "function FindProxyForURL(url, host) {";
		counter = 0;

		service_list = [];
		for (country in json.list.proxies) {
			// Only parse if there are nodes and proxies available for the specific country
			if (json.list.proxies[country].nodes.length > 0 && Object.keys(json.list.proxies[country].services).length > 0) {


				list = json.list.proxies[country].services;

				service_rules = [];
				for (service in list) {
					// Apply only if we have rules under the current service
					if (list[service].length > 0) {
						// Create localStorage space for the current service.
						// This will enable toggling when using a custom options page
						var ls_string = "st_" + service;
						initStorage(ls_string);

						service_list.push(service);
						// check if the current service is enabled by the user. If no, skip it, if yes, join by OR condition
						if (preferences.prefs[ls_string] !== false) {
							rules = list[service].join(" || ");
							service_rules.push(rules);
						}
					}
				}

				// Check if we have some rules available
				if (service_rules.length === 0) {
					continue;
				}

				rule = service_rules.join(" || ");

				// Check for custom userproxy
				if (preferences.prefs.status_cproxy === true) {
					proxystring = preferences.prefs.cproxy_url + ":" + preferences.prefs.cproxy_port;
				} else {
					proxystring = json.list.proxies[country].nodes.join("; PROXY ");
				}

				// Some special treatment on first iteration
				if (counter === 0) {
					pac_script += "if (" + rule + ") { return 'PROXY " + proxystring + "';}";
				} else {
					pac_script += " else if (" + rule + ") { return 'PROXY " + proxystring + "';}";
				}

				counter += 1;
			}

		}

		pac_script += " else { return 'DIRECT'; }";
		pac_script += "}";
		localStorage.services = service_list;
		localStorage.pac_script = pac_script;
	};

	/*
	 * Loads external config and saves in localStorage.
	 * Invokes createPacFromConfig after fetching
	 *
	 * @param {function} callback a desired callback function
	 */
	loadExternalConfig = function (callback) {
		if (callback === undefined) {
			callback = function () {};
		}

		request.Request({
			url: "http://proxmate.dave.cx/api/config.json?key=" + preferences.prefs.api_key,
			onComplete: function (response) {
				var config = response.text;
				localStorage.last_config = config;
				createPacFromConfig(config);

				callback();
			}
		}).get();
	};

	/*
	 * Will be invoked when clicking the ProxMate logo. Simply toggles the plugins status
	 */
	setPluginStatus = function () {
		var toggle = localStorage.status;

		if (toggle === true) {
			this.contentURL = selfData.url("images/icon16_gray.png");

			localStorage.status = false;

			require("preferences-service").reset("network.proxy.type");
			require("preferences-service").reset("network.proxy.http");
			require("preferences-service").reset("network.proxy.http_port");
		} else {
			this.contentURL = selfData.url("images/icon16.png");
			localStorage.status = true;

			resetProxy();
		}
	};

	/*
	 * For initialising localStorage entries.
	 *
	 * @param {string} str the localStorage key
	 * @param {string} val the value for initialising. If none is set, true will be used
	 */
	initStorage = function (str, val) {
		if (val === undefined) {
			val = true;
		}

		if (localStorage[str] === undefined) {
			localStorage[str] = val;
		}
	};

	/*
	 * Creates listeners for reacting on worker events
	 *
	 * @param {object} worker pagemod
	 */
	initListeners = function (worker) {

		// function for checking modul statuses in pagemods
		worker.port.on('checkStatus', function (data) {
			var module, status, responseHash;

			// ResponseHash is used for specific event communication
			module = data.param;
			status = false;
			responseHash = data.hash;

			switch (module) {
			case "global":
				status = localStorage.status;
				break;
			case "cproxy":
				status = preferences.prefs.status_cproxy;
				break;
			default:
				status = preferences.prefs[module];
			}

			worker.port.emit(responseHash,
				{
					enabled: status
				});
		});

		// Function used for making ajax calls
		// Firefox forbids this in pagemods
		worker.port.on("loadResource", function (data) {
			var url, responseHash;

			url = data.param;
			responseHash = data.hash;

			require("request").Request({
				url: url,
				onComplete: function (response) {
					worker.port.emit(responseHash, { response: response.text });
				}
			}).get();
		});
	};

	/*
	 * Attaches a pagemod if a specific regex is matched. Will invoke initListeners
	 *
	 * @param {string} regex url regex rule for attaching
	 * @param {string} script scriptfile for attaching to pagemod
	 */
	createPagemod = function (regex, script) {
		return pageMod.PageMod({
			include: [regex],
			contentScriptFile: [
				selfData.url('jquery.js'),
				selfData.url('proxy.js'),
				selfData.url(script)
			],
			onAttach: initListeners
		});
	};

	timers.setInterval(function () {
		if (localStorage.status === true) {
			loadExternalConfig(resetProxy);
		} else {
			loadExternalConfig();
		}
	}, 600000);

	/*
	 * Self invoking function on browser / plugin start.
	 */
	init = (function () {

		var statusButton = require("widget").Widget({
			id: "open-proxmate-btn",
			label: "Click to Activate/Deactivate Proxmate",
			contentURL: selfData.url("images/icon16.png"),
			onClick: setPluginStatus
		});

		initStorage("firststart");
		initStorage("status");
		initStorage("pre21");
		initStorage("pac_script", "");

		if (localStorage.status === true) {
			loadExternalConfig(resetProxy);
		} else {
			loadExternalConfig();
		}

		if (localStorage.firststart === true) {

			require("tab-browser").addTab("http://proxmate.dave.cx/");
			require("tab-browser").addTab("https://www.facebook.com/pages/ProxMate/319835808054609");

			localStorage.firststart = false;
			localStorage.pre21 = false;
		}

		// Upgradecheck
		// For reminding the user that there's new stuff available!
		if (localStorage.pre21) {
			localStorage.pre21 = false;
			require("tab-browser").addTab("http://proxmate.dave.cx/changelog/");
		}

		createPagemod(/.*personalitycores\.com\/projects\/proxmate/, 'sites/personalitycores.js');
		createPagemod(/^.*\/\/(?:.*\.)?grooveshark\.com(?:\/.*)?$/, 'sites/grooveshark.js');
		createPagemod(/.*youtube\.com\/results.*/, 'sites/youtube-search.js');
		createPagemod(/.*hulu\.com\/.*/, 'sites/hulu.js');
		createPagemod(/.*youtube\.com\/watch.*/, 'sites/youtube.js');
		createPagemod(/.*play\.google\.com\/.*/, 'sites/gplay.js');
		createPagemod(/.*pandora\.com\/.*/, 'sites/pandora.js');

		if (localStorage.status === false) {
			statusButton.contentURL = selfData.url("images/icon16_gray.png");

			require("preferences-service").reset("network.proxy.type");
			require("preferences-service").reset("network.proxy.http");
			require("preferences-service").reset("network.proxy.http_port");
		} else {
			statusButton.contentURL = selfData.url("images/icon16.png");
		}
	}());

	/*
	 * Function for reacting on simplepref changes
	 */
	function onPrefChange(prefName) {
		createPacFromConfig();
		resetProxy();
	}

	preferences.on("status_cproxy", onPrefChange);
	preferences.on("cproxy_url", onPrefChange);
	preferences.on("cproxy_port", onPrefChange);

	preferences.on("api_key", function() {
		if (localStorage.status === true) {
			loadExternalConfig(resetProxy);
		} else {
			loadExternalConfig();
		}
	});

	preferences.on("st_play.google.com", onPrefChange);
	preferences.on("st_General", onPrefChange);
	preferences.on("st_hulu.com", onPrefChange);
	preferences.on("st_pandora.com", onPrefChange);
	preferences.on("st_grooveshark.com", onPrefChange);
};