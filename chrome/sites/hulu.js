var global = checkStatus("global");
var experimental = checkStatus("experimental");

$.when(global, experimental).done(function() {

	if (!global.response.enabled || !experimental.response.enabled) {
		return;
	}

	$(document).ready(function() {
		var afterLoad = function() {
			$(window).unload(resetProxy);
			setTimeout(resetProxy, 5000);
		}

		$("#show-title-container").append(" --> <a id='prox-unblock' href='javascript:void(0);'>Unblock This</a> <--");
		$("#prox-unblock").click(function() {
			proxifyUri(window.location.href, true);
		});
	});

});