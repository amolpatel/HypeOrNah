angular.module('hypeOrNah', ['ionic'])

.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('main', {
            url: '/main', 
            templateUrl: 'templates/main.html', 
            controller: 'MainCntrl'
        }); 

    $urlRouterProvider.otherwise('/main'); 
}); 