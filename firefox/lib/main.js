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

	resetProxy = function () {
		var pacurl;
		console.info("setting proxy...");

		pacurl = "data:text/javascript," + encodeURIComponent(localStorage.pac_script);

		console.info(pacurl);
		require("preferences-service").set("network.proxy.type", 2);
		require("preferences-service").set("network.proxy.autoconfig_url", pacurl);
	};

	createPacFromConfig = function (config) {
		console.info("Creating PAC from config...");
		if (config === undefined) {
			config = localStorage.last_config;
		}

		var json, pac_script, counter, list, rule, proxystring, proxy, country, service, service_list, service_rules, rules;
		json = JSON.parse(config);

		if (json.list.auth.user !== undefined) {
			localStorage.proxy_user = json.list.auth.user;
			localStorage.proxy_password = json.list.auth.pass;
		} else {
			delete localStorage.proxy_user;
			delete localStorage.proxy_password;
		}

		pac_script = "function FindProxyForURL(url, host) {";
		counter = 0;

		service_list = [];
		for (country in json.list.proxies) {
			if (json.list.proxies[country].nodes.length > 0 && Object.keys(json.list.proxies[country].services).length > 0) {


				list = json.list.proxies[country].services;

				service_rules = [];
				for (service in list) {

					if (list[service].length > 0) {
						var ls_string = "st_" + service;
						initStorage(ls_string);

						service_list.push(service);
						if (localStorage[ls_string] === true) {

							rules = list[service].join(" || ");
							service_rules.push(rules);
						}
					}
				}

				if (service_rules.length === 0) {
					continue;
				}

				rule = service_rules.join(" || ");


				if (localStorage.status_cproxy === true) {
					proxystring = localStorage.cproxy_url + ":" + localStorage.cproxy_port;
				} else {
					proxystring = json.list.proxies[country].nodes.join("; ");
				}

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
		console.info(pac_script);
		localStorage.services = service_list;
		localStorage.pac_script = pac_script;
		console.info("Saved pac script in storage... \n\n");
		console.info("Saved the following: " + localStorage.pac_script);
	};

	loadExternalConfig = function (callback) {
		if (callback === undefined) {
			callback = function () {};
		}

		console.info("Loading external config...");
		request.Request({
			url: "http://proxmate.dave.cx/api/config.json?key=" + preferences.prefs.api_key,
			onComplete: function (response) {
				var config = response.text;
				console.info("Success!! Loaded \n\n" + config);
				localStorage.last_config = config;
				console.info("Writing config in localStorage...");
				createPacFromConfig(config);

				callback();
			}
		}).get();
	};

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

	// Function for initial creating / filling of storages
	initStorage = function (str, val) {
		if (val === undefined) {
			val = true;
		}

		if (localStorage[str] === undefined) {
			localStorage[str] = val;
		}
	};

	initListeners = function (worker) {

		// function for checking modul statuses in pagemods
		worker.port.on('checkStatus', function (data) {
			var module, status, responseHash;

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

		// Function used for making ajax calls in pagemods
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
		loadExternalConfig(resetProxy);
	}, 600000);

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

		console.info("Init...");
		loadExternalConfig(resetProxy);

		if (localStorage.firststart === true) {

			require("tab-browser").addTab("http://proxmate.dave.cx/");
			require("tab-browser").addTab("https://www.facebook.com/pages/ProxMate/319835808054609");

			localStorage.firststart = false;
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

	function onPrefChange(prefName) {
		resetProxy();
	}

	preferences.on("status_cproxy", onPrefChange);
	preferences.on("cproxy_url", onPrefChange);
	preferences.on("cproxy_port", onPrefChange);

	preferences.on("status_gplay", onPrefChange);
	preferences.on("status_youtube", onPrefChange);
	preferences.on("status_hulu", onPrefChange);
	preferences.on("status_pandora", onPrefChange);
	preferences.on("status_grooveshark", onPrefChange);
};