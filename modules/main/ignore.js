var ignore = {
  commands: ["ignore", "unignore"],
  client: false,
  core: false,

  message: function(from, to, message, details) {
    var userhost = details.user + '@' + details.host;

    // If this user is the owner of the bot
    if (userhost == ignore.core.config.owner) {
      if (message.charAt(0) == ignore.core.config.prefix) {
        message = message.substr(1);
        message = message.split(' ');

        var command = message.shift();

        // If this command is valid
        if (ignore.commands.indexOf(command) > -1) {
          message = message.join(' ');
          ignore[command](from, to, message);
        }
      }
    }
  },

  ignore: function(from, to, message) {
    var args = message.split(' ');
    var person = args[0].toLowerCase();
    var module = args[1]

    if (!ignore.core.databases.ignore[person]) {
      ignore.core.databases.ignore[person] = [];
    }

    ignore.core.databases.ignore[person].push(module);
    ignore.core.write_db("ignore");
    console.log("[ignore]".yellow + " module " + module + " is now ignoring " + person + '.');

  },

  unignore: function(from, to, message) {
    var args = message.split(' ');
    var person = args[0].toLowerCase();
    var module = args[1];

    ignore.core.databases.ignore[person].forEach(function(entry, index, object) {
      if (entry == module) {
        object.splice(index, 1);
        console.log("[ignore]".yellow + " module " + module + " is no longer ignoring " + person + '.');
      }
    });
    ignore.core.write_db("ignore");
  },

  bind: function() {
    ignore.client.addListener("message", ignore.message);
  },

  unbind: function() {
    ignore.client.removeListener("message", ignore.message);
  }
};

module.exports = {
  load: function(core) {
    ignore.core = core;
    ignore.client = ignore.core.client;
    ignore.core.read_db("ignore");
    ignore.bind();
  },

  unload: function() {
    ignore.unbind();
    ignore.core.write_db("ignore");
    delete ignore;
  },

  commands: ignore.commands
};
