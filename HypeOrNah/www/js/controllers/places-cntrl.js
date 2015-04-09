angular.module('hypeOrNah')

.controller('PlacesCntrl', function($scope, $timeout, $ionicLoading, googleFactory, fbaseFactory, appConfig) {
    $scope.places = {}; 

    // set scope properties for view
    $scope.nightClubType = appConfig.nightClubType; 
    $scope.greekType = appConfig.greekType; 
    $scope.barType = appConfig.barType; 
    $scope.userAtPlace = false; 
    $scope.userPlace = {}; 
    $scope.voted = false; 

    /*
    *   Populates the list of places
    */
    function refreshLocations(){
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
                                var place_id = data.key(); 
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
                                    $scope.places[results[index].place_id] = place; 
                                }

                                // check if user is at location
                                var googPlaceLat = results[index].geometry.location.lat();
                                var googPlaceLng = results[index].geometry.location.lng(); 
                                if(crd.latitude == googPlaceLat && googPlaceLng == crd.longitude){
                                    console.log("user is at place: %O", place); 
                                    userAtLocation(place, place_id); 
                                }

                                // check if this was the last item
                                if(index == (results.length - 1)){
                                    $scope.$broadcast('scroll.refreshComplete');
                                    doneLoading(); 
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

   function showLoader(){
      // Setup the loader
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        $timeout(function () {
            $ionicLoading.hide();
        }, 5000);
    }  

    function doneLoading(){
        console.log("done loading called"); 
        $ionicLoading.hide(); 
    }

    function userAtLocation(place, placeId){
        console.log("user at location %O", place); 
        $scope.userAtPlace = true; 
        $scope.userPlace[placeId] = place; 
    }

    /* TODO: These should be moved to separate date-picker directive */
    $scope.setActive = function(type) {
        console.log("changing active to" + type); 
        $scope.placesType = type;
        showLoader(); 
        refreshLocations(); 
    };

    $scope.isActive =  function(type) {
        return type === $scope.placesType;
    };


    /*
    *   List refresh handler
    */
    $scope.doRefresh = function() {
        console.log('Refreshing!');
        // refersh locations list
        showLoader(); 
        refreshLocations();
        $timeout( function() {
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
    
        }, appConfig.refreshTimeout);
      
    };

    $scope.upVote = function(placeId) {
        if($scope.voted)
            return; 

        console.log("upvote for place: " + placeId);
        $scope.userPlace[placeId].up_votes++; 
        fbaseFactory.vote(placeId, true); 
        $scope.voted = true; 
    }

    $scope.downVote = function(placeId) {
        if($scope.voted)
            return; 

        console.log("downvote for place: " + placeId);
        $scope.userPlace[placeId].down_votes++;
        fbaseFactory.vote(placeId, false); 
        $scope.voted = true; 
    }

    $scope.placesType = appConfig.barType; 
    $scope.doRefresh(); 

});