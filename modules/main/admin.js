var color = require("irc-colors");

var admin = {
  commands: ["say", "wflogin", "join", "part", "ctcp", "load", "unload", "reload"],
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

  wflogin: function(from, to, message) {
    admin.core.client.say("nickserv", "login");
  },

  ctcp: function(from, to, message) {
    message = message.split(' ');
    var target = message.shift();
    var type = message.shift();
    message = message.join(' ');

    admin.core.client.ctcp(target, type, message);
  },

  join: function(from, to, message) {
    admin.core.client.join(message, function() {
      console.log("[client]: ".yellow + "joined channel: " + message);
    });
  },

  part: function(from, to, message) {
    var channel = false;
    // if the admin simply did >part
    if (!message) {
      // and if the >part was issued in a channel
      if (to.charAt(0) == '#') {
        // then set the channel to part from to be the current channel
        channel = to;
      } else {
        // or yell at the admin for not giving a channel
        admin.core.send("say", from, to, '[' + color.red("error") + ']: no channel specified');
      }
    } else {
      // if the admin gave a channel to part from
      channel = message;
    }
    // now do the actual part
    admin.core.client.part(channel, "bye", function() {
      console.log("[client]: ".yellow + "left channel: " + channel);
    });
  },

  load: function(from, to, module) {
    module = admin.parse_module(module);
    admin.core.load(module, function(error) {
      if (error) {
        admin.core.send("say", from, to, '[' + color.red("error") + "]: '" + module.type + '.' + module.name + "' could not be loaded");
      } else {
        admin.core.send("say", from, to, '[' + color.green("module") + "]: '" + module.type + '.' + module.name + "' loaded");
      }
    });
  },

  unload: function(from, to, module) {
    module = admin.parse_module(module);

    admin.core.unload(module, function(error) {
      if (error) {
        admin.core.send("say", from, to, '[' + color.red("error") + "]: '" + module.type + '.' + module.name + "' could not be unloaded");
      } else {
        admin.core.send("say", from, to, '[' + color.green("module") + "]: '" + module.type + '.' + module.name + "' unloaded");
      }
    });
  },

  reload: function(from, to, module) {
    module = admin.parse_module(module);
    admin.core.reload(module);
    admin.core.send("say", from, to, '[' + color.blue("module") + "]: '" + module.type + '.' + module.name + "' reloaded");
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
