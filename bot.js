/*
neuromancer irc bot by Edwin Pers
epers@primesli.me
*/

var irc = require("irc");


// get server config
var server = require("./etc/server.js");

// connect to the irc server
var client = new irc.Client(server.server, server.name, server);

// bring in core
var core = require("./core.js");

// start it up
core.init(client);

// this is the best place to listen for uncaught errors
process.on("uncaughtException", function(err) {
  console.log("### GLOBAL ERROR ###");
  console.log(err);
});

console.log("Initalized");
