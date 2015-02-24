var color = require("irc-colors");

var help = {
  // list because commands is a command
  list: ["help", "commands"],
  client: false,
  core: false,

  message: function(from, to, message, details) {
    if (message.charAt(0) == help.core.config.prefix) {
      message = message.substr(1);
      message = message.split(' ');
      
      

      var command = message.shift();

      // If this command is valid
      if (help.list.indexOf(command) > -1) {
        var ignore = false
        if (help.core.databases.ignore[from.toLowerCase()]) {
          help.core.databases.ignore[from.toLowerCase()].forEach(function(entry, index, object) {
            if (entry == "help") {
              console.log("[ignore]:".yellow + " ignored command '" + message.join(' ') + "' from '" + from + "'");
              ignore = true;
            }
          });
        }
        if (ignore) {
          return;
        }
        message = message.join(' ');
        help[command](from, to, message);
      }
    }
  },

  help: function(from, to, message) {
    help.core.send("say", from, from, "Commands: ");
    
    // this is a horrible and not too great way of doing it but whatever
    var commands = JSON.stringify(help.core.commands).split("],");
    commands.forEach(function(entry) {
      help.core.send("say", from, from, entry);
    });

  },

  commands: function(from, to, message) {
    help.help(from, to, message)
  },

  bind: function() {
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

  commands: help.list
};
