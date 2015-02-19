var fs = require('fs');

var tell = {
  commands: ["tell", "ignore", "unignore"],
  client: false,
  core: false,
  tells: {},
  ignores: {},

  //TODO: eventually make this and message a core function
  reply: function(type, from, to, message) {
    //determine if it's a channel message or a privmessage
    if (to.charAt(0) == '#') {
      tell.client[type](to, message);
      console.log('[' + to + ']' + core.config.server.name + ' ' + message);
    } else {
      tell.client[type](from, message);
      console.log('[' + from + ']' + core.config.server.name + ' ' + message);
    }
  },

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
    core.check_db("tell");
    var args = text.split(' ');

    //check to see if the reciever is ignoring the other person's .tells
    if (tell.ignores[from] && tell.ignores[from].indexOf(args[0]) != -1) {
      var to_say = from + ": " + args[0] + " is ignoring " + tell.core.config.prefix + "tell's from you";
      tell.reply("say", from, to, to_say);
    }

    if (tell.tells[args[0].toLowerCase()]) {
      tell.tells[args[0].toLowerCase()].push({
        from: from,
        mes: args.slice(1).join(' '),
        when: Date.now()
      })
    } else {
      tell.tells[args[0].toLowerCase()] = [{
        from: from,
        mes: args.slice(1).join(' '),
        when: Date.now()
      }]
    }
    fs.writeFileSync("./db/tell.json", JSON.stringify(tell.tells));
  },

  ignore: function(from, to, message) {
    core.check_db("tell_ignores");
    var ignored = message.replace(' ', '');
    tells.ignores[ignored] = tell.ignores[ignored] || [];
    if (tells.ignores[ignored].indexOf(from) == -1) {
      tell.ignores[ignored].push(from);
      var to_say = from + " is now ignoring " + ignored
      tell.reply("say", from, to, to_say);
    } else {
      var to_say = from + ": You were already ignoring " + ignored;
      tell.reply("say", from, to, to_say);
    }
    fs.writeFile("./db/tell_ignores.json", JSON.stringify(tell.ignores));
  },

  unignore: function(from, to, message) {
    core.check_db("tell_ignores");
    var unignored = text.replace(' ', '')
    if (tell.ignores[unignored] && tell.ignores[unignored].indexOf(from) != -1) {
      tell.ignores[unignored].splice(tell.ignores[unignored].indexOf(from), 1);
      if (tell.ignores[unignored] == '') {
        delete tell.ignores[unignored];
      }
      fs.writeFile('./db/tell_ignores.json', JSON.stringify(bot.ignore));
      var to_say = from + " is no longer ignoring " + unignored;
      tell.reply("say", from, to, to_say);
    } else {
      var to_say = from + ": You were not ignoring " + unignored;
      tell.reply("say", from, to, to_say);
    }
    fs.writeFile("./db/tell_ignores.json", JSON.stringify(tell.ignores));
  },

  listener: function(from, to, message) {
    if (tell.tells[from.toLowerCase()]) {
      for (var i in tell.tells[from.toLowerCase()]) {
        var to_say = from + ": " + irc.colors.wrap("cyan", tell.tells[from.toLowerCase()][i].mes) + irc.colors.wrap("yellow", ' (' + tell.tells[from.toLowerCase()][i].from + ') ') + irc.colors.wrap("light_blue", '[' + tell.readableTime(Date.now() - tell.tells[from.toLowerCase()][i].when) + ']');

        tell.say("say", from, to, to_say);
        delete tell.tells[from.toLowerCase()];
        fs.writeFileSync("./db/tell.json", JSON.stringify(tell.tells));
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
  load: function(client, core) {
    tell.client = client;
    tell.core = core;
    core.check_db("tell");
    tell.tells = JSON.parse(fs.readFileSync("./db/tell.json", "utf8"));
    core.check_db("tell_ignores");
    tell.ignores = JSON.parse(fs.readFileSync("./db/tell_ignores.json", "utf8"));
    tell.bind();
  },

  unload: function() {
    tell.unbind();
    fs.writeFileSync("./db/tell.json", JSON.stringify(tell.tells));
    fs.writeFileSync("./db/tell_ignores.json", JSON.stringify(tell.ignores));
    delete tell;
  }
};
