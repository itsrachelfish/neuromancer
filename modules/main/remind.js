var color = require("irc-colors");

var remind = {
  commands: ["remind"],
  client: false,
  core: false,

  message: function(from, to, message, details) {
    if (message.charAt(0) == remind.core.config.prefix) {
      message = message.substr(1);
      message = message.split(' ');

      var ignore = false
      if (remind.core.databases.ignore[from.toLowerCase()]) {
        remind.core.databases.ignore[from.toLowerCase()].forEach(function(entry, index, object) {
          if (entry == "remind") {
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
      if (remind.commands.indexOf(command) > -1) {
        message = message.join(' ');
        remind[command](from, to, message);
      }
    }
  },

  remind: function(from, to, message) {
    //remind.core.read_db("remind");
    var args = message.split(' ');
    var htime = (args[0].toLowerCase() == "-f") ? args[1] : args[0];
    var ptime = 0;

    ptime += (htime.match(/[0-9.]*s/) || '0')[0].match(/[0-9.]*/)[0] * 1000
    ptime += (htime.match(/[0-9.]*m/) || '0')[0].match(/[0-9.]*/)[0] * 60000
    ptime += (htime.match(/[0-9.]*h/) || '0')[0].match(/[0-9.]*/)[0] * 3600000
    ptime += (htime.match(/[0-9.]*d/) || '0')[0].match(/[0-9.]*/)[0] * 86400000

    var time = Date.now() + ptime;

    if (args[0].toLowerCase() == "-f") {
      setTimeout(function() {
        var to_say = from.toLowerCase() + ": " + color.blue(args.slice(2).join(' '));
        remind.core.send("say", from.toLowerCase(), to, to_say);
      }, ptime);
    } else {
      if (!remind.core.databases.remind[from.toLowerCase()]) {
        remind.core.databases.remind[from.toLowerCase()] = [];
      }

      remind.core.databases.remind[from.toLowerCase()].push({
        t: time,
        m: args.slice(1).join(' '),
      });
      remind.core.write_db("remind");
    }
  },

  listener: function(from, to, message) {
    if (remind.core.databases.remind[from.toLowerCase()]) {
      var save = false;
      remind.core.databases.remind[from.toLowerCase()].forEach(function(entry, index, object) {
        if (entry.t <= Date.now()) {
          remind.core.send("say", from, to, from + ": " + color.blue(entry.m));
          object.splice(index, 1);
          save = true;
        }
      });
      if (save) {
        remind.core.write_db("remind");
      }
    }
  },

  bind: function() {
    remind.client.addListener("message", remind.message);
    remind.client.addListener("message", remind.listener);
  },

  unbind: function() {
    remind.client.removeListener("message", remind.message);
    remind.client.addListener("message", remind.listener);
  }

};

module.exports = {
  load: function(core) {
    remind.core = core;
    remind.client = remind.core.client;

    remind.core.read_db("remind");
    remind.bind();
  },

  unload: function() {
    remind.unbind();
    remind.core.write_db("remind");
    delete remind;
  },

  commands: remind.commands
};
