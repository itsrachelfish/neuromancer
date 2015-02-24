var clvrbot = require("cleverbot-node");

var cleverbot = {
  commands: ["clvr", "cleverbot"],
  client: false,
  core: false,
  bot: false,
  
  message: function(from, to, message, details) {
    if (message.charAt(0) == cleverbot.core.config.prefix) {
      message = message.substr(1);
      message = message.split(' ');

      var command = message.shift();

      // If this command is valid
      if (cleverbot.commands.indexOf(command) > -1) {
        message = message.join(' ');
        cleverbot[command](from, to, message);
      }
    }
  },
  
  cleverbot: function(from, to, message) {
    cleverbot.bot.write(message, function(data) {
      cleverbot.core.send("say", from, to, data.message);
    });
  },
  
  clvr: function(from, to, message) {
    cleverbot.cleverbot(from, to, message);
  },
  
  bind: function() {
    cleverbot.client.addListener("message", cleverbot.message);
  },
  
  unbind: function() {
    cleverbot.client.removeListener("message", cleverbot.message);
  }
};

module.exports = {
  load: function(core) {
    cleverbot.core = core;
    cleverbot.client = cleverbot.core.client;
    cleverbot.bot = new clvrbot();
    cleverbot.bind();
  },
  
  unload: function() {
    cleverbot.unbind();
    delete cleverbot;
  },
  
  commands: cleverbot.commands
};