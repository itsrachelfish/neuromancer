var color = require("irc-colors");

var seen = {
  commands: ["seen", "since"],
  core: false,

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
  },

  seen: function(from, to, message) {
    var commands = message.split(' ');
    var last = false;
    if (commands[0] == "-l") {
      commands.splice(0, 1);
      last = true;
    }
    if (seen.core.databases.seen[commands[0].toLowerCase()]) {
      if (last && seen.core.databases.seen[commands[0].toLowerCase()].l) {
        seen.core.send("say", from, to, "Last heard from \u000308" + commands[0] + '\u000f ' + seen.readable_time(Date.now() - seen.core.databases.seen[commands[0].toLowerCase()].d) + ' ago with \u000312"' + seen.core.databases.seen[commands[0].toLowerCase()].l + '"');
      } else {
        seen.core.send("say", from, to, "Last heard from \u000308" + commands[0] + '\u000f ' + seen.readable_time(Date.now() - seen.core.databases.seen[commands[0].toLowerCase()].d) + ' ago');
      }
    } else {
      seen.core.send("say", from, to, "Sorry, I haven't seen " + commands[0]);
    }
  },

  since: function(from, to, message) {
    var since = [];
    for (var i in seen.core.databases.seen) {
      if (seen.core.databases.seen[i].d >= Date.now() - ((message > 1440) ? 1440 : message) * 60000) {
        since.push(i);
      }
    }
    seen.core.send("say", from, to, 'In the last ' + message + ' minutes, I\'ve seen ' + since.join(', '));
  },

  listener: function(from, to, message) {
    seen.core.databases.seen[from.toLowerCase()] = {
      d: Date.now(),
      l: message
    };
  }
};

module.exports = {
  load: function(core) {
    seen.core = core;
  },

  unload: function() {
    delete seen;
  },

  commands: seen.commands,
  listener: seen.listener,
  db: true,
  run: function(command, from, to, message) {
    seen[command](from, to, message);
  },
};
