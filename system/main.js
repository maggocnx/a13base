var platform = require('os').platform();
var exec = require("child_process");
var secretCode = 0;
var gui = null;
var child_process = require("child_process"); 
var exec = child_process.exec;
var spawn = child_process.spawn;
var platform = require("os").platform();

var config = require(process.cwd() + "/system/config.json");
global.deviceType = config.deviceType;

var events = require('events');
global.device = new events.EventEmitter();

global.reverseTunnel = null;

var devOverlayHtml = '<button class="button-icon ion-refresh" click="alert("PPP")"></button>'

if(platform == 'linux'){
	var Wireless = require("./wireless.js");
	global.wireless = new Wireless({iface : "wlan0"});
	global.wifiProcess = null;

	checkWifiStatus = function(){
		wireless.info(function(err,info){
			if(err || !info.ssid ){
				// console.log("NO WIFI")
				global.device.emit("wifistatus", null)
			}
			else{
				// console.log("YES WIFI")
				global.device.emit("wifistatus", info)
			}
		});
	}

	checkWifiStatus();

	setInterval(checkWifiStatus,10000 );

	global.checkSignal =function(){
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

	if(config.mobileNetwork.active){
		global.wvdial = spawn("wvdial");
		global.checkSigInterval = setInterval(checkSignal, 10000);
		global.checkSignal();
	}
}
else{
	setInterval(
		function(){
			global.device.emit("wifistatus", {ssid : "Testwifi", strength : 3});
		}
	,10000);
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

keyup = function(e){
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

setTimeout(function() {
	gui = window.require("nw.gui");
	window.onkeyup = keyup;

	// if(platform=='darwin'){
	// 	var gui = window.require('nw.gui');
 	//  var win = gui.Window.get();
 	//  devWin = win.showDevTools();
 	//  devWin.moveTo(100,100)
	// }

	var div = window.document.createElement('div');
	// div.innerHTML = devOverlayHtml;


	// process.on('uncaughtException', function(err) {
	// 	console.log("GRONIC ERROR")
	// 	global.error = err;
	// 	window.location = process.cwd() + "/system/settings.html#/error";
	// });
},50);

//very dirty workaround don't find a listener for on window load 
setInterval(function(){ 
	if(!window.onkeyup){
		window.onkeyup = keyup;



	}
}, 500)
