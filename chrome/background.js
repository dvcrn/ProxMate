var pac_config = {};

var bool = function(str){
    if (str.toLowerCase() == 'false') {
       return false;
    } else if (str.toLowerCase() == 'true') {
       return true;
    } else {
       return undefined;
    }
}

// Handler for extension icon click
var togglePluginstatus = function() 
{
	var toggle = localStorage["status"];

	if (toggle == "true") {
		chrome.browserAction.setIcon({path: "images/icon128_gray.png"});

		localStorage["status"] = false;

		// Remove proxy
		chrome.proxy.settings.clear({});
	}
	else
	{
		chrome.browserAction.setIcon({path: "images/icon128.png"});

		localStorage["status"] = true;

		// Start setting the old proxy
		resetProxy();
	}
}

var initStorage = function(str, val) {
	if (val === undefined) {
		val = true;
	}

	if (localStorage[str] === undefined) {
		localStorage[str] = val;
	}
}

var resetProxy = function() {
	var url = "";
	var port = 0;

	if (bool(localStorage["status_cproxy"]))
	{
		url = localStorage["cproxy_url"];
		port = parseInt(localStorage["cproxy_port"]);
	} else {
		url = localStorage["proxy_url"];
		port = parseInt(localStorage["proxy_port"]);
	}

	setProxy(url, port);
}

var setProxy = function(url, port) {
	var pcs;

	// Building a custom pac script dependent on the users options settings
	pcs =	"function FindProxyForURL(url, host) {\n" +
		" if ( " +
		"	url.indexOf('proxmate=active') != -1 ";

	if (bool(localStorage["status_pandora"])) {
		pcs += " || host == 'www.pandora.com'";
	}

	if (bool(localStorage["status_gplay"])) {
		pcs += "|| url.indexOf('play.google.com') != -1";
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
	    function() {});
}

var init = (function() {

	// Init some storage space we need later
	initStorage("firststart");

	initStorage("status");
	initStorage("status_youtube");
	initStorage("status_pandora");
	initStorage("status_grooveshark");
	//initStorage("status_hulu");
	initStorage("status_gplay");

	initStorage("status_youtube_autounblock", false);

	initStorage("status_cproxy", false);
	initStorage("cproxy_url", "");
	initStorage("cproxy_port", "");

	initStorage("proxy_url", "");
	initStorage("proxy_port", "");

	// Is it the first start? Spam some tabs! 
	var firstStart = localStorage["firststart"];

	if (firstStart == "true") {
		chrome.tabs.create(
		{
			url: "http://www.personalitycores.com/projects/proxmate"
		});

		chrome.tabs.create(
		{
			url: "https://www.facebook.com/ProxMate/"			
		});

		localStorage["firststart"] = false;
	}


	var url = "";
	var port = "";

	// Request a proxy from master server & Error handling

	var xhr = new XMLHttpRequest();

	xhr.addEventListener("error", function() {
		url = "proxy.personalitycores.com";
		port = 8000;
	}, false);

	xhr.addEventListener("load", function() {

		var json = xhr.responseText;
		json = JSON.parse(json);

		url = json.url;
		port = json.port;

	}, false);

	try {
		xhr.open("GET","http://direct.personalitycores.com:8000?country=us",false);
		xhr.send();
	}
	catch(e) {
		url = "proxy.personalitycores.com";
		port = 8000;
	}

	// Save the currently assigned proxy for later use
	localStorage["proxy_url"] = url;
	localStorage["proxy_port"] = port; 

	// Set the icon color on start
	if (bool(localStorage["status"]) == false) {
		chrome.browserAction.setIcon({path: "images/icon128_gray.png"});
		chrome.proxy.settings.clear({});
	} else {
		resetProxy();
	}

})();

chrome.browserAction.onClicked.addListener(togglePluginstatus);

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	
	if (request.action == "setproxy") 
	{
		var config = {
			mode: "fixed_servers",
			rules: {
				singleProxy: {
					host: localStorage["proxy_url"],
					port: parseInt(localStorage["proxy_port"])
				}
			}
		}

		chrome.proxy.settings.set({value: config, scope: 'regular'}, function() {});

		sendResponse({
			status: true
		});	
	}

	// ResetProxy to default
	if (request.action == "resetproxy") 
	{
		resetProxy();
	}

	if (request.action == "checkStatus") {
		var module = request.param;
		var status = false;

		switch(module) {
			case "global":
				var status = bool(localStorage["status"]);
				break;
			case "cproxy": 
				var status = bool(localStorage["status_cproxy"]);
				break;
			default: 
				var status = bool(localStorage[module]);
				break;
		}

		sendResponse({
			enabled: status
		});
	}

});
