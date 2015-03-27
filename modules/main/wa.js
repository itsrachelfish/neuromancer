var color = require("irc-colors");
var request = require("request");
var core;

var wa = {
  commands: ["wa", "wolfram"],

  wa: function(from, to, message) {
    wa.wolfram(from, to, message);
  },

  wolfram: function(from, to, message) {
    request('http://tumbolia.appspot.com/wa/' + encodeURIComponent(message.replace('+', '%2B')), function(e, r, body) {
      var answer = body.replace(/&times;/g, ' * ').replace(/&pound;/, '£').replace(/&amp;/g, '&').replace(/&not;/g, '¬').replace(/&gt;/g, '>').replace(/&deg;/g, '°').replace(/&[a-zA-Z]+;/g, '[symbol]').replace('\n', '').replace('\\', '').split(';')
      if (answer[0].indexOf("Couldn't grab") != -1 || answer == []) {
        core.say(from, to, '[' + color.red("error") + "] Couldn't display answer");
      } else {
        var to_say = '[' + color.blue("WolframAlpha") + '] ' + color.green(answer[0]) + ' = ' + color.red(answer[1]);
        core.say(from, to, to_say);
      }
    });
  }
};

module.exports = {
  load: function(_core) {
    core = _core;
  },

  unload: function() {
    delete wa;
    delete core;
    delete color;
    delete request;
  },

  commands: wa.commands,
  run: function(command, from, to, message) {
    wa[command](from, to, message);
  },
};
