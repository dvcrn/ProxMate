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
		console.info("Creating PageMod " + script);
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
		console.info("Init Storage for " + str);
		if (val === undefined) {
			val = true;
		}

		if (localStorage[str] === undefined) {
			localStorage[str] = val;
		}

		console.info("Storage Value: " + localStorage[str]);
	}

	// Listener
	var initListeners = function(worker) {		
		console.info("init Listeners");

		worker.port.on('createTab', function(data) {
			var url = data.param;
			require("tab-browser").addTab(url);
		});

		worker.port.on('setproxy', 
			function(data) {
				console.info("in der Set Proxy ");
				var responseHash = data.hash;

				var cproxy = preferences.prefs["status_cproxy"];
				if (cproxy) 
				{
					console.info("CUstom Proxy Detected");
					var url = preferences.prefs["cproxy_url"];
					var port = preferences.prefs["cproxy_port"];

					console.info("Eigener Proxy gesetzt " + url + ":" + port);
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
				console.info("In der resetProxy");
				var responseHash = data.hash;

				require("preferences-service").reset("network.proxy.type");
				require("preferences-service").reset("network.proxy.http");
				require("preferences-service").reset("network.proxy.http_port");
			}
		);

		// checkStatus wird aufgerufen um den Status des Addons und der einzelnen Module zu überprüfen
		worker.port.on('checkStatus', function(data) {
			console.info("CheckStatus ausgeführt. Param: " + data.param);

			var module = data.param;
			var status = false;
			var responseHash = data.hash;

			switch(module) {
				case "global":
					var status = localStorage["status"];
					console.info("Status: " + status);
					break;
				case "youtube_video":
					var status = preferences.prefs["status_youtube_video"];
					console.info("Status: " + status);
					break;
				case "youtube_search":
					var status = preferences.prefs["status_youtube_search"];
					console.info("Status: " + status);
					break;
				case "youtube_channel":
					var status = preferences.prefs["status_youtube_channel"];
					console.info("Status: " + status);
					break;
				case "grooveshark": 
					var status = preferences.prefs["status_grooveshark"];
					console.info("Status: " + status);
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
		console.info("init");

		// Storage für den ersten Start initialisieren
		initStorage("firststart");

		// Initialisieren des Storages
		initStorage("status");

		// Schauen ob der User das Plugin zum ersten mal verwendet
		var firstStart = localStorage["firststart"];

		console.info("FIrst Start: " + firstStart);

		if (firstStart == true) {
			console.info("First Start detected");

			require("tab-browser").addTab("http://www.personalitycores.com/projects/proxmate/");

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
