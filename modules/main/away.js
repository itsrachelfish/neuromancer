var color = require("irc-colors");

var away = {
  commands: ["away", "rmaway"],
  core: false,
  
  // vars needed for the timeout to work
  timeout: false,
  wait: false,
  
  // away doesn't use a persistant database
  aways: {},

  away: function(from, to, message) {
    away.aways[from.toLowerCase()] = message;
    console.log(from + " has gone away [" + message + ']');
  },

  // allows an admin to delete a spammy away
  rmaway: function(from, to, message) {
    if (admin.core.config.admins.indexOf(from) > -1) {
      if (message.toLowerCase() in away.aways) {
        delete away.aways[message.toLowerCase()];
      }
    }
  },

  listener: function(from, to, message) {
    // one of the problems of async programing is that our listener sees the away-ee leaving
    // this if statement makes it work by ignoring <prefix>away commands when listening for an away-ee's return
    var awaycmd = away.core.config.prefix + "away";
    if (message.split(' ')[0] != awaycmd) {
      //listen for an away-ee coming back
      if (from.toLowerCase() in away.aways) {
        delete away.aways[from.toLowerCase()];
        console.log(from + ' has come back');
      }
      //listen for someone attempting to speak to someone who is away
      if (away.aways[message.split(' ')[0].replace(/[:,]/, '').toLowerCase()] != undefined) {
        var timeout = away.waiting(5);
        if (timeout) {
          return;
        }
        var target = message.split(' ')[0].replace(/[:,]/, '');
        var to_say = target + " is currently away " + (away.aways[target.toLowerCase()] ? "[" + color.blue(away.aways[target.toLowerCase()]) + "]" : color.blue("No reason specified"));
        away.core.send("say", from, to, to_say);
        console.log(from + ' attempted to contact ' + message.split(' ')[0].replace(':', ''));
      }
    }
  },

  waiting: function(timeout) {
    if (away.wait) {
      var timeout = (away.timeout.getTime() - new Date().getTime()) / 1000;
      return timeout;
    }

    if (typeof timeout == "undefined")
      timeout = 1;

    var date = new Date();
    away.timeout = new Date(date.getTime() + (timeout * 60 * 1000));

    away.wait = setTimeout(function() {
      away.wait = false;
      away.timeout = false;
    }, timeout * 60 * 1000);
  }
};

module.exports = {
  load: function(core) {
    away.core = core;
  },

  unload: function() {
    delete away;
  },

  commands: away.commands,
  listener: away.listener,
  run: function(command, from, to, message) {
    away[command](from, to, message);
  }
}

