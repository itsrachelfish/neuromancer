var color = require("irc-colors");

var py = {
  commands: ["py", "python"],
  client: false,
  core: false,

  // boilerplate woo
  message: function(from, to, message, details) {
    if (message.charAt(0) == py.core.config.prefix) {
      message = message.substr(1);
      message = message.split(' ');

      var command = message.shift();

      // If this command is valid
      if (py.commands.indexOf(command) > -1) {
        message = message.join(' ');
        py[command](from, to, message);
      }
    }
  },
  
  py: function(from, to, message) {
    py.python(from, to, message);
  },

  python: function(from, to, message) {
    // make a call to an external server for this one
    request("http://tumbolia.appspot.com/py/" + text, function(e, r, body) {
      var to_say = (body.length < 300) ? (color.blue(body)) : ('[' + color.red("error") + "] Bad request");
      py.core.send("say", from, to, to_say);
    });
  },

  bind: function() {
    py.client.addListener("message", py.message);
  },

  unbind: function() {
    py.client.removeListener("message", py.message);
  }
};

module.exports = {
  load: function(core) {
    py.core = core;
    py.client = py.core.client;
    py.bind();
  },

  unload: function() {
    py.unbind();
    delete py;
  },
  
  commands: py.commands
};
