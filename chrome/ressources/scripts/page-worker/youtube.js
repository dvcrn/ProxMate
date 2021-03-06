// In case you couldn't figure it out yourself: 5 is ProxMate's ID for youtube.
Proxmate.is_active_for_id(5, function () {
    var proxmate_parameter = PageCommunicator.extract_get_param('proxmate');

    $(document).ready(function () {
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

        var proxmate_parameter, script, scriptcontent, n, superscript, script_count, iteration, video_id;
        proxmate_parameter = PageCommunicator.extract_get_param('proxmate');
        video_id = PageCommunicator.extract_get_param('v');

        // Moving this into own function so we can inject it later into the page body
        function check_page_for_unavailable_element_and_reload () {
            var element = $("[id^=player-unavailable]");
            if (element.length > 0 && !element.hasClass("hid")) {

                $(".content .message").html("ProxMate will unblock this video now :)");
                $(".content .submessage").html("Just a moment.");

                window.location.href = window.location.href + "&proxmate=us";
            }
        }

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
            check_page_for_unavailable_element_and_reload();
        }

        PageCommunicator.load_packed_jquery_into_page(function () {
	        PageCommunicator.pass_function_to_page(check_page_for_unavailable_element_and_reload);
	        PageCommunicator.monitor_ajax_calls(/youtube.com\/watch\?v=(.*)/g, check_page_for_unavailable_element_and_reload);
        });
    });
});
