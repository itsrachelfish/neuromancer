/*
neuromancer irc bot by Edwin Pers
epers@primesli.me
*/

var irc = require("irc");


// get server config
var server = require("./etc/server.js");

// connect to the irc server
var client = new irc.Client(server.server, server.name, server);

client.setMaxListeners(0);

// bring in core
var core = require("./core.js");

// start it up
core.init(client);

// this is the best place to listen for uncaught errors
process.on("uncaughtException", function(err) {
  console.log("[error][global]".red);
  console.log(err);
});

console.log("[core]".green + " initalized");
