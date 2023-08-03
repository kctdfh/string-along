var gulp = require('gulp');
var replace = require('gulp-replace');
var inject = require('gulp-inject');
var fs = require('fs');

gulp.task('add-styles', function () {
  var target = gulp.src('./src/html/*.html');
  var sources = gulp.src(['./src/css/*.css'], {}); 
  return target.pipe(inject(sources))
    .pipe(gulp.dest('./dist'));
});

function getCSSFilename(linkTag) {
  var hrefValue = /href\=\"([A-Za-z0-9/._]*)\"/g;
  var cssFilename = linkTag.match(hrefValue);
  cssFilename = cssFilename[0].replace("href=\"", "").replace("\"", "");
  return cssFilename;
}

gulp.task('inject-styles', function () {
  return gulp.src("./dist/*.html")
      .pipe(replace(/<link rel="stylesheet" href="[^"]*" \/>/g, function(linkTag) {
          var style = fs.readFileSync(`.${getCSSFilename(linkTag)}`, 'utf8');
          return '<style>\n' + style + '\t</style>';
      }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function() {
  gulp.watch('./src/**/*.*', gulp.series('build'))
});

gulp.task('build', gulp.series('add-styles', 'inject-styles'));