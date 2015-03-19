angular.module('hypeOrNah')

.directive('placesTypePicker', function(){

    function linkFunc(scope, element, attrs){
        scope.setActive = function(type) {
            scope.placesType = type;
        };

        scope.isActive =  function(type) {
            return type === scope.placesType;
        };

        scope.placesType='night_club'; 
        console.log("link called"); 
    }

    return {
        restrict: 'E',
        templateUrl: '/js/directives/places-type-picker/places-type-picker.html', 
        scope: {
            placesType: '='
        }, 
        link: linkFunc
    }; 
}); 