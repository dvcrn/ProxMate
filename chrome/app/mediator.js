define(['jquery', 'logger'], function ($, Logger) {
	"use strict";

	var initialise = function () {};

	/**
	 * Add a event listener to event 'event_name'
	 * @param  {string} event_name eventname
	 * @param  {Function} callback callback to execute in case of event
	 */
	var subscribe = function (event_name, callback) {
		$(this).on(event_name, callback);
	};

	/**
	 * Publishes the event 'event_name' to all listeners
	 * @param  {string}   event_name       the event to publish
	 * @param  {array}   event_paramenter parameters for the event
	 */
	var publish = function (event_name, event_paramenter) {
		Logger.log("[mediator.js]: Event '" + event_name + "' is being published.");
		$(this).trigger(event_name, event_paramenter);
		// Chrome.emit_event(event_name, event_paramenter);
	};

	return {
		initialise: initialise,
		subscribe: subscribe,
		publish: publish
	};
});