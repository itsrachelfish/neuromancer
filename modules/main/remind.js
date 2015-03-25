var color = require("irc-colors");
var colors = require("colors");
var parseArgs = require("minimist");
var schedule = require("node-schedule");
var sms = require("mtextbelt");
var config = require("../../etc/remind.js");
var debug = false;



var remind = {
  commands: ["remind"],
  core: false,

  scheduled: {},
  pending: {},

  remind: function(from, to, message) {
    var args = parseArgs(message.split(' '), opts = {
      boolean: ['f', 'l', 'r'],
      string: ['d', 'p', 'h', 'm', 's'],
    }); // args parsing with minimist is awesome)

    if (debug) {
      console.log("args: " + JSON.stringify(args));
    }

    if (args.l) {
      remind.core.send("say", from, from, "Reminders: ");
      remind.core.databases.remind[from.toLowerCase()].forEach(function(entry, index, object) {
        var opts = [];
        if (entry.args.r) {
          opts.push("r");
        } else {
          opts.push('-');
        }
        if (entry.args.p) {
          opts.push("p");
        } else {
          opts.push('-');
        }
        if (entry.args.f) {
          opts.push("f")
        } else {
          opts.push('-');
        }
        if (!entry.args.r) {
          remind.core.send("say", from, from, "[" + index + "] ttl: " + remind.readable_time(entry.time - Date.now()) + " opts: " + opts.join('') + " message: " + entry.args._.join(' '));
          if (debug) {
            console.log(JSON.stringify(entry));
          }
        } else {
          var time = "";
          if (entry.args.h) {
            time = time + entry.rule.hour + 'h:';
          }
          if (entry.args.m) {
            time = time + entry.rule.minute + 'm';
          }

          if (debug) {
            console.log(JSON.stringify(entry));
          }
          remind.core.send("say", from, from, "[" + index + "] time: " + time + " opts: " + opts.join('') + " message: " + entry.args._.join(' '));
        }
      });
      return;
    } else if (args.d) {
      remind.core.databases.remind[from.toLowerCase()].forEach(function(entry, index, object) {
        if (args.d == index) {
          remind.delReminder(entry);
          remind.core.send("say", from, from, "Reminder #" + index + " deleted")
        }
      });
      return;
    } else { // if it's not a listing or deletion, it must be a schedule request
      if (args.r) { // if it's recurring
        var rule = new schedule.RecurrenceRule();
        // process the args into the recurrence rule
        if (args.h) {
          rule.hour = Number(args.h) - Number(config.localTZ);
        } else {
          rule.hour = 0;
        }
        if (args.m) {
          rule.minute = args.m;
        } else {
          rule.minute = 0;
        }
        var then = false;
        
        var reminder = {
          from: from,
          channel: to,
          time: then,
          args: args,
          uid: uid,
          rule: rule,
        }

        if (debug) {
          console.log("recurrenceRule: " + JSON.stringify(rule));
          console.log("reminder: " + JSON.stringify(reminder));
        }
      } else { // or not
        var now = new Date();
        var then = new Date();
        // this is gross I know :c
        var hour = now.getHours();
        var minutes = now.getMinutes();
        var seconds = now.getSeconds();
        if (args.h) {
          hour = hour + args.h;
        }
        if (args.m) {
          minutes = minutes + args.m;
        }
        if (args.s) {
          seconds = seconds + args.s;
        }

        then.setHours(hour);
        then.setMinutes(minutes);
        then.setSeconds(seconds);
        var rule = false;
        
        var reminder = {
          from: from,
          channel: to,
          time: then,
          args: args,
          uid: uid,
          rule: rule,
        }

        if (debug) {
          console.log("now: " + JSON.stringify(now));
          console.log("then: " + JSON.stringify(then));
          console.log("diff: " + remind.readable_time(JSON.stringify(then - now)));
          console.log("reminder: " + JSON.stringify(reminder));
        }
      }

      // thanks to stackoverflow user kennytm for this uid generation method, it's so clean
      var uid = ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
      if (debug) {
        console.log("uid: " + uid);
      }
      
      remind.addReminder(reminder);
      return;
    }
  },

  addReminder: function(reminder) {
    // push to main db
    if (!remind.core.databases.remind[reminder.from.toLowerCase()]) {
      remind.core.databases.remind[reminder.from.toLowerCase()] = [];
    }

    remind.core.databases.remind[reminder.from.toLowerCase()].push(reminder);

    // schedule the reminder
    if (reminder.args.r) { // if it's recurring
      // schedule the job
      var job = schedule.scheduleJob(reminder.rule, function(reminder) {
        remind.runReminder(reminder);
      }.bind(null, reminder));
    } else { // if not recurring
      // schedule it per usual
      var job = schedule.scheduleJob(reminder.time, function(reminder) {
        remind.runReminder(reminder);
      }.bind(null, reminder));
    }

    if (!remind.scheduled[reminder.from.toLowerCase()]) {
      remind.scheduled[reminder.from.toLowerCase()] = [];
    }
    remind.scheduled[reminder.from.toLowerCase()].push({
      job: job,
      uid: reminder.uid,
    });

    remind.core.write_db("remind");
    return;
  },

  runReminder: function(reminder) {
    if (debug) {
      console.log("running reminder: " + JSON.stringify(reminder));
    }

    // if the user gave a phonenumber
    if (reminder.args.p) {
      sms.send(reminder.args.p, reminder.args._.join(' '), function(err, result) {
        if (err) {
          remind.core.send("say", reminder.from, reminder.from, reminder.from + ": I had a problem sending you an sms, here's your reminder: " + color.yellow(reminder.args._.join(' ')));
        } else {
          console.log("[remind]: ".yellow + "sms sent to: " + reminder.from);
        }
      });
    }
    // if it's a force reminder
    if (reminder.args.f) {
      remind.core.send("say", reminder.from, reminder.channel, reminder.from + ": " + color.yellow(reminder.args._.join(' ')));
    } else {
      if (!remind.pending[reminder.from.toLowerCase()]) {
        remind.pending[reminder.from.toLowerCase()] = [];
      }
      remind.pending[reminder.from.toLowerCase()].push(reminder);
      if (debug) {
        console.log("pending db: " + JSON.stringify(remind.pending));
      }
    }
    // if it's not a recurring reminder
    if (!reminder.args.r) {
      // then delete it
      remind.delReminder(reminder);
    }
    return;
  },

  delReminder: function(reminder) {
    if (debug) {
      console.log("uid to del: " + reminder.uid);
    }
    remind.core.databases.remind[reminder.from.toLowerCase()].forEach(function(entry, index, object) {
      if (debug) {
        console.log("current uid: " + entry.uid);
      }
      if (reminder.uid == entry.uid) {
        object.splice(index, 1);
        if (debug) {
          console.log("deleted reminder: " + reminder.uid);
        }
      }
    });

    if (remind.scheduled[reminder.from.toLowerCase()]) {
      remind.scheduled[reminder.from.toLowerCase()].forEach(function(entry, index, object) {
        if (reminder.uid == entry.uid) {
          entry.job.cancel();
          object.splice(index, 1);
        }
      });
    }
    remind.core.write_db("remind");
    return;
  },

  init: function() {
    // woo javascript!
    // this goes through the saved reminders and restores the reminder job for them
    remind.core.read_db("remind", function() {
      Object.keys(remind.core.databases.remind).forEach(function(user) {
        remind.core.databases.remind[user.toLowerCase()].forEach(function(entry, index, object) {
          var now = new Date();
          var then = new Date();
          // this is gross I know :c
          var hour = now.getHours();
          var minutes = now.getMinutes();
          var seconds = now.getSeconds();
          if (entry.args.h) {
            hour = hour + entry.args.h;
          }
          if (entry.args.m) {
            minutes = minutes + entry.args.m;
          }

          then.setHours(hour);
          then.setMinutes(minutes);
          then.setSeconds(seconds);

          entry.time = then;

          // schedule the reminder
          if (entry.args.r) { // if it's recurring
            var job = schedule.scheduleJob(entry.rule, function(reminder) {
              remind.runReminder(reminder);
            }.bind(null, entry));
          } else { // or not
            var job = schedule.scheduleJob(entry.time, function(reminder) {
              remind.runReminder(reminder);
            }.bind(null, entry));
          }

          if (!remind.scheduled[entry.from.toLowerCase()]) {
            remind.scheduled[entry.from.toLowerCase()] = [];
          }
          remind.scheduled[entry.from.toLowerCase()].push({
            job: job,
            uid: entry.uid,
          });
        });
      });
    });
    return;
  },

  listener: function(from, to, message) {
    if (remind.pending[from.toLowerCase()]) {
      remind.pending[from.toLowerCase()].forEach(function(entry, index, object) {
        remind.core.send("say", from, to, entry.from + ": " + color.yellow(entry.args._.join(' ')));
      });
      delete remind.pending[from.toLowerCase()];
    }
    return;
  },

  readable_time: function(time) {
    var days = Math.floor(time / 86400000),
      hours = Math.floor(time / 3600000) - (days * 24),
      minutes = Math.floor(time / 60000) - (hours * 60) - (days * 1440);
    var readable = ''
    if (time < 60000) {
      readable = (time / 1000) + " seconds"
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
  },
};

module.exports = {
  load: function(core) {
    remind.core = core;
    remind.init();
    return;
  },

  unload: function() {
    delete remind;
    return;
  },

  commands: remind.commands,
  db: true,
  listener: remind.listener,
  run: function(command, from, to, message) {
    remind[command](from, to, message);
    return;
  },
};
