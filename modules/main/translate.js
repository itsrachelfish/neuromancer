var color = require("irc-colors");
var request = require("request");

var translate = {
  commands: ["translate", "tr"],
  core: false,

  translate: function(from, to, message) {
    request('http://translate.google.com/translate_a/t?client=t&sl=auto&tl=en&q=' + message, function(e, r, body) {
      translate.core.send("say", from, to, from + ': [\u000304Translation \u000310]' + JSON.parse(body.replace(/,,/g, ',null,').replace(/,,/g, ',').replace(/\[,/g, '[null,'))[0][0][0])
    });
  },

  tr: function(from, to, message) {
    translate.translate(from, to, message);
  }
};

module.exports = {
  load: function(core) {
    translate.core = core;
  },

  unload: function() {
    delete translate;
  },

  commands: translate.commands,
  run: function(command, from, to, message) {
    translate[command](from, to, message);
  },
};
