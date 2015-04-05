var core;

var ignore = {
  commands: ["ignore", "unignore", "listignores"],
  core: false,

  ignore: function(from, to, message) {
    var args = message.split(' ');
    var person = args[0].toLowerCase();
    var module = args[1].toLowerCase();

    if (!core.databases.ignore[person]) {
      core.databases.ignore[person] = [];
    }

    if (module == "all") {
      for (key in core.loaded) {
        module = key.split('/')[1];
        core.databases.ignore[person].push(module);
        console.log("[ignore]:".yellow + " module " + module + " is now ignoring " + person + '.');
      }
    } else {
      core.databases.ignore[person].push(module);
      core.write_db("ignore");
      console.log("[ignore]:".yellow + " module " + module + " is now ignoring " + person + '.');
    }
    core.write_db("ignore");
  },

  unignore: function(from, to, message) {
    var args = message.split(' ');
    var person = args[0].toLowerCase();
    var module = args[1].toLowerCase();

    if (module == "all") {
      delete core.databases.ignore[person];
      console.log("[ignore]:".yellow + " no longer ignoring any commands from " + person + '.');
    } else {
      core.databases.ignore[person].forEach(function(entry, index, object) {
        if (entry == module) {
          object.splice(index, 1);
          console.log("[ignore]:".yellow + " module " + module + " is no longer ignoring " + person + '.');
        }
      });
    }
    core.write_db("ignore");
  },
  
  listignores: function(from, to, message) {
    if (message) {
      core.say(from, to, JSON.stringify(core.databases.ignore[message]));
    } else {
      core.say(from, to, JSON.stringify(core.databases.ignore));
    }
  },
};

module.exports = {
  load: function(_core) {
    core = _core;
  },

  unload: function() {
    delete ignore;
    delete core;
  },

  commands: ignore.commands,

  // this module uses a db
  db: true,
  // this is an admin-only module
  admin: true,
  run: function(command, from, to, message) {
    ignore[command](from, to, message);
  }
};
