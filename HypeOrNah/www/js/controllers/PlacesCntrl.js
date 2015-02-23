angular.module('hypeOrNah')

.controller('PlacesCntrl', function($scope, $timeout, googleFactory, fbaseFactory) {

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
                    var places = []; 
                    for(i = 0; i < results.length; i++){
                        var fbPlace = fbaseFactory.getPlace(results[i].place_id);
                        if(!fbPlace){
                            console.log("place did not exist, adding to firebase"); 
                            // google places location is not currently in database,
                            // add it.
                            var currPlace = {
                                name: results[i].name, 
                                up_votes: 0, 
                                down_votes: 0, 
                                source: 'Google Places' 
                            }; 
                            fbaseFactory.writeLocation(currPlace, results[i].place_id); 
                            places.push(currPlace); 
                        }
                        else{
                            console.log('place already exists'); 
                            places.push(fbPlace);
                        } 
                    } 

                    console.log("done checking places"); 
                    console.log(places); 
                    $scope.places = places; 
                }
                else{
                    // error making places call
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