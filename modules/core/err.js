var colors = require("colors");
var config = require("../../etc/err.js");
var debug = false;

var err = {
  core: false,

  err: function(error) {
    if (typeof err.core.logs.err[error.type] == "undefined") {
      err.core.logs.err[error.type] = [];
    }

    err.core.logs.err[error.type].push(error);
    if (debug) {
      console.log(JSON.stringify(error));
      console.log(JSON.stringify(err.core.logs.err));
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
    err.core.write_log("err");
  },
};

module.exports = {
  load: function(core) {
    err.core = core;
    err.core.merr = err.err;
  },

  unload: function() {
    err.core.merr = false;
    delete err;
  },
  log: true,
};
