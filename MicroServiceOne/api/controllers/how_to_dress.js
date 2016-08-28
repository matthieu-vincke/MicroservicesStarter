'use strict';

var util = require('util');

var mongoose  = require( 'mongoose' ),
    User = mongoose.model('User');

var openweathermap = require('../../modules/openweathermap/openweathermap');

module.exports = {
  howtodress: howtodress
};

function howtodress(req, res) {
  var lat = req.swagger.params.lat.value;
  var long = req.swagger.params.long.value;
  var city = req.swagger.params.city.value;
  var country = req.swagger.params.country.value;

  if((!lat || !long) && !city) return res.status(500).send({status:-1,message:"Wrong inputs"});
  if((lat || long) && city) return res.status(500).send({status:-1,message:"latitude / longitude or city in input"});

  function finalize(error,forecastDress){
    if(error) return res.json({status:-1,message:`Impossible to get the dress code:  ${error}`});
    if(!forecastDress) return res.json({status:-1,message:"Impossible to get the dress code!"});

    var instructions = forecastDress.getInstructions();
    if(instructions.status === -1) return res.json({status:-1,message:`Impossible to get the dress code:  ${instructions.message}`});
    instructions.status = 1;
    delete instructions.debug; // Remove the debug if any
    return res.json(instructions);
  }

  console.log(`lat ${lat} long ${long} city ${city} country ${country}`);

  if(city){
    return openweathermap.getForecastByCity(city,finalize)
  } else {
    return openweathermap.getForecastByLocation({lat,long},finalize);
  }
}
