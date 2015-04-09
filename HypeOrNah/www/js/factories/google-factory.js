/**
* Factory: Factory to generate list of locations for app
*/

angular.module('hypeOrNah')
    .factory('googleFactory', function googleFactory() {
            var googleFactory = {};

            /*
            *   Get's a list of locations from the Google Places API service given clients coordinates
            */
            googleFactory.getLocations = function(pos, type, map, placesCallback){
                googlePlaces(); 
                // makes the call to the Google Places services and returns results.
                function googlePlaces(){
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

                        service.textSearch(request, placesCallback);
                    }
                    else{
                        request = {
                            location: loc,
                            rankby: google.maps.places.RankBy.PROMINENCE,
                            radius: '5000',
                            types: [type]
                        };
                        service.nearbySearch(request, placesCallback); 
                    }
                    
                };
            }; 

            return googleFactory; 
    }); 