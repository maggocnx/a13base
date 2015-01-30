var platform = require('os').platform();
var secretCode = 0;
var gui = null;
var child_process = require("child_process"); 
var exec = child_process.exec;
var spawn = child_process.spawn;
var events = require('events');


var config = require(process.cwd() + "/system/config.json");
global.deviceType = config.deviceType;

global.device = new events.EventEmitter();

global.reverseTunnel = null;
global.startTime = new Date().getTime();


if(platform=='linux'){
	var Wireless = require("./wireless.js");
	global.wireless = new Wireless({iface : "wlan0"});
}

var _checkWifiStatus = function(){
	if(platform=='linux'){
		wireless.info(function(err,info){
			if(err || !info.ssid ){
				global.device.emit("wifistatus", null)
			}
			else{
				global.device.emit("wifistatus", info)
			}
		});
	}
	else{
		global.device.emit("wifistatus", {ssid : "Testwifi", strength : Math.floor(Math.random() * 100)});
	}
}

var _checkSignal =function(){
	global.signalCheckProcess = exec("comgt -d /dev/ttyUSB2 sig",function(err, stdout,stderr){
		try{
			var signalRE = stdout.match("ty: (.*),");
			var signalValue = parseInt(signalRE[1]);

			if(signalValue > 22){
				signal = 4
			}
			else if(signalValue > 15){
				signal = 3
			}
			else if(signalValue > 7){
				signal = 2
			}
			else if(signalValue > 1){
				signal = 1
			}
			else{
				signal = 0
			}
			global.device.emit("signalchanged", signal);
		}
		catch(e){
			console.log(e.message)
		}
	});
}


var _checkWifiInterval = null;

global.startWifiCheck = function(){
	_checkWifiStatus();
	_checkWifiInterval = setInterval(_checkWifiStatus, 3000);
}

global.stopWifiCheck = function(){
	clearInterval(_checkWifiInterval);
}


var _checkMobileInterval;

global.startMobileCheck = function(){
	_checkSignal();
	_checkMobileInterval = setInterval(checkSignal, 3000);
}

global.stopMobileCheck = function(){
	clearInterval(_checkMobileInterval);
}



global.restart = function(){
	var cmd = (platform=="linux") ? "nw" : "/Applications/node-webkit.app/Contents/MacOS/node-webkit";
	spawn(cmd, ['.']);
	process.exit();
}

openSettings = function(){
	window.location =  "file://" + process.cwd() +  "/system/settings.html";
}

reload = function(){
	window.location.reload();
}

remote = function(){
	window.location =  "http://192.168.0.51:8100"
}


calibrate = function(){
	exec("/usr/bin/calibrator --output-type xorg.conf.d --output-filename /usr/share/X11/xorg.conf.d/99-calibration.conf");
}

var settingsFunctions = {
	4711 : openSettings,
	4712 : calibrate,
	15 : reload,
	16 : remote
}

var _keyup = function(e){
	// console.log(e)

	if( e.keyCode > 47 && e.keyCode < 58 ){
		number = e.keyCode - 48;
		secretCode = (secretCode * 10) + number;
	}else if(e.keyCode == 8){
		if(settingsFunctions[secretCode]){
			settingsFunctions[secretCode]()
		}
		secretCode = 0;
	}
	else if(e.keyCode == 113){
		window.location = process.cwd() + "/system/startup.html";
	}
	else if(e.keyCode == 116 ){
		reload();
	}
	else if(e.keyCode == 117){
		openSettings();
	}
}


var _initWindow = function(){
	window.onkeyup = _keyup;
	global.startWifiCheck();
	window.isInitialized = true;
	window.onbeforeunload = function(){ 
		global.stopWifiCheck();
	}
}

_windowCheckInterval = setInterval(function(){
	console.log("STERTUP")
	if(window){
		clearInterval(_windowCheckInterval);
		_initWindow();

		setInterval(function(){
			if(!window.isInitialized){
				_initWindow();
			}
		},100);

	// if(platform=='darwin'){
	// 	var gui = window.require('nw.gui');
	// 	 	var win = gui.Window.get();
	// 	 	devWin = win.showDevTools();
	// 	 	devWin.moveTo(100,100)
	// }

	}
},1)




process.on('uncaughtException', function(err) {
	console.log("GRONIC ERROR")
	global.error = err;
	window.location = process.cwd() + "/system/settings.html#/error";
});








