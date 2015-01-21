var fs = require("fs");
var ip = require("ip");
var platform = require("os").platform();


var child_process = require("child_process"); 
var exec = child_process.exec;
var spawn = child_process.spawn;
var wifiPath = process.cwd() + "/system/wifinetworks";
	
angular.module('a13base.services', [])

.factory('config', function() {
	var configPath = "./system/config.json";

	var config = JSON.parse(fs.readFileSync(configPath));

	return {
		get : function(){
			return config;
		},
		save : function(){
			fs.writeFileSync(configPath, JSON.stringify(config,undefined ,4 ))
		}
	}
})

.factory('utils', function() {

	return {
		calibrateTouchScreen : function(){
			exec("/usr/bin/calibrator --output-type xorg.conf.d --output-filename /usr/share/X11/xorg.conf.d/99-calibration.conf")
		},
		startRemoteSupport : function(){
			global.reverseTunnel = spawn("ssh", ["-vN", "-R",  "192.168.0.6:22002:localhost:22", "autossh@217.7.222.229",  "-p", "22022"],function(error,stdout,stderr){
				console.log("TUNNEL" +err)
				console.log(error, stdout, stderr)
			})
		},
		stopRemoteSupport : function(){
			global.reverseTunnel.kill();
		},
		reboot : function(){
			exec("reboot")
		}
	}

})

.factory('network', function(config) {
	var configObj = config.get();
	var settings = configObj.network;
	var mobileSettings = configObj.mobileNetwork;
	var wifiNetworks = {};

	function writeSettings(){
		interfacesFile ="auto lo\niface lo inet loopback\n\n";
		var networkSettings = config.get().network;
		for(var iface in networkSettings){

			var settings = networkSettings[iface];

			if(settings.active ){
				interfacesFile += "auto " + iface + "\niface " + iface + " inet";

				if(networkSettings[iface].dhcp){
					interfacesFile += " dhcp\n"
				}
				else{
					interfacesFile += " static\n"
					interfacesFile += "   address " + settings.ipAddress + "\n";
					interfacesFile += "   netmask " + settings.netmask + "\n";
					interfacesFile += "   gateway " + settings.gateway + "\n";
				}
				
				if(iface=='wlan0'){
					if(settings.encryted){
						interfacesFile += "   wpa-conf /gronic/wpa.conf\n\n";
					}
					else{
						interfacesFile += "   wireless-essid " + settings.ssid + "\n\n";
					}
				}
				else if(iface == 'eth0'){
					interfacesFile += "   hwaddress ether " + settings.mac + "\n\n";
				}
			}
		}
		
		if(platform == 'linux'){
			fs.writeFileSync("/etc/network/interfaces", interfacesFile);
		}
		else{
			console.log(interfacesFile)
		}
	}

	return {
		getIpAddress : function(iface){
			try{
				return  ip.address(iface);
			}
			catch(e){
				return null;
			}
		},
		getSettings : function(){
			return settings;
		},
		saveSettings : function(){
			config.save();
		},
		startScanWifi : function(callback){
			global.wireless.start();
			global.wireless.on("appear", function(network){
				wifiNetworks[network.ssid] = network;
				callback && callback(wifiNetworks)
			});
			return wifiNetworks;
		},
		stopScanWifi : function(){
			global.wireless.stop();
		},
		getWifiNetwork : function(ssid){
			return wifiNetworks[ssid];
		},
		connectWifi : function(ssid , passphrase ,  callback){
			global.wireless.leave(function(){
				settings.wlan0.ssid = ssid;
				var wifiNetwork = wifiNetworks[ssid];
				wifiNetwork.passphrase = passphrase;

				global.wireless.join(wifiNetwork, passphrase, function(err){
					if(err){
						callback && callback(err);
					}
					else{
						settings.wlan0.networks[ssid] = wifiNetwork;
						settings.wlan0.encryted  = wifiNetwork.encryption_any;
						config.save();
						writeSettings();
						callback && callback(null);
					}
				});
			});
		},
		connectMobile : function(){
			configObj.mobileNetwork.active = true;
			global.wvdial = spawn("wvdial");
			global.checkSignal();
			config.save();
		},
		disconnectMobile : function(){
			configObj.mobileNetwork.active = false;
			if(global.wvdial){
				console.log("disconnect mobile")
				global.wvdial.kill();
				global.signalCheckProcess.kill();
			}
			config.save();
		},
		writeMobileConf : function(){
			config.save();

			var defConfPath = process.cwd() + "/system/wvdial_default.conf";
			var confContents = fs.readFileSync(defConfPath).toString();

			confContents =  confContents.replace("{apn}", mobileSettings.apn);
			confContents =  confContents.replace("{user}", mobileSettings.user);
			confContents =  confContents.replace("{password}", mobileSettings.password);

			if(platform == 'linux'){
				fs.writeFileSync("/etc/wvdial.conf", confContents);
				if(mobileSettings.active){
					this.disconnectMobile();
					setTimeout(function(){
						this.connectMobile();
					},2000)
				}
			}
		}, 
		enableInterface : function(iface){
			settings[iface].active = true;
			config.save();
			writeSettings();
			exec("ifup " + iface);
		},
		disableInterface : function(iface){
			exec("ifdown " + iface);
			settings[iface].active = false;
			config.save();
			writeSettings();
		}
	}
})