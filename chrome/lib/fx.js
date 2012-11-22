jQuery.support.cors = true;

var sendAction = function(actionString, param) {

	if (param === undefined) {
		param = null;
	}

	var defer = $.Deferred();

	chrome.extension.sendRequest(
		{
			action: actionString,
			param: param
		},
		function(response) {
			if (response)
			{
				// Response zum promise adden, damit später darauf zugegriffen werden kann
				defer.response = response;
				defer.resolve();
			}
		}
	);

	return defer;
}

var checkStatus = function(module) {
	return sendAction("checkStatus", module);
}

var proxifyUri = function(uri, reload)
{
	if (reload === undefined)
	{
		reload = false;
	}
	else
	{
		reload = true;
	}

	var promise = sendAction("setproxy", encodeURI(window.location.href));
	promise.done(function() {

		if (reload) {
			window.location = uri;
			location.reload();
		} else {
			window.location = uri;
		}

	});
}

var resetProxy = function()
{
	sendAction("resetproxy");
}

var getUrlParam = function(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}

var getUrlFor = function(file) {
	return chrome.extension.getURL(file);
}

function bool(str){
	if (str === undefined)
		return false;

    if (str.toLowerCase()=='false'){
       return false;
    } else if (str.toLowerCase()=='true'){
       return true;
    } else {
       return undefined;
    };
};

var loadOverlay = function(callback) {

	// Load the overlay
	$('<link>').attr('rel','stylesheet')
	  .attr('type','text/css')
	  .attr('href',getUrlFor("elements/overlay.css"))
	  .appendTo('head');

	$.get(getUrlFor("elements/overlay.html"), function(data) {
		$("body").prepend(data);
		$("#pmOverlay").fadeIn("slow");
		$("#pmOverlay").click(function() {
			callback();
		});
	});
}

var loadBanner = function(callback) {

	// Load the overlay
	$('<link>').attr('rel','stylesheet')
	  .attr('type','text/css')
	  .attr('href',getUrlFor("elements/overlay.css"))
	  .appendTo('head');

	$.get(getUrlFor("elements/banner.html"), function(data) {
		$("body").append(data);
		$("#pmBanner").fadeIn("slow");

		$("#pmBannerClose").click(function() {
			$("#pmBanner").fadeOut("slow", function() {
				$("#pmPusher").slideUp("slow");
			});
		});

		setTimeout(function() {
			$("#pmBanner").addClass("smallBanner");
		}, 5000);
	});
}