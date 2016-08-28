'use strict';

var debug = require('debug')('helpers');
var mongoose  = require( 'mongoose' ),
    User = mongoose.model('User');

module.exports = {
  cacheKey: cacheKey,
  passwordCheck: function(username, password, cb) {
    // Need to use the User context
    console.log("[TODO] Return true - Change that for username password auth");
    return cb(null,true);
    //return User.passwordCheck.call(User, username, password, cb);
  },
  quotaHelper: quotaHelper,
  clientIp: clientIp
};

function clientIp(req) {
  var key = req.connection.remoteAddress;
  if (debug.enabled) { debug('clientIp Key: '+key); }
  return key;
}

function quotaHelper(req) {
  var key = 'someKey'
  if (debug.enabled) { debug('Quota Key: '+key); }
  return key;
}

function cacheKey(req) {
// This can checn for a specific query parameter
  var key = req.swagger.params.city.value;
  if (debug.enabled) { debug('Cache Key: '+key); }
  return key;
}
