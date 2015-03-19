angular.module('hypeOrNah')

.controller('MainCntrl', function($scope) {

    $scope.userAtLocation = function(data){

    }

    /* TODO: These should be moved to separate date-picker directive */
    $scope.setActive = function(type) {
        $scope.placesType = type;
    };

    $scope.isActive =  function(type) {
        return type === $scope.placesType;
    };

    $scope.placesType='night_club'; 
}); 