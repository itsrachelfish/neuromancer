var request = require("request");

var search = {
  commands: ["g", "google"],
  client: false,
  core: false,

  message: function(from, to, message, details) {
    if (message.charAt(0) == search.core.config.prefix) {
      message = message.substr(1);
      message = message.split(' ');
      
      var ignore = false
      if (search.core.databases.ignore[from.toLowerCase()]) {
        search.core.databases.ignore[from.toLowerCase()].forEach(function(entry, index, object) {
          if (entry == "search") {
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
      if (search.commands.indexOf(command) > -1) {
        message = message.join(' ');
        search[command](from, to, message);
      }
    }
  },

  google: function(from, to, message) {
    request("http://ajax.googleapis.com/ajax/services/search/web?v=1.0&rsz=1&safe=oss&q=" + message, function(e, r, body) {
      search.core.send("say", from, to, from + ": " + JSON.parse(body).responseData.results[0].unescapedUrl);
    });
  },

  //g is an alias to google
  g: function(from, to, message) {
    search.google(from, to, message);
  },

  bind: function() {
    search.client.addListener("message", search.message);
  },

  unbind: function() {
    search.client.removeListener("message", search.message);
  }
};

module.exports = {
  load: function(core) {
    search.core = core;
    search.client = search.core.client;
    search.bind();
  },

  unload: function() {
    search.unbind();
    delete search;
  },

  commands: search.commands
};
