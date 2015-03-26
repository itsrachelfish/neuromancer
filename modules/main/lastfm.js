var color = require("irc-colors");
var request = require("request");
var core;

var lastfm = {
  commands: ["lastfm", "fm", "np"],
    
  lastfm: function(from, to, message) {
    if (message) {
      core.databases.lastfm[from] = message.replace(' ', '')
      core.say(from, to, from + ' associated with lastfm user ' + message)
    } else {
      if (core.databases.lastfm[from]) {
        request('http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + core.databases.lastfm[from] + '&api_key=1d234424fd93e18d503758bf2714859e&format=json', function(e, r, body) {
          try {
            var track = JSON.parse(body)['recenttracks']['track'][0]
            core.say(from, to, from + ' is listening to: \u000310' + track.artist['#text'] + '\u000f - \u000304' + track.name + ((track.album['#text'])?('\u000f (\u000307' + track.album['#text']+ '\u000f)'):''))
          } catch(err) {
            console.log('[error][module][lastfm] ' + err)
            core.say(from, to, '[' + color.red("error") + "] The last.fm api call failed");
          }
        })
      } else {
        core.say(from, to, '[' + color.red("error") + "] No lastfm user associated with " + from);
      }
    }
  },
  
  fm: function(from, to, message) {
    lastfm.lastfm(from, to, message);
  },
  
  np: function(from, to, message) {
    lastfm.lastfm(from, to, message);
  }
};

module.exports = {
  load: function(_core) {
    core = _core;
  },
  
  unload: function() {
    delete lastfm;
    delete color;
    delete request;
    delete core;
  },
  
  commands: lastfm.commands,
  db: true,
  run: function(command, from, to, message) {
    lastfm[command](from, to, message);
  }
};