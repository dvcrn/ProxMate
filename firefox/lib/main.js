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
		
		require("preferences-service").set(proxyTypePref, 1);
		require("preferences-service").set(proxyHTTPPref, "proxy.personalitycores.com");
		require("preferences-service").set(proxyPortPref, 8000);
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
	}
	
	checkUserProxy();
	
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
