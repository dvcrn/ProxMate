var unblocks = 0;

var server = require('http');
var url = require('url');

var proxyList = {
	/* Just dummy servers for testing ;) */
	us: [
		["us01.personalitycores.com", 8000],
		["us02.personalitycores.com", 8000]
	],
	uk: [
		["uk01.personalitycores.com", 8000]
	],
	de: [
		["de01.personalitycores.com", 8000]
	],
	/* Real ones */
	live: [
		["proxy.personalitycores.com", 8000]
	]
}

function getRandomKey(obj) {
    var ret;
    var c = 0;
    for (var key in obj)
        if (Math.random() < 1/++c)
           ret = key;
    return ret;
}

function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var getRandomProxy = function(country) {
	switch (country) {
		case "all": 
			var key = getRandomKey(proxyList);
			break;
		default: 
			var key = country;
			break;
	}

	var proxylist = proxyList[key];

	var length = proxylist.length - 1;
	var randomKey = getRandomInt(0, length);

	return proxylist[randomKey];
}


var isUndefined = function(v) {
	if (v === undefined) {
		return true;
	} else {
		return false;
	}
}


console.info("Server listening on 8080");
var app = server.createServer(function(request, response) {
	request.on('error', function(err){
		console.warn('error:\n' + err.stack);
	});

	var url_parts = url.parse(request.url, true);
	var country = url_parts.query["country"];

	if (isUndefined(country) || country == "xx") { 
		country = "all";
	}

	console.info("Request for country: " + country);

	var proxy = getRandomProxy(country);
	var proxy = {
		"url": proxy[0],
		"port": proxy[1]
	}
	response.write(JSON.stringify(proxy));
	response.end();
});

app.listen(8080);