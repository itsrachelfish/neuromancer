var color = require("irc-colors");
var colors = require("colors");
var parseArgs = require("minimist");
var schedule = require("node-schedule");
var sms = require("mtextbelt");
var debug = true;
var recurSecondsEnabled = false;


var remind = {
  commands: ["remind"],
  core: false,

  scheduled: {},
  pending: {},

  remind: function(from, to, message) {
    var args = parseArgs(message.split(' '), opts = {
      boolean: ['f', 'l', 'r'],
      string: ['d', 'p'],
    }); // args parsing with minimist is awesome)

    if (debug) {
      console.log("args: " + JSON.stringify(args));
    }

    if (args.l) {
      remind.core.send("say", from, from, "Reminders: ");
      remind.core.databases.remind[from.toLowerCase()].forEach(function(entry, index, object) {
        // this is horrifying I know
        var opts = "---";
        if (entry.args.f) {
          opts = "f--";
          if (entry.args.p) {
            opts = "fp-";
            if (entry.args.r) {
              opts = "fpr";
            }
          }
        }
        if (entry.args.p) {
          opts = "-p-";
          if (entry.args.r) {
            opts = "-pr";
            if (entry.args.f) {
              opts = "fpr";
            }
          }
        }
        if (entry.args.r) {
          opts = "--r";
          if (entry.args.f) {
            opts = "f-r";
            if (entry.args.p) {
              opts = "fpr";
            }
          }
        }
        if (!entry.args.r) {
          remind.core.send("say", from, from, "[" + index + "] ttl: " + remind.readable_time(entry.time - Date.now()) + " message: " + entry.args._.join(' ') + " opts: " + opts + " uid: " + entry.uid);
        } else {
          var time = "";
          if (entry.args.h) {
            time = time + entry.args.h + 'h:';
          }
          if (entry.args.m) {
            time = time + entry.args.m + 'm:';
          }
          if (recurSecondsEnabled) {
            if (entry.args.s) {
              time = time + entry.args.s + 's';
            }
          }
          remind.core.send("say", from, from, "[" + index + "] time: " + time + " message: " + entry.args._.join(' ') + " opts: " + opts + " uid: " + entry.uid);
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
        seconds = seconds + args.s
      }

      then.setHours(hour);
      then.setMinutes(minutes);
      then.setSeconds(seconds);

      // thanks to stackoverflow user kennytm for this uid generation method, it's so clean
      var uid = ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
      if (debug) {
        console.log("uid: " + uid);
      }

      var reminder = {
        from: from,
        channel: to,
        time: then,
        args: args,
        uid: uid,
      }

      if (debug) {
        console.log("now: " + JSON.stringify(now));
        console.log("then: " + JSON.stringify(then));
        console.log("diff: " + remind.readable_time(JSON.stringify(then - now)));
        console.log("reminder: " + JSON.stringify(reminder));
      }

      remind.addReminder(reminder);
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
      var rule = new schedule.RecurrenceRule();
      if (reminder.args.h) {
        rule.hour = reminder.args.h;
      }
      if (reminder.args.m) {
        rule.minute = reminder.args.m;
      }
      if (recurSecondsEnabled) {
        if (reminder.args.s) {
          rule.second = reminder.args.s;
        }
      }
      var job = schedule.scheduleJob(rule, function(reminder) {
        remind.runReminder(reminder);
      }.bind(null, reminder));
    } else { // or not
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
  },

  runReminder: function(reminder) {
    if (debug) {
      console.log("running reminder: " + JSON.stringify(reminder));
    }
    
    if (reminder.args.p) {
      sms.send(reminder.args.p, reminder.args._.join(' '), function(err, result) {
        if (err) {
            remind.core.send("say", reminder.from, reminder.from, reminder.from + ": I had a problem sending you an sms, here's your reminder: " + color.yellow(reminder.args._.join(' ')));
        } else {
          console.log("[remind]: ".yellow + "sms sent to: " + reminder.from);
        }
      });
    }
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
    if (!reminder.args.r) {
      remind.delReminder(reminder);
    }
  },

  delReminder: function(reminder) {
    console.log("uid to del: " + reminder.uid);
    remind.core.databases.remind[reminder.from.toLowerCase()].forEach(function(entry, index, object) {
      console.log("current uid: " + entry.uid);
      if (reminder.uid == entry.uid) {
        object.splice(index, 1);
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
          if (recurSecondsEnabled) {
            if (entry.args.s) {
              seconds = seconds + entry.args.s
            }
          }

          then.setHours(hour);
          then.setMinutes(minutes);
          then.setSeconds(seconds);

          entry.time = then;
          // schedule the reminder
          if (entry.args.r) { // if it's recurring
            var rule = new schedule.RecurrenceRule();
            if (entry.args.h) {
              rule.hour = entry.args.h;
            }
            if (entry.args.m) {
              rule.minute = entry.args.m;
            }
            if (entry.args.s) {
              rule.second = entry.args.s;
            }
            var job = schedule.scheduleJob(rule, function(reminder) {
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
  },

  listener: function(from, to, message) {
    if (remind.pending[from.toLowerCase()]) {
      remind.pending[from.toLowerCase()].forEach(function(entry, index, object) {
        remind.core.send("say", from, to, entry.from + ": " + color.yellow(entry.args._.join(' ')));
      });
      delete remind.pending[from.toLowerCase()];
    }
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
