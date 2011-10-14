/*
   Copyright (c) 2007 Danny Chapman
   http://www.rowlhouse.co.uk

   This software is provided 'as-is', without any express or implied
   warranty. In no event will the authors be held liable for any damages
   arising from the use of this software.
   Permission is granted to anyone to use this software for any purpose,
   including commercial applications, and to alter it and redistribute it
   freely, subject to the following restrictions:
   1. The origin of this software must not be misrepresented; you must not
   claim that you wrote the original software. If you use this software
   in a product, an acknowledgment in the product documentation would be
   appreciated but is not required.
   2. Altered source versions must be plainly marked as such, and must not be
   misrepresented as being the original software.
   3. This notice may not be removed or altered from any source
   distribution.
 */

(function(jigLib){
	 
	/**
	 * @author Muzer(muzerly@gmail.com)
	 * 
	 * @name MaterialProperties
	 * @class MaterialProperties 
	 * @property {number} _restitution
	 * @property {number} _friction
	 * @constructor
	 * @param {number} restitution
	 * @param {number} friction
	 **/
	var MaterialProperties=function(restitution, friction){
		if(restitution==null) restitution=0.25;
		if(friction==null) friction=0.25;
		this._restitution = restitution;
		this._friction = friction;
	};
	
	MaterialProperties.prototype._restitution=null;
	MaterialProperties.prototype._friction=null;
	
	/**
	 * @function get_restitution getter for _restitution
	 * @type number
	 **/
	MaterialProperties.prototype.get_restitution=function(){
		return this._restitution;
	};

	/**
	 * @function set_restitution setter for _restitution
	 * @param {number} restitution
	 * @type void
	 **/
	MaterialProperties.prototype.set_restitution=function(restitution){
		this._restitution = restitution;
	};

	/**
	 * @function get_restitution getter for _friction
	 * @type number
	 **/
	MaterialProperties.prototype.get_friction=function(){
		return this._friction;
	};

	/**
	 * @function get_restitution setter for _friction
	 * @param {number} friction
	 * @type void
	 **/
	MaterialProperties.prototype.set_friction=function(friction){
		this._friction = friction;
	};
		
	jigLib.MaterialProperties=MaterialProperties;
	
})(jigLib);