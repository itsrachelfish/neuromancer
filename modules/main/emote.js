var color = require("irc-colors");

var emote = {
  commands: ["dunno", "downy", "lv", "id", "ld", "intense", "doubledowny", "tripledowny", "rainbowdowny"],
  core: false,

  dunno: function(from, to, message) {
    var faces = [
      "‾\\(ツ)/‾",
      "¯\\(º_o)/¯",
      "¯\\_(シ)_/¯"
    ];

    emote.core.send("say", from, to, color.lime(faces[Math.floor(Math.random() * faces.length)]));
  },

  downy: function(from, to, message) {
    var downy = ".'\x1f/\x1f)";
    emote.core.send("say", from, to, color.lime(downy));
  },

  doubledowny: function(from, to, message) {
    emote.downy(from, to, message);
    emote.downy(from, to, message);
  },

  trippledowny: function(from, to, message) {
    emote.downy(from, to, message);
    emote.downy(from, to, message);
    emote.downy(from, to, message);
  },

  rainbowdowny: function(from, to, message) {
    var downy = ".'\x1f/\x1f)";
    emote.core.send("say", from, to, color.rainbow(downy));
  },

  lv: function(from, to, message) {
    var lv = "♥";
    emote.core.send("say", from, to, color.red(lv));
  },

  id: function(from, to, message) {
    var x = ~~ (Math.random() * 4) + 0;
    var y = ~~ (Math.random() * 999) + 0;

    if (y >= 750) {
      var dbladez = [
        'illegal dbladez',
        'I snuck dbladez into prison up my ass.',
        'I love sniffing whole lines of dbladez.',
        'Twenty-five years in prison was worth it for just one hit of dbladez',
        'Taking dbladez ruined my life.'
      ];
      emote.core.send("say", from, to, color.bold(dbladez[x]));
    } else {
      emote.core.send("say", from, to, color.bold("illegal drugs"));
    }
  },

  ld: function(from, to, message) {
    var x = ~~ (Math.random() * 29) + 0;

    if (x == 9) {
      emote.core.send("say", from, to, color.bold("There are no legal drugs."));
    } else if (x == 19) {
      emote.core.send("say", from, to, color.bold("All drugs are illegal."));
    } else if (x == 29) {
      emote.core.send("say", from, to, color.bold("Your drug use has been logged and reported."));
    } else {
      emote.core.send("say", from, to, color.bold("legal drugs\x02"));
    }
  },

  intense: function(from, to, message) {
    emote.core.send("say", from, to, color.bold("[" + message + " intensifies]"));
  },

  listener: function(from, to, message) {
    if (message == "xD" || message == "xd" || message == "XD" || message == "Xd") {
      var x = ~~ (Math.random() * 4) + 0;
      var y = ~~ (Math.random() * 99) + 0;
      if (y < 45) {
        var xd = ['xd', 'xD', 'XD', 'xDD', 'XDD'];
        emote.core.send("say", from, to, xd[x]);
      }
    }
  }
};

module.exports = {
  load: function(core) {
    emote.core = core;
  },

  unload: function() {
    delete emote;
  },

  commands: emote.commands,
  listener: emote.listener,
  run: function(command, from, to, message) {
    emote[command](from, to, message);
  }
};
