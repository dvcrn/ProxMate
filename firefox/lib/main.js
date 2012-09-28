var selfData = require('self').data;
var pageMod = require("page-mod");
var localStorage = require("simple-storage").storage;
var preferences = require("simple-prefs");
var request = require("request")



exports.main = function() {

	var setPluginStatus = function() 
	{
		var toggle = localStorage["status"];

		if (toggle == true) {
			this.contentURL = selfData.url("images/icon16_gray.png");

			localStorage["status"] = false;

			require("preferences-service").reset("network.proxy.type");
			require("preferences-service").reset("network.proxy.http");
			require("preferences-service").reset("network.proxy.http_port");
		}
		else
		{
			this.contentURL = selfData.url("images/icon16.png");
			localStorage["status"] = true;

			resetProxy();
		}
	}

	var resetProxy = function() {
		var url = "";
		var port = 0;

		if (localStorage["status_cproxy"]) 
		{
			url = preferences.prefs["cproxy_url"];
			port = preferences.prefs["cproxy_port"];
		} else {
			url = localStorage["proxy_url"];
			port = localStorage["proxy_port"];
		}

		setProxy(url, port);
	}

	var setProxy = function(url, port) {
		var hulu = localStorage["status_hulu"];
		var pandora = localStorage["status_pandora"];
		var gplay = localStorage["status_gplay"];

		// Building a custom pac script dependent on the users options settings
		var pcs = 	"function FindProxyForURL(url, host) {\n" +
	          			" if ( "+
	          			"	url.indexOf('proxmate=active') != -1 ";

	          			if (preferences.prefs["status_pandora"]) {
	          				pcs += " || host == 'www.pandora.com'";
	      	  		}
	      	  		if (preferences.prefs["status_hulu"]) {
	          				pcs += " || url.indexOf('hulu.com') != -1 ";
	      	  		}

				if (preferences.prefs["status_gplay"]) {
	          				pcs += "|| url.indexOf('play.google.com') != -1";
	      	  		}

	          			pcs += " )\n" +
	          			"	return 'PROXY "+url+":"+port+"';\n" +
	          			"  return 'DIRECT';\n" +
	          			"}";

	          	// In firefox, the only way of setting a pac script is by retrieving it from a url.
	          	// We are using data urls here to get around that
		var pacurl = "data:text/javascript," + encodeURIComponent(pcs);

		require("preferences-service").set("network.proxy.type", 2);
		require("preferences-service").set("network.proxy.autoconfig_url", pacurl);
	}

	var createPagemod = function(regex, script) 
	{
		return pageMod.PageMod({
			include: [regex],
			contentScriptFile: [
				selfData.url('jquery.js'),
				selfData.url('proxy.js'),
				selfData.url(script)
			],
			onAttach: initListeners
		});
	}

	// Function for initial creating / filling of storages
	var initStorage = function(str, val) {
		if (val === undefined) {
			val = true;
		}

		if (localStorage[str] === undefined) {
			localStorage[str] = val;
		}
	}

	var initListeners = function(worker) {		

		worker.port.on('setproxy', 
			function(data) {
				var responseHash = data.hash;
				var cproxy = preferences.prefs["status_cproxy"];

				if (cproxy) 
				{
					var url = preferences.prefs["cproxy_url"];
					var port = preferences.prefs["cproxy_port"];

					require("preferences-service").set("network.proxy.type", 1);
					require("preferences-service").set("network.proxy.http", url);
					require("preferences-service").set("network.proxy.http_port", port);
				}
				else 
				{
					require("preferences-service").set("network.proxy.type", 1);
					require("preferences-service").set("network.proxy.http", localStorage["proxy_url"]);
					require("preferences-service").set("network.proxy.http_port", localStorage["proxy_port"]);
				}

				worker.port.emit(responseHash, 
				{
					success: true
				});
			}
		);

		worker.port.on('resetproxy', 
			function(data) {
				var responseHash = data.hash;

				resetProxy();
				
				worker.port.emit(responseHash, {success: true});
			}
		);

		// function for checking modul statuses in pagemods
		worker.port.on('checkStatus', function(data) {

			var module = data.param;
			var status = false;
			var responseHash = data.hash;

			switch(module) {
				case "global":
					var status = localStorage["status"];
					break;
				case "cproxy": 
					var status = preferences.prefs["status_cproxy"];
					break;
				default:
					var status = preferences.prefs[module];
			}

			worker.port.emit(responseHash, 
				{
					enabled: status
				}
			);

		
		});

		// Function used for making ajax calls in pagemods
		worker.port.on("loadResource", function(data) {
			var url = data.param;
			var responseHash = data.hash;

			console.info("Loading resource: " + url);

			require("request").Request({
			  url: url,
			  onComplete: function(response)
			  {
			  	worker.port.emit(responseHash, { response: response.text })
			  }
			}).get();
		});
	}

	var init = (function() {

		initStorage("firststart");
		initStorage("status");

		var firstStart = localStorage["firststart"];

		// Get proxy from proxybalancer. Will be set async
		localStorage["proxy_url"] = "proxy.personalitycores.com";
		localStorage["proxy_port"] = 8000;

		request.Request({
			url: "http://direct.personalitycores.com:8000?country=us",
			onComplete: function(response)
			{
				localStorage["proxy_url"] = response.json.url;
				localStorage["proxy_port"] = response.json.port;
				resetProxy();
			}
		}).get();


		if (firstStart == true) {

			require("tab-browser").addTab("http://www.personalitycores.com/projects/proxmate/");
			require("tab-browser").addTab("https://www.facebook.com/pages/ProxMate/319835808054609");

			localStorage["firststart"] = false;
		}

		
		createPagemod(/.*personalitycores\.com\/projects\/proxmate/, 'sites/personalitycores.js');
		createPagemod(/^.*\/\/(?:.*\.)?grooveshark\.com(?:\/.*)?$/, 'sites/grooveshark.js');
		createPagemod(/.*youtube\.com\/results.*/, 'sites/youtube-search.js');
		createPagemod(/.*hulu\.com\/.*/, 'sites/hulu.js');
		createPagemod(/.*youtube\.com\/watch.*/, 'sites/youtube.js');
		createPagemod(/.*play\.google\.com\/.*/, 'sites/gplay.js');
		createPagemod(/.*pandora\.com\/.*/, 'sites/pandora.js');

		resetProxy();
	})();
 
	// Widget initialisieren
	var statusButton = require("widget").Widget({
		id: "open-proxmate-btn",
		label: "Click to Activate/Deactivate Proxmate",
		contentURL: selfData.url("images/icon16.png"),
		onClick: setPluginStatus
	});
	
	if (localStorage["status"] == true) { statusButton.contentURL = selfData.url("images/icon16.png"); }
	else { statusButton.contentURL = selfData.url("images/icon16_gray.png"); }
}

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