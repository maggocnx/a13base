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

	$scope.getAddress = function(iface){
		return  network.getIpAddress(iface);
	}
})

.controller('WifiCtrl', function($scope, network) {
	
	$scope.scan = function(){
		network.scanWifi(function(err,data){
			if(!err){
				// console.log(data)
				$scope.aps = data;
				$scope.$apply()
			}
		})
	}

	setInterval(function(){
		$scope.scan();
	},10000);

	$scope.scan();
})


.controller('MobileCtrl', function($scope, config, network) {
	$scope.settings = config.get().mobileNetwork


	$scope.$on("$destroy", function(){
		network.writeMobileConf();
	})

})

.controller('ApSettingsCtrl', function($scope, $stateParams, $location, network) {
	$scope.settings = {
		ssid : $stateParams.ssid
	}

	$scope.connect = function(){
		network.connectWifi($scope.settings.ssid, $scope.settings.passphrase, function(){

		})
	}
})

.controller('ErrorCtrl', function($scope) {
	console.log(global.error)
	$scope.error = global.error.message
});