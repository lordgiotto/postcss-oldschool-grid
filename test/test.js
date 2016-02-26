var util = require('util');
var path = require('path');
var fs = require('fs');
var assert = require('assert');
var postcss = require('postcss');
var ofg = require('../');

var fixturesFolder = path.join(__dirname, 'fixtures');

var config = getConfig();

describe('CSS Grid Functions', function(){
	config.tests.forEach(function(test){
		var comment = util.format('/*%s (%s)*/\n/*%s*/\n', test.name, test.method, test.description);
		var prepend = test.prepend || '';
		var options = test.config || {};
		var expected = test.expected;
		var testName = util.format("%s (%s): %s", test.name, test.method, test.description);
		it(testName, function(done){
			postcss( [new ofg(options)] )
			.process(prepend + test.input)
			.then(function(result){
				var structure = {};
				result.root.walkRules(function(rule){
					structure[rule.selector] = {}
					rule.walkDecls(function(decl){
						structure[rule.selector][decl.prop] = decl.value;
					})
				})
				try {
					assert.deepEqual(expected, structure);
					done();
				} catch (e) {
					done(e);
				}
				// try {
				// 	assert.equal(outputCss, comment + result.css);
				// 	done();
				// } catch (e) {
				// 	done(e);
				// }
			})
			.catch(function(e){
				console.log('\nERROR\n***\n%s\n***', e);
			})
		})
	})
})

function getConfig() {
	var configFile = fs.readFileSync(path.join(__dirname, 'test.json'));
	try {
		return config = JSON.parse(configFile);
	} catch (e) {
		throw e;
	}
}
