angular.module('starter.directives', [])

    .directive('map', function (MapStorage) {

        return {
            restrict: 'E',
            scope: {
                onCreate: '&'
            },
            link: function ($scope, $element) {
                function initialize() {

                    //var url = '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    var url = '//api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}';
                    var mapOptions = {
                        layers: new L.TileLayer(url, {
                            apikey: 'pk.eyJ1IjoibHRlbXBpZXIiLCJhIjoiVjVCTkw2NCJ9.u23u7IQLUuo2Z0KUuAfz4g',
                            mapid: 'ltempier.ni82p485',
                            storage: MapStorage
                        }),
                        attributionControl: false
                    };

                    var map = L.map($element[0], mapOptions);
                    $scope.onCreate({map: map});
                }

                if (L && document.readyState === "complete") {
                    initialize();
                }
            }
        }
    });
