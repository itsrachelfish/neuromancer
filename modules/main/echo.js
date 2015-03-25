var client, core, say;

var echo = {
  commands: ["echo"],

  echo: function(from, to, message) {
    say(from, to, message);
  }
};

module.exports = {
  load: function(_core) {
    core = _core;
    client = _core.client;
    say = _core.say;
  },

  unload: function() {
    delete echo;
  },
  
  commands: echo.commands,
  run: function(command, from, to, message) {
    echo[command](from, to, message);
  }
};
