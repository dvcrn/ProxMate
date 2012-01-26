resetProxy();
var promise = sendAction("isEnabled");

console.log('grooveshark init');


promise.done(function() {
	console.log('promise resolved: ' + promise.response.enabled);

	if (promise.response.enabled != "true")
		return;

	$(document).ready(function() {
		// Check for the broken heart
		var broken = $("#heartbroken");
		if (broken.length > 0) {

			// Change text
			$("#content h2").html("Sorry Grooveshark :( <br /> ProxMate will unblock Grooveshark now!");

			proxifyUri(window.location, true);
		}
	});	
});