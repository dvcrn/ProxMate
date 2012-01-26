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

// chrome mag anonyme funktionen nicht, also funktion definieren und direkt aufrufen

var init = function() {

	// Schauen ob der User das Plugin zum ersten mal verwendet
	var firstStart = localStorage["firststart"];

	if (firstStart === undefined || firstStart == "true") {
		chrome.tabs.create(
		{
			url: "http://www.personalitycores.com/projects/proxmate"
		});

		localStorage["firststart"] = false;
	}

	// Status anlegen falls er nicht existiert

	var status = localStorage["status"];
	if (status === undefined) {
		localStorage["status"] = true;
	}

	// Proxy auf System setzen falls einer gesetzt wurde.
	chrome.proxy.settings.clear({});
};

init();

chrome.browserAction.onClicked.addListener(setPluginStatus);

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request.action == "setproxy") 
	{

		var config = {
			mode: "fixed_servers",
			rules: {
				singleProxy: {
					host: "proxy.personalitycores.com",
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
