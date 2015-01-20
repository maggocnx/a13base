// var Wireless = require("./wireless.js");
var ip = require("ip")

console.log(ip.address('eth0'))
console.log(ip.address('lo'))

// var command  =  'wpa_passphrase "Gronic" "6Ro/!(bBbBB" > wpa-temp.conf && wpa_supplicant -D wext -i wlan0 -c wpa-temp.conf && rm wpa-temp.conf'; 

// console.log("OOOOO")
// var child = child_process.spawn('wpa_supplicant', [ "-D",  "wext",  "-i",  "wlan0",  "-c",  "wpa-temp.conf"], function(err, stdout, stderr){
// 	console.log(err, stdout, stderr)

// });


// child.stdout.on("data", function(data){
// 	console.log(data.toString())
// })
