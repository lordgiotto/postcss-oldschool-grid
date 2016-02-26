'use strict'

var generalRule = require('./general.js');
var util = require('util');

function wrapperRule(rule){
	generalRule.call(this, rule);
}

wrapperRule.prototype.parse = function(){
	var maxWidth = this.getParam(0, 'wrapperWidth');
	var wrapperPadding = this.getOption('wrapperPadding');
	this.addDecl({prop: 'width', value: '100%'});
	this.addDecl({prop: 'margin-left', value: 'auto'});
	this.addDecl({prop: 'margin-right', value: 'auto'});
	if (maxWidth) {
		this.addDecl({prop: 'max-width', value: maxWidth.raw});
	}
	if (wrapperPadding) {
		this.addDecl({prop: 'padding-left', value: wrapperPadding.raw});
		this.addDecl({prop: 'padding-right', value: wrapperPadding.raw});
	}
	// this.addDecl({prop: 'margin', value: '0 auto'}),
	// this.addDecl({prop: 'padding', value: '0 ' + padding})
	this.setBorderBox();
}

util.inherits(wrapperRule, generalRule);

module.exports = wrapperRule;
