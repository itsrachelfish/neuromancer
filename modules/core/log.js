var fs = require("fs");

var config;

var core;

var debug = false;

var log = {
  commands: ["show_log"],

  read_log: function (sublog, callback) {
    var path = "./log/" + sublog + ".json";
    fs.readFile(path, function (err, data) {
      if (err) {
        console.error("[ERROR][log]: ".red + sublog + " log could not be read.");
        console.error(path);
        console.error(err);
        core.logs[sublog] = {};
        log.write_log(sublog);
        console.error("[ERROR][log]: ".red + "the log has been init'ed");
        if (callback) {
          callback(true);
        }
        return;
      }

      if (data != "undefined") {
        core.logs[sublog] = JSON.parse(data, "utf8");
        console.log("[log]: ".blue + sublog + " log loaded.");
      } else {
        core.logs[sublog] = {};
        log.write_log(sublog);
        console.log("[log]: ".blue + sublog + " log was empty, init'ing");
      }
      if (callback) {
        callback(false);
      }
    });
  },

  write_log: function (sublog, callback) {
    var path = "./log/" + sublog + ".json";
    fs.writeFile(path, JSON.stringify(core.logs[sublog]), "utf8", function (err) {
      if (err) {
        console.error("[ERROR][log]: ".red + sublog + " log could not be written.");
        console.error(path);
        console.error(err);
        if (callback) {
          callback(true);
        }
        return;
      }
      console.log("[log]: ".blue + sublog + " log saved.");
    });
    if (callback) {
      callback(false);
    }
  },

  show_log: function (from, to, message) {
    if (message) {
      core.say(from, to, JSON.stringify(core.logs[message]));
    } else {
      core.say(from, to, JSON.stringify(core.logs));
    }
  },
};

module.exports = {
  load: function (_core) {
    core = _core;
    core.mread_log = log.read_log;
    core.mwrite_log = log.write_log;
  },

  unload: function () {
    core.mread_log = false;
    core.mwrite_log = false;
    delete log;
  },

  commands: log.commands,
  run: function (command, from, to, message) {
    log[command](from, to, message);
  },
  admin: true,
};
