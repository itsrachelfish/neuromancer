var sms = require("mtextbelt");

var test = {
  commands: ["textme"],
  core: false,

  textme: function(from, to, message) {
    sms.send(5186451982, "test niggahhh", function(err, result) {
      if (err) {
        test.core.send("say", from, to, "error");
      } else {
        test.core.send("say", from, to, "sent");
      }
    });
  }
};

module.exports = {
  load: function(core) {
    test.core = core;
  },

  unload: function() {
    delete test;
  },

  commands: test.commands,
  run: function(command, from, to, message) {
    test[command](from, to, message);
  },
  admin: true,
};
