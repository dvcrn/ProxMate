var app = angular.module('options', []);

app.controller('MainCtrl', function($scope) {

    var promises = [];
    var disabled_services = [];
    var synchronise_timeout;

    $scope.account_type = 'Loading account status...';

    var add_promise = function (array, callback) {
        var promise = $.Deferred();
        array.push(promise);

        callback.call(this, promise);
        return promise;
    };

    var synchronise_preferences = function () {
        $scope.status = 'Saving...';
        clearTimeout(synchronise_timeout);
        synchronise_timeout = setTimeout(function () {
            var sync_promises = [];

            add_promise(sync_promises, function (promise) {
                Proxmate.preferences_set('disabled_services', disabled_services, function () {
                    promise.resolve();
                });
            });

            add_promise(sync_promises, function (promise) {
                Proxmate.preferences_set('proxmate_token', $scope.proxmate_token, function () {
                    promise.resolve();
                });
            });

            add_promise(sync_promises, function (promise) {
                Proxmate.preferences_set('allow_data_collection', $scope.allow_data_collection, function () {
                    promise.resolve();
                });
            });

            $.when.apply(sync_promises).then(function () {
                Proxmate.update_offline_config();
                $scope.status = 'Saved!';
                $scope.$digest();
            });
        }, 2000);
    };

    var init = function (callback) {
        console.info("init");
        $scope.status = 'Loading...';
        callback = callback || function () {};
        promises = [];

        add_promise(promises, function (promise) {
            Proxmate.storage_get('offline_config', function (config) {
                var config = JSON.parse(config);
                var services = [];
                for (index in config.services) {
                    var service = config.services[index];
                    if (service.name !== null) {
                        services.push(service);
                    }
                }

                $scope.services = services;
                $scope.config_date = config.meta.generated_at * 1000;
                $scope.account_type = config.meta.account_type
                $scope.token_expires_at = config.meta.token_expires_at * 1000;
                promise.resolve();
            });
        });

        add_promise(promises, function (promise) {
            Proxmate.config_get('version', function (version) {
                $scope.proxmate_version = version;
                promise.resolve();
            });
        });

        add_promise(promises, function (promise) {
            Proxmate.preferences_get(['disabled_services', 'proxmate_token', 'allow_data_collection'],
                function (services, proxmate_token, allow_data_collection) {
                if (services != null) {
                    var parsed_services = $.map(services.split(','), function(value){
                        return parseInt(value, 10);
                    });

                    disabled_services = parsed_services;
                    $scope.proxmate_token = proxmate_token;
                    $scope.allow_data_collection = allow_data_collection;
                }

                promise.resolve();
            });
        });

        $.when.apply($, promises).then(function() {
            $scope.status = 'Loaded! Everything up to date!';
            $scope.$digest();
            callback.call(this);
        });
    };

    init();
    Proxmate.subscribe_to_event_from_backend('offlineconfig_update', function () {
        init();
    });

    $scope.toggle_service = function (service_id) {
        var in_array_index = $.inArray(service_id, disabled_services);
        if (in_array_index != -1) {
            disabled_services.splice(in_array_index, 1);
        } else {
            disabled_services.push(service_id);
        }

        synchronise_preferences();
    };

    $scope.is_disabled = function (service_id) {
        if ($.inArray(service_id, disabled_services) != -1) {
            return true
        }

        return false;
    };

    $scope.update_preferences = function () {
        synchronise_preferences();
    };
});