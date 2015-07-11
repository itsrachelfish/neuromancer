var fs = require('fs');
var colors = require("colors");
var color = require("irc-colors");
var request = require("request");

var core = {
  client: false,

  loaded: {},
  databases: {},
  logs: {},
  listeners: {},
  config: require("./etc/core.js"),
  server: require("./etc/server.js"),

  // all of these are handled by core modules
  mread_db: false,
  mwrite_db: false,
  mread_log: false,
  mwrite_log: false,
  mrecieve: false,
  msend: false,
  msay: false,
  merr: false,

  // and these are wrappers to those functions so things can fail gracefully if the respective core module is unloaded or broken
  // yay middlemaning
  read_db: function(subdb, callback) {
    if(core.mread_db) {
      core.mread_db(subdb, callback);
    } else {
      core.err({
        type: "core",
        title: "db module is unloaded,",
        text: subdb,
        info: false,
      });
      if (callback) {
        callback(true);
      }
    }
  },

  write_db: function(subdb, callback) {
    if(core.mwrite_db) {
      core.mwrite_db(subdb, callback);
    } else {
      core.err({
        type: "core",
        title: "db module is unloaded,",
        text: subdb,
        info: false,
      });
      if (callback) {
        callback(true);
      }
    }
  },

  read_log: function(sublog, callback) {
    if (core.mread_log) {
      core.mread_log(sublog, callback);
    } else {
      core.err({
        type: "core",
        title: "logs module is unloaded,",
        text: sublog,
        info: false,
      });
      if (callback) {
        callback(true);
      }
    }
  },

  write_log: function(sublog, callback) {
    if (core.mwrite_log) {
      core.mwrite_log(sublog, callback);
    } else {
      core.err({
        type: "core",
        title: "logs module is unloaded,",
        text: sublog,
        info: false,
      });
      if (callback) {
        callback(true);
      }
    }
  },

  recieve: function(module_id, from, to, text, details) {
    if (core.mrecieve) {
      core.mrecieve(module_id, from, to, text, details);
    } else {
      core.err({
        type: "core",
        title: "messages module is unloaded.",
        text: message,
        info: details,
      });
    }
  },

  send: function(type, from, to, message) {
    if (core.msend) {
      core.msend(type, from, to, message);
    } else {
      core.err({
        type: "core",
        title: "messages module is unloaded.",
        text: message,
        info: false,
      });
    }
  },

  say: function(from, to, message) {
    if (core.msay) {
      core.msay(from, to, message);
    } else {
      core.err({
        type: "core",
        title: "messages module is unloaded.",
        text: message,
        info: false,
      });
    }
  },

  err: function(error) {
    if (core.merr) {
      core.merr(error);
    } else {
      console.error("error module is not loaded");
      console.error(JSON.stringify(error));
    }
  },

  // bootstrap function
  init: function(client) {
    if (!core.client) {
      core.client = client;
    }

    // get modules
    var modules = require("./etc/module.js");

    // now load the modules
    modules.core.forEach(function(module) {
      core.load({
        type: "core",
        name: module,
      });
    });

    // sleep for a few seconds to allow the core modules to fully load before loading secondary modules, this has caused problems in the past, woo async programming
    setTimeout(function() {
      modules.main.forEach(function(module) {
        core.load({
          type: "main",
          name: module,
        });
      });
    }, 2000);
  },

  load: function(module, callback) {
    // generate the module id and path from the module name and type
    var module_id = module.type + '/' + module.name;
    var path = "./modules/" + module_id + ".js";

    fs.readFile(path, function(err, data) {
      if (err) {
        core.err({
          type: "module",
          title: module.name + " could not be read.",
          text: "path: " + path,
          info: err,
        });
        if (callback) {
          callback(true);
        }
        return;
      }

      // require the module (woo node module goodness)
      core.loaded[module_id] = require(path);

      // make sure it has a load function
      if (typeof core.loaded[module_id].load == "function") {
        // if it wants a db read it in
        if (core.loaded[module_id].db) {
          core.read_db(module.name);
        }

        if (core.loaded[module_id].log) {
          core.read_log(module.name);
        }

        // does it have a listener?
        if (typeof core.loaded[module_id].listener == "function") {
          core.client.addListener("message", core.loaded[module_id].listener);
        }

        // does it have any commands?
        if (core.loaded[module_id].commands) {
          var reciever = core.recieve.bind(this, module_id);
          //var reciever = core.recieve.bind(this, module_id);
          core.listeners[module_id] = reciever;
          core.client.addListener("message", core.listeners[module_id]);
        }

        // and run the load funciton
        core.loaded[module_id].load(core);

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

        if (core.loaded[module_id].log) {
          core.write_log(module.name);
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
        core.err({
          type: "module",
          title: module.name + " could not be unloaded.",
          text: false,
          info: false,
        });
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
      core.err({
        type: "module",
        title: module.name + " was not loaded.",
        text: false,
        info: false,
      });
      if (callback) {
        callback(true);
      }
    }
  },

  reload: function(module) {
    core.unload(module);
    core.load(module);
  },
};

module.exports = {
  init: core.init,
  err: core.err,
}
