// NOTE: I previously suggested doing this through Grunt, but had plenty of problems with
// my set up. Grunt did some weird things with scope, and I ended up using nodemon. This
// setup is now using Gulp. It works exactly how I expect it to and is WAY more concise.
var gulp = require('gulp'),
    spawn = require('child_process').spawn,
    node,
    nodedebug,
    standard = require('gulp-standard'),
    mocha = require('gulp-mocha'),
    istanbul = require('gulp-istanbul'),
    Q = require('q');

var isWatching = false;

/**
 * $ gulp server
 * description: launch the server. If there's a server already running, kill it.
 */
gulp.task('server', function() {
  if (node) node.kill()
  node = spawn('node', ['app.js'], {stdio: 'inherit'})
  node.on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
})

gulp.task('pre-test', function () {
  return gulp.src(['api/**/*.js','modules/**/.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire())
})

gulp.task('test', ['pre-test'], function (cb) {
  //var deferred = Q.defer();

  return gulp.src([
    './test/api/**/*.js',
    './test/modules/**/*.js'
  ])
  .pipe(mocha({
    reporter: 'mocha-junit-reporter',
    reporterOptions: {
        mochaFile: process.env.CIRCLE_TEST_REPORTS + '/junit/resultsMicroServiceOne.xml'
    }
  }))
  .pipe(istanbul.writeReports({ dir: './coverage'})) // stores reports in "coverage" directory
  /*.pipe(istanbul.enforceThresholds({
      thresholds: {
          global: {
              branches: 75,
              functions: 80,
              lines: 80,
              statements: 80
          }
      }
  }))
  .on('error', deferred.reject)
  .on('end', deferred.resolve);*/
})

gulp.task('dev',function() {
  process.env.mongoUri="mongodb://localhost/app-dev";
  process.env.redisDocker="localhost";
  process.env.PORT="8000";
  gulp.run('default')
});

// Done to fix the hanging after the end of coverage
gulp.on('stop', function() {
    if (!isWatching) {
        process.nextTick(function() {
            process.exit(0);
        });
    }
});

/**
 * $ gulp
 * description: start the development environment
 */
gulp.task('default', function() {
  var server = ['server'];
  gulp.start('server');
  isWatching = true;
  gulp.watch('./app.js', server);
  gulp.watch('./api/**/*.js' , server);
  gulp.watch('./core/**/*.js', server);
  gulp.watch('./modules/**/*.js', server);

  // Need to watch for sass changes too? Just add another watch call!
  // no more messing around with grunt-concurrent or the like. Gulp is
  // async by default.
})

// clean up if an error goes unhandled.
process.on('exit', function() {
    if (node) node.kill()
})
