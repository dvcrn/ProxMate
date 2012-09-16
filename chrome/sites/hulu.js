var global = checkStatus("global");

global.done(function() {
	if (global.response.enabled == false)
		return;

	$(document).ready(function() {
		loadBanner();
	});

});