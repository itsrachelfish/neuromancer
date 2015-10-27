var parseArgs = require("minimist");
var debug = true;
var core = false;

var secrets = {
  commands: ["secret"],
  
  secret: function(from, to, message) {
    var args = parseArgs(message.split(' '), opts={
      boolean: ['l'],
      string: ['a'],
    });
    
    if (args.l) {
      core.databases.secrets.forEach(function(entry, index, object) {
        core.say(from, from, "[" + index + "] " + entry.key + " = " + entry.data);
      });
      return;
    } else if (args.d) {
      delete core.databases.secrets[args.d];
      core.write_db("secrets");
    } else if (args.a) {
      var key = args.a.split("=")[0];
      var data = args.a.split("=")[1];
      if (debug) {
        console.log(key + " = " + data);
      }
      core.databases.secrets[key] = data;
      core.write_db("secrets");
    }
  }
};

module.exports = {
  load: function(_core) {
    core = _core;
    return;
  },
  
  unload: function() {
    delete secrets;
    delete core;
  },
  
  commands: secrets.commands,
  db: true,
  run: function(command, from, to, message) {
    secrets[command](from, to, message);
    return;
  }
};