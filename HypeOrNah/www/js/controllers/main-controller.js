angular.module('hypeOrNah')

.controller('MainCntrl', function($scope, appConfig) {
    // set scope properties for view
    $scope.nightClubType = appConfig.nightClubType; 
    $scope.greekType = appConfig.greekType; 
    $scope.barType = appConfig.barType; 

    $scope.userAtLocation = function(place){
        console.log("user at location %O", place); 
    }

    /* TODO: These should be moved to separate date-picker directive */
    $scope.setActive = function(type) {
        console.log("changing active to" + type); 
        $scope.placesType = type;
    };

    $scope.isActive =  function(type) {
        return type === $scope.placesType;
    };

    $scope.placesType= $scope.barType; 
}); 