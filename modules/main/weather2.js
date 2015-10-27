var parseArgs = require("minimist");
var debug = true;
var core = false;

var weather2 = {
  commands: ["weather2", "forecast2"],
  
  weather2: function(from, to, message) {
    
  },
  
  forecast2: function(from, to, message) {
    
  },
};

module.exports = {
  load: function(_core) {
    core = _core;
    return;
  },
  
  unload: function() {
    delete weather2;
    delete core;
  },
  
  commands: weather2.commands,
  db: true,
  run: function(command, from, to, message) {
    weather2[command](from, to, message);
    return;
  }
};