'use strict'

var generalRule = require('./general.js');
var util = require('util');

function gridRule(rule){
	this.allowedParents = ['root'];
	generalRule.call(this, rule);
}

gridRule.prototype.parse = function(){
	var self = this;
	this.rule.walkDecls(function(decl){
		self.setOption(decl.prop, decl.value);
	})
}

util.inherits(gridRule, generalRule);

module.exports = gridRule;
