$(document).ready(function() {

	var toggle_youtube = $("#s-youtube-toggle");
	var toggle_grooveshark = $("#s-grooveshark-toggle");
	var toggle_hulu = $("#s-hulu-toggle");
	var toggle_pandora = $("#s-pandora-toggle");

	var toggle_cproxy = $("#g-cproxy-toggle");
	var cproxy_port = $("#g-cproxy-port");
	var cproxy_url = $("#g-cproxy-url");

	var checkBoxToggle = function(storage, ele) {
		if (bool(localStorage[storage])) {
			ele.prop("checked", "true");
		}
	}

	var init = (function() {
		checkBoxToggle("status_youtube", toggle_youtube);
		checkBoxToggle("status_grooveshark", toggle_grooveshark);
		checkBoxToggle("status_hulu", toggle_hulu);
		checkBoxToggle("status_pandora", toggle_pandora);

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
		var status_youtube = toggle_youtube.prop("checked");
		var status_grooveshark = toggle_grooveshark.prop("checked");
		var status_hulu = toggle_hulu.prop("checked");
		var status_pandora = toggle_pandora.prop("checked");
		
		var status_cproxy = $("#g-cproxy-toggle").prop("checked");
		var cproxy_port = $("#g-cproxy-port").val();
		var cproxy_url = $("#g-cproxy-url").val();

		// Write current vars in local storage

		localStorage["status_youtube"] = status_youtube;
		localStorage["status_grooveshark"] = status_grooveshark;
		localStorage["status_hulu"] = status_hulu;
		localStorage["status_pandora"] = status_pandora;

		localStorage["status_cproxy"] = status_cproxy;
		localStorage["cproxy_url"] = cproxy_url;
		localStorage["cproxy_port"] = cproxy_port;

		// Send action to background page
		sendAction("resetproxy");

		// Change button text

		resetText($(this), 5000);
		$(this).html("Success");
	});
});