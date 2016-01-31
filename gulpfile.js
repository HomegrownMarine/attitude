var gulp = require('gulp');
var eslint = require('gulp-eslint');

gulp.task('static', function () {
  return gulp.src('*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('pre-test', function () {
  // return gulp.src('lib/**/*.js')
  //   .pipe(istanbul({
  //     includeUntested: true,
  //     instrumenter: isparta.Instrumenter
  //   }))
  //   .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function (cb) {
  // var mochaErr;

  // gulp.src('test/**/*.js')
  //   .pipe(plumber())
  //   .pipe(mocha({reporter: 'spec'}))
  //   .on('error', function (err) {
  //     mochaErr = err;
  //   })
  //   .pipe(istanbul.writeReports())
  //   .on('end', function () {
  //     cb(mochaErr);
  //   });
});


gulp.task('default', ['static', 'test']);