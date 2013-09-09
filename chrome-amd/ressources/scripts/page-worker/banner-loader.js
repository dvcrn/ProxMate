Proxmate.storage_get('offline_config', function (config) {
    var config = JSON.parse(config);
    var account_type = config.meta.account_type

    if (account_type === 'Free') {
        $(document).ready(function () {
            console.info("loading PM banner");
            PmBanner.load_banner_stylesheet();
            PmBanner.load_banner_html();
        });
    }
});