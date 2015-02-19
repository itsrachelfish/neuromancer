var flip = {
  commands: ["flip"],
  client: false,
  core: false,

  //TODO: eventually make this and message a core function
  reply: function(type, from, to, message) {
    //determine if it's a channel message or a privmessage
    if (to.charAt(0) == '#') {
      flip.client[type](to, message);
      console.log('[' + to + ']' + core.config.server.name + ' ' + message);
    } else {
      flip.client[type](from, message);
      console.log('[' + from + ']' + core.config.server.name + ' ' + message);
    }
  },

  message: function(from, to, message, details) {
    if (message.charAt(0) == flip.core.config.prefix) {
      message = message.substr(1);
      message = message.split(' ');

      var command = message.shift();

      // If this command is valid
      if (flip.commands.indexOf(command) > -1) {
        message = message.join(' ');
        flip[command](from, to, message);
      }
    }
  },

  flip: function(from, to, message) {
    rand = Math.random();
    if (rand > 0.5) {
      flip.reply("say", from, to, "Heads");
    } else if (rand < 0.5) {
      flip.reply("say", from, to, "Tails");
    } else if (rand == 0.5) {
      flip.reply("say", from, to, "Niggers");
    }
  },

  bind: function() {
    flip.client.addListener("message", flip.message);
  },
  
  unbind: function() {
    flip.client.removeListener("message", flip.message);
  }
  
};

module.exports = {
  load: function(client, core) {
    flip.client = client;
    flip.core = core;
    flip.bind();
  },
  
  unload: function() {
    flip.unbind();
    delete flip;
  }
};
