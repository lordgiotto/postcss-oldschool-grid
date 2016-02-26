'use strict'

var postcss = require('postcss');
var rules = require('./lib/atRules');
var config = require('./lib/config');

var oldFashionedGrid = postcss.plugin('postcss-oldschool-grid', function (opts) {
	return function(css, result){
		config.warn = result.warn.bind(result);
		config.mergeOptions(opts);
		css.walkAtRules(function(rule){
			var ruleName = rule.name.trim();
			if (ruleName === 'media' || ruleName === 'import') {return;} // Dont lose your time!!
			if (rules.hasOwnProperty(ruleName)) {
				var appliedRule = new rules[ruleName](rule);
				appliedRule.warns.forEach(function(message){
					result.warn(message);
				});
			}
		});
	}
});

module.exports = oldFashionedGrid;
