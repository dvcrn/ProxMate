/**
 * ProxMate is created and © by David Mohl.
 * It's pretty cool that you're interested in how this extension works but please don't steal what you'll find here.
 *
 * Interested in helping ProxMate and/or licensing? Contact me at proxmate@dave.cx
 */

/*jslint browser: true*/
/*global localStorage, chrome, console*/

var mothership01 = "http://proxmate.dave.cx";
var mothership02 = "http://web02.proxmate.dave.cx";

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

};

/**
 * Syncs all localStorage entries with the cloud
 */
var save_storage_in_cloud = function () {
    debug("Writing localStorage in google cloud...");
    chrome.storage.sync.clear(function () {
        chrome.storage.sync.set(localStorage);
    });
};

/**
 * Overwrites localStorage with contents from cloud
 */
var apply_storage_from_cloud = function (callback) {
    if (callback === undefined) {
        callback = function() {};
    }

    debug("Applying cloud storage on localStorage");
    chrome.storage.sync.get(null, function (items) {
        var service_key;

        for (service_key in items) {
            set_storage(service_key, items[service_key]);
        }

        callback();
    });
};

/**
 * Saves a value to a specific team in storage
 * @param {string} key   key for saving
 * @param {string} value value for saving to the key
 */
var set_storage = function(key, value) {
    "use string";
    debug("Writing storage '" + key + "' with value '" + value + "'");
    localStorage[key] = value;
};

/**
 * console.log wrapper, checking for debug mode
 * @param  {string} message the message for output
 */
var debug = function(message) {
    if (get_from_storage("debug")) {
        console.log(message);
    }
};

/**
 * Generates a user unique identifier
 * @return {string} the unique id
 */
var get_unique_identifier = function () {
    var uuid = get_from_storage("uuid");
    if (uuid) {
        return uuid;
    }

    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var random_string_1 = "";
    var random_string_2 = "";

    for( var i=0; i < 9; i++ ) {
        random_string_1 += possible.charAt(Math.floor(Math.random() * possible.length));
        random_string_2 += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    var current_time = new Date().getTime();
    var random_number = Math.floor(Math.random()*99999);

    var identifier_put_together = "prox-" + current_time + random_string_1 + random_number + random_string_2;
    var identifier = identifier_put_together.substring(0, 32);

    set_storage("uuid", identifier);

    return identifier;
};

/**
 * Get pac_script form localStorage and set
 * @param {script} the pac script for setting
 */
var set_proxy_autoconfig = function (pac_script) {
    "use strict";
    var pac_config;

    if (pac_script === undefined) {
        pac_script = get_from_storage("pac_script");
    }

    debug("Setting pac_script...");
    debug(pac_script);

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
var toggle_pluginstatus = function (callback, switch_status) {
    "use strict";

    if (switch_status === undefined) {
        switch_status = true;
    }

    if (switch_status) {
        if (get_from_storage("status")) {
            set_storage("status", false);
            debug("Setting status to false");
        } else {
            set_storage("status", true);
            debug("Setting status to true");
        }

        save_storage_in_cloud();
    }

    if (get_from_storage("status")) {
        chrome.browserAction.setIcon({path: "images/icon24.png"});
        chrome.browserAction.setBadgeText({text: ""});
        update_proxy_autoconfig();
    } else {
        chrome.browserAction.setIcon({path: "images/icon24_grey.png"});
        chrome.browserAction.setBadgeText({text: "Off"});
        chrome.proxy.settings.clear({});
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

    if (get_from_storage(str) === undefined) {
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
    var customproxy, cachedproxy, account_type, rules_list, country_list, nodes_list, first_country, service_list, localstorage_string, pac_script, proxystring, country, country_specific_config, country_specific_services, country_specific_service, country_specific_service_rules;

    service_list = [];
    rules_list = [];
    country_list = [];
    nodes_list = [];
    first_country = false;

    //cache proxy details
    customproxy = get_from_storage("status_cproxy");
    if(customproxy) {
        cachedproxy = get_from_storage("cproxy_url") + ":" + get_from_storage("cproxy_port");
    }

    if (config.account_type !== undefined) {
        set_storage("account_type", config.account_type);
    }

    pac_script = "function FindProxyForURL(url, host) {";
    for (country in config.list.proxies) {
        country_specific_config = config.list.proxies[country];

        // Continue parsing if nodes AND services are available for the current country
        country_specific_service_rules = [];
        if (country_specific_config["nodes"].length > 0 && Object.keys(country_specific_config["services"]).length > 0) {
            country_specific_services = country_specific_config["services"];
            for (country_specific_service in country_specific_services) {

                // Check storage for setted var. This will be used for per-module toggling
                localstorage_string = "status_" + country_specific_service.toLowerCase();
                init_storage(localstorage_string);

                if (country_specific_services[country_specific_service].length > 0 && get_from_storage(localstorage_string) === true) {
                    country_specific_service_rules.push(country_specific_services[country_specific_service].join(" || "));
                }

                service_list.push(country_specific_service.toLowerCase());
            }

            if (country_specific_service_rules.length === 0 || country_specific_config["nodes"].length === 0) {
                continue;
            }

            // Create array containing all rules
            rules_list = rules_list.concat(country_specific_service_rules);

            // Create array containing services
            country_list.push(country);

            // Create array containing all nodes
            nodes_list = nodes_list.concat(country_specific_config["nodes"]);

            // Check for custom userproxy
            proxystring = cachedproxy || shuffle(country_specific_config["nodes"]).join("; PROXY ");

            if (!first_country) {
                pac_script += "if (" + country_specific_service_rules.join(" || ") + ") { return 'PROXY " + proxystring + "';} ";
                first_country = true;
            } else {
                pac_script += "else if (" + country_specific_service_rules.join(" || ") + ") { return 'PROXY " + proxystring + "';} ";
            }
        }
    }

    debug("----> Rules");
    debug(rules_list);

    set_storage("services", service_list.join(","));
    set_storage("countries_available", country_list.join(","));
    set_storage("rules_available", rules_list.join(";;;"));

    debug("----> Custom Rules");

    // Load custom rules from storage
    var customrules = JSON.parse(get_from_storage("csurl-list"));
    debug(customrules);
    var customrulesym = [];
    for(var href in customrules) {
        if(customrules[href][0] === false) continue;
        if(customrules[href][1] !== undefined && customrules[href][1] !== null) {
            var csrp = customrules[href][1] + ":" + (customrules[href][2] || "3128");
            pac_script += "else if ( url.indexOf('"+href+"') != -1 ) { return 'PROXY " + csrp + "'; } ";
            continue;
        }
        customrulesym.push("url.indexOf('"+href+"') != -1");
    }
    if(customrulesym.length) {
        proxystring = cachedproxy || shuffle(nodes_list).join("; PROXY ");
        pac_script += "else if ( "+customrulesym.join("||") + ") { return 'PROXY " + proxystring + "'; } ";
    }


    pac_script += " else { return 'DIRECT'; }";
    pac_script += "}";

    debug(pac_script);

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
    var url;


    debug("loading external config");
    // Request mothership01, if statuscode not 200, request mothership02
    // If mothership02 also not 200, use fallback
	url = mothership01 + "/api/config.json?key=" + get_from_storage("api_key");
	if (get_from_storage("status_data_collect")) {
		url = mothership01 + "/api/config.json?data_collection=on&key=" + get_from_storage("api_key");
	}


    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send();

    xhr.onreadystatechange = function (aEvt) {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var json = JSON.parse(xhr.responseText);
		        if (json.success) {
		            callback(json);
		        }
            } else {
            	debug("Main request failed, trying fallback server");
				url = mothership02 + "/api/config.json?key=" + get_from_storage("api_key");
				if (get_from_storage("status_data_collect")) {
						url = mothership02 + "/api/config.json?data_collection=on&key=" + get_from_storage("api_key");
				}
	            var fallback_xhr = new XMLHttpRequest();
	            fallback_xhr.open("GET", url, true);
	            fallback_xhr.send();

	            fallback_xhr.onreadystatechange = function (aEvt) {
	                if (fallback_xhr.readyState == 4) {
	                    if (fallback_xhr.status == 200) {
	                        var json = JSON.parse(fallback_xhr.responseText);
					        if (json.success) {
					            callback(json);
					        }
	                    } else {
	                    	debug("Fallback server failed too, using offline config");
	                    	fallback();
	                    }
	                }
	            }
            }
        }
    }

};

/**
 * Fetches a new external auto config, parses it and sets proxy if status = true
 */
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
    save_storage_in_cloud();
}, 600000);

/**
 * Self-invoking init function. Basically the starting point of this addon.
 */
var init = (function () {
    "use strict";

    chrome.proxy.onProxyError.addListener(function(details) { debug(details); });

    // Load previous config if available
    apply_storage_from_cloud(function () {
        // Init some storage space we need later
        init_storage("firststart");
        init_storage("status");

        init_storage("csurl-list", "{}");

        init_storage("status_data_collect");
        init_storage("status_autounblock_youtube_search", false);

        init_storage("status_cproxy", false);
        init_storage("cproxy_url", "");
        init_storage("cproxy_port", "");

        init_storage("pac_script", "");
        init_storage("api_key", "");

        init_storage("account_type", 0);

        init_storage("feedback_sent_date", 0);

        // Is this the first start? Spam some tabs!
        var url, port, xhr;

        if (get_from_storage("firststart")) {
            chrome.tabs.create({
                url: "http://proxmate.dave.cx/?ref=chrome_installation"
            });

            chrome.tabs.create({
                url: "https://www.facebook.com/ProxMate/"
            });

            set_storage("firststart", false);
        } else {
            if (!get_from_storage("saw_data_collection")) {

                chrome.tabs.create({
                    url: "http://proxmate.dave.cx/proxmate_and_sitemeter/"
                });

                set_storage("saw_data_collection", true);
            }

        }

        // Ensures that every month the feedback will be sent
        if ((new Date().getTime() - get_from_storage("feedback_sent_date")) >= 2592000000) {
            var uuid = get_unique_identifier();
            var xhr = new XMLHttpRequest();
            xhr.open("POST", mothership02 + "/api/feedback.json", true);
            xhr.send("uuid=" + uuid + "&allow_feedback=" + get_from_storage("status_data_collect"));

            xhr.onreadystatechange = function (aEvt) {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        var json = JSON.parse(xhr.responseText);

                        if (json.success) {
                            set_storage("feedback_sent_date", new Date().getTime());
                            save_storage_in_cloud();
                        }

                    }
                }
            }
        }

        toggle_pluginstatus({}, false);
        save_storage_in_cloud();
    });
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

    debug("Receiving event call " + request.action);

    // ResetProxy to default
    if (request.action === "resetproxy") {
        update_proxy_autoconfig();
        save_storage_in_cloud();
    }

    if (request.action === "debug") {
        debug(request.param);
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

    if (request.action === "getFromStorage") {
        sendResponse({
            data: get_from_storage(request.param)
        });
    }

    if (request.action === "setStorage") {
        set_storage(request.param.key, request.param.val);
    }

    if (request.action === "resetFeedback") {
        set_storage("feedback_sent_date", 0);
    }

});
