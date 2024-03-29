angular.module('starter.controllers', [])
    .controller('DestinationsCtrl', ['$scope', 'Destinations', function ($scope, Destinations) {

        Destinations.save({
            id: 0,
            name: 'Paris',
            latitude: 48.8534100,
            longitude: 2.3488000,
            geojson: '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[2.416367,48.849247],[2.415892,48.846637],[2.416502,48.834705],[2.422967,48.842714],[2.427461,48.841639],[2.437059,48.841171],[2.442857,48.845551],[2.447579,48.844899],[2.464673,48.841532],[2.467314,48.839125],[2.46962,48.836077],[2.464996,48.829986],[2.466188,48.826672],[2.461194,48.818277],[2.456645,48.817006],[2.419933,48.82393],[2.403242,48.829163],[2.393998,48.827569],[2.389917,48.825921],[2.368823,48.817555],[2.364442,48.816084],[2.360036,48.815611],[2.355593,48.815866],[2.352648,48.818314],[2.344084,48.815956],[2.332032,48.816942],[2.328164,48.819069],[2.313783,48.822109],[2.309534,48.823082],[2.301049,48.825075],[2.297141,48.825987],[2.289538,48.828182],[2.285347,48.829803],[2.271895,48.828363],[2.263029,48.834011],[2.262759,48.83383],[2.257612,48.834607],[2.248056,48.84632],[2.223956,48.853218],[2.225787,48.859336],[2.230058,48.867314],[2.23278,48.869508],[2.236482,48.870854],[2.245659,48.876353],[2.255282,48.874641],[2.260275,48.880221],[2.280002,48.878534],[2.280497,48.881181],[2.284306,48.885772],[2.299983,48.892268],[2.303792,48.894053],[2.315925,48.898665],[2.31983,48.900414],[2.324885,48.900874],[2.329983,48.901163],[2.334361,48.901233],[2.351873,48.901527],[2.361188,48.901613],[2.365854,48.90161],[2.370286,48.901652],[2.389444,48.901193],[2.397957,48.892864],[2.398651,48.889414],[2.400339,48.883748],[2.407535,48.880528],[2.410694,48.878475],[2.413277,48.873119],[2.414556,48.858817],[2.415427,48.855268],[2.416367,48.849247]]]},"properties":{"nom":"Paris","code":"75"}}'
        });


        //Destinations.save({
        //    id: 1,
        //    name: 'London',
        //    latitude: 51.5085300,
        //    longitude: -0.1257400
        //});
        //
        //Destinations.save({
        //    id: 2,
        //    name: 'Madrid',
        //    latitude: 40.4165000,
        //    longitude: -3.7025600
        //});

        $scope.newDestination = function () {
            location.href = '#/tab/new/destinations';
        };
        Destinations.getAllDestinations().then(function (destinations) {
            $scope.destinations = destinations
        })
    }])
    .controller('NewDestinationCtrl', ['$scope', function ($scope) {

    }])
    .controller('DestinationMapCtrl', ['$rootScope', '$scope', 'destination', 'LocationStorage',
        function ($rootScope, $scope, destination, LocationStorage) {
            $scope.title = destination.name;
            $scope.mapCreated = function (map) {
                map.setView([destination.latitude, destination.longitude], 12);


                var svg = d3.select(map.getPanes().overlayPane).append("svg"),
                    g = svg.append("g").attr("class", "leaflet-zoom-hide");

                var outGeoJson = destination.geojson;
                outGeoJson.geometry.coordinates.unshift([[-90, -180], [-90, 180], [90, 180], [90, -180]]);
                L.geoJson(outGeoJson, {
                    style: {
                        fillColor: 'white',
                        fillOpacity: 0.7
                    }
                }).addTo(map);

                var heat;
                LocationStorage.getLocations(destination.id).then(function (locations) {
                    heat = L.heatLayer(_.map(locations, function (location) {
                        return [location.latitude, location.longitude]
                    })).addTo(map)
                });
                $rootScope.$on('newLocation', function (e, location) {
                    heat.addLatLng([location.latitude, location.longitude]);
                })
            };
        }]);

