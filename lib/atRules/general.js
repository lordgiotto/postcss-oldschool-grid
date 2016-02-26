'use strict'

var util = require('util');
var postcss = require('postcss');
var format = require("string-template");
var config = require('../config');

var generalRule = function(rule){
	this.rule = rule;
	this.parent = rule.parent;
	this.allowedParents = this.allowedParents || ['rule'];
	this.rawParams = rule.params;
	this.params = {};
	this.warns = [];
	this.init();
}

generalRule.prototype.init = function(){
	if (this.allowedParents.indexOf(this.parent.type) !== -1) {
		this.parseParams();
		this.parse();
	} else {
		var warnMessage = util.format('Can\'t apply "%s" inside %s', this.rule.name, this.getParentName());
		this.warns.push(warnMessage);
	}
	if (this.getOption('debugMode') === true) {
		this.debug();
	}
	this.removeMe();
}

generalRule.prototype.getParentName = function() {
	switch (this.parent.type) {
		case 'root':
			return 'CSS Root';
			break;
		case 'atrule':
			return '@' + this.parent.name;
			break;
		case 'rule':
			return this.parent.selector;
			break;
		default:
			return 'undefined rule';
			break;
	}
};

generalRule.prototype.parseParams = function(){
	if (this.rawParams) {
		this.params = postcss.list.space(this.rawParams).map(function(value){
			return config.parseValue(value);
		});
	}
}

generalRule.prototype.getParam = function(index, fallback) {
	return typeof this.params[index] === 'object' ? this.params[index] : this.getOption(fallback);
}

generalRule.prototype.getOption = config.getOption.bind(config);

generalRule.prototype.setOption = config.setOption.bind(config);

generalRule.prototype.addDecl = function(declaration){
	var newDecl = postcss.decl({prop: declaration.prop, value: declaration.value});
	newDecl.moveBefore(this.rule);
}

generalRule.prototype.removeMe = function() {
	this.rule.remove();
}

generalRule.prototype.addClearfix = function(){
	var parent = this.rule.parent;
	var before = postcss.rule({ selector: parent.selector + ':before' });
	var after = postcss.rule({ selector: parent.selector + ':after' });
	this.rule.parent.insertBefore(
		this.rule,
		[
			postcss.decl({prop: 'zoom', value: '1'}),
		]
	)
	before.append(
		postcss.decl({prop: 'content', value: '""'}),
		postcss.decl({prop: 'display', value: 'table'})
	)
	after.append(
		postcss.decl({prop: 'content', value: '""'}),
		postcss.decl({prop: 'display', value: 'table'}),
		postcss.decl({prop: 'clear', value: 'both'})
	);
	before.moveAfter(parent);
	after.moveAfter(parent);
}

generalRule.prototype.setBorderBox = function(){
	var parent = this.rule.parent;
	if (parent.type === 'rule') {
		var all = postcss.rule({ selectors: [parent.selector + ' *', parent.selector + ' *:after', parent.selector + ' *:before'] });
		this.rule.parent.insertAfter(
			this.rule,
			postcss.decl({prop: 'box-sizing', value: 'border-box'})
		)
		all.append(
			postcss.decl({prop: 'box-sizing', value: 'border-box'})
		)
		all.moveAfter(parent);
	} else if (parent.type === 'root' || parent.type === 'atrule') {
		var all = postcss.rule({ selectors: ['*', '*:after', '*:before'] });
		all.append(
			postcss.decl({prop: 'box-sizing', value: 'border-box'})
		)
		parent.prepend(all);
	}
}

generalRule.prototype.debugGrid = function() {
	var gutter = this.getOption('gutterWidth');
	var totalCols = this.getOption('totalColumns').value;
	var stripe = format(
		'{colorGutter} 0, {colorGutter} calc(0% + {gutter}), {colorCol} calc(0% + {gutter}), {colorCol} calc(99.99% * 1/{totalCols} - ({gutter}/{totalCols}))',
		{
			colorGutter: 'rgba(155, 89, 182,.1)',
			colorCol: 'rgba(155, 89, 182, 0.3)',
			totalCols: totalCols,
			halfGutter: gutter.value / 2 + gutter.unit,
			gutter: gutter.raw
		}
	)
	this.addDecl({prop: 'background-image', value: 'repeating-linear-gradient(to right, ' + stripe + ')'});
}

generalRule.prototype.parse = function() {
}

generalRule.prototype.debug = function() {
}

module.exports = generalRule;
