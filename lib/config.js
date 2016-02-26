'use strict'

var util = require('util');
var camelCase = require('camel-case');

const allowedOptions = {
	wrapperWidth: {
		type: ['string', 'number'],
		defaultValue: '1024px'
	},
	wrapperPadding: {
		type: ['string', 'number', 'boolean'],
		defaultValue: true,
		fallbackOption: 'gutterWidth'
	},
	totalColumns: {
		type: ['string', 'number'],
		defaultValue: 12
	},
	gutterWidth:{
		type: ['string', 'number'],
		defaultValue: '30px'
	},
	verticalSpace:{
		type: ['string', 'number', 'boolean'],
		defaultValue: false,
		fallbackOption: 'gutterWidth'
	},
	debugMode:{
		type: ['boolean'],
		defaultValue: false
	}
}

function config(){
	this.options = {};

	this.warn = console.log.bind(console);
	this.init();
}

config.prototype.init = function(){
	this.options = {};
	for (var option in allowedOptions) {
		if (allowedOptions.hasOwnProperty(option)) {
			var defaultValue = allowedOptions[option].defaultValue;
			this.setOption(option, defaultValue)
		}
	}
}

config.prototype.setOption = function(name, value) {
	var name = camelCase(name);
	var value = this.normalizeValue(value);
	if ( !allowedOptions.hasOwnProperty(name) )
		return this.warn('Ingored ' + name + ': unrecognized option ');
	if ( allowedOptions[name].type.indexOf(typeof value) === -1)
		return this.warn('Option ' + name + ' has to be ' + allowedOptions[name].type.join(' or '));
	if ( util.isNullOrUndefined(value) )
		return this.warn('Undefined value for option ' + name);
	this.options[name] = typeof value === 'boolean' ? value : this.parseValue(value);
}

config.prototype.mergeOptions = function(opts){
	this.init();
	for (var option in opts) {
		if (opts.hasOwnProperty(option)) {
			this.setOption(option, opts[option]);
		}
	}
}

config.prototype.getOption = function(optName){
	if ( !this.options.hasOwnProperty(optName) )
		throw new Error('Trying to get undefined option: ' + optName);
	var option = this.options[optName];
	if (option === true)
		return allowedOptions[optName].hasOwnProperty('fallbackOption') ? this.getOption(allowedOptions[optName].fallbackOption) : true;
	if (option === false)
		return false;
	return option.hasOwnProperty('value') && option.value > 0 ? option : false;
}

config.prototype.getDefaultValue = function(optName) {
	if ( !allowedOptions.hasOwnProperty(optName) )
		throw new Error('Default Value not existing for option: ' + optName);
	return this.parseValue(allowedOptions[optName].defaultValue);
}

config.prototype.normalizeValue = function(value){
	switch (value) {
		case 'true':
			return true;
			break;
		case 'false':
			return false;
			break;
		default:
			return value;
	}
}

config.prototype.parseValue = function(value){
	switch (true) {
		case util.isNumber(value):
			return {
				raw: value,
				value: value,
				unit: 'px'
			};
			break;
		case util.isString(value):
			var parsedValue = value.match(/(\d+)([a-z]+)?/i) || [];
			return {
				raw: value,
				value: parseInt(parsedValue[1]) || 0,
				unit: parsedValue[2] || ''
			};
			break;
		case util.isBoolean(value):
			return !!value;
			break;
		default:
			return {
				raw: '',
				value: 0,
				unit: ''
			};
	}
}

module.exports = new config();
