resetProxy();

var promise = sendAction("isEnabled");
promise.done(function() {

	if (promise.response.enabled != "true") {
		return;
	}

	$(document).ready(function() {
		var hashChange = false;

		var hashWrapper = function() {
			hashChange = true;
		}

		$(window).bind("hashchange", hashWrapper);

		var tick = function() 
		{
			var restricted = $("#playnav-custom-error-message");
			var prestricted = $("#playnav-player-restricted");
			
			var rdisplay = restricted.css("display");
			var pdisplay = prestricted.css("display");

			var isRestricted = true;

			if (rdisplay == "block" && pdisplay == "block") {
				isRestricted = true;
			} else {
				isRestricted = false;
			}


			if (isRestricted) 
			{
				// Change text
				$("#playnav-custom-error-message").html("Blah blah blah not available. <br /> ProxMate will unblock this now!");

				// Wenn sich nur der hash geändert hat wird die seite direkt neu geladen
				if (hashChange) 
				{
					proxifyUri(window.location, true);
				}
				else 
				{
					// Dieses Snippet sollte innerhalb des channels nur einmal ausgefährt werden, da sich nurnoch der hash ändern wird
					proxifyUri(window.location);
				}
			}
		}

		// Unschön, hässlich, und sollte bald entfernt werden!!!!!
		setInterval(tick, 1000);

	});

});