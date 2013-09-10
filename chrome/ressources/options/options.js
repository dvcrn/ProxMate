var PreferencePacker = function () {
    this.original_preferences = {};

    this.unpack = function (preference_name, preference_value) {
        var unpack_function_name = 'unpack_' + preference_name;
        var unpack_function = this[unpack_function_name];

        this.original_preferences[preference_name] = preference_value;

        if (typeof unpack_function === 'function') {
            console.info("Unpacking " + preference_name);
            return unpack_function.call(this, preference_value);
        } else {
            return preference_value;
        }
    };

    this.pack = function (preference_name, preference_value) {
        var pack_function_name = 'pack_' + preference_name;
        var pack_function = this[pack_function_name];

        if (typeof pack_function === 'function') {
            console.info("Packing " + preference_name);
            return pack_function.call(this, preference_value);
        } else {
            return preference_value;
        }
    };

    this.unpack_disabled_services = function (services) {
        if (services != null) {
            var parsed_services = $.map(services.split(','), function(value){
                return parseInt(value, 10);
            });

            return parsed_services;
        }

        return [];
    };

    this.unpack_config_overrides = function (overrides) {
        var overrides = JSON.parse(overrides);
        var config = {
            'use_custom_proxy': false,
            'custom_proxy_url': '127.0.0.1',
            'custom_proxy_port': 1337
        };

        if (overrides.nodes !== undefined && overrides.nodes.CUSTOMPROXY !== undefined) {
            if (overrides.nodes.CUSTOMPROXY !== undefined) {
                var proxy = overrides.nodes.CUSTOMPROXY[0].split(':');
                config.custom_proxy_url = proxy[0];
                config.custom_proxy_port = proxy[1];
            }

            if (overrides.nodes.US !== undefined || overrides.nodes.UK !== undefined) {
                config.use_custom_proxy = true;
            }
        }

        return config;
    };

    this.pack_config_overrides = function (override_object) {
        var old_overrides = JSON.parse(this.original_preferences.config_overrides);

        var overrides = {};
        overrides.nodes = {};
        overrides.services = {};

        overrides.nodes.CUSTOMPROXY = [override_object.custom_proxy_url + ':' + override_object.custom_proxy_port];
        if (override_object.use_custom_proxy) {
            overrides.nodes.US = overrides.nodes.CUSTOMPROXY;
            overrides.nodes.UK = overrides.nodes.CUSTOMPROXY;
        }

        if (old_overrides.services !== undefined) {
            $.apply(old_overrides.services, overrides.services);
        }

        if (Object.keys(overrides.nodes).length === 0) {
            delete overrides.nodes;
        }

        if (Object.keys(overrides.services).length === 0) {
            delete overrides.services;
        }

        return JSON.stringify(overrides);
    };

    this.pack_config_extras = function (config_object) {
        var config_to_save = [];
        for (index in config_object) {
            var current_element = config_object[index];

            // Copy the element to avoid jumpy angular re-render
            config_to_save.push({
                'rule': 'url.indexOf("'+current_element.rule+'") != -1',
                'server': current_element.server,
                'is_active': current_element.is_active
            });
        }

        return JSON.stringify(config_to_save);
    };

    this.unpack_config_extras = function (config) {
        var config_object = JSON.parse(config);

        // Extract url fragment from javascript rule for displaying
        for (index in config_object) {
            var regex = /url\.indexOf\(\"(.*)\"\)/g; // = url.indexOf("(.*)");
            var current_element = config_object[index];
            var match = regex.exec(current_element.rule);

            if (match !== null) {
                config_object[index].rule = match[1];
            }
        }

        return config_object;
    };
};

var preference_packer = new PreferencePacker();

var app = angular.module('options', []);
app.controller('MainCtrl', function($scope) {

    var promises = [];
    var disabled_services = [];
    var synchronise_timeout;
    var preferences = [
        'disabled_services',
        'proxmate_token',
        'allow_data_collection',
        'config_overrides',
        'config_extras'
    ];

    $scope.account_type = 'Loading account status...';

    var add_promise = function (array, callback) {
        var promise = $.Deferred();
        array.push(promise);

        callback.call(this, promise);
        return promise;
    };

    var synchronise_preferences = function () {
        $scope.status = 'Synchronising...';
        clearTimeout(synchronise_timeout);
        synchronise_timeout = setTimeout(function () {
            var sync_promises = [];

            for (i in preferences) {
                var index = preferences[i];
                add_promise(sync_promises, function (promise) {
                    var index = preferences[i];
                    var val = preference_packer.pack(index, $scope[index]);

                    Proxmate.preferences_set(index, val, function () {
                        promise.resolve();
                    });
                });
            }

            $.when.apply(sync_promises).then(function () {
                Proxmate.update_offline_config();
                $scope.status = 'Saved!';
                $scope.$digest();
            });
        }, 2000);
    };

    var init = function (callback) {
        console.info("init");
        $scope.status = 'Synchronising...';
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
            Proxmate.preferences_get(preferences, function (services) {
                // Dynamically add all preferences to $scope
                for (i in preferences) {
                    var index = preferences[i];
                    $scope[index] = preference_packer.unpack(index, arguments[i]);
                }

                promise.resolve();
            });
        });

        $.when.apply($, promises).then(function() {
            $scope.status = 'Synchronised! Everything up to date!';
            $scope.$digest();
            callback.call(this);
        });
    };

    init();
    Proxmate.subscribe_to_event_from_backend('offlineconfig_update', function () {
        init();
    });

    $scope.toggle_service = function (service_id) {
        var in_array_index = $.inArray(service_id, $scope.disabled_services);
        if (in_array_index != -1) {
            $scope.disabled_services.splice(in_array_index, 1);
        } else {
            $scope.disabled_services.push(service_id);
        }

        synchronise_preferences();
    };

    $scope.is_disabled = function (service_id) {
        if ($.inArray(service_id, $scope.disabled_services) != -1) {
            return true
        }

        return false;
    };

    $scope.update_preferences = function () {
        synchronise_preferences();
    };

    $scope.add_custom_rule = function () {
        if ($scope.custom_rule_rule.length !== undefined && $scope.custom_rule_server.length != undefined) {
            $scope.config_extras.push({
                'rule': $scope.custom_rule_rule,
                'server': $scope.custom_rule_server,
                'is_active': true
            });
        }

        $scope.custom_rule_rule = '';
        $scope.custom_rule_server = '';
        synchronise_preferences();
    };

    $scope.delete_custom_rule = function (index) {
        $scope.config_extras.splice(index, 1);
        synchronise_preferences();
    };
});