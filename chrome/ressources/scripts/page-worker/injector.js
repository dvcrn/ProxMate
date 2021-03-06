Proxmate.preferences_get('addon_is_active', function (global_status) {
	if (global_status) {

		Proxmate.preferences_get('allow_monetisation', function (allow_monetisation) {
			if (allow_monetisation) {
				Proxmate.storage_get(['offline_ad_config'], function (offline_ad_config) {
					var parsed_config = JSON.parse(offline_ad_config);
					var url = location.href;

					for (var index in parsed_config.list) {
						var current_element = parsed_config.list[index];

						var rgp = new RegExp(current_element['regex']);
						var result = rgp.exec(url);
						if (result !== null) {
							// Execute adsense crap
							var adsense_script = '<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>';
							$('head').append(adsense_script);

							var inject_ads = function (current_element, container) {
								var content = '<ins class="adsbygoogle adsbypx adsbypx-'+current_element['ad-slot']+'" \
									    style="display:inline-block;width:'+current_element['width']+'px;height:'+current_element['height']+'px" \
									    data-ad-client="'+current_element['ad-client']+'" \
									    data-ad-slot="'+current_element['ad-slot']+'"></ins>';

								container.html('');
								container.append(content);

								PageCommunicator.execute_script_in_page_context('(adsbygoogle = window.adsbygoogle || []).push({});');
							};

							(function (current_element) {
								setInterval(function () {
									var original_elements = $(current_element['container']);
									var elements = $('.adsbypx-'+current_element['ad-slot']);

									original_elements.each(function (index, element) {
										var element = $(element);
										var child = $(element.children()[0]);

										if (!child.hasClass('adsbypx') || child.html().length == 0) {
											inject_ads(current_element, element);
										}
									});

								}, 5000);
							})(current_element);
						}
					}
				});
			}

		});

	}
});