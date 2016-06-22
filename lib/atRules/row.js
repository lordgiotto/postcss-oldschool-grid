'use strict'

var util = require('util');
var generalRule = require('./general.js');

function rowRule(rule){
	generalRule.call(this, rule);
}

rowRule.prototype.parse = function(){
	var gutter = this.getOption('gutterWidth');
	var verticalSpace = this.getOption('verticalSpace');
	var wrapperPadding = this.getOption('wrapperPadding');
	if (gutter) {
		this.addDecl({prop: 'padding-left', value: gutter.value/2 + gutter.unit});
		this.addDecl({prop: 'padding-right', value: gutter.value/2 + gutter.unit});
	}
	if (verticalSpace) {
		this.addDecl({prop: 'padding-top', value: verticalSpace.value/2 + verticalSpace.unit});
		this.addDecl({prop: 'padding-bottom', value: verticalSpace.value/2 + verticalSpace.unit});
	}
	if (wrapperPadding) {
		this.addDecl({prop: 'margin-left', value: '-' + wrapperPadding.raw});
		this.addDecl({prop: 'margin-right', value: '-' + wrapperPadding.raw});
	}
	// this.addDecl({prop: 'margin', value: '0 -' + wrapperPadding.value/2 + wrapperPadding.unit});
	this.addClearfix();
}

rowRule.prototype.debug = function(){
	this.debugGrid();
}

util.inherits(rowRule, generalRule);

module.exports = rowRule;
