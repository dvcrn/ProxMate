$(document).ready(function() {

	if (getUrlParam('proxmate') != "active")
	{
		var button = '<button id="proxmate-button" type="button" class="yt-uix-button yt-uix-button-text yt-uix-button-toggle"><span class="yt-uix-button-content">Unblock this search</span></button>';
		// Append it in the option line
		$(button).insertAfter($(".num-results"));
		console.info($("#proxmate-button"));
		$("#proxmate-button").click(function() {
			var oldhtml = $("#proxmate-button span").html();
			$("#proxmate-button span").html(oldhtml + " <img src='"+getUrlFor("images/load.gif")+"' />");

			window.location.href = window.location.href + "&proxmate=active";
		});	
	}

});
