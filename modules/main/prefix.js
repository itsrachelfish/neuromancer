var color = require("irc-colors");

var prefix = {
  commands: ["prefix"],
  core: false,

  prefix: function(from, to, message) {
   prefix.core.config.prefix = message;
   if (prefix.core.config.prefix === message) {
     prefix.core.send("say", from, to, '[' + color.green("config") + "] Command prefix changed to: '" + prefix.core.config.prefix + "'");
     console.log("[config] Prefix changed to: '" + prefix.core.config.prefix + "'");
   } 
 }
};

module.exports = {
  load: function(core) {
    prefix.core = core;
  },
  
  unload: function() {
    delete prefix;
  },
  
  commands: prefix.commands,
  admin: true,
  run: function(command, from, to, message) {
    prefix[command](from, to, message);
  },
};
