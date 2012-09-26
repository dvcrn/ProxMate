var global = checkStatus("global");
var youtube = checkStatus("status_youtube");

$.when(global, youtube).done(function() {
	if (!global.response.enabled || !youtube.response.enabled)
		return;


console.info("Startin youtube module");
console.info("Global status: " + global.response.enabled);
console.info("Youtube status:" + youtube.response.enabled);

	$(document).ready(function() {
		var pmParam = getUrlParam('proxmate');

		if (pmParam == "active") 
		{
			var scripts = $("#watch-video script");
			var script = scripts[1]; // Get the second script tag inside the #watch-video element
			var test = $(script).contents()[0].data; // Get the script content (a.k.a the function)
			loadBanner(function() {
				$("#page").css("margin-top", "0px");
			});
			
			// videoplayback%253F
			var n = test.replace(/videoplayback%253F/g,"videoplayback%253Fproxmate%253Dactive%2526"); // Append our proxmate param so the pac script wil care of it
			eval(n);

		} 
		else
		{
			var ud = $("#watch-player-unavailable");
			if (ud.length > 0) {
				loadOverlay(function() {
					// Change text
					$("#unavailable-submessage").html("ProxMate will unblock this video now :)");

					// Change Icon
					$("#watch-player-unavailable-icon-container img").prop("src", getUrlFor("images/waitajax.gif"));
					window.location = window.location + "&proxmate=active";
				});
			}
		}

	});

});