Proxmate.preferences_get('addon_is_active', function (global_status) {
	if (global_status) {
		Proxmate.storage_get(['offline_config', 'offline_pac_script'], function (stored_object) {
			var config = stored_object.offline_config;
			var pac = stored_object.offline_pac_script;

			var shExpMatch = function (url, pattern) {
				pattern = pattern.replace(/\./g, '\\.');
				pattern = pattern.replace(/\*/g, '.*');
				pattern = pattern.replace(/\?/g, '.');
				var newRe = new RegExp('^' + pattern + '$');
				return newRe.test(url);
			};

			eval(pac);

			var config = JSON.parse(config);
		    var account_type = config.meta.account_type
		    var evaluated_pac = FindProxyForURL(window.location.href, window.location.hostname);


		    if ((account_type === 'Free' && evaluated_pac !== 'DIRECT') || window.location.href.indexOf('http://proxmate.dave.cx/') != -1) {
		        $(document).ready(function () {
		            console.info("loading PM banner");
		            PmBanner.load_banner_stylesheet();
		            PmBanner.load_banner_html();
		            // Collapse the banner after 5s
		            setTimeout(function () {
		            	$('#proxmate_banner').removeClass('proxmate_banner_expanded');
		            }, 5000);
		        });
		    }
		});
	}
});