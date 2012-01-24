
var sendAction = function(actionString, uri, reload) {
	self.port.emit(actionString, {"uri": encodeURI(uri),"reload":reload});
}

var getUrlFor = function(file) {
	return "resource://jid1-qphd8urtzwjc2a-at-jetpack/proxmate/data/" + file;
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