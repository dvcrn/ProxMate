/*jslint browser: true*/
/*global localStorage, chrome*/
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

var setProxy = function (url, port) {
	"use strict";
	var pcs;

	// Building a custom pac script dependent on the users options settings
	pcs =	"function FindProxyForURL(url, host) {\n" +
		" if ( " +
		"	url.indexOf('proxmate=active') != -1 ";

	if (bool(localStorage.status_pandora)) {
		pcs += " || host == 'www.pandora.com'";
	}

	if (bool(localStorage.status_gplay)) {
		pcs += " || url.indexOf('m.youtube.com/results') != -1 || url.indexOf('ip=109.169.62.156') != -1 || url.indexOf('ip=109.169.80.127') != -1";
	}
	if (bool(localStorage.status_hulu) && bool(localStorage.status_cproxy)) {
		pcs += " || url.indexOf('hulu.com') != -1";
	}

	if (bool(localStorage.status_grooveshark)) {
		pcs += "|| shExpMatch(url, 'http://grooveshark.com*')";
	}

	pcs += " )\n" +
		"	return 'PROXY " + url + ":" + port + "';\n" +
		"return 'DIRECT';\n" +
		"}";

	pac_config = {
		mode: "pac_script",
		pacScript: {
			data: pcs
		}
	};

	chrome.proxy.settings.set(
		{value: pac_config, scope: 'regular'},
		function () {}
	);
};

var resetProxy = function () {
	"use strict";
	var url, port;

	url = "";
	port = 0;

	if (bool(localStorage.status_cproxy)) {
		url = localStorage.cproxy_url;
		port = parseInt(localStorage.cproxy_port, 10);
	} else {
		url = localStorage.proxy_url;
		port = parseInt(localStorage.proxy_port, 10);
	}

	setProxy(url, port);
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

var init = (function () {
	"use strict";

	// Init some storage space we need later
	initStorage("firststart");

	initStorage("status");
	initStorage("status_youtube");
	initStorage("status_pandora");
	initStorage("status_grooveshark");
	initStorage("status_hulu");
	initStorage("status_gplay");

	initStorage("status_youtube_autounblock", true);

	initStorage("status_cproxy", false);
	initStorage("cproxy_url", "");
	initStorage("cproxy_port", "");

	initStorage("proxy_url", "");
	initStorage("proxy_port", "");

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

	url = "";
	port = "";

	// Request a proxy from master server & Error handling

	xhr = new XMLHttpRequest();

	xhr.addEventListener("error", function () {
		url = "proxy.personalitycores.com";
		port = 8000;
	}, false);

	xhr.addEventListener("load", function () {

		var json = xhr.responseText;
		json = JSON.parse(json);

		url = json.url;
		port = json.port;

	}, false);

	try {
		xhr.open("GET", "http://direct.personalitycores.com:8000?country=us", false);
		xhr.send();
	} catch (e) {
		url = "proxy.personalitycores.com";
		port = 8000;
	}

	// Save the currently assigned proxy for later use
	localStorage.proxy_url = url;
	localStorage.proxy_port = port;

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
