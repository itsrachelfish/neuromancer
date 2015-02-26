var help = {
  // list because commands is a command
  list: ["help", "commands"],
  core: false,

  help: function(from, to, message) {
    help.core.send("say", from, from, "Commands: ");

    Object.keys(help.core.loaded).forEach((function(entry, index, object) {
      help.core.send("say", from, from, entry + ": " + help.core.loaded[entry].commands);
    }));
  },

  commands: function(from, to, message) {
    help.help(from, to, message)
  }
};

module.exports = {
  load: function(core) {
    help.core = core;
  },

  unload: function() {
    delete help;
  },

  commands: help.list,
  run: function(command, from, to, message) {
    help[command](from, to, message);
  }
};
