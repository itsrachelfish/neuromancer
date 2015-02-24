var color = require("irc-colors");
var request = require("request");

var lastfm = {
  commands: ["lastfm", "fm", "np"],
  client: false,
  core: false,
  
  message: function(from, to, message, details) {
    if (message.charAt(0) == lastfm.core.config.prefix) {
      message = message.substr(1);
      message = message.split(' ');
      
      var ignore = false
      if (lastfm.core.databases.ignore[from.toLowerCase()]) {
        lastfm.core.databases.ignore[from.toLowerCase()].forEach(function(entry, index, object) {
          if (entry == "lastfm") {
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
      if (lastfm.commands.indexOf(command) > -1) {
        message = message.join(' ');
        lastfm[command](from, to, message);
      }
    }
  },
  
  lastfm: function(from, to, message) {
    if (message) {
      lastfm.core.databases.lastfm[from] = text.replace(' ', '')
      lastfm.core.send("say", from, to, from + ' associated with lastfm user ' + message)
    } else {
      if (lastfm.core.databases.lastfm[from]) {
        request('http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + lastfm.core.databases.lastfm[from] + '&api_key=1d234424fd93e18d503758bf2714859e&format=json', function(e, r, body) {
          try {
            var track = JSON.parse(body)['recenttracks']['track'][0]
            lastfm.core.send("say", from, to, from + ' is listening to: \u000310' + track.artist['#text'] + '\u000f - \u000304' + track.name + ((track.album['#text'])?('\u000f (\u000307' + track.album['#text']+ '\u000f)'):''))
          } catch(err) {
            console.log('[error][module][lastfm] ' + err)
            lastfm.core.send("say", from, to, '[' + color.red("error") + "] The last.fm api call failed");
          }
        })
      } else {
        lastfm.core.send("say", from, to, '[' + color.red("error") + "] No lastfm user associated with " + from);
      }
    }
  },
  
  fm: function(from, to, message) {
    lastfm.lastfm(from, to, message);
  },
  
  np: function(from, to, message) {
    lastfm.lastfm(from, to, message);
  },
  
  bind: function() {
    lastfm.client.addListener("message", lastfm.message);
  },
  
  unbind: function() {
    lastfm.client.removeListener("message", lastfm.message);
  }
};

module.exports = {
  load: function(core) {
    lastfm.core = core;
    lastfm.client = lastfm.core.client;
    lastfm.core.read_db("lastfm");
    lastfm.bind();
  },
  
  unload: function() {
    lastfm.core.write_db("lastfm");
    lastfm.unbind();
    delete lastfm;
  },
  
  commands: lastfm.commands
};