var clvrbot = require("cleverbot-node");

var cleverbot = {
  commands: ["clvr", "cleverbot"],
  core: false,

  // cleverbot instance
  bot: new clvrbot(),

  cleverbot: function(from, to, message) {
    cleverbot.bot.write(message, function(data) {
      cleverbot.core.send("say", from, to, data.message);
    });
  },

  clvr: function(from, to, message) {
    cleverbot.cleverbot(from, to, message);
  }
};

module.exports = {
  load: function(core) {
    cleverbot.core = core;
  },

  unload: function() {
    delete cleverbot;
  },

  commands: cleverbot.commands,
  run: function(command, from, to, message) {
    cleverbot[command](from, to, message);
  }
};
