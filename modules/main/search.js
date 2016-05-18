var request = require("request");
var gsearchapi = require("google");

var debug = true;

var core;

var search = {
  commands: ["g", "google"],

  google: function(from, to, message) {
    gsearchapi.resultsPerPage = 4;
    gsearchapi(message, function(err, res) {
      if (err){
        console.error(err);
        core.say(from, to, from + ": The api call failed, please try again");
      }
      if (debug) {
        console.log(JSON.stringify(res.links));
      }
      if (res.links[0]["description"] == ""){
        core.say(from, to, from + ": " + res.links[1]["href"]);
      } else {
        core.say(from, to, from + ": " + res.links[0]["href"]);
      }
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
