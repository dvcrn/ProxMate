$(window).unload(resetProxy);

var global = checkStatus("global");

global.done(function() {
	if (global.response.enabled == false)
		return;
	
	$(document).ready(function() {
		// Check for the broken heart
		var broken = $("#heartbroken");
		if (broken.length > 0) {

			// Change text
			$("#content h2").html("ProxMate will unblock Grooveshark now!");

			proxifyUri(window.location, true);
		} else {
			loadBanner();
		}
	});	
});