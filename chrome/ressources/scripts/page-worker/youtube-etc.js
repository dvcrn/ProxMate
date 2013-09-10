// In case you couldn't figure it out yourself: 5 is ProxMate's ID for youtube.
Proxmate.is_active_for_id(5, function () {
    "use strict";
    $(document).ready(function () {
        if (PageCommunicator.extract_get_param('proxmate') !== "us") {
            var block_indicator = [
                '.yt-alert-message',
                '.ypc-channel-offers-nooffer-warning',
                '.channel-empty-message'
            ];

            var index = 0;
            for (index in block_indicator) {
                var current_block_indicator = block_indicator[index];
                if ($(current_block_indicator).length > 0) {
                    $(current_block_indicator).html("ProxMate will unblock this site now.");

                    if (window.location.href.indexOf("?") !== -1) {
                        window.location.href = window.location.href + "&proxmate=us";
                    } else {
                        window.location.href = window.location.href + "?proxmate=us";
                    }
                }
            }
        }
    });
});
