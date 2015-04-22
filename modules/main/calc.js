var mathjs = require("mathjs");
var color = require("irc-colors");
var core;

var calc = {
  commands: ["c"],

  c: function(from, to, message) {
    var parser = mathjs.parser();

    if (message.indexOf('!') + message.indexOf('factorial') != -2) {
      core.say(from, to, '[' + color.red("error") + "] Factorials disabled, use " + core.config.prefix + "wa");
      return;
    }

    try {
      var to_say = mathjs.format(parser.eval(message), {
        precision: 14
      }).replace("undefined", color.red("Error parsing input"));
      core.say(from, to, color.yellow(to_say));
    } catch (e) {
      core.say(from, to, color.red("Error parsing input"));
    }
  },
};

module.exports = {
  load: function(_core) {
    core = _core;
    mathjs.config({
      matrix: "matrix"
    });
  },

  unload: function() {
    delete calc;
    delete core;
    delete color;
    delete mathjs;
  },

  commands: calc.commands,
  run: function(command, from, to, message) {
    calc[command](from, to, message);
  },
};
