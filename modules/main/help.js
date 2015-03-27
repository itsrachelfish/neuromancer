var core;

var help = {
  // list because commands is a command
  list: ["help", "commands"],
  core: false,

  help: function(from, to, message) {
    var doc = require("../../doc/" + message + ".js");
    for (var key in doc) {
      core.say(from, from, key + ': ' + doc[key]);
    }
  },

  commands: function(from, to, message) {
    core.say(from, from, "<Module Name>: <Commands>");

    Object.keys(core.loaded).forEach(function(entry, index, object) {
      if (core.loaded[entry].commands) {
        var modName = entry.split('/');
        core.say(from, from, modName[1] + ": " + core.loaded[entry].commands.join(' '));
      }
    });

    core.say(from, from, "For detailed help on a module, do " + core.config.prefix + "help <module>");
  }
};

module.exports = {
  load: function(_core) {
    core = _core;
  },

  unload: function() {
    delete help;
    delete core;
  },

  commands: help.list,
  run: function(command, from, to, message) {
    help[command](from, to, message);
  }
};
