'use strict'

var generalRule = require('./general.js');
var util = require('util');

function debugRule(rule){
	generalRule.call(this, rule);
}

debugRule.prototype.parse = function(){
	this.debugGrid();
}

util.inherits(debugRule, generalRule);

module.exports = debugRule;
