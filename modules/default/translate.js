var color = require("irc-colors");
var request = require("request");

var translate = {
  commands: ["translate", "tr"],
  client: false,
  core: false,
  
  message: function(from, to, message, details) {
    if (message.charAt(0) == translate.core.config.prefix) {
      message = message.substr(1);
      message = message.split(' ');

      var command = message.shift();

      // If this command is valid
      if (translate.commands.indexOf(command) > -1) {
        message = message.join(' ');
        translate[command](from, to, message);
      }
    }
  },
  
  translate: function(from, to, message) {
    request('http://translate.google.com/translate_a/t?client=t&sl=auto&tl=en&q=' + text, function(e, r, body) {
      translate.core.send("say", from, to, from + ': \u000304[Translation] \u000310' + JSON.parse(body.replace(/,,/g, ',null,').replace(/,,/g, ',').replace(/\[,/g, '[null,'))[0][0][0])
    });
  },
  
  tr: function(from, to, message) {
    translate.translate(from, to, message);
  },
  
  bind: function() {
    translate.client.addListener("message", translate.message);
  },
  
  unbind: function() {
    translate.client.removeListener("message", translate.message);
  }
};

module.exports = {
  load: function(core) {
    translate.core = core;
    translate.client = translate.core.client;
    translate.bind();
  },
  
  unload: function() {
    translate.unbind();
    delete translate;
  },
  
  commands: translate.commands
};
