var color = require("irc-colors");

var roll = {
  commands: ["roll"],
  core: false,

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
    if (dice > 50) {
      dice = 50;
      roll.core.send("say", from, to, '[' + color.blue("note") + "] number of rolls reduced to 50");
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
  }
};

module.exports = {
  load: function(core) {
    roll.core = core;
  },

  unload: function() {
    delete roll;
  },

  commands: roll.commands,
  run: function(command, from, to, message) {
    roll[command](from, to, message);
  },
};
