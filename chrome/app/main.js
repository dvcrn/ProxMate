/*global require*/
require.config({
    paths: {
        "jquery": "../vendor/jquery/jquery",
        "text" : "../vendor/requirejs-text/text"
    }
});

(function () {
    "use strict";

    if (!String.prototype.format) {
        String.prototype.format = function() {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined' ? args[number] : match;
            });
        };
    }

    require([
        'app',
        'chrome',
        'config',
        'logger',
        'preferences',
        'proxmate-config',
        'event-navigator',
        'cs-communicator'
    ], function (App, Chrome, Config, Logger, Preferences, ProxmateConfig, EventNavigator, CsCommunicator) {
        // Prepare the app
        // Order here is important
        Config.initialise();
        Logger.initialise();
        Chrome.initialise();
        EventNavigator.initialise();
        App.initialise();
        CsCommunicator.initialise();
    });
})();