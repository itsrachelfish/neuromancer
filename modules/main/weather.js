var reload = require('require-reload')(require);
var parseArgs = require("minimist");
var irc = require("irc"); // only used for colors.wrap
var request = require("request");

var config;

var core;

var debug = false;

var weather = {
  commands: ["weather", "forecast"],

  weathAPI: 'http://api.openweathermap.org/data/2.5/',

  weather: function (from, to, message) {
    var args = parseArgs(message.split(' '), opts = {
      boolean: ['c', 'i', 'z']
    });

    // if they don't have a db entry yet
    if (!core.databases.weather[from.toLowerCase()]) {
      core.databases.weather[from.toLowerCase()] = {};
      core.databases.weather[from.toLowerCase()].locale = "imperial"; // default to imperial
    }

    // if they don't have a saved location and they're not trying to set a new one
    if (!core.databases.weather[from.toLowerCase()].cityID && !args._[0]) {
      core.say(from, to, from + ": I need a location. By default I search by name, add -z to search by zipcode");
      return;
    }

    if (args.c) { // if they want results in metric
      core.databases.weather[from.toLowerCase()].locale = "metric";
    }

    if (args.i) { // if they want results in imperial
      core.databases.weather[from.toLowerCase()].locale = "imperial";
    }

    var url = (weather.weathAPI + (args._[0] ? (args.z ? "weather?zip=" + args._ : "weather?type=like&q=" + args._) : ("weather?id=" + core.databases.weather[from.toLowerCase()].cityID)) + "&units=" + core.databases.weather[from.toLowerCase()].locale + "&APPID=" + config.apiKey);

    if (debug) {
      console.log(url);
    }

    // nested ternary operators fuck yeah
    request(url, function (e, r, body) {
      if (body) {
        if (debug) {
          console.log(body);
        }
        try {
          var data = JSON.parse(body);
          var metric = (core.databases.weather[from.toLowerCase()].locale == "metric") ? true : false;

          var toSay = [ // some of these got pretty ugly. fight me
              from + ":",
              '[' + irc.colors.wrap('cyan', data.name) + " (" + irc.colors.wrap('cyan', data.sys.country) + ')]',
              '[' + ((metric) ? irc.colors.wrap('dark_red', Math.round(Number(data.main.temp))) + "°C" : irc.colors.wrap('dark_red', Math.round(Number(data.main.temp))) + "°F") + ']',
              '[' + irc.colors.wrap('dark_green', Number(data.main.humidity)) + '% humidity]',
              '[Wind: ' + ((metric) ? irc.colors.wrap("orange", Math.round(Number(data.wind.speed))) + "m/s" : irc.colors.wrap("orange", Math.round(Number(data.wind.speed))) + "m/h") + ']',
              '[' + irc.colors.wrap("magenta", data.weather[0].description) + ']'
            ];
          core.say(from, to, toSay.join(' '));
          core.databases.weather[from.toLowerCase()].cityID = data.id;
          core.write_db("weather");
          return;
        } catch (err) {
          console.log("api error: " + err);
          core.say(from, to, from + ": I had a problem fetching weather, please try again in a minute");
        }
      }
    });
    return;
  },

  displayRow: function (row, from, to) {
    var d = new Date(Number(row.dt) * 1000);
    var day = d.toDateString().split(' ')[0]; // dirty as fuck but whatever
    var metric = (core.databases.weather[from.toLowerCase()].locale == "metric") ? true : false;

    var toSay = [
      day + ":",
      '[' + ((metric) ? irc.colors.wrap('dark_blue', Math.round(Number(row.temp.min))) + " - " + irc.colors.wrap('dark_red', Math.round(Number(row.temp.max))) + "°C]" : irc.colors.wrap('dark_blue', Math.round(Number(row.temp.min))) + " - " + irc.colors.wrap('dark_red', Math.round(Number(row.temp.max))) + "°F]"),
      '[' + irc.colors.wrap('dark_green', Math.round(Number(row.humidity))) + "% humidity]",
      '[' + ((metric) ? (irc.colors.wrap("orange", Math.round(Number(row.speed))) + "m/s wind]") : (irc.colors.wrap("orange", Math.round(Number(row.speed))) + "m/h wind]")),
      '[' + irc.colors.wrap("magenta", row.weather[0].description) + ']',
    ];

    core.say(from, to, toSay.join(' '));
  },

  forecast: function (from, to, message) {
    var args = parseArgs(message.split(' '), opts = {
      boolean: ['c', 'i', 'z']
    });

    // if they don't have a db entry yet
    if (!core.databases.weather[from.toLowerCase()]) {
      core.databases.weather[from.toLowerCase()] = {};
      core.databases.weather[from.toLowerCase()].locale = "imperial"; // default to imperial
    }

    // if they don't have a saved location and they're not trying to set a new one
    if (!core.databases.weather[from.toLowerCase()].cityID && !args._[0]) {
      core.say(from, to, from + ": I need a location. Postal codes usually work, if that fails try <city> <country>");
      return;
    }

    if (args.c) { // if they want results in metric
      core.databases.weather[from.toLowerCase()].locale = "metric";
    }

    if (args.i) { // if they want results in imperial
      core.databases.weather[from.toLowerCase()].locale = "imperial";
    }

    // forecast commands are given in the format >forecast -n <location>
    // these two lines pull out n and remove it from the string
    var days = message.match(/-[1-7]/) ? message.match(/-[1-7]/)[0].slice(1) : '3';
    message = message.replace(/ ?-[0-9]+ ?/, ' ');
    days = Number(days) + 1;

    var url = (weather.weathAPI + (args._[0] ? (args.z ? "forecast/daily?zip=" + args._ : "forecast/daily?type=like&q=" + args._) : ("forecast/daily?id=" + core.databases.weather[from.toLowerCase()].cityID)) + "&units=" + core.databases.weather[from.toLowerCase()].locale + "&cnt=" + days + "&APPID=" + config.apiKey);
    if (debug) {
      console.log(url)
      console.log(JSON.stringify(args))
    }

    // nested ternary operators fuck yeah
    request(url, function (e, r, body) {
      if (body) {
        if (debug) {
          console.log(body);
        }
        try {
          var data = JSON.parse(body);
          if (debug) {
            console.log(data.list[0].dt);
            console.log(data.list[0].temp.min);
            console.log(data.list[0].weather[0].description);
          }
          core.say(from, to, "Forecast for " + data.city.name + ' (' + data.city.country + ')');

          for (var i = 1, l = data.list.length; i < l; i++) {
            weather.displayRow(data.list[i], from, to);
          }

          core.databases.weather[from.toLowerCase()].cityID = data.city.id;
          core.write_db("weather");
          return;

        } catch (err) {
          console.log("api error: " + err);
          core.say(from, to, from + ": I had a problem fetching weather, please try again in a minute.");
        }

      }
      return;
    });
  },
};

module.exports = {
  load: function (_core) {
    core = _core;
    config = reload("../../etc/weather.js");
  },

  unload: function () {
    delete weather;
    delete core;
    delete reload;
    delete config;
  },

  commands: weather.commands,
  db: true,
  run: function (command, from, to, message) {
    weather[command](from, to, message);
    return;
  }
};
