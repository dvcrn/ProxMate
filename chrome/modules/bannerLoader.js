$(document).ready(function () {
	// Taken from http://mxr.mozilla.org/mozilla/source/netwerk/base/src/nsProxyAutoConfig.js
	var shExpMatch = function (url, pattern) {
		pattern = pattern.replace(/\./g, '\\.');
		pattern = pattern.replace(/\*/g, '.*');
		pattern = pattern.replace(/\?/g, '.');
		var newRe = new RegExp('^' + pattern + '$');
		return newRe.test(url);
	};

	sendActionWithCallback("getFromStorage", "rules_available", function (data) {
		var rules, rule, url, host, is_supported_by_proxmate;

		url = window.location.href;
		host = window.location.hostname;

		rules = data.data.split(";;;");
		console.info(rules);
		for (rule in rules) {
			is_supported_by_proxmate = eval(rules[rule]);
			console.info(is_supported_by_proxmate + " --- " + rules[rule]);

			if (is_supported_by_proxmate) {
				loadBanner();
			}
		}
	});
});