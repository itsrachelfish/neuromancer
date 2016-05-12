var request = require("request");
var gsearchapi = require("google");

var debug = false;

var core;

var search = {
  commands: ["g", "google"],

  google: function(from, to, message) {
    gsearchapi.resultsPerPage = 1;
    gsearchapi(message, function(erro, res) {
      if (err){
        console.error(err);
        core.say(from, to, from + ": The api call failed, please try again");
      }
      core.say(from, to, from + ": " + res.links[0]);
    });
  },

  //g is an alias to google
  g: function(from, to, message) {
    search.google(from, to, message);
  }
};

module.exports = {
  load: function(_core) {
    core = _core;
  },

  unload: function() {
    delete search;
    delete core;
    delete request;
  },

  commands: search.commands,
  run: function(command, from, to, message) {
    search[command](from, to, message);
  },
};
