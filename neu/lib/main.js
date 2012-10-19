/*global require, exports*/

var selfData = require('self').data;
var pageMod = require("page-mod");
var localStorage = require("simple-storage").storage;
//var preferences = require("simple-prefs"); proxmate
var request = require("request");

const {components, Cc, Ci} = require("chrome");
var prefs = components.classes["@mozilla.org/preferences-service;1"].getService(components.interfaces.nsIPrefService);
var proxy = prefs.getBranch("network.proxy.");
var proxmate = prefs.getBranch("extensions.jid1-s6QMpA6kpqs7kw.");

exports.main = function () {
	"use strict";

	var setProxy, resetProxy, setPluginStatus, initStorage, initListeners, createPagemod, init, getPrefValue;

	getPrefValue = function (identifier, type) {
		console.info("Requesting:" + identifier);
		var r = false;

		switch (type) {
		case "string":
			r =  proxmate.getCharPref(identifier);
			break;
		case "int":
			r =  proxmate.getIntPref(identifier);	
			break;
		case "bool":
			r =  proxmate.getBoolPref(identifier);	
			break;
		}

		return r;
	};

	setProxy = function (url, port) {
		console.info("setting proxy!");
		var pcs, pacurl;
		url = String.quote(url).slice(1, -1);
		port = String.quote(port).slice(1, -1);

		// Building a custom pac script dependent on the users options settings
		pcs =	"function FindProxyForURL(url, host) {\n" +
			" if ( " +
			"	url.indexOf('proxmate=active') != -1 ";

		if (getPrefValue("status_pandora", "bool")) {
			pcs += " || host == 'www.pandora.com'";
		}

		if (getPrefValue("status_gplay", "bool")) {
			pcs += "|| url.indexOf('play.google.com') != -1";
		}

		if (getPrefValue("status_hulu", "bool") && getPrefValue("status_cproxy", "bool")) {
			pcs += "|| url.indexOf('hulu.com') != -1";
		}

		if (getPrefValue("status_grooveshark", "bool")) {
			pcs += "|| shExpMatch(url, 'http://grooveshark.com*') || shExpMatch(url, 'http://html5.grooveshark.com*')";
		}

		pcs += " )\n" +
			"	return 'PROXY " + url + ":" + port + "';\n" +
			"return 'DIRECT';\n" +
			"}";

		// In firefox, the only way of setting a pac script is by retrieving it from a url.
		// We are using data urls here to get around that
		pacurl = "data:text/javascript," + encodeURIComponent(pcs);

		console.info("Pac script: " + pacurl + "\n\n");

		proxy.setIntPref("type", 2);
		proxy.setCharPref("autoconfig_url", pacurl);
	};
	resetProxy = function () {
		var url = "", port = 0;

		if (getPrefValue("status_cproxy", "bool") && url !== undefined && port !== undefined) {
			url = getPrefValue("cproxy_url", "string");
			port = getPrefValue("cproxy_port", "int");
		} else {
			url = localStorage.proxy_url;
			port = localStorage.proxy_port;
		}

		setProxy(url, port);
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

		worker.port.on('setproxy',
			function (data) {
				var responseHash, cproxy, url, port;

				responseHash = data.hash;
				cproxy = preferences.prefs.status_cproxy;

				if (cproxy) {
					url = preferences.prefs.cproxy_url;
					port = preferences.prefs.cproxy_port;

					require("preferences-service").set("network.proxy.type", 1);
					require("preferences-service").set("network.proxy.http", url);
					require("preferences-service").set("network.proxy.http_port", port);
				} else {
					require("preferences-service").set("network.proxy.type", 1);
					require("preferences-service").set("network.proxy.http", localStorage.proxy_url);
					require("preferences-service").set("network.proxy.http_port", localStorage.proxy_port);
				}

				worker.port.emit(responseHash, {
					success: true
				});
			});

		worker.port.on('resetproxy',
			function (data) {
				var responseHash = data.hash;

				resetProxy();
				worker.port.emit(responseHash, {success: true});
			});

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

	init = (function () {
		console.info("Hallo Welt!");
		console.info(proxmate);

		var styoutube = getPrefValue("testpref", "string");
		console.info("Pref: " + styoutube);
		/*
		var statusButton = require("widget").Widget({
			id: "open-proxmate-btn",
			label: "Click to Activate/Deactivate Proxmate",
			contentURL: selfData.url("images/icon16.png"),
			onClick: setPluginStatus
		});
		*/

		console.info("Vor init Storage");
		initStorage("firststart");
		initStorage("status");
		console.info("Nach init storage\n");

		// Get proxy from proxybalancer. Will be set async
		localStorage.proxy_url = "proxy.personalitycores.com";
		localStorage.proxy_port = 8000;

		console.info("Vor request");
		request.Request({
			url: "http://direct.personalitycores.com:8000?country=us",
			onComplete: function (response) {
				localStorage.proxy_url = response.json.url;
				localStorage.proxy_port = response.json.port;
				resetProxy();
			}
		}).get();
		console.info("Nach Request\n");

		console.info("Vor Tab");
		if (localStorage.firststart === true) {

			//require("tab-browser").addTab("http://www.personalitycores.com/projects/proxmate/");
			//require("tab-browser").addTab("https://www.facebook.com/pages/ProxMate/319835808054609");

			localStorage.firststart = false;
		}
		console.info("Nach tab\n");

		console.info("Vor Pagemod");
		createPagemod(/.*personalitycores\.com\/projects\/proxmate/, 'sites/personalitycores.js');
		createPagemod(/^.*\/\/(?:.*\.)?grooveshark\.com(?:\/.*)?$/, 'sites/grooveshark.js');
		createPagemod(/.*youtube\.com\/results.*/, 'sites/youtube-search.js');
		createPagemod(/.*hulu\.com\/.*/, 'sites/hulu.js');
		createPagemod(/.*youtube\.com\/watch.*/, 'sites/youtube.js');
		createPagemod(/.*play\.google\.com\/.*/, 'sites/gplay.js');
		createPagemod(/.*pandora\.com\/.*/, 'sites/pandora.js');
		console.info("Nach Pagemod\n");

		if (localStorage.status === false) {
			statusButton.contentURL = selfData.url("images/icon16_gray.png");

			require("preferences-service").reset("network.proxy.type");
			require("preferences-service").reset("network.proxy.http");
			require("preferences-service").reset("network.proxy.http_port");
		} else {
			statusButton.contentURL = selfData.url("images/icon16.png");
			resetProxy();
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