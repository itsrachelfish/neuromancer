var core;
var request = require("request");

var eve = {
  commands: ["eve"],

  eve: function (from, to, message) {
    request("https://api.eveonline.com/server/ServerStatus.xml.aspx/", function (e, r, b) {
      if (b.match(/True/i)) {
        core.say(from, to, "Server is up");
      } else {
        core.say(from, to, "Server is down");
      }
    });
  }
};

module.exports = {
  load: function (_core) {
    core = _core;
  },

  unload: function () {
    delete eve;
    delete core;
  },

  commands: eve.commands,
  run: function (command, from, to, message) {
    eve[command](from, to, message);
  }
};
