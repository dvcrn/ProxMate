var global = checkStatus("global");
var gplay = checkStatus("status_gplay");

$.when(global, gplay).done(function() {
	if (!global.response.enabled || !gplay.response.enabled)
		return;
	
	$(document).ready(function() {
		loadBanner();
	});	
});