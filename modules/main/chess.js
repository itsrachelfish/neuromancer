var core;

var chess = {
  commands: ["chess", "ch"],
  
  ch: function(from, to, message) {
    chess.chess(from, to, message);
  },
  
  chess: function(from, to, message) {
    
  },
};

module.exports = {
  load: function(_core) {
    core = _core;
  },
  unload: function() {
    delete core;
    delete chess;
  },
  
  commands: chess.commands,
  db: true,
  run: function(command, from, to, message) {
    chess[command](from, to, message);
  },
};