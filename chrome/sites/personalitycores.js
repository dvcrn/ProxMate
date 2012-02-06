$(document).ready(function() {
	$("#header").append("<h2 class='subhl'>Thanks for installing! You are awesome! :)</h2>")
	$("#header").append("<p><a id='prox-opts' href='"+chrome.extension.getURL("options/options.html")+"' target='_blank'>Click here to configure ProxMates!</a></p>");

	$(".subhl").css("margin-top", "-35px");
});