var mongoose = require( 'mongoose' );

var mongoUri = process.env.mongoUri;
mongoose.connect(mongoUri);

mongoose.connection.on('connected', function () {
  console.log('Mongoose connected on ' + mongoUri);
}).on('error',function (err) {
  console.log('Mongoose connection error: ' + err);
}).on('disconnected', function () {
  console.log('Mongoose disconnected from '  + mongoUri );
}).on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('SIGINT: Mongoose disconnected from '  + mongoUri);
    process.exit(0);
  });
});

require('./Models/User');
