var color = require("irc-colors");
var request = require("request");
var core;

var wa = {
  commands: ["wa", "wolfram"],

  wa: function(from, to, message) {
    wa.wolfram(from, to, message);
  },

  wolfram: function(from, to, message) {
    core.say (from, from, "Sorry, but the wolfram module is currently disabled as the api is uses is changed.");
  }
};

module.exports = {
  load: function(_core) {
    core = _core;
  },

  unload: function() {
    delete wa;
    delete core;
    delete color;
    delete request;
  },

  commands: wa.commands,
  run: function(command, from, to, message) {
    wa[command](from, to, message);
  },
};
