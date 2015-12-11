var reload = require('require-reload')(require);
var colors = require("colors");

var config;

var core;

var debug = false;

var err = {
  err: function (error) {
    if (typeof core.logs.err[error.type] == "undefined") {
      core.logs.err[error.type] = [];
    }

    core.logs.err[error.type].push(error);
    if (debug) {
      console.log(JSON.stringify(error));
      console.log(JSON.stringify(core.logs.err));
    }
    if (config.toConsole) {
      console.error(("[ERROR][" + error.type + "] ").red + error.title);
      if (error.text) {
        console.error("[ERROR] ".red + error.text);
      }
    }

    if (config.toPrivMsg) {
      // pm the error to the bot owner
      core.say(core.server.name, core.config.ownerNick, "[ERROR][" + error.type + "] " + error.title);

      if (error.text) {
        core.say(core.server.name, core.config.ownerNick, "[ERROR] " + error.text);
      }
    }
    core.write_log("err");
  }
};

module.exports = {
  load: function (_core) {
    config = reload("../../etc/err.js");
    core = _core;
    core.merr = err.err;
  },

  unload: function () {
    core.merr = false;
    delete err;
    delete core;
    delete reload;
    delete config;
    delete colors;
  },

  log: true,
};
