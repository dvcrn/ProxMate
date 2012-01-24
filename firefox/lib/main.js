var widgets = require('widget');
var data = require('self').data;
var pageMod = require("page-mod");
var tabs = require('tabs');


var proxyHTTPPref = "network.proxy.http";
var proxyPortPref = "network.proxy.http_port";
var proxyTypePref = "network.proxy.type";
var pageworker = "";
	
exports.main = function() {

	

var globalProxifyUri = function(uri,reload) {
	
	//console.log("globalProxifyUri Start");
	
	require("preferences-service").set(proxyTypePref, 1);
	//console.log("Proxy set to manual");
	require("preferences-service").set(proxyHTTPPref, "proxy.personalitycores.com");
	//console.log("proxy url changed");
	require("preferences-service").set(proxyPortPref, 8000);
	//console.log("proxy port changed");
	
	//console.log(require("preferences-service").get(proxyHTTPPref));
	//console.log(require("preferences-service").get(proxyPortPref));
	//console.log(require("preferences-service").get(proxyTypePref));
	
	tabs.activeTab.url = uri;
	
	//pageworker.port.emit('reloadUri', {"uri": encodeURI(uri),"reload":reload}); 
	
	//console.log("globalProxifyUri End");
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
    contentURL: data.url('widget/icon.png'),
    contentScriptWhen: 'ready',
    contentScriptFile: data.url('widget/widget.js')
  });
 
  widget.port.on('left-click', function() {
    console.log('left click');

  });
 
  widget.port.on('right-click', function() {
    console.log('right clicked');  
  });
  
	
  var selector = pageMod.PageMod({
	  include: ['*.grooveshark.com', '*.youtube.com'],
	  contentScriptWhen: 'ready',
	  contentScriptFile: [data.url('jquery.js'),
						  data.url('proxy.js'),
						  data.url('grooveshark.js'),
						  data.url('youtube.js'),
						  data.url('youtube-channel.js'),
						  data.url('youtube-search.js')],
		onAttach: function onAttach(worker) {
			console.log("Attaching content scripts");
			pageworker = worker;
			worker.on('message', function(data) {
				console.log(data);
			});
			
			worker.port.on('setproxy', function(data) {
				//console.log("set Proxy, data: " + data.uri + ", "+ data.reload);
				globalProxifyUri(data.uri, data.reload);
			});
			worker.port.on('resetproxy', function(data) {
				//console.log("reset Proxy, data: " + data);
				globalResetProxy();
			});
			
			worker.port.on('reloadUri', function(data) {
				console.log(data.reload + ", "+ data.uri);				
				// Proxy is set
				if (data.reload) {
					document.location = data.uri;		
					document.location.reload();	
				} else {
					document.location = data.uri;		
				}
			});
				
		}
	});
  
}

