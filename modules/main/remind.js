var color = require("irc-colors");
var parseArgs = require("minimist");

var remind = {
  commands: ["remind", "test"],
  core: false,

  remind: function(from, to, message) {
    var args = parseArgs(message.split(' '), opts = {
      boolean: ['f', 'r'],
    }); // args parsing with minimist is awesome
    if (to.charAt(0) != '#') {
      to = from;
    }

    if (to.charAt(0) != '#') {
      to = from;
    }
    if (args.l) { // if the user wants a listing
      // give them one lol
      remind.core.databases.remind[from.toLowerCase()].forEach(function(entry, index, object) {
        var rtime = remind.readable_time(entry.time - Date.now());
        remind.core.send("say", from, from, '[' + index + ']: force: ' + entry.force + "; SMS: " + entry.sms + "; recurring: " + entry.recurring + "; TTL: " + rtime + "; message: " + entry.message);
      });
    } else { // if it's not one of the others it must be a normal    
      var htime = args._[0];
      var ptime = 0;
      ptime += (htime.match(/[0-9.]*s/) || '0')[0].match(/[0-9.]*/)[0] * 1000;
      ptime += (htime.match(/[0-9.]*m/) || '0')[0].match(/[0-9.]*/)[0] * 60000;
      ptime += (htime.match(/[0-9.]*h/) || '0')[0].match(/[0-9.]*/)[0] * 3600000;
      ptime += (htime.match(/[0-9.]*d/) || '0')[0].match(/[0-9.]*/)[0] * 86400000;
      var time = Date.now() + ptime;

      // if it's an sms
      // sms reminders are akin to force reminders, but they're handled differently
      if (args.s) {
        var sms = args.s;
        remind.core.send("say", from, to, "SMS reminders aren't fully implemented. Your reminders will not be sms'd to you, but will be deilvered normally");
      } else {
        var sms = false;
      }

      if (args.r) {
        var recurring = true;
        remind.core.send("say", from, to, "Recurring reminders aren't fully implemented. Your reminders will not recur");
      } else {
        var recurring = false;
      }

      if (args.f) {
        var force = true;
        setTimeout(function() {
          var to_say = from + ": " + color.blue(args._.slice(1).join(' '));
          if (to.charAt(0) != '#') {
            to = from;
          }
          remind.core.send("say", from, to, to_say);
          
        }, ptime);
      } else {
        var force = false;
      }

      if (remind.core.databases.remind[from.toLowerCase()]) {
        remind.core.databases.remind[from.toLowerCase()].push({
          time: time,
          message: args._.slice(1).join(' '),
          to: to,
          sms: sms,
          recurring: recurring,
          force: force,
        });
      } else {
        remind.core.databases.remind[from.toLowerCase()] = [{
          time: time,
          message: args._.slice(1).join(' '),
          to: to,
          sms: sms,
          recurring: recurring,
          force: force,
        }]
      }
      remind.core.write_db("remind");
    }

  },

  listener: function(from, to, message) {
    if (remind.core.databases.remind[from.toLowerCase()]) {
      var save = false;
      remind.core.databases.remind[from.toLowerCase()].forEach(function(entry, index, object) {
        if (entry.time <= Date.now()) {
          // don't re-send force reminders
          if (!entry.force) {
            remind.core.send("say", from, entry.to, from + ": " + color.blue(entry.message));
          }
          object.splice(index, 1);
          save = true;
        }
      });
      if (save) {
        remind.core.write_db("remind");
      }
    }
  },

  readable_time: function(time) {
    var days = Math.floor(time / 86400000),
      hours = Math.floor(time / 3600000) - (days * 24),
      minutes = Math.floor(time / 60000) - (hours * 60) - (days * 1440);
    var readable = ''
    if (time < 60000) {
      readable = "less than a minute";
    } else {
      //Fuck yeah nested ternary operators. Unreadable as hell
      days = (days == 0) ? '' : (days == 1) ? (days + ' day') : (days + ' days');
      hours = (hours == 0) ? '' : (hours == 1) ? (hours + ' hour') : (hours + ' hours');
      minutes = (minutes == 0) ? '' : (minutes == 1) ? (minutes + ' minute') : (minutes + ' minutes');

      if (days != '') {
        days += (hours != '' && minutes != '') ? ', ' : ((hours == '' && minutes != '') || (hours != '' && minutes == '')) ? ' and ' : '';
      }
      if (hours != '' && minutes != '') {
        hours += ' and ';
      }
      readable = days + hours + minutes;
    }
    return (readable);
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
