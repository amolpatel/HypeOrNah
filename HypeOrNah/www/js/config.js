angular.module('hypeOrNah.config', ['ionic'])

.constant('appConfig', {
    // FIREBASE CONFIG VARIABLES
    'fbPlacesUrl' : "https://crackling-inferno-9452.firebaseio.com/places",

    // PLACES
    'greekType' : 'greek',
    'nightClubType' : 'night_club',
    'barType' : 'bar',

    // PLACE DIRECTIVE
    'refreshTimeout' : 5000,

    // ENVIRONMENT
    'environment' : 'DEBUG',
    'DEBUG' : 'DEBUG',
    'PROD' : 'PROD',
    'userLocFromConfig' : true,
    'userLat' : '33.74098',
    'userLng' : '-84.345933'
});