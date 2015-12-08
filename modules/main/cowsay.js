var cow = require("cowsay");
var parseArgs = require("minimist");
var fs = require("fs");
var path = require("path");

var core;

var cowsay = {
  commands: ["cowsay"],

  cowsay: function (from, to, message) {
    message = message.split(' ');
    var args = parseArgs(message);
    if (args.l) {
      // TODO: make this more robust
      fs.readdir(path.join(__dirname, "../../node_modules/cowsay/cows"), function (err, files) {
        if (err) {
          core.err(err);
        } else {
          var cows = files.map(function (cow) {
            return path.basename(cow, ".cow");
          });
          cowsay.core.say(from, from, cows.join(' '));
        }
      });
    } else {
      cowsay.core.say(from, to, cow.say({
        text: args._.join(' '),
        e: args.e,
        f: args.f,
        T: args.T,
        W: args.W,
      }));
    }
  },
};

module.exports = {
  load: function (_core) {
    core = _core;
  },

  unload: function () {
    delete cowsay;
    delete core;
    delete cow;
    delete parseArgs;
    delete fs;
    delete path;
  },

  commands: cowsay.commands,
  run: function (command, from, to, message) {
    cowsay[command](from, to, message);
  },
};
