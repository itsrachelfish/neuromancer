var fs = require('fs');
var colors = require("colors");

var core = {
  client: false,
  loaded: {},
  modules: [],
  databases: {},
  commands: {},
  config: require("./etc/core.js"),
  server: require("./etc/server.js"),

  init: function(client) {
    if (!core.client) {
      core.client = client;
    }

    // get core modules
    var core_modules = require("./etc/modules_core.js");
    // get modules to load at init
    var default_modules = require("./etc/modules_default.js");

    // now load the modules
    // TODO: make these 1-liners with foreach
    for (var i = 0; i < core_modules.length; i++) {
      core.modules.push({
        type: 'core',
        name: core_modules[i]
      });
    }

    for (var i = 0; i < default_modules.length; i++) {
      core.modules.push({
        type: 'default',
        name: default_modules[i]
      });
    }

    for (var i = 0; i < core.modules.length; i++) {
      core.load(core.modules[i]);
    }
  },

  load: function(module) {
    // generate the module id and path from the module name and type
    var module_id = module.type + '/' + module.name;
    var path = "./modules/" + module_id + ".js";

    // attempt to open the module file
    fs.readFile(path, function(err, data) {
      if (err) {
        console.error("[ERROR][module]: ".red + module.name + " does not exist.");
        console.error(path)
        console.error(err);
        return 1;
      }

      // require the module (woo node module goodness)
      core.loaded[module_id] = require(path);
      // make sure it has a load function
      if (typeof core.loaded[module_id].load == "function") {
        // and run the load funciton
        core.loaded[module_id].load(core);
        core.commands[module_id] = core.loaded[module_id].commands;
        console.log("[module]: ".green + module.type + '.' + module.name + " loaded.");
        return 0;
      }
    });
    return 0;
  },

  unload: function(module) {
    var module_id = module.type + '/' + module.name;
    var path = "./modules/" + module_id + ".js";

    // make sure it's actually loaded
    if (typeof core.loaded[module_id] != "undefined") {
      // and has an unload function
      if (typeof core.loaded[module_id].unload == "function") {
        core.loaded[module_id].unload(core.client, core);
      } else {
        console.error("[ERROR][module]: ".red + module.name + " could not be unloaded.");
        return 1;
      }

      delete core.databases[core.loaded[module_id].name];
      delete core.commands[core.loaded[module_id]];
      delete core.loaded[module_id];
      delete require.cache[require.resolve("./modules/" + module.type + '/' + module.name + ".js")];
      console.log("[module]: ".green + module.type + '.' + module.name + " unloaded.");
      return 0;
    }
    return 0;
  },

  reload: function(module) {
    core.unload(module);
    core.load(module);
  },

  read_db: function(db) {
    var path = "./db/" + db + ".db";
    fs.readFile(path, function(err, data) {
      if (err) {
        console.error("[ERROR][db]: ".red + db + " database does not exist.");
        console.error(path);
        console.error(err);
        return;
      }
      core.databases[db] = JSON.parse(data, "utf8");
      console.log("[db]: ".blue + db + " database loaded.");
    });
  },

  write_db: function(db) {
    var path = "./db/" + db + ".db";
    fs.writeFile(path, JSON.stringify(core.databases[db]), "utf8", function(err) {
      if (err) {
        console.error("[ERROR][db]: ".red + db + " database could not be written.");
        console.error(path);
        console.error(err);
        return;
      }
      console.log("[db]: ".blue + db + " database saved.");
    });
  },

  send: function(type, from, to, message) {
    //determine if it's a channel message or a privmessage
    if (to.charAt(0) == '#') {
      core.client[type](to, message);
    } else {
      core.client[type](from, message);
    }
  }

};

module.exports = {
  init: core.init
}
