var echo = {
  commands: ["echo"],
  client: false,
  core: false,

  message: function(from, to, message, details) {
    if (message.charAt(0) == echo.core.config.prefix) {
      message = message.substr(1);
      message = message.split(' ');

      var command = message.shift();

      // If this command is valid
      if (echo.commands.indexOf(command) > -1) {
        var ignore = false
        if (echo.core.databases.ignore[from.toLowerCase()]) {
          echo.core.databases.ignore[from.toLowerCase()].forEach(function(entry, index, object) {
            if (entry == "echo") {
              console.log("[ignore]:".yellow + " ignored command '" + message.join(' ') + "' from '" + from + "'");
              ignore = true;
            }
          });
        }
        if (ignore) {
          return;
        }
        message = message.join(' ');
        echo[command](from, to, message);
      }
    }
  },

  echo: function(from, to, message) {
    echo.core.send("say", from, to, message);
  },

  bind: function() {
    echo.client.addListener("message", echo.message);
  },

  unbind: function() {
    echo.client.removeListener("message", echo.message);
  }
};

module.exports = {
  load: function(core) {
    echo.core = core;
    echo.client = echo.core.client;
    echo.bind();
  },

  unload: function() {
    echo.unbind();
    delete echo;
  },

  commands: echo.commands
};
