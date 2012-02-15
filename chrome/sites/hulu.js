$(document).ready(function() {
	var afterLoad = function() {
		$(window).unload(resetProxy);
		setTimeout(resetProxy, 5000);
	}

	$("#show-title-container").append(" --> <a id='prox-unblock' href='javascript:void(0);'>Unblock This</a> <--");
	var test = $("#player");
	console.info(test);
	$("#prox-unblock").click(function() {
		proxifyUri(window.location.href, true);
	});
});