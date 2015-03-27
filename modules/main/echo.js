var core;

var echo = {
  commands: ["echo"],

  echo: function(from, to, message) {
    core.say(from, to, message);
  }
};

module.exports = {
  load: function(_core) {
    core = _core;
  },

  unload: function() {
    delete echo;
    delete core;
  },
  
  commands: echo.commands,
  run: function(command, from, to, message) {
    echo[command](from, to, message);
  }
};
