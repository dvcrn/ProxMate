var global = checkStatus("global");
var hulu = checkStatus("hulu");

$.when(global, hulu).done(function() {

	if (!global.response.enabled || !hulu.response.enabled) {
		return;
	}

	$(document).ready(function() {
		if (getUrlParam("unblocked") != "true") {
			console.info($(".video-details .watch-title-left"));
			$(".video-details").prepend("<p> <a style='color:white;' id='prox-unblock' href='javascript:void(0);'>Unblock this Video</a> </p>");
			$("#prox-unblock").click(function() {
				$("#prox-unblock").html("<p style='color:white;'>Loading... Please wait...</p>");
				// Remove the hash from the url
				var loc_tmp = window.location.href;
				var index_tmp = loc_tmp.indexOf('#');
				if (index_tmp > 0) {
					proxifyUri(loc_tmp.substring(0, index_tmp) + "?unblocked=true");	
				}
				else {
					proxifyUri(loc_tmp + "?unblocked=true");		
				}
			});
		} else {
			var afterLoad = (function() {
				$(window).unload(resetProxy);
				setTimeout(resetProxy, 10000);
			})();
		}

	});

});