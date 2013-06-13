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
var autounblock = checkStatus("status_autounblock_youtube_search");

$.when(global, youtube, general, autounblock).done(function () {
    "use strict";
    if (!global.response.enabled || !youtube.response.enabled || !general.response.enabled || autounblock.response.enabled) {
        return;
    }

    $(document).ready(function () {

        if (getUrlParam('proxmate') !== "us") {
            var button = '<button style="margin:0 5px;" id="proxmate-button" type="button" class="yt-uix-button yt-uix-button-text yt-uix-button-toggle"><span class="yt-uix-button-content"><img style="width:20px;margin-right:5px;" src="' + getUrlFor("images/icon48.png") + '" />Unblock this search</span></button>';
            // Append it in the option line
            $(button).insertBefore($(".num-results"));
            $("#proxmate-button").click(function () {
                var oldhtml = $("#proxmate-button span").html();
                $("#proxmate-button span").html(oldhtml + " <img src='" + getUrlFor("images/load.gif") + "' />");

                window.location.href = window.location.href + "&proxmate=us";
            });
        }
    });
});