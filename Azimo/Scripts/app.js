angular.module('app', ['ngMaterial', 'ngMessages'])
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('altTheme')
          .primaryPalette('purple')
    })
    .service('appStateSrvc', function () {
        return {
            loggedIn: false
        }
    })
    .service('helpersSrvc', function ($http, $q) {
        return {
            login: function (userName, password) {
                var q = $q.defer();

                $http({ method: 'GET', url: 'Home/Login?username=' + userName + '&password=' + password })
                .then(function (result) {
                    q.resolve(result);
                }, function (result) {
                    q.resolve(result);
                })

                return q.promise
            }
        }
    })
    .controller('indexCtrl', function ($scope, $timeout, appStateSrvc, helpersSrvc) {
        // Initial
        $scope.userData = {};
        $scope.tooltip = {
            visible: false,
            message: ''
        };

        $scope.appState = appStateSrvc;

        $scope.logIn = function (userName, password) {
            helpersSrvc.login(userName, password)
              .then(function (result) {
                  if (result.data.status == 'Ok') {
                      $scope.userData = result.data.data;
                      appStateSrvc.loggedIn = true;
                  } else if (result.data.status == 'Error') {
                      $scope.userData = {};
                      appStateSrvc.loggedIn = false;

                      // Lazy message for now
                      alert('Bad credentials')
                  } else {
                      alert('Unknown server response')                    
                  }
              }, function (result) {
                  console.log(result);
              })
        };

        $scope.logOut = function () {
            appStateSrvc.loggedIn = false;
            $scope.userData = {};
        };

        // We do not want that timout to proceed after mouseleave
        // TODO-BUG: It's not getting canceled properly in some scenarios
        var tooltipTimeout = function (fn) {
            $timeout(fn, 1000)
        };

        $scope.showTooltip = function (target) {
            function showTooltip() {
                $scope.tooltip.visible = true;

                if (target == 'BA') {
                    $scope.tooltip.message = 'Basic authentication - it will not persist state';
                } else if (target == 'OA') {
                    $scope.tooltip.message = 'OAUTH authentication - persists state after reload';
                }
            }

            tooltipTimeout(showTooltip)
        };

        $scope.hideTooltip = function () {
            $timeout.cancel(tooltipTimeout)
            $scope.tooltip.visible = false;
        }
    })
    .directive('basicAuthDrv', function () {
        return {
            restrict: 'E',
            templateUrl: 'Home/BasicAuthForm',
            link: function (scope, tElement, attrs) {
                // Initial
                scope.user = {
                    name: 'chris.hermut@gmail.com',
                    password: 'werty1234'
                };

                scope.goMental = function () {
                    scope.login({ userName: scope.user.name, password: scope.user.password })
                }
            },
            scope: {
                login: '&'
            }
        }
    })