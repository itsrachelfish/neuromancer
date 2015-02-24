var cow = require("cowsay");

var cowsay = {
  commands: ["cowsay"],
  client: false,
  core: false,
  timeout: false,
  wait: false,

  message: function(from, to, message, details) {
    if (message.charAt(0) == cowsay.core.config.prefix) {
      message = message.substr(1);
      message = message.split(' ');
      
      var ignore = false
      if (cowsay.core.databases.ignore[from.toLowerCase()]) {
        cowsay.core.databases.ignore[from.toLowerCase()].forEach(function(entry, index, object) {
          if (entry == "cowsay") {
            console.log("[ignore]:".yellow + " ignored command '" + message.join(' ') + "' from '" + from + "'");
            ignore = true;
          }
        });
      }
      if (ignore) {
        return;
      }

      var command = message.shift();

      // If this command is valid
      if (cowsay.commands.indexOf(command) > -1) {
        message = message.join(' ');
        cowsay[command](from, to, message);
      }
    }
  },

  cowsay: function(from, to, message) {
    timeout = cowsay.waiting(2);
    if (timeout) {
      return;
    }
    cowsay.core.send("say", from, to, cow.say({
      text: message,
      e: "xx",
      f: "bong"
    }));

  },

  waiting: function(timeout) {
    if (cowsay.wait) {
      var timeout = (cowsay.timeout.getTime() - new Date().getTime()) / 1000;
      return timeout;
    }

    if (typeof timeout == "undefined")
      timeout = 1;

    var date = new Date();
    cowsay.timeout = new Date(date.getTime() + (timeout * 60 * 1000));

    cowsay.wait = setTimeout(function() {
      cowsay.wait = false;
      cowsay.timeout = false;
    }, timeout * 60 * 1000);
  },

  bind: function() {
    cowsay.client.addListener("message", cowsay.message);
  },

  unbind: function() {
    cowsay.client.removeListener("message", cowsay.message);
  }
};

module.exports = {
  load: function(core) {
    cowsay.core = core;
    cowsay.client = cowsay.core.client;
    cowsay.bind();
  },

  unload: function() {
    cowsay.unbind();
    delete cowsay;
  },

  commands: cowsay.commands
};
