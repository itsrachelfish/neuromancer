var messages = {
  core: false,
  client: false,

  send: function(type, from, to, message) {
    //determine if it's a channel message or a privmessage
    if (to.charAt(0) == '#') {
      messages.core.client[type](to, message);
    } else {
      messages.core.client[type](from, message);
    }
  },
  
  say: function(from, to, message) {
    messages.send("say", from, to, message);
  },

  recieve: function(module_id, from, to, text, details) {
    var userhost = details.user + '@' + details.host;
    // if the command is prefixed with our command prefix
    if (text.charAt(0) == messages.core.config.prefix) {
      text = text.substr(1);
      text = text.split(' ');

      var command = text.shift();

      // If the module is loaded and the command is valid
      if (typeof messages.core.loaded[module_id] != "undefined" && messages.core.loaded[module_id].commands.indexOf(command) > -1) {

        // if the ignore module is loaded
        if (messages.core.loaded["main/ignore"]) {
          var ignore = false;
          if (messages.core.databases.ignore[from.toLowerCase()]) {
            messages.core.databases.ignore[from.toLowerCase()].forEach(function(entry, index, object) {
              if (entry == module_id.split('/')[1]) {
                console.log("[ignore]:".yellow + " ignored command '" + command + ' ' + text.join(' ') + "' from '" + from + "'");
                ignore = true;
              }
            });
          }
          if (ignore) {
            return;
          }
        }

        // if it's an admin-only module and the user is a non-admin
        if (messages.core.loaded[module_id].admin && userhost != messages.core.config.owner) {
          return;
        }

        // run the command
        text = text.join(' ');
        messages.core.loaded[module_id].run(command, from, to, text);
      }
    }
  },
};

module.exports = {
  load: function(core) {
    messages.core = core;
    messages.core.send = messages.send;
    messages.core.recieve = messages.recieve;
    messages.core.say = messages.say;
  },

  unload: function() {
    messages.core.send = false;
    messages.core.recieve = false;
    delete messages;
  },
};
