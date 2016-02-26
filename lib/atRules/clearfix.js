'use strict'

var generalRule = require('./general.js');
var util = require('util');

function clearfixRule(rule){
	generalRule.call(this, rule);
}

clearfixRule.prototype.parse = function(){
	this.addClearfix();
}

util.inherits(clearfixRule, generalRule);

module.exports = clearfixRule;
