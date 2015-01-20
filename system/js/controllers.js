angular.module('a13base.controllers', [])

.controller('MenuCtrl', function($scope, utils) {

	$scope.calibrate = function(){
		utils.calibrateTouchScreen()
	}

	$scope.startRemoteSupport = function(){
		utils.startRemoteSupport();
	}

	$scope.restart = function(){
		utils.reboot();
	}
})

.controller('IpSettingsCtrl', function($scope, $stateParams,  network) {
	var iface = $stateParams.iface;
	$scope.settings = network.getSettings()[iface];

	$scope.ip = network.getSettings(iface)

	$scope.$on("$destroy", function(){
		if(iface == "wlan0"){
			network.saveSettings();
		}
		else{
			network.applySettings(iface, function(){
			});			
		}
	})
})

.controller('AppCtrl', function($scope, config) {
	$scope.app = config.get().app;

	$scope.$on("$destroy", function(){
		config.save();
	})
})

.controller('NotavailCtrl', function($scope, config) {
	$scope.config = config.get();
})

.controller('NetworkCtrl', function($scope,  $http, network, config) {

	$scope.config = config.get();
	$scope.interfaces = network.getSettings();

	$scope.ips = {
		wlan0 : network.getIpAddress('wlan0'),
		eth0 : network.getIpAddress('eth0')
	}

	$scope.change = function(iface){
		network.applySettings(iface, function(){
		});			
	}

	$scope.toggleMobile = function(){
		if($scope.config.mobileNetwork.active){
			network.connectMobile();
		}
		else{
			network.disconnectMobile();
		}
	}

	$http.get("http://ipecho.net/plain").success(function(data){
		$scope.externalIp  = data;
	})
})

.controller('WifiCtrl', function($scope, network) {
	$scope.aps = network.startScanWifi(function(networks){
		$scope.aps = networks;
		$scope.$apply();
	});

	$scope.getLevel = function(strength){
		if(strength > 75){
			return 3; 
		}
		else if(strength > 50){
			return 2; 
		}
		else if(strength > 25){
			return 1; 
		}
		else{
			return 0;
		}
	}

	$scope.$on("$destroy", function(){
		network.stopScanWifi();
	})
	
})

.controller('ApSettingsCtrl', function($scope, $stateParams, $location, network, $ionicLoading) {
	$scope.network =  network.getWifiNetwork($stateParams.ssid);
	
	$scope.network.passphrase = "6Ro/!(bBbBB"

	$scope.connect = function(){
		$ionicLoading.show({template :  "Connecting ... "})
		network.connectWifi($scope.network.ssid, $scope.network.passphrase, function(err){
			$ionicLoading.hide();
			if(err){
				$scope.connectionError = err;
			}
			else{
				$location.path("/wifi");
			}
		})
	}
})

.controller('MobileCtrl', function($scope, config, network) {
	$scope.settings = config.get().mobileNetwork
	$scope.$on("$destroy", function(){
		network.writeMobileConf();
	})
})


.controller('ErrorCtrl', function($scope) {
	console.log(global.error)
	$scope.error = global.error.message
});