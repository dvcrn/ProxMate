/* Simple roundrobin server for balancing proxy use */

var server = require('http');
var url = require('url');

var proxyList = {
	us: [
		["us01.personalitycores.com", 8000],
		["us02.personalitycores.com", 8000]
	],
	// These servers are not real. Just for testing
	uk: [	
		["uk01.personalitycores.com", 8000],
		["uk02.personalitycores.com", 8000]
	]
}

var isUndefined = function(v) {
	if (v === undefined) {
		return true;
	} else {
		return false;
	}
}

// Creating data including all the proxys and the next one to give
var countryData = {};
for (country in proxyList) {
	countryData[country] = {
		"total": proxyList[country].length,
		"next": 0
	}
}

var getNextProxyForCountry = function(country) {
	var countryElement = countryData[country];
	var next = countryElement.next;
	var proxy = proxyList[country][next];

	// Increment next element by one if it's not over the max
	if (next + 1 > countryElement.total - 1) {
		countryData[country].next = 0;
	} else {
		countryData[country].next = next + 1;
	}

	return proxy;
}

var app = server.createServer(function(request, response) {
	request.on('error', function(err){
		console.warn('error:\n' + err.stack);
	});

	// Parse requested url and get the country element
	var url_parts = url.parse(request.url, true);
	var country = url_parts.query["country"];

	// Error handling in case if no country element is given
	if (isUndefined(country) ) { 
		country = "us";
	}

	// Error handling if invalid // nonexistent country element is given. Us is defualt
	try {
		var proxy = getNextProxyForCountry(country);
	} catch (e) {
		var proxy = getNextProxyForCountry("us");
	}

	var proxy = {
		"url": proxy[0],
		"port": proxy[1]
	}
	response.write(JSON.stringify(proxy));
	response.end();
});

console.info("Server listening on port 8080");
app.listen(8080);