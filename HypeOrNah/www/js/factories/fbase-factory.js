/**
* Factory: Factory to communicate with firebase
*/

angular.module('hypeOrNah')
    .factory('fbaseFactory', function fbaseFactory(appConfig) {
            var fbaseFactory = {};
            var ref = new Firebase(appConfig.fbPlacesUrl);
            /* 
            * retreives a place object from firebase
            */
            fbaseFactory.getPlace = function(place_id, callback){
                ref.child(place_id).once("value", callback); 
            }; 

            fbaseFactory.writeLocation = function(data, place_id){ 
                console.log("writing place: %O", data); 
                // clean up data 
                validData = {
                    'address' : data.address, 
                    'comments' : data.comments, 
                    'down_votes' : data.down_votes, 
                    'up_votes' : data.up_votes, 
                    'lat' : data.lat, 
                    'lng' : data.lng, 
                    'name' : data.name, 
                    'source' : data.source
                } ; 
                ref.child(place_id).set(validData); 
            }; 

            /*
            *   voteDir: True=>up_votes, False=>down_votes
            */
            fbaseFactory.vote = function(placeId, voteDir){
                var placeVotesRef = ref.child(placeId).child((voteDir) ? 'up_votes' : 'down_votes');
                placeVotesRef.transaction(function(currVotes){
                    return currVotes + 1;
                })
            }

            return fbaseFactory; 

    }); 