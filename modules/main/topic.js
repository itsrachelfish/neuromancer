var core;

var topic = {
  commands: ['topic'],
  actions: ['log', 'restore', 'replace', 'set', 'append', 'prepend', 'insert', 'delete'],

  user: false,

  // Helper function to parse topic sections
  parse: function(text) {
    var sections = [];
    var pattern = /\[([^\[\]]+)\]/g;
    var match;

    while (match = pattern.exec(text)) {
      sections.push(match[1].replace(/^[\s\u000f]+|[\s\u000f]+$/g, ''));
    }

    return sections;
  },

  // Helper function to build topic strings
  build: function(sections) {
    var output = [];

    for (var i = 0, l = sections.length; i < l; i++) {
      // Remove brackets and extra whitespace from new sections
      var section = sections[i].replace(/[\[\]]/g, "");
      section = section.trim();

      // Make sure there's still something left
      if (section.length)
      // if you want to remove the extra whitespace, remove the spaces below
        output.push('[ ' + section + '\u000f ]');
    }

    return output.join(' ');
  },

  // listens for topic changes
  listener: function(channel, message, set_by) {
    if (typeof core.logs.topic[channel] == "undefined") {
      core.logs.topic[channel] = [];
    }

    if (core.logs.topic[channel].length) {
      var index = core.logs.topic[channel].length - 1
      var last = core.logs.topic[channel][index];

      // Don't push duplicate topics to the list
      if (message == last.message && set_by == last.set_by) {
        return;
      }
    }

    var new_topic = {
      date: new Date(),
      message: message,
      set_by: set_by
    };

    if (set_by == core.server.name && topic.user) {
      new_topic.requested_by = topic.user;
      topic.user = false;
    }
    core.logs.topic[channel].push(new_topic);
    core.write_log("topic")
  },

  log: function(from, channel, message) {
    // Make sure this command has a valid channel
    if (channel.indexOf('#') != 0) {
      topic.client.say(from, "You must use :topic log in a channel, or use :topic log [channel].");
      return;
    }

    if (typeof core.logs.topic[channel] == "undefined") {
      core.client.say(from, "No topic log exists for " + channel);
      return;
    }

    var count = parseInt(message);

    // Allow users to specify how many topics they want to see (maximum 50), defaulting to -3
    if (!count || count < 1 || count > 50)
      count = -3;
    else
      count *= -1;

    var most_recent = core.logs.topic[channel].slice(count);

    for (var i = 0, l = most_recent.length; i < l; i++) {
      var recent = most_recent[i];
      var index = core.logs.topic[channel].indexOf(recent);

      if (typeof recent.requested_by != "undefined")
        recent.user = recent.requested_by;
      else
        recent.user = recent.set_by.split('!')[0];

      core.client.say(from, recent.user + " set " + channel + "'s topic to " + recent.message + "\u000f [#" + index + "]");
    }
  },

  restore: function(from, channel, message) {
    // Make sure this command has a valid channel
    if (channel.indexOf('#') != 0) {
      core.client.say(from, "You must use :topic restore in a channel, or use :topic restore [channel].");
      return;
    }

    if (typeof core.logs.topic[channel] == "undefined") {
      core.client.say(from, "No topic log exists for " + channel);
      return;
    }

    var index = parseInt(message);

    // If an invalid topic ID is passed (or no topic ID at all)
    if (typeof core.logs.topic[channel][index] == "undefined") {
      // Use most recent topic before the current
      index = core.logs.topic[channel].length - 2;
    }

    topic.user = from;
    var new_topic = core.logs.topic[channel][index].message;
    core.client.send('topic', channel, new_topic);
  },

  replace: function(from, channel, message) {
    // Make sure this command has a valid channel
    if (channel.indexOf('#') != 0) {
      core.client.say(from, "You must use :topic replace in a channel, or use :topic replace [channel].");
      return;
    }

    if (typeof core.logs.topic[channel] == "undefined") {
      core.client.say(from, "No topic log exists for " + channel);
      return;
    }

    var index = core.logs.topic[channel].length - 1;
    var last = core.logs.topic[channel][index];
    var sections = topic.parse(last.message);

    message = message.split(" ");
    var section = parseInt(message.shift()) - 1;

    // Does the requested section even exist?
    if (typeof sections[section] == "undefined") {
      // If not, create a new section
      section = sections.length;
    }

    // Rebuild the user message
    message = message.join(" ");
    sections[section] = message;

    // Set the new topic
    topic.user = from;
    core.client.send('TOPIC', channel, topic.build(sections));
  },

  set: function(from, channel, message) {
    // Make sure this command has a valid channel
    if (channel.indexOf('#') != 0) {
      core.client.say(from, "You must use :topic set in a channel, or use :topic set [channel].");
      return;
    }

    var delimiter = "|";
    message = message.split(" ");

    // Nothing to do
    if (!message.length)
      return;

    // If a custom delimiter is set
    if (message[0].length == 1 && message[0].match(/[^a-z0-9]/i)) {
      // Shift it off the array
      delimiter = message.shift();
    }

    message = message.join(" ");
    sections = message.split(delimiter);

    topic.user = from;
    core.client.send('TOPIC', channel, topic.build(sections));
  },

  append: function(from, channel, message) {
    // Make sure this command has a valid channel
    if (channel.indexOf('#') != 0) {
      core.client.say(from, "You must use :topic append in a channel, or use :topic append [channel].");
      return;
    }

    if (typeof core.logs.topic[channel] == "undefined") {
      core.client.say(from, "No topic log exists for " + channel);
      return;
    }

    var index = core.logs.topic[channel].length - 1;
    var last = core.logs.topic[channel][index];
    var sections = topic.parse(last.message);

    var delimiter = "|";
    message = message.split(" ");

    // Nothing to do
    if (!message.length)
      return;

    // If a custom delimiter is set
    if (message[0].length == 1 && message[0].match(/[^a-z0-9]/i)) {
      // Shift it off the array
      delimiter = message.shift();
    }

    message = message.join(" ");
    sections = sections.concat(message.split(delimiter));

    topic.user = from;
    core.client.send('TOPIC', channel, topic.build(sections));
  },

  prepend: function(from, channel, message) {
    // Make sure this command has a valid channel
    if (channel.indexOf('#') != 0) {
      core.client.say(from, "You must use :topic prepend in a channel, or use :topic prepend [channel].");
      return;
    }

    if (typeof core.logs.topic[channel] == "undefined") {
      core.client.say(from, "No topic log exists for " + channel);
      return;
    }

    var index = core.logs.topic[channel].length - 1;
    var last = core.logs.topic[channel][index];
    var sections = topic.parse(last.message);
    var first = sections.shift();

    var delimiter = "|";
    message = message.split(" ");

    // Nothing to do
    if (!message.length)
      return;

    // If a custom delimiter is set
    if (message[0].length == 1 && message[0].match(/[^a-z0-9]/i)) {
      // Shift it off the array
      delimiter = message.shift();
    }

    message = message.join(" ");
    sections = message.split(delimiter).concat(sections);

    // Restore the first topic section
    sections.unshift(first);

    topic.user = from;
    core.client.send('TOPIC', channel, topic.build(sections));
  },

  insert: function(from, channel, message) {
    // Make sure this command has a valid channel
    if (channel.indexOf('#') != 0) {
      core.client.say(from, "You must use :topic insert in a channel, or use :topic insert [channel].");
      return;
    }

    if (typeof core.logs.topic[channel] == "undefined") {
      core.client.say(from, "No topic log exists for " + channel);
      return;
    }

    var index = core.logs.topic[channel].length - 1;
    var last = core.logs.topic[channel][index];
    var sections = topic.parse(last.message);

    var delimiter = "|";
    message = message.split(" ");

    // Nothing to do
    if (!message.length)
      return;

    var index = parseInt(message.shift()) - 1;

    // Can't insert somewhere that doesn't exist
    if (!index || index < 1 || index + 1 > sections.length)
      return;

    // If a custom delimiter is set
    if (message[0].length == 1 && message[0].match(/[^a-z0-9]/i)) {
      // Shift it off the array
      delimiter = message.shift();
    }

    message = message.join(" ");

    // Wow javascript
    Array.prototype.splice.apply(sections, [index, 0].concat(message.split(delimiter)));

    topic.user = from;
    core.client.send('TOPIC', channel, topic.build(sections));
  },

  delete: function(from, channel, message) {
    // Make sure this command has a valid channel
    if (channel.indexOf('#') != 0) {
      core.client.say(from, "You must use :topic delete in a channel, or use :topic delete [channel].");
      return;
    }

    if (typeof core.logs.topic[channel] == "undefined") {
      core.client.say(from, "No topic log exists for " + channel);
      return;
    }

    message = message.split(" ");

    var lastIndex = core.logs.topic[channel].length - 1;
    var last = core.logs.topic[channel][lastIndex];
    var sections = topic.parse(last.message);

    var index = parseInt(message[0]) - 1;
    var length = parseInt(message[1]);

    // Can't delete something that doesn't exist
    if (!index || index < 1 || index + 1 > sections.length)
      return;

    if (!length || length < 1)
      length = 1;

    sections.splice(index, length);

    topic.user = from;
    core.client.send('TOPIC', channel, topic.build(sections));
  },
};

module.exports = {
  load: function(_core) {
    core = _core;
    core.client.addListener("topic", topic.listener);
  },

  unload: function() {
    core.client.removeListener("topic", topic.listener);
    delete topic;
    delete core;
  },

  commands: topic.commands,
  log: true,
  run: function(command, from, to, message) {
    message = message.split(' ');
    var action = message.shift();
    if (command == 'topic' && topic.actions.indexOf(action) > -1) {
      // Check if a channel is specified in the command
      // Make sure the length is > 1, otherwise this might be a delimiter!
      if (message[0] && message[0].indexOf('#') == 0 && message[0].length > 1) {
        to = message.shift();
      }
      message = message.join(' ');
      topic[action](from, to, message);
    }
  },
};
