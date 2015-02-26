var color = require("irc-colors");
var request = require("request");

var wa = {
  commands: ["wa", "wolfram"],
  core: false,

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
  }
};

module.exports = {
  load: function(core) {
    wa.core = core;
  },

  unload: function() {
    delete wa;
  },

  commands: wa.commands,
  run: function(command, from, to, message) {
    wa[command](from, to, message);
  },
};
