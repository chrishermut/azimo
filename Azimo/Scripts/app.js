angular.module('app', ['ngMaterial'])
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
            login: function () {
                var q = $q.defer();

                $http({ method: 'GET', url: 'Home/Login' })
                .then(function (result) {
                    q.resolve(result);
                }, function () {
                    q.resolve([]);
                })

                return q.promise
            }
        }
    })
    .controller('indexCtrl', function ($scope, appStateSrvc, helpersSrvc) {
        // Initial
        $scope.userData = {};
        $scope.tooltip = {
            visible: false,
            message: ''
        };

        $scope.appState = appStateSrvc;

        $scope.logIn = function () {
            helpersSrvc.login()
              .then(function (result) {
                  $scope.userData = result;
                  appStateSrvc.loggedIn = true;

                  console.log($scope.userData.data.Login);
              }, function (result) {
                  // TODO: Indicate error
              })
        };

        $scope.logOut = function () {
            appStateSrvc.loggedIn = false;
            $scope.userData = {};
        };

        $scope.showTooltip = function (target) {
            $scope.tooltip.visible = true;

            if (target == 'SA') {
                $scope.tooltip.message = 'Basic authentication - it will not persist state';
            } else if (target == 'OA') {
                $scope.tooltip.message = 'OAUTH authentication - persists state after reload';
            }
        };

        $scope.hideTooltip = function () {
            $scope.tooltip.visible = false;
        }
    })