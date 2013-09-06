define(['mediator', 'logger', 'preferences'], function (Mediator, Logger, Preferences) {
	"use strict";
	/**
	 * Mapping chrome icon click to 'on_chrome_addon_icon_click'
	 */
	var bind_addon_icon_click = function () {
		Logger.log("[chrome.js]: Binding chrome addon icon click")
		chrome.browserAction.onClicked.addListener(function () {
			Mediator.publish('on_chrome_addon_icon_click');
		});
	};

	var initialise = function () {
		Logger.log("[chrome.js]: Binding chrome events to Mediator.");
		bind_addon_icon_click();
	};

	/**
	 * Sets the browser icon to path
	 * @param  {string} path path where to find the new icon
	 */
	var set_browser_icon = function (path) {
		chrome.browserAction.setIcon({path: path});
	};

	/**
	 * Removes the icon subtext
	 */
	var remove_badge_text = function () {
		chrome.browserAction.setBadgeText({text: ""})
	};

	/**
	 * Sets icon subtext to text
	 * @param  {string} text text
	 */
	var set_badge_text = function (text) {
		chrome.browserAction.setBadgeText({text: text});
	};

	/**
	 * Create a tab with url
	 * @param  {string} url url to open
	 */
	var create_tab = function (url) {
		chrome.tabs.create({
            url: url
        });
	};

	/**
	 * Binds a chrome message passing event for communication with page script
	 * @param  {string}   eventstring eventstring to bind
	 * @param  {Function} callback    callback to execute
	 */
	var bind_event = function (eventstring, callback) {
		chrome.runtime.onMessage.addListener(function (request, sender, send_response) {
			// request.event_string;
			if (request.event_string === eventstring) {
				Logger.log("[chrome.js]: Receiving chrome event {0}.".format(eventstring));

				var parameter = request.event_parameter.split(',,,');

				if (request.event_parameter.length === 0) {
					parameter = [];
				}

				parameter.push(send_response);
				callback.apply(this, parameter);
			}

			return true;
		});
	};

	/**
	 * Emits a event back to all listeners
	 * @param  {string} eventstring eventstring
	 */
	var emit_event = function (eventstring, parameter, callback) {
		callback = callback || function () {};
		parameter = parameter || [];

		if (!(parameter instanceof Array)) {
			parameter = [parameter];
		}

		chrome.runtime.sendMessage(
	        {
	            event_string: eventstring,
	            event_parameter: parameter.join(',,,')
	        },
	        function (response) {
                callback.call(this, response);
	        }
	    );
	};

	return {
		initialise: initialise,
		set_badge_text: set_badge_text,
		remove_badge_text: remove_badge_text,
		set_browser_icon: set_browser_icon,
		create_tab: create_tab,
		bind_event: bind_event,
		emit_event: emit_event
	}
});