(function () {
	"use strict";
	var PageCommunicator = function () {

		this.monitored_ajax_calls = [];

		/**
		 * Creates a script tag with script content in page
		 * @param  {string} script script to wrap inside script tag
		 */
		this.append_script_to_page = function(script) {
			// console.info('----------');
			// console.info(script);
			// console.info('----------');
		    var g, s;
		    g = document.createElement('script');
		    s = document.getElementsByTagName('script')[0];
		    g.text = script;
		    s.parentNode.insertBefore(g, s);
		};

		/**
		 * Executes a script in page context instead of addon context
		 * @param  {string}  script     the script to execute
		 */
		this.execute_script_in_page_context = function (script) {
		    this.append_script_to_page(script);
		};

		/**
		 * Executes function in page context
		 * @param  {string} fx the function
		 */
		this.execute_function_in_page_context = function (fx, parameter) {
			parameter = parameter || [];

			var script = "(" + fx + ")(" + JSON.stringify(parameter) + ");" // Wrap the script in a anonymous function
		    this.append_script_to_page(script);
		};

		/**
		 * Makes a function available in page
		 * @param {string} function the function to make available
		 */
		this.pass_function_to_page = function(fx) {
			this.append_script_to_page(fx);
		};

		/**
		 * Extracts get parameter from url
		 * @param  {string} key key to extract the value from
		 * @return {string}     parameter value
		 */
		this.extract_get_param = function (key) {
			return decodeURI((new RegExp(key + '=' + '(.+?)(&|$)').exec(location.search) || [null])[1]);
		};

		/**
		 * Loads packed jquery into page
		 * @param {Function} cb callback
		 */
		this.load_packed_jquery_into_page = function (cb) {
		    cb = cb || function () {};
		    // Load the script
		    var script = document.createElement("SCRIPT");
		    script.src = Proxmate.get_addon_url("vendor/jquery/jquery.min.js");
		    script.type = 'text/javascript';
		    document.getElementsByTagName("head")[0].appendChild(script);

		    // Poll for jQuery to come into existance
		    var checkReady = function(callback) {
		        if (window.jQuery) {
		            callback(jQuery);
		        }
		        else {
		            window.setTimeout(function() { checkReady(callback); }, 100);
		        }
		    };

		    // Start polling...
		    checkReady(function($) {
		        cb($);
		    });
		};

		/**
		 * Monitors ajax calls. If a ajax call to matches {expression}, callback will get executed
		 * @param  {string} expression          regex expression
		 * @param  {Function} function_to_execute function to execute, duh.
		 */
		this.monitor_ajax_calls = function(expression_array) {

	        // This function will be injected in youtube to automatically monitor all ajax requests and check back with ProxMate
	        function overrides_ajax_calls (expression_array) {

	            var open = window.XMLHttpRequest.prototype.open,
	                send = window.XMLHttpRequest.prototype.send,
	                onReadyStateChange;

	            function openReplacement (method, url, async, user, password) {
	                this.url = url;
	                return open.apply(this, arguments);
	            }

	            function onReadyStateChangeReplacement () {
	                if (this.readyState == 4) {

	                	for (var i = 0; i < expression_array.length; i++) {
	                		if (this.url.search(RegExp(expression_array[i][0], "g")) != -1) {
	                			$(document).ready(function () {
	                				setTimeout(window[expression_array[i][1]], 1000);
	                			});
	                		}
	                	}

	                }

	                if(this._onreadystatechange) {
	                    return this._onreadystatechange.apply(this, arguments);
	                }
	            }

	            function sendReplacement (data) {
	                if(this.onreadystatechange) {
	                    this._onreadystatechange = this.onreadystatechange;
	                }
	                this.onreadystatechange = onReadyStateChangeReplacement;

	                return send.apply(this, arguments);
	            }

	            window.XMLHttpRequest.prototype.open = openReplacement;
	            window.XMLHttpRequest.prototype.send = sendReplacement;
	        }

	        this.execute_function_in_page_context(overrides_ajax_calls, expression_array);
	    };
	};

	window.PageCommunicator = new PageCommunicator();
})();