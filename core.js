var fs = require('fs');
var colors = require("colors");
var color = require("irc-colors");
var request = require("request");

var core = {
  client: false,
  loaded: {},
  databases: {},
  listeners: {},
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

  load: function(module, callback) {
    // generate the module id and path from the module name and type
    var module_id = module.type + '/' + module.name;
    var path = "./modules/" + module_id + ".js";

    fs.readFile(path, function(err, data) {
      if (err) {
        console.error("[ERROR][module]: ".red + module.name + " does not exist.");
        console.error(path)
        console.error(err);
        if (callback) {
          callback(true);
        }
      }

      // require the module (woo node module goodness)
      core.loaded[module_id] = require(path);

      // make sure it has a load function
      if (typeof core.loaded[module_id].load == "function") {
        // and run the load funciton
        core.loaded[module_id].load(core);
        
        // if it wants a db read it in
        if (core.loaded[module_id].db) {
          core.read_db(module.name);
        }

        // does it have a listener?
        if (typeof core.loaded[module_id].listener == "function") {
          core.client.addListener("message", core.loaded[module_id].listener);
        }

        // does it have any commands?
        if (core.loaded[module_id].commands) {
          var reciever = core.message.bind(this, module_id);
          core.listeners[module_id] = reciever;
          core.client.addListener("message", reciever);
        }
        
        console.log("[module]: ".green + module.type + '.' + module.name + " loaded.");
        if (callback) {
          callback(false);
        }
      } else {
        if (callback) {
          callback(true);
        }
      }
    });
  },

  unload: function(module, callback) {
    var module_id = module.type + '/' + module.name;
    var path = "./modules/" + module_id + ".js";

    // make sure it's actually loaded
    if (typeof core.loaded[module_id] != "undefined") {

      // it should have an unload function
      if (typeof core.loaded[module_id].unload == "function") {
        // write out the module's db if it had one
        if (core.loaded[module_id].db) {
          core.write_db(module.name);
        }

        // does it have a listener?
        if (typeof core.loaded[module_id].listener == "function") {
          core.client.removeListener("message", core.loaded[module_id].listener);
        }

        // does it have any commands?
        if (core.loaded[module_id].commands) {
          core.client.removeListener("message", core.listeners[module_id]);
        }
        
        core.loaded[module_id].unload();
      } else {
        console.error("[ERROR][module]: ".red + module.name + " could not be unloaded.");
        if (callback) {
          callback(true);
        }
      }

      delete core.databases[core.loaded[module_id].name];
      delete core.loaded[module_id];
      delete require.cache[require.resolve("./modules/" + module.type + '/' + module.name + ".js")];
      console.log("[module]: ".green + module.type + '.' + module.name + " unloaded.");
      if (callback) {
        callback(false);
      }
    } else {
      console.error("[ERROR][module]: ".red + module.name + " was not loaded.");
      if (callback) {
        callback(true);
      }
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
        console.error("[ERROR][db]: ".red + db + " database could not be read.");
        console.error(path);
        console.error(err);
        console.error("[ERROR][db]: ".red + "the database should be created automatically if it doesn't exist");
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

  message: function(module_id, from, to, message, details) {
    var userhost = details.user + '@' + details.host;
    // if the command is prefixed with our command prefix
    if (message.charAt(0) == core.config.prefix) {
      message = message.substr(1);
      message = message.split(' ');

      var command = message.shift();

      // If the module is loaded and the command is valid
      if (typeof core.loaded[module_id] != "undefined" && core.loaded[module_id].commands.indexOf(command) > -1) {

        // if the ignore module is loaded
        if (core.loaded["main/ignore"]) {
          var ignore = false;
          if (core.databases.ignore[from.toLowerCase()]) {
            core.databases.ignore[from.toLowerCase()].forEach(function(entry, index, object) {
              if (entry == module_id.split('/')[1]) {
                console.log("[ignore]:".yellow + " ignored command '" + command + ' ' + message.join(' ') + "' from '" + from + "'");
                ignore = true;
              }
            });
          }
          if (ignore) {
            return;
          }
        }

        // if it's an admin-only module and the user is a non-admin
        if (core.loaded[module_id].admin && userhost != core.config.owner) {
          return;
        }

        // run the command
        message = message.join(' ');
        core.loaded[module_id].run(command, from, to, message);
      }
    }
  }
};

module.exports = {
  init: core.init
}
