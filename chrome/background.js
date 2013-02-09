/**
 * ProxMate is created and © by David Mohl.
 * It's pretty cool that you're interested in how this extension works but please don't steal what you'll find here.
 *
 * Interested in helping ProxMate and/or licensing? Contact me at proxmate@dave.cx
 */

/*jslint browser: true*/
/*global localStorage, chrome, console*/

/**
 * tries to cast a string into bool
 * chrome saves localStorage vars in string only. Needed for conversion
 * @param  {string} str string to casat
 * @return {bool}
 */
var try_parse_bool = function (str) {
	"use strict";
	if (str.toLowerCase() === 'false') {
		return false;
	} else if (str.toLowerCase() === 'true') {
		return true;
	} else {
		return str;
	}
};

/**
 * shuffles a array and returns random result
 * @param  {array} o the array to shuffle
 * @return {array} the shuffled array
 */
var shuffle = function (o) {
	"use strict";
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

/**
 * Return a value from localstorage
 * @param  {string} key the saved key
 * @return {var}     the saved value
 */
var get_from_storage = function(key) {
	"use string";
    if (localStorage[key] === undefined) {
        return undefined;
    } else {
        return try_parse_bool(localStorage[key]);
    }

}

/**
 * Saves a value to a specific team in storage
 * @param {string} key   key for saving
 * @param {string} value value for saving to the key
 */
var set_storage = function(key, value) {
	"use string";
	localStorage[key] = value;
}

/**
 * Get pac_script form localStorage and set
 * @param {script} the pac script for setting
 */
var set_proxy_autoconfig = function (pac_script) {
	"use strict";
	var pac_script, pac_config;

	if (pac_script === undefined) {
		pac_script = get_from_storage("pac_script");
	}

    console.info(pac_script);

	pac_config = {
		mode: "pac_script",
		pacScript: {
			data: pac_script
		}
	};


	chrome.proxy.settings.set(
		{value: pac_config, scope: 'regular'},
		function () {}
	);
};

/**
 * Will be invoked when clicking the ProxMate logo. Simply toggles the plugins status
 */
var toggle_pluginstatus = function (switch_status) {
	"use strict";
	var toggle = get_from_storage("status");

    if (switch_status === undefined) {
        switch_status = true;
    }

	if (toggle) {
        chrome.browserAction.setIcon({path: "images/icon24.png"});
        update_proxy_autoconfig();

		// Remove proxy entirely and allow other plugins to write
		chrome.proxy.settings.clear({});
	} else {
        chrome.browserAction.setIcon({path: "images/icon24_grey.png"});

		// ProxMate has just been turned on. Set the proxy
        chrome.proxy.settings.clear({});
	}

    if (switch_status) {
        set_storage("status", false);
    } else {
        set_storage("status", true);
    }
};

/**
 * Initialises a specific localStorage space
 * @param  {string} str localStorage key
 * @param  {string} val localStorage value
 */
var init_storage = function (str, val) {
	"use strict";
	if (val === undefined) {
		val = true;
	}

	if (get_from_storage[str] !== undefined) {
		set_storage(str, val);
	}
};

/**
 * Experimental module for reacting on onAuthRequired prompts. Might be useful for using user auth in proxy servers
 */
chrome.webRequest.onAuthRequired.addListener(function (details, callback) {
	"use strict";
	if (details.isProxy === true) {
		callback({ authCredentials: {username: get_from_storage("proxy_user"), password: get_from_storage("proxy_password")}});
	} else {
		callback({ cancel: false });
	}
}, {urls: ["<all_urls>"]}, ["asyncBlocking"]);

var generate_pac_script_from_config = function(config) {
	"use strict";
    var counter, pac_script, proxystring, country, country_specific_config, country_specific_services, country_specific_service, country_specific_service_rules;

    counter = 0;
    pac_script = "function FindProxyForUrl(url, host) {";
    for (country in config["list"]["proxies"]) {
        country_specific_config = config["list"]["proxies"][country];

        // Continue parsing if nodes AND services are available for the current country
        country_specific_service_rules = [];
        if (country_specific_config["nodes"].length > 0 && Object.keys(country_specific_config["services"]).length > 0) {
            country_specific_services = country_specific_config["services"];
            for (country_specific_service in country_specific_services) {
                if (country_specific_services[country_specific_service].length > 0) {
                    country_specific_service_rules.push(country_specific_services[country_specific_service].join(" || "));
                }
            }

            // Check for custom userproxy
            if (get_from_storage("status_cproxy") === true) {
                proxystring = get_from_storage("cproxy_url") + ":" + get_from_storage("cproxy_port");
            } else {
                // Shuffle proxies for a traffic randomizing
                proxystring = shuffle(country_specific_config["nodes"]).join("; PROXY ");
            }

            if (counter === 0) {
                pac_script += "if (" + country_specific_service_rules.join(" || ") + ") { return 'PROXY " + proxystring + "';} ";
            } else {
                pac_script += "else if (" + country_specific_service_rules.join(" || ") + ") { return 'PROXY " + proxystring + "';} ";
            }

            counter += 1;
        }
    }

    pac_script += " else { return 'DIRECT'; }";
    pac_script += "}";

    return pac_script;
};

/**
 * loads configuration from external server
 * @param {function} callback will be invoked after successful loading
 * @param {function} fallback will be invoked on exception
 */
var load_external_config = function (callback, fallback) {
	"use strict";
	if (callback === undefined) {
		callback = function() {};
	}
    if (fallback === undefined) {
        fallback = function() {};
    }
	var xhr = new XMLHttpRequest();

	xhr.addEventListener("load", function () {
		var json, jsonstring, pac_script, counter, list, rule, proxystring, proxy, country, service;

		jsonstring = xhr.responseText;
		json = JSON.parse(jsonstring);

		if (json.success) {
			callback(json);
		}

	}, false);

	xhr.addEventListener("error", function () {
        fallback();
	}, false);

	try {
        console.info("http://proxmate.dave.cx/api/config.json?key=" + get_from_storage("api_key"));
		xhr.open("GET", "http://proxmate.dave.cx/api/config.json?key=" + get_from_storage("api_key"), false);
		xhr.send();
	} catch (e) {
        fallback();
	}
};

var update_proxy_autoconfig = function() {
    "use strict";
    var pac_script;

    load_external_config(function(config_json) {
        pac_script = generate_pac_script_from_config(config_json);

        if (get_from_storage("status") === true) {
            set_proxy_autoconfig(pac_script);
        }

        // Save for later fallback usage
        set_storage("pac_script", pac_script);
    }, function() {
        if (get_from_storage("status") === true) {
            // Use previously saved auto config
            set_proxy_autoconfig(get_from_storage("pac_script"));
        }
    });
};

/**
 * Invoke proxy fetching all 10 minutes
 */
setInterval(function () {
	"use strict";
    update_proxy_autoconfig();
}, 600000);

/**
 * Self-invoking init function. Basically the starting point of this addon.
 */
var init = (function () {
	"use strict";

	// Init some storage space we need later
	init_storage("firststart");

	init_storage("status");
	init_storage("status_youtube_autounblock", true);

	init_storage("status_cproxy", false);
	init_storage("cproxy_url", "");
	init_storage("cproxy_port", "");

	init_storage("pac_script", "");
	init_storage("api_key", "");

	// Is this the first start? Spam some tabs!
	var firstStart, url, port, xhr;

	firstStart = get_from_storage("firststart");
	if (firstStart === "true") {
		chrome.tabs.create({
			url: "http://proxmate.dave.cx"
		});

		chrome.tabs.create({
			url: "https://www.facebook.com/ProxMate/"
		});

        set_storage("firststart", false);
	}

    toggle_pluginstatus(false);

}());

/**
 * Add a click listener on plugin icon
 */
chrome.browserAction.onClicked.addListener(toggle_pluginstatus);

/**
 * Event listener for communication between page scripts / options and background.js
 */
chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
	"use strict";
	var config, module, status;

	// ResetProxy to default
	if (request.action === "resetproxy") {
        update_proxy_autoconfig()
	}

	if (request.action === "checkStatus") {

		module = request.param;
		status = false;

		switch (module) {
		case "global":
			status = get_from_storage("status");
			break;
		case "cproxy":
			status = get_from_storage("status_cproxy");
			break;
		default:
			status = get_from_storage(module);
			break;
		}

		sendResponse({
			enabled: status
		});
	}

});
