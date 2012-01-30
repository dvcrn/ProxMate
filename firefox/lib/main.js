var widgets = require('widget');
var selfData = require('self').data;
var pageMod = require("page-mod");
var tabs = require('tabs');
var ss = require("simple-storage");
var { MatchPattern } = require("match-pattern");
var analytics = require('gajs');
var btn;
var {Cc, Ci} = require("chrome");
var mediator = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);


var proxyHTTPPref = "network.proxy.http";
var proxyPortPref = "network.proxy.http_port";
var proxyTypePref = "network.proxy.type";



	
exports.main = function() {

	function addToolbarButton() {
		var document = mediator.getMostRecentWindow("navigator:browser").document;      
		var navBar = document.getElementById("nav-bar");
		if (!navBar) {
			return;
		}
		
		btn = document.createElement("toolbarbutton");  

		btn.setAttribute('type', 'button');
		btn.setAttribute('class', 'toolbarbutton-1');
		btn.setAttribute('id', 'proxmatebutton');
		btn.setAttribute('image', selfData.url('images/icon16.png')); // path is relative to data folder
		btn.setAttribute('orient', 'horizontal');
		btn.setAttribute('tooltiptext', 'Turn Proxmate On/Off');
		btn.setAttribute('label', 'Proxmate');
		btn.addEventListener('click', function() {
			// use tabs.activeTab.attach() to execute scripts in the context of the browser tab
			if(toggleActivation()) {
				btn.setAttribute('image', selfData.url('images/icon16.png'));
			}else{
				btn.setAttribute('image', selfData.url('images/icon16_gray.png'));
			}
		}, false)
		navBar.appendChild(btn);
	}

	var setProxy = function() {
		require("preferences-service").set(proxyTypePref, 1);
		//console.log("Proxy set to manual");
		require("preferences-service").set(proxyHTTPPref, "proxy.personalitycores.com");
		//console.log("proxy url changed");
		require("preferences-service").set(proxyPortPref, 8000);
		//console.log("proxy port changed");
		console.log("Proxy Set");
	}

	var globalResetProxy = function() {
		//console.log("Deleting Proxy Entry");
		
		if(require("preferences-service").get(proxyHTTPPref) == "proxy.personalitycores.com"){
			require("preferences-service").set(proxyHTTPPref, "");
			require("preferences-service").set(proxyPortPref, 0);
			require("preferences-service").set(proxyTypePref, 5);
			console.log("Proxy Resetted");
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
		//Switch icons
		return getEnabledStatus();
	}
	
	//Actions for First run
	if(ss.storage.firstrun == undefined || ss.storage.firstrun == true) {
		//Open New Browser Tab To Proxmate Page
		var tabBrowser = require("tab-browser");
		tabBrowser.addTab("http://www.personalitycores.com/projects/proxmate/");
		
		//Init Variables
		ss.storage.firstrun = false;
		ss.storage.enabled = true;
	}
	
	addToolbarButton();
	analytics.gaTrack('UA-28532981-1', 'yoursite.com', 'main.js');
	  
	function initListeners(worker) {				
				console.log('initialising');
				worker.port.on('isEnabled',
					function(data) {
						worker.port.emit('enableStatus', getEnabledStatus());
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

function removeToolbarButton() {
	// this document is an XUL document
	var document = mediator.getMostRecentWindow('navigator:browser').document;		
	var navBar = document.getElementById('nav-bar');
	var btn = document.getElementById('proxmatebutton');
	if (navBar && btn) {
		navBar.removeChild(btn);
	}
}

// exports.onUnload is called when Firefox starts and when the extension is disabled or uninstalled
exports.onUnload = function(reason) {
	removeToolbarButton();
};
