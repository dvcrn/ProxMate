// Before DOM loads
resetProxy();

$(document).ready(function() {
	
	// Check if there's a "unavailable" div
	var ud = $("#watch-player-unavailable");
	if (ud.length > 0) {
		if (getUrlParam('unblocked') != "true" )
		{
			// Change text
			$("#unavailable-submessage").html("ProxMate will unblock this video now :)");
			$("#unavailable-message").html("Blah blah blah not available.");

			// Change Icon
			$("#watch-player-unavailable-icon-container img").prop("src", chrome.extension.getURL("images/waitajax.gif"));

			// Fire event to background page
			// Will activate proxy page
			proxifyUri(window.location + "&unblocked=true");
		}
		else 
		{
			$("#unavailable-submessage").html("There might be a problem with this video :( Try again later!");
		}
	} 
});