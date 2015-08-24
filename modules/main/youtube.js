var color = require("irc-colors");
var request = require("request");
var debug = false;
var core;

var youtube = {
  listener: function(from, to, message) {
    if (message.match(/(youtube.com\/watch\S*v=|youtu.be\/)([\w-]+)/)) {
      var ignore = false
      // if we're ignoring them
      if (core.databases.ignore[from.toLowerCase()]) {
        core.databases.ignore[from.toLowerCase()].forEach(function(entry, index, object) {
          if (entry == "youtube") {
            console.log("[ignore]:".yellow + " ignored youtube link '" + message.join(' ') + "' from '" + from + "'");
            ignore = true;
          }
        });
      }
      if (ignore) {
        return;
      }

      request('https://www.youtube.com/watch?v='+message.match(/(youtube.com\/watch\S*v=|youtu.be\/)([\w-]+)/)[2], function(e,r,b) {
        if (debug) {
          console.log(e);
          console.log(r);
          console.log(b);
        }
        var output = '\u00031,00You\u00030,04Tube\u000f '
        var title = (((b.match(/eow-title.*/)||[''])[0].match(/title=.*/)||[''])[0].match(/\".*\"/)||[''])[0].replace(/\"/g,'')
        while (title.match(/&#[0-9]*;/)) {
          title = title.replace(title.match(/&#[0-9]*;/)[0], String.fromCharCode(title.match(/&#[0-9]*;/)[0].match(/[0-9]+/)[0]))
        }
        title = title.replace(/&amp;/g,'&').replace(/&quot;/g,'"')
        output += '[\u000310' + title + '\u000f] '
        var duration = (((b.match(/duration\".*content=.*/)||[''])[0].match(/content.*/)||[''])[0].match(/[A-Z0-9]+/)||[''])[0].replace('M',':').replace(/[A-Z]/g, '')
        duration = duration.replace(duration.slice(duration.search(':')),':'+('0'+duration.slice(duration.search(':')+1)).slice(-2))
        output += '[' + duration + '] '
        var likes = ((b.match(/like-button.*\/button.*/g)||[''])[0].match(/>[0-9,\.]+</)||[''])[0].replace(/[><,\.]/g,'')
        var dislikes = ((b.match(/dislike-button.*\/button.*/g)||[''])[0].match(/>[0-9,\.]+</)||[''])[0].replace(/[><,\.]/g,'')
        output += '[\u000303' + likes + '\u000f|\u000304' + dislikes + '\u000f]'
        core.say(from, to, output)
      });
    }
  }
};

module.exports = {
  load: function(_core) {
    core = _core;
  },

  unload: function() {
    delete youtube;
    delete color;
    delete request;
    delete core;
  },

  listener: youtube.listener,
};
