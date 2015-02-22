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
        message = message.join(' ');
        help[command](from, to, message);
      }
    }
  },

  help: function(from, to, message) {
    help.core.send("say", from, from, "Commands: ");
    help.core.send("say", from, from, JSON.stringify(help.core.commands));
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
