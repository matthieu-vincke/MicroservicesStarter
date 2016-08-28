'use strict';
var chai      = require('chai');
var path      = require('path');
var nock      = require('nock');
var util      = require('util');
var ZSchema   = require('z-schema');
var clone     = require('clone');
var validator = new ZSchema({});
var supertest = require('supertest');
var server    = require('../../../app');
var initTest  = require('../../initTests');
var api       = supertest(server); // supertest init;
var expect    = chai.expect;
var assert    = chai.assert;

//These consts are shared with the dev but duplicated... I prefer to do duplicates for that as the code is supposed to be independant of the tests
const HOST_WEATHEROPENMAP = 'http://api.openweathermap.org/data/2.5';
const OPENWEATHERMAPAPIKEY = process.env.openweathermapKey;
const REQ_GETBYCITY = HOST_WEATHEROPENMAP+'/weather?q=%s,%s&APPID=%s&units=%s&mode=%s';  //City,country token units  resformat (country can be empty, doesnt break the request)
const REQ_GETBYCITYID = HOST_WEATHEROPENMAP+'/weather?id=%s&APPID=%s&units=%s&mode=%s';  //Cityid token units  resformat (country can be empty, doesnt break the request)
const REQ_GETBYLOCATION = HOST_WEATHEROPENMAP+'/weather?lat=%s&lon=%s&APPID=%s&units=%s&mode=$s'; //lat,lon, token units resformat
const REQ_FORECASTBYCITY = HOST_WEATHEROPENMAP+'/forecast?q=%s,%s&APPID=%s&units=%s&mode=%s';  //City,country token units  resformat
const REQ_FORECASTBYCITYID = HOST_WEATHEROPENMAP+'/forecast?id=%s&APPID=%s&units=%s&mode=%s';  //Cityid token units  resformat
const REQ_FORECASTBYLOCATION = HOST_WEATHEROPENMAP+'/forecast?lat=%s&lon=%s&APPID=%s&units=%s&mode=%s'; //lat,lon, token units resformat

//reqPath is  http://api.openweathermap.org/data/2.5/weather?q=London,&APPID=53b872af80b0e6b661fca7b77b8f037f&units=metric&mode=json
const REPLYBYCITY =  {"coord":{"lon":-0.13,"lat":51.51},"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"base":"cmc stations","main":{"temp":22.59,"pressure":1019,"humidity":64,"temp_min":21,"temp_max":25},"wind":{"speed":4.6,"deg":230},"clouds":{"all":75},"dt":1469358194,"sys":{"type":1,"id":5093,"message":0.0787,"country":"GB","sunrise":1469333624,"sunset":1469390367},"id":2643743,"name":"London","cod":200};

const REPLYBYLOCATION = {"city":{"id":6690602,"name":"Battersea","coord":{"lon":-0.15547,"lat":51.474751},"country":"GB","population":0,"sys":{"population":0}},"cod":"200","message":0.0032,"cnt":37,"list":[{"dt":1469361600,"main":{"temp":23.24,"temp_min":21.95,"temp_max":23.24,"pressure":1021.81,"sea_level":1031.64,"grnd_level":1021.81,"humidity":68,"temp_kf":1.29},"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"clouds":{"all":68},"wind":{"speed":4.88,"deg":221.001},"sys":{"pod":"d"},"dt_txt":"2016-07-24 12:00:00"},{"dt":1469372400,"main":{"temp":24.45,"temp_min":23.23,"temp_max":24.45,"pressure":1021.03,"sea_level":1030.83,"grnd_level":1021.03,"humidity":63,"temp_kf":1.23},"weather":[{"id":802,"main":"Clouds","description":"scattered clouds","icon":"03d"}],"clouds":{"all":44},"wind":{"speed":5.05,"deg":229.501},"sys":{"pod":"d"},"dt_txt":"2016-07-24 15:00:00"},{"dt":1469383200,"main":{"temp":24.65,"temp_min":23.49,"temp_max":24.65,"pressure":1020.71,"sea_level":1030.45,"grnd_level":1020.71,"humidity":61,"temp_kf":1.16},"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"clouds":{"all":80},"wind":{"speed":5.17,"deg":247.009},"sys":{"pod":"d"},"dt_txt":"2016-07-24 18:00:00"},{"dt":1469394000,"main":{"temp":21.96,"temp_min":20.88,"temp_max":21.96,"pressure":1021.43,"sea_level":1031.17,"grnd_level":1021.43,"humidity":71,"temp_kf":1.09},"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10n"}],"clouds":{"all":92},"wind":{"speed":5.12,"deg":260.502},"rain":{"3h":0.025},"sys":{"pod":"n"},"dt_txt":"2016-07-24 21:00:00"},{"dt":1469404800,"main":{"temp":18.37,"temp_min":17.35,"temp_max":18.37,"pressure":1022.11,"sea_level":1031.86,"grnd_level":1022.11,"humidity":66,"temp_kf":1.02},"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10n"}],"clouds":{"all":0},"wind":{"speed":5.07,"deg":267.505},"rain":{"3h":0.005},"sys":{"pod":"n"},"dt_txt":"2016-07-25 00:00:00"},{"dt":1469415600,"main":{"temp":14.61,"temp_min":13.65,"temp_max":14.61,"pressure":1022.25,"sea_level":1032.15,"grnd_level":1022.25,"humidity":92,"temp_kf":0.95},"weather":[{"id":801,"main":"Clouds","description":"few clouds","icon":"02n"}],"clouds":{"all":24},"wind":{"speed":3.61,"deg":266.507},"rain":{},"sys":{"pod":"n"},"dt_txt":"2016-07-25 03:00:00"},{"dt":1469426400,"main":{"temp":15.08,"temp_min":14.2,"temp_max":15.08,"pressure":1022.53,"sea_level":1032.42,"grnd_level":1022.53,"humidity":90,"temp_kf":0.89},"weather":[{"id":802,"main":"Clouds","description":"scattered clouds","icon":"03d"}],"clouds":{"all":36},"wind":{"speed":3.56,"deg":268},"rain":{},"sys":{"pod":"d"},"dt_txt":"2016-07-25 06:00:00"},{"dt":1469437200,"main":{"temp":19.56,"temp_min":18.74,"temp_max":19.56,"pressure":1022.79,"sea_level":1032.53,"grnd_level":1022.79,"humidity":78,"temp_kf":0.82},"weather":[{"id":800,"main":"Clear","description":"clear sky","icon":"02d"}],"clouds":{"all":8},"wind":{"speed":3.11,"deg":283.508},"rain":{},"sys":{"pod":"d"},"dt_txt":"2016-07-25 09:00:00"},{"dt":1469448000,"main":{"temp":22.28,"temp_min":21.54,"temp_max":22.28,"pressure":1022.26,"sea_level":1032.09,"grnd_level":1022.26,"humidity":70,"temp_kf":0.75},"weather":[{"id":802,"main":"Clouds","description":"scattered clouds","icon":"03d"}],"clouds":{"all":36},"wind":{"speed":3.48,"deg":269.006},"rain":{},"sys":{"pod":"d"},"dt_txt":"2016-07-25 12:00:00"},{"dt":1469458800,"main":{"temp":21.69,"temp_min":21.01,"temp_max":21.69,"pressure":1022.06,"sea_level":1031.83,"grnd_level":1022.06,"humidity":62,"temp_kf":0.68},"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"clouds":{"all":80},"wind":{"speed":4.02,"deg":267.501},"rain":{},"sys":{"pod":"d"},"dt_txt":"2016-07-25 15:00:00"},{"dt":1469469600,"main":{"temp":20.79,"temp_min":20.18,"temp_max":20.79,"pressure":1022.02,"sea_level":1031.88,"grnd_level":1022.02,"humidity":60,"temp_kf":0.61},"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}],"clouds":{"all":92},"wind":{"speed":4.11,"deg":273.503},"rain":{},"sys":{"pod":"d"},"dt_txt":"2016-07-25 18:00:00"},{"dt":1469480400,"main":{"temp":18.61,"temp_min":18.06,"temp_max":18.61,"pressure":1023.24,"sea_level":1033.07,"grnd_level":1023.24,"humidity":62,"temp_kf":0.54},"weather":[{"id":802,"main":"Clouds","description":"scattered clouds","icon":"03n"}],"clouds":{"all":32},"wind":{"speed":3.41,"deg":286.003},"rain":{},"sys":{"pod":"n"},"dt_txt":"2016-07-25 21:00:00"},{"dt":1469491200,"main":{"temp":15.21,"temp_min":14.73,"temp_max":15.21,"pressure":1024.04,"sea_level":1033.9,"grnd_level":1024.04,"humidity":81,"temp_kf":0.48},"weather":[{"id":801,"main":"Clouds","description":"few clouds","icon":"02n"}],"clouds":{"all":12},"wind":{"speed":2.66,"deg":310.503},"rain":{},"sys":{"pod":"n"},"dt_txt":"2016-07-26 00:00:00"},{"dt":1469502000,"main":{"temp":14.11,"temp_min":13.7,"temp_max":14.11,"pressure":1024.22,"sea_level":1034.2,"grnd_level":1024.22,"humidity":88,"temp_kf":0.41},"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}],"clouds":{"all":56},"wind":{"speed":1.96,"deg":314.004},"rain":{},"sys":{"pod":"n"},"dt_txt":"2016-07-26 03:00:00"},{"dt":1469512800,"main":{"temp":15.19,"temp_min":14.85,"temp_max":15.19,"pressure":1025,"sea_level":1034.96,"grnd_level":1025,"humidity":84,"temp_kf":0.34},"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"clouds":{"all":56},"wind":{"speed":1.76,"deg":336.001},"rain":{},"sys":{"pod":"d"},"dt_txt":"2016-07-26 06:00:00"},{"dt":1469523600,"main":{"temp":18.37,"temp_min":18.1,"temp_max":18.37,"pressure":1025.47,"sea_level":1035.39,"grnd_level":1025.47,"humidity":75,"temp_kf":0.27},"weather":[{"id":801,"main":"Clouds","description":"few clouds","icon":"02d"}],"clouds":{"all":24},"wind":{"speed":1.86,"deg":323.004},"rain":{},"sys":{"pod":"d"},"dt_txt":"2016-07-26 09:00:00"},{"dt":1469534400,"main":{"temp":20.87,"temp_min":20.67,"temp_max":20.87,"pressure":1025.09,"sea_level":1034.95,"grnd_level":1025.09,"humidity":72,"temp_kf":0.2},"weather":[{"id":802,"main":"Clouds","description":"scattered clouds","icon":"03d"}],"clouds":{"all":44},"wind":{"speed":1.96,"deg":228},"rain":{},"sys":{"pod":"d"},"dt_txt":"2016-07-26 12:00:00"},{"dt":1469545200,"main":{"temp":22.39,"temp_min":22.26,"temp_max":22.39,"pressure":1024.17,"sea_level":1033.96,"grnd_level":1024.17,"humidity":63,"temp_kf":0.14},"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"clouds":{"all":56},"wind":{"speed":2.53,"deg":241.511},"rain":{},"sys":{"pod":"d"},"dt_txt":"2016-07-26 15:00:00"},{"dt":1469556000,"main":{"temp":21.17,"temp_min":21.11,"temp_max":21.17,"pressure":1023.61,"sea_level":1033.4,"grnd_level":1023.61,"humidity":56,"temp_kf":0.07},"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"clouds":{"all":80},"wind":{"speed":3.46,"deg":253.001},"rain":{},"sys":{"pod":"d"},"dt_txt":"2016-07-26 18:00:00"},{"dt":1469566800,"main":{"temp":18.06,"temp_min":18.06,"temp_max":18.06,"pressure":1023.85,"sea_level":1033.74,"grnd_level":1023.85,"humidity":57,"temp_kf":0},"weather":[{"id":800,"main":"Clear","description":"clear sky","icon":"02n"}],"clouds":{"all":8},"wind":{"speed":3.41,"deg":257.505},"rain":{},"sys":{"pod":"n"},"dt_txt":"2016-07-26 21:00:00"},{"dt":1469577600,"main":{"temp":14.64,"temp_min":14.64,"temp_max":14.64,"pressure":1023.85,"sea_level":1033.71,"grnd_level":1023.85,"humidity":66,"temp_kf":0},"weather":[{"id":802,"main":"Clouds","description":"scattered clouds","icon":"03n"}],"clouds":{"all":32},"wind":{"speed":3.47,"deg":263.501},"rain":{},"sys":{"pod":"n"},"dt_txt":"2016-07-27 00:00:00"},{"dt":1469588400,"main":{"temp":12.82,"temp_min":12.82,"temp_max":12.82,"pressure":1022.9,"sea_level":1032.85,"grnd_level":1022.9,"humidity":86,"temp_kf":0},"weather":[{"id":801,"main":"Clouds","description":"few clouds","icon":"02n"}],"clouds":{"all":20},"wind":{"speed":2.82,"deg":249.505},"rain":{},"sys":{"pod":"n"},"dt_txt":"2016-07-27 03:00:00"},{"dt":1469599200,"main":{"temp":14.32,"temp_min":14.32,"temp_max":14.32,"pressure":1022.27,"sea_level":1032.12,"grnd_level":1022.27,"humidity":82,"temp_kf":0},"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"clouds":{"all":64},"wind":{"speed":3.81,"deg":222.006},"rain":{},"sys":{"pod":"d"},"dt_txt":"2016-07-27 06:00:00"},{"dt":1469610000,"main":{"temp":18.18,"temp_min":18.18,"temp_max":18.18,"pressure":1021.89,"sea_level":1031.71,"grnd_level":1021.89,"humidity":77,"temp_kf":0},"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"clouds":{"all":68},"wind":{"speed":5.07,"deg":228.505},"rain":{"3h":0.1},"sys":{"pod":"d"},"dt_txt":"2016-07-27 09:00:00"},{"dt":1469620800,"main":{"temp":21.79,"temp_min":21.79,"temp_max":21.79,"pressure":1021.26,"sea_level":1031.04,"grnd_level":1021.26,"humidity":72,"temp_kf":0},"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"clouds":{"all":68},"wind":{"speed":5.44,"deg":236.002},"rain":{},"sys":{"pod":"d"},"dt_txt":"2016-07-27 12:00:00"},{"dt":1469631600,"main":{"temp":22.8,"temp_min":22.8,"temp_max":22.8,"pressure":1020.34,"sea_level":1030.18,"grnd_level":1020.34,"humidity":64,"temp_kf":0},"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"clouds":{"all":80},"wind":{"speed":5.32,"deg":249.002},"rain":{},"sys":{"pod":"d"},"dt_txt":"2016-07-27 15:00:00"},{"dt":1469642400,"main":{"temp":22.22,"temp_min":22.22,"temp_max":22.22,"pressure":1020.08,"sea_level":1029.77,"grnd_level":1020.08,"humidity":61,"temp_kf":0},"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}],"clouds":{"all":92},"wind":{"speed":4.9,"deg":256},"rain":{},"sys":{"pod":"d"},"dt_txt":"2016-07-27 18:00:00"},{"dt":1469653200,"main":{"temp":20.41,"temp_min":20.41,"temp_max":20.41,"pressure":1020.23,"sea_level":1029.95,"grnd_level":1020.23,"humidity":66,"temp_kf":0},"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}],"clouds":{"all":80},"wind":{"speed":3.56,"deg":248.002},"rain":{},"sys":{"pod":"n"},"dt_txt":"2016-07-27 21:00:00"},{"dt":1469664000,"main":{"temp":17.27,"temp_min":17.27,"temp_max":17.27,"pressure":1020.1,"sea_level":1029.84,"grnd_level":1020.1,"humidity":95,"temp_kf":0},"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10n"}],"clouds":{"all":100},"wind":{"speed":2.77,"deg":253.002},"rain":{"3h":1.685},"sys":{"pod":"n"},"dt_txt":"2016-07-28 00:00:00"},{"dt":1469674800,"main":{"temp":16.25,"temp_min":16.25,"temp_max":16.25,"pressure":1019.14,"sea_level":1028.95,"grnd_level":1019.14,"humidity":99,"temp_kf":0},"weather":[{"id":501,"main":"Rain","description":"moderate rain","icon":"10n"}],"clouds":{"all":92},"wind":{"speed":2.62,"deg":241.508},"rain":{"3h":5.31},"sys":{"pod":"n"},"dt_txt":"2016-07-28 03:00:00"},{"dt":1469685600,"main":{"temp":16.64,"temp_min":16.64,"temp_max":16.64,"pressure":1018.59,"sea_level":1028.34,"grnd_level":1018.59,"humidity":99,"temp_kf":0},"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"clouds":{"all":88},"wind":{"speed":3.41,"deg":215.5},"rain":{"3h":0.71},"sys":{"pod":"d"},"dt_txt":"2016-07-28 06:00:00"},{"dt":1469696400,"main":{"temp":18.75,"temp_min":18.75,"temp_max":18.75,"pressure":1017.99,"sea_level":1027.84,"grnd_level":1017.99,"humidity":96,"temp_kf":0},"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"clouds":{"all":44},"wind":{"speed":4.86,"deg":215.501},"rain":{"3h":0.025},"sys":{"pod":"d"},"dt_txt":"2016-07-28 09:00:00"},{"dt":1469707200,"main":{"temp":20.13,"temp_min":20.13,"temp_max":20.13,"pressure":1017.51,"sea_level":1027.22,"grnd_level":1017.51,"humidity":89,"temp_kf":0},"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"clouds":{"all":68},"wind":{"speed":5.83,"deg":232.5},"rain":{"3h":0.075},"sys":{"pod":"d"},"dt_txt":"2016-07-28 12:00:00"},{"dt":1469718000,"main":{"temp":21.84,"temp_min":21.84,"temp_max":21.84,"pressure":1016.58,"sea_level":1026.21,"grnd_level":1016.58,"humidity":81,"temp_kf":0},"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"clouds":{"all":36},"wind":{"speed":5.96,"deg":238.5},"rain":{"3h":0.005},"sys":{"pod":"d"},"dt_txt":"2016-07-28 15:00:00"},{"dt":1469728800,"main":{"temp":21.04,"temp_min":21.04,"temp_max":21.04,"pressure":1016.27,"sea_level":1026.02,"grnd_level":1016.27,"humidity":75,"temp_kf":0},"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"clouds":{"all":80},"wind":{"speed":5.18,"deg":247.502},"rain":{"3h":0.015},"sys":{"pod":"d"},"dt_txt":"2016-07-28 18:00:00"},{"dt":1469739600,"main":{"temp":18.96,"temp_min":18.96,"temp_max":18.96,"pressure":1016.82,"sea_level":1026.57,"grnd_level":1016.82,"humidity":74,"temp_kf":0},"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10n"}],"clouds":{"all":64},"wind":{"speed":3.76,"deg":261.502},"rain":{"3h":0.005},"sys":{"pod":"n"},"dt_txt":"2016-07-28 21:00:00"},{"dt":1469750400,"main":{"temp":16.37,"temp_min":16.37,"temp_max":16.37,"pressure":1017.16,"sea_level":1026.95,"grnd_level":1017.16,"humidity":81,"temp_kf":0},"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10n"}],"clouds":{"all":12},"wind":{"speed":2.86,"deg":266.003},"rain":{"3h":0.01},"sys":{"pod":"n"},"dt_txt":"2016-07-29 00:00:00"}]}
//reqPath is  http://api.openweathermap.org/data/2.5/forecast?lat=51.481961&lon=-0.144443&APPID=53b872af80b0e6b661fca7b77b8f037f&units=metric&mode=json

function getReplyBody(){
  var replyBody = clone(REPLYBYCITY);

  return replyBody;
}

var testsParams = [
  {opt:{'units':'metric','mode':'json','country':'uk'},
  city:'London',
  replyCode:200,
  replyBody:getReplyBody(),
  expectedReplyFromMicroServiceOne:null, // Just check the code
  description:'Test successfull by city name'},
  {opt:{'units':'metric','mode':'json','country':'fr'},
  city:'London',
  replyCode:400,
  replyBody:'country not found',
  expectedReplyFromMicroServiceOne:null, // Just check the code
  description:'Test fail by city name as country doesnt match the city name'},
  {opt:{'units':'metric','mode':'json','country':'uk'},
  city:23,
  replyCode:200,
  replyBody:getReplyBody(),
  expectedReplyFromMicroServiceOne:null, // Just check the code
  description:'Test successfull by city id'},
  {opt:{'units':'metric','mode':'json','country':'uk'},
  city:-23,
  replyCode:400,
  replyBody:getReplyBody(),
  expectedReplyFromMicroServiceOne:null, // Just check the code
  description:'Test failed by city id as the city id doesnt exist'},
  {opt:{'units':'metric','mode':'json','country':'uk'},
  pos:{lat:'51.481961',long: '-0.144443'},
  replyCode:200,
  replyBody:getReplyBody(),
  expectedReplyFromMicroServiceOne:null, // Just check the code
  description:'Test successfull by position'},
  {opt:{'units':'metric','mode':'json','country':'uk'},
  pos:{lat:-999910,long:99910},
  replyCode:400,
  replyBody:getReplyBody(),
  expectedReplyFromMicroServiceOne:null, // Just check the code
  description:'Test failed by position as position is wrong'},



  {opt:{'units':'metric','mode':'json','country':'uk'},
  city:'LondonHotNoRain',
  replyCode:200,
  replyBody:'todo',
  expectedReplyFromMicroServiceOne:{details:'hot-no rain',dresscode:1},
  description:'Test successfull by city name - hot no rain'},
  {opt:{'units':'metric','mode':'json','country':'uk'},
  city:'LondonHotRain',
  replyCode:200,
  replyBody:getReplyBody(),
  expectedReplyFromMicroServiceOne:{details:'hot-rain',dresscode:4},
  description:'Test successfull by city name - hot rain'},

  {opt:{'units':'metric','mode':'json','country':'uk'},
  city:'LondonModerateNoRain',
  replyCode:200,
  replyBody:getReplyBody(),
  expectedReplyFromMicroServiceOne:{details:'moderate-no rain',dresscode:2},
  description:'Test successfull by city name - moderate no rain'},
  {opt:{'units':'metric','mode':'json','country':'uk'},
  city:'LondonModerateRain',
  replyCode:200,
  replyBody:getReplyBody(),
  expectedReplyFromMicroServiceOne:{details:'moderate-rain',dresscode:5},
  description:'Test successfull by city name - moderate rain'},


  {opt:{'units':'metric','mode':'json','country':'uk'},
  city:'LondonColdNoRain',
  replyCode:200,
  replyBody:getReplyBody(),
  expectedReplyFromMicroServiceOne:{details:'cold-no rain',dresscode:3},
  description:'Test successfull by city name - cold no rain'},
  {opt:{'units':'metric','mode':'json','country':'uk'},
  city:'LondonColdRain',
  replyCode:200,
  replyBody:getReplyBody(),
  expectedReplyFromMicroServiceOne:{details:'cold-rain',dresscode:6},
  description:'Test successfull by city name - cold rain'},

  {opt:{'units':'metric','mode':'json','country':'uk'},
  city:'LondonColdSnow',
  replyCode:200,
  replyBody:getReplyBody(),
  expectedReplyFromMicroServiceOne:{details:'cold-snow',dresscode:7},
  description:'Test successfull by city name - cold snow'}

];

function mockRequestGet(url2Mock,path2Mock,replyCode,replyBody){
  nock(url2Mock)
    .persist()  // Make the nock persit even after the first call
    .get(path2Mock)
    .reply(replyCode, replyBody);
}

function generateMockRequests(){
  testsParams.forEach(function(testDetails,i){
    if(testDetails.city){
      if(isNaN(testDetails.city)) {
        mockRequestGet(HOST_WEATHEROPENMAP,util.format(REQ_FORECASTBYCITY,testDetails.city,testDetails.opt.country,
          OPENWEATHERMAPAPIKEY,testDetails.opt.units, testDetails.opt.mode));
      } else {
        mockRequestGet(HOST_WEATHEROPENMAP,util.format(REQ_FORECASTBYCITYID,testDetails.city,
          OPENWEATHERMAPAPIKEY,testDetails.opt.units, testDetails.opt.mode));
      }
    } else if(testDetails.pos) {
      mockRequestGet(HOST_WEATHEROPENMAP,util.format(REQ_FORECASTBYLOCATION,testDetails.pos.lat,testDetails.pos.long,
        OPENWEATHERMAPAPIKEY,testDetails.opt.units, testDetails.opt.mode));
    } else {
      throw new Error("Coding issue: no city or position defined for the test id " + i);
    }
  });
}

var gtoken;

// Before everything, we clean the dbs and get an API token
before(function(done) {
  initTest.getToken(path.join(__dirname,'../../../api/swagger/swagger.yaml'),function(err,token){
    if(err) console.error(err);
    assert.isNull(err);
    assert.isNotNull(token);
    gtoken = token;
    generateMockRequests();
    return done();
  })
});

describe('/howToDress', function() {
  describe('get', function() {
    it('should respond with 200 Success', function(done) {
      /*eslint-disable*/
      var schema = {
        "required": [
          "status",
          "dresscode"
        ],
        "properties": {
          "status": {
            "type": "integer"
          },
          "dresscode": {
            "type": "integer",
            "minimum": 0,
            "maximum": 10
          },
          "details": {
            "type": "string"
          }
        }
      };

      /*eslint-enable*/
      api.get('/howToDress')
      .query({
        lat: '51.481961',long: '-0.144443'
      })
      .set('Authorization', 'Bearer '+ gtoken)
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        console.log(res.body);
        expect(validator.validate(res.body, schema)).to.be.true;
        done();
      });
    });

    it('should respond with default Error', function(done) {
      /*eslint-disable*/
      var schema = {
        "required": [
          "status",
          "message"
        ],
        "properties": {
          "status": {
            "type": "integer",
            "minimum": -10,
            "maximum": 10
          },
          "message": {
            "type": "string"
          }
        }
      };

      /*eslint-enable*/
      api.get('/howToDress')
      .query({
      })
      .set('Authorization', 'Bearer ' + gtoken)
      .set('Accept', 'application/json')
      .expect('{"status":-1,"message":"Wrong inputs"}')
      .end(function(err, res) {
        if (err) return done(err);
        expect(validator.validate(res.body, schema)).to.be.true;
        done();
      });
    });

  });

});
