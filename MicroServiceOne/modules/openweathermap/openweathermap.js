var request = require('request');
var util = require('util');
var moment = require('moment');
var ForecastDress = require('../../core/Models/ForecastDress');
var Forecast = require('../../core/Models/Forecast');

const FORECASTTYPE = 'openweathermap';

const OPENWEATHERMAPAPIKEY = process.env.openweathermapKey;
if(!OPENWEATHERMAPAPIKEY) throw new Error('No API key set for ' + FORECASTTYPE);
const STANDARDERRORCODE = 'Cannot get the weather';
const ERRORCODES = {"request": {code:1,msg:STANDARDERRORCODE},
                     "responseParsing":{code:2,msg:STANDARDERRORCODE},
                     "wrongResultFormat":{code:3,msg:STANDARDERRORCODE},
                     "noResults":{code:4,msg:STANDARDERRORCODE}};
/*
http://www.openweathermap.org/appid
Doc on http://www.openweathermap.org/api
API key: 53b872af80b0e6b661fca7b77b8f037f
Codes: http://www.openweathermap.org/weather-conditions

Group 2xx: Thunderstorm
Group 3xx: Drizzle
Group 5xx: Rai
Group 6xx: Snow
Group 7xx: Atmosphere
Group 800: Clear
Group 80x: Clouds
Group 90x: Extreme
*/

const HOST_WEATHEROPENMAP = 'http://api.openweathermap.org/data/2.5';

const REQ_GETBYCITY = HOST_WEATHEROPENMAP+'/weather?q=%s,%s&APPID=%s&units=%s&mode=%s';  //City,country token units  resformat (country can be empty, doesnt break the request)
const REQ_GETBYCITYID = HOST_WEATHEROPENMAP+'/weather?id=%s&APPID=%s&units=%s&mode=%s';  //Cityid token units  resformat (country can be empty, doesnt break the request)
const REQ_GETBYLOCATION = HOST_WEATHEROPENMAP+'/weather?lat=%s&lon=%s&APPID=%s&units=%s&mode=$s'; //lat,lon, token units resformat

const REQ_FORECASTBYCITY = HOST_WEATHEROPENMAP+'/forecast?q=%s,%s&APPID=%s&units=%s&mode=%s';  //City,country token units  resformat
const REQ_FORECASTBYCITYID = HOST_WEATHEROPENMAP+'/forecast?id=%s&APPID=%s&units=%s&mode=%s';  //Cityid token units  resformat
const REQ_FORECASTBYLOCATION = HOST_WEATHEROPENMAP+'/forecast?lat=%s&lon=%s&APPID=%s&units=%s&mode=%s'; //lat,lon, token units resformat


function setDefaults(opt){
  if(!opt) opt = {};

  if(!opt.country) opt.country = '';
  if(!opt.units) opt.units = 'metric';

  opt.mode = 'json'; // mandatory
  //opt.date = moment.utc();

  return opt;
};

function processSingleResult(forecastElmt){
  //  moment.unix (Time dt is in Unix format)
  var forecast = new Forecast(forecastElmt,FORECASTTYPE);
  return forecast;
}

function processResults(forecastResult, opt){
  try{
    var forecatObj = JSON.parse(forecastResult);
    if((!forecatObj.weather || !forecatObj.weather.forEach) &&
       (!forecatObj.list || !forecatObj.list.forEach)) return {error:ERRORCODES['wrongResultFormat']}; // No single forecast and no forecast list
    if((forecatObj.weather && !forecatObj.weather.length) ||
      (forecatObj.list && !forecatObj.list.length)) return {error:ERRORCODES['noResults']};

    var forecasts = new Forecast(forecatObj,FORECASTTYPE);

    if(forecasts.hasError) return {error:forecasts.error};

    return new ForecastDress(forecasts);
  } catch(ex){
    console.error(ex.message);
    return {error:ERRORCODES['responseParsing']};
  }
}

function sendNprocess(reqPath, opt, cb){
      //console.log("reqPath is ", reqPath);
  request(reqPath, function (error, response, body) {  //53b872af80b0e6b661fca7b77b8f037f
    if (!error && response.statusCode == 200) {
        //  console.log("Reply is ", body);
      var forecasts = processResults(body, opt);
      if(forecasts.error) return cb(forecasts.error);
      return cb(null,forecasts);
    } else {
      console.error('Error with the weather request', error, body);
      return cb(ERRORCODES['request']);
    }
  })
};

module.exports.getByCity = function(city,opt,cb){
  if(!cb) {
    cb = opt;
    opt={};
  }

  opt = setDefaults(opt);

  if(!city) return cb("Invalid city name");
  var httpReq = '';

  // City can be a name or a code
  if(!isNaN(city)) httpReq = util.format(REQ_GETBYCITYID,city,OPENWEATHERMAPAPIKEY, opt.units, opt.mode);
  else httpReq = util.format(REQ_GETBYCITY,city,opt.country,OPENWEATHERMAPAPIKEY, opt.units, opt.mode);

  sendNprocess(httpReq, opt, function(err,res){
    return cb(err,res);
  });
}


module.exports.getByLocation = function(location,opt,cb){
  if(!cb) {
    cb = opt;
    opt={};
  }
  opt = setDefaults(opt);

  if(!location || !location.long || !location.lat) return cb("Invalid location");

  sendNprocess(util.format(REQ_GETBYLOCATION,location.lat,location.long,opt.country,OPENWEATHERMAPAPIKEY, opt.units, opt.mode), opt, function(err,res){
    return cb(err,res);
  });
}


module.exports.getForecastByCity = function(city,opt,cb){
  if(!cb) {
    cb = opt;
    opt={};
  }
  opt = setDefaults(opt);

  if(!city) return cb("Invalid city name");
  var httpReq = '';

  // City can be a name or a code
  if(!isNaN(city)) httpReq = util.format(REQ_FORECASTBYCITYID,city,OPENWEATHERMAPAPIKEY, opt.units, opt.mode);
  else httpReq = util.format(REQ_FORECASTBYCITY,city,opt.country,OPENWEATHERMAPAPIKEY, opt.units, opt.mode);

  sendNprocess(httpReq, opt, function(err,res){
    return cb(err,res);
  });
}


module.exports.getForecastByLocation = function(location,opt,cb){
  if(!cb) {
    cb = opt;
    opt={};
  }
  opt = setDefaults(opt);

  if(!location || !location.long || !location.lat) return cb("Invalid location");

  sendNprocess(util.format(REQ_FORECASTBYLOCATION,location.lat,location.long,OPENWEATHERMAPAPIKEY, opt.units, opt.mode), opt, function(err,res){
    return cb(err,res);
  });
}
