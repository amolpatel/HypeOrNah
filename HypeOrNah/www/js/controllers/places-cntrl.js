angular.module('hypeOrNah')

.controller('PlacesCntrl', function($scope, $timeout, $ionicLoading, $ionicModal, googleFactory, fbaseFactory, appConfig) {
    $scope.places = {}; 
    $scope.placesArr = []; 
    // set scope properties for view
    $scope.nightClubType = appConfig.nightClubType; 
    $scope.greekType = appConfig.greekType; 
    $scope.barType = appConfig.barType; 
    $scope.userAtPlace = false; 
    $scope.userPlace = {}; 
    $scope.voted = false; 
    $scope.currPlace = {}; 
    $scope.currPlaceId = ''; 
    $scope.placesType = appConfig.barType; 
    $scope.userComment = {}; 
    $scope.venueView = 'main'; 
    // load venue details modal
    $ionicModal.fromTemplateUrl('templates/place-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.venueModal = modal; 
    }); 

    // location settings modal
    $ionicModal.fromTemplateUrl('templates/settings-modal.html', {
        scope: $scope, 
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.settingsModal = modal; 
    });


    // get default searchCoords, defaults to client location
    $scope.clientLoc = {}; 
    $scope.searchCoords = null; 

    
    function setClientLoc(callback){

        if(appConfig.userLocFromConfig){
            $scope.clientLoc.lat = appConfig.userLat; 
            $scope.clientLoc.lng = appConfig.userLng; 
            callback(); 
            return; 
        }

        // get client location from browser
        var locOptions = {
            enableHighAccuracy: true, 
            timeout: 10000,
        }; 

        navigator.geolocation.getCurrentPosition(locSuccess, locError, locOptions);

        function locSuccess(pos) {
            $scope.clientLoc.lat = pos.coords.latitude; 
            $scope.clientLoc.lng = pos.coords.longitude; 
            callback(); 
            return; 
        }

        function locError(){
            alert("Error retreiving your location :/"); 
            callback(); 
            return; 
        }
    }


    /*
    *   Populates the list of places
    */
    function refreshLocations(){
        $scope.places = {}; 
        var mapsAttr = document.getElementById('mapsAttr'); 
        var crd = {
            'latitude' : $scope.searchCoords.lat,
            'longitude' : $scope.searchCoords.lng
        }

        /*
        * Make call to Google Places API
        */
        googleFactory.getLocations(crd, $scope.placesType, mapsAttr, placesCallback);
        function placesCallback(success, placesResult) {
            console.log(status); 
            if (success) {
                var results = placesResult.places; 
                var placeCount = 0; 
                for(var placeId in results){
                    placeCount++; 
                    if(!results.hasOwnProperty(placeId))
                        continue; 
                    console.log("Checking place " + placeId); 
                    fbaseFactory.getPlace(placeId, function(placeId, placeCount) {return (function(fbData){
                        var fbPlace = fbData.val();

                        // check if place is in firebase
                        if(!fbPlace){
                            if(typeof results[placeId].name == 'undefined')
                                return; 
                            // place result is not in firebase, add it.
                            place = {
                                'name': results[placeId].name,
                                'address': (typeof results[placeId].address == 'undefined') ? '' : results[placeId].address,
                                'lng': results[placeId].lng, 
                                'lat': results[placeId].lat, 
                                'up_votes': 0, 
                                'down_votes': 0,
                                'comments': [''],
                                'rating':(typeof results[placeId].rating == 'undefined') ? '' : results[placeId].rating,
                                'source': 'Google Places'
                            }; 
                            console.log("place did not exist, adding to firebase %O", place); 
                            // write new place to firebase
                            fbaseFactory.writeLocation(place, placeId); 
                            $scope.places[placeId] = place; 
                        }
                        else{
                            console.log("place already exists in firbase"); 
                            // place already existed in firebase
                            $scope.places[placeId] = fbPlace; 
                        }

                       // check if user is at place
                        // check if user is at location
                        var googPlaceLat = results[placeId].lat;
                        var googPlaceLng = results[placeId].lng; 
                        if(crd.latitude == googPlaceLat && googPlaceLng == crd.longitude){
                            console.log("user is at place: %O", $scope.places[placeId]); 
                            userAtLocation($scope.places[placeId], placeId); 
                        }

                        // check if this was the last item
                        if(placeCount == (placesResult.numPlaces)){
                            $scope.$broadcast('scroll.refreshComplete');
                            doneLoading(); 
                        }  
                        })}(placeId, placeCount));                  
                }

            }
            else{
                alert("Error retreiving places"); 
            }
        }; 

    }; 


    /*
    *   Sorts the place list by most number of hypes first. 
    */
    function sortPlaces(){
        $scope.placesArr.sort(function(a, b){
            return b.up_votes - a.up_votes; 
        }); 
    }

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
        }, 10000);
    }  

    function doneLoading(){
        console.log("done loading called"); 
        /*
        *   TODO: scope.places needs to be loaded as an array and NOT an object
        */
        $scope.placesArr = []; 
        for(var key in $scope.places){
            var place = $scope.places[key]; 
            place.place_id = key; 
            $scope.placesArr.push(place); 
        }
        console.log("places: %O", $scope.placesArr); 
        sortPlaces(); 
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
        setClientLoc(function(){
            // client location now set!, set search location if not set
            if($scope.searchCoords == null)
                $scope.searchCoords = $scope.clientLoc; 

            refreshLocations(); 
        }); 

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
        sortPlaces(); 
    }

    $scope.downVote = function(placeId) {
        if($scope.voted)
            return; 

        console.log("downvote for place: " + placeId);
        $scope.userPlace[placeId].down_votes++;
        fbaseFactory.vote(placeId, false); 
        $scope.voted = true; 
        sortPlaces(); 
    }

    $scope.venueClicked = function(placeId, place){
        console.log("venue clicked"); 
        $scope.currPlace = place
        $scope.currPlaceId = placeId
        $scope.venueView = 'main'; 
        $scope.venueModal.show(); 
    }

    $scope.closeVenueModal = function(){
        $scope.venueModal.hide(); 
    }

    $scope.closeSettingsModal = function(){
        $scope.settingsModal.hide(); 
    }

    $scope.addressEntered = function(address){
        googleFactory.getGeo(address, function(success, coords){
            if(!success){
                alert("Error retreiving results for address"); 
            }

            $scope.searchCoords = coords; 
        })
    }

    $scope.optionsClicked = function(){
        console.log("options clicked!"); 
        $scope.settingsModal.show(); 
    }

    $scope.myLocClicked = function(){
        console.log("my location clicked!"); 
        $scope.searchCoords = $scope.clientLoc; 
        $scope.closeSettingsModal(); 
        $scope.doRefresh(); 
    }

    $scope.searchLocEntered = function(address){
        googleFactory.getGeo(address, function(success, coords){
            console.log(success); 
            console.log(coords); 

            $scope.searchCoords = coords; 
            $scope.closeSettingsModal(); 
            $scope.doRefresh(); 
        }); 
    }

    $scope.commentsClicked = function(){
        $scope.venueView = 'comments'; 
    }

    $scope.picturesClicked = function(){
        $scope.venueView = 'pictures';
    }

    $scope.mainClicked = function(){
        $scope.venueView='main'; 
    }

    $scope.submitComment = function(){
        currPlace = $scope.currPlace; 
        currPlace.comments.unshift($scope.userComment.value); 
        console.log($scope.currPlaceId); 
        console.log(currPlace); 
        fbaseFactory.writeLocation(currPlace, $scope.currPlaceId); 
        $scope.userComment.value = ""; 
        $scope.doRefresh(); 
    }

    $scope.$on('$destroy', function() {
        $scope.venueModal.remove(); 
        $scope.settingsModal.remove(); 
    })

    // do initial refresh
    $scope.doRefresh(); 

});
