angular.module('hypeOrNah', ['ionic', 'hypeOrNah.config'])

.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('main', {
            url: '/main', 
            templateUrl: 'templates/main.html', 
            controller: 'MainCntrl'
        }); 

    $urlRouterProvider.otherwise('/main'); 
}); 