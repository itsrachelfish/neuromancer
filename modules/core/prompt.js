var readline = require('readline');

var prompt = {
  readline: false,
  client: false,
  core: false,

  commands: ["say", "join", "part", "ctcp", "load", "unload", "reload"],

  handle: function(line) {
    var line = line.split(' ');
    var action = line.shift();
    var command = line.join(' ');

    if (action && command) {
      if (prompt.commands.indexOf(action) > -1) {
        prompt[action](command);
      } else {
        console.log("Invalid action: " + action);
      }
    } else {
      console.log("No command specified");
    }
  },

  // TODO: improve this/move into core
  parse_module: function(module) {
    module = module.split('.');
    if (module[0] == 'core')
      return {
        type: 'core',
        name: module[1]
      };
    else if (module[0] == 'main')
      return {
        type: 'main',
        name: module[1]
      };
    else
      return {
        type: 'main',
        name: module[0]
      };
  },

  // Send a message to the main channel
  // TODO: improve this
  say: function(message) {
    prompt.client.say(prompt.core.server.channels[0], message);
  },

  join: function(message) {
    prompt.core.client.join(message, function() {
      console.log("[client]: ".yellow + "joined channel: " + message);
    });
  },

  part: function(message) {
    prompt.core.client.part(message, "bye", function() {
      console.log("[client]: ".yellow + "left channel: " + message);
    });
  },
  
  // Send a CTCP message
  ctcp: function(message) {
    message = message.split(' ');
    var target = message.shift();
    var type = message.shift();
    message = message.join(' ');

    prompt.client.ctcp(target, type, message);
  },

  // Load a module
  load: function(module) {
    module = prompt.parse_module(module);
    prompt.core.load(module);
  },

  // Unload a module
  unload: function(module) {
    module = prompt.parse_module(module);
    prompt.core.unload(module);
  },

  // Reload a module
  reload: function(module) {
    module = prompt.parse_module(module);
    prompt.core.reload(module);
  },
  
};

module.exports = {
  load: function(core) {
    prompt.core = core;
    prompt.client = prompt.core.client;

    prompt.readline = readline.createInterface(process.stdin, process.stdout);

    prompt.readline.on("line", function(line) {
      prompt.handle(line);
    });
  },

  unload: function() {
    prompt.readline.close();

    delete readline;
    delete prompt;
  }
}
