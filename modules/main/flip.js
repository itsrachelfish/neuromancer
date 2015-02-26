var color = require("irc-colors");

var flip = {
  commands: ["flip"],
  core: false,

  flip: function(from, to, message) {
    rand = Math.random();
    if (rand > 0.5) {
      flip.core.send("say", from, to, color.blue("Heads"));
    } else if (rand < 0.5) {
      flip.core.send("say", from, to, color.red("Tails"));
    } else if (rand == 0.5) {
      flip.core.send("say", from, to, color.purple("Edge"));
    }
  }
};

module.exports = {
  load: function(core) {
    flip.core = core;
  },

  unload: function() {
    delete flip;
  },

  commands: flip.commands,
  run: function(command, from, to, message) {
    flip[command](from, to, message);
  }
};
