/*jslint browser: true*/
/*global localStorage, chrome, console*/
var pac_config = {};

var bool = function (str) {
	"use strict";
	if (str.toLowerCase() === 'false') {
		return false;
	} else if (str.toLowerCase() === 'true') {
		return true;
	} else {
		return undefined;
	}
};

var resetProxy = function () {
	"use strict";
	var pcs, pac_config;

	pcs = localStorage.pac_script;

	console.info("Setting " + pcs);

	pac_config = {
		mode: "pac_script",
		pacScript: {
			data: pcs
		}
	};

	console.info(pac_config);

	chrome.proxy.settings.set(
		{value: pac_config, scope: 'regular'},
		function () {}
	);
};

// Handler for extension icon click
var togglePluginstatus = function () {
	"use strict";
	var toggle = bool(localStorage.status);

	if (toggle) {
		chrome.browserAction.setIcon({path: "images/icon128_gray.png"});

		localStorage.status = false;

		// Remove proxy
		chrome.proxy.settings.clear({});
	} else {
		chrome.browserAction.setIcon({path: "images/icon128.png"});

		localStorage.status = true;

		// Start setting the old proxy
		resetProxy();
	}
};

var initStorage = function (str, val) {
	"use strict";
	if (val === undefined) {
		val = true;
	}

	if (localStorage[str] === undefined) {
		localStorage[str] = val;
	}
};

chrome.webRequest.onAuthRequired.addListener(function (details, callback) {
	"use strict";
	console.info("Intercepting Auth Required");
	console.info("Authenticating with " + localStorage.proxy_user + " and " + localStorage.proxy_password);
	console.info(details);
	if (details.isProxy === true) {
		callback({ authCredentials: {username: localStorage.proxy_user, password: localStorage.proxy_password}});
	} else {
		callback({ cancel: false });
	}
}, {urls: ["<all_urls>"]}, ["asyncBlocking"]);

// Parses config string and creates pac_script entry
var createPacFromConfig = function (config) {
	"use strict";
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
		console.info("PW: " + localStorage.proxy_password);
	}

	pac_script = "function FindProxyForURL(url, host) {";
	counter = 0;

	service_list = [];
	for (country in json.list.proxies) {
		console.info("COuntry: " + country);
		if (json.list.proxies[country].nodes.length > 0 && Object.keys(json.list.proxies[country].services).length > 0) {


			list = json.list.proxies[country].services;
			//console.info(list);

			service_rules = [];
			for (service in list) {

				if (list[service].length > 0) {
					var ls_string = "st_" + service;
					initStorage(ls_string);

					service_list.push(service);
					if (bool(localStorage[ls_string]) === true) {

						rules = list[service].join(" || ");
						//console.info(rules);
						service_rules.push(rules);
						//console.info("-----> Rule for " + service + ": " + rules);
					}
				}
			}

			if (service_rules.length === 0) {
				continue;
			}

			rule = service_rules.join(" || ");


			if (bool(localStorage.status_cproxy) === true) {
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
	console.info("Services: ");
	console.info(service_list);
	localStorage.services = service_list;
	console.info("Reading...");
	console.info(localStorage.services);
	localStorage.pac_script = pac_script;
};

var loadExternalConfig = function () {
	"use strict";
	var xhr = new XMLHttpRequest();

	xhr.addEventListener("load", function () {
		var json, jsonstring, pac_script, counter, list, rule, proxystring, proxy, country, service;

		jsonstring = xhr.responseText;
		json = JSON.parse(jsonstring);

		if (json.success) {

			// Save last config in localStorage for possible later use.
			localStorage.last_config = jsonstring;
			createPacFromConfig(jsonstring);
		}

	}, false);

	xhr.addEventListener("error", function () {
		// Do nothing
	}, false);

	try {
		xhr.open("GET", "http://peaceful-harbor-3258.herokuapp.com/api/config.json?key=" + localStorage.api_key, false);
		xhr.send();
	} catch (e) {
		// Do nothing
	}
};

var init = (function () {
	"use strict";

	// Init some storage space we need later
	initStorage("firststart");

	initStorage("status");
	initStorage("status_youtube_autounblock", true);

	initStorage("status_cproxy", false);
	initStorage("cproxy_url", "");
	initStorage("cproxy_port", "");

	initStorage("pac_script", "");
	initStorage("api_key", "");

	// Is it the first start? Spam some tabs!
	var firstStart, url, port, xhr;

	firstStart = localStorage.firststart;
	if (firstStart === "true") {
		chrome.tabs.create({
			url: "http://www.personalitycores.com/projects/proxmate"
		});

		chrome.tabs.create({
			url: "https://www.facebook.com/ProxMate/"
		});

		localStorage.firststart = false;
	}

	// Request a proxy from master server & Error handling
	loadExternalConfig();

	// Set the icon color on start
	if (bool(localStorage.status) === false) {
		chrome.browserAction.setIcon({path: "images/icon128_gray.png"});
		chrome.proxy.settings.clear({});
	} else {
		resetProxy();
	}

}());

chrome.browserAction.onClicked.addListener(togglePluginstatus);

chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
	"use strict";
	var config, module, status;

	if (request.action === "setproxy") {
		config = {
			mode: "fixed_servers",
			rules: {
				singleProxy: {
					host: localStorage.proxy_url,
					port: parseInt(localStorage.proxy_port, 10)
				}
			}
		};

		chrome.proxy.settings.set({value: config, scope: 'regular'}, function () {});

		sendResponse({
			status: true
		});
	}

	// ResetProxy to default
	if (request.action === "resetproxy") {
		createPacFromConfig();
		resetProxy();
	}

	if (request.action === "checkStatus") {

		module = request.param;
		status = false;

		switch (module) {
		case "global":
			status = bool(localStorage.status);
			break;
		case "cproxy":
			status = bool(localStorage.status_cproxy);
			break;
		default:
			status = bool(localStorage[module]);
			break;
		}

		sendResponse({
			enabled: status
		});
	}

});
