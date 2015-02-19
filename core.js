var fs = require('fs');

module.exports = (function() {
  var core = {
    client: false,
    loaded: {},
    modules: [],
    modules_loaded: [],
    config: require("./etc/core.js"),
    server: require("./etc/server.js"),

    init: function(client) {
      if (!core.client) {
        core.client = client;
      }

      // get core modules
      var core_modules = require("./etc/modules_core.js");
      // get modules to load at init
      var init_modules = require("./etc/modules.js");

      // now load the modules
      // TODO: make these 1-liners with foreach
      for (var i = 0; i < core_modules.length; i++) {
        core.modules.push({
          type: 'core',
          name: core_modules[i]
        });
      }

      for (var i = 0; i < init_modules.length; i++) {
        core.modules.push({
          type: 'modules',
          name: init_modules[i]
        });
      }

      for (var i = 0; i < core.modules.length; i++) {
        core.load(core.modules[i]);
      }
    },

    load: function(module) {
      var module_id = module.type + '/' + module.name;
      var path = "./modules/" + module_id + ".js";

      if (fs.existsSync(path)) {
        core.loaded[module_id] = require(path);

        if (typeof core.loaded[module_id].load == "function") {
          core.loaded[module_id].load(core.client, core);
          core.modules_loaded[module_id] = {
            type: module.type,
            name: module.name,
            commands: module.commands
          }

        } else {
          console.error(module.name + " could not be loaded");
        }
      } else {
        console.error(module.name + " does not exist");
        console.error(path);
      }
    },

    unload: function(module) {
      var module_id = module.type + '/' + module.name;
      var path = "./modules/" + module_id + ".js";

      if (typeof core.loaded[module_id] != "undefined") {
        if (typeof core.loaded[module_id].unload == "function") {
          core.loaded[module_id].unload(core.client, core);
        } else {
          console.error(module.name + " could not be loaded");
        }

        delete core.loaded[module_id];
        delete core.modules_loaded[module_id];
        delete require.cache[require.resolve("./modules/" + module.type + '/' + module.name + ".js")];
      }
    },

    reload: function(module) {
      core.unload(module);
      core.load(module);
    },

    check_db: function(subdb) {
      fs.exists("./db", function(exists) {
        if (!exists) {
          try {
            fs.mkdir("./db", "0700");
          } catch (e) {
            console.error("### DATABASE ERROR ###\n" + e);
          }
        }
      });
      fs.exists("./db/" + subdb + ".json", function(exists) {
        if (!exists) {
          try {
            fs.writeFile("./db/" + subdb + ".json", '[]');
          } catch (e) {
            console.error("### DATABASE ERROR ###\n" + e);
          }
        }
      });
    }

  };

  return {
    init: core.init,
    load: core.load,
    unload: core.unload,
    reload: core.reload,
    modules: core.modules_loaded,
    server: core.server
  };
})();

