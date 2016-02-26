'use strict'

var generalRule = require('./general.js');
var util = require('util');

function pullRule(rule){
	generalRule.call(this, rule);
}

pullRule.prototype.parse = function(){
	var offset = this.getParam(0, 0).value;
	var totalCols = this.getOption('totalColumns').value;
	if (offset && totalCols) {
		this.addDecl({prop: 'right', value: (offset / totalCols * 100) + '%'});
	}
}

util.inherits(pullRule, generalRule);

module.exports = pullRule;
