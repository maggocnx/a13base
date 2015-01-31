angular.module('gronic.ui', [])
.config(function($sceProvider){
	$sceProvider.enabled(false);
})
.run(function($rootScope,$compile){
	var keyboardScope = $rootScope.$new();
	var gronicKeyboard = angular.element(document.createElement('keyboard'));
	var el = $compile( gronicKeyboard )( keyboardScope );


	angular.element(document.body).append(gronicKeyboard);
	$rootScope.reload = function(){
		window.location.reload();
	}
})

.directive('wifiStatus', function() {
	con = console
	return  {
		restrict : "E",
		templateUrl : "../gronic-ui/templates/wifi-status.html",
		link : function(scope,element2,attrs){


			scope.$on('destroy', function(){
				console.log("SSSSDESS")
			})

			scope.bars = 0;
			scope.active = false;
			global.device.on("wifistatus", function(info){

				if(info){
					scope.active = true;
					if(info.strength > 75){
						scope.bars = 3; 
					}
					else if(info.strength > 50){
						scope.bars = 2; 
					}
					else if(info.strength > 25){
						scope.bars = 1; 
					}
					else{
						scope.bars = 0;
					}
				}

				try{
					// scope.$apply();
				}
				catch(e){
					console.log("GRONIC Err")
				}
				
			})

			

		}
	}
})


.directive('mobileStatus', function($interval){
	return {
		restrict : "E",
		templateUrl : "../gronic-ui/templates/mobile-status.html",
		link: function(scope, element, attrs){
			global.device.on("signalchanged",function(signal){
					scope.signal = signal;
					scope.$apply()
			})
		}
	}
})


.directive('statusBar', function($interval){
	return {
		restrict : "EA",
		scope : {
			title : "@",
			options : "=",
			settingsButton : "@",
			homeButton : "@"
		},
		templateUrl : "../gronic-ui/templates/statusbar.html",
		link: function(scope, element, attrs){

			scope.baseDir = process.cwd();
			scope.currentTime = new Date();
			$interval(function(){
			// 	scope.currentTime = new Date();
			},1000)
		}
	}
})   

.service('printer', function(){
	return {
		printCanvas : function(canvas, callback){
			fs = require("fs");
			var exec = require("child_process").exec;
			var __dirname = process.cwd();
	
			var imgData = canvas.toDataURL().replace(/^data:image\/\w+;base64,/, "");
			var buf = new Buffer(imgData, 'base64');
	
			var imgPath =__dirname + "/tmp.png"; 
			fs.writeFile(imgPath , buf, function(err){
				exec("convert tmp.png  -flip -flatten -negate -monochrome -colors 2 bmp:- | tail -c+83  > /dev/thprint", function(err){
					if(callback){
						callback(err);
					}
				})
			})
		}
	}
})