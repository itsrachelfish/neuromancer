var color = require("irc-colors");

var remind = {
  commands: ["remind"],
  core: false,

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
        if (to.charAt(0) != '#') {
          to = from.toLowerCase();
        }
        remind.core.send("say", from.toLowerCase(), to, to_say);
      }, ptime);
    } else {
      if (!remind.core.databases.remind[from.toLowerCase()]) {
        remind.core.databases.remind[from.toLowerCase()] = [];
      }
      // determine if privmessage or channelmessage
      // if privmessage, set the db to send the remind notification as a privmessage to the person
      if (to.charAt(0) != '#') {
        to = from.toLowerCase();
      }

      remind.core.databases.remind[from.toLowerCase()].push({
        t: time,
        m: args.slice(1).join(' '),
        to: to,
      });
      remind.core.write_db("remind");
    }
  },

  listener: function(from, to, message) {
    if (remind.core.databases.remind[from.toLowerCase()]) {
      var save = false;
      remind.core.databases.remind[from.toLowerCase()].forEach(function(entry, index, object) {
        if (entry.t <= Date.now()) {
          remind.core.send("say", from, entry.to, from + ": " + color.blue(entry.m));
          object.splice(index, 1);
          save = true;
        }
      });
      if (save) {
        remind.core.write_db("remind");
      }
    }
  }
};

module.exports = {
  load: function(core) {
    remind.core = core;
  },

  unload: function() {
    delete remind;
  },

  commands: remind.commands,
  db: true,
  listener: remind.listener,
  run: function(command, from, to, message) {
    remind[command](from, to, message);
  },
};
