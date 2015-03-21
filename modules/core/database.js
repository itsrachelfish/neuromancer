var fs = require("fs");

var database = {
  core: false,

  read_db: function(db, callback) {
    var path = "./db/" + db + ".db";
    fs.readFile(path, function(err, data) {
      if (err) {
        console.error("[ERROR][db]: ".red + db + " database could not be read.");
        console.error(path);
        console.error(err);
        database.core.databases[db] = {};
        database.write_db(db);
        console.error("[ERROR][db]: ".red + "the database has been init'ed");
        if (callback) {
          callback();
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
        callback();
      }
    });
  },

  write_db: function(db, callback) {
    var path = "./db/" + db + ".db";
    fs.writeFile(path, JSON.stringify(database.core.databases[db]), "utf8", function(err) {
      if (err) {
        console.error("[ERROR][db]: ".red + db + " database could not be written.");
        console.error(path);
        console.error(err);
        if (callback) {
          callback();
        }
        return;
      }
      console.log("[db]: ".blue + db + " database saved.");
    });
    if (callback) {
      callback();
    }
  },
};

module.exports = {
  load: function(core) {
    database.core = core;
    database.core.read_db = database.read_db;
    database.core.write_db = database.write_db;
  },

  unload: function() {
    database.core.read_db = false;
    database.core.write_db = false;
    delete database;
  },
};
