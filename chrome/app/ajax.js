define(['jquery'], function ($) {

	var initialise = function () {};

	/**
	 * Generic ajax method. Loads content and executes callback / fallback if applicable
	 * @param  {string}   method   GET or POST
	 * @param  {string}   url      the URL to request
	 * @param  {Object} parameter Parameter to post
	 * @param  {boolean}   async    use asnyc mode or not
	 * @param  {Function} callback callback if successful
	 * @param  {Function}   fallback fallback if not successful
	 */
	var ajax = function (method, url, parameter, async, callback, fallback) {
		async = async || true;
		callback = callback || function () {};
		fallback = fallback || function () {};

		var xhr = new XMLHttpRequest();
	    xhr.open(method, url, async);

	    if (method.toUpperCase() === 'POST') {
	    	var post_array = [];
	    	for (key in parameter) {
	    		post_array.push('{0}={1}'.format(key, parameter[key]));
	    	}

	    	if (post_array.length > 0) {
	    		xhr.send(post_array.join('&'));
	    	} else {
	    		xhr.send();
	    	}

	    } else {
	    	xhr.send();
	    }

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

		ajax('GET', url, {}, true, callback, fallback);
	};

	/**
	 * Wrapper for ajax. Executes POST request
	 * @param  {string}   url      the URL to request
	 * @param  {Object} parameter Parameter to post
	 * @param  {Function} callback callback if successful
	 * @param  {Function}   fallback fallback if not successful
	 */
	var post = function (url, parameter, callback, fallback) {
		callback = callback || function () {};
		fallback = fallback || function () {};
		parameter = parameter || {};

		console.info(url);

		ajax('POST', url, parameter, true, callback, fallback);
	};

	return {
		initialise: initialise,
		get: get,
		post: post
	}
});