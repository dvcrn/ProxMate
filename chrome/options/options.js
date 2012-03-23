$(document).ready(function() {

	var toggle_youtube_video = $("#s-youtubevideo-toggle");
	var toggle_youtube_channel = $("#s-youtubechannel-toggle");
	var toggle_youtube_search = $("#s-youtubesearch-toggle");
	var toggle_grooveshark = $("#s-grooveshark-toggle");
	var toggle_hulu = $("#s-hulu-toggle");
	var toggle_experimental = $("#s-experimental-toggle");
	
	var toggle_statistics = $("#s-statistics-toggle");

	var toggle_cproxy = $("#g-cproxy-toggle");
	var cproxy_port = $("#g-cproxy-port");
	var cproxy_url = $("#g-cproxy-url");

	var checkBoxToggle = function(storage, ele) {
		if (bool(localStorage[storage])) {
			ele.prop("checked", "true");
		}
	}

	var init = (function() {
		checkBoxToggle("status_youtube_video", toggle_youtube_video);
		checkBoxToggle("status_youtube_search", toggle_youtube_search);
		checkBoxToggle("status_youtube_channel", toggle_youtube_channel);
		checkBoxToggle("status_grooveshark", toggle_grooveshark);
		checkBoxToggle("status_hulu", toggle_hulu);
		checkBoxToggle("status_statistics", toggle_statistics);
		checkBoxToggle("status_experimental", toggle_experimental);

		checkBoxToggle("status_cproxy", toggle_cproxy);
		if (bool(localStorage["status_cproxy"])) {
			$("#g-cproxy-area").css("display", "block");
		}

		cproxy_url.val(localStorage["cproxy_url"]);
		cproxy_port.val(localStorage["cproxy_port"]);

	})();

	var resetText = function(ele, time) {
		var text = ele.html();
		setTimeout(function() {
			ele.html(text);
		}, time);
	}

	// Eigener Proxy Bereich
	$("#g-cproxy-toggle").click(function() {
		$("#g-cproxy-area").slideToggle("slow");
	});

	$("#g-cproxy-toggle-label").click(function() {
		$("#g-cproxy-toggle").click();
	});

	// Savebutton. Obvious :D
	$("#savebutton").click(function() {
		var toggle_youtube_video = $("#s-youtubevideo-toggle").prop("checked");
		var toggle_youtube_channel = $("#s-youtubechannel-toggle").prop("checked");
		var toggle_youtube_search = $("#s-youtubesearch-toggle").prop("checked");
		var toggle_grooveshark = $("#s-grooveshark-toggle").prop("checked");
		var toggle_hulu = $("#s-hulu-toggle").prop("checked");
		var toggle_experimental = $("#s-experimental-toggle").prop("checked");

		var toggle_statistics= $("#s-statistics-toggle").prop("checked");
		
		var toggle_cproxy = $("#g-cproxy-toggle").prop("checked");
		var cproxy_port = $("#g-cproxy-port").val();
		var cproxy_url = $("#g-cproxy-url").val();

		// Alle variablen in den localStorage schreiben

		localStorage["status_youtube_video"] = toggle_youtube_video;
		localStorage["status_youtube_channel"] = toggle_youtube_channel;
		localStorage["status_youtube_search"] = toggle_youtube_search;
		localStorage["status_grooveshark"] = toggle_grooveshark;
		localStorage["status_hulu"] = toggle_hulu;
		localStorage["status_experimental"] = toggle_experimental;

		localStorage["status_statistics"] = toggle_statistics;

		localStorage["status_cproxy"] = toggle_cproxy;
		localStorage["cproxy_url"] = cproxy_url;
		localStorage["cproxy_port"] = cproxy_port;

		// Text des Buttons ändern um zu zeigen das gespeichert wurde

		resetText($(this), 5000);
		$(this).html("Success");
	});
});