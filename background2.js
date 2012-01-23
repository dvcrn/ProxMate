console.info("Script loaded");

var setProxy = function() {
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
}

var resetProxy = function() {
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
}

chrome.webRequest.onBeforeRequest.addListener(
	function(details) 
	{ 
		console.info("Calling youtube. Setting proxy. " + details.url);
		setProxy();

		return {
			cancel: false
		}
	},
	{
		urls: ["*://*.youtube.com/watch*","*://*.youtube.com/results*"]
	},
	["blocking"]
);

chrome.webRequest.onAuthRequired.addListener(
	function(details) 
	{
		console.info("Auth Request found");
		if (details.isProxy) 
		{
			console.info("Auth Request is proxy");
			return {
				username: "ytproxy",
				password: "daveproxy"
			}
		}
	}, 
	{
		urls: ["http://proxy.personalitycores.com/"]
	},
	["blocking"]
);

chrome.webRequest.onCompleted.addListener(
	function(details) 
	{
		console.info("Request Completed. Removing proxy");
		setTimeout(resetProxy, 2000);
	}, 
	{
		urls: ["*://*.youtube.com/*"]
	}
);