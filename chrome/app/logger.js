define(['config'], function (Config) {

	/**
	 * Init
	 */
	var initialise = function () {};

	/**
	 * Checks the verbosity and status of the config and executes the callback if applicable
	 * @param  {int}   verbosity verbosity level
	 * @param  {function} callback  callback to execute
	 */
	var check_config_and_callback = function (verbosity, callback) {
		if (Config.get('debug')) {
			var verbose_level = Config.get('verbosity');
			if (verbose_level < 1 || verbose_level > 3) {
				verbose_level = 1;
			}

			if (verbose_level >= verbosity) {
				callback();
			}
		}
	};

	/**
	 * Logs obj with 'log' flag
	 * @param  {obj} obj obj to log
	 */
	var log = function (obj) {
		check_config_and_callback(3, function () {
			console.info(obj);
		});
	};

	/**
	 * Logs obj with 'warn' flag
	 * @param  {obj} obj obj to log
	 */
	var warn = function (obj) {
		check_config_and_callback(2, function () {
			console.warn(obj);
		});
	};

	/**
	 * Logs obj with 'error' flag
	 * @param  {obj} obj obj to log
	 */
	var error = function (obj) {
		check_config_and_callback(1, function () {
			console.error(obj);
		});
	};

	return {
		initialise: initialise,
		log: log,
		warn: warn,
		error: error
	}
});