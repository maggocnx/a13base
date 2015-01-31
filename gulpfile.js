var gulp = require('gulp');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var print = require('gulp-print');
var ngmin = require('gulp-ngmin');
var cat = require('gulp-cat');
var clean = require('gulp-clean');
var templateCache = require('gulp-angular-templatecache');
var replace = require('gulp-replace');
var preprocess = require('gulp-preprocess');
var jeditor = require("gulp-json-editor");
var rename = require("gulp-rename");
var exec = require("child_process").exec;

var argv = require('yargs').argv;
var env = argv.production ? 'production' : 'development';

console.log(env)

var appDir = (env=='development') ? 'system' : 'build';
var platform = argv.platform || require('os').platform();
var main = argv.main  || 'startup.html';

if(argv.settings){
  main = "settings.html"
}

gulp.task('clean', function() {
  gulp.src("build")
    .pipe(clean())
});

gulp.task('concat', function() {
   return gulp.src('system/settings.html')
        .pipe(usemin({
            assetsDir: 'system',
            css: [minifyCss(), 'concat'],
            js: [ngmin(), uglify(), 'concat'],
            js1: [ngmin(), uglify(), 'concat']

        }))
    .pipe(gulp.dest('build'));
});

gulp.task('package', function () {
  gulp.src('package.json')
  .pipe(jeditor({
    'main' : appDir + "/" + main,
    'node-main' : appDir + "/main.js"
  }))
  .pipe(cat())
  .pipe(gulp.dest('.'))
})

gulp.task('copy', function () {
  return gulp.src(['./system/*.*', './system/img/**',  '!system/settings.html'], {base : './system'})
    .pipe(gulp.dest('./build'))
})
 
gulp.task('templates', function () {
    return gulp.src('./system/templates/*.html')
        .pipe(templateCache({root: "templates",module : 'a13base' }))
        .pipe(gulp.dest('system/js/'));
});

gulp.task('run',[ 'package', 'exec']);

gulp.task('exec', function (cb) {
  exec('/Applications/node-webkit.app/Contents/MacOS/node-webkit .');
})

gulp.task('rebuild',['clean', 'copy', 'templates', 'concat']);



gulp.task('ngmin', function () {
  gulp.src("system/js/app.js")
  .pipe(ngmin())
  .pipe(uglify())

  .pipe(cat())

})
