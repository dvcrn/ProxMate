var sendAction = function(actionString) {

	var defer = $.Deferred();

	chrome.extension.sendRequest(
		{
			action: actionString
		}, 
		function(response) {
			if (response) 
			{
				// Response zum promise adden, damit später darauf zugegriffen werden kann
				defer.response = response;
				defer.resolve();
			}
		}
	);

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

	var promise = sendAction("setproxy");
	promise.done(function() {

		if (reload) {
			window.location = uri;		
			location.reload();	
		} else {
			window.location = uri;		
		}

	});
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

var getUrlFor = function(file) {
	return chrome.extension.getURL(file);
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