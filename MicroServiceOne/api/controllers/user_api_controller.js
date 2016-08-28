'use strict';

var util = require('util');

var mongoose  = require( 'mongoose' ),
    User = mongoose.model('User');

module.exports = {
  signup: signup,
  signin:signin,
  update:update
};

function signup(req, res) {
  var user = new User(req.swagger.params.user.value);
	user.save(function(err) {
    if(err) {
      if (11000 === err.code || 11001 === err.code) {
        return res.status(400).json({status:-1,message:"User already registered. Use another email."});
      }else {
        return res.status(400).json({status:-1,message:"Error unhandled with the user registration. Code:" + err.code + " message: " + err.errmsg});
      }
    }
		return res.json({status:1,message:"Registration succesfull"});
	});
}

function signin(req, res) {
	User.findOne(req.swagger.params.user.value, function(err,user) {
    if(err || !user) return res.status(400).json({status:-1, message:"User NOT found"});
    return res.json({status:1, message:"User found",data:user});
  });
}

function update(req, res) {
  return res.status(404).json({status:-2,message:"API not implemented yet"})
  /*
  var userIn = req.swagger.params.user.value;
  User.find(userIn,function(err, user) {
		return res.json(user);
	});*/
}
