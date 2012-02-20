var selfData = require('self').data;
var pageMod = require("page-mod");
var localStorage = require("simple-storage").storage;
var { MatchPattern } = require("match-pattern");
var preferences = require("simple-prefs");



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
					require("preferences-service").set("network.proxy.http", "proxy.personalitycores.com");
					require("preferences-service").set("network.proxy.http_port", 8000);
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

				require("preferences-service").reset("network.proxy.type");
				require("preferences-service").reset("network.proxy.http");
				require("preferences-service").reset("network.proxy.http_port");
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
				case "youtube_video":
					var status = preferences.prefs["status_youtube_video"];
					break;
				case "youtube_search":
					var status = preferences.prefs["status_youtube_search"];
					break;
				case "youtube_channel":
					var status = preferences.prefs["status_youtube_channel"];
					break;
				case "grooveshark": 
					var status = preferences.prefs["status_grooveshark"];
					break;
			}

			worker.port.emit(responseHash, 
				{
					enabled: status
				}
			);
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


		if (firstStart == true) {

			require("tab-browser").addTab("http://www.personalitycores.com/projects/proxmate/");
			require("tab-browser").addTab("https://www.facebook.com/pages/ProxMate/319835808054609");

			localStorage["firststart"] = false;
		}

		// Widget initialisieren
		require("widget").Widget({
			id: "open-proxmate-btn",
			label: "Click to Activate/Deactivate Proxmate",
			contentURL: selfData.url("images/icon16.png"),
			onClick: setPluginStatus
		});

		createPagemod(/.*personalitycores\.com\/projects\/proxmate.*/, 'sites/personalitycores.js');
		createPagemod(/.*grooveshark\.com.*/, 'sites/grooveshark.js');
		createPagemod(/.*youtube\.com\/watch.*/, 'sites/youtube.js');
		createPagemod(/.*youtube\.com\/results.*/, 'sites/youtube-search.js');
		createPagemod(/.*youtube\.com\/user.*/, 'sites/youtube-channel.js');
	})();
	 
}
