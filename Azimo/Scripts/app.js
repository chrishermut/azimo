angular.module('app', ['ngMaterial'])
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('altTheme')
          .primaryPalette('purple')
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
    .controller('indexCtrl', function ($scope, helpersSrvc) {
        // Initial
        $scope.userData = {};

        $scope.logIn = function () {
            helpersSrvc.login()
              .then(function (result) {
                  $scope.userData = result;
              }, function (result) {
                  // TODO: Indicate error
              })
        }
    })