angular.module('hypeOrNah', ['ionic', 'hypeOrNah.config'])

.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('places', {
            url: '/places', 
            templateUrl: 'templates/places-list.html', 
            controller: 'PlacesCntrl'
        }); 

    $urlRouterProvider.otherwise('/places'); 
}); 