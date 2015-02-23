var cow = require("cowsay");

var cowsay = {
  commands: ["cowsay"],
  client: false,
  core: false,
  
  message: function(from, to, message, details) {
    if (message.charAt(0) == cowsay.core.config.prefix) {
      message = message.substr(1);
      message = message.split(' ');

      var command = message.shift();

      // If this command is valid
      if (cowsay.commands.indexOf(command) > -1) {
        message = message.join(' ');
        cowsay[command](from, to, message);
      }
    }
  },
  
  cowsay: function(from, to, message) {
    cowsay.core.send("say", from, to, cow.say({
      text: message,
      e: "xx",
      f: "bong"
    }));
  },
  
  bind: function() {
    cowsay.client.addListener("message", cowsay.message);
  },
  
  unbind: function() {
    cowsay.client.removeListener("message", cowsay.message);
  }
};

module.exports = {
  load: function(core) {
    cowsay.core = core;
    cowsay.client = cowsay.core.client;
    cowsay.bind();
  },
  
  unload: function() {
    cowsay.unbind();
    delete cowsay;
  },
  
  commands: cowsay.commands
};