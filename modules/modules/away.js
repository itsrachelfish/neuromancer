var away = {
  commands: ["away"],
  client: false,
  core: false,
  aways: {},

  //TODO: eventually make this and message a core function
  reply: function(type, from, to, message) {
    //determine if it's a channel message or a privmessage
    if (to.charAt(0) == '#') {
      away.client[type](to, message);
      console.log('[' + to + ']' + core.config.server.name + ' ' + message);
    } else {
      away.client[type](from, message);
      console.log('[' + from + ']' + core.config.server.name + ' ' + message);
    }
  },

  message: function(from, to, message, details) {
    if (message.charAt(0) == away.core.config.prefix) {
      message = message.substr(1);
      message = message.split(' ');

      var command = message.shift();

      // If this command is valid
      if (away.commands.indexOf(command) > -1) {
        message = message.join(' ');
        away[command](from, to, message);
      }
    }
  },
  
  away: function(from, to, message) { // TODO: fix
    away.aways[from.toLowerCase()] = text;
    console.log (from + " has gone away [" + text + ']');
  },
  
  listener: function(from, to, message) {
    //check for an away-ee coming back
    if (from.toLowerCase() in away.aways) {
      delete away.aways[from.toLowerCase()]
      console.log(from + ' has come back');
    }
    //check for someone attempting to speak to someone who is away
    if (away.aways[text.split(' ')[0].replace(/[:,]/, '').toLowerCase()] != undefined) {
      var target = text.split(' ')[0].replace(/[:,]/, '')
      var to_say = target + ' is currently away' + (aways[target.toLowerCase()]?' [\u000310'+aways[target.toLowerCase()]+'\u000f]':'');
      away.reply("say", from, to, to_say);
      console.log(from + ' attempted to contact ' + text.split(' ')[0].replace(':', ''));
    }
  },
  
  bind: function() {
    away.client.addListener("message", away.message);
    away.client.addListener("message", away.listener);
  },
  
  unbind: function() {
    away.client.removeListener("message", away.message);
    away.client.removeListener("message", away.listener);
  }
};

module.exports = {
  load: function(client, core) {
    away.client = client;
    away.core = core;
    away.bind();
  },
  
  unload: function() {
    away.unbind();
    delete away;
  }
}
