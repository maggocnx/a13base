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
.directive('input', function(keyboardDelegate){
	return {
		restrict : "E",
		scope : { ngModel : '='},
		link : function(scope, element, attrs){
			
			if( typeof attrs.disableTouch != 'undefined' ){
				return;
			}

			var prompt = attrs.name || attrs.prompt;

			element.on("focus", function(){
				keyboardOptions = {
					value : scope.ngModel,
					prompt : prompt,
					type : attrs.type
				}

				keyboardDelegate.show(keyboardOptions, function(value){
						if(typeof scope.ngModel == "undefined") return;
							
						if(attrs.type=="number"){
							scope.ngModel = parseInt(value)
						}
						else{
							scope.ngModel = value;
						}
				});
			});
		}
	}
})

.directive('wifiStatus', function() {
	return  {
		restrict : "E",
		template : '<span><img ng-src="file:///gronic/img/wifi_{{bars}}.png"></span>',
		link : function(scope,element,attrs){
			scope.bars = 0;
			global.device.on("wifistatus", function(info){
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

				scope.$apply();
			})
		}
	}
})

.service('keyboardDelegate', function($q){
	var showKeyboardCb;

	return {
		show : function(options, callback){
			showKeyboardCb(options, callback)
		},
		link : function(callback){
			showKeyboardCb = callback
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
		templateUrl : "file:///gronic/templates/statusbar.html",
		transclude : true,
		link: function(scope, element, attrs){
			scope.currentTime = new Date();

			global.device.on("signalchanged",function(signal){
				scope.signal = signal;
				scope.$apply()
			})

			$interval(function(){
				scope.currentTime = new Date();
			},1000)
		}
	}
})   

.directive('keyboard', function(keyboardDelegate){
	var layouts = {
		text:{ 
			keys : [
				// 1st row
				{ value: 113 },{ value: 119 },{ value: 101 },{ value: 114 },{ value: 116 },
				{ value: 121 },{ value: 117 },{ value: 105 },{ value: 111    },{ value: 112 },
				// 2nd row
				{ value: 97, buttonClass: "keyboardbutton button_a" },{ value: 115 },{ value: 100 },{ value: 102 },
				{ value: 103 },{ value: 104 },{ value: 106 },{ value: 107 },{ value: 108 },



				// 3rd row

				{ value: "ABC", icon : "ion-arrow-up-a", isChar: "false", buttonClass: "keyboardbutton button_shift_left", change: "capital", keyClass: "key key_capitalletterleft" },
				{ value: 122 , buttonClass : "keyboardbutton button_row3_first_char"},{ value: 120 },{ value: 99 },{ value: 118 },{ value: 98 },
				{ value: 110 },{ value: 109, buttonClass : "keyboardbutton button_row3_last_char"},
				// { value: 39 },
				{ value: "del", icon : "ion-arrow-left-a", isChar: "false", onclick: "del", buttonClass: "keyboardbutton button_del", keyClass: "key key_del" },

				// 4th row
				{ value: "123", isChar: "false", buttonClass: "keyboardbutton button_switch_layout", change: "number", keyClass: "key key_number" },
				{ value: 44 },{ value: 32, buttonClass: "keyboardbutton button_space" },{ value: 46 },
				{ value: "Enter",icon : "ion-checkmark",  isChar: "false", buttonClass: "keyboardbutton button_enter", onclick: "enter", keyClass: "key key_enter" }
			]
		},
		capital:{
			keys : [
				// 1st row
				{ value: 81 },{ value: 87 },{ value: 69 },{ value: 82 },{ value: 84 },{ value: 89 },
				{ value: 85 },{ value: 73 },{ value: 79 },{ value: 80 },
				// 2nd row
				{ value: 65, buttonClass: "keyboardbutton button_a" },{ value: 83 },{ value: 68 },{ value: 70 },
				{ value: 71 },{ value: 72 },{ value: 74 },{ value: 75 },{ value: 76 },
				// 3rd row
				{ value: "abc", icon : "ion-arrow-up-a", isChar: "false", buttonClass: "keyboardbutton button_shift_left", change: "text", keyClass: "key key_smallletter" },
				{ value: 90, buttonClass : "keyboardbutton button_row3_first_char"},{ value: 88 },{ value: 67 },{ value: 86 },{ value: 66 },{ value: 78 },
				{ value: 77 ,buttonClass : "keyboardbutton button_row3_last_char"},
				{ value: "del", icon : "ion-arrow-left-a", isChar: "false", onclick: "del", buttonClass: "keyboardbutton button_del", keyClass: "key key_del" },

				{ value: "123", isChar: "false", buttonClass: "keyboardbutton button_switch_layout", change: "number", keyClass: "key key_number" },
				{ value: 44 },{ value: 32, buttonClass: "keyboardbutton button_space" },{ value: 46 },
				{ value: "Enter",icon : "ion-checkmark",  isChar: "false", buttonClass: "keyboardbutton button_enter", onclick: "enter", keyClass: "key key_enter" }
			]
		},
		
		number:{ 
			keys : [
				// 1st row       
				{ value: 49 },{ value: 50 },{ value: 51 },{ value: 52 },{ value: 53 },{ value: 54 },
				{ value: 55 },{ value: 56 },{ value: 57 },{ value: 48 },
				// 2nd row
				{ value: 45, buttonClass: "keyboardbutton button_dash" },{ value: 47 },{ value: 58 },{ value: 59 },
				{ value: 40 },{ value: 41 },{ value: 36 },{ value: 38 },{ value: 64 },
				//3rd row
				{ value: "#$@" ,isChar: "false", buttonClass: "keyboardbutton button_shift_left", change: "symbols", keyClass: "key key_capitalletterleft" },
				{ value: 63, buttonClass : "keyboardbutton button_row3_first_char" },{ value: 33 },{ value: 34 },{ value: 92 },{ value: 42 },{ value: 61 },{ value: 43, buttonClass : "keyboardbutton button_row3_last_char"},
				{ value: "del", icon : "ion-arrow-left-a",isChar: "false", onclick: "del", buttonClass: "keyboardbutton button_del", keyClass: "key key_del" },

				// 4th row
				{ value: "abc", isChar: "false", buttonClass: "keyboardbutton button_switch_layout", change: "text", keyClass: "key key_symbols" },
				{ value: 32, buttonClass: "keyboardbutton button_space" },
				{ value: "Enter",icon : "ion-checkmark",  isChar: "false", buttonClass: "keyboardbutton button_enter", onclick: "enter", keyClass: "key key_enter" },

			]
		},
		symbols: {
			keys : [
				// 1st row
				{ value: 91 },{ value: 93 },{ value: 123 },{ value: 125 },{ value: 35 },{ value: 37 },
				{ value: 94 },{ value: 42 },{ value: 43 },{ value: 61 },
				// 2nd row
				{ value: 95, buttonClass: "keyboardbutton button_underscore" },{ value: 92 },{ value: 124 },{ value: 126 },
				{ value: 60 },{ value: 62 },
				{ value: "€", isChar: "false", onclick: "jsKeyboard.writeSpecial('&euro;');" },
				{ value: 163 },{ value: 165 },
				// 3rd row
				{ value: "123", isChar: "false", buttonClass: "keyboardbutton button_shift_left", change: "number", keyClass: "key key_capitalletterleft" },
				{ value: 46 },{ value: 44 },{ value: 63 },{ value: 33 },{ value: 39 },{ value: 34 },{ value: 59 },{ value: 92 },
				{ value: "del", icon : "ion-arrow-left-a",isChar: "false", onclick: "del", buttonClass: "keyboardbutton button_del", keyClass: "key key_del" },

				// 4th row
				{ value: "abc", isChar: "false", buttonClass: "keyboardbutton button_switch_layout", change: "text", keyClass: "key key_number" },
				{ value: 32, buttonClass: "keyboardbutton button_space" },
				{ value: "Enter", icon : "ion-checkmark", isChar: "false", buttonClass: "keyboardbutton button_enter", onclick: "enter", keyClass: "key key_enter" },

			]
		},
		tel: { 
			class : "telKeyboard", 
			keyBoardClass : "tel",
			keys : [
				{ value: 49 },{ value: 50 },{ value: 51 },{ value: 52 },{ value: 53 },{ value: 54 },
				{ value: 55 },{ value: 56 },{ value: 57 },
				{ value: "del", icon : "ion-arrow-left-a",isChar: "false", onclick: "del", keyClass: "key key_del" },
				{ value: 48 },
				{ value: "Enter", icon : "ion-checkmark",  isChar: "false", onclick: "enter", keyClass: "key key_enter" }
			]
		}
	}
	return {
		restrict : "EA",
		templateUrl : "file:///gronic/templates/gronic-keyboard.html",
		transclude : true,
		link: function(scope, element, attrs){
			var inputElement =  element.find("input")[0]

			window.testInput = inputElement;

			scope.keyboard = {
				layouts : layouts
			}

			keyboardDelegate.link(function(options, callback){
				scope.keyboard.value = (options.value != undefined) ? options.value : "x";
				scope.keyboard.prompt = options.prompt;
				scope.keyboard.type = options.type;

				scope.keyboard.hidden = (options.type == "number") ? true : false;
				inputElement.focus();

				onComplete = callback;

				setTimeout(function() {
					scope.keyboard.visible = true;
					scope.$apply()
					document.getElementById("grTouchInput").focus()
				}, 10);

			});

			scope.keypress = function(e){
				if(e.keyCode == 13 ){
					complete();
				}
			}

			if(!scope.type || !scope.keyboard[scope.type] ){
				scope.currentLayout = 'text'
			}

			complete = function(){
				scope.keyboard.visible = false;
				onComplete(scope.keyboard.value);
			}

			scope.refocus = function(evt){
				evt.target.focus();
			}

			scope.triggerButton = function(key, evt , el){
				var button = angular.element(evt.currentTarget);
				button.css("background-color", "#999");
				setTimeout(function() {
					button.css("background-color", "#fff");
				}, 200);


				if(scope.currentLayout == "capital"){
					scope.currentLayout = "text";
				}

				if(key.isChar == true || key.isChar == undefined){
					var character = String.fromCharCode(key.value);
					scope.keyboard.value += character;
				}
				else if(key.change){
					scope.currentLayout = key.change;
				}
				else if(key.onclick){
					callbacks[key.onclick]();					
				}
			}	

			callbacks = {
				del : function(){
					scope.keyboard.value = scope.keyboard.value.slice(0, scope.keyboard.value.length -1);
				},
				enter : complete
			}

			scope.getText = function(key){
				return (key.isChar != undefined || key.isChar == false) ? key.value : String.fromCharCode(key.value);
			}
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