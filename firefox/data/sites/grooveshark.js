resetProxy();
var promise = sendAction("isEnabled");

promise.done(function() {
	console.log('promise resolved: ' + promise.response.enabled + ", if statement: " + (promise.response.enabled != "true"));

	if (promise.response.enabled != "true")
		console.log(promise.response.enabled + " returning");
		return;

	$(document).ready(function() {
		console.log('starting instpection');
		// Check for the broken heart
		var broken = $("#heartbroken");
		console.log('elements found: ' + broke.lenth);
		if (broken.length > 0) {

			// Change text
			$("#content h2").html("Sorry Grooveshark :( <br /> ProxMate will unblock Grooveshark now!");
			console.log('redirecting from grooveshark.js');
			proxifyUri(window.location, true);
		}
	});	
});