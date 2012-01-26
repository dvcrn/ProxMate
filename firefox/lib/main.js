var widgets = require('widget');
var selfData = require('self').data;
var pageMod = require("page-mod");
var tabs = require('tabs');


var proxyHTTPPref = "network.proxy.http";
var proxyPortPref = "network.proxy.http_port";
var proxyTypePref = "network.proxy.type";
var pageworker = "";

	
exports.main = function() {

	var setProxy = function() {
		require("preferences-service").set(proxyTypePref, 1);
		//console.log("Proxy set to manual");
		require("preferences-service").set(proxyHTTPPref, "proxy.personalitycores.com");
		//console.log("proxy url changed");
		require("preferences-service").set(proxyPortPref, 8000);
		//console.log("proxy port changed");
	}

	var globalResetProxy = function() {
		//console.log("Deleting Proxy Entry");
		require("preferences-service").set(proxyHTTPPref, "");
		require("preferences-service").set(proxyPortPref, 0);
		require("preferences-service").set(proxyTypePref, 5);
		
		//console.log(require("preferences-service").get(proxyHTTPPref));
		//console.log(require("preferences-service").get(proxyPortPref));
		//console.log(require("preferences-service").get(proxyTypePref));
		
		//console.log("globalResetProxy End");
	}	

	var widget = widgets.Widget({
		id: 'toggle-switch',
		label: 'ProxMate',
		contentURL: selfData.url('images/icon-on.png'),
		contentScriptWhen: 'ready',
		contentScriptFile: selfData.url('widget/widget.js')
	});


	 
	widget.port.on('left-click', function() {
		console.log('left click');
	});
	 
	widget.port.on('right-click', function() {
		console.log('right clicked');  
	});
	  
/*
	selfData.url('youtube.js'),
	selfData.url('youtube-channel.js'),
	selfData.url('youtube-search.js')
*/
	  
	var groovesharkSelector = pageMod.PageMod({
		include: ['*.grooveshark.com'],
		contentScriptWhen: 'ready',
		contentScriptFile: [selfData.url('jquery.js'),
							selfData.url('proxy.js'),
							selfData.url('sites/grooveshark.js')
							],
		onAttach: 
			function onAttach(worker) {
				pageworker = worker;
				
				worker.port.emit('enableStatus', true);
				
				worker.port.on('isEnabled',
					function(data) {
						//TODO Implement Local Storage
						worker.port.emit('enableStatus', true);
					}
				);
				
				worker.port.on('setproxy', 
					function(data) {
						//console.log("set Proxy, data: " + data.uri + ", "+ data.reload);
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
						//console.log("reset Proxy, data: " + data);
						globalResetProxy();
					}
				);
			}//End onAttach
	}); // End groovesharkSelector	  
} // End main

