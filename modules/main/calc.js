var mathjs = require("mathjs");
var color = require("irc-colors");

var calc = {
  commands: ["c"],
  client: false,
  core: false,

  message: function(from, to, message, details) {
    if (message.charAt(0) == calc.core.config.prefix) {
      message = message.substr(1);
      message = message.split(' ');
      
      var ignore = false
      if (calc.core.databases.ignore[from.toLowerCase()]) {
        calc.core.databases.ignore[from.toLowerCase()].forEach(function(entry, index, object) {
          if (entry == "calc") {
            console.log("[ignore]:".yellow + " ignored command '" + message.join(' ') + "' from '" + from + "'");
            ignore = true;
          }
        });
      }
      if (ignore) {
        return;
      }

      var command = message.shift();

      // If this command is valid
      if (calc.commands.indexOf(command) > -1) {
        message = message.join(' ');
        calc[command](from, to, message);
      }
    }
  },

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
  },
  
  bind: function() {
    calc.client.addListener("message", calc.message);
  },
  
  unbind: function() {
    calc.client.removeListener("message", calc.message);
  }
};

module.exports = {
  load: function(core) {
    calc.core = core;
    calc.client = calc.core.client;
    calc.bind();
  },
  
  unload: function() {
    calc.unbind();
    delete calc;
  },
  
  commands: calc.commands
};
