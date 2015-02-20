var color = require("irc-colors");

var prefix = {
  commands: ["prefix"],
  client: false,
  core: false,

  message: function(from, to, message, details) {
    var userhost = details.user + '@' + details.host;
    
    // If this user appears in the admin list
    if (userhost == prefix.core.config.admin) {
      if (message.charAt(0) == prefix.core.config.prefix) {
        message = message.substr(1);
        message = message.split(' ');

        var command = message.shift();

        // If this command is valid
        if (prefix.commands.indexOf(command) > -1) {
          message = message.join(' ');
          prefix[command](from, to, message);
        }
      }
    }
  },

  prefix: function(from, to, message) {
   prefix.core.config.prefix = message;
   if (prefix.core.config.prefix === message) {
     prefix.core.send("say", from, to, '[' + color.green("config") + "] Command prefix changed to: '" + prefix.core.config.prefix + "'");
     console.log("[config] Prefix changed to: '" + prefix.core.config.prefix + "'");
   } 
  },
  
  bind: function() {
    prefix.client.addListener("message", prefix.message);
  },
  
  unbind: function() {
    prefix.client.removeListener("message", prefix.message);
  }
};

module.exports = {
  load: function(core) {
    prefix.core = core;
    prefix.client = prefix.core.client;
    prefix.bind();
  },
  
  unload: function() {
    prefix.unbind();
    delete prefix;
  },
  
  commands: prefix.commands
};
