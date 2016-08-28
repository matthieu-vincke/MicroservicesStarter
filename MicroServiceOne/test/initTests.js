'use strict';

var a127 = require('a127-magic');
var express = require('express');
var async = require('async');
var ManagementProvider = require('volos-management-redis');
var request = require('request');
var fs = require('fs');
var redis = require('redis');
var yaml = require('js-yaml');

var config = require('./config/config.js');

var key = {
  encryptionKey : "abc123",
  port:6379,
  host:process.env.redisDocker
};

var management;

var app = express();

function createDev(cb) {
  management.createDeveloper(config.devRequest, cb);
}

function createApp(developer, cb) {
  var appRequest = {
    developerId : developer.id,
    name: config.appRequest.name,
    scopes: config.appRequest.scopes
  };

  management.createApp(appRequest, cb);
}

module.exports.getToken = function(swaggerYmlPath, cb){
  var redisClient = redis.createClient({host:process.env.redisDocker});

  function finalize(err,credentials){
    if(err) return cb(err);
    var reqPost = {
      headers: {'content-type' : 'application/json'},
      url:     'http://127.0.0.1:'+process.env.PORT+'/accesstoken',
      body:    JSON.stringify({'grant_type':'password',
                'client_id':credentials.key,
                'client_secret':credentials.secret,
                'username':'scott',
                'password':'apigee'})
    };

    redisClient.end(true);
    request.post(reqPost,function(err,res){
      if(err) return cb(err);
      var token = JSON.parse(res.body).access_token;
      return cb(null,token);
    });
  }


  redisClient.on('connect', function() {
      console.log('Redis connected');

      // Delete all redis db
      redisClient.keys('*', function(err, rows) {
    		async.each(rows, function(row, callbackDelete) {
    			redisClient.del(row, callbackDelete)
    		}, function(err){
          yaml.safeLoadAll(fs.readFileSync(swaggerYmlPath,'utf-8'), function (swaggerConfig) {
            key.encryptionKey = swaggerConfig['x-volos-resources'].oauth2.options.encryptionKey;
            management = ManagementProvider.create(key);
            createDev(function(e, developer) {
              if(!developer) {
                console.error("Developer might already be registered... [TODO] get the existing credentials and use them");
                return finalize('Developer already registered');
              }
              createApp(developer, function(e, result) {
                return finalize(null, {key:result.credentials[0].key, secret:result.credentials[0].secret});
              });
            });
          });
        })
    	});
  }).on("error", function (err) {
      console.log("Redis Error " + err);
  }).on("end", function (err) {
      console.log("Redis Ended " + err);
  });

}
