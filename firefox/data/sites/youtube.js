$(window).unload(resetProxy);

var global = checkStatus("global");
var youtube = checkStatus("youtube_video");

$.when(global, youtube).done(function() {

	if (!global.response.enabled || !youtube.response.enabled) {
		return;
	}

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
				$("#watch-player-unavailable-icon-container img").prop("src", getUrlFor("images/waitajax.gif"));

				// Fire event to background page
				// Will activate proxy page
				proxifyUri(window.location + "&unblocked=true");
			}
			else 
			{
				$("#unavailable-submessage").html("There might be a problem with this video or Proxmate itself. :( <br /> Click <a id='px-again' href='javascript:void(0)'>here</a> to try again.");
				$('#px-again').click(function() {

					$("#unavailable-submessage").html("ProxMate will unblock this video now :)");
					$("#watch-player-unavailable-icon-container img").prop("src", getUrlFor("images/waitajax.gif"));

					proxifyUri(window.location, true);
				});
			}
		} 
	});
});