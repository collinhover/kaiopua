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
	var JConstraintMaxDistance=jigLib.JConstraintMaxDistance;
	var JConstraintPoint=jigLib.JConstraintPoint;

	/**
	 * @author Muzer(muzerly@gmail.com)
	 * 
	 * @name HingeJoint
	 * @class HingeJoint hinge connector for two rigid bodies
	 * @extends PhysicsController
	 * @requires Vector3DUtil
	 * @requires JMatrix3D
	 * @requires JNumber3D
	 * @requires JConstraintMaxDistance
	 * @requires JConstraintPoint
	 * @constant {number} MAX_HINGE_ANGLE_LIMIT
	 * @property {array} _hingeAxis
	 * @property {array} _hingePosRel0
	 * @property {RigidBody} body0 the first rigid body 
	 * @property {RigidBody} body1 the second rigid body 
	 * @property {boolean} _usingLimit
	 * @property {boolean} _hingeEnabled
	 * @property {boolean} _broken
	 * @property {number} _damping
	 * @property {number} _extraTorque
	 * @property {array} sidePointConstraints used to store 2 JConstraintMaxDistance instances
	 * @property {JConstraintPoint} midPointConstraint
	 * @property {JConstraintMaxDistance} maxDistanceConstraint
	 * @property {array} r a 3D vector
	 * @constructor
	 * @param {RigidBody} _body0 the first body of the constrained pair
	 * @param {RigidBody} _body1 the second body of the constrained pair
	 * @param {array} _hingeAxis
	 * @param {array} _hingePosRel0
	 * @param {number} hingeHalfWidth
	 * @param {number} hingeFwdAngle
	 * @param {number} hingeBckAngle
	 * @param {number} sidewaysSlack
	 * @param {number} damping
	 **/
	var HingeJoint=function(body0, body1, hingeAxis, hingePosRel0, hingeHalfWidth, hingeFwdAngle, hingeBckAngle, sidewaysSlack, damping){
		this._body0 = body0;
		this._body1 = body1;
		this._hingeAxis = hingeAxis.slice(0);
		this._hingePosRel0 = hingePosRel0.slice(0);
		this._usingLimit = false;
		this._hingeEnabled = false;
		this._broken = false;
		this._damping = damping;
		this._extraTorque = 0;

		Vector3DUtil.normalize(this._hingeAxis);
		var _hingePosRel1 = Vector3DUtil.add(this._body0.get_currentState().position, Vector3DUtil.subtract(this._hingePosRel0, this._body1.get_currentState().position));

		var relPos0a = Vector3DUtil.add(this._hingePosRel0, JNumber3D.getScaleVector(this._hingeAxis, hingeHalfWidth));
		var relPos0b = Vector3DUtil.subtract(this._hingePosRel0, JNumber3D.getScaleVector(this._hingeAxis, hingeHalfWidth));

		var relPos1a = Vector3DUtil.add(_hingePosRel1, JNumber3D.getScaleVector(this._hingeAxis, hingeHalfWidth));
		var relPos1b = Vector3DUtil.subtract(_hingePosRel1, JNumber3D.getScaleVector(this._hingeAxis, hingeHalfWidth));

		var timescale = 1 / 20;
		var allowedDistanceMid = 0.005;
		var allowedDistanceSide = sidewaysSlack * hingeHalfWidth;

		this.sidePointConstraints = [];
		this.sidePointConstraints[0] = new JConstraintMaxDistance(this._body0, relPos0a, this._body1, relPos1a, allowedDistanceSide);
		this.sidePointConstraints[1] = new JConstraintMaxDistance(this._body0, relPos0b, this._body1, relPos1b, allowedDistanceSide);

		this.midPointConstraint = new JConstraintPoint(this._body0, this._hingePosRel0, this._body1, _hingePosRel1, allowedDistanceMid, timescale);

		if (hingeFwdAngle <= this.MAX_HINGE_ANGLE_LIMIT){
			var perpDir = Vector3DUtil.Y_AXIS;
			if (Vector3DUtil.dotProduct(perpDir, this._hingeAxis) > 0.1){
				perpDir[0] = 1;
				perpDir[1] = 0;
				perpDir[2] = 0;
			}
			var sideAxis = Vector3DUtil.crossProduct(this._hingeAxis, perpDir);
			perpDir = Vector3DUtil.crossProduct(sideAxis, this._hingeAxis);
			Vector3DUtil.normalize(perpDir);

			var len = 10 * hingeHalfWidth;
			var hingeRelAnchorPos0 = JNumber3D.getScaleVector(perpDir, len);
			var angleToMiddle = 0.5 * (hingeFwdAngle - hingeBckAngle);
			var hingeRelAnchorPos1 = hingeRelAnchorPos0.slice(0);
			JMatrix3D.multiplyVector(JMatrix3D.getRotationMatrix(this._hingeAxis[0], this._hingeAxis[1], this._hingeAxis[2], -angleToMiddle), hingeRelAnchorPos1);

			var hingeHalfAngle = 0.5 * (hingeFwdAngle + hingeBckAngle);
			var allowedDistance = len * 2 * Math.sin(0.5 * hingeHalfAngle * Math.PI / 180);

			var hingePos = Vector3DUtil.add(this._body1.get_currentState().position, this._hingePosRel0);
			var relPos0c = Vector3DUtil.add(hingePos, Vector3DUtil.subtract(hingeRelAnchorPos0, this._body0.get_currentState().position));
			var relPos1c = Vector3DUtil.add(hingePos, Vector3DUtil.subtract(hingeRelAnchorPos1, this._body1.get_currentState().position));

			this.maxDistanceConstraint = new JConstraintMaxDistance(this._body0, relPos0c, this._body1, relPos1c, allowedDistance);
			this._usingLimit = true;
		}
		if (this._damping <= 0){
			this._damping = -1;
		}else{
			this._damping = JNumber3D.getLimiteNumber(this._damping, 0, 1);
		}

		this.enableHinge();
	};
	jigLib.extend(HingeJoint, jigLib.PhysicsController);
	
	HingeJoint.prototype.MAX_HINGE_ANGLE_LIMIT = 150;
	HingeJoint.prototype._hingeAxis = null;
	HingeJoint.prototype._hingePosRel0 = null;
	HingeJoint.prototype._body0 = null;
	HingeJoint.prototype._body1 = null;
	HingeJoint.prototype._usingLimit = null;
	HingeJoint.prototype._hingeEnabled = null;
	HingeJoint.prototype._broken = null;
	HingeJoint.prototype._damping = null;
	HingeJoint.prototype._extraTorque = null;
	
	HingeJoint.prototype.sidePointConstraints = null;
	HingeJoint.prototype.midPointConstraint = null;
	HingeJoint.prototype.maxDistanceConstraint = null;

	/**
	 * @function enableHinge enable the joint
	 * @type void
	 **/
	HingeJoint.prototype.enableHinge=function(){
		if (this._hingeEnabled) return;
		
		this.midPointConstraint.enableConstraint();
		this.sidePointConstraints[0].enableConstraint();
		this.sidePointConstraints[1].enableConstraint();
		if (this._usingLimit && !this._broken)
			this.maxDistanceConstraint.enableConstraint();

		this.enableController();
		this._hingeEnabled = true;
	};

	/**
	 * @function disableHinge disable the joint
	 * @type void
	 **/
	HingeJoint.prototype.disableHinge=function(){
		if (!this._hingeEnabled) return;

		this.midPointConstraint.disableConstraint();
		this.sidePointConstraints[0].disableConstraint();
		this.sidePointConstraints[1].disableConstraint();

		if (this._usingLimit && !this._broken)
			this.maxDistanceConstraint.disableConstraint();

		this.disableController();
		this._hingeEnabled = false;
	};

	/**
	 * @function breakHinge break the joint
	 * @type void
	 **/
	HingeJoint.prototype.breakHinge=function(){
		if (this._broken) return;

		if (this._usingLimit)
			this.maxDistanceConstraint.disableConstraint();

		this._broken = true;
	};

	/**
	 * @function mendHinge repair the joint
	 * @type void
	 **/
	HingeJoint.prototype.mendHinge=function(){
		if (!this._broken)
			return;

		if (this._usingLimit)
			this.maxDistanceConstraint.enableConstraint();

		this._broken = false;
	};

	/**
	 * @function setExtraTorque setter for _extraTorque
	 * @param {number} torque
	 * @type void
	 **/
	HingeJoint.prototype.setExtraTorque=function(torque){
		this._extraTorque = torque;
	};

	/**
	 * @function getExtraTorque getter for _extraTorque
	 * @type number
	 **/
	HingeJoint.prototype.getHingeEnabled=function(){
		return this._hingeEnabled;
	};

	/**
	 * @function isBroken getter for _broken
	 * @type boolean
	 **/
	HingeJoint.prototype.isBroken=function(){
		return this._broken;
	};

	/**
	 * @function getHingePosRel0 getter for _hingePosRel0
	 * @type array
	 **/
	HingeJoint.prototype.getHingePosRel0=function(){
		return this._hingePosRel0;
	};

	/**
	 * @function updateController updates this physics controller
	 * @see PhysicsSystem.updateController
	 * @param {number} dt a UNIX timestamp
	 * @type void
	 **/
	HingeJoint.prototype.updateController=function(dt){
		if (this._damping > 0){
			var hingeAxis = Vector3DUtil.subtract(this._body1.get_currentState().rotVelocity, this._body0.get_currentState().rotVelocity);
			Vector3DUtil.normalize(hingeAxis);

			var angRot1 = Vector3DUtil.dotProduct(this._body0.get_currentState().rotVelocity, hingeAxis);
			var angRot2 = Vector3DUtil.dotProduct(this._body1.get_currentState().rotVelocity, hingeAxis);

			var avAngRot = 0.5 * (angRot1 + angRot2);
			var frac = 1 - this._damping;
			var newAngRot1= avAngRot + (angRot1 - avAngRot) * frac;
			var newAngRot2= avAngRot + (angRot2 - avAngRot) * frac;

			var newAngVel1 = Vector3DUtil.add(this._body0.get_currentState().rotVelocity, JNumber3D.getScaleVector(hingeAxis, newAngRot1 - angRot1));
			var newAngVel2 = Vector3DUtil.add(this._body1.get_currentState().rotVelocity, JNumber3D.getScaleVector(hingeAxis, newAngRot2 - angRot2));

			this._body0.setAngVel(newAngVel1);
			this._body1.setAngVel(newAngVel2);
		}

		if (this._extraTorque != 0){
			var torque1 = this._hingeAxis.slice(0);
			JMatrix3D.multiplyVector(this._body0.get_currentState().get_orientation(), torque1);
			torque1 = JNumber3D.getScaleVector(torque1, this._extraTorque);

			this._body0.addWorldTorque(torque1);
			this._body1.addWorldTorque(JNumber3D.getScaleVector(torque1, -1));
		}
	};
	
	jigLib.HingeJoint=HingeJoint;
	
})(jigLib);
