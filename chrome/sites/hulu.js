var global = checkStatus("global");
var hulu = checkStatus("hulu");

$.when(global, hulu).done(function() {

	if (!global.response.enabled || !hulu.response.enabled) {
		return;
	}

	$(document).ready(function() {
		if (getUrlParam("proxmate") != "active") {

			// Load the overlay

			$('<link>').attr('rel','stylesheet')
			  .attr('type','text/css')
			  .attr('href',getUrlFor("elements/overlay.css"))
			  .appendTo('head');

			$.get(getUrlFor("elements/overlay.html"), function(data) {
				console.info(data);
				$("body").append(data);
				$("#pmOverlay").fadeIn("slow");
				$("#pmOverlay").click(function() {

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
			});
		} else {
			var afterLoad = (function() {
				$(window).unload(resetProxy);
				setTimeout(resetProxy, 10000);
			})();
		}

	});

});