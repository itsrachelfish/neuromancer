var fs = require("fs");

var database = {
  core: false,
  commands: ["show_db"],

  read_db: function(db, callback) {
    var path = "./db/" + db + ".json";
    fs.readFile(path, function(err, data) {
      if (err) {
        console.error("[ERROR][db]: ".red + db + " database could not be read.");
        console.error(path);
        console.error(err);
        database.core.databases[db] = {};
        database.write_db(db);
        console.error("[ERROR][db]: ".red + "the database has been init'ed");
        if (callback) {
          callback(true);
        }
        return;
      }

      if (data != "undefined") {
        database.core.databases[db] = JSON.parse(data, "utf8");
        console.log("[db]: ".blue + db + " database loaded.");
      } else {
        database.core.databases[db] = {};
        console.log("[db]: ".blue + db + " database was empty, init'ing");
      }
      if (callback) {
        callback(false);
      }
    });
  },

  write_db: function(db, callback) {
    var path = "./db/" + db + ".json";
    fs.writeFile(path, JSON.stringify(database.core.databases[db]), "utf8", function(err) {
      if (err) {
        console.error("[ERROR][db]: ".red + db + " database could not be written.");
        console.error(path);
        console.error(err);
        if (callback) {
          callback(true);
        }
        return;
      }
      console.log("[db]: ".blue + db + " database saved.");
    });
    if (callback) {
      callback(false);
    }
  },

  show_db: function(from, to, message) {
    if (message) {
      database.core.say(from, to, JSON.stringify(database.core.databases[message]));
    } else {
      database.core.say(from, to, JSON.stringify(database.core.databases));
    }
  },
};

module.exports = {
  load: function(core) {
    database.core = core;
    database.core.mread_db = database.read_db;
    database.core.mwrite_db = database.write_db;
  },

  unload: function() {
    database.core.mread_db = false;
    database.core.mwrite_db = false;
    delete database;
  },

  commands: database.commands,
  run: function(command, from, to, message) {
    database[command](from, to, message);
  },
  admin: true,
};
