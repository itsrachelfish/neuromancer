var color = require("irc-colors");

var flip = {
  commands: ["flip"],
  client: false,
  core: false,

  message: function(from, to, message, details) {
    if (message.charAt(0) == flip.core.config.prefix) {
      message = message.substr(1);
      message = message.split(' ');

      var command = message.shift();

      // If this command is valid
      if (flip.commands.indexOf(command) > -1) {
        var ignore = false
        if (flip.core.databases.ignore[from.toLowerCase()]) {
          flip.core.databases.ignore[from.toLowerCase()].forEach(function(entry, index, object) {
            if (entry == "flip") {
              console.log("[ignore]:".yellow + " ignored command '" + message.join(' ') + "' from '" + from + "'");
              ignore = true;
            }
          });
        }
        if (ignore) {
          return;
        }
        message = message.join(' ');
        flip[command](from, to, message);
      }
    }
  },

  flip: function(from, to, message) {
    rand = Math.random();
    if (rand > 0.5) {
      flip.core.send("say", from, to, color.blue("Heads"));
    } else if (rand < 0.5) {
      flip.core.send("say", from, to, color.red("Tails"));
    } else if (rand == 0.5) {
      flip.core.send("say", from, to, color.purple("Edge"));
    }
  },

  bind: function() {
    flip.client.addListener("message", flip.message);
  },

  unbind: function() {
    flip.client.removeListener("message", flip.message);
  }

};

module.exports = {
  load: function(core) {
    flip.core = core;
    flip.client = flip.core.client;
    flip.bind();
  },

  unload: function() {
    flip.unbind();
    delete flip;
  },

  commands: flip.commands
};
