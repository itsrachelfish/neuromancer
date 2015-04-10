var request = require("request");
var debug = false;
var core;

var search = {
  commands: ["g", "google"],

  google: function(from, to, message) {
    request("http://ajax.googleapis.com/ajax/services/search/web?v=1.0&rsz=1&q=" + message, function(e, r, body) {
      if (body) {
        if (debug) {
          console.log(JSON.stringify(JSON.parse(body)));
          console.log(JSON.stringify(JSON.parse(body).responseData.results[0].unescapedUrl));
        }
        core.say(from, to, from + ": " + JSON.parse(body).responseData.results[0].unescapedUrl);
      } else {
	  core.say(from, to, from + ": The api call failed, please try again");
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
