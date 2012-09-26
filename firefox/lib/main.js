var selfData = require('self').data;
var pageMod = require("page-mod");
var localStorage = require("simple-storage").storage;
var { MatchPattern } = require("match-pattern");
var preferences = require("simple-prefs");
var request = require("request")



exports.main = function() {

	var setPluginStatus = function() 
	{
		var toggle = localStorage["status"];

		// Wenn Toggle = False ist, das icon farbig machen
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
		}
	}

	var resetProxy = function() {
		var url = "";
		var port = 0;

		if (localStorage["status_cproxy"]) 
		{
			// TODO: Here
		} else {
			url = localStorage["proxy_url"];
			port = localStorage["proxy_port"];
		}

		setProxy(url, port);
	}

	var setProxy = function(url, port) {
		// Bulid PAC script url
		var hulu = localStorage["status_hulu"];
		var pandora = localStorage["status_pandora"];
		var gplay = localStorage["status_gplay"];

		console.info("Setting proxy: " + url + " Port: " + port);

		var pcs = "function FindProxyForURL(url, host) {\n" +
	    	  " var pma = url.indexOf('proxmate=active');\n"+
	    	  " var hulu = url.indexOf('hulu.com');\n"+
	          "  if ( "+
	          "	pma != -1 ";

	          if (preferences.prefs["status_pandora"]) {
	          	pcs += " || host == 'www.pandora.com'";
	      	  }
	      	  if (preferences.prefs["status_hulu"]) {
	          	pcs += " || hulu != -1 ";
	      	  }

			if (preferences.prefs["status_gplay"]) {
	          	pcs += "|| url.indexOf('play.google.com') != -1";
	      	  }

	          pcs += " )\n" +
	          "    return 'PROXY "+url+":"+port+"';\n" +
	          "  return 'DIRECT';\n" +
	          "}";

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

	// Funktion zum ersten initialisieren eines storage
	// Wird verwendet um unnötige wiederholungen zu vermeiden
	var initStorage = function(str, val) {
		if (val === undefined) {
			val = true;
		}

		if (localStorage[str] === undefined) {
			localStorage[str] = val;
		}

	}

	// Listener
	var initListeners = function(worker) {		

		worker.port.on('createTab', function(data) {
			var url = data.param;
			require("tab-browser").addTab(url);
		});

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

		// checkStatus wird aufgerufen um den Status des Addons und der einzelnen Module zu überprüfen
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

			console.info("Requesting status for " + module + ". Status: " + status);

			worker.port.emit(responseHash, 
				{
					enabled: status
				}
			);

		
		});

		worker.port.on("loadResource", function(data) {
			var url = data.param;
			var responseHash = data.hash;

			console.info("Loading resource: " + url);

			require("request").Request({
			  url: url,
			  onComplete: function(response)
			  {
			  	console.info("Loading successful. Giving response to pagemod");
			  	worker.port.emit(responseHash, { response: response })
			  }
			}).get();
		});
	}

	// Init ist eine selbstaufrufende funktion
	// Hier soll der Storage initialisiert werden und anschließend auf firstStart geprüft werden
	var init = (function() {

		// Storage für den ersten Start initialisieren
		initStorage("firststart");

		// Initialisieren des Storages
		initStorage("status");

		// Schauen ob der User das Plugin zum ersten mal verwendet
		var firstStart = localStorage["firststart"];

		// Debug. Später durch auto retrieve setzen
		localStorage["proxy_url"] = "proxy.personalitycores.com";
		localStorage["proxy_port"] = 8000;


		if (firstStart == true) {

			require("tab-browser").addTab("http://www.personalitycores.com/projects/proxmate/");
			require("tab-browser").addTab("https://www.facebook.com/pages/ProxMate/319835808054609");

			localStorage["firststart"] = false;
		}

		// Widget initialisieren
		var statusButton = require("widget").Widget({
			id: "open-proxmate-btn",
			label: "Click to Activate/Deactivate Proxmate",
			contentURL: selfData.url("images/icon16.png"),
			onClick: setPluginStatus
		});
		
		//Initialise Icon With right color
		if (localStorage["status"] == true) { statusButton.contentURL = selfData.url("images/icon16.png"); }
		else { statusButton.contentURL = selfData.url("images/icon16_gray.png"); }

		resetProxy();
		
		createPagemod(/.*personalitycores\.com\/projects\/proxmate/, 'sites/personalitycores.js');
		createPagemod(/^.*\/\/(?:.*\.)?grooveshark\.com(?:\/.*)?$/, 'sites/grooveshark.js');
		createPagemod(/.*youtube\.com\/results.*/, 'sites/youtube-search.js');
		createPagemod(/.*hulu\.com\/.*/, 'sites/hulu.js');
		createPagemod(/.*youtube\.com\/watch.*/, 'sites/youtube.js');
		createPagemod(/.*play\.google\.com\/.*/, 'sites/gplay.js');
		createPagemod(/.*pandora\.com\/.*/, 'sites/pandora.js');
	})();
	 
}
