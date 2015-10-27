/*
neuromancer irc bot by Edwin Pers
epers@primesli.me
*/

var irc = require("irc");
var colors = require("colors");

// get server config
var server = require("./etc/server.js");

// connect to the irc server
var client = new irc.Client(server.server, server.name, server);

// we need this because of the potentially high number of listners that will need to be created
client.setMaxListeners(0);

// bring in core
var core = require("./core.js");

// start it up
core.init(client);

// this is the best place to listen for uncaught errors
process.on("uncaughtException", function (err) {
  core.err({
    type: "uncaughtException",
    title: "uncaughtException",
    text: err,
    info: false,
  });
});

client.on("pm", function (from, text, mes) {
  console.log("[pm]: ".yellow + from + ": " + text);
});

console.log("[core]:".green + " loading...");
