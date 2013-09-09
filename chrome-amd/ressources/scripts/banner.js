(function () {
	"use strict";

	var PmBanner = function () {
		/**
		 * Load the banners stylesheet
		 */
		this.load_banner_stylesheet = function () {
	    	$('<link>').attr('rel', 'stylesheet')
		        .attr('type', 'text/css')
		        .attr('href', Proxmate.get_addon_url("ressources/banner/banner.css"))
		        .appendTo('head');
		};

		/**
		 * Load the banners html
		 */
		this.load_banner_html = function () {
			// Load banner
		    $.get(Proxmate.get_addon_url("ressources/banner/banner.html"), function (content) {
		        $("body").append(content);
		    });
		};
	};

	window.PmBanner = new PmBanner();
})();