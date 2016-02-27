
// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

var path           = require('path');
var fs             = require('fs');
var gulp           = require('gulp');
var connect        = require('gulp-connect');

// PostCSS plugins
var postcss        = require('gulp-postcss');
var cssImport      = require('postcss-import');
var rebaser        = require("postcss-assets-rebase");
var cssnext        = require('postcss-cssnext');
var cssExtend      = require('postcss-extend');
var roundSubPixel  = require('postcss-round-subpixels');
var aspectRatio    = require('postcss-aspect-ratio');
var verticalRhythm = require('postcss-vertical-rhythm-function');
var cssEasing      = require('postcss-easings');
var cssTriangle    = require('postcss-triangle');
var fontMagician   = require('postcss-font-magician');
var postcssSVG     = require('postcss-svg');
var autoprefixer   = require('autoprefixer');
var reporter       = require('postcss-reporter');
var osg            = require('postcss-oldschool-grid');

// Browserify
var browserify     = require('browserify');
var watchify       = require('watchify');
var partialify     = require('partialify');
var source         = require('vinyl-source-stream');
var buffer         = require('vinyl-buffer');

// Gulp plugins
var gutil          = require('gulp-util');
var watch          = require('gulp-watch');
var gulpif         = require('gulp-if');
var cssnano        = require('gulp-cssnano');
var notifier       = require('node-notifier');
var rename         = require('gulp-rename');
var del            = require('del');
var imagemin       = require('gulp-imagemin');
var pngquant       = require('imagemin-pngquant');
var uglify         = require('gulp-uglify');
var cache          = require('gulp-cache');
var sourcemaps     = require('gulp-sourcemaps');
var livereload     = require('gulp-livereload');

// Configs
var gulpConfig        = require('./gulpConfig.json');

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

var argv = require('yargs').argv;

const filePaths = gulpConfig.filePaths;

const autoprefixConfig = gulpConfig.autoprefixConfig;

var production = argv.prod || false;

// -----------------------------------------------------------------------------
// Debug
// -----------------------------------------------------------------------------

var debug = argv.debug || false;

if (debug) {
	console.log('*********************************************');
	console.log ( gutil.colors.cyan.bold('Filepaths:') );
	console.log(filePaths);
	console.log ( gutil.colors.cyan.bold('Autoprefixer config:') );
	console.log(autoprefixConfig);
	console.log('*********************************************');
	process.env.BROWSERIFYSHIM_DIAGNOSTICS=1;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

var onError = function (err) {
	var errorElements = ['plugin', 'fileName', 'line']
	console.log('*********************************************');
	console.log ( gutil.colors.bgRed.white('Compiation error.') );
	errorElements.forEach(function(el){
		if (err.hasOwnProperty(el)) {
			console.log ( gutil.colors.red.bold(el.toUpperCase() + ': ', err[el]) );
		}
	})
	console.log ( gutil.colors.white(err.message) );
	console.log('*********************************************');
	notifier.notify({
		'title': err.name,
		'message': err.fileName || err.message,
		'sound': true
	})
	this.emit('end');
};

function startLivereolad() {
	gutil.log( gutil.colors.blue.bold('Starting LiveReload') )
	livereload.listen();
}

// -----------------------------------------------------------------------------
// CSS
// -----------------------------------------------------------------------------

var postcssProcessors = [
	cssImport({
		path: ['bower_components'],
		renameDuplicates: true
	}),
	rebaser({
		assetsPath: filePaths.dest.imported,
	}),
	cssnext({
		features: {
			colorHwb: false,
			autoprefixer: false
		}
	}),
	aspectRatio(),
	verticalRhythm(),
	roundSubPixel(),
	cssEasing(),
	cssTriangle(),
	cssExtend(),
	fontMagician({
		hosted: 'assets/fonts',
		foundries: 'custom hosted'
	}),
	postcssSVG({
		paths: ['../svg/'],
		svgo: production,
		debug: !production
	}),
	autoprefixer({
		browsers: ['> 1%', 'last 2 versions', 'ie >= 9'],
	}),
	osg(),
	reporter({
		clearMessages: true
	})
]

function buildCss() {
	del( path.join(filePaths.dest.css, '*.map') );
	del( path.join(filePaths.dest.imported, '*') );

	return gulp.src(path.join(filePaths.src.css, '**/[^_]*.css'))
	.pipe( gulpif(!production, sourcemaps.init() ) )
	.pipe( postcss(postcssProcessors) )
	.on('error', onError)
	.pipe( gulpif( production,
				cssnano({
					autoprefixer: false,
					zindex: false
				})
			)
	)
	.pipe( rename({ suffix: '.min' }) )
	.pipe( gulpif(!production, sourcemaps.write('.') ) )
	.pipe( gulp.dest(filePaths.dest.css) )
	.pipe( livereload() );
}

function watchCss() {
	watch( path.join(filePaths.src.css, '**/*.css'), ['build:css'] );
}

gulp.task('build:css', buildCss);

gulp.task('watch:css', function(){
	startLivereolad();
	watchCss();
});


// -----------------------------------------------------------------------------
// Images
// -----------------------------------------------------------------------------

function buildImg() {
	del( path.join(filePaths.dest.img, '**/*.{jpg,png,gif,svg}') );
	return gulp.src( path.join(filePaths.src.img, '**/*.{jpg,png,gif,svg}') )
	.pipe(
		cache( imagemin({
			optimizationLevel: 3,
			progressive: true,
			interlaced: true,
			multipass: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}) )
	)
	.pipe(gulp.dest(filePaths.dest.img));
}

function watchImg() {
	watch( path.join(filePaths.src.img, '**/*.{jpg,png,gif,svg}'), ['build:img'] );
}

gulp.task('build:img', buildImg);
gulp.task('watch:img', watchImg);

// -----------------------------------------------------------------------------
// Images
// -----------------------------------------------------------------------------

function createBundle(bundler) {
	del( path.join( filePaths.dest.js, '*.map') );
	fs.access(filePaths.src.jsMain, fs.R_OK, function(err){
		if (err)
			return gutil.log ( gutil.colors.red.bold('No JS file found: ignoring javascript build') );
		return bundler.bundle()
			.on('error', onError)
			.pipe( source(path.basename(filePaths.src.jsMain)) )
			.pipe( buffer() )
			.pipe( gulpif(!production, sourcemaps.init() ) )
			.pipe( rename({ suffix: '.min' }) )
			.pipe( gulpif(production, uglify()) )
			.pipe( gulpif(!production, sourcemaps.write('.') ) )
			.pipe( gulp.dest(filePaths.dest.js) )
			.pipe( livereload() );
	})
}

// -----------------------------------------------------------------------------
// Javascript
// -----------------------------------------------------------------------------

function buildJs(){
	var bundler = browserify(filePaths.src.jsMain);
	createBundle(bundler);
}
function watchJs(){
	var bundler = browserify(filePaths.src.jsMain);
	bundler.plugin(watchify, {ignoreWatch: ['**/node_modules/**', '**/bower_components/**']});
	createBundle(bundler);
	bundler.on('update', function(){
		createBundle(bundler);
	})
}

gulp.task('build:js', buildJs);

gulp.task('watch:js', function(){
	startLivereolad();
	watchJs();
});

// -----------------------------------------------------------------------------
// Server
// -----------------------------------------------------------------------------

gulp.task('webserver', function() {
	connect.server();
});

// -----------------------------------------------------------------------------
// General
// -----------------------------------------------------------------------------

gulp.task('build', ['build:css', 'build:js', 'build:img']);
gulp.task('watch', function(){
	startLivereolad();
	watchCss();
	watchJs();
	watchImg();
});

gulp.task('default', ['webserver', 'watch']);
