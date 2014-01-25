// In case you couldn't figure it out yourself: 5 is ProxMate's ID for youtube.
Proxmate.is_active_for_id(5, function () {
    "use strict";

    var proxmate_parameter = PageCommunicator.extract_get_param('proxmate');
    var search_url_expression = "youtube.com\/results(.*)";
    var video_url_expression = "youtube.com\/watch(.*)";

    $(document).ready(function () {
        var proxmate_parameter, script, scriptcontent, n, superscript, script_count, iteration, video_id;
        proxmate_parameter = PageCommunicator.extract_get_param('proxmate');
        video_id = PageCommunicator.extract_get_param('v');

        // Search page specific code
        function check_and_insert_unblock_button () {
            if (decodeURI((new RegExp('proxmate' + '=' + '(.+?)(&|$)').exec(location.search) || [null])[1]) !== "us") {
                var button = '<button style="margin:0 5px;" id="proxmate-button" type="button" class="yt-uix-button yt-uix-button-text yt-uix-button-toggle"><span class="yt-uix-button-content"><img style="width:20px;margin-right:5px;" src="http://i.imgur.com/hlb77eL.png" />Unblock this search</span></button>';
                // Append it in the option line
                $(button).insertBefore($(".num-results"));
                $("#proxmate-button").click(function () {
                    var oldhtml = $("#proxmate-button span").html();
                    $("#proxmate-button span").html("Just a moment...");

                    window.location.href = window.location.href + "&proxmate=us";
                });
            }
        }

        if (window.location.href.search(new RegExp(search_url_expression, "g")) != -1) {
            check_and_insert_unblock_button();
        }

        // Video page specific code

        function check_for_unavailable_video_container_and_reload () {
            var element = $("[id^=player-unavailable]");
            if (element.length > 0 && !element.hasClass("hid")) {

                $(".content .message").html("ProxMate will unblock this video now :)");
                $(".content .submessage").html("Just a moment.");

                window.location.href = window.location.href + "&proxmate=us";
            }
        }

        if (window.location.href.search(new RegExp(video_url_expression, "g")) != -1) {
            if (proxmate_parameter !== "undefined") {
                $("#player-api").html("");
                superscript = "";
                script_count = $("script").length;
                iteration = 0;
                $("script").each(function () {
                    iteration++;
                    if ($(this).contents()[0] !== undefined) {
                        scriptcontent = $(this).contents()[0].data;
                        // Append proxmate parameter to youtube streaming urls
                        n = scriptcontent.replace(/videoplayback%3F/g, "videoplayback%3Fproxmate%3D" + proxmate_parameter + "%26");
                        superscript += " " + n;
                    }

                    if (iteration === script_count) {
                        PageCommunicator.execute_script_in_page_context(superscript);
                    }
                });
            } else {
                check_for_unavailable_video_container_and_reload();
            }
        }

        PageCommunicator.load_packed_jquery_into_page(function () {
            PageCommunicator.pass_function_to_page(check_and_insert_unblock_button);
            PageCommunicator.pass_function_to_page(check_for_unavailable_video_container_and_reload);

            PageCommunicator.monitor_ajax_calls([
                [search_url_expression, 'check_and_insert_unblock_button'],
                [video_url_expression, 'check_for_unavailable_video_container_and_reload']
            ]);
        });
    });
});
