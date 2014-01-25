// In case you couldn't figure it out yourself: 5 is ProxMate's ID for youtube.
Proxmate.is_active_for_id(5, function () {
    "use strict";
    $(document).ready(function () {

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
        check_and_insert_unblock_button();

        PageCommunicator.load_packed_jquery_into_page(function () {
            PageCommunicator.pass_function_to_page(check_and_insert_unblock_button);
            PageCommunicator.monitor_ajax_calls(/youtube.com\/results(.*)/g, check_and_insert_unblock_button);
        });
    });
});
