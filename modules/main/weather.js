var color = require("irc-colors");
var request = require("request");
var parseArgs = require("minimist");
var debug = true;
var core = false;

var weather = {
  commands: ["weather", "forecast"],
  locAPI: 'http://query.yahooapis.com/v1/public/yql?format=json&q=select%20*%20from%20geo.placefinder%20where%20text=%22',
  weathAPI: 'http://api.openweathermap.org/data/2.5/',
  weathAPIKey: false,

  //TODO: clean this up and make it more readable
  worker: function(from, to, message, forecast) {
    if (debug) {
      console.log(weather.weathAPIKey);
      console.log(forecast + ' ' + message);
    }

    var args = parseArgs(message.split(' '), opts = {
      boolean: ['c', 'i'],
    });
    args["from"] = from;
    args["to"] = to;

    if (!core.databases.weather[from.toLowerCase()]) {
      core.databases.weather[from.toLowerCase()] = {};
    }

    // this is really not the best way to do this but w/e
    if (!core.databases.weather[from.toLowerCase()]["locate"] && !args._[0]) {
      core.say(from, to, from + ": I need a location");
      return;
    }

    // if it's a forecast then strip the -n from the message now so it doesn't mess with other stuff
    if (forecast) {
      var days = message.match(/-[1-7]/) ? message.match(/-[1-7]/)[0].slice(1) : '3';
      message = message.replace(/ ?-[0-9]+ ?/, ' ');
    }

    if (args.f) { // or if they did >weather -f <days>
      var days = args.f;
    }

    if (debug && days) {
      console.log("days: " + days);
    }

    if (args.c) { // if they want to switch to metric results
      var locale = ['metric', 'C', 'm/s'];
      core.databases.weather[from.toLowerCase()].locale = ['metric', 'C', 'm/s'];
      if (debug) {
        console.log(core.databases.weather[from.toLowerCase()]);
      }
    }

    if (args.i) { // or imperial
      core.databases.weather[from.toLowerCase()].locale = ['imperial', 'F', 'mph'];
      if (debug) {
        console.log(core.databases.weather[from.toLowerCase()]);
      }
    }

    if (args._[0]) { // if they're setting a new location
      // get the lat+long for the location
      if (debug) {
        console.log(args._.join(' '));
      }
      if (days) {
        weather.locWorker(args._, args, days, weather.forecastWorker);
      } else {
        weather.locWorker(args._, args, days, weather.weatherWorker);
      }
      return;
    }

    if (days) {
      weather.forecastWorker(args, days);
      console.log("a");
    } else {
      weather.weatherWorker(args);
      console.log("b");
    }
  },

  locWorker: function(str, args, days, callback) {
    if (!args) {
      core.say(args["from"], args["to"], "Something went wrong, try again later");
    }

    if (debug) {
      console.log(weather.locAPI + str.join('%20') + "%22");
    }

    request(weather.locAPI + str.join('%20') + "%22", function(e, r, body) {
      if (body) {
        if (debug) {
          console.log(body);
        }
        var data = JSON.parse(body).query;
        var locate = (data.count > 1) ? data.results.Result[0] : data.results.Result;
        // and save it to the db
        core.databases.weather[args["from"].toLowerCase()].locate = locate;
        core.write_db("weather");
        if (callback) {
          callback(args);
        }
      } else {
        core.say(args["from"], args["to"], args["from"] + ": I had a problem setting your location, please try again in a minute (location api call failed)");
        if (callback) {
          callback(false);
        }
        return;
      }
    });
  },

  weatherWorker: function(args) {
    if (!args) {
      core.say(args["from"], args["to"], "Something went wrong, try again later");
    }

    // this is even worse
    request(weather.weathAPI + 'weather?units=' + core.databases.weather[args["from"].toLowerCase()].locale[0] + '&lat=' + core.databases.weather[args["from"].toLowerCase()].locate.latitude + '&lon=' + core.databases.weather[args["from"].toLowerCase()].locate.longitude + "&APPID=" + weather.weathAPIKey, function(e, r, body) {
      if (body) {
        if (debug) {
          console.log(body);
        }
        try {
          var weath = JSON.parse(body);
        } catch (e) {
          console.log("api error: " + e);
          core.say(args["from"], args["to"], args["from"] + ": I had a problem fetching weather, please try again in a minute (weather api call failed)");
        }
        var to_say = args["from"] + ': [\u000310' + (core.databases.weather[args["from"].toLowerCase()].locate.line2 || core.databases.weather[args["from"].toLowerCase()].locate.country || core.databases.weather[args["from"].toLowerCase()].locate.name) + '\u000f (\u000311' + weath.sys.country + '\u000f)] [\u000304' + weath.main.temp + '°' + core.databases.weather[args["from"].toLowerCase()].locale[1] + '\u000f (\u000307' + weath.main.humidity + '% humidity\u000f)] [\u000311Wind: ' + weath.wind.speed + ' ' + core.databases.weather[args["from"].toLowerCase()].locale[2] + ' at ' + weath.wind.deg + '°\u000f] [\u000306' + weath.weather[0].description.charAt(0).toUpperCase() + weath.weather[0].description.slice(1) + '\u000f]';
        core.say(args["from"], args["to"], to_say);
      } else {
        core.say(args["from"], args["to"], args["from"] + ": I had a problem fetching weather, please try again in a minute (weather api call failed)");
      }
    });
  },

  forecastWorker: function(args, days) {
    if (!args) {
      core.say(args["from"], args["to"], "Something went wrong, try again later");
    }

    console.log(weather.weathAPI + 'forecast/daily?cnt=' + days + '&units=' + core.databases.weather[args["from"].toLowerCase()].locale[0] + '&lat=' + core.databases.weather[args["from"].toLowerCase()].locate.latitude + '&lon=' + core.databases.weather[args["from"].toLowerCase()].locate.longitude);

    request(weather.weathAPI + 'forecast/daily?cnt=' + days + '&units=' + core.databases.weather[args["from"].toLowerCase()].locale[0] + '&lat=' + core.databases.weather[args["from"].toLowerCase()].locate.latitude + '&lon=' + core.databases.weather[args["from"].toLowerCase()].locate.longitude + "&APPID=" + weather.weathAPIKey, function(e, r, body) {
      if (body) {
        if (debug) {
          console.log(body);
        }
        try {
          var daily = JSON.parse(body);
        } catch (e) {
          console.log("api error: " + e);
          core.say(args["from"], args["to"], args["from"] + ": I had a problem fetching weather, please try again in a minute (weather api call failed)");
        }
        // this is gross I know
        core.say(args["from"], args["to"], 'Forecast for \u000310' + (core.databases.weather[args["from"].toLowerCase()].locate.line2 || core.databases.weather[args["from"].toLowerCase()].locate.country || core.databases.weather[args["from"].toLowerCase()].locate.name)+ '\u000f (\u000311' + daily.city.country + '\u000f)');
        daily.list.forEach(function(day, index) {
          if (debug) {
            console.log(JSON.stringify(day))
          }
          var to_say = (new Date(day.dt * 1000).toString().slice(0, 3)) + ': \u000304' + day.temp.min.toFixed(1) + '°' + core.databases.weather[args["from"].toLowerCase()].locale[1] + '\u000f - \u000305' + day.temp.max.toFixed(1) + "°" + core.databases.weather[args["from"].toLowerCase()].locale[1] + ' \u000307' + day.humidity + '% humidity \u000311' + day.speed.toFixed(1) + core.databases.weather[args["from"].toLowerCase()].locale[2] + ' wind\u000f (\u000306' + day.weather[0].main + '\u000f)';
          core.say(args["from"], args["to"], to_say);
        });
      } else {
        core.say(args["from"], args["to"], args["from"] + ": I had a problem fetching weather, please try again in a minute (weather api call failed)");
      }
    });
  },

  weather: function(from, to, message) {
    weather.worker(from, to, message, false);
  },

  forecast: function(from, to, message) {
    weather.worker(from, to, message, true);
  },
};

module.exports = {
  load: function(_core) {
    core = _core;
    weather.weathAPIKey = core.databases.secrets["OWMAPIKey"];
  },
  unload: function(core) {
    delete weather;
    delete core;
    delete request;
    delete color;
  },
  commands: weather.commands,
  db: true,
  run: function(command, from, to, message) {
    weather[command](from, to, message);
  },
};
