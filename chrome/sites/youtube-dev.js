$(document).ready(function() {
	var pmParam = getUrlParam('proxmate');

	if (pmParam == "active") 
	{
		console.info("dev code");
		var scripts = $("#watch-video script");
		var script = scripts[1]; // Get the second script tag inside the #watch-video element
		var test = $(script).contents()[0].data; // Get the script content (a.k.a the function)
		
		// videoplayback%253F
		var n = test.replace(/videoplayback%253F/g,"videoplayback%253Fproxmate%253Dactive%2526"); // Append our proxmate param so the pac script wil care of it
		console.info(n);
		eval(n);
	} 
	else
	{
		var ud = $("#watch-player-unavailable");
		if (ud.length > 0) {
			loadOverlay(function() {
				window.location = window.location + "&proxmate=active";
			});
		}
	}

});