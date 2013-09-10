define(['mediator', 'logger'], function (Mediator, Logger) {
	"use strict";

	var intervals = [];

	var initialise = function () {};

	/**
	 * Adds a new timer, which will be executed all X seconds
	 * @param  {int} millis interval in milliseconds
	 * @param  {string} eventstring    eventstring to call
	 * @return {int} timer id
	 */
	var add_timer = function (millis, eventstring) {
		var available_intervals = intervals.length;
		var new_interval_identifier = available_intervals + 1;

		Logger.log("[timer.js]: Adding a new timer with id {0} for event '{1}' - all {2} millis.".format(
			new_interval_identifier, eventstring, millis));

		var interval = setInterval(function () {
			Mediator.publish(eventstring);
		}, millis);

		intervals.push(interval);

		return new_interval_identifier;
	};

	/**
	 * Stops timer for id
	 * @param  {int} id timer id
	 */
	var stop_timer = function (id) {
		Logger.log("[timer.js]: Stopping timer for ID {0}.".format(id));
		clearInterval(intervals[id]);
	};

	return {
		initialise: initialise,
		add_timer: add_timer,
		stop_timer: stop_timer
	};
});