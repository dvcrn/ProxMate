/**
 * ProxMate is created and © by David Mohl.
 * It's pretty cool that you're interested in how this extension works but please don't steal what you'll find here.
 *
 * Interested in helping ProxMate and/or licensing? Contact me at proxmate@dave.cx
 */

/*jslint browser: true*/
/*global checkStatus, $, loadBanner, proxifyUri, getUrlParam, loadOverlay, getUrlFor, sendActionWithCallback*/

var global = checkStatus("global");
var general = checkStatus("status_general_us");
var youtube = checkStatus("status_youtube");

$.when(global, youtube, general).done(function () {
    "use strict";
    if (!global.response.enabled || !youtube.response.enabled || !general.response.enabled) {
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
            $.get(getUrlFor("elements/youtube-proxmatebar.html"), function (data) {
                $('<link>').attr('rel', 'stylesheet')
                    .attr('type', 'text/css')
                    .attr('href', getUrlFor("elements/youtube-proxmatebar.css"))
                    .appendTo('head');

                $("#player").prepend(data);

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
        var proxmate_parameter, script, scriptcontent, n, superscript, script_count, iteration;
        proxmate_parameter = getUrlParam('proxmate');

        // Moving this into own function so we can inject it later into the page body
        function proxmateCheckAndReload () {
            var element = $("[id^=player-unavailable]");
            if (element.length > 0 && !element.hasClass("hid")) {

                $(".content .message").html("ProxMate will unblock this video now :)");
                $(".content .submessage").html("Just a moment.");

                window.location.href = window.location.href + "&proxmate=us";
            }
        }

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

            $("#player-api").html("");
            superscript = "";
            script_count = $("script").length;
            iteration = 0;
            $("script").each(function () {
                iteration++;
                if ($(this).contents()[0] !== undefined) {
                    scriptcontent = $(this).contents()[0].data;
                    n = scriptcontent.replace(/videoplayback%3F/g, "videoplayback%3Fproxmate%3D" + proxmate_parameter + "%26"); // Append our proxmate param so the pac script wil care of it
                    superscript += " " + n;
                }

                if (iteration === script_count) {
                    executeScript(superscript);
                }
            });


        } else {
            proxmateCheckAndReload();
        }

        // This function will be injected in youtube to automatically monitor all ajax requests and check back with ProxMate
        function overRideAjax () {
            var open = window.XMLHttpRequest.prototype.open,
                send = window.XMLHttpRequest.prototype.send,
                onReadyStateChange;

            function openReplacement (method, url, async, user, password) {
                this.url = url;
                return open.apply(this, arguments);
            }

            function onReadyStateChangeReplacement () {
                if (this.readyState == 4) {
                    var expression = /youtube.com\/watch\?v=(.*)/g;
                    // Check if the loaded url is a youtube watch URL
                    if (this.url.search(expression) != -1) {
                        $(document).ready(function () {
                            setTimeout(proxmateCheckAndReload, 1000);
                        });
                    }
                }

                if(this._onreadystatechange) {
                    return this._onreadystatechange.apply(this, arguments);
                }
            }

            function sendReplacement (data) {
                if(this.onreadystatechange) {
                    this._onreadystatechange = this.onreadystatechange;
                }
                this.onreadystatechange = onReadyStateChangeReplacement;

                return send.apply(this, arguments);
            }

            window.XMLHttpRequest.prototype.open = openReplacement;
            window.XMLHttpRequest.prototype.send = sendReplacement;
        }

        loadJquery();
        // by not using the isFunction parameter, the function will become available in the document context itself
        executeScript(proxmateCheckAndReload);
        executeScript(overRideAjax, true);

    });
});