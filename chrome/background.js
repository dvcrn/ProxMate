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

var togglePluginstatus = function() 
{
	var toggle = localStorage["status"];

	if (toggle == "true") {
		chrome.browserAction.setIcon({path: "images/icon48_gray.png"});

		localStorage["status"] = false;

		// Remove proxy
		chrome.proxy.settings.clear({});
	}
	else
	{
		chrome.browserAction.setIcon({path: "images/icon48.png"});

		localStorage["status"] = true;

		// Start setting the old proxy
		setProxy(localStorage["proxy_url"], localStorage["proxy_port"]);
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

var setProxy = function(url, port) {
	pac_config = {
	  mode: "pac_script",
	  pacScript: {
	    data: "function FindProxyForURL(url, host) {\n" +
	    	  " var pma = url.indexOf('proxmate=active');\n"+
	    	  " var hulu = url.indexOf('hulu.com');\n"+
	          "  if (pma != -1 || host == 'www.pandora.com' || hulu != -1)\n" +
	          "    return 'PROXY "+url+":"+port+"';\n" +
	          "  return 'DIRECT';\n" +
	          "}"
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
		xhr.open("GET","http://127.0.0.1:8080?country=us",false);
		xhr.send();
	}
	catch(e) {
		url = "proxy.personalitycores.com";
		port = 8000;
	}

	// Set the icon color on start
	if (bool(localStorage["status"]) == false) {
		chrome.browserAction.setIcon({path: "images/icon48_gray.png"});
		chrome.proxy.settings.clear({});
	} else {
		setProxy(url, port);
	}

	// Save the currently assigned proxy for later use
	localStorage["proxy_url"] = url;
	localStorage["proxy_port"] = port; 

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
		setProxy(localStorage["proxy_url"], localStorage["proxy_port"]);
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

});
