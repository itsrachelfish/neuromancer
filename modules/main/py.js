var color = require("irc-colors");
var request = require("request");

var py = {
  commands: ["py", "python"],
  core: false,

  py: function(from, to, message) {
    py.python(from, to, message);
  },

  python: function(from, to, message) {
    // make a call to an external server for this one
    request("http://tumbolia.appspot.com/py/" + message, function(e, r, body) {
      if (body.length < 300) {
        var to_say = color.blue(body);
      } else {
        var to_say = '[' + color.red("error") + "] Bad request";
      }
      py.core.send("say", from, to, to_say);
    });
  }
};

module.exports = {
  load: function(core) {
    py.core = core;
  },

  unload: function() {
    delete py;
  },

  commands: py.commands,
  run: function(command, from, to, message) {
    py[command](from, to, message);
  },
};
