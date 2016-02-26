'use strict'

var generalRule = require('./general.js');
var util = require('util');
var format = require("string-template");


function colRule(rule){
	generalRule.call(this, rule);
}

colRule.prototype.parse = function(){
	var colsNum = this.getParam(0, 'totalColumns').value;
	var totalCols = this.getOption('totalColumns').value;
	var gutter = this.getOption('gutterWidth');
	var verticalSpace = this.getOption('verticalSpace');
	this.addDecl({prop: 'position', value: 'relative'});
	this.addDecl({prop: 'float', value: 'left'});
	if (colsNum && totalCols) {
		this.addDecl({prop: 'width', value: (colsNum / totalCols * 100) + '%' });
	}
	if (gutter) {
		this.addDecl({prop: 'padding-left', value: gutter.value/2 + gutter.unit});
		this.addDecl({prop: 'padding-right', value: gutter.value/2 + gutter.unit});
	}
	if (verticalSpace) {
		this.addDecl({prop: 'padding-top', value: verticalSpace.value/2 + verticalSpace.unit});
		this.addDecl({prop: 'padding-bottom', value: verticalSpace.value/2 + verticalSpace.unit});
	}
	this.parent.isCol = true;
}

util.inherits(colRule, generalRule);

module.exports = colRule;
