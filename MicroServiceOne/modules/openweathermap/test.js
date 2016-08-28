var openweathermap = require('./openweathermap');
var util = require('util');

openweathermap.getForecastByCity('London',function(err,res){
  console.log(err);
  console.log(require('util').inspect(res.getInstructions(), { depth: 10, colors:true }));
})
