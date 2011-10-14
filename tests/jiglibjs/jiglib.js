/**
 * @name jigLib
 * @class jigLib the main library class
 * @constructor
 **/
jigLib={};

/**
 * @function extend handles class inheritance
 * @param {} dest the child class
 * @param {} source the parent class
 * @type void
 **/
jigLib.extend=function(dest,source){
	for(proto in source.prototype){
		dest.prototype[proto]=source.prototype[proto];
	}
	dest.prototype.Super=source;
};