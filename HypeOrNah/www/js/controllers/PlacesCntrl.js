angular.module('hypeOrNah')

.controller('PlacesCntrl', function($scope, $timeout, googleFactory) {
    //$scope.items = ['Item 1', 'Item 2', 'Item 3'];
  
    $scope.getLocations = function(placesCallback){

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
            googleFactory.getLocations(crd, document.getElementById('mapsId'), placesCallback);
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

    $scope.printPlaces = function(){
        console.log($scope.places); 
    }

    $scope.doRefresh = function() {
    
        console.log('Refreshing!');
        $timeout( function() {
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
    
        }, 1000);
      
    };
  
    // load locations 
    $scope.getLocations();
});