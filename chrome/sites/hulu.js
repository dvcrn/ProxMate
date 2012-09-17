var global = checkStatus("global");
var hulu = checkStatus("status_hulu");

$.when(global, hulu).done(function() {
	if (!global.response.enabled || !hulu.response.enabled)
		return;

	$(document).ready(function() {
		loadBanner();
	});

});