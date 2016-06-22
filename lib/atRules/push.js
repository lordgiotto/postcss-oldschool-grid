'use strict'

var generalRule = require('./general.js');
var util = require('util');

function pushRule(rule){
	generalRule.call(this, rule);
}

pushRule.prototype.parse = function(){
	var offset = this.getParam(0, 0).value;
	var totalCols = this.getOption('totalColumns').value;
	if (offset !== false && totalCols) {
		this.addDecl({prop: 'left', value: (offset / totalCols * 100) + '%'});
	}
}

util.inherits(pushRule, generalRule);

module.exports = pushRule;
