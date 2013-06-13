/**
 * ProxMate is created and © by David Mohl.
 * It's pretty cool that you're interested in how this extension works but please don't steal what you'll find here.
 *
 * Interested in helping ProxMate and/or licensing? Contact me at proxmate@dave.cx
 */

/*global require, exports, console*/

var selfData = require('self').data;
var pageMod = require("page-mod");
var localStorage = require("simple-storage").storage;
var preferences = require("simple-prefs");
var request = require("request");
var timers = require("timers");

exports.main = function () {
    "use strict";
    var setProxy, resetProxy, setPluginStatus, initStorage, initListeners, createPagemod, init, loadExternalConfig, createPacFromConfig, shuffle;

    /**
     * shuffles a array and returns random result
     * @param  {array} o the array to shuffle
     * @return {array} the shuffled array
     */
    shuffle = function (o) {

        for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    };

    /**
     * console.log wrapper, checking for debug mode
     * @param  {string} message the message for output
     */
    var debug = function(message) {
       console.log(message);
    };

    /**
     * Get pac_script form localStorage and set
     */
    resetProxy = function () {
        var pacurl;

        pacurl = "data:text/javascript," + encodeURIComponent(get_from_storage("pac_script"));

        require("preferences-service").set("network.proxy.type", 2);
        require("preferences-service").set("network.proxy.autoconfig_url", pacurl);
    };



    /**
     * Parses script and saves generated proxy autoconfig in localStorage
     * @param  {string} config a config json string. If none is set, localStorage.last_config is used.
     */
    createPacFromConfig = function (config) {
        if (config === undefined) {
            config = localStorage.last_config;
        }

        var account_type, rules_list, country_list, first_country, service_list, localstorage_string, pac_script, proxystring, country, country_specific_config, country_specific_services, country_specific_service, country_specific_service_rules;
        config = JSON.parse(config);

        if (config.account_type !== undefined) {
            set_storage("account_type", config.account_type);
        }

        // create a proxy auto config string
        pac_script = "function FindProxyForURL(url, host) {";

        service_list = [];

        service_list = [];
        rules_list = [];
        country_list = [];
        first_country = false;

        for (country in config.list.proxies) {

            country_specific_config = config.list.proxies[country];

            // Continue parsing if nodes AND services are available for the current country
            country_specific_service_rules = [];
            if (country_specific_config.nodes.length > 0 && Object.keys(country_specific_config.services).length > 0) {
                country_specific_services = country_specific_config.services;
                for (country_specific_service in country_specific_services) {

                    // Check storage for setted var. This will be used for per-module toggling
                    localstorage_string = "status_" + country_specific_service.toLowerCase();
                    debug(localstorage_string);
                    initStorage(localstorage_string);

                    if (country_specific_services[country_specific_service].length > 0 && get_from_storage(localstorage_string) === true) {
                        country_specific_service_rules.push(country_specific_services[country_specific_service].join(" || "));
                    }

                    service_list.push(country_specific_service.toLowerCase());
                }

                if (country_specific_service_rules.length === 0 || country_specific_config.nodes.length === 0) {
                    continue;
                }

                // Create array containing all rules
                rules_list = rules_list.concat(country_specific_service_rules);

                // Create array containing services
                country_list.push(country);

                // Check for custom userproxy
                if (get_from_storage("status_cproxy") === true) {
                    proxystring = get_from_storage("cproxy_url") + ":" + get_from_storage("cproxy_port");
                } else {
                    // Shuffle proxies for a traffic randomizing
                    proxystring = shuffle(country_specific_config.nodes).join("; PROXY ");
                }

                if (!first_country) {
                    pac_script += "if (" + country_specific_service_rules.join(" || ") + ") { return 'PROXY " + proxystring + "';} ";
                    first_country = true;
                } else {
                    pac_script += "else if (" + country_specific_service_rules.join(" || ") + ") { return 'PROXY " + proxystring + "';} ";
                }
            }
    }

    debug(rules_list);

    set_storage("services", service_list.join(","));
    set_storage("countries_available", country_list.join(","));
    set_storage("rules_available", rules_list.join(";;;"));


    pac_script += " else { return 'DIRECT'; }";
    pac_script += "}";

    set_storage("pac_script", pac_script);


    };

    /**
     * tries to cast a string into bool
     * chrome saves localStorage vars in string only. Needed for conversion
     * @param  {string} str string to casat
     * @return {bool}
     */
    var try_parse_bool = function (str) {

        debug(str);
        if (str === 'false') {
            return false;
        } else if (str === 'true') {
            return true;
        } else {
            return str;
        }
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
     * Saves a value to a specific team in storage
     * @param {string} key   key for saving
     * @param {string} value value for saving to the key
     */
    var set_storage = function(key, value) {
        "use string";
        debug("Writing storage '" + key + "' with value '" + value + "'");
        localStorage[key] = value;
    };

    /**
     * Loads external config and saves in localStorage
     * Invokes createPacFromConfig after fetching
     * @param  {Function} callback callback after execution
     */
    loadExternalConfig = function (callback) {
        if (callback === undefined) {
            callback = function () {};
        }

        request.Request({
            url: "http://proxmate.dave.cx/api/config.json?key=" + get_from_storage("api_key"),
            onComplete: function (response) {
                var config = response.text;
                // Save the config in localStorage. For fallback
                localStorage.last_config = config;
                createPacFromConfig(config);

                callback();
            }
        }).get();
    };

    /**
     * Will be invoked when clicking the ProxMate logo. Simply toggles the plugins status
     */
    setPluginStatus = function () {
        var toggle = localStorage.status;

        if (toggle === true) {
            this.contentURL = selfData.url("images/icon16_gray.png");

            localStorage.status = false;

            require("preferences-service").reset("network.proxy.type");
            require("preferences-service").reset("network.proxy.http");
            require("preferences-service").reset("network.proxy.http_port");
        } else {
            this.contentURL = selfData.url("images/icon16.png");
            localStorage.status = true;

            // ProxMate has just been turned on. Set the pac script for proxying.
            resetProxy();
        }
    };

    /**
     * Initialises a specific localStorage space
     * @param  {string} str localStorage key
     * @param  {string} val localStorage value
     */
    initStorage = function (str, val) {
        if (val === undefined) {
            val = true;
        }

        if (localStorage[str] === undefined) {
            localStorage[str] = val;
        }
    };

    /**
     * Creates listeners for reacting on worker events
     * Basically for pagemod <-> main.js communication
     * @param  {object} worker pagemod worker
     */
    initListeners = function (worker) {

        // function for checking modul statuses in pagemods
        worker.port.on('checkStatus', function (data) {
            var module, status, responseHash;

            // ResponseHash is used for specific event communication
            module = data.param;
            status = false;
            responseHash = data.hash;

            switch (module) {
            case "global":
                status = get_from_storage("status");
                break;
            case "cproxy":
                status = get_from_storage("status_cproxy");
                break;
            default:
                status = get_from_storage(module);
            }

            worker.port.emit(responseHash,
                {
                    enabled: status
                });
        });

        // Function used for making ajax calls
        // Firefox forbids this in pagemods
        worker.port.on("loadResource", function (data) {
            var url, responseHash;

            url = data.param;
            responseHash = data.hash;

            require("request").Request({
                url: url,
                onComplete: function (response) {
                    worker.port.emit(responseHash, { response: response.text });
                }
            }).get();
        });

        worker.port.on("getFromStorage", function (data) {
            var key, responseHash;
            key = data.param;
            responseHash = data.hash;

            debug("Get from storage:" + key);

            worker.port.emit(responseHash,
            {
                data: get_from_storage(key)
            });
        });
    };

    /**
     * Attaches a pagemod if regex rule matches. Will invoke initListeners
     * @param  {string} regex  regex url for attaching
     * @param  {string} script scriptfile for attaching to pagemod
     */
    createPagemod = function (regex, script) {
        return pageMod.PageMod({
            include: [regex],
            contentScriptFile: [
                selfData.url('jquery.js'),
                selfData.url('proxy.js'),
                selfData.url(script)
            ],
            onAttach: initListeners
        });
    };

    /**
     * Invoke proxy fetching all 10 minutes
     */
    timers.setInterval(function () {
        if (localStorage.status === true) {
            loadExternalConfig(resetProxy);
        } else {
            loadExternalConfig();
        }
    }, 600000);

    /**
     * main.js starting point. Will invoke itself
     */
    init = (function () {

        var statusButton = require("widget").Widget({
            id: "open-proxmate-btn",
            label: "Click to Activate/Deactivate Proxmate",
            contentURL: selfData.url("images/icon16.png"),
            onClick: setPluginStatus
        });

        initStorage("firststart");
        initStorage("status");
        initStorage("pac_script", "");

        initStorage("account_type" , 0);

        if (localStorage.status === true) {
            loadExternalConfig(resetProxy);
        } else {
            loadExternalConfig();
        }

        if (localStorage.firststart === true) {

            require("tab-browser").addTab("http://proxmate.dave.cx/?ref=firefox_installation");
            require("tab-browser").addTab("https://www.facebook.com/ProxMate/");

            localStorage.firststart = false;
        }


        // I asked in #amo-editors if a pagemod for EVERY page would be acceptable. Answer was yes.
        // createPagemod(/.*/, 'modules/bannerloader.js');
        createPagemod(/.*youtube\.com\/results.*/, 'modules/youtube-search.js');
        createPagemod(/.*youtube\.com\/watch.*/, 'modules/youtube.js');
        createPagemod(/.*youtube\.com\/movie.*/, 'modules/youtube-movies.js');
        createPagemod(/.*youtube\.com\/user.*/, 'modules/youtube-paid.js');

        if (localStorage.status === false) {
            statusButton.contentURL = selfData.url("images/icon16_gray.png");

            require("preferences-service").reset("network.proxy.type");
            require("preferences-service").reset("network.proxy.http");
            require("preferences-service").reset("network.proxy.http_port");
        } else {
            statusButton.contentURL = selfData.url("images/icon16.png");
        }
    }());

    preferences.on("", function(pref_name) {
        set_storage(pref_name, preferences.prefs[pref_name]);
        if (localStorage.status === true) {
            loadExternalConfig(resetProxy);
        } else {
            loadExternalConfig();
        }
    });
};