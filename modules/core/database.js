var fs = require("fs");

var database = {
  core: false,
  
  read_db: function(db) {
    var path = "./db/" + db + ".db";
    fs.readFile(path, function(err, data) {
      if (err) {
        console.error("[ERROR][db]: ".red + db + " database could not be read.");
        console.error(path);
        console.error(err);
        console.error("[ERROR][db]: ".red + "the database should be created automatically if it doesn't exist");
        return;
      }
      
      if (data != "undefined") {
        database.core.databases[db] = JSON.parse(data, "utf8");
        console.log("[db]: ".blue + db + " database loaded.");
      } else {
        database.core.databases[db] = {};
        console.log("[db]: ".blue + db + " database was empty, init'ing");
      }
    });
  },

  write_db: function(db) {
    var path = "./db/" + db + ".db";
    fs.writeFile(path, JSON.stringify(database.core.databases[db]), "utf8", function(err) {
      if (err) {
        console.error("[ERROR][db]: ".red + db + " database could not be written.");
        console.error(path);
        console.error(err);
        return;
      }
      console.log("[db]: ".blue + db + " database saved.");
    });
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