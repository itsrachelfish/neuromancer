var color = require("irc-colors");

var tell = {
  commands: ["tell"],
  client: false,
  core: false,

  message: function(from, to, message, details) {
    if (message.charAt(0) == tell.core.config.prefix) {
      message = message.substr(1);
      message = message.split(' ');

      var command = message.shift();

      // If this command is valid
      if (tell.commands.indexOf(command) > -1) {
        message = message.join(' ');
        tell[command](from, to, message);
      }
    }
  },

  tell: function(from, to, message) {
    // enable this and other read/write ops in tell and listner if your bot crashes a lot to help prevent database screwups
    //tell.core.read_db("tell");
    var args = message.split(' ');
    var reciever = args[0].toLowerCase()

    if (!tell.core.databases.tell[reciever]) {
      tell.core.databases.tell[reciever] = [];
    }

    tell.core.databases.tell[reciever].push({
      from: from,
      mes: args.slice(1).join(' '),
      when: Date.now()
    });
    tell.core.send("say", from, to, color.green("Okay"));

    //tell.core.write_db("tell");
  },

  listener: function(from, to, message) {
    var reciever = from.toLowerCase();
    if (tell.core.databases.tell[reciever]) {
      tell.core.databases.tell[reciever].forEach(function(entry) {
        var to_say = from + ": " + color.blue('"' + entry.mes + '"') + ' [' + color.red(entry.from) + '] ' + '[' + color.purple(tell.readable_time(Date.now() - entry.when)) + ']';
        tell.core.send("say", from, to, to_say);
      });
      delete tell.core.databases.tell[reciever];
      //tell.core.write_db("tell");
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
  },

  bind: function() {
    tell.client.addListener("message", tell.message);
    tell.client.addListener("message", tell.listener);
  },

  unbind: function() {
    tell.client.removeListener("message", tell.message);
    tell.client.removeListener("message", tell.listener);
  }

};

module.exports = {
  load: function(core) {
    tell.core = core;
    tell.client = tell.core.client;
    
    // trigger for database read
    tell.core.read_db("tell");
    tell.bind();
  },

  unload: function() {
    tell.unbind();
    // trigger for database write
    tell.core.write_db("tell");
    delete tell;
  },
  
  commands: tell.commands
};
