define(['jquery'], function ($) {

	var initialise = function () {};

	/**
	 * Generic ajax method. Loads content and executes callback / fallback if applicable
	 * @param  {string}   method   GET or POST
	 * @param  {string}   url      the URL to request
	 * @param  {boolean}   async    use asnyc mode or not
	 * @param  {Function} callback callback if successful
	 * @param  {Function}   fallback fallback if not successful
	 */
	var ajax = function (method, url, async, callback, fallback) {
		async = async || true;
		callback = callback || function () {};
		fallback = fallback || function () {};

		var xhr = new XMLHttpRequest();
	    xhr.open(method, url, async);
	    xhr.send();

	    xhr.onreadystatechange = function () {
	    	if (xhr.readyState === 4) {
	    		if (xhr.status === 200) {
	    			callback(xhr.responseText);
	    		} else {
	    			fallback();
	    		}
	    	}
	    };
	};

	/**
	 * Wrapper for ajax. Executes GET request
	 * @param  {string}   url      the URL to request
	 * @param  {Function} callback callback if successful
	 * @param  {Function}   fallback fallback if not successful
	 */
	var get = function (url, callback, fallback) {
		callback = callback || function () {};
		fallback = fallback || function () {};

		ajax('GET', url, true, callback, fallback);
	};

	/**
	 * Wrapper for ajax. Executes POST request
	 * @param  {string}   url      the URL to request
	 * @param  {Function} callback callback if successful
	 * @param  {Function}   fallback fallback if not successful
	 */
	var post = function (url) {
		callback = callback || function () {};
		fallback = fallback || function () {};

		ajax('POST', url, true, callback, fallback);
	};

	return {
		initialise: initialise,
		get: get,
		post: post
	}
});