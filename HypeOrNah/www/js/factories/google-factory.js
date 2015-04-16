/**
* Factory: Factory to generate list of locations for app
*/

angular.module('hypeOrNah')
    .factory('googleFactory', function googleFactory() {
            var googleFactory = {};

            /*
            *   Get's a list of locations from the Google Places API service given clients coordinates
            */
            googleFactory.getLocations = function(pos, type, map, callback){ 
                // makes the call to the Google Places services and returns results.
                var service;
                var infowindow;

                var loc = new google.maps.LatLng(pos.latitude, pos.longitude);

                var request; 
                service = new google.maps.places.PlacesService(map);
                if(type == 'greek'){
                    request = {
                        location: loc, 
                        radius: '5000', 
                        query: 'fraternity'
                    }; 

                    service.textSearch(request, function(results, status){
                        placesCallback(results, status, callback); 
                    });
                }
                else{
                    request = {
                        location: loc,
                        rankby: google.maps.places.RankBy.PROMINENCE,
                        radius: '5000',
                        types: [type]
                    };
                    service.nearbySearch(request, function(results, status){
                        placesCallback(results, status, callback); 
                    }); 
                }

                function placesCallback(results, status, callback){
                    if (status == google.maps.places.PlacesServiceStatus.OK){
                        var placesResults = {}; 
                        placesResults.numPlaces = results.length; 
                        results.forEach(function(place){
                            placesResults[place.place_id] = {
                                'name' : place.name,
                                'address' : place.vicinity,
                                'lat' : place.geometry.location.lat(),
                                'lng' : place.geometry.location.lng(),
                                'status' : place.open_now,
                                'rating' : place.rating
                            };
                            console.log(place.rating);
                        });

                        callback(true, placesResults); 
                    }
                    else{
                        callback(false, null); 
                    }
                }

            }; 

            googleFactory.getGeo = function(address, callback){
                console.log("geocoding address " + address); 
                var geocoder = new google.maps.Geocoder(); 
                geocoder.geocode({'address' : address}, function(results, status){
                    if(status == google.maps.GeocoderStatus.OK){
                        result = {}; 
                        console.log("Successfully geocoded address %)", results); 
                        result.lat = results[0].geometry.location.lat().toString(); 
                        result.lng = results[0].geometry.location.lng().toString(); 

                        callback(true, result); 
                    }
                    else{
                        callback(false, null); 
                    }
                }); 
            }

            return googleFactory; 
    }); 