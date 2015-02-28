var color = require("irc-colors");

var tell = {
  commands: ["tell"],
  core: false,

  tell: function(from, to, message) {
    var args = message.split(' ');
    var reciever = args[0].toLowerCase();

    if (!tell.core.databases.tell[reciever]) {
      tell.core.databases.tell[reciever] = [];
    }

    tell.core.databases.tell[reciever].push({
      from: from,
      mes: args.slice(1).join(' '),
      when: Date.now()
    });
    tell.core.send("say", from, to, color.green("Okay"));

    //save the db so if the bot/module crashes/whatever we don't lose our new tell
    tell.core.write_db("tell");
  },

  listener: function(from, to, message) {
    var reciever = from.toLowerCase();
    if (tell.core.databases.tell[reciever]) {
      tell.core.databases.tell[reciever].forEach(function(entry) {
        var to_say = from + ": " + color.blue('"' + entry.mes + '"') + ' [' + color.red(entry.from) + '] ' + '[' + color.purple(tell.readable_time(Date.now() - entry.when)) + ']';
        tell.core.send("say", from, to, to_say);
      });
      delete tell.core.databases.tell[reciever];
      tell.core.write_db("tell");
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
    return (readable + ' ago');
  }
};

module.exports = {
  load: function(core) {
    tell.core = core;
  },

  unload: function() {
    delete tell;
  },
  
  commands: tell.commands,
  db: true,
  listener: tell.listeners,
  run: function(command, from, to, message) {
    tell[command](from, to, message);
  },
};
