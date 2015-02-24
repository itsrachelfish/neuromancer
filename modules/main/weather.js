var color = require("irc-colors");
var request = require("request");

var weather = {
  commands: ["weather", "forecast"],
  client: false,
  core: false,

  locAPI: {
    base: 'http://query.yahooapis.com/v1/public/yql',
    opts: '?format=json&q=select%20*%20from%20geo.placefinder%20where%20text=%22'
  },

  weathAPI: 'http://api.openweathermap.org/data/2.5/',

  // boilerplate woo
  message: function(from, to, message, details) {
    if (message.charAt(0) == weather.core.config.prefix) {
      message = message.substr(1);
      message = message.split(' ');
      
      var ignore = false
      if (weather.core.databases.ignore[from.toLowerCase()]) {
        weather.core.databases.ignore[from.toLowerCase()].forEach(function(entry, index, object) {
          if (entry == "weather") {
            console.log("[ignore]:".yellow + " ignored command '" + message.join(' ') + "' from '" + from + "'");
            ignore = true;
          }
        });
      }
      if (ignore) {
        return;
      }

      var command = message.shift();

      // If this command is valid
      if (weather.commands.indexOf(command) > -1) {
        message = message.join(' ');
        weather[command](from, to, message);
      }
    }
  },

  //TODO: clean this up and make it more readable
  worker: function(from, to, message, forecast) {
    var locale = (message == (message = message.replace(/ ?-c ?/, ' '))) ? ['imperial', 'F', 'mph'] : ['metric', 'C', 'm/s'];
    var days = message.match(/-[1-7]/) ? message.match(/-[1-7]/)[0].slice(1) : '3';
    message = message.replace(/ ?-[0-9]+ ?/, ' ');
    if (message.replace(' ', '')) {
      weather.core.databases.weather[from.toLowerCase()] = message;
    }

    request(weather.locAPI.base + weather.locAPI.opts + ((message).replace(' ', '') ? message : weather.core.databases.weather[from.toLowerCase()]) + '%22', function(e, r, body) {
      var data = JSON.parse(body).query;
      var locate = (data.count > 1) ? data.results.Result[0] : data.results.Result;
      if (forecast) {
        request(weather.weathAPI + 'forecast/daily?cnt=' + days + '&units=' + locale[0] + '&lat=' + locate.latitude + '&lon=' + locate.longitude, function(e, r, body) {
          var forecast = JSON.parse(body);

          weather.core.send("say", from, to, 'Forecast for \u000310' + (locate.line2 || locate.country || locate.name) + '\u000f (\u000311' + forecast.city.country + '\u000f)');

          forecast.list.forEach(function(day, index) {
            // this is gross I know
            var to_say = ((index == 0) ? 'Now' : (new Date(day.dt * 1000).toString().slice(0, 3))) + ': \u000304' + day.temp.min.toFixed(1) + '°' + locale[1] + '\u000f - \u000305' + day.temp.max.toFixed(1) + '°' + locale[1] + ' \u000307' + day.humidity + '% humidity \u000311' + day.speed.toFixed(1) + locale[2] + ' wind\u000f (\u000306' + day.weather[0].main + '\u000f)';

            weather.core.send("say", from, to, to_say);
          });
        });
      } else {
        request(weather.weathAPI + 'weather?units=' + locale[0] + '&lat=' + locate.latitude + '&lon=' + locate.longitude, function(e, r, body) {
          var weath = JSON.parse(body);
          var to_say = from + ': [\u000310' + (locate.line2 || locate.country || locate.name) + '\u000f (\u000311' + weath.sys.country + '\u000f)] [\u000304' + weath.main.temp + '°' + locale[1] + '\u000f (\u000307' + weath.main.humidity + '% humidity\u000f)] [\u000311Wind: ' + weath.wind.speed + ' ' + locale[2] + ' at ' + weath.wind.deg + '°\u000f] [\u000306' + weath.weather[0].description.charAt(0).toUpperCase() + weath.weather[0].description.slice(1) + '\u000f]';
          weather.core.send("say", from, to, to_say);
        });
      }
    });
  },
  
  weather: function(from, to, message) {
    weather.worker(from, to, message, false);
  },
  
  forecast: function(from, to, message) {
    weather.worker(from, to, message, true);
  },
  
  bind: function() {
    weather.client.addListener("message", weather.message);
  },
  
  unbind: function() {
    weather.client.removeListener("message", weather.message);
  }
};

module.exports = {
  load: function(core) {
    weather.core = core;
    weather.client = weather.core.client;
    weather.core.read_db("weather");
    weather.bind();
  },
  
  unload: function(core) {
    weather.unbind();
    weather.core.write_db("weather");
    delete weather;
  },
  
  commands: weather.commands
};
