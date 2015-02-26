var echo = {
  commands: ["echo"],
  core: false,

  echo: function(from, to, message) {
    echo.core.send("say", from, to, message);
  }
};

module.exports = {
  load: function(core) {
    echo.core = core;
  },

  unload: function() {
    delete echo;
  },
  
  commands: echo.commands,
  run: function(command, from, to, message) {
    echo[command](from, to, message);
  }
};
