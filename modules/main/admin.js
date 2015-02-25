var color = require("irc-colors");

var admin = {
  commands: ["say", "ctcp", "load", "unload", "reload"],
  db: false,
  client: false,
  core: false,

  message: function(from, to, message, details) {
    var userhost = details.user + '@' + details.host;

    // If this user is the owner of the bot
    if (userhost == admin.core.config.owner) {
      if (message.charAt(0) == admin.core.config.prefix) {
        message = message.substr(1);
        message = message.split(' ');
        
        var command = message.shift();

        // If this command is valid
        if (admin.commands.indexOf(command) > -1) {
          var ignore = false
          if (admin.core.databases.ignore[from.toLowerCase()]) {
            admin.core.databases.ignore[from.toLowerCase()].forEach(function(entry, index, object) {
              if (entry == "admin") {
                console.log("[ignore]:".yellow + " ignored command '" + command + ' ' + message.join(' ') + "' from '" + from + "'");
                ignore = true;
              }
            });
          }
          if (ignore) {
            return;
          }
          message = message.join(' ');
          admin[command](from, to, message);
        }
      }
    }
  },

  // TODO: improve this
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
  },

  bind: function() {
    admin.client.addListener('message', admin.message);
  },

  unbind: function() {
    admin.client.removeListener('message', admin.message);
  }

}

module.exports = {
  load: function(core) {
    admin.core = core;
    admin.client = admin.core.client;
    admin.bind();
  },

  unload: function() {
    admin.unbind();
    delete admin;
  },

  commands: admin.commands
};
