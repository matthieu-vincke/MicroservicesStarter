'use strict';

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
var redisClient = require('./core/redisClient');
var a127 = require('a127-magic');

module.exports = app; // for testing

var configApp = {
  appRoot: __dirname
};

a127.init(function(config) {
  app.use(a127.middleware(config));
  SwaggerExpress.create(configApp, function(err, swaggerExpress) {
    if (err) { throw err; }

    app.use(swaggerExpress.runner.swaggerTools.swaggerMetadata());
    app.use(swaggerExpress.runner.swaggerTools.swaggerUi());

    // install middleware
    swaggerExpress.register(app);

    var port = process.env.PORT || 10010;
    app.listen(port);

    if (swaggerExpress.runner.swagger.paths['/hello']) {
      console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
    }
  });
});
