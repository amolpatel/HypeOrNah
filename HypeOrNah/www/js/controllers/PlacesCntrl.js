angular.module('hypeOrNah')

.controller('PlacesCntrl', function($scope, $timeout, googleFactory, fbaseFactory) {

    /*
    *   Populates the list of places
    */
    $scope.getLocations = function(){
        $scope.places = []; 
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
                        fbaseFactory.getPlace(results[i].place_id, (function(index) {
                            return function(data){
                                var place = data.val(); 
                                // get data call back with i in scope
                                if(!place){
                                    // no corresponding firebase place for google place, add to database
                                    console.log("place did not exist, adding to firebase"); 
                                    var currPlace = {
                                        name: results[index].name, 
                                        up_votes: 0, 
                                        down_votes: 0, 
                                        source: 'Google Places' 
                                    };  

                                    // write data to firebase and notify UI
                                    fbaseFactory.writeLocation(currPlace, results[index].place_id); 
                                    $scope.places.push(currPlace); 
                                }
                                else{
                                    // found place in firebase, hand off to UI
                                    console.log("found place in firebase %O", place);
                                    $scope.places.push(place);  
                                }

                                // check if this was the last item
                                if(index == (results.length - 1))
                                    $scope.$broadcast('scroll.refreshComplete');
                            }; 
                        })(i));
                    }
                }
                else{
                    // error making places call
                    console.warn("Error making google places call"); 
                    $scope.places = []; 
                }
            }; 
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
    
        }, 5000);
      
    };

    $scope.testClick = function(){
        console.log("====== printing places========"); 
        for(i = 0; i < $scope.places.length; i++){
            console.log($scope.places[i]); 
        }
    }

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