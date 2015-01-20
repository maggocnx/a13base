angular.module('a13base', ['ionic', 'a13base.controllers', 'a13base.services', 'gronic.ui'])
.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('menu', {
      url: "/menu",
      templateUrl: "templates/menu.html",
      controller : "MenuCtrl"
    })

    .state('app', {
      url: "/app",
      templateUrl: "templates/app.html",
      controller : "AppCtrl"
    })

    .state('welcome', {
      url: "/welcome",
      templateUrl: "templates/welcome.html"
    })

    .state('notavail', {
      url: "/notavail",
      templateUrl: "templates/notavail.html",
      controller :"NotavailCtrl"
    })

    .state('network', {
      url: "/network",
      templateUrl: "templates/network.html",
      controller : "NetworkCtrl"
    })

    .state('wifi', {
      url: "/wifi",
      templateUrl: "templates/wifi.html", 
      controller : "WifiCtrl"
    })

    .state('mobile', {
      url: "/mobile",
      templateUrl: "templates/mobile.html",
      controller : "MobileCtrl"
    })

    .state('ip-settings', {
      url: "/ip/:iface",
      templateUrl: "templates/ip-settings.html",
      controller : "IpSettingsCtrl"
    })

    .state('ap-settings', {
      url: "/ap/:ssid",
      templateUrl: "templates/ap-settings.html",
      controller : "ApSettingsCtrl"
    })

    .state('error', {
      url: "/error",
      templateUrl: "templates/error.html",
      controller : "ErrorCtrl"
    })


    $urlRouterProvider.otherwise('/menu');
})
.run(function($rootScope){

  global.device.on("wifistatus", function(info){
    $rootScope.currentWifiNetwork = info;
    $rootScope.$apply();
  })

  $rootScope.reload = function(){
    window.location.reload();
  }
})