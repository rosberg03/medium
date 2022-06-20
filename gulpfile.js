const gulp = require('gulp');
const yargs = require('yargs');
const sass = require('gulp-sass')(require('sass'));
const cleanCss = require('gulp-clean-css');
const gulpif = require('gulp-if');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');
const webpack = require('webpack-stream');
const server = require('browser-sync').create();

const PRODUCTION = yargs.argv.production;


gulp.task('styles', function () {
    return gulp.src('assets/scss/main.scss')
        .pipe(gulpif(!PRODUCTION, sourcemaps.init()))
        .pipe(sass().on('error', sass.logError))
        .pipe(gulpif(PRODUCTION, postcss([ autoprefixer ])))
        .pipe(gulpif(PRODUCTION, cleanCss({compatibility:'ie8'})))
        .pipe(gulpif(!PRODUCTION, sourcemaps.write()))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('images', function () {
    return gulp.src('assets/images/**/*.{jpg,jpeg,png,svg,gif}')
        .pipe(gulpif(PRODUCTION, imagemin()))
        .pipe(gulp.dest('dist/images'));
});

gulp.task('copy', function () {
    return gulp.src(['assets/**/*','!assets/{images,js,scss}','!assets/{images,js,scss}/**/*'])
        .pipe(gulp.dest('dist'));   
});

gulp.task('clean', function () {
    return del('dist');
});

gulp.task('watchForChanges', function () {
    gulp.watch('assets/scss/main.scss', gulp.series('styles', 'reload'));
    gulp.watch('assets/images/**/*.{jpg,jpeg,png,svg,gif}',  gulp.series('images', 'reload'));
    gulp.watch(['assets/**/*','!assets/{images,js,scss}','!assets/{images,js,scss}/**/*'], gulp.series('copy', 'reload'));
    gulp.watch('src/js/**/*.js', gulp.series('scripts', 'reload'));
    gulp.watch("**/*.php", gulp.series('reload'));
});

gulp.task('scripts', function () {
    return gulp.src('assets/js/main.js')
        .pipe(webpack({
            module: {
            rules: [
                {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                    presets: []
                    }
                }
                }
            ]
            },
            mode: PRODUCTION ? 'production' : 'development',
            devtool: !PRODUCTION ? 'inline-source-map' : false,
            output: {
            filename: 'main.js'
            },
        }))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('serve', function(done) {
    server.init({
        proxy: "http://localhost/medium"
    });
    done();
});

gulp.task('reload', function(done) {
    server.reload();
    done();
});


gulp.task('watch', gulp.series('serve', 'watchForChanges'));
gulp.task('build', gulp.series(['clean', gulp.parallel('styles', 'images', 'copy', 'scripts')]));
gulp.task('default', gulp.series('build'));