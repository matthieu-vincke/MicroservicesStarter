var moment = require('moment');
moment.fn.inspect = function(){
  return this.format();
}

class Forecast {
  constructor(rawForecastObj,type) {
    this._error      = '';
    this._forecasts  = [];

    /*
    { date
      temperature  {intensity(extremely cold, very cold, cold, average, hot,very hot)}
      condition: { type (rain,Drizzle,Rain,Snow,Atmosphere,Clear,Clouds,Extreme)
                   intensity (light,medium,strong)
                }
      wind      {intensity(light,medium,strong, very strong)}
      humidity  {intensity(light,medium,strong)}
    }
    */
    this._weatherMapProcess = () => {
      /*

      http://www.openweathermap.org/appid
      Doc on http://www.openweathermap.org/api
      API key: 53b872af80b0e6b661fca7b77b8f037f
      Codes: http://www.openweathermap.org/weather-conditions

      Group 2xx: Thunderstorm
      Group 3xx: Drizzle
      Group 5xx: Rain
      Group 6xx: Snow
      Group 7xx: Atmosphere
      Group 800: Clear
      Group 80x: Clouds
      Group 90x: Extreme

      */

      function getWindIntensity(windSpeed)  {
        // Speed in m/s
        // http://www.metoffice.gov.uk/guide/weather/marine/beaufort-scale
        if(windSpeed < 8) return 'light'; else
        if(windSpeed < 20)  return 'medium'; else
        if(windSpeed < 27) return 'strong'; else
        return 'very strong';
      }

      function getTemperatureIntensity(temperature)  {
        if(temperature < -5) return 'extremely cold'; else
        if(temperature < 5)  return 'very cold'; else
        if(temperature < 15) return 'cold'; else
        if(temperature < 20) return 'average'; else
        if(temperature < 30) return 'hot'; else
        return 'very hot';
      }

      function getWeatherTypeIntensity(weatherObj)  {
        if(!weatherObj.id) return {error:'Cannot get the weather id'};

        if (weatherObj.id < 200) {
          return {error:'Invalid weather id, too low'};
        } else
        if (weatherObj.id < 300) {
          var result = {type:'Thunderstorm',intensity:'unknown ' + weatherObj.id }

          if([200,210,230].indexOf(weatherObj.id) >=0) result.intensity = 'light';
          if([201,211,211,231].indexOf(weatherObj.id) >=0) result.intensity = 'medium';
          if([202,212,233].indexOf(weatherObj.id) >=0) result.intensity = 'strong';

          return result;
        } else
        if (weatherObj.id < 400) {
          var result =  {type:'Drizzle',intensity:'unknown ' + weatherObj.id };

          if([300,301,310].indexOf(weatherObj.id) >=0) result.intensity = 'light';
          if([311,313,321].indexOf(weatherObj.id) >=0) result.intensity = 'medium';
          if([302,312,314].indexOf(weatherObj.id) >=0) result.intensity = 'strong';

          return result;
        } else
        if (weatherObj.id < 600) {
          var result = {type:'Rain',intensity:'unknown ' + weatherObj.id };
          if([500,520].indexOf(weatherObj.id) >=0) result.intensity = 'light';
          if([501,511,521,531].indexOf(weatherObj.id) >=0) result.intensity = 'medium';
          if([502,503,504,522].indexOf(weatherObj.id) >=0) result.intensity = 'strong';

          return result;
        } else
        if (weatherObj.id < 700) {
          var result = {type:'Snow',intensity:'unknown ' + weatherObj.id };
          if([600,611,615,620].indexOf(weatherObj.id) >=0) result.intensity = 'light';
          if([601,612,616,621].indexOf(weatherObj.id) >=0) result.intensity = 'medium';
          if([602,622].indexOf(weatherObj.id) >=0) result.intensity = 'strong';

          return result;
        } else
        if (weatherObj.id < 800) {
          var result = {type:'Atmosphere',intensity:'unknown ' + weatherObj.id };
          if([701,711,721].indexOf(weatherObj.id) >=0) result.intensity = 'light';
          if([731,741,751,761,762].indexOf(weatherObj.id) >=0) result.intensity = 'medium';
          if([762,771,781].indexOf(weatherObj.id) >=0) result.intensity = 'strong';

          return result;
        } else
        if (weatherObj.id === 800) { return {type:'Clear',intensity:'light'} } else
        if (weatherObj.id < 900) {
          var result = {type:'Clouds',intensity:'unknown ' + weatherObj.id };
          if([801].indexOf(weatherObj.id) >=0) result.intensity = 'light';
          if([802,803].indexOf(weatherObj.id) >=0) result.intensity = 'medium';
          if([804].indexOf(weatherObj.id) >=0) result.intensity = 'strong';

          return result;
        } else
        if (weatherObj.id < 1000) {
          var result = {type:'Extreme',intensity:'unknown ' + weatherObj.id };
          if([951,952,953].indexOf(weatherObj.id) >=0) result.intensity = 'light';
          if([954,955,956,957,958,960].indexOf(weatherObj.id) >=0) result.intensity = 'medium';
          if([900,901,902,903,904,905,906,959,961,962].indexOf(weatherObj.id) >=0) result.intensity = 'strong';

          return result;
        } else {
          return {error:'Invalid weather id, too high'};
        }
      }

      function processSingleResult(forecatObj){
        var resObj = {};
        var forecastDate = moment.unix(forecatObj.dt);
        resObj.date = forecastDate;
        /*
          clouds
            all: 88
        */
        var clouds = forecatObj.clouds;
        /*
          weather

            0: Object
              description: "overcast clouds"
              icon: "04d"
              id: 804
              main: "Clouds"
        */
        var weather = forecatObj.weather;
        resObj.condition = weather.map(singleWeather =>  getWeatherTypeIntensity(singleWeather) );
        /*
          wind

            deg: 230
            gust: 13.4
            speed: 8.2
        */
        var wind = forecatObj.wind;
        resObj.wind = {intensity: getWindIntensity(wind.speed)};

        /*
          grnd_level: 1019.12
          humidity: 72
          pressure: 1019.12
          sea_level: 1028.85
          temp: 22.49
          temp_kf: 0.29
          temp_max: 22.49
          temp_min: 22.2
        */
        debugger;
        var main = forecatObj.main;
        resObj.temperature = {intensity:getTemperatureIntensity(main.temp)};
        /*
          rain: Object
            3h: 0.005
        */
        var rain = forecatObj.rain;

        /*
          sys: Object
            country: "GB"
            id: 5091
            message: 0.0044
            sunrise: 1468036518
            sunset: 1468095353
            type: 1
        */
        var sys = forecatObj.sys;

        /*
        clouds: Object
        dt: 1468076400
        dt_txt: "2016-07-09 15:00:00"
        main: Object
        rain: Object
        sys: Object
        weather: Array[1]
        wind: Object

        OR

        base: "cmc stations"
        clouds: Object
        cod: 200
        coord: Object
        dt: 1468072389
        id: 2643743
        main: Object
        name: "London"
        sys: Object
        weather: Array[1]
        wind: Object
        */
        debugger;
        return resObj;
      }

      if(!rawForecastObj.list){  // Case of a single result
        this._forecasts = [processSingleResult(rawForecastObj)];
      } else {
        this._forecasts = rawForecastObj.list.map(singleForecast => processSingleResult(singleForecast));
      }
    }

    this._forecasts = this._forecasts.sort((a,b) => a.date.diff(b.date));
    // If we do more than one type, should be moved to a builder
    switch(type){
      case 'openweathermap':
        this._weatherMapProcess();
        break;
      default:
        this._error = 'Unknow weather type ${type}';
    }
  }
  get hasError(){
    if(this._error.length) return true;
  }
  get error(){
    return this._error;
  }
  get nextForecast() {
    return this._forecasts[0];
  }
  get lastForecast() {
    return this._forecasts[this._forecasts.length - 1];
  }
  get allForecasts() {
    return this._forecasts;
  }
  getFromDate(date){
    return this._forecasts;
  }
}

module.exports = Forecast;
