
// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

var path           = require('path');
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
var gulpif         = require('gulp-if');
var cssnano        = require('gulp-cssnano');
var notifier       = require('node-notifier');
var rename         = require('gulp-rename');
var del            = require('del');
var imagemin       = require('gulp-imagemin');
var pngquant       = require('imagemin-pngquant');
var uglify         = require('gulp-uglify');
var cache          = require('gulp-cache');
var livereload     = require('gulp-livereload');

// Configs
var cssVars        = require('./cssvars.json');

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

var argv = require('yargs').argv;

const filePaths = {
	src: {
		base:   'src/',
		css:    'src/css/',
		js:     'src/js/main.js',
		img:    'src/rawimg/',
		svg:    'src/svg/'
	},
	dest: {
		base:     'dist/',
		css:      'dist/css/',
		js:       'dist/js/',
		imported: 'dist/imported',
		img:      'dist/img/'
	}
}

var production = argv.prod || false;

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

var onError = function (err) {
	console.log('*********************************************');
	if (err.fileName) {
		console.log ( gutil.colors.bgRed.white('Filename: ', path.basename(err.fileName)) );
	} else if (err.plugin) {
		console.log ( gutil.colors.bgRed.white('Plugin: ', path.basename(err.plugin)) );
	} else {
		console.log ( gutil.colors.bgRed.white('Compiation error.') );
	}
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
// Bootstrap
// -----------------------------------------------------------------------------



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
			customProperties: {
				variables: cssVars
			},
			calc: false,
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
	.pipe( postcss(postcssProcessors, {map: !production}) )
	.on('error', onError)
	.pipe( gulpif( production,
				cssnano({
					autoprefixer: false,
					zindex: false
				})
			)
	)
	.pipe( rename({ suffix: '.min' }) )
	.pipe( gulp.dest(filePaths.dest.css) )
	.pipe( livereload() );
}

function watchCss() {
	gulp.watch( path.join(filePaths.src.css, '**/*.css'), ['build:css'])
	gulp.watch( path.join('./cssvars.json'), ['build:css'])
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
	del( path.join(filePaths.dest.img, '*.{jpg,png,gif,svg}') );
	return gulp.src( path.join(filePaths.src.img, '**/*.{jpg,png,gif,svg}') )
	.pipe( imagemin({
		optimizationLevel: 3,
		progressive: true,
		interlaced: true,
		multipass: true,
		svgoPlugins: [{removeViewBox: false}],
		use: [pngquant()]
	}) )
	.pipe(gulp.dest(filePaths.dest.img));
}

gulp.task('build:img', buildImg);

// -----------------------------------------------------------------------------
// Images
// -----------------------------------------------------------------------------

function createBundle(bundler) {
	return bundler.bundle()
	.on('error', onError)
	.pipe(source('main.js'))
	.pipe( buffer() )
	.pipe( rename({ suffix: '.min' }) )
	.pipe( gulpif(production, uglify()) )
	.pipe( gulp.dest(filePaths.dest.js) )
	.pipe( livereload() );
}

// -----------------------------------------------------------------------------
// Javascript
// -----------------------------------------------------------------------------

function buildJs(){
	var bundler = browserify(filePaths.src.js);
	createBundle(bundler);
}
function watchJs(){
	var bundler = browserify(filePaths.src.js);
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
});

gulp.task('default', ['webserver', 'watch']);
