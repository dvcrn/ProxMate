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

var setPluginStatus = function() 
{
	var toggle = localStorage["status"];


	// Wenn Toggle = False ist, das icon farbig machen
	if (toggle == "true") {
		chrome.browserAction.setIcon({
			path: "images/icon48_gray.png"
		});

		localStorage["status"] = false;
		chrome.proxy.settings.clear({});
	}
	else
	{
		chrome.browserAction.setIcon({
			path: "images/icon48.png"
		});

		localStorage["status"] = true;
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


var init = (function() {

	// Init some storage space we need later
	initStorage("firststart");

	initStorage("status");
	initStorage("status_statistics");
	initStorage("country", "xx");

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

	// Request a proxy from master server
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
		xhr.open("GET","http://127.0.0.1:8080?country=us",false);
		xhr.send();
	}
	catch(e) {
		url = "proxy.personalitycores.com";
		port = 8000;
	}

	pac_config = {
	  mode: "pac_script",
	  pacScript: {
	    data: "function FindProxyForURL(url, host) {\n" +
	    	  " var test = url.indexOf('proxmate=active');\n"+
	          "  if (test != -1)\n" +
	          "    return 'PROXY "+url+":"+port+"';\n" +
	          "  return 'DIRECT';\n" +
	          "}"
	  }
	};

	chrome.proxy.settings.set(
	    {value: pac_config, scope: 'regular'},
	    function() {});

	localStorage["proxy_url"] = url;
	localStorage["proxy_port"] = port; 

})();

chrome.browserAction.onClicked.addListener(setPluginStatus);

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request.action == "setproxy") 
	{

		var randomProxy = getRandomProxy("live");
		var uri = randomProxy[0];
		var port = randomProxy[1];
		
		var pageuri = request.param;

		// Ping server for statistics if allowed
		var allow_statistics = bool(localStorage["status_statistics"]);
		if (allow_statistics) {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", 'http://www.personalitycores.com/projects/proxmate/callback/?u=' + encodeURIComponent(pageuri) + "&b=chrome", true);
			xhr.send();
		}


		// Prüfen ob ein eigener Proxy gesetzt wurde
		if (bool(localStorage["status_cproxy"])) {

			uri = localStorage["cproxy_url"];
			port = localStorage["cproxy_port"];
		}

		var config = {
			mode: "fixed_servers",
			rules: {
				singleProxy: {
					host: uri,
					port: parseInt(port)
				}
			}
		}

		chrome.proxy.settings.set(
			{
				value: config, 
				scope: 'regular'
			},
			function() {
				
			}
		);

		sendResponse({
			status: true
		});	
	}

	// Zurücksetzen des Proxies
	if (request.action == "resetproxy") 
	{
		chrome.proxy.settings.clear({});
		sendResponse({
			status: true
		});	
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
		}

		sendResponse({
			enabled: status
		});
	}

	if (request.action == "muh") {

	}
});
