var color = require("irc-colors");
var core;

var away = {
  commands: ["away", "rmaway"],

  // vars needed for the timeout to work
  timeout: false,
  wait: false,

  // away doesn't use a persistant database
  aways: {},

  away: function(from, to, message) {
    if (!message) {
      away.aways[from.toLowerCase()] = "No reason specified";
      console.log("[away]: ".yellow + from + " has gone away [No reason specified]");
    } else {
      away.aways[from.toLowerCase()] = message;
      console.log("[away]: ".yellow + from + " has gone away [" + message + ']');
    }
  },

  // allows an admin to delete a spammy away
  rmaway: function(from, to, message) {
    if (core.config.admins.indexOf(from) > -1) {
      if (message.toLowerCase() in away.aways) {
        delete away.aways[message.toLowerCase()];
      }
    }
  },

  listener: function(from, to, message) {
    // one of the problems of async programing is that our listener sees the away-ee leaving
    // this if statement makes it work by ignoring <prefix>away commands when listening for an away-ee's return
    var awaycmd = core.config.prefix + "away";
    if (message.split(' ')[0] != awaycmd) {
      //listen for an away-ee coming back
      if (from.toLowerCase() in away.aways) {
        delete away.aways[from.toLowerCase()];
        console.log("[away]: ".yellow + from + ' has come back');
      }
      //listen for someone attempting to speak to someone who is away
      if (away.aways[message.split(' ')[0].replace(/[:,]/, '').toLowerCase()] != undefined) {
        var timeout = away.waiting(5);
        if (timeout) {
          return;
        }
        var target = message.split(' ')[0].replace(/[:,]/, '');

        if (away.aways[target.toLowerCase()] == "No reason specified") {
          var to_say = target + " is currently away";
        } else {
          var to_say = target + " is currently away [" + color.blue(away.aways[target.toLowerCase()]) + ']';
        }
        
        core.say(from, to, to_say);
        console.log("[away]: ".yellow + from + ' attempted to contact ' + message.split(' ')[0].replace(':', ''));
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
  },
};

module.exports = {
  load: function(_core) {
    core = _core;
  },

  unload: function() {
    delete away;
    delete core;
    delete color;
  },

  commands: away.commands,
  listener: away.listener,
  run: function(command, from, to, message) {
    away[command](from, to, message);
  }
}
