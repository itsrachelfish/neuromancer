var cow = require("cowsay");
var parseArgs = require("minimist");
var fs = require("fs");
var path = require("path");
var core;

var cowsay = {
  commands: ["cowsay"],

  // stuff for the timeout
  timeout: false,
  wait: false,

  cowsay: function(from, to, message) {
    message = message.split(' ')
    var args = parseArgs(message);
    if (args.l) {
      // TODO: make this more robust
      fs.readdir(path.join(__dirname, "../../node_modules/cowsay/cows"), function(err, files) {
        if (err) {
          core.err(err);
        } else {
          var cows = files.map(function(cow) {
            return path.basename(cow, ".cow");
          });
          cowsay.core.say(from, from, cows.join(' '));
        }
      });
    } else {
      timeout = cowsay.waiting(2);
      if (timeout) {
        return;
      }
      cowsay.core.say(from, to, cow.say({
        text: args._.join(' '),
        e: args.e,
        f: args.f,
        T: args.T,
        W: args.W,
      }));
    }
  },

  // TODO: maybe make this a core function eventually maybe 
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
};

module.exports = {
  load: function(_core) {
    core = _core;
  },

  unload: function() {
    delete cowsay;
    delete core;
    delete cow;
    delete parseArgs;
    delete fs;
    delete path;
  },

  commands: cowsay.commands,
  run: function(command, from, to, message) {
    cowsay[command](from, to, message);
  },
};
