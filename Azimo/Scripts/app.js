angular.module('app', ['ngMaterial', 'ngMessages'])
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('altTheme')
          .primaryPalette('purple')
    })
    .service('languageSrvc', function () {
        return {
            current: 'pl',
            content: {
                title: { pl: 'Testowa aplikacja', en: 'Test application' },
                salutation: { pl: 'Witaj', en: 'Welcome' },
                notLoggedInMsg: { pl: 'Musisz sie zalogować...', en: 'Please log in first...' },
                basicAuthForm: {
                    username: { pl: 'Nazwa użytkownika', en: 'Username' },
                    password: { pl: 'Hasło', en: 'Password' },
                    loginButton: { pl: 'Zaloguj mnie (Hej, spoofersi)', en: 'Login (Hi, spoofers)' }
                }
            }
        }
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

                $http({ method: 'GET', url: 'Github/Login?username=' + userName + '&password=' + password })
                .then(function (result) {
                    q.resolve(result);
                }, function (result) {
                    q.resolve(result);
                })

                return q.promise
            },
            getUserData: function (userName) {
                var q = $q.defer();

                $http({ method: 'GET', url: 'Github/GetUserData?username=' + userName })
                .then(function (result) {
                    q.resolve(result);
                }, function (result) {
                    q.resolve(result);
                })

                return q.promise
            }
        }
    })
    .controller('indexCtrl', function ($scope, $rootScope, $timeout, appStateSrvc, languageSrvc, helpersSrvc) {
        // Initial
        $scope.userData = null;
        $scope.tooltip = {
            visible: false,
            message: ''
        };
        $scope.showLoginForm = false;

        // Language related
        $scope.language = {
            current: languageSrvc.current,
            content: languageSrvc.content
        };

        $scope.changeLanguage = function () {
            $scope.language.current = languageSrvc.current = $scope.language.current == 'pl' ? 'en' : 'pl';

            $rootScope.$broadcast('languageChange', { current: languageSrvc.current })
        };

        $scope.appState = appStateSrvc;

        $scope.logIn = function (userName, password) {
            helpersSrvc.login(userName, password)
              .then(function (result) {
                  if (result.data.status == 'Ok') {
                      $scope.userData = result.data.data;
                      appStateSrvc.loggedIn = true;
                  } else if (result.data.status == 'Error') {
                      $scope.userData = null;
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
        };

        // Watches
        // It should be in a function responsible for changing language. Here just to use $watch in some scenarios
        $scope.$watch('language.current', function (nv) {
            languageSrvc.current = nv;
        })
    })
    .directive('basicAuthDrv', function (languageSrvc) {
        return {
            restrict: 'E',
            templateUrl: 'Home/BasicAuthForm',
            link: function (scope, tElement, attrs) {
                // Initial
                scope.language = {
                    current: languageSrvc.current,
                    content: languageSrvc.content
                };

                scope.user = {
                    name: 'chris.hermut@gmail.com',
                    password: 'werty1234'
                };

                scope.goMental = function () {
                    scope.login({ userName: scope.user.name, password: scope.user.password })
                    scope.showLoginForm = false;
                };

                scope.$on('languageChange', function (event, args) {
                    scope.language.current = args.current;
                })
            },
            scope: {
                login: '&',
                showLoginForm: '='
            }
        }
    })
    .directive('panelDrv', function (helpersSrvc) {
        return {
            restrict: 'E',
            templateUrl: 'Home/Panel',
            link: function (scope, iElement, attrs) {
                scope.getUserData = function () {
                    helpersSrvc.getUserData()
                        .then(function () {
                            alert('Ok')
                        }, function () {

                        })
                }
            }
        }
    })