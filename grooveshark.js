$(document).ready(function() {
	// Check for the broken heart
	var broken = $("#heartbroken");
	if (broken.length > 0) {

		// Change text
		$("#content h2").html("Blah blah blah not available. <br /> ProxMate will unblock Grooveshark now!");

		// Change Icon
		$("#heartbroken").css("background", "url('http://i.imgur.com/hKjFv.gif')");

		proxifyUri(window.location, true);
	} else {
		// Fire event to background page
		// Will remove the proxy
		resetProxy();
	}
});