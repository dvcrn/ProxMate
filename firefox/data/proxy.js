var getUrlFor = function(file) {
	var dataUri = "resource://proxmate-at-dave-dot-cx/proxmate/data/";
	return dataUri + file;
}

var randomString = function(length) {
	var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

	if (! length) {
		length = Math.floor(Math.random() * chars.length);
	}

	var str = '';
	for (var i = 0; i < length; i++) {
		str += chars[Math.floor(Math.random() * chars.length)];
	}
	return str;
}

var loadResource = function(url) {
	return sendAction("loadResource", url);
}

var addListener = function(event, defer) {
	self.port.on(event, function(data) {
		defer.response = data;
		defer.resolve();
	});
}

var sendAction = function(actionString, param) {
	if (param === undefined) {
		param = null;
	}

	var defer = $.Deferred();
	var hash = randomString();

	self.port.emit(actionString, 
		{
			param: param,
			hash: hash
		}
	);

	addListener(hash, defer);

	return defer;
}

var proxifyUri = function(uri, reload) 
{
	if (reload === undefined)
	{
		reload = false;
	}
	else
	{
		reload = true;
	}
	
	var promise = sendAction("setproxy", encodeURI(window.location.href));
	
	promise.done(function() {
		if (reload) {
			document.location = uri;		
			document.location.reload();	
		} else {
			document.location = uri;		
		}
	});
}

var resetProxy = function() 
{
	var promise = sendAction("resetproxy");
}

var getUrlParam = function(name) {
	return decodeURI(
		(RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
	);
}
var checkStatus = function(module) {
	return sendAction("checkStatus", module);
}

function bool(str){
	if (str.toLowerCase()=='false'){
		return false;
	} else if (str.toLowerCase()=='true'){
		return true;
	} else {
		return undefined;
	}; 
};

var loadOverlay = function(callback) {
	
	// Load the overlay
	$('<link>').attr('rel','stylesheet')
	  .attr('type','text/css')
	  .attr('href',getUrlFor("elements/overlay.css"))
	  .appendTo('head');

	  var resource = loadResource(getUrlFor("elements/overlay.html"));
	  resource.done(function() {
	  	var data = resource.response.response;
	  	console.info("Loaded overlay successfully");
	  	console.log(data);
		$("body").prepend(data);
		$("#pmOverlay").fadeIn("slow");
		$("#pmOverlay").click(function() {
			callback();
		});
	  });
}

var loadBanner = function(callback) {
	(function() {
	    var s = document.createElement('script'), t = document.getElementsByTagName('script')[0];
	    s.type = 'text/javascript';
	    s.async = true;
	    s.src = 'http://api.flattr.com/js/0.6/load.js?mode=auto';
	    t.parentNode.insertBefore(s, t);
	})();

	// Load the overlay
	$('<link>').attr('rel','stylesheet')
	  .attr('type','text/css')
	  .attr('href',getUrlFor("elements/overlay.css"))
	  .appendTo('head');

	  var resource = loadResource(getUrlFor("elements/banner.html"));
	  resource.done(function() {
	  	var data = resource.response.response;
		$("body").append(data);
		$("#pmBanner").fadeIn("slow");
		
		$("#pmBannerClose").click(function() {
			$("#pmBanner").fadeOut("slow", function() {
				$("#pmPusher").slideUp("slow");
			});
		});

		setTimeout(function() {
			$("#pmBanner").addClass("smallBanner");
		}, 5000);


	});
}