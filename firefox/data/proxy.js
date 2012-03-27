var getUrlFor = function(file) {
	var dataUri = "resource://jid1-qphd8urtzwjc2a-at-jetpack/proxmate/data/";
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

var createTab = function(url) 
{
	sendAction("createTab", url);
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