var clvrbot = require("cleverbot-node");
var core;
var bot = new clvrbot();

var cleverbot = {
  commands: ["clvr", "cleverbot"],

  cleverbot: function(from, to, message) {
    bot.write(message, function(data) {
      core.say(from, to, data.message);
    });
  },

  clvr: function(from, to, message) {
    cleverbot.cleverbot(from, to, message);
  },
};

module.exports = {
  load: function(_core) {
    core = _core;
  },

  unload: function() {
    delete cleverbot;
    delete clvrbot;
    delete core;
  },

  commands: cleverbot.commands,
  run: function(command, from, to, message) {
    cleverbot[command](from, to, message);
  },
};
