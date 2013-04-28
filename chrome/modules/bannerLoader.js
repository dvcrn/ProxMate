/**
 * ProxMate is created and © by David Mohl.
 * It's pretty cool that you're interested in how this extension works but please don't steal what you'll find here.
 *
 * Interested in helping ProxMate and/or licensing? Contact me at proxmate@dave.cx
 */
$(document).ready(function () {
	// Taken from http://mxr.mozilla.org/mozilla/source/netwerk/base/src/nsProxyAutoConfig.js
	var shExpMatch = function (url, pattern) {
		pattern = pattern.replace(/\./g, '\\.');
		pattern = pattern.replace(/\*/g, '.*');
		pattern = pattern.replace(/\?/g, '.');
		var newRe = new RegExp('^' + pattern + '$');
		return newRe.test(url);
	};

	sendActionWithCallback("getFromStorage", "status", function (global_status) {
		if (global_status.data === true) {
			sendActionWithCallback("getFromStorage", "account_type", function (account_data) {
				if (account_data.data === "0") {
					sendActionWithCallback("getFromStorage", "rules_available", function (data) {
						var rules, rule, url, host, is_supported_by_proxmate;

						url = window.location.href;
						host = window.location.hostname;

						rules = data.data.split(";;;");
						for (rule in rules) {
							is_supported_by_proxmate = eval(rules[rule]);

							if (is_supported_by_proxmate) {
								loadBanner();
							}
						}
					});
				}
			});
		}
	});
});