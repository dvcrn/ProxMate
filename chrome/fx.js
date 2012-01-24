var sendAction = function(actionString, uri, reload) {

	chrome.extension.sendRequest(
		{
			action: actionString
		}, 
		function(response) {
			if (response.status) 
			{
				// Proxy is set
				if (reload) {
					window.location = uri;		
					location.reload();	
				} else {
					window.location = uri;		
				}
				
			}
			else 
			{
				// Proxy is gone
			}
	  		return response.status;
		}
	);
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