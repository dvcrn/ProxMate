define(['logger', 'mediator', 'config', 'jquery'], function (Logger, Mediator, Config, $) {
	"use strict";

	var CLOUD_MAX_BYTES_PER_ITEM = chrome.storage.sync.QUOTA_BYTES_PER_ITEM;
	var SPLIT_IDENTIFIER = '--SPLIT--:';

	var initialise = function () {};

	/**
	 * Returns value for 'key' from storage
	 * @param  {string|array} key Storage key or array
	 * @param  {function} callbackthing
	 */
	var get = function (key, callback) {
		callback = callback || function () {};

		Logger.log("[storage.js]: Getting from storage: {0}".format(key));
		chrome.storage.local.get(key, function (stored_obj) {
			if (key instanceof Array) {
				callback(stored_obj)
			} else {
				callback(stored_obj[key]);
			}
		});
	};

	/**
	 * Writes value with thing into storage. If thing is a object, value is not neccessary
	 * @param  {string} thing   the key or object to save
	 * @param  {string} value value to write into storage
	 */
	var set = function (thing, value, callback) {
		callback = callback || function () {};
		value = value || "";

		var object = {}
		if (thing instanceof Object) {
			object = thing;
		} else {
			object[thing] = value;
		}

		Logger.log("[storage.js]: Writing into storage: '{0}'.".format(JSON.stringify(object)));
		Mediator.publish('storage_update', [object]);
		chrome.storage.local.set(object, callback);
	};

	/**
	 * Kills everything within the local storage
	 * @param  {Function} callback callback
	 */
	var clear = function (callback) {
		Logger.warn("[storage.js]: Deleting everything inside local storage!");
		chrome.storage.local.clear(callback);
	};

	/**
	 * local storage -> google cloud Storage
	 * @param {function} callback callback to execute after
	 */
	var save_in_cloud = function (callback) {
		callback = callback || function () {};

		Logger.log("[storage.js]: Writing localstorage into google cloud...");
		chrome.storage.local.get(null, function (elements) {
			chrome.storage.sync.clear(function () {
				// Check if elements are in the correct size. If not, we need to put them into smaller parts
				for (index in elements) {
					var current_element = elements[index];
					if (typeof current_element == 'string') {
						if (current_element.length > CLOUD_MAX_BYTES_PER_ITEM) {
							Logger.log("[storage.js]: Element '{0}' has {1} characters. Max allowed for cloud sync is {2}. Attempting to split up...".format(
								index, current_element.length, CLOUD_MAX_BYTES_PER_ITEM));

							var parts_required = Math.ceil(current_element.length / CLOUD_MAX_BYTES_PER_ITEM);
							var bytes_per_part = Math.ceil(current_element.length / parts_required);
							var sliced_string = current_element;
							var splitted_element = {};
							var part_index = [];

							for (var i = 1; i <= parts_required; i++) {
								var current_part_index = '__{0}_{1}'.format(index, i);
								var extracted_string = sliced_string.slice(0, bytes_per_part);

								// Remove the sliced part from the rest of the string
								sliced_string = sliced_string.slice(extracted_string.length, sliced_string.length);

								splitted_element[current_part_index] = extracted_string;
								part_index.push(current_part_index);
							}

							// Also add the original key and reference to the part indexes
							splitted_element[index] = '--SPLIT--:{0}'.format(part_index.join(','));
							Logger.log("[storage.js]: Splitted '{0}' into {1} parts á ~{2} bytes.".format(index, parts_required, bytes_per_part));

							// Merge splitted element with original elements object
							$.extend(elements, splitted_element);
						}
					}

				}
	        	chrome.storage.sync.set(elements, callback);
	    	});
		});
	};

	/**
	 * Google cloud storage -> local storage
	 * @param {function} callback callback to execute after
	 */
	var apply_from_cloud = function (callback) {
		callback = callback || function () {};

		Logger.log("[storage.js]: Applying google cloud storage to localstorage");
		chrome.storage.sync.get(null, function (elements) {
			if (Object.keys(elements).length === 0) {
				Logger.log("[storage.js]: No elements in google cloud. Skipping.");
				callback.call();
				return;
			}

			chrome.storage.local.clear(function () {
				// Check if there are any splitted elements in the storage
				for (var index in elements) {
					var current_element = elements[index];
					if (typeof current_element == 'string') {
						if (current_element.indexOf('--SPLIT--:') != -1) {
							Logger.log("[storage.js]: Found splitted element for key '{0}'. Attempting to merge...".format(index));
							var part_index = current_element.slice(SPLIT_IDENTIFIER.length, current_element.length).split(',');

							var merged_element = '';
							for (var i = 0; i < part_index.length; i++) {
								merged_element += elements[part_index[i]];
								delete elements[part_index[i]];
							}

							elements[index] = merged_element;
							Logger.log("[storage.js]: Restored '{0}' from {1} parts.".format(index, part_index.length));
						}
					}
				}
	        	chrome.storage.local.set(elements, callback);
	        	Mediator.publish('addon_storage_apply_from_cloud');
	    	});
		});
	};

	return {
		get: get,
		set: set,
		clear: clear,
		save_in_cloud: save_in_cloud,
		apply_from_cloud: apply_from_cloud
	};
});