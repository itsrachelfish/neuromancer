var color = require("irc-colors");

var emote = {
  commands: ["dunno", "downy", "lv", "id", "ld", "intense", "doubledowny", "tripledowny", "rainbowdowny"],
  client: false,
  core: false,

  message: function(from, to, message, details) {
    if (message.charAt(0) == emote.core.config.prefix) {
      message = message.substr(1);
      message = message.split(' ');

      var command = message.shift();

      // If this command is valid
      if (emote.commands.indexOf(command) > -1) {
        message = message.join(' ');
        emote[command](from, to, message);
      }
    }
  },

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

  tripledowny: function(from, to, message) {
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

      if (y == 98) {
        emote.core.send("say", from, to, "hi every1 im new!!!!!!! holds up spork my name is katy but u can call me t3h PeNgU1N oF d00m!!!!!!!! lol…as u can see im very random!!!! thats why i came here, 2 meet random ppl like me _… im 13 years old (im mature 4 my age tho!!) i like 2 watch invader zim w/ my girlfreind (im bi if u dont like it deal w/it) its our favorite tv show!!! bcuz its SOOOO random!!!! shes random 2 of course but i want 2 meet more random ppl =) like they say the more the merrier!!!! lol…neways i hope 2 make alot of freinds here so give me lots of commentses!!!! DOOOOOMMMM!!!!!!!!!!!!!!!! <--- me bein random again _^ hehe…toodles!!!!!");
        emote.core.send("say", from, to, "loves and waffles,");
        emote.core.send("say", from, to, "t3h PeNgU1N oF d00m");
      } else {
        if (y < 45) {
          var xd = ['xd', 'xD', 'XD', 'xDD', 'XDD'];
          emote.core.send("say", from, to, xd[x]);
        }
      }
    }
  },

  bind: function() {
    emote.client.addListener("message", emote.message);
    emote.client.addListener("message", emote.listener);
  },

  unbind: function() {
    emote.client.removeListener("message", emote.message);
    emote.client.removeListener("message", emote.listener);
  }
};

module.exports = {
  load: function(core) {
    emote.core = core;
    emote.client = emote.core.client;
    emote.bind();
  },

  unload: function() {
    emote.unbind();
    delete emote;
  },

  commands: emote.commands
};
