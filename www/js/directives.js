angular.module('starter.directives', [])

    .directive('map', function () {

        return {
            restrict: 'E',
            scope: {
                onCreate: '&'
            },
            link: function ($scope, $element) {
                function initialize() {
                    var mapOptions = {
                        layers: new L.TileLayer('//api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}', {
                            apikey: 'pk.eyJ1IjoibHRlbXBpZXIiLCJhIjoiVjVCTkw2NCJ9.u23u7IQLUuo2Z0KUuAfz4g',
                            mapid: 'ltempier.ni82p485'
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
