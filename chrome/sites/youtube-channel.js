resetProxy();

var promise = sendAction("isEnabled");
promise.done(function() {
	if (promise.response.enabled != "true")
		return;

	$(document).ready(function() {
		
		var checkRestricted = function(ignoreBlocked) 
		{
			var ud = $("#playnav-restricted-title-div");
			if (ud.length > 0)
			{
				if (getUrlParam('unblocked') != "true" || ignoreBlocked)
				{
					// Change text
					$("#playnav-custom-error-message").html("Blah blah blah not available. <br /> ProxMate will unblock this now!");

					// This is required to avoid infinite hashchange loop
					if (ignoreBlocked)
					{
						proxifyUri(window.location.href, true);
					}
					else 
					{
						// The proxy is now set. Reload the page :)
						if (getUrlParam('feature') == "true") {
							proxifyUri(window.location + "&unblocked=true");
						} else {
							proxifyUri(window.location + "?unblocked=true");
						}	
					}
				}
				else 
				{
					$("#playnav-custom-error-message").html("There might be a problem with this video :( Try ProxMate again later!");
				}
			}
		}

		var hashWrapper = function() {
			checkRestricted(true);
		}

		checkRestricted(false);

		window.onhashchange = hashWrapper;  

	});

});