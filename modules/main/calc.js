var mathjs = require("mathjs");
var color = require("irc-colors");

var calc = {
  commands: ["c"],
  core: false,

  c: function(from, to, message) {
    mathjs.config({
      matrix: "matrix"
    });
    
    var parser = mathjs.parser();

    if (message.indexOf('!') + message.indexOf('factorial') != -2) {
      calc.core.send("say", from, to, '[' + color.red("error") + "] Factorials disabled, use " + calc.core.config.prefix + "wa");
      return;
    }

    try {
      var to_say = mathjs.format(parser.eval(message), {
        precision: 14
      }).replace("undefined", color.red("Error parsing input"));
      calc.core.send("say", from, to, color.blue(to_say));
    } catch (e) {
      calc.core.send("say", from, to, color.red("Error parsing input"));
    }
  }
};

module.exports = {
  load: function(core) {
    calc.core = core;
  },
  
  unload: function() {
    delete calc;
  },
  
  commands: calc.commands,
  run: function(command, from, to, message) {
    calc[command](from, to, message);
  }
};
