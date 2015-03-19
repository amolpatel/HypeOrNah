angular.module('hypeOrNah')

.directive('placesList', function(){

    function linkFunc(scope, element, attrs){
        scope.$watch(attrs.placesType, function(oldType, newType){
            // PLACES TYPE CHANGED, UPDATE LIST
            scope.doRefresh(); 
        }); 
    }

    return {
        restrict: 'E',
        controller: 'PlacesCntrl', 
        templateUrl: '/js/directives/places-directive/places-directive.html', 
        scope: {
            placesType: '='
        }, 
        link: linkFunc
    }; 
}); 