var fs = require('fs');
var colors = require("colors");

var core = {
  client: false,
  loaded: {},
  databases: {},
  commands: {},
  config: require("./etc/core.js"),
  server: require("./etc/server.js"),

  init: function(client) {
    if (!core.client) {
      core.client = client;
    }

    // get core modules
    var modules = require("./etc/module.js");

    // now load the modules
    modules.core.forEach(function(module) {
      core.load({
        type: "core",
        name: module
      });
    });

    modules.main.forEach(function(module) {
      core.load({
        type: "main",
        name: module
      });
    });
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
      if (core.loaded[module_id].db) {
        core.load_db(module.name);
      }

      if (core.loaded[module_id].listener) {
        console.log("adding listener for listener");
        core.client.addListener("message", core.loaded[module_id].listener);
        
      }

      if (core.loaded[module_id].commands) {
        console.log("added listener for regular");
        core.client.addListener("message", function(from, to, message, details) {
          core.message(from, to, message, details, module_id);
        });
      }//TODO: finish core.message

      // make sure it has a load function
      if (typeof core.loaded[module_id].load == "function") {
        // and run the load funciton
        core.loaded[module_id].load(core);
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
        core.loaded[module_id].unload(core);
      } else {
        console.error("[ERROR][module]: ".red + module.name + " could not be unloaded.");
        return 1;
      }

      if (core.loaded[module_id].db) {
        core.write_db(module.name);
      }

      if (core.loaded[module_id].listener) {
        console.log("removing listener for listener");
        core.client.removeListener("message", core.loaded[module_id].listener);
      }

      if (core.loaded[module_id].message) {
        console.log("removing listener for regular");
        core.client.removeListener("message", function(from, to, message, details) {
          core.message(from, to, message, details, module_id);
        });
      }


      delete core.databases[core.loaded[module_id].name];
      delete core.loaded[module_id];
      delete require.cache[require.resolve("./modules/" + module.type + '/' + module.name + ".js")];
      console.log("[module]: ".green + module.type + '.' + module.name + " unloaded.");
      return 0;
    } else {
      return 1;
    }
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
  },

  message: function(from, to, message, details, module_id) {
      if (message.charAt(0) == core.config.prefix) {
        message = message.substr(1);
        message = message.split(' ');

        var command = message.shift();

        // If this command is valid
        if (core.loaded[module_id].commands.indexOf(command) > -1) {
          /*var ignore = false;
          if (core.databases.ignore[from.toLowerCase()]) {
            core.databases.ignore[from.toLowerCase()].forEach(function(entry, index, object) {
              if (entry == module_id.split('/')[1]) {
                console.log("[ignore]:".yellow + " ignored command '" + command + ' '  + message.join(' ') + "' from '" + from + "'");
                ignore = true;
              }
            });
          }
          if (ignore) {
            return;
          }*/
          message = message.join(' ');
          core.loaded[module_id][command](from, to, message);
        }
      }
    },

};

module.exports = {
  init: core.init
}
