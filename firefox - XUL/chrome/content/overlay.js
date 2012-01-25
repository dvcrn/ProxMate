/*
Licenced under CC BY-NC-ND 3.0 http://creativecommons.org/licenses/by-nc-nd/3.0/
*/
window.addEventListener("load", function() {proxmate.init()}, false);

function testme() {
	alert('OH YEAH!!!!!!!!!!!!!!!!!');
}

function myListener(e) {
   alert("data:" + e.target.getAttribute("application_state"));
}

function on_specialpage_load(event) {
  if (event.originalTarget instanceof HTMLDocument) {

    var evdoc=event.originalTarget;
    evdoc.addEventListener("MyExtensionEvent", myListener, false, true);
  }
}
gBrowser.addEventListener("DOMContentLoaded",on_specialpage_load,false);
window.addEventListener("load", on_specialpage_load, false);

if ("undefined" == typeof(proxmate)) {
var proxmate = {
	init: function() {
		
		 var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		 var branch = prefs.getBranch("extensions.proxmate.");
	     var appcontent = document.getElementById("appcontent");
	     if(appcontent){appcontent.addEventListener("DOMContentLoaded", proxmate.onPageLoad, true);}
		 if (document.getElementById("proxButton") || branch.getIntPref('intpref_firststart') == 0) return;
		 try{
			 var firefoxnav = document.getElementById("nav-bar");
			 var curSet = firefoxnav.currentSet;
			 if (curSet.indexOf("proxButton") == -1)
			 {
				 var set = curSet + ",proxButton";
				 firefoxnav.setAttribute("currentset", set);
				 firefoxnav.currentSet = set;
				 document.persist("nav-bar", "currentset");
				 branch.setIntPref('intpref_firststart', 0);
			 }
		 }catch(e) { }
		 setTimeout("proxmate.showfb();", 1000);
	},
	showfb: function() {
		gBrowser.addTab('http://www.personalitycores.com/projects/proxmate'); //show Proxmate page on first start
	},
	proxyPrefs: Components.classes["@mozilla.org/preferences-service;1"].
					getService(Components.interfaces.nsIPrefService).
					getBranch("network.proxy."),
	addonPrefs: Components.classes["@mozilla.org/preferences-service;1"].
	                getService(Components.interfaces.nsIPrefService).
					getBranch("extensions.proxmate."),
	onLoad: function() {
		
		this.initialized = true;
		this.strings = document.getElementById("proxmate-strings");
	},
  	onPageLoad: function(aEvent) {
		
		var stringsBundle = document.getElementById("proxmate-strings");
		var clickto1 = stringsBundle.getString('clickto1');
		var clickto2 = stringsBundle.getString('clickto2');
		var followme = stringsBundle.getString('followme');
		var loadingstr = stringsBundle.getString('loading');
		var helpstr = stringsBundle.getString('help');
		var contactstr = stringsBundle.getString('contact');
		var askpermission = stringsBundle.getString('askpermission');
		var nopermission = stringsBundle.getString('nopermission');
		var errormsgstr = stringsBundle.getString('error');
		var httpsstr = stringsBundle.getString('https');
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		var branch = prefs.getBranch("extensions.proxmate.");
		var prefs2 = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		var branch2 = prefs.getBranch("network.proxy.");
		if (branch.getIntPref('intpref_status') == 1){
			try {
				document.getElementById('proxButton').setAttribute("class", "toolbarbutton-1 ButtonOn");
				document.getElementById('proxButton').setAttribute("tooltiptext", clickto1);
			}catch (e){}
			var doc = aEvent.originalTarget;
			
			
			if (doc.domain == "grooveshark.com") {
				var service = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
			
				service.loadSubScript("chrome://proxmate/content/test.js", doc);
				
			}
			
			
			if(doc.domain == 'www.youtube.com' && doc.location.href.search("video=unblocked") > -1 && doc.getElementById('watch-description-extra-info')){
				doc.getElementById('watch-description-extra-info').innerHTML += '<table><tr><td><iframe scrolling="no" frameborder="0" class="twitter-follow-button" allowtransparency="true" src="http://platform.twitter.com/widgets/follow_button.html#_=1316191600351&amp;align=&amp;button=blue&amp;id=twitter_tweet_button_0&amp;lang=en&amp;link_color=&amp;screen_name=maltegoetz&amp;show_count=false&amp;show_screen_name=false&amp;text_color=" style="width: 61px; height: 20px;" title=""></iframe></td><td><span style="color:#666666; font-size:0.9166em; display:block;">' + followme + '</span></td></tr></table>';
			}
			if(doc.domain == 'www.youtube.com' && doc.location.href.search("video=unblocked&video=unblocked&video=unblocked") <= -1 ){
				if(doc.getElementById('unavailable-message') || doc.getElementById('playnav-custom-error-message').style.display == 'block'){
					var vid = doc.location.href.replace('youtube.com/', '');
					if(vid.search('http://') > -1) vid = vid.replace('http://','');
					if(vid.search('https://') > -1){
						vid = vid.replace('https://','');
						var response = branch.getBoolPref('boolpref_showsslnotf');
						if(response == false){
							response = confirm(httpsstr);
							if(response == false){
								return
							}
						}
					}
					if(vid.search('www.') > -1) vid = vid.replace('www.', '');
					try{
						doc.getElementById('watch-player-unavailable-icon-container').innerHTML = '<img src="http://yt.maltegoetz.de/waitajax.gif">';
						doc.getElementById('unavailable-submessage').innerHTML = loadingstr;
					}catch(e){
						doc.getElementById('playnav-custom-error-message').innerHTML = loadingstr + '<br /><img src="http://yt.maltegoetz.de/waitajax2.gif">';
					}
					httpRequest = new XMLHttpRequest();
					httpRequest.onreadystatechange = function(){
						if (httpRequest.readyState === 4) {
							if (httpRequest.status === 200) {
								var serverresponsexml = httpRequest.responseXML;
								var serverresponse = serverresponsexml.getElementsByTagName("proxymsg")[0];
								var responsestring = serverresponse.childNodes[0].nodeValue;
								var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);  
								var browserEnumerator = wm.getEnumerator("navigator:browser");
								var browserWin = browserEnumerator.getNext();
								var tabbrowser = browserWin.gBrowser;
								var numTabs = tabbrowser.browsers.length;
								var tabclosed = true;
								//if the tab is already closed stop setting the proxy & return
								for (var index = 0; index < numTabs; index++) {
									var currentBrowser = tabbrowser.getBrowserAtIndex(index);
									if ('http://www.youtube.com/' + vid == currentBrowser.currentURI.spec) {tabclosed = false;}
								}
								if(tabclosed == true){return;}
								if (responsestring.search('msg:') > -1){
									try{		
										doc.getElementById('watch-player-unavailable-icon-container').innerHTML = '<img src="//s.ytimg.com/yt/img/meh-vflQF1ybI.png">';
										doc.getElementById('unavailable-message').innerHTML = responsestring.replace('msg:','');
										doc.getElementById('unavailable-submessage').innerHTML = helpstr + ' <a href="http://yt.maltegoetz.de/faq" target="_blank">'+contactstr+'</a>.';
									}catch(e){
										doc.getElementById('playnav-custom-error-message').innerHTML = responsestring.replace('msg:','');
									}
									return
								}
								var answer = branch.getBoolPref('boolpref_shownotf');
								if(answer != true){answer = confirm (askpermission);}
								if (answer){
									var wholeproxy = responsestring.split(':');
									branch.setCharPref('stringpref_http', branch2.getCharPref('http'));
									branch.setCharPref('stringpref_ssl', branch2.getCharPref('ssl'));
									branch.setCharPref('stringpref_ftp', branch2.getCharPref('ftp'));
									branch.setCharPref('stringpref_socks', branch2.getCharPref('socks'));
									branch.setIntPref('intpref_http', branch2.getIntPref('http_port'));
									branch.setIntPref('intpref_ssl', branch2.getIntPref('ssl_port'));
									branch.setIntPref('intpref_ftp', branch2.getIntPref('ftp_port'));
									branch.setIntPref('intpref_socks', branch2.getIntPref('socks_port'));
									branch.setIntPref('intpref_enabled', branch2.getIntPref('type'));
									branch.setBoolPref('boolpref_share', branch2.getBoolPref('share_proxy_settings'));
									branch2.setIntPref('type',1);
									branch2.setCharPref('http', wholeproxy[0]);
									branch2.setIntPref('http_port', wholeproxy[1]);
									var info;
									if(doc.location.href.search("\\?")  > -1){ info = "&video=unblocked";}else{info = "?video=unblocked";}
									doc.location.href = 'http://youtube.com/' + vid + info;
									try{document.getElementById('proxButton').setAttribute("class", "toolbarbutton-1 ButtonOn");}catch (e){}
									doc.defaultView.addEventListener("unload", function(event){ proxmate.onPageUnload(event); }, true);
								}else{
									try{
										doc.getElementById('watch-player-unavailable-icon-container').innerHTML = '<img src="//s.ytimg.com/yt/img/meh-vflQF1ybI.png">';
										doc.getElementById('unavailable-submessage').innerHTML = nopermission;
									}catch(e){
										doc.getElementById('playnav-custom-error-message').innerHTML = nopermission;
									}
								}
							}else{
								try{
									doc.getElementById('watch-player-unavailable-icon-container').innerHTML = '<img src="//s.ytimg.com/yt/img/meh-vflQF1ybI.png">';
									doc.getElementById('unavailable-submessage').innerHTML = errormsgstr;
								}catch(e){
									doc.getElementById('playnav-custom-error-message').innerHTML = errormsgstr;
								}
							}
						}
					};
					httpRequest.open('GET', 'https://seonhosting.de/malte/yt/proxy_v2.php?vid='+escape(vid)+"&version=1.3.4");
					httpRequest.send();
				}
			}
		}else{
			 try {
				 document.getElementById('proxButton').setAttribute("class", "toolbarbutton-1 ButtonOff");
				 document.getElementById('proxButton').setAttribute("tooltiptext", clickto2);
			 }catch(e){}
		}
	},
	  onPageUnload: function(aEvent) {
		  var doc = aEvent.originalTarget;
		  this.proxyPrefs.setCharPref('http', this.addonPrefs.getCharPref('stringpref_http'));
		  this.proxyPrefs.setCharPref('ssl', this.addonPrefs.getCharPref('stringpref_ssl'));
		  this.proxyPrefs.setCharPref('ftp', this.addonPrefs.getCharPref('stringpref_ftp'));
		  this.proxyPrefs.setCharPref('socks', this.addonPrefs.getCharPref('stringpref_socks'));
		  this.proxyPrefs.setIntPref('http_port', this.addonPrefs.getIntPref('intpref_http'));
		  this.proxyPrefs.setIntPref('ssl_port', this.addonPrefs.getIntPref('intpref_ssl'));
		  this.proxyPrefs.setIntPref('ftp_port', this.addonPrefs.getIntPref('intpref_ftp'));
		  this.proxyPrefs.setIntPref('socks_port', this.addonPrefs.getIntPref('intpref_socks'));
		  this.proxyPrefs.setIntPref('type', this.addonPrefs.getIntPref('intpref_enabled'));
		  this.proxyPrefs.setBoolPref('share_proxy_settings', this.addonPrefs.getBoolPref('boolpref_share'));
		  
	  },
  onMenuItemCommand: function(e) {
	  var stringsBundle = document.getElementById("proxmate-strings");
	  var clickto1 = stringsBundle.getString('clickto1');
	  var clickto2 = stringsBundle.getString('clickto2');
	  var integ;
	  if (this.addonPrefs.getIntPref('intpref_status') == 0){
		  document.getElementById('proxButton').setAttribute("class", "toolbarbutton-1 ButtonOn");
		  document.getElementById('proxButton').setAttribute("tooltiptext", clickto1);
		  integ = 1;
	  }else{
		  document.getElementById('proxButton').setAttribute("class", "toolbarbutton-1 ButtonOff");
		  document.getElementById('proxButton').setAttribute("tooltiptext", clickto2);
		  integ = 0;
	  }
	  this.addonPrefs.setIntPref('intpref_status', integ);
  },
  onToolbarButtonCommand: function(e) {
	  proxmate.onMenuItemCommand(e);
  }
};

}
