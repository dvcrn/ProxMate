/**
 * ProxMate is created and © by David Mohl.
 * It's pretty cool that you're interested in how this extension works but please don't steal what you'll find here.
 *
 * Interested in helping ProxMate and/or licensing? Contact me at proxmate@dave.cx
 */

/*jslint browser: true*/
/*global checkStatus, $, loadBanner, proxifyUri, getUrlParam, loadOverlay, getUrlFor, sendActionWithCallback, loadResource*/

var global = checkStatus("global");
var youtube = checkStatus("status_general_us");

$.when(global, youtube).done(function () {
    "use strict";
    if (!global.response.enabled || !youtube.response.enabled) {
        return;
    }

    $(document).ready(function () {
        /**
         * Creates a banner, places it over the youtube video
         * Clicking the banner will switch from us -> uk and uk -> us
         * @param  {string} current_country     the string of the current country used for unblocking
         * @param  {string} alternative_country the string of the alternative country used for unblocking
         */
        var create_youtube_banner = function (current_country, alternative_country) {
            var ressource = loadResource(getUrlFor("elements/youtube-proxmatebar.html"));
            ressource.done(function () {
                var data = ressource.response.response;

                $('<link>').attr('rel', 'stylesheet')
                    .attr('type', 'text/css')
                    .attr('href', getUrlFor("elements/youtube-proxmatebar.css"))
                    .appendTo('head');

                if ($("#watch7-video").length > 0 ) {
                    $("#watch7-video").prepend(data);
                } else if ($("#watch7-player").length > 0 ) {
                    $("#watch7-player").prepend(data);
                }

                $(".yt-proxmatebar p span").html(current_country.toUpperCase());
                $(".yt-proxmatebar p .alternative-proxy").html(alternative_country.toUpperCase());
                $(".yt-proxmatebar .pm-logo").prop("src", getUrlFor("images/icon48.png"));
                $(".yt-proxmatebar .pm-country-current").prop("src", getUrlFor("images/" + current_country + ".png"));
                $(".yt-proxmatebar .pm-country-alternative").prop("src", getUrlFor("images/" + alternative_country + ".png"));

                $(".yt-proxmatebar").click(function () {
                    var oldurl, newurl;

                    oldurl = window.location.href;
                    newurl = oldurl.replace("proxmate=" + current_country, "proxmate=" + alternative_country);
                    window.location.href = newurl;
                });
            });

        };

        /*
            This code is for reviewers. To understand what we are doing here and why.

            ProxMate unblocks all links having &proxmate=active in their url.
            Youtube loads the video async after the initial pagecall is done. The videostream checks if the sitecall comes from the same IP as the videocall. If it doesn't, the video will be blocked.
            Means we have to proxy both.

            The way we came up with:
            - Get youtubes script for creating the video
            - Replace the videourl inside that script and append &proxmate=active
            - Execute the script again. This will replace the current video container with a new one, including our altered url.

            Using a pac_script entry for this url doesn't work! Otherways we would unblock ALL youtube videos what we clearly don't want!
        */
        var proxmate_parameter, script, scriptcontent, n;
        proxmate_parameter = getUrlParam('proxmate');

        if (proxmate_parameter !== "undefined") {

            // Ensure the UK banner is only loaded when there's a UK proxy available
            sendActionWithCallback("getFromStorage", "countries_available", function (data) {
                if ($.inArray("UK", data.data.split(",")) !== -1) {
                    if (proxmate_parameter === "us") {
                        create_youtube_banner(proxmate_parameter, "uk");
                    } else if (proxmate_parameter === "uk") {
                        create_youtube_banner(proxmate_parameter, "us");
                    }
                }
            });

            var scripts = [];

            $("script").each(function () {
                if ($(this).contents()[0] !== undefined) {
                    scriptcontent = $(this).contents()[0].data;
                    n = scriptcontent.replace(/videoplayback%3F/g, "videoplayback%3Fproxmate%3D" + proxmate_parameter + "%26"); // Append our proxmate param so the pac script wil care of it
                    scripts.push(n);
                    $("body").append($("<script />", {
                        html: n
                    }));
                }
            });


        } else {
            if ($("[id$=player-unavailable]").length > 0) {

                $(".content .message").html("ProxMate will unblock this video now :)");
                $(".content .submessage").html("Just a moment.");

                // Change Icon
                $("[id$=player-unavailable] img").prop("src", getUrlFor("images/waitajax.gif"));
                window.location.href = window.location.href + "&proxmate=us";
            }
        }
    });
});