angular.module('app', ['ngMaterial', 'ngMessages', 'md.data.table'])
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
                basicAuthForm: {
                    username: { pl: 'Nazwa użytkownika', en: 'Username' },
                    password: { pl: 'Hasło', en: 'Password' },
                    loginButton: { pl: 'Zaloguj mnie (Hej, spoofersi)', en: 'Login (Hi, spoofers)' }
                },
                panelSearch: {
                    label: { pl: 'Użytkownik', en: 'Username' },
                    placeholder: { pl: 'Wprowadź wartość', en: 'Provide a value' },
                    button: { pl: 'Szukaj', en: 'Search'}
                },
                panelTable: {
                    title: { pl: 'repozytoria', en: 'repositories' },
                    headers: {
                        name: { pl: 'Nazwa', en: 'Name'},
                        created: { pl: 'Utworzone', en: 'Created' },
                        updated: { pl: 'Uaktualnione', en: 'Updated' },
                        language: { pl: 'Język', en: 'Language' },
                        stars: { pl: 'Gwiazdki', en: 'Stars' },
                        forks: { pl: 'Widelce...', en: 'Forks'}
                    }
                },
                unstarDialog: {
                    confirmTitle: { pl: 'Proszę potwierdź', en: 'Please confirm' },
                    confirmContent: { pl: 'Czy napewno chcesz pozbawić to repo swojej gwiazdki?', en: 'Are you sure that you want to unstar this repo?' },
                    confirmOk: { pl: 'Tak, proszę', en: 'Yes, please' },
                    confirmCancel: { pl: 'Nie, przepraszam', en: 'No, sorry'}
                }
            }
        }
    })
    .service('appStateSrvc', function () {
        return {
            githubUsername: '',
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
            },
            getUserData: function (userName) {
                var q = $q.defer();

                $http({ method: 'GET', url: 'Home/GetUserData?username=' + userName })
                .then(function (result) {
                    q.resolve(result);
                }, function (result) {
                    q.resolve(result);
                })

                return q.promise
            },
            starRepo: function (username, repo) {
                var q = $q.defer();

                $http({
                    method: 'GET',
                    url: 'Home/StarRepo?username=' + username + '&name=' + repo,
                })
                .then(function (result) {
                    q.resolve(result);
                }, function (result) {
                    q.resolve(result);
                })

                return q.promise
            },
            unstarRepo: function (username, repo) {
                var q = $q.defer();

                $http({
                    method: 'GET',
                    url: 'Home/UnstarRepo?username=' + username + '&name=' + repo,
                })
                .then(function (result) {
                    q.resolve(result);
                }, function (result) {
                    q.resolve(result);
                })

                return q.promise
            }
        }
    })
    .controller('indexCtrl', function ($scope, $rootScope, $timeout, $location, $element, appStateSrvc, languageSrvc, helpersSrvc) {
        // Naive check to see if user is logged in
        (function () {
            var username = angular.element(document).find('my-data').attr('username');

            if (username == undefined) {
                // Keep default values on appStateSrvc
            } else {
                appStateSrvc.githubUsername = username;
            }

            $scope.appState = appStateSrvc;
        }())

        // Language related
        $scope.language = {
            current: languageSrvc.current,
            content: languageSrvc.content
        };

        $scope.changeLanguage = function () {
            $scope.language.current = languageSrvc.current = $scope.language.current == 'pl' ? 'en' : 'pl';

            $rootScope.$broadcast('languageChange', { current: languageSrvc.current })
        };

        $scope.logIn = function (userName, password) {
            helpersSrvc.login(userName, password)
              .then(function (result) {
                  if (result.data.status == 'Ok') {
                      $scope.userData = result.data.data;

                      appStateSrvc.githubUsername = userName;
                  } else if (result.data.status == 'Error') {
                      appStateSrvc.githubUsername = '';

                      // Lazy message for now
                      alert('Bad credentials')
                  } else {
                      alert('Unknown server response')
                  }
              }, function (result) {

              })
        };

        $scope.logOut = function () {
            appStateSrvc.githubUsername = '';
        };

        // Watches
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
                };

                scope.$on('languageChange', function (event, args) {
                    scope.language.current = args.current;
                })
            },
            scope: {
                login: '&',
            }
        }
    })
    .directive('panelDrv', function (helpersSrvc, languageSrvc, $mdDialog) {
        return {
            restrict: 'E',
            templateUrl: 'Home/Panel',
            link: function (scope, iElement, attrs) {
                // Initial
                scope.getUserFormData = {
                    name: 'chrishermut'
                };

                // Language related
                scope.language = {
                    current: languageSrvc.current,
                    content: languageSrvc.content
                };

                scope.$on('languageChange', function (event, args) {
                    scope.language.current = args.current;
                })

                scope.selected = [];

                scope.data = null;

                scope.getUserData = function () {
                    helpersSrvc.getUserData(scope.getUserFormData.name)
                        .then(function (result) {
                            if (result.data.message == 'User error') {
                                alert('User error');

                                scope.data = null;
                            } else if (result.data.message == 'Repository search error') {
                                alert('Repository search error');

                                scope.data = null;
                            } else if (result.data.message == 'Ok') {
                                scope.data = result.data;
                            }
                        }, function () {

                        })
                };

                function starRepo() {
                    helpersSrvc.starRepo(scope.data.userData.login, scope.selected[0].name)
                        .then(function (result) {
                            if (result.data == 'Ok') {
                                // Update data
                                for (var x = 0; x < scope.data.repositories.length; x++) {
                                    if (scope.data.repositories[x].name == scope.selected[0].name) {
                                        scope.data.repositories[x].stars++;
                                        break;
                                    }
                                }

                                scope.selected = [];
                            } else if (result.data == 'Unable to star repo') {
                                alert(result.data)
                            } else if (result.data == 'Repo already starred') {
                                alert(result.data)
                            }
                        }, function (result) {
                            console.log(result)
                        })
                }

                function unstarRepo() {
                    helpersSrvc.unstarRepo(scope.data.userData.login, scope.selected[0].name)
                        .then(function (result) {
                            alert(result.data)
                        }, function (result) {

                        })
                }

                // Dialogs
                scope.unstarRepoDialog = function () {
                    if (scope.selected.length == 1) {
                        var confirm = $mdDialog.confirm({
                            title: languageSrvc.content.unstarDialog.confirmTitle[languageSrvc.current],
                            content: languageSrvc.content.unstarDialog.confirmContent[languageSrvc.current],
                            ok: languageSrvc.content.unstarDialog.confirmOk[languageSrvc.current],
                            cancel: languageSrvc.content.unstarDialog.confirmCancel[languageSrvc.current]
                        });

                        $mdDialog.show(confirm).then(function () {
                            unstarRepo();
                        }, function () {

                        });
                    } else {
                        var alert = $mdDialog.alert({
                            title: 'Attention',
                            content: 'Select single repo to unstar!',
                            ok: 'Ok'
                        });

                        $mdDialog.show(alert).finally(function () { $mdDialog.hide() });
                    }
                };
            },
            scope: {}
        }
    })