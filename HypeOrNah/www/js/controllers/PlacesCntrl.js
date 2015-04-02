angular.module('hypeOrNah')

.controller('PlacesCntrl', function($scope, $timeout, googleFactory, fbaseFactory, appConfig) {
    $scope.places = {}; 

    /*
    *   Populates the list of places
    */
    $scope.refreshLocations = function(){
        $scope.places = {}; 
        
        var mapsAttr = document.getElementById('mapsAttr'); 
        // get clients position 
        var locOptions = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };

        // get location
        if(appConfig.userLocFromConfig){
            var pos = {
                coords : {
                    'latitude' : appConfig.userLat,
                    'longitude' : appConfig.userLng
                }
            }

            locSuccess(pos); 
        }
        else{
            navigator.geolocation.getCurrentPosition(locSuccess, locError, locOptions);

        }

        // client location success callback
        function locSuccess(pos) {
            crd = pos.coords;
            console.log('Latitude : ' + crd.latitude);
            console.log('Longitude: ' + crd.longitude);

            /******************************
            IMPORTANT: HARD CODE COORDINATES HERE FOR DEBUGGING
            ******************************/

            /*
            * Make call to Google Places API
            */
            googleFactory.getLocations(crd, $scope.placesType, mapsAttr, placesCallback);
            function placesCallback(results, status) {
                console.log(status); 
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    for(i = 0; i < results.length; i++){
                        // compare place against our database.
                        fbaseFactory.getPlace(results[i].place_id, (function(index) {
                            return function(data){
                                var place = data.val(); 
                                // get data call back with i in scope
                                if(!place){
                                    // no corresponding firebase place for google place, add to database
                                    console.log("place did not exist, adding to firebase"); 
                                    place = {
                                        name: results[index].name,
                                        lng: results[index].geometry.location.lng(),
                                        lat: results[index].geometry.location.lat(),   
                                        up_votes: 0, 
                                        down_votes: 0, 
                                        source: 'Google Places' 
                                    };  

                                    // write data to firebase and notify UI
                                    fbaseFactory.writeLocation(place, results[index].place_id); 
                                    $scope.places[results[index].place_id] = place;
                                }
                                else{
                                    // found place in firebase, hand off to UI
                                    console.log("found " + place.name + " in firebase %O", place);
                                    $scope.places[results[index].place_id] = place; 
                                }

                                // check if user is at location
                                var googPlaceLat = results[index].geometry.location.lat();
                                var googPlaceLng = results[index].geometry.location.lng(); 
                                if(crd.latitude == googPlaceLat && googPlaceLng == crd.longitude){
                                    console.log("user is at place: %O", place); 
                                    $scope.userAtLocation()(place); 
                                }

                                // check if this was the last item
                                if(index == (results.length - 1)){
                                    $scope.$broadcast('scroll.refreshComplete');
                                }
                            }; 
                        })(i));
                    }
                }
                else{
                    // error making places call
                    console.warn("Error making google places call"); 
                    $scope.places = {}; 
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
        $scope.refreshLocations();
        $timeout( function() {
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
    
        }, appConfig.refreshTimeout);
      
    };

    $scope.upVote = function(placeId) {
        console.log("upvote for place: " + placeId);
        $scope.places[placeId].up_votes++; 
        fbaseFactory.vote(placeId, true); 
    }

    $scope.downVote = function(placeId) {
        console.log("downvote for place: " + placeId);
        $scope.places[placeId].down_votes++;
        fbaseFactory.vote(placeId, false); 
    }
});