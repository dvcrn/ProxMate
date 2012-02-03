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

	// Checkt ob das Tool zum ersten mal gestartet wurde
	initStorage("firststart");

	// Prüft ob die jeweiligen storageVariablen gesetzt sind. Fall nein werden sie mit true initialisiert
	initStorage("status");
	initStorage("status_youtube_video");
	initStorage("status_youtube_channel");
	initStorage("status_youtube_search");
	initStorage("status_grooveshark");

	// Eigenen proxy im localStorage anlegen um mögliche fehler zu beseitigen
	initStorage("status_cproxy", false);
	initStorage("cproxy_url", "");
	initStorage("cproxy_port", "");


	// Schauen ob der User das Plugin zum ersten mal verwendet
	var firstStart = localStorage["firststart"];

	if (firstStart == "true") {
		chrome.tabs.create(
		{
			url: "http://www.personalitycores.com/projects/proxmate"
		});

		localStorage["firststart"] = false;
	}

	// Proxy auf System setzen falls einer gesetzt wurde.
	chrome.proxy.settings.clear({});
})();

chrome.browserAction.onClicked.addListener(setPluginStatus);

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request.action == "setproxy") 
	{

		var config = {
			mode: "fixed_servers",
			rules: {
				singleProxy: {
					host: "nightbug.personalitycores.com",
					port: 8000
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
			status: false
		});	
	}

	// Statusabfrage ob das Plugin enabled oder disabled ist
	if (request.action == "isEnabled")
	{
		var status = localStorage["status"];
		sendResponse({
			enabled: status
		});
	}
});
