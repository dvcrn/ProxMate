/**
 * ProxMate is created and © by David Mohl.
 * It's pretty cool that you're interested in how this extension works but please don't steal what you'll find here.
 *
 * Interested in helping ProxMate and/or licensing? Contact me at proxmate@dave.cx
 */

/*jslint browser: true*/
/*global checkStatus, $, loadBanner, getUrlParam, getUrlFor*/

var global = checkStatus("global");
var general = checkStatus("status_general_us");
var youtube = checkStatus("status_youtube");

$.when(global, youtube, general).done(function () {
    "use strict";
    if (!global.response.enabled || !youtube.response.enabled || !general.response.enabled) {
        return;
    }

    $(document).ready(function () {
        var proxmate_parameter, url;

        proxmate_parameter = getUrlParam('proxmate');
        if (proxmate_parameter === "undefined") {
            if ($('.ypc-channel-offers-nooffer-warning').length > 0) {
                $('.ypc-channel-offers-nooffer-warning').html("ProxMate will unblock this channel now");
                url = window.location.href;
                window.location.href = url.substring(0, url.indexOf('?')) + "?proxmate=us";
            }
        }
    });
});