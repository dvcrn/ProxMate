(function () {
	"use strict";
	var PageCommunicator = function () {

		/**
		 * Creates a script tag with script content in page
		 * @param  {string} script script to wrap inside script tag
		 */
		this.append_script_to_page = function(script) {
			// console.info(script);
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
		this.execute_function_in_page_context = function (fx) {
			var script = "(" + fx + ")();" // Wrap the script in a anonymous function
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
	};

	window.PageCommunicator = new PageCommunicator();
})();