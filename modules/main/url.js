var color = require("irc-colors");
var request = require("request");
var urllib = require("url");

var url = {
  commands: [],
  core: false,
  client: false,

  HTMLchars: {
    '&reg': '®',
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&apos;': "'",
    '&ndash;': '-',
    '&mdash;': '-',
    '&infin;': '∞',
    '&raquo;': '»',
    '&laquo;': '«',
    '&middot;': '•',
    '&hellip;': '...'
  },

  listener: function(from, to, message) {
    
    
    
    // listen for links
    if (message.search(/\bhttps?:\/\/.*?\..*?\b/) !== -1) {
      var ignore = false
      if (url.core.databases.ignore[from.toLowerCase()]) {
        url.core.databases.ignore[from.toLowerCase()].forEach(function(entry, index, object) {
          if (entry == "url") {
            console.log("[ignore]:".yellow + " ignored link '" + message.join(' ') + "' from '" + from + "'");
            ignore = true;
          }
        });
      }
      if (ignore) {
        return;
      }
      // but not youtube links because those are handled seperately in youtube module
      if (message.search(/youtu((.be)|(be.com))/) !== -1) {
        return
      }
      var link = '' + message.match(/http\S*/)
      var ua = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:26.0) Gecko/20100101 Firefox/26.0'
      }
      var body = ''
      request({
        url: link,
        encoding: 'utf8',
        headers: ua
      }).on('data', function(chunk) {
        body += chunk
        if (body.length > 64000) this.abort()
      }).on('end', function() {
        try {
          var title = body.match(/<title>[\s\S]*?<\/title>/)[0].slice(7, -8)
          title = title.replace(/&#[0-9]*;/g, function(c) {
            return String.fromCharCode(c.match(/[0-9]+/)[0])
          })
          title = title.replace(/&[a-z#0-9]*;/g, function(c) {
            return HTMLchars[c] || c
          })
          title = title.replace(/(\r)|(\n)/g, '').replace(/\s+/g, ' ')
          title = title.slice(0, 80).replace(/(^\s)|(\s$)/g, '')
          url.core.send("say", from, to, '[\u000310 ' + title + ' \u000f] -\u000304 ' + urllib.parse(link).host)
        } catch (err) {}
      })
    }
  },

  bind: function() {
    url.client.addListener("message", url.listener);
  },

  unbind: function() {
    url.client.removeListener("message", url.listener);
  }
};

module.exports = {
  load: function(core) {
    url.core = core;
    url.client = url.core.client;
    url.bind();
  },

  unload: function() {
    url.unbind();
    delete url;
  },

  commands: url.commands
}
