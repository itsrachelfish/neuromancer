var color = require("irc-colors");
var core;

var flip = {
  commands: ["flip"],

  flip: function(from, to, message) {
    rand = Math.random();
    if (rand > 0.5) {
      core.say(from, to, color.blue("Heads"));
    } else if (rand < 0.5) {
      core.say(from, to, color.red("Tails"));
    } else if (rand == 0.5) {
      core.say(from, to, color.purple("Edge"));
    }
  }
};

module.exports = {
  load: function(_core) {
    core = _core;
  },

  unload: function() {
    delete flip;
    delete core;
    delete color;
  },

  commands: flip.commands,
  run: function(command, from, to, message) {
    flip[command](from, to, message);
  }
};
