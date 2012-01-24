var sendAction = function(actionString, uri, reload) {
	self.port.emit(actionString, {"uri": encodeURI(uri),"reload":reload});
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