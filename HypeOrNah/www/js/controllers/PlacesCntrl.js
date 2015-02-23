angular.module('hypeOrNah')

.controller('PlacesCntrl', function($scope, $timeout, googleFactory) {

    /*
    *   Populates the list of places
    */
    $scope.getLocations = function(){
        var mapsAttr = document.getElementById('mapsAttr'); 
        // get clients position 
        var locOptions = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };
        // get location
        navigator.geolocation.getCurrentPosition(locSuccess, locError, locOptions);
        // client location success callback
        function locSuccess(pos) {
            crd = pos.coords;
            console.log('Latitude : ' + crd.latitude);
            console.log('Longitude: ' + crd.longitude);

            /*
            * Make call to Google Places API
            */
            googleFactory.getLocations(crd, $scope.placesType, mapsAttr, placesCallback);
            function placesCallback(results, status) {
                console.log(status); 
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    $scope.places = results;  
                }
                else{
                    console.warn("Error making google places call"); 
                    $scope.places = []; 
                }
            }
        }; 
        // client location error callback
        function locError(err) {
          console.log('ERROR(' + err.code + '): ' + err.message);
        };

    }; 

    /*
    *   List refresh handler
    */
    $scope.doRefresh = function() {
    
        console.log('Refreshing!');
        // refersh locations list
        $scope.getLocations();
        $timeout( function() {
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
    
        }, 1000);
      
    };

    $scope.setActive = function(type) {
        $scope.placesType = type;
        // refresh content
        $scope.doRefresh(); 
    };

    $scope.isActive = function(type) {
        return type === $scope.placesType;
    };
  

    // set active radiu buttons
    $scope.placesType = 'night_club'; 
    // initial refersh to get content
    $scope.doRefresh(); 
});