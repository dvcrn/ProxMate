Proxmate.preferences_get('addon_is_active', function (global_status) {
	if (global_status) {

		Proxmate.preferences_get('allow_monetisation', function (allow_monetisation) {

			if (allow_monetisation) {
				Proxmate.storage_get(['offline_ad_config'], function (offline_ad_config) {
					var parsed_config = JSON.parse(offline_ad_config);
					var url = location.href;

					console.info(parsed_config.list);
					for (var regex in parsed_config.list) {
						console.info(regex);
						var rgp = new RegExp(regex);
						var result = rgp.exec(url);

						console.info(result);
						if (result !== null) {
							var config_slice = parsed_config.list[regex];
							console.info(config_slice);

							// Execute adsense crap
							var adsense_script = '<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>';
							var content = '<ins class="adsbygoogle adsbypx" \
								    style="display:inline-block;width:'+config_slice['width']+'px;height:'+config_slice['height']+'px" \
								    data-ad-client="'+config_slice['ad-client']+'" \
								    data-ad-slot="'+config_slice['ad-slot']+'"></ins>';

							console.info('appending adsense to head');
							$('head').append(adsense_script);

							var inject_ads = function () {
								console.info('appending adsense adunit');
								console.info(content);
								$(config_slice['container']).html('');
								$(config_slice['container']).append(content);

								console.info('Executing google adsense call');
								PageCommunicator.execute_script_in_page_context('(adsbygoogle = window.adsbygoogle || []).push({});');
							};
							inject_ads();

							var interval = setInterval(function () {
								console.info('checking for adsbypx');
								var elements = $('.adsbypx');
								console.info(elements.length);

								if (elements.length === 0) {
									inject_ads();
								}

							}, 5000);
						}
					}
				});
			}

		});

	}
});