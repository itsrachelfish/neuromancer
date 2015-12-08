var reload = require('require-reload')(require);
var core;
var config;

var messages = {
  client: false,

  send: function (type, from, to, message) {
    //determine if it's a channel message or a privmessage
    if (to.charAt(0) == '#') {
      core.client[type](to, message);
    } else {
      core.client[type](from, message);
    }
  },

  say: function (from, to, message) {
    messages.send("say", from, to, message);
  },

  recieve: function (module_id, from, to, text, details) {
    var userhost = details.user + '@' + details.host;
    // if the command is prefixed with our command prefix
    if (text.charAt(0) == core.config.prefix) {
      text = text.substr(1);
      text = text.split(' ');

      var command = text.shift();

      from = from.toLowerCase();

      // If the module is loaded and the command is valid
      if (typeof core.loaded[module_id] != "undefined" && core.loaded[module_id].commands.indexOf(command) > -1) {
        if (config.logLevel >= 3) {
          console.log("[command]: ".yellow + command + " " + text.join(" ") + " issued by: " + from + " in channel: " + to);
        }

        // if the ignore module is loaded
        if (core.loaded["main/ignore"]) {
          var ignore = false;
          if (core.databases.ignore[from.toLowerCase()]) {
            core.databases.ignore[from.toLowerCase()].forEach(function (entry, index, object) {
              if (entry == module_id.split('/')[1]) {
                if (config.logLevel >= 2) {
                  console.log("[ignore]:".yellow + " ignored command '" + command + ' ' + text.join(' ') + "' from '" + from + "'");
                }
                ignore = true;
              }
            });
          }
          if (ignore) {
            return;
          }
        }

        // if it's an admin-only module and the user is a non-admin
        if (core.loaded[module_id].admin && userhost != core.config.owner) {
          if (config.logLevel >= 1) {
            console.log("[admin]:".red + " invalid admin credentials");
            console.log("[admin]: command: ".red + command + " " + text.join(" ") + " channel: ".red + to + " nick: ".red + from + " userhost: ".red + userhost);
          }
          return;
        }

        // run the command
        text = text.join(' ');
        core.loaded[module_id].run(command, from, to, text);
      }
    }
  },
};

module.exports = {
  load: function (_core) {
    core = _core;
    core.msend = messages.send;
    core.mrecieve = messages.recieve;
    core.msay = messages.say;
    config = reload("../../etc/messages.js");
  },

  unload: function () {
    core.msend = false;
    core.mrecieve = false;
    core.msay = false;
    delete messages;
    delete core;
    delete config;
    delete reload;
  },
};
