$(document).ready(function() {
	if (getUrlParam("proxmate") != "active") {

	loadOverlay(function() {
			// Remove the hash from the url
			var loc_tmp = window.location.href;
			var index_tmp = loc_tmp.indexOf('#');
			if (index_tmp > 0) {
				proxifyUri(loc_tmp.substring(0, index_tmp) + "&proxmate=active");
			}
			else {
				proxifyUri(window.location + "?proxmate=active");
			}
	});
		
	} else {
		var afterLoad = (function() {
			$(window).unload(resetProxy);
			setTimeout(resetProxy, 10000);
		})();
	}

});