'use strict';

var gulp         = require('gulp');
var postcss      = require('gulp-postcss');
var pug          = require('gulp-pug');
var autoprefixer = require('autoprefixer');
var cssnano      = require('cssnano');
var sugarss      = require('sugarss');
var connect      = require('gulp-connect');
var changed      = require('gulp-changed');
var rename       = require('gulp-rename');
var buble        = require('gulp-buble');

/**
 * Configuring paths
 * @type {Object}
 */

var paths = {};

paths.srcBase         = 'app';
paths.src             = {};
paths.src.scriptsBase = paths.srcBase + '/scripts';
paths.src.scripts     = paths.src.scriptsBase + '/**/*.js';
paths.src.stylesBase  = paths.srcBase + '/styles';
paths.src.styles      = paths.src.stylesBase + '/**/*.sss';
paths.src.pugBase     = paths.srcBase + '/pug';
paths.src.pug         = paths.src.pugBase + '/**/*.pug';


paths.buildBase       = 'dist';
paths.build           = {};
paths.build.scripts   = paths.buildBase + '/scripts';
paths.build.styles    = paths.buildBase + '/styles';
paths.build.tpl       = paths.build.scripts;
paths.build.pug       = paths.buildBase + '/html';
paths.html            = paths.buildBase + '/**/*.html';


/**
 * Build tasks
 */

// Main build task
gulp.task('build', [
    'styles',
    'scripts',
    'pug'
]);


gulp.task('styles', function() {
    var processors = [
        autoprefixer({browsers: ['last 3 versions']}),
        cssnano(),
    ];

    return gulp.src(paths.src.styles)
        .pipe(postcss(processors, { parser: sugarss }))
        .pipe(changed(paths.build.styles))
        .pipe(rename({ extname: '.css' }))
        .pipe(gulp.dest(paths.build.styles))
        .pipe(connect.reload());
});

gulp.task('scripts', function jsTask() {
    return gulp.src(paths.src.scripts)
        .pipe(changed(paths.build.scripts))
        .pipe(buble())
        .pipe(gulp.dest(paths.build.scripts))
        .pipe(connect.reload());
});


gulp.task('pug', function() {
    return gulp.src(paths.src.pug)
        .pipe(changed(paths.build.pug, {extension: '.html'}))
        .pipe(pug({
            pretty: true,
            debug: true,
            compileDebug: true
        }))
        .pipe(gulp.dest(paths.build.pug))
        .pipe(connect.reload());
});


/**
 * Server
 */

gulp.task('connect', function() {
    connect.server({
        root: 'dist',
        livereload: true,
        port: 8080
    });
});


/**
 * Watch task
 */
gulp.task('watch', ['build', 'connect'], function watch() {
    gulp.watch(paths.src.styles, ['styles']);
    gulp.watch(paths.src.scripts, ['scripts']);
    gulp.watch(paths.src.pug, ['pug']);
});

// Run
gulp.task('default', ['build']);
