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
	var Vector3DUtil=jigLib.Vector3DUtil;
	var JMatrix3D=jigLib.JMatrix3D;
	var JNumber3D=jigLib.JNumber3D;

	/**
	 * @author Muzer(muzerly@gmail.com)
	 * 
	 * @name JConstraintMaxDistance
	 * @class JConstraintMaxDistance a maximum distance constraint
	 * @extends JConstraint
	 * @requires Vector3DUtil
	 * @requires JMatrix3D
	 * @requires JNumber3D
	 * @property {number} _maxVelMag limits the velocity of the constrained bodies
	 * @property {number} _minVelForProcessing the lower velocity threshold below which the constraint is not processed 
	 * @property {RigidBody} _body0 the first body of the constrained pair
	 * @property {RigidBody} _body1 the second body of the constrained pair
	 * @property {array} _body0Pos the position of the first body
	 * @property {array} _body1Pos the position of the second body
	 * @property {number} _maxDistance the maximum allowed distance
	 * @property {array} r0 for internal use
	 * @property {array} r1 for internal use
	 * @property {array} _worldPos for internal use
	 * @property {array} _currentRelPos0 for internal use
	 * @constructor
	 * @param {RigidBody} body0 the first body of the constrained pair
	 * @param {array} body0Pos the position of the first body expressed as a 3D vector
	 * @param {RigidBody} body1 the second body of the constrained pair
	 * @param {array} body1Pos the position of the second body expressed as a 3D vector
	 * @param {number} maxDistance the maximum allowed distance between body0 and body1
	 **/
	var JConstraintMaxDistance=function(body0, body0Pos, body1, body1Pos, maxDistance){
		if(!maxDistance) maxDistance=1;
		this.Super();
		this._body0 = body0;
		this._body0Pos = body0Pos;
		this._body1 = body1;
		this._body1Pos = body1Pos;
		this._maxDistance = maxDistance;
		body0.addConstraint(this);
		body1.addConstraint(this);
	};
	jigLib.extend(JConstraintMaxDistance,jigLib.JConstraint);
	
	JConstraintMaxDistance.prototype._maxVelMag = 20;
	JConstraintMaxDistance.prototype._minVelForProcessing = 0.01;

	JConstraintMaxDistance.prototype._body0=null;
	JConstraintMaxDistance.prototype._body1=null;
	JConstraintMaxDistance.prototype._body0Pos=null;
	JConstraintMaxDistance.prototype._body1Pos=null;
	JConstraintMaxDistance.prototype._maxDistance=null;

	JConstraintMaxDistance.prototype.r0=null;
	JConstraintMaxDistance.prototype.r1=null;
	JConstraintMaxDistance.prototype._worldPos=null;
	JConstraintMaxDistance.prototype._currentRelPos0=null;
	
	/**
	 * @function preApply prepare for applying the constraint
	 * @param {number} dt a UNIX timestamp
	 * @type void
	 **/
	JConstraintMaxDistance.prototype.preApply=function(dt){
		this.set_satisfied(false);
		
		this.r0 = this._body0Pos.slice(0);
		this.r1 = this._body1Pos.slice(0);
		JMatrix3D.multiplyVector(this._body0.get_currentState().get_orientation(), this.r0);
		JMatrix3D.multiplyVector(this._body1.get_currentState().get_orientation(), this.r1);
		//this.r0 = this._body0.get_currentState().get_orientation().transformVector(this._body0Pos.slice(0));
		//this.r1 = this._body1.get_currentState().get_orientation().transformVector(this._body1Pos.slice(0));
		
		var worldPos0 = Vector3DUtil.add(this._body0.get_currentState().position, this.r0);
		var worldPos1 = Vector3DUtil.add(this._body1.get_currentState().position, this.r1);
		this._worldPos = JNumber3D.getScaleVector(Vector3DUtil.add(worldPos0, worldPos1), 0.5);

		this._currentRelPos0 = Vector3DUtil.subtract(worldPos0, worldPos1);
	};

	/**
	 * @function apply enforce the constraint
	 * @param {number} dt a UNIX timestamp
	 * @type boolean
	 **/
	JConstraintMaxDistance.prototype.apply=function(dt){
		this.set_satisfied(true);

		if (!this._body0.isActive && !this._body1.isActive)
			return false;
		
		var currentVel0 = this._body0.getVelocity(this.r0);
		var currentVel1 = this._body1.getVelocity(this.r1);

		var predRelPos0 = Vector3DUtil.add(this._currentRelPos0, JNumber3D.getScaleVector(Vector3DUtil.subtract(currentVel0, currentVel1), dt));
		var clampedRelPos0 = predRelPos0.slice(0);
		var clampedRelPos0Mag = Vector3DUtil.get_length(clampedRelPos0);
		
		if (clampedRelPos0Mag <= JNumber3D.NUM_TINY)
			return false;
		
		if (clampedRelPos0Mag > this._maxDistance)
			clampedRelPos0 = JNumber3D.getScaleVector(clampedRelPos0, this._maxDistance / clampedRelPos0Mag);

		var desiredRelVel0 = JNumber3D.getDivideVector(Vector3DUtil.subtract(clampedRelPos0, this._currentRelPos0), dt);
		var Vr = Vector3DUtil.subtract(Vector3DUtil.subtract(currentVel0, currentVel1), desiredRelVel0);

		var normalVel = Vector3DUtil.get_length(Vr);
		if (normalVel > this._maxVelMag){
			Vr = JNumber3D.getScaleVector(Vr, this._maxVelMag / normalVel);
			normalVel = this._maxVelMag;
		}else if (normalVel < this._minVelForProcessing){
			return false;
		}

		var N = JNumber3D.getDivideVector(Vr, normalVel);
		
		var tempVec1 = Vector3DUtil.crossProduct(this.r0, N);
		JMatrix3D.multiplyVector(this._body0.get_worldInvInertia(), tempVec1);
		
		var tempVec2 = Vector3DUtil.crossProduct(this.r1, N);
		JMatrix3D.multiplyVector(this._body1.get_worldInvInertia(), tempVec2);
		
		var denominator = this._body0.get_invMass()  
						+ this._body1.get_invMass() 
						+ Vector3DUtil.dotProduct(N, Vector3DUtil.crossProduct(tempVec1, this.r0)) 
						+ Vector3DUtil.dotProduct(N, Vector3DUtil.crossProduct(tempVec2, this.r1));

		if (denominator < JNumber3D.NUM_TINY)
			return false;

		var normalImpulse = JNumber3D.getScaleVector(N, -normalVel / denominator);
		this._body0.applyWorldImpulse(normalImpulse, this._worldPos);
		this._body1.applyWorldImpulse(JNumber3D.getScaleVector(normalImpulse, -1), this._worldPos);

		this._body0.setConstraintsAndCollisionsUnsatisfied();
		this._body1.setConstraintsAndCollisionsUnsatisfied();
		this.set_satisfied(true);
		return true;
	};
	
	jigLib.JConstraintMaxDistance=JConstraintMaxDistance;
	
})(jigLib);