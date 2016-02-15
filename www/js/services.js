angular.module('starter.services', [])


    .factory('LocationStorage', function ($q, $rootScope, Database, Destinations) {
        var lastLocation = {},
            intervalId = null;

        return {
            process: function () {
                var self = this;
                navigator.geolocation.getCurrentPosition(function (pos) {
                    var location = {
                        timestamp: pos.timestamp,
                        latitude: _.roundFloat(pos.coords.latitude, 4),
                        longitude: _.roundFloat(pos.coords.longitude, 4)
                    };
                    if (location.latitude == lastLocation.latitude && location.longitude == lastLocation.longitude)
                        return;
                    lastLocation = location;
                    Destinations.getAllDestinations().then(function (destinations) {
                        var destination = _.find(destinations, function (destination) {
                            return gju.pointInPolygon({
                                "type": "Point",
                                "coordinates": [location.longitude, location.latitude]
                            }, destination.geojson.geometry)
                        });
                        if (destination) {
                            location.destinationId = destination.id;
                            Database.insert('LOCATIONS', location).then(function () {
                                $rootScope.$emit('newLocation', self.formatLocation(location));
                            });
                        }
                    })
                })
            },
            getLocations: function (destinationId, lastTimestamp) {
                var self = this;
                var deferred = $q.defer();
                var query = ["SELECT * FROM LOCATIONS WHERE destinationId=" + destinationId];
                if (lastTimestamp && isNaN(lastTimestamp))
                    query.push("WHERE timestamp>" + lastTimestamp);
                query.push("ORDER BY timestamp DESC");
                Database.execute(query.join('\n')).then(function (res) {
                    res = self.formatResult(res);
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err)
                });
                return deferred.promise;
            },
            start: function (deltaTime) {
                this.stop();
                this.process();
                intervalId = setInterval(this.process.bind(this), deltaTime || 3000)
            },
            stop: function () {
                if (intervalId != null)
                    clearInterval(intervalId);
                intervalId = null
            },
            formatResult: function (res) {
                var self = this;
                res = _.map(res.rows, function (row) {
                    row = row.valueOf();
                    return self.formatLocation(row);
                });
                return res
            },
            formatLocation: function (location) {
                location.latlng = {
                    lat: location.latitude,
                    lng: location.longitude
                };
                return location
            }
        }
    })

    .factory('MapStorage', function ($q, Database) {
        return {
            add: function (key, value) {
                Database.insert('TILES', {
                    key: key,
                    value: value
                })
            },
            delete: function (key) {
                var query = "DELETE FROM TILES WHERE key='" + key + "';";
                Database.execute(query)
            },
            get: function (key, successCallback, errorCallback) {
                var query = "SELECT * FROM TILES WHERE key='" + key + "';";
                Database.execute(query).then(function (res) {
                    res = _.map(res.rows, function (row) {
                        return row.valueOf()
                    });
                    res = _.first(res);
                    successCallback(res ? res.value : undefined)
                }, function (err) {
                    errorCallback(err)
                })
            }
        }
    })

    .factory('Destinations', function ($q, Database) {
        return {
            save: function (destination) {
                return Database.insert('DESTINATIONS', destination)
            },
            getDestination: function (id) {
                var self = this;
                var deferred = $q.defer();
                var query = "SELECT * FROM DESTINATIONS WHERE id=" + id;
                Database.execute(query).then(function (res) {
                    res = self.formatResult(res);
                    deferred.resolve(_.first(res));
                }, function (err) {
                    deferred.reject(err)
                });
                return deferred.promise;
            },
            getAllDestinations: function () {
                var self = this;
                var deferred = $q.defer();
                var query = "SELECT * FROM DESTINATIONS";
                Database.execute(query).then(function (res) {
                    res = self.formatResult(res);
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err)
                });
                return deferred.promise;
            },
            formatResult: function (res) {
                res = _.map(res.rows, function (row) {
                    row = row.valueOf();
                    row.geojson = JSON.parse(row.geojson);
                    return row
                });
                return res
            }
        }
    })

    .factory('Database', function ($cordovaSQLite, $q) {
        var db = null;
        var tables = {
            DESTINATIONS: {
                id: 'INTEGER PRIMARY KEY',
                name: 'TEXT',
                latitude: 'REAL',
                longitude: 'REAL',
                geojson: 'TEXT'
            },
            LOCATIONS: {
                timestamp: 'INTEGER PRIMARY KEY',
                destinationId: 'INTEGER',
                latitude: 'REAL',
                longitude: 'REAL'
            },
            TILES: {
                key: 'TEXT PRIMARY KEY',
                value: 'TEXT'
            }
        };
        return {
            clear: function (tableName) {
                if (tableName)
                    $cordovaSQLite.execute(db, 'DROP TABLE IF EXISTS ' + tableName);
                else
                    _.each(tables, function (table, tableName) {
                        $cordovaSQLite.execute(db, 'DROP TABLE IF EXISTS ' + tableName);
                    })
            },
            init: function () {
                if (window.cordova)
                    db = $cordovaSQLite.openDB({name: "my.db"});
                else
                    db = window.openDatabase("my.db", '1', 'my', 1024 * 1024 * 100);

                _.each(tables, function (table, tableName) {
                    var columns = _.map(table, function (column, columnName) {
                        return columnName + " " + column
                    }).join(', ');
                    if (columns.length > 0) {
                        var query = "CREATE TABLE IF NOT EXISTS " + tableName + " (" + columns + ")";
                        $cordovaSQLite.execute(db, query);
                    }
                })
            },
            execute: function (query) {
                return $cordovaSQLite.execute(db, query);
            },
            insert: function (table, object) {
                if (!tables[table])
                    return $q.defer().reject('Unknow table ' + table).promise;
                var keys = [], values = [];
                _.each(object, function (value, key) {
                    if (tables[table][key]) {
                        keys.push(key);
                        if (isNaN(value))
                            values.push("'" + value + "'");
                        else
                            values.push(value)
                    }
                });
                if (keys.length == 0)
                    return $q.defer().resolve(object).promise;
                var query = 'INSERT INTO ' + table + ' (' + keys.join(', ') + ') VALUES (' + values.join(', ') + ');';
                return $cordovaSQLite.execute(db, query);
            }
        }
    });

