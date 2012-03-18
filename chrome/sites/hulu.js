var global = checkStatus("global");
var hulu = checkStatus("hulu");

$.when(global, hulu).done(function() {

	if (!global.response.enabled || !hulu.response.enabled) {
		return;
	}

	$(document).ready(function() {
		if (getUrlParam("unblocked") != "true") {
			$("#show-title-container").append(" --> <a id='prox-unblock' href='javascript:void(0);'>Unblock This</a> <--");
			$("#prox-unblock").click(function() {
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