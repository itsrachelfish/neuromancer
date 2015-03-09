var fs = require("fs");

var log = {
  core: false,

  read_log: function(sublog) {
    var path = "./log/" + sublog + ".log";
    fs.readFile(path, function(err, data) {
      if (err) {
        console.error("[ERROR][log]: ".red + sublog + " log could not be read.");
        console.error(path);
        console.error(err);
        return;
      }
      if (data != "undefined") {
        log.core.logs[sublog] = JSON.parse(data, "utf8");
        console.log("[log]: ".blue + sublog + " log loaded.");
      } else {
        log.core.logs[sublog] = {};
        console.log("[log]: ".blue + sublog + " log was empty, init'ing");
      }
    });
  },

  write_log: function(sublog) {
    var path = "./log/" + sublog + ".log";
    fs.writeFile(path, JSON.stringify(log.core.logs[sublog]), "utf8", function(err) {
      if (err) {
        console.error("[ERROR][log]: ".red + sublog + " log could not be written.");
        console.error(path);
        console.error(err);
        return;
      }
      console.log("[log]: ".blue + sublog + " log saved.");
    });
  }
}

module.exports = {
  load: function(core) {
    log.core = core;
    log.core.read_log = log.read_log;
    log.core.write_log = log.write_log;
  },

  unload: function() {
    log.core.read_log = false;
    log.core.write_log = false;
    delete log;
  }
}
