'use strict'

var generalRule = require('./general.js');
var util = require('util');

function borderboxRule(rule){
	this.allowedParents = ['rule', 'atrule', 'root'];
	generalRule.call(this, rule);
}

borderboxRule.prototype.parse = function(){
	this.setBorderBox();
}

util.inherits(borderboxRule, generalRule);

module.exports = borderboxRule;
