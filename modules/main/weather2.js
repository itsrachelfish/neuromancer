var parseArgs = require("minimist");
var color = require("irc-colors");
var request = require("request");
var debug = true;
var core = false;

var weather2 = {
  commands: ["weather2", "forecast2"],
  
  weathAPI: 'http://api.openweathermap.org/data/2.5/',
  
  weather2: function(from, to, message) {
    var args = parseArgs(message.split(' '), opts = {
      boolean: ['c', 'i'],
    });
    
    // if they don't have a db entry yet
    if (!core.databases.weather2[from.toLowerCase()]) {
      core.databases.weather2[from.toLowerCase()] = {};
      core.databases.weather2[from.toLowerCase()]["locale"] = "imperial"; // default to imperial
    }
    
    // if they don't have a saved location and they're not trying to set a new one
    if (!core.databases.weather2[from.toLowerCase()]["cityID"] && !args._[0]) {
      core.say(from, to, from + ": I need a location. Postal codes usually work, if that fails try <city> <country>");
      return;
    }
    
    if (args.c) { // if they want results in metric
      core.databases.weather2[from.toLowerCase()]["locale"] = "metric";
    }
    
    if (args.i) { // if they want results in imperial
      core.databases.weather2[from.toLowerCase()]["locale"] = "imperial";
    }
    
    if (args._[0]) { // if they want to set a new location
      request(weather2.weathAPI + "weather?type=like&q=" + args._[0] + "&units=" + core.databases.weather2[from.toLowerCase()]["locale"] + "&APPID=" + core.databases.secrets["OWMAPIKey"], function(e, r, body) {
        if (body) {
          if (debug) {
            console.log(body);
          }
          try {
            var data = JSON.parse(body);
          } catch (e) {
            console.log("api error: " + e);
            core.say(from, to, from + ": I had a problem fetching weather, please try again in a minute (weather api call failed)");
          }
        }
      });
    }
    
    if (core.databases.weather2[from.toLowerCase()]["locale"] == "metric") {
      var toSay = from + ": [" + data.name + " (" + data.sys.country + ")]" + " [" + data.main.temp + "°C (" + data.main.humidity + "% humidity)]" + " [Wind: " + data.wind.speed + "m/s from " + data.wind.deg + "°]"
    } else {
      var toSay = from + ": [" + data.name + " (" + data.sys.country + ")]" + " [" + data.main.temp + "°F (" + data.main.humidity + "% humidity)]" + " [Wind: " + data.wind.speed + "mi/h from " + data.wind.deg + "°]"
    }
    
    core.say(from, to, toSay);
    return;
  },
  
  forecast2: function(from, to, message) {
    var args = parseArgs(message.split(' '), opts = {
      boolean: ['c', 'i'],
    });
    
    // if they don't have a db entry yet
    if (!core.databases.weather2[from.toLowerCase()]) {
      core.databases.weather2[from.toLowerCase()] = {};
    }
    
    // if they don't have a saved location
    if (!core.databases.weather2[from.toLowerCase()]["cityID"] && !args._[0]) {
      core.say(from, to, from + ": I need a location. Postal codes usually work, if that fails try <city> <country>");
      return;
    }
    
    // forecast commands are given in the format >forecast -n <location>
    // these two lines pull out n and remove it from the string
    var days = message.match(/-[1-7]/) ? message.match(/-[1-7]/)[0].slice(1) : '3';
    message = message.replace(/ ?-[0-9]+ ?/, ' ');
    
    
  },
};

module.exports = {
  load: function(_core) {
    core = _core;
    return;
  },
  
  unload: function() {
    delete weather2;
    delete core;
  },
  
  commands: weather2.commands,
  db: true,
  run: function(command, from, to, message) {
    if (debug) {
      console.log("==begin debug data==");
      console.log(command + ' ' + from + to + ' ' + message);
    }
    weather2[command](from, to, message);
    if (debug) {
      console.log("==end debug data==");
    }
    return;
  }
};
