var setPluginStatus = function() 
{
	var toggle = localStorage["status"];

	console.info("Toggle: " + toggle);

	// Wenn Toggle = False ist, das icon farbig machen
	if (toggle == "true") {
		chrome.browserAction.setIcon({
			path: "images/icon48_gray.png"
		});

		localStorage["status"] = false;
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
	var firstStart = localStorage["firststart"];
	console.info("FirstStart: " + firstStart);

	if (firstStart === undefined || firstStart == "true") {
		chrome.tabs.create(
		{
			url: "http://www.personalitycores.com/projects/proxmate"
		});

		localStorage["firststart"] = false;
	}

	var status = localStorage["status"];
	if (status === undefined) {
		status = true;
	}
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
		var config = {
			mode: "system"
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
