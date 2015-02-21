var color = require("irc-colors");

var help = {
  commands: ["help"],
  client: false,
  core: false,
  
  message: function(from, to, message, details) {
    if (message.charAt(0) == help
      message = message.split(' ');

      var command = message.shift();

      // If this command is valid
      if (help.commands.indexOf(command) > -1) {
        message = message.join(' ');
        help[command](from, to, message);
      }
    }
  },
  
  help: function(from, to, message) {
    help.core.send("say", from, from, "Commands: " + help.core.commands);
  },
  
  bind: function(){
    help.client.addListener("message", help.message);
  },
  
  unbind: function() {
    help.client.removeListener("message", help.message);
  }
};

module.exports = {
  load: function(core) {
    help.core = core;
    help.client = help.core.client;
    help.bind();
  },
  
  unload: function() {
    help.unbind();
    delete help;
  },
  
  commands: help.commands
};