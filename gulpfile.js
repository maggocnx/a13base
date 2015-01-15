var gulp = require('gulp')
 	livereload = require('gulp-livereload'),
 	print = require('gulp-print'),
	// rsync = require('rsyncwrapper').rsync,
	rsync = require("gulp-rsync"),
	watch = require('gulp-watch').
	gutil = require('gulp-util');



rsyncOptions =  {
	destination: '/var/nwtest',
	hostname: 'tu2',
	incremental: true,
	progress: true,
	recursive: true,
	clean: true,
	exclude: ['.DS_Store', 'package.json']
}



gulp.task('default', function(){
	console.log("hello world")

})


gulp.task('deploy', function() {

	gulp.src('*/**')
    .pipe(rsync(rsyncOptions));

});

gulp.task('watch', function(){
	gulp.watch('/**').on('change', function(){
	});
})