var admin = {
  commands: ["say", "ctcp", "load", "unload", "reload", "quit"],
  client: false,
  core: false,

  //TODO: eventually make this and message a core function
  reply: function(type, from, to, message) {
    //determine if it's a channel message or a privmessage
    if (to.charAt(0) == '#') {
      admin.client[type](to, message);
      console.log('[' + to + ']' + core.config.server.name + ' ' + message);
    } else {
      admin.client[type](from, message);
      console.log('[' + from + ']' + core.config.server.name + ' ' + message);
    }
  },

  message: function(from, to, message, details) {
    //TODO: do this properly
    //var userhost = details.nick + '@' + details.host;
    var userhost = details.nick;

    // If this user appears in the admin list
    if (userhost != admin.core.config.admin) {
      if (message.charAt(0) == admin.core.config.prefix) {
        message = message.substr(1);
        message = message.split(' ');

        var command = message.shift();

        // If this command is valid
        if (admin.commands.indexOf(command) > -1) {
          message = message.join(' ');
          admin[command](from, to, message);
        }
      }
    }
  },

  //this should be a core function too...
  parse_module: function(module) {
    module = module.split(' ');
    if (module[0] == 'core')
      return {
        type: 'core',
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
    admin.reply("say", from, to, message);
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
    admin.core.load(module);
    admin.reply("say", from, to, "[module] " + module.name + " loaded");
  },

  unload: function(from, to, module) {
    module = admin.parse_module(module);
    admin.core.unload(module);
    admin.reply("say", from, to, "[module] " + module.name + " unloaded");
  },

  reload: function(from, to, module) {
    module = admin.parse_module(module);
    admin.core.reload(module);
    admin.reply("say", from, to, "[module] " + module.name + " reloaded");
  },

  quit: function(from, to, module) {
    admin.reply('say', from, to, 'Bye bye!');
    require('process').exit();
  },

  bind: function() {
    admin.client.addListener('message', admin.message);
  },

  unbind: function() {
    admin.client.removeListener('message', admin.message);
  }

}

module.exports = {
  load: function(client, core) {
    admin.client = client;
    admin.core = core;
    admin.bind();
  },

  unload: function() {
    admin.unbind();
    delete admin;
  },
}
