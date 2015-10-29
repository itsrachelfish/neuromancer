var parseArgs = require("minimist");
var color = require("irc-colors");
var request = require("request");
var debug = true;
var core = false;

var weather2 = {
  commands: ["weather2", "forecast2"],

  weathAPI: 'http://api.openweathermap.org/data/2.5/',

  weather2: function (from, to, message) {
    var args = parseArgs(message.split(' '), opts = {
      boolean: ['c', 'i']
    });

    // if they don't have a db entry yet
    if (!core.databases.weather2[from.toLowerCase()]) {
      core.databases.weather2[from.toLowerCase()] = {};
      core.databases.weather2[from.toLowerCase()].locale = "imperial"; // default to imperial
    }

    // if they don't have a saved location and they're not trying to set a new one
    if (!core.databases.weather2[from.toLowerCase()].cityID && !args._[0]) {
      core.say(from, to, from + ": I need a location. Postal codes usually work, if that fails try <city> <country>");
      return;
    }

    if (args.c) { // if they want results in metric
      core.databases.weather2[from.toLowerCase()].locale = "metric";
    }

    if (args.i) { // if they want results in imperial
      core.databases.weather2[from.toLowerCase()].locale = "imperial";
    }

    if (args._[0]) { // if they want to set a new location
      request(weather2.weathAPI + "weather?type=like&q=" + args._[0] + "&units=" + core.databases.weather2[from.toLowerCase()].locale + "&APPID=" + core.databases.secrets["OWMAPIKey"], function (e, r, body) {
        if (body) {
          if (debug) {
            console.log(body);
          }
          try {
            var data = JSON.parse(body);
            if (core.databases.weather2[from.toLowerCase()].locale == "metric") {
              var toSay = from + ": [" + data.name + " (" + data.sys.country + ")]" + " [" + data.main.temp + "°C (" + data.main.humidity + "% humidity)]" + " [Wind: " + data.wind.speed + "m/s from " + data.wind.deg + "°]";
            } else {
              var toSay = from + ": [" + data.name + " (" + data.sys.country + ")]" + " [" + data.main.temp + "°F (" + data.main.humidity + "% humidity)]" + " [Wind: " + data.wind.speed + "mi/h from " + data.wind.deg + "°]";
            }

            core.say(from, to, toSay);
            core.databases.weather2[from.toLowerCase()].cityID = data.id;
            core.write_db("weather2");
            return;
          } catch (err) {
            console.log("api error: " + err);
            core.say(from, to, from + ": I had a problem fetching weather, please try again in a minute");
          }
        }
      });
      return;

    } else {
      request(weather2.weathAPI + "weather?id=" + core.databases.weather2[from.toLowerCase()].locale + "&units=" + core.databases.weather2[from.toLowerCase()].locale + "&APPID=" + core.databases.secrets["OWMAPIKey"], function (e, r, body) {
        if (body) {
          if (debug) {
            console.log(body);
          }
          try {
            var data = JSON.parse(body);
            if (core.databases.weather2[from.toLowerCase()].locale == "metric") {
              var toSay = from + ": [" + data.name + " (" + data.sys.country + ")]" + " [" + data.main.temp + "°C (" + data.main.humidity + "% humidity)]" + " [Wind: " + data.wind.speed + "m/s from " + data.wind.deg + "°]";
            } else {
              var toSay = from + ": [" + data.name + " (" + data.sys.country + ")]" + " [" + data.main.temp + "°F (" + data.main.humidity + "% humidity)]" + " [Wind: " + data.wind.speed + "mi/h from " + data.wind.deg + "°]";
            }

            core.say(from, to, toSay);
            return;
          } catch (err) {
            console.log("api error: " + err);
            core.say(from, to, from + ": I had a problem fetching weather, please try again in a minute.");
          }
        }
      });
      return;
    }

  },

  forecast2: function (from, to, message) {
    var args = parseArgs(message.split(' '), opts = {
      boolean: ['c', 'i']
    });

    // if they don't have a db entry yet
    if (!core.databases.weather2[from.toLowerCase()]) {
      core.databases.weather2[from.toLowerCase()] = {};
      core.databases.weather2[from.toLowerCase()].locale = "imperial"; // default to imperial
    }

    // if they don't have a saved location and they're not trying to set a new one
    if (!core.databases.weather2[from.toLowerCase()].cityID && !args._[0]) {
      core.say(from, to, from + ": I need a location. Postal codes usually work, if that fails try <city> <country>");
      return;
    }

    if (args.c) { // if they want results in metric
      core.databases.weather2[from.toLowerCase()].locale = "metric";
    }

    if (args.i) { // if they want results in imperial
      core.databases.weather2[from.toLowerCase()].locale = "imperial";
    }

    // forecast commands are given in the format >forecast -n <location>
    // these two lines pull out n and remove it from the string
    var days = message.match(/-[1-7]/) ? message.match(/-[1-7]/)[0].slice(1) : '3';
    message = message.replace(/ ?-[0-9]+ ?/, ' ');
    days = Number(days) + 1;

    if (args._[0]) { // if they want to set a new location
      request(weather2.weathAPI + "forecast/daily?type=like&q=" + args._[0] + "&units=" + core.databases.weather2[from.toLowerCase()].locale + "&cnt=" + days + "&APPID=" + core.databases.secrets["OWMAPIKey"], function (e, r, body) {
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
            if (core.databases.weather2[from.toLowerCase()].locale == "metric") { // if they're metric
              for (var i = 1; i < data.list.length; i++) {
                var d = new Date(Number(data.list[i].dt) * 1000);
                var day = d.toDateString().split(' ')[0]; // dirty as fuck but whatever
                var toSay = day + ": ";
                toSay += data.list[i].temp.min + "°C - " + data.list[i].temp.max + ' ';
                toSay += data.list[i].humidity + "% humidity ";
                toSay += data.list[i].speed + "m/s wind ";
                toSay += '(' + data.list[i].weather[0].description + ')';
                core.say(from, to, toSay);
              }
            } else { // or standard
              for (var i = 1; i < data.list.length; i++) {
                var d = new Date(Number(data.list[i].dt) * 1000);
                var day = d.toDateString().split(' ')[0]; // dirty as fuck but whatever
                var toSay = day + ": ";
                toSay += data.list[i].temp.min + "°F - " + data.list[i].temp.max + ' ';
                toSay += data.list[i].humidity + "% humidity ";
                toSay += data.list[i].speed + "m/h wind ";
                toSay += '(' + data.list[i].weather[0].description + ')';
                core.say(from, to, toSay);
              }

              core.databases.weather2[from.toLowerCase()].cityID = data.city.id;
              core.write_db("weather2");
              return;
            }
          } catch (err) {
            console.log("api error: " + err);
            core.say(from, to, from + ": I had a problem fetching weather, please try again in a minute.");
          }

        }
        return;
      });
    } else { // or using the saved location
      request(weather2.weathAPI + "forecast/daily?id=" + core.databases.weather2[from.toLowerCase()]["cityID"] + "&units=" + core.databases.weather2[from.toLowerCase()].locale + "&cnt=" + days + "&APPID=" + core.databases.secrets["OWMAPIKey"], function (e, r, body) {
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
            if (core.databases.weather2[from.toLowerCase()].locale == "metric") { // if they're metric
              for (var i = 1; i < data.list.length; i++) {
                var d = new Date(Number(data.list[i].dt) * 1000);
                var day = d.toDateString().split(' ')[0]; // dirty as fuck but whatever
                var toSay = day + ": ";
                toSay += data.list[i].temp.min + "°C - " + data.list[i].temp.max + ' ';
                toSay += data.list[i].humidity + "% humidity ";
                toSay += data.list[i].speed + "m/s wind ";
                toSay += '(' + data.list[i].weather[0].description + ')';
                core.say(from, to, toSay);
              }
            } else { // or standard
              for (var i = 1; i < data.list.length; i++) {
                var d = new Date(Number(data.list[i].dt) * 1000);
                var day = d.toDateString().split(' ')[0]; // dirty as fuck but whatever
                var toSay = day + ": ";
                toSay += data.list[i].temp.min + "°F - " + data.list[i].temp.max + ' ';
                toSay += data.list[i].humidity + "% humidity ";
                toSay += data.list[i].speed + "m/h wind ";
                toSay += '(' + data.list[i].weather[0].description + ')';
                core.say(from, to, toSay);
              }
              return;
            }
          } catch (err) {
            console.log("api error: " + err);
            core.say(from, to, from + ": I had a problem fetching weather, please try again in a minute.");
          }
        }
        return;
      });
    }
  },
};

module.exports = {
  load: function (_core) {
    core = _core;
    return;
  },

  unload: function () {
    delete weather2;
    delete core;
  },

  commands: weather2.commands,
  db: true,
  run: function (command, from, to, message) {
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
