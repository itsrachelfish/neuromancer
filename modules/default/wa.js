var color = require("irc-colors");
var request = require("request");

var wa = {
  commands: ["wa", "wolfram"],
  client: false,
  core: false,

  message: function(from, to, message, details) {
    if (message.charAt(0) == wa.core.config.prefix) {
      message = message.substr(1);
      message = message.split(' ');

      var command = message.shift();

      // If this command is valid
      if (wa.commands.indexOf(command) > -1) {
        message = message.join(' ');
        wa[command](from, to, message);
      }
    }
  },

  wa: function(from, to, message) {
    wa.wolfram(from, to, message);
  },

  wolfram: function(from, to, message) {
    request('http://tumbolia.appspot.com/wa/' + encodeURIComponent(message.replace('+', '%2B')), function(e, r, body) {
        var answer = body.replace(/&times;/g, ' * ').replace(/&pound;/, '£').replace(/&amp;/g, '&').replace(/&not;/g, '¬').replace(/&gt;/g, '>').replace(/&deg;/g, '°').replace(/&[a-zA-Z]+;/g, '[symbol]').replace('\n', '').replace('\\', '').split(';')
        if (answer[0].indexOf("Couldn't grab") != -1 || answer == []) {
          wa.core.send("say", from, to, '[' + color.red("error") + "] Couldn't display answer");
        } else {
          var to_say = '[' + color.blue("WolframAlpha") + '] ' + color.green(answer[0]) + ' = ' + color.red(answer[1]);
        wa.core.send("say", from, to, to_say);
      }
    });
},

  bind: function() {
    wa.client.addListener("message", wa.message);
  },

  unbind: function() {
    wa.client.removeListener("message", wa.message);
  }
  };

module.exports = {
  load: function(core) {
    wa.core = core;
    wa.client = wa.core.client;
    wa.bind();
  },

  unload: function() {
    wa.unbind();
    delete wa;
  },

  commands: wa.commands
};
