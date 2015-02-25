var color = require("irc-colors");

var away = {
  commands: ["away", "rmaway"],
  client: false,
  core: false,
  timeout: false,
  wait: false,

  // away doesn't use a persistant database
  aways: {},

  message: function(from, to, message, details) {
    if (message.charAt(0) == away.core.config.prefix) {
      message = message.substr(1);
      message = message.split(' ');
      
      var command = message.shift();
      
      // If this command is valid
      if (away.commands.indexOf(command) > -1) {
        var ignore = false
        if (away.core.databases.ignore[from.toLowerCase()]) {
          away.core.databases.ignore[from.toLowerCase()].forEach(function(entry, index, object) {
            if (entry == "away") {
              console.log("[ignore]:".yellow + " ignored command '" + command + ' '  + message.join(' ') + "' from '" + from + "'");
              ignore = true;
            }
          });
        }
        if (ignore) {
          return;
        }
        message = message.join(' ');
        away[command](from, to, message);
      }
    }
  },

  away: function(from, to, message) {
    away.aways[from.toLowerCase()] = message;
    console.log(from + " has gone away [" + message + ']');
  },

  // allows an admin to delete a spammy away
  rmaway: function(from, to, message) {
    //console.log(from + ':' + message);
    //console.log(away.core.config.admins);
    //console.log(away.aways);
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
  },

  bind: function() {
    away.client.addListener("message", away.message);
    away.client.addListener("message", away.listener);
  },

  unbind: function() {
    away.client.removeListener("message", away.message);
    away.client.removeListener("message", away.listener);
  }
};

module.exports = {
  load: function(core) {
    away.core = core;
    away.client = away.core.client;
    away.bind();
  },

  unload: function() {
    away.unbind();
    delete away;
  },

  commands: away.commands
}
