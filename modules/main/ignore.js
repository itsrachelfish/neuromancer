var ignore = {
  commands: ["ignore", "unignore"],
  core: false,

  ignore: function(from, to, message) {
    var args = message.split(' ');
    var module = args[0].toLowerCase();
    var person = args[1].toLowerCase();

    if (!ignore.core.databases.ignore[person]) {
      ignore.core.databases.ignore[person] = [];
    }

    if (module == "all") {
      for (key in ignore.core.loaded) {
        module = key.split('/')[1];
        ignore.core.databases.ignore[person].push(module);
        console.log("[ignore]:".yellow + " module " + module + " is now ignoring " + person + '.');
      }
    } else {
      ignore.core.databases.ignore[person].push(module);
      ignore.core.write_db("ignore");
      console.log("[ignore]:".yellow + " module " + module + " is now ignoring " + person + '.');
    }
    ignore.core.write_db("ignore");
  },

  unignore: function(from, to, message) {
    var args = message.split(' ');
    var person = args[0].toLowerCase();
    var module = args[1];

    if (module == "all") {
      delete ignore.core.databases.ignore[person];
      console.log("[ignore]:".yellow + " no longer ignoring any commands from " + person + '.');
    } else {
      ignore.core.databases.ignore[person].forEach(function(entry, index, object) {
        if (entry == module) {
          object.splice(index, 1);
          console.log("[ignore]:".yellow + " module " + module + " is no longer ignoring " + person + '.');
        }
      });
    }
    ignore.core.write_db("ignore");
  }
};

module.exports = {
  load: function(core) {
    ignore.core = core;
  },

  unload: function() {
    delete ignore;
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
