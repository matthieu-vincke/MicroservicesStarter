var moment = require('moment');
moment.fn.inspect = function(){
  return this.format();
}

const NoRainConditions = ['Atmosphere','Clear','Clouds'];
const SnowConditions  = ['Snow'];
const ColdTemperatures = ['extremely cold','very cold'];
const ModerateTemperatures = ['cold','average'];
const HotTemperatures = ['hot','very hot'];

class ForecastDress {
    /*
    weatherForecasts is a array of forecasts
    { date
      temperature   'extremely cold' / 'very cold'/ 'cold' / 'average'/ 'hot'/ 'very hot'
      condition: { type (Thunderstorm,Drizzle,Rain,Snow,Atmosphere,Clear,Clouds,Extreme)
                   intensity (light,medium,strong)
                }
      wind (light,medium,strong)
    }
    */
    constructor (forecastsObj) {
      this._forecast = forecastsObj;
    }

    /*
    Outfits
    1:hot / no rain
    2::moderate / no rain
    3:cold / no rain
    4:hot / rain
    5:moderate / rain
    6:cold / rain
    7:cold / snow
    */
    _getOutfitsInstructions(tempLevel,rainLevel){
      let outfit = {};
      var switchKey = tempLevel+"-"+rainLevel;
      switch(switchKey){
        case 'hot-no rain':
          outfit = {details:'hot-no rain',dresscode:1};
          break;
        case 'moderate-no rain':
          outfit = {details:'moderate-no rain',dresscode:2};
          break;
        case 'cold-no rain':
          outfit = {details:'cold-no rain',dresscode:3};
          break;
        case 'hot-rain':
          outfit = {details:'hot-rain',dresscode:4};
          break;
        case 'moderate-rain':
          outfit = {details:'moderate-rain',dresscode:5};
          break;
        case 'cold-rain':
          outfit = {details:'cold-rain',dresscode:6};
          break;
        case 'cold-snow':
          outfit = {details:'cold-snow',dresscode:7};
          break;
        default:
          throw new Error(`Coding error, this case should never happen ${switchKey}`);
      }

      return outfit;
    }

    _forecast2Instructions(forecast){
      let tempLevel, rainLevel;

      if(forecast.condition.every(condition => NoRainConditions.indexOf(condition.type) >= 0)) {
        // We have no rain but we may have snow
        if(forecast.condition.some(condition => SnowConditions.indexOf(condition.type) >= 0 )){
          rainLevel = 'snow';
        } else {
          rainLevel = 'no rain';
        }
      } else {
        rainLevel = 'rain';
      }

      if(ColdTemperatures.indexOf(forecast.temperature.intensity) >= 0){
        tempLevel = 'cold';
      } else if(ModerateTemperatures.indexOf(forecast.temperature.intensity) >= 0){
        tempLevel = 'moderate';
      } else {
        tempLevel = 'hot';
      }

      return this._getOutfitsInstructions(tempLevel,rainLevel);
    }
    /*

    */
    getInstructions (dateStr) {
      var forecast = this._forecast.nextForecast;
      var instructions = {type:'unknown', id:-1};
      if(!dateStr){
        instructions =  this._forecast2Instructions(forecast);
      } else return {message:'cannot get instructions for the future yet',status:-1,debug:JSON.stringify(forecast)};
      // TODO: get for the day and get for the future

      instructions.debug  = JSON.stringify(forecast);
      instructions.status = 1;

      return instructions;
    }
}

module.exports = ForecastDress;
