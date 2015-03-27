var color = require("irc-colors");
var core;

var prefix = {
  commands: ["prefix"],

  prefix: function(from, to, message) {
   core.config.prefix = message;
   if (core.config.prefix === message) {
     core.say(from, to, '[' + color.green("config") + "] Command prefix changed to: '" + core.config.prefix + "'");
     console.log("[config] Prefix changed to: '" + core.config.prefix + "'");
   } 
 }
};

module.exports = {
  load: function(_core) {
    core = _core;
  },
  
  unload: function() {
    delete prefix;
    delete color;
    delete core;
  },
  
  commands: prefix.commands,
  admin: true,
  run: function(command, from, to, message) {
    prefix[command](from, to, message);
  },
};
