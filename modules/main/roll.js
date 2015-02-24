var color = require("irc-colors");

var roll = {
  commands: ["roll"],
  client: false,
  core: false,

  // boilerplate woo
  message: function(from, to, message, details) {
    if (message.charAt(0) == roll.core.config.prefix) {
      message = message.substr(1);
      message = message.split(' ');
      
      

      var command = message.shift();

      // If this command is valid
      if (roll.commands.indexOf(command) > -1) {
        var ignore = false
        if (roll.core.databases.ignore[from.toLowerCase()]) {
          roll.core.databases.ignore[from.toLowerCase()].forEach(function(entry, index, object) {
            if (entry == "roll") {
              console.log("[ignore]:".yellow + " ignored command '" + message.join(' ') + "' from '" + from + "'");
              ignore = true;
            }
          });
        }
        if (ignore) {
          return;
        }
        message = message.join(' ');
        roll[command](from, to, message);
      }
    }
  },

  roll: function(from, to, message) {
    var commands = message.split(' ');
    var dieType = 6;
    for (var i = 0; i < commands.length; i++) {
      if (commands[i].match(/^d[0-9]*$/)) {
        dieType = commands[i].slice(1);
        commands.splice(i, 1);
      }
    }
    if (dieType > 100) {
      dieType = 100;
      roll.core.send("say", from, to, '[' + color.blue("note") + "] die size reduced to 100");
    }
    var dice = Math.floor(commands[0].match(/[0-9]*/));
    if (dice > 256) {
      dice = 256;
      roll.core.send("say", from, to, '[' + color.blue("note") + "] number of rolls reduced to 256");
    }
    
    var rolls = '';
    var total = 0;
      
    for (i = 0; i < dice; i++) {
      var rand = (Math.floor((Math.random() * dieType) + 1));
      rolls += (rand + " ");
      total += parseInt(rand);
    }
    
    roll.core.send("say", from, to, rolls);
    if (dice > 1) {
      roll.core.send("say", from, to, '['+ color.green("total") + "] " + total);
    }
  },

  bind: function() {
    roll.client.addListener("message", roll.message);
  },

  unbind: function() {
    roll.client.removeListener("message", roll.message);
  }
};

module.exports = {
  load: function(core) {
    roll.core = core;
    roll.client = roll.core.client;
    roll.bind();
  },

  unload: function() {
    roll.unbind();
    delete roll;
  },

  commands: roll.commands
};
