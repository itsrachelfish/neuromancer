var color = require("irc-colors");

var admin = {
  commands: ["say", "ctcp", "load", "unload", "reload"],
  core: false,

  // TODO: improve this/move into core
  parse_module: function(module) {
    module = module.split('.');
    if (module[0] == 'core')
      return {
        type: 'core',
        name: module[1]
      };
    else if (module[0] == 'main')
      return {
        type: 'main',
        name: module[1]
      };
    else if (module[1] == 'module')
      return {
        type: 'modules',
        name: module[1]
      };
    else
      return {
        type: 'modules',
        name: module[0]
      };
  },
  
  say: function(from, to, message) {
    admin.core.send("say", from, to, message);
  },

  ctcp: function(from, to, message) {
    message = message.split(' ');
    var target = message.shift();
    var type = message.shift();
    message = message.join(' ');

    admin.client.ctcp(target, type, message);
  },

  load: function(from, to, module) {
    module = admin.parse_module(module);
    if (admin.core.load(module) == 0) {
      admin.core.send("say", from, to, '[' + color.green("module") + "] '" + module.type + '.' + module.name + "' loaded");
    } else {
      admin.core.send("say", from, to, '[' + color.red("error") + "] '" + module.type + '.' + module.name + "' could not be loaded");
    }
  },

  unload: function(from, to, module) {
    module = admin.parse_module(module);
    if (admin.core.unload(module) == 0) {
      admin.core.send("say", from, to, '[' + color.green("module") + "] '" + module.type + '.' + module.name + "' unloaded");
    } else {
      admin.core.send("say", from, to, '[' + color.red("error") + "] '" + module.type + '.' + module.name + "' could not be unloaded");
    }
  },

  reload: function(from, to, module) {
    module = admin.parse_module(module);
    admin.core.reload(module);
    admin.core.send("say", from, to, '[' + color.blue("module") + "] '" + module.type + '.' + module.name + "' reloaded");
  }
}

module.exports = {
  load: function(core) {
    admin.core = core;
  },

  unload: function() {
    delete admin;
  },

  commands: admin.commands,
  run: function(command, from, to, message) {
    admin[command](from, to, message);
  },
  // this is an admin-only module
  admin: true
};
