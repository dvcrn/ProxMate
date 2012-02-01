var selfData = require('self').data;
var pageMod = require("page-mod");
var ss = require("simple-storage");
var { MatchPattern } = require("match-pattern");


var proxyHTTPPref = "network.proxy.http";
var proxyPortPref = "network.proxy.http_port";
var proxyTypePref = "network.proxy.type";

	
exports.main = function() {

	function checkUserProxy() {
		if(
			ss.storage.userProxyHTTP != require("preferences-service").get(proxyHTTPPref) || 
			ss.storage.userProxyPort != require("preferences-service").get(proxyPortPref) || 
			ss.storage.userProxyType != require("preferences-service").get(proxyTypePref)
			) 
		{
				ss.storage.userProxyHTTP = require("preferences-service").get(proxyHTTPPref);
				ss.storage.userProxyPort = require("preferences-service").get(proxyPortPref);
				ss.storage.userProxyType = require("preferences-service").get(proxyTypePref);
		}
	}

	var setProxy = function() {
		
		checkUserProxy();
		if(ss.storage.activeUserProxy) {
			require("preferences-service").set(proxyTypePref, 1);
			require("preferences-service").set(proxyHTTPPref, ss.storage.UserProxyURL);
			require("preferences-service").set(proxyPortPref, ss.storage.UserProxyPort);
		}
		else{
			require("preferences-service").set(proxyTypePref, 1);
			require("preferences-service").set(proxyHTTPPref, "proxy.personalitycores.com");
			require("preferences-service").set(proxyPortPref, 8000);
		}
	}

	var globalResetProxy = function() {
		if(require("preferences-service").get(proxyHTTPPref) == "proxy.personalitycores.com"){
			require("preferences-service").set(proxyHTTPPref, ss.storage.userProxyHTTP);
			require("preferences-service").set(proxyPortPref, ss.storage.userProxyPort);
			require("preferences-service").set(proxyTypePref, ss.storage.userProxyType);
		}
	}	

	function getEnabledStatus() {
		if(ss.storage.enabledStatus == undefined) {
			ss.storage.enabledStatus = true;
		}
		return ss.storage.enabledStatus;
	}
	 
	
	function toggleActivation (){
		ss.storage.enabledStatus = !getEnabledStatus();
		return getEnabledStatus();
	}
	
	if(ss.storage.firstrun == undefined || ss.storage.firstrun == true) {
		var tabBrowser = require("tab-browser");
		tabBrowser.addTab("http://www.personalitycores.com/projects/proxmate/");
		ss.storage.firstrun = false;
		ss.storage.enabled = true;
		ss.storage.userProxyHTTP = require("preferences-service").get(proxyHTTPPref);
		ss.storage.userProxyPort = require("preferences-service").get(proxyPortPref);
		ss.storage.userProxyType = require("preferences-service").get(proxyTypePref);
		
		ss.storage.activeUserProxy = false;
	}
	
	checkUserProxy();
	
	if(ss.storage.activeUserProxy == 'undefined') {
		ss.storage.activeUserProxy = false;
	}
	
	
	var optionsPanel = require("panel").Panel({
		width:215,
		height:160,
		contentURL: selfData.url("options.html"),
		contentScriptFile: [selfData.url('jquery.js'),selfData.url('options.js')]
	});
	
	optionsPanel.port.on('setUserProxy', function(data) {
		ss.storage.activeUserProxy = data.userProxy;
		ss.storage.UserProxyURL = data.url;
		ss.storage.UserProxyPort = data.port;
		
	});
	
	optionsPanel.port.emit('init', {'checked' : ss.storage.activeUserProxy , 'url' : ss.storage.UserProxyURL , 'port' : ss.storage.UserProxyPort});
	 
	var widget = require("widget").Widget({
		id: "open-proxmate-btn",
		label: "Click to Activate/Deactivate Proxmate, Rightclick for Options",
		contentURL: selfData.url("images/icon16.png"),
		contentScriptWhen: 'ready',
		contentScriptFile: selfData.url('optionWidget.js')
	});
	
	widget.panel = optionsPanel;
	
	widget.port.on('left-click', function() {
		if(toggleActivation()){
			widget.contentURL = selfData.url("images/icon16.png");
		}
		else {
			widget.contentURL = selfData.url("images/icon16_gray.png");
		}
	});
	 
	widget.port.on('right-click', function() {
		widget.panel.show();
	});
	
	function initListeners(worker) {				
				worker.port.on('isEnabled',
					function(data) {
						worker.port.emit('enableStatus', getEnabledStatus());
					}
				);
				worker.port.on('setproxy', 
					function(data) {
						setProxy();
						worker.port.emit('proxy-set', data);
					}
				);
				worker.port.on('getstorage',
					function(data) {
						worker.port.emit('localstorage',selfData.url());
					}
				);
				worker.port.on('resetproxy', 
					function(data) {
						globalResetProxy();
					}
				);
			}//End initListeners
	
	var youtube = pageMod.PageMod({
		include: [/.*youtube\.com\/watch.*/],
		contentScriptWhen: 'ready',
		contentScriptFile: [selfData.url('jquery.js'),
							selfData.url('proxy.js'),
							selfData.url('sites/youtube.js')
							],
		onAttach: initListeners
			
	}); 
	
	var ytsearch = pageMod.PageMod({
		include: [/.*youtube\.com\/results.*/],
		contentScriptWhen: 'ready',
		contentScriptFile: [selfData.url('jquery.js'),
							selfData.url('proxy.js'),
							selfData.url('sites/youtube-search.js')
							],
		onAttach: initListeners
			
	}); 
	
	var ytchannel = pageMod.PageMod({
		include: [/.*youtube\.com\/user.*/],
		contentScriptWhen: 'ready',
		contentScriptFile: [selfData.url('jquery.js'),
							selfData.url('proxy.js'),
							selfData.url('sites/youtube-channel.js')
							],
		onAttach: initListeners
			
	}); 
	
	var grooveshark = pageMod.PageMod({
		include: [/.*grooveshark\.com.*/],
		contentScriptWhen: 'ready',
		contentScriptFile: [selfData.url('jquery.js'),
							selfData.url('proxy.js'),
							selfData.url('sites/grooveshark.js')
							],
		onAttach: initListeners
			
	}); 
	
	 
} // End main
