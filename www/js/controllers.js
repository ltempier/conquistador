angular.module('starter.controllers', [])
    .controller('DestinationsCtrl', function ($scope) {
        $scope.destinations = [{
            id: 0,
            name: 'London',
            value: 0.5
        }, {
            id: 1,
            name: 'Paris',
            value: 0.7
        }, {
            id: 2,
            name: 'Madrid',
            value: 0.3
        }
        ]
    })

    .controller('DestinationMapCtrl', function ($scope, $ionicLoading, $stateParams) {
        $scope.id = $stateParams.destinationId;

        $scope.mapCreated = function (map) {
            $scope.map = map;



            $scope.map.setView([42.3610, -71.0587], 5);
        };
    });

