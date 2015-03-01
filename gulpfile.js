var source = require('vinyl-source-stream');
var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var reactify = require('reactify');
var watchify = require('watchify');
var es6ify = require('es6ify');
var notify = require("gulp-notify");
var merge = require('gulp-merge');
 
var scriptsDir = './client';
var buildDir = './build';
 
function createBundle(file, watch) { 
  var props = watchify.args;
  props.entries = [scriptsDir + '/' + file];
  props.debug = true;

  es6ify.traceurOverrides = {experimental: true};
  
  var bundler = watch ? watchify(browserify(props)) : browserify(props);
  
  bundler.transform(reactify);
  bundler.transform(es6ify.configure(/.jsx/));

  return bundler;
}


function rebundle (bundler) {
    gutil.log("Rebundle "+bundler.file);
    var stream = bundler.bundle();
    return stream.on('error', notify.onError({
        title: "Compile Error",
        message: "<%= error.message %>"
      }))
      .pipe(source(bundler.file))
      .pipe(gulp.dest(buildDir + '/'));
}

function buildScript(files, watch) {
  var publicBundle = createBundle(files[0], watch);
  var authBundle = createBundle(files[1], watch);
  publicBundle.file = files[0];
  authBundle.file = files[1];
  publicBundle.on('update', function() {
    rebundle(publicBundle);
  });
  authBundle.on('update', function() {
    rebundle(authBundle);
  })

  var publicStream = rebundle(publicBundle);
  var authStream = rebundle(authBundle);

  return merge(publicStream, authStream);
}
 
 
gulp.task('build', function() {
  return buildScript(['frontpage.js','authorizedApp.js'], false);
});
 
 
gulp.task('watch', function() {
  return buildScript(['frontpage.js','authorizedApp.js'], true);
});