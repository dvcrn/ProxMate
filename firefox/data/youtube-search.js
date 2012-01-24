resetProxy();	

$(document).ready(function() {

	console.info($("#proxmate-button > span").html());
	if (getUrlParam('unblocked') != "true")
	{
		var button = '<div><button id="proxmate-button" type="button" class="yt-uix-button yt-uix-button-text yt-uix-button-toggle"><span class="yt-uix-button-content">Unblock this search</span></button></div>';
		// Append it in the option line
		$(button).insertAfter($("#search-option-expander"));
		$("#proxmate-button").click(function() {
			var oldhtml = $("#proxmate-button span").html();
			$("#proxmate-button span").html(oldhtml + " <img src='" + getUrlFor('load.gif') + "' />");

			proxifyUri(window.location.href + "&unblocked=true");
		});	
	}

});