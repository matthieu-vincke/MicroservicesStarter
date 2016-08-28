var redis = require('redis');
var redisClient = redis.createClient({host:process.env.redisDocker});

redisClient.on('connect', function() {
    console.log('Redis connected');
}).on("error", function (err) {
    console.log("Redis Error " + err);
}).on("end", function (err) {
    console.log("Redis Ended " + err);
});

module.exports = redisClient;
