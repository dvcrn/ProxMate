var global = checkStatus("global");
var pandora = checkStatus("status_pandora");

$.when(global, pandora).done(function() {
	if (!global.response.enabled || !pandora.response.enabled)
		return;

	$(document).ready(function() {
		loadBanner();
	});

});