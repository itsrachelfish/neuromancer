var cow = require("cowsay");

var cowsay = {
  commands: ["cowsay"],
  core: false,

  // stuff for the timeout
  timeout: false,
  wait: false,

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

  // TODO: maybe make this a core function eventually
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
  }
};

module.exports = {
  load: function(core) {
    cowsay.core = core;
  },

  unload: function() {
    delete cowsay;
  },

  commands: cowsay.commands,
  run: function(command, from, to, message) {
    cowsay[command](from, to, message);
  }
};
