var color = require("irc-colors");
var core;

var roll = {
  commands: ["roll"],

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
      core.say(from, to, '[' + color.blue("note") + "] die size reduced to 100");
    }
    var dice = Math.floor(commands[0].match(/[0-9]*/));
    if (dice > 50) {
      dice = 50;
      core.say(from, to, '[' + color.blue("note") + "] number of rolls reduced to 50");
    }
    
    var rolls = '';
    var total = 0;
      
    for (i = 0; i < dice; i++) {
      var rand = (Math.floor((Math.random() * dieType) + 1));
      rolls += (rand + " ");
      total += parseInt(rand);
    }
    
    core.say(from, to, rolls);
    if (dice > 1) {
      core.say(from, to, '['+ color.green("total") + "] " + total);
    }
  }
};

module.exports = {
  load: function(_core) {
    core = _core;
  },

  unload: function() {
    delete roll;
    delete core;
    delete color;
  },

  commands: roll.commands,
  run: function(command, from, to, message) {
    roll[command](from, to, message);
  },
};
