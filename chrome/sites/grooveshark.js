resetProxy();
var promise = sendAction("isEnabled");

promise.done(function() {
	if (promise.response.enabled != "true")
		return;

	$(document).ready(function() {
		// Check for the broken heart
		var broken = $("#heartbroken");
		if (broken.length > 0) {

			// Change text
			$("#content h2").html("Sorry Grooveshark :( We love you! <br /> ProxMate will unblock Grooveshark now!");

			proxifyUri(window.location, true);
		}
	});	

});