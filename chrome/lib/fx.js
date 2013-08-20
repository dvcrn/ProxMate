/**
 * ProxMate is created and © by David Mohl.
 * It's pretty cool that you're interested in how this extension works but please don't steal what you'll find here.
 *
 * Interested in helping ProxMate and/or licensing? Contact me at proxmate@dave.cx
 */

/*jslint browser: true*/
/*global chrome, $, console*/

/**
 * Sends a message to background.js
 * @param  {string} actionString messagename
 * @param  {string} param        parameter
 * @return {object}              jQuery promise
 */
var sendAction = function (actionString, param) {
    "use strict";

    var defer;

    if (param === undefined) {
        param = null;
    }

    defer = $.Deferred();

    chrome.extension.sendRequest(
        {
            action: actionString,
            param: param
        },
        function (response) {
            if (response) {
                // Add response to promise and resolve it
                defer.response = response;
                defer.resolve();
            }
        }
    );

    return defer;
};

/**
 * Sends a message to background.js, executes callback on done event
 * @param  {string}   actionString event name
 * @param  {string}   param        param for background
 * @param  {function} callback     function to execute on success
 */
var sendActionWithCallback = function (actionString, param, callback) {
    "use strict";
    var defer = sendAction(actionString, param);
    defer.done(function () {
        callback(defer.response);
    });
};

/**
 * Sends "checkStatus" message for a certain module to background.js
 * @param  {string} module modulename
 * @return {object}        jQuery promise
 */
var checkStatus = function (module) {
    "use strict";
    return sendAction("checkStatus", module);
};

/**
 * Strips a get parameter from url
 * @param  {string} name parameter key
 * @return {string}      parameter value
 */
var getUrlParam = function (name) {
    "use strict";
    return decodeURI((new RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [null])[1]);
};

/**
 * Gets addon internal url for a specific file
 * @param  {string} file filepath
 * @return {string}      full url for internal file
 */
var getUrlFor = function (file) {
    "use strict";
    return chrome.extension.getURL(file);
};

var bool = function (str) {
    "use strict";
    if (str === undefined) {
        return false;
    }

    if (str.toLowerCase() === 'false') {
        return false;
    } else if (str.toLowerCase() === 'true') {
        return true;
    } else {
        return undefined;
    }
};

/**
 * loads ProxMates overlay
 * @param  {Function} callback callback for executing when overlay is clicked
 */
var loadOverlay = function (callback) {
    "use strict";

    // Load the css and html for overlay
    $('<link>').attr('rel', 'stylesheet')
        .attr('type', 'text/css')
        .attr('href', getUrlFor("elements/overlay.css"))
        .appendTo('head');

    $.get(getUrlFor("elements/overlay.html"), function (data) {
        $("body").prepend(data);
        $("#pmOverlay").fadeIn("slow");
        $("#pmOverlay").click(function () {
            callback();
        });
    });
};

/**
 * Loads ProxMates ad banner
 */
var loadBanner = function () {
    "use strict";

    // Load overlay css
    $('<link>').attr('rel', 'stylesheet')
        .attr('type', 'text/css')
        .attr('href', getUrlFor("elements/overlay.css"))
        .appendTo('head');

    // Load banner
    $.get(getUrlFor("elements/banner.html"), function (data) {
        $("body").append(data);
        $("#pmBanner").fadeIn("slow");

        $("#pmBannerClose").click(function () {
            $("#pmBanner").fadeOut("slow", function () {
                $("#pmPusher").slideUp("slow");
            });
        });

        // Cascade banner
        setTimeout(function () {
            $("#pmBanner").addClass("smallBanner");
        }, 5000);
    });
};

/**
 * Loads jQuery into page context and executes callback
 * @param  {Function} callback callback to execute with jQuery instance
 */
var loadJquery = function (cb) {
    cb = cb || function () {};
    // Load the script
    var script = document.createElement("SCRIPT");
    script.src = getUrlFor("lib/jquery-2.0.3.min.js");
    script.type = 'text/javascript';
    document.getElementsByTagName("head")[0].appendChild(script);

    // Poll for jQuery to come into existance
    var checkReady = function(callback) {
        if (window.jQuery) {
            callback(jQuery);
        }
        else {
            window.setTimeout(function() { checkReady(callback); }, 100);
        }
    };

    // Start polling...
    checkReady(function($) {
        cb($);
    });
};

/**
 * Executes a script in page context
 * @param  {string} script the script itself
 * @param {bool} isFunction if the to execute script is a function
 */
var executeScript = function (script, isFunction) {
    var isFunction = isFunction || false;
    if (isFunction) {
        script = "(" + script + ")();"
    }

    var g, s;
    g = document.createElement('script');
    s = document.getElementsByTagName('script')[0];
    g.text = script;
    s.parentNode.insertBefore(g, s);
};