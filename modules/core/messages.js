var core = false;

var messages = {
  client: false,

  send: function(type, from, to, message) {
    //determine if it's a channel message or a privmessage
    if (to.charAt(0) == '#') {
      core.client[type](to, message);
    } else {
      core.client[type](from, message);
    }
  },

  say: function(from, to, message) {
    messages.send("say", from, to, message);
  },

  recieve: function(module_id, from, to, text, details) {
    var userhost = details.user + '@' + details.host;
    // if the command is prefixed with our command prefix
//<<<<<<< HEAD
//<<<<<<< HEAD
  //  if (text.slice(0, core.config.prefix.length) === core.config.prefix) {
    //  var command = text.slice(core.config.prefx.length).split(' ')[0];
      //text = text.slice(core.config.prefix.length).split(' ').slice(1).join(' ');
//=======
    if (text.charAt(0) == core.config.prefix) {
      text = text.substr(1);
      text = text.split(' ');

      var command = text.shift();
//>>>>>>> parent of 44fac95... commiting without testing, hopefully the sun doesn't blow up
//=======
    //if (text.slice(0, core.config.prefix.length) === core.config.prefix) {
      //var command = text.slice(core.config.prefx.length).split(' ')[0];
	//text = text.slice(core.config.prefix.length).split(' ').slice(1).join(' ');
	
    //if (text.charAt(0) == core.config.prefix) {
  //    text = text.substr(1);
//      text = text.split(' ');
//>>>>>>> c87023be2035dbfeb63001605e8e8481c175487f

  //    var command = text.shift();
      // If the module is loaded and the command is valid
      if (typeof core.loaded[module_id] != "undefined" && core.loaded[module_id].commands.indexOf(command) > -1) {

        // if the ignore module is loaded
        if (core.loaded["main/ignore"]) {
          var ignore = false;
          if (core.databases.ignore[from.toLowerCase()]) {
            core.databases.ignore[from.toLowerCase()].forEach(function(entry, index, object) {
              if (entry == module_id.split('/')[1]) {
                console.log("[ignore]:".yellow + " ignored command '" + command + ' ' + text.join(' ') + "' from '" + from + "'");
                ignore = true;
              }
            });
          }
          if (ignore) {
            return;
          }
        }

        // if it's an admin-only module and the user is a non-admin
        if (core.loaded[module_id].admin && userhost != core.config.owner) {
          return;
        }

        // run the command
        text = text.join(' ');
        core.loaded[module_id].run(command, from, to, text);
      }
    }
  },
};

module.exports = {
  load: function(_core) {
    core = _core;
    core.msend = messages.send;
    core.mrecieve = messages.recieve;
    core.msay = messages.say;
  },

  unload: function() {
    core.msend = false;
    core.mrecieve = false;
    core.msay = false;
    delete messages;
    delete core;
  },
};
