///////////////////////////////////////////////
//------------Initialisation-----------------//
///////////////////////////////////////////////
var localStoragePath;
var enabled;
var sendActionDefer;
self.port.emit('getstorage'); //This is called to set the local Storage Path

///////////////////////////////////////////////
//------------Event Listeners----------------//
///////////////////////////////////////////////
self.port.on('localstorage', function(data) {
	localStoragePath = data;
});

self.port.on('enableStatus', function(data) {
	enabled = data;
	sendActionDefer.response = {'enabled': enabled.toString()};
	sendActionDefer.resolve();
});

self.port.on('proxy-set', function(data) {
	if (data.reload) {
		window.location = data.uri;		
		document.location.reload();	
	} else {
		document.location = data.uri;	
	}
});



///////////////////////////////////////////////
//------------Global Functions---------------//
///////////////////////////////////////////////

var sendAction = function(actionString, uri, reload) {
	sendActionDefer = $.Deferred();		
	self.port.emit(actionString, {"uri": encodeURI(uri),"reload":reload});
	return sendActionDefer;
}

var getUrlFor = function(file) {
	return localStoragePath + file;
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
	sendAction("setproxy", uri, reload);
}

var resetProxy = function() 
{
	sendAction("resetproxy");
}

var getUrlParam = function(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}