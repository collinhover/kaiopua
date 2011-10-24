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

	// pointOnBody is in body coords
	/**
	 * @author Muzer(muzerly@gmail.com)
	 * 
	 * @name JConstraintWorldPoint
	 * @class JConstraintWorldPoint a constraint that links a point on a body to a point in the world
	 * @extends JConstraint
	 * @requires Vector3DUtil
	 * @requires JMatrix3D
	 * @requires JNumber3D
	 * @property {number} _minVelForProcessing the lower velocity threshold below which the constraint is not processed
	 * @property {number} allowedDeviation how much the points are allowed to deviate
	 * @property {number} timescale the timescale over which deviation is eliminated
	 * @property {RigidBody} _body the body to be constrained
	 * @property {array} _pointOnBody the point on _body
	 * @property {array} _worldPosition the point in the world
	 * @constructor
	 * @param {RigidBody} body the body to constrain
	 * @param {array} pointOnBody point on the body, in body coordinates, expressed as a 3D vector
	 * @param {array} worldPosition the point in the world to which the body should be constrained
	 **/
	var JConstraintWorldPoint=function(body, pointOnBody, worldPosition) {
		this.Super();
		this._body = body;
		this._pointOnBody = pointOnBody;
		this._worldPosition = worldPosition;
		body.addConstraint(this);
	};
	jigLib.extend(JConstraintWorldPoint,jigLib.JConstraint);

	JConstraintWorldPoint.prototype.minVelForProcessing = 0.001;
	JConstraintWorldPoint.prototype.allowedDeviation = 0.01;
	JConstraintWorldPoint.prototype.timescale = 4;
				
	JConstraintWorldPoint.prototype._body=null;
	JConstraintWorldPoint.prototype._pointOnBody=null;
	JConstraintWorldPoint.prototype._worldPosition=null;
	

	/**
	 * @function set_worldPosition setter for _worldPosition
	 * @param {array} pos a 3D vector
	 * @type void
	 **/
	JConstraintWorldPoint.prototype.set_worldPosition=function(pos){
		this._worldPosition = pos;
	};
				
	/**
	 * @function get_worldPosition getter for _worldPosition
	 * @type array
	 **/
	JConstraintWorldPoint.prototype.get_worldPosition=function(){
		return this._worldPosition;
	};
				
	/**
	 * @function apply enforce the constraint
	 * @param {number} dt a UNIX timestamp
	 * @type boolean
	 **/
	JConstraintWorldPoint.prototype.apply=function(dt){
		this.set_satisfied(true);

		var worldPos = this._pointOnBody.slice(0);
		JMatrix3D.multiplyVector(this._body.get_currentState().get_orientation(), worldPos);
		worldPos = Vector3DUtil.add(worldPos, this._body.get_currentState().position);
		var R = Vector3DUtil.subtract(worldPos, this._body.get_currentState().position);
		var currentVel = Vector3DUtil.add(this._body.get_currentState().linVelocity, 
										  Vector3DUtil.crossProduct(this._body.get_currentState().rotVelocity, R));
						
		var desiredVel;
		var deviationDir;
		var deviation= Vector3DUtil.subtract(worldPos, this._worldPosition);
		var deviationDistance = Vector3DUtil.get_length(deviation);
		if (deviationDistance > this.allowedDeviation) {
			deviationDir = JNumber3D.getDivideVector(deviation, deviationDistance);
			desiredVel = JNumber3D.getScaleVector(deviationDir, (this.allowedDeviation - deviationDistance) / (this.timescale * dt));
		} else {
			desiredVel = [0,0,0,0];
		}
						
		var N = Vector3DUtil.subtract(currentVel, desiredVel);
		var normalVel = Vector3DUtil.get_length(N);
		if (normalVel < this.minVelForProcessing) {
			return false;
		}
		N = JNumber3D.getDivideVector(N, normalVel);
		
		var tempV = Vector3DUtil.crossProduct(R, N);
		JMatrix3D.multiplyVector(this._body.get_worldInvInertia(), tempV);
		var denominator= this._body.get_invMass() + Vector3DUtil.dotProduct(N, Vector3DUtil.crossProduct(tempV, R));
						 
		if (denominator < JNumber3D.NUM_TINY) {
			return false;
		}
						 
		var normalImpulse = -normalVel / denominator;
						
		this._body.applyWorldImpulse(JNumber3D.getScaleVector(N, normalImpulse), worldPos);
						
		this._body.setConstraintsAndCollisionsUnsatisfied();
		this.set_satisfied(true);
						
		return true;
	};
	
	jigLib.JConstraintWorldPoint=JConstraintWorldPoint;
	
})(jigLib);