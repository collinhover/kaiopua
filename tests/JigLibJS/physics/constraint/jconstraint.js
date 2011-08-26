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
	 * @name JConstraint
	 * @class JConstraint the base class for constraints
	 * @property {boolean} _satisfied flag indicating whether this constraint has been satisfied
	 * @property {boolean} _constraintEnabled flag indicating whether this constraint is registered with the physics system
	 * @constructor
	 **/
	var JConstraint=function(){
		this._constraintEnabled = false;
		this.enableConstraint();
	};
	JConstraint.prototype._satisfied=null;
	JConstraint.prototype._constraintEnabled=null;

	/**
	 * @function set_satisfied setter for the _satisfied flag
	 * @param {boolean} s
	 * @type void
	 **/
	JConstraint.prototype.set_satisfied=function(s){
		this._satisfied = s;
	};

	/**
	 * @function get_satisfied getter for the _satisfied flag
	 * @type boolean
	 **/
	JConstraint.prototype.get_satisfied=function(){
		return this._satisfied;
	};

	/**
	 * @function preApply prepare for applying constraints - subsequent calls to
	 * apply will all occur with a constant position i.e. precalculate everything possible 
	 * @param {number} dt a UNIX timestamp
	 * @type void
	 **/
	JConstraint.prototype.preApply=function(dt){
		this._satisfied = false;
	};

	/**
	 * @function apply enforces the constraint using impulses. Return value
	 * indicates if any impulses were applied. If impulses were applied
	 * the derived class should call SetConstraintsUnsatisfied() on each
	 * body that is involved.
	 * @param {number} dt a UNIX timestamp
	 * @type boolean
	 **/
	JConstraint.prototype.apply=function(dt){
		return false;
	};

	/**
	 * @function enableConstraint registers this constraint with the physics system
	 * @type void
	 **/
	JConstraint.prototype.enableConstraint=function(){
		if (this._constraintEnabled)
			return;
		
		this._constraintEnabled = true;
		jigLib.PhysicsSystem.getInstance().addConstraint(this);
	};

	/**
	 * @function disableConstraint de-registers this constraint from the physics system
	 * @type void
	 **/
	JConstraint.prototype.disableConstraint=function(){
		if (!this._constraintEnabled)
			return;
		
		this._constraintEnabled = false;
		jigLib.PhysicsSystem.getInstance().removeConstraint(this);
	};

	/**
	 * @function get_constraintEnabled determines whether this constraint is registered with the physics system
	 * @type boolean
	 **/
	JConstraint.prototype.get_constraintEnabled=function(){
		return this._constraintEnabled;
	};
	
	jigLib.JConstraint=JConstraint;
	
})(jigLib);