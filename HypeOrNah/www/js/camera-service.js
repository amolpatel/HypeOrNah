angular.module('hypeOrNah')
.factory('CameraService', function($window) {
  var hasUserMedia = function() {
    return !!getUserMedia();
  }

  var getUserMedia = function() {
    navigator.getUserMedia = ($window.navigator.getUserMedia || 
                              $window.navigator.webkitGetUserMedia ||
                              $window.navigator.mozGetUserMedia || 
                              $window.navigator.msGetUserMedia);
    return navigator.getUserMedia;
  }

  return {
    hasUserMedia: hasUserMedia(),
    getUserMedia: getUserMedia
  }
}); 

angular.module('hypeOrNah')
.directive('camera', function(CameraService) {
  return {
    restrict: 'EA',
    replace: true,
    transclude: true,
    scope: {},
    controller: function($scope, $q, $timeout) {
      this.takeSnapshot = function() {
        var canvas  = document.querySelector('canvas'),
            ctx     = canvas.getContext('2d'),
            videoElement = document.querySelector('video'),
            d       = $q.defer();

        canvas.width = $scope.w;
        canvas.height = $scope.h;

        $timeout(function() {
          ctx.fillRect(0, 0, $scope.w, $scope.h);
          ctx.drawImage(videoElement, 0, 0, $scope.w, $scope.h);
          d.resolve(canvas.toDataURL());
        }, 0);
        return d.promise;
      }
    },
    template: '<div class="camera"><video class="camera" autoplay="" /><div ng-transclude></div></div>',
    link: function(scope, ele, attrs) {
      var w = attrs.width || 320,
          h = attrs.height || 200;

      if (!CameraService.hasUserMedia) return;
      var userMedia = CameraService.getUserMedia(),
          videoElement = document.querySelector('video');
      // Inside the link function above
      // If the stream works
      var onSuccess = function(stream) {
        if (navigator.mozGetUserMedia) {
          videoElement.mozSrcObject = stream;
        } else {
          var vendorURL = window.URL || window.webkitURL;
          videoElement.src = window.URL.createObjectURL(stream);
        }
        // Just to make sure it autoplays
        videoElement.play();
      }
      // If there is an error
      var onFailure = function(err) {
        console.error(err);
      }
      // Make the request for the media
      navigator.getUserMedia({
        video: {
          mandatory: {
            maxHeight: h,
            maxWidth: w
          }
        }, 
        audio: true
      }, onSuccess, onFailure);

      scope.w = w;
      scope.h = h;
    }
  }
})


.directive('cameraControlSnapshot', function() {
  return {
    restrict: 'EA',
    require: '^camera',
    scope: true,
    template: '<button ng-click="takeSnapshot()" class="button button-block button-primary">Take Photo</button>',
    link: function(scope, ele, attrs, cameraCtrl) {
      scope.takeSnapshot = function() {
        cameraCtrl.takeSnapshot()
        .then(function(image) {
          // data image here
        });
      }
    }
  }
})