var py = {
  commands: ["py", "python"],
  client: false,
  core: false,

  //TODO: eventually make this and message a core function
  reply: function(type, from, to, message) {
    //determine if it's a channel message or a privmessage
    if (to.charAt(0) == '#') {
      py.client[type](to, message);
      console.log('[' + to + ']' + core.config.server.name + ' ' + message);
    } else {
      py.client[type](from, message);
      console.log('[' + from + ']' + core.config.server.name + ' ' + message);
    }
  },

  message: function(from, to, message, details) {
    if (message.charAt(0) == py.core.config.prefix) {
      message = message.substr(1);
      message = message.split(' ');

      var command = message.shift();

      // If this command is valid
      if (flip.commands.indexOf(command) > -1) {
        message = message.join(' ');
        py[command](from, to, message);
      }
    }
  },

  py: function(from, to, message) {
    request("http://tumbolia.appspot.com/py/" + text, function(e, r, body) {
      var to_say = (body.length < 300) ? ('\u000310' + body) : ('\u000304Bad Request')
      py.reply("say", from, to, to_say);
    });
  },
  
  bind: function() {
    py.client.addListener("message", py.message);
  },
  
  unbind: function() {
    py.client.removeListener("message", py.message);
  }
};

module.exports = {
  load: function(client, core) {
    py.client = client;
    py.core = core;
    py.bind();
  },
  
  unload: function() {
    py.unbind();
    delete py;
  }
};
