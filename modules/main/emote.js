var color = require("irc-colors");
var core;

var emote = {
  commands: ["dunno", "downy", "lv", "id", "ld", "intense", "doubledowny", "tripppledowny", "rainbowdowny"],
  core: false,

  dunno: function(from, to, message) {
    var faces = [
      "‾\\(ツ)/‾",
      "¯\\(º_o)/¯",
      "¯\\_(シ)_/¯"
    ];

    core.say(from, to, color.lime(faces[Math.floor(Math.random() * faces.length)]));
  },

  downy: function(from, to, message) {
    var downy = ".'\x1f/\x1f)";
    core.say(from, to, color.lime(downy));
  },

  doubledowny: function(from, to, message) {
    emote.downy(from, to, message);
    emote.downy(from, to, message);
  },

  tripppledowny: function(from, to, message) {
    emote.downy(from, to, message);
    emote.downy(from, to, message);
    emote.downy(from, to, message);
  },

  rainbowdowny: function(from, to, message) {
    var downy = ".'\x1f/\x1f)";
    core.say(from, to, color.rainbow(downy));
  },

  lv: function(from, to, message) {
    var lv = "♥";
    core.say(from, to, color.red(lv));
  },

  id: function(from, to, message) {
    var x = ~~(Math.random() * 4) + 0;
    var y = ~~(Math.random() * 999) + 0;

    if (y >= 750) {
      var dbladez = [
        'illegal dbladez',
        'I snuck dbladez into prison up my ass.',
        'I love sniffing whole lines of dbladez.',
        'Twenty-five years in prison was worth it for just one hit of dbladez',
        'Taking dbladez ruined my life.'
      ];
      core.say(from, to, color.bold(dbladez[x]));
    } else {
      core.say(from, to, color.bold("illegal drugs"));
    }
  },

  ld: function(from, to, message) {
    var x = ~~(Math.random() * 29) + 0;

    if (x == 9) {
      core.say(from, to, color.bold("There are no legal drugs."));
    } else if (x == 19) {
      core.say(from, to, color.bold("All drugs are illegal."));
    } else if (x == 29) {
      core.say(from, to, color.bold("Your drug use has been logged and reported."));
    } else {
      core.say(from, to, color.bold("legal drugs\x02"));
    }
  },

  intense: function(from, to, message) {
    core.say(from, to, color.bold("[" + message + " intensifies]"));
  },
};

module.exports = {
  load: function(_core) {
    core = _core;
  },

  unload: function() {
    delete emote;
    delete color;
    delete core;
  },

  commands: emote.commands,
  run: function(command, from, to, message) {
    emote[command](from, to, message);
  }
};
