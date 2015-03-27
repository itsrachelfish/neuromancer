var color = require("irc-colors");
var request = require("request");
var core;

var py = {
  commands: ["py", "python"],

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
      core.say(from, to, to_say);
    });
  }
};

module.exports = {
  load: function(_core) {
    core = _core;
  },

  unload: function() {
    delete py;
    delete color;
    delete request;
    delete core;
  },

  commands: py.commands,
  run: function(command, from, to, message) {
    py[command](from, to, message);
  },
};
