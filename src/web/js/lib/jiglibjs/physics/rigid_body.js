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
	var JConfig=jigLib.JConfig;
	var Matrix3D=jigLib.Matrix3D;
	var JMatrix3D=jigLib.JMatrix3D;
	var JNumber3D=jigLib.JNumber3D;
	var MaterialProperties=jigLib.MaterialProperties;
	var PhysicsState=jigLib.PhysicsState;
	var PhysicsSystem=jigLib.PhysicsSystem;
	var JAABox=jigLib.JAABox;
	var JCollisionEvent=jigLib.JCollisionEvent;
	
	/**
	 * @name RigidBody
	 * @class RigidBody a body in the physics simulation
	 * @requires Vector3DUtil
	 * @requires JConfig
	 * @requires Matrix3D
	 * @requires JMatrix3D
	 * @requires JNumber3D
	 * @requires MaterialProperties
	 * @requires PhysicsState
	 * @requires PhysicsSystem
	 * @requires JAABox
	 * @property {number} idCounter
	 * @property {number} _id
	 * @property {ISkin3D} _skin
	 * @property {string} _type
	 * @property {number} _boundingSphere
	 * @property {JAABox} _boundingBox
	 * @property {PhysicsState} _currState
	 * @property {PhysicsState} _oldState
	 * @property {PhysicsState} _storeState
	 * @property {Matrix3D} _invOrientation
	 * @property {array} _currLinVelocityAux a 3D vector
	 * @property {array} _currRotVelocityAux a 3D vector
	 * @property {number} _mass
	 * @property {number} _invMass
	 * @property {Matrix3D} _bodyInertia
	 * @property {Matrix3D} _bodyInvInertia
	 * @property {Matrix3D} _worldInertia
	 * @property {Matrix3D} _worldInvInertia
	 * @property {array} _force a 3D vector
	 * @property {array} _torque a 3D vector
	 * @property {array} _linVelDamping a 3D vector
	 * @property {array} _rotVelDamping a 3D vector
	 * @property {number} _maxLinVelocities
	 * @property {number} _maxRotVelocities
	 * @property {boolean} _velChanged
	 * @property {boolean} _activity
	 * @property {boolean} _movable
	 * @property {boolean} _origMovable
	 * @property {number} _inactiveTime
	 * @property {boolean} _doShockProcessing
	 * @property {RigidBody} _bodiesToBeActivatedOnMovement the list of bodies that need to be activated when we move away from our stored position
	 * @property {array} _storedPositionForActivation a 3D vector the position stored when we need to notify other bodies
	 * @property {array} _lastPositionForDeactivation a 3D vector last position for when trying the deactivate
	 * @property {Matrix3D} _lastOrientationForDeactivation last orientation for when trying to deactivate
	 * @property {MaterialProperties} _material
	 * @property {number} _rotationX
	 * @property {number} _rotationY
	 * @property {number} _rotationZ
	 * @property {boolean} _useDegrees
	 * @property {array} _nonCollidables a collection of RigidBody objects
	 * @property {array} _constraints a collection of JConstraint objects
	 * @property {array} collisions a collection of CollisionInfo objects
	 * @property {boolean} isActive
	 * @property {number} minImpulseForCollisionEvent the minimum total absolute impulse required to trigger a collision event
	 * @constructor
	 * @param {ISkin3D} _skin
	 **/
	var RigidBody=function(skin){
		// calling "this.Super" causes recursion in inheritance chains 
		// because Super references this class constructor
		//this.Super(skin);
		jigLib.JEventDispatcher.call(this);
		
		this._useDegrees = (JConfig.rotationType == "DEGREES") ? true : false;
		
		this._id = RigidBody.idCounter++;

		this._skin = skin;
		this._material = new MaterialProperties();

		this._bodyInertia = new Matrix3D();
		this._bodyInvInertia = JMatrix3D.getInverseMatrix(this._bodyInertia);

		this._currState = new PhysicsState();
		this._oldState = new PhysicsState();
		this._storeState = new PhysicsState();
		this._invOrientation = JMatrix3D.getInverseMatrix(this._currState.get_orientation());
		this._currLinVelocityAux = [0,0,0,0];
		this._currRotVelocityAux = [0,0,0,0];

		this._force = [0,0,0,0];
		this._torque = [0,0,0,0];
			
		this._linVelDamping = [0.995, 0.995, 0.995, 0];
		this._rotVelDamping = [0.5, 0.5, 0.5, 0];
		this._maxLinVelocities = 500;
		this._maxRotVelocities = 500;

		this._velChanged = false;
		this._inactiveTime = 0;
		
		this._doShockProcessing = true;

		this.isActive = this._activity = true;
		this._movable = true;
		this._origMovable = true;

		this.collisions = [];
		this._constraints = [];
		this._nonCollidables = [];

		this._storedPositionForActivation = [0,0,0,0];
		this._bodiesToBeActivatedOnMovement = [];
		this._lastPositionForDeactivation = this._currState.position.slice(0);
		this._lastOrientationForDeactivation = this._currState.get_orientation().clone();

		this._type = "Object3D";
		this._boundingSphere = 0;
		this._boundingBox = new JAABox([0,0,0,0], [0,0,0,0]);
		this._boundingBox.clear();
	};
	jigLib.extend(RigidBody,jigLib.JEventDispatcher);
	
	RigidBody.idCounter = 0;
	
	RigidBody.prototype._id=null;
	RigidBody.prototype._skin=null;
	RigidBody.prototype._type=null;
	RigidBody.prototype._boundingSphere=null;
	RigidBody.prototype._boundingBox=null;
	RigidBody.prototype._currState=null;
	RigidBody.prototype._oldState=null;
	RigidBody.prototype._storeState=null;
	RigidBody.prototype._invOrientation=null;
	RigidBody.prototype._currLinVelocityAux=null;
	RigidBody.prototype._currRotVelocityAux=null;

	RigidBody.prototype._mass=null;
	RigidBody.prototype._invMass=null;
	RigidBody.prototype._bodyInertia=null;
	RigidBody.prototype._bodyInvInertia=null;
	RigidBody.prototype._worldInertia=null;
	RigidBody.prototype._worldInvInertia=null;

	RigidBody.prototype._force=null;
	RigidBody.prototype._torque=null;
		
	RigidBody.prototype._linVelDamping=null;
	RigidBody.prototype._rotVelDamping=null;
	RigidBody.prototype._maxLinVelocities=null;
	RigidBody.prototype._maxRotVelocities=null;

	RigidBody.prototype._velChanged=null;
	RigidBody.prototype._activity=null;
	RigidBody.prototype._movable=null;
	RigidBody.prototype._origMovable=null;
	RigidBody.prototype._inactiveTime=null;
	RigidBody.prototype._doShockProcessing=null;

	// The list of bodies that need to be activated when we move away from our stored position
	RigidBody.prototype._bodiesToBeActivatedOnMovement=null;

	RigidBody.prototype._storedPositionForActivation=null;// The position stored when we need to notify other bodies
	RigidBody.prototype._lastPositionForDeactivation=null;// last position for when trying the deactivate
	RigidBody.prototype._lastOrientationForDeactivation=null;// last orientation for when trying to deactivate

	RigidBody.prototype._material=null;

	RigidBody.prototype._rotationX = 0;
	RigidBody.prototype._rotationY = 0;
	RigidBody.prototype._rotationZ = 0;
	RigidBody.prototype._useDegrees=null;

	RigidBody.prototype._nonCollidables=null;
	RigidBody.prototype._constraints=null;
	RigidBody.prototype.collisions=null;
	
	RigidBody.prototype.isActive=null;
	RigidBody.prototype.minImpulseForCollisionEvent = 1;
	
	/**
	 * @function dispatchCollisionEvent dispatches a JCollisionEvent
	 * @param {RigidBody} body the other body involved in the collision
	 * @param {Array} impulse a 3D vector representing the impulse applied to this body as a result of the collision
	 */
	RigidBody.prototype.dispatchCollisionEvent=function(body, impulse)
	{
		if (Vector3DUtil.getSum(impulse) < this.minImpulseForCollisionEvent)
			return;
		
		this.dispatchEvent(new JCollisionEvent(body, impulse));
	};
	
	/**
	 * @function radiansToDegrees converts radians to degrees
	 * @param {number} rad
	 * @type number
	 **/
	RigidBody.prototype.radiansToDegrees=function(rad){
		return rad * 180 / Math.PI;
	};
	
	/**
	 * @function degreesToRadians converts degrees to radians
	 * @param {number} deg
	 * @type number
	 **/
	RigidBody.prototype.degreesToRadians=function(deg){
		return deg * Math.PI / 180;
	};
	
	/**
	 * @function get_rotationX gets rotation in the X axis
	 * @type number
	 **/
	RigidBody.prototype.get_rotationX=function(){
		return this._rotationX;//(_useDegrees) ? radiansToDegrees(_rotationX) : _rotationX;
	};
	
	/**
	 * @function get_rotationY gets rotation in the Y axis
	 * @type number
	 **/
	RigidBody.prototype.get_rotationY=function(){
		return this._rotationY;//(_useDegrees) ? radiansToDegrees(_rotationY) : _rotationY;
	};

	/**
	 * @function get_rotationZ gets rotation in the Z axis
	 * @type number
	 **/
	RigidBody.prototype.get_rotationZ=function(){
		return this._rotationZ;//(_useDegrees) ? radiansToDegrees(_rotationZ) : _rotationZ;
	};
	
	/**
	 * @function set_rotationX sets rotation in the X axis
	 * @param {number} px
	 * @type void
	 **/
	RigidBody.prototype.set_rotationX=function(px){
		//var rad:Number = (_useDegrees) ? degreesToRadians(px) : px;
		this._rotationX = px;
		this.setOrientation(this.createRotationMatrix());
	};

	/**
	 * @function set_rotationY sets rotation in the Y axis
	 * @param {number} py
	 * @type void
	 **/
	RigidBody.prototype.set_rotationY=function(py){
		//var rad:Number = (_useDegrees) ? degreesToRadians(py) : py;
		this._rotationY = py;
		this.setOrientation(this.createRotationMatrix());
	};

	/**
	 * @function set_rotationZ sets rotation in the Z axis
	 * @param {number} pz
	 * @type void
	 **/
	RigidBody.prototype.set_rotationZ=function(pz){
		//var rad:Number = (_useDegrees) ? degreesToRadians(pz) : pz;
		this._rotationZ = pz;
		this.setOrientation(this.createRotationMatrix());
	};
	
	/**
	 * @function setRotation sets the rotation angle
	 * @param {array} vect [x,y,z] rotation
	 * @type void
	 **/
	RigidBody.prototype.setRotation=function(vect){
		this._rotationX=vect[0];
		this._rotationY=vect[1];
		this._rotationZ=vect[2];
		this.setOrientation(this.createRotationMatrix());
	};

	/**
	 * @function setRotation sets the pitch angle
	 * @param {number} rot
	 * @type void
	 **/
	RigidBody.prototype.pitch=function(rot){
		this.setOrientation(JMatrix3D.getAppendMatrix3D(this.get_currentState().orientation, JMatrix3D.getRotationMatrixAxis(rot, Vector3DUtil.X_AXIS)));
	};

	/**
	 * @function setRotation sets the yaw angle
	 * @param {number} rot
	 * @type void
	 **/
	RigidBody.prototype.yaw=function(rot){
		this.setOrientation(JMatrix3D.getAppendMatrix3D(this.get_currentState().orientation, JMatrix3D.getRotationMatrixAxis(rot, Vector3DUtil.Y_AXIS)));
	};

	/**
	 * @function setRotation sets the roll angle
	 * @param {number} rot
	 * @type void
	 **/
	RigidBody.prototype.roll=function(rot){
		this.setOrientation(JMatrix3D.getAppendMatrix3D(this.get_currentState().orientation, JMatrix3D.getRotationMatrixAxis(rot, Vector3DUtil.Z_AXIS)));
	};
	
	/**
	 * @function createRotationMatrix returns a rotation matrix based on the current angles of rotation
	 * @type Matrix3D
	 **/
	RigidBody.prototype.createRotationMatrix=function(){
		var matrix3D = new Matrix3D();
		matrix3D.appendRotation(this._rotationX, Vector3DUtil.X_AXIS);
		matrix3D.appendRotation(this._rotationY, Vector3DUtil.Y_AXIS);
		matrix3D.appendRotation(this._rotationZ, Vector3DUtil.Z_AXIS);
		return matrix3D;
	};

	/**
	 * @function setOrientation set orientation using a matrix
	 * @param orient Matrix3D
	 * @type void
	 **/
	RigidBody.prototype.setOrientation=function(orient){
		this._currState.set_orientation(orient.clone());
		this.updateInertia();
		this.updateState();
	};

	/**
	 * @function get_position gets the current position
	 * @returns a 3D vector
	 * @type array
	 **/
	RigidBody.prototype.get_position=function(){
		return this._currState.position;
	};

	/**
	 * @function get_x gets the current position in the X axis
	 * @type number
	 **/
	RigidBody.prototype.get_x=function(){
		return this._currState.position[0];
	};

	/**
	 * @function get_y gets the current position in the Y axis
	 * @type number
	 **/
	RigidBody.prototype.get_y=function(){
		return this._currState.position[1];
	};

	/**
	 * @function get_z gets the current position in the Z axis
	 * @type number
	 **/
	RigidBody.prototype.get_z=function(){
		return this._currState.position[2];
	};

	/**
	 * @function set_x sets the current position in the X axis
	 * @param {number} px
	 * @type void
	 **/
	RigidBody.prototype.set_x=function(px){
		this._currState.position[0] = px;
		this.updateState();
	};

	/**
	 * @function set_x sets the current position in the Y axis
	 * @param {number} py
	 * @type void
	 **/
	RigidBody.prototype.set_y=function(py){
		this._currState.position[1] = py;
		this.updateState();
	};

	/**
	 * @function set_x sets the current position in the Z axis
	 * @param {number} pz
	 * @type void
	 **/
	RigidBody.prototype.set_z=function(pz){
		this._currState.position[2] = pz;
		this.updateState();
	};
	
	/**
	 * @function move_to 
	 * @param {array} pos a 3D vector
	 * @type void
	 **/
	RigidBody.prototype.moveTo=function(pos){
		this._currState.position = pos.slice(0);
		this.updateState();
	};

	/**
	 * @function updateState 
	 * @type void
	 **/
	RigidBody.prototype.updateState=function(){
		this._currState.linVelocity = [0,0,0,0];
		this._currState.rotVelocity = [0,0,0,0];
		this.copyCurrentStateToOld();
		this.updateBoundingBox();
		this.setActive();
	};

	/**
	 * @function setVelocity 
	 * @param {array} vel velocity in each axis expressed as a 3D vector
	 * @param {boolean} local apply velocity in local frame
	 * @type void
	 **/
	RigidBody.prototype.setVelocity=function(vel,local){
		if(!local){
			this._currState.linVelocity = vel.slice(0);
		}else{
			var matrix=this._currState.get_orientation();
			this._currState.linVelocity[0]=matrix.glmatrix[0]*vel[0]+matrix.glmatrix[1]*vel[1]+matrix.glmatrix[2]*vel[2];
			this._currState.linVelocity[1]=matrix.glmatrix[4]*vel[0]+matrix.glmatrix[5]*vel[1]+matrix.glmatrix[6]*vel[2];
			this._currState.linVelocity[2]=matrix.glmatrix[8]*vel[0]+matrix.glmatrix[9]*vel[1]+matrix.glmatrix[10]*vel[2];
		}
	};

	/**
	 * @function setAngVel 
	 * @param {array} angVel a 3D vector
	 * @type void
	 **/
	RigidBody.prototype.setAngVel=function(angVel){
		this._currState.rotVelocity = angVel.slice(0);
	};

	/**
	 * @function setVelocityAux 
	 * @param {array} vel a 3D vector
	 * @type void
	 **/
	RigidBody.prototype.setVelocityAux=function(vel){
		this._currLinVelocityAux = vel.slice(0);
	};

	/**
	 * @function setAngVelAux 
	 * @param {array} angVel a 3D vector
	 * @type void
	 **/
	RigidBody.prototype.setAngVelAux=function(angVel){
		this._currRotVelocityAux = angVel.slice(0);
	};

	/**
	 * @function addGravity 
	 * @type void
	 **/
	RigidBody.prototype.addGravity=function(){
		if (!this._movable){
			return;
		}
		this._force = Vector3DUtil.add(this._force, JNumber3D.getScaleVector(jigLib.PhysicsSystem.getInstance().get_gravity(), this._mass));
		this._velChanged = true;
	};
	
	/**
	 * @function addExternalForces
	 * @param {number} dt a UNIX timestamp 
	 * @type void
	 **/
	RigidBody.prototype.addExternalForces=function(dt){
		this.addGravity();
	};

	/**
	 * @function addWorldTorque
	 * @param {array} t torque expressed as a 3D vector 
	 * @type void
	 **/
	RigidBody.prototype.addWorldTorque=function(t){
		if (!this._movable) return;
		
		this._torque = Vector3DUtil.add(this._torque, t);
		this._velChanged = true;
		this.setActive();
	};

	/**
	 * @function addBodyTorque
	 * @param {array} t torque expressed as a 3D vector 
	 * @type void
	 **/
	RigidBody.prototype.addBodyTorque=function(t){
		if (!this._movable) return;
		
		JMatrix3D.multiplyVector(this._currState.get_orientation(), t);
		this.addWorldTorque(t);
	};

	/**
	 * @function addWorldForce add forces in the world coordinate frame
	 * @param {array} f force expressed as a 3D vector
	 * @param {array} p position of origin of the force expressed as a 3D vector 
	 * @type void
	 **/
	RigidBody.prototype.addWorldForce=function(f, p){
		if (!this._movable) return;
		
		this._force = Vector3DUtil.add(this._force, f);
		this.addWorldTorque(Vector3DUtil.crossProduct(Vector3DUtil.subtract(p, this._currState.position), f));
		this._velChanged = true;
		this.setActive();
	};

	/**
	 * @function addBodyForce add forces in the body coordinate frame
	 * @param {array} f force expressed as a 3D vector
	 * @param {array} p position of origin of the force expressed as a 3D vector 
	 * @type void
	 **/
	RigidBody.prototype.addBodyForce=function(f, p){
		if (!this._movable){
			return;
		}
		JMatrix3D.multiplyVector(this._currState.get_orientation(), f);
		JMatrix3D.multiplyVector(this._currState.get_orientation(), p);
		this.addWorldForce(f, Vector3DUtil.add(this._currState.position, p));
	};

	/**
	 * @function clearForces remove active force and torque
	 * @type void
	 **/
	RigidBody.prototype.clearForces=function(){
		this._force = [0,0,0,0];
		this._torque = [0,0,0,0];
	};
	
	/**
	 * @function applyWorldImpulse add impulses in the world coordinate frame
	 * @param {array} impulse impulse expressed as a 3D vector
	 * @param {array} pos position of origin of the impulse expressed as a 3D vector 
	 * @type void
	 **/
	RigidBody.prototype.applyWorldImpulse=function(impulse, pos){
		if (!this._movable) return;
				
		this._currState.linVelocity = Vector3DUtil.add(this._currState.linVelocity, JNumber3D.getScaleVector(impulse, this._invMass));

		var rotImpulse = Vector3DUtil.crossProduct(Vector3DUtil.subtract(pos, this._currState.position), impulse);
		JMatrix3D.multiplyVector(this._worldInvInertia, rotImpulse);
		this._currState.rotVelocity = Vector3DUtil.add(this._currState.rotVelocity, rotImpulse);

		this._velChanged = true;
	};

	/**
	 * @function applyWorldImpulseAux
	 * @param {array} impulse impulse expressed as a 3D vector
	 * @param {array} pos position of origin of the impulse expressed as a 3D vector 
	 * @type void
	 **/
	RigidBody.prototype.applyWorldImpulseAux=function(impulse, pos){
		if (!this._movable) return;
						
		this._currLinVelocityAux = Vector3DUtil.add(this._currLinVelocityAux, JNumber3D.getScaleVector(impulse, this._invMass));

		var rotImpulse = Vector3DUtil.crossProduct(Vector3DUtil.subtract(pos, this._currState.position), impulse);
		JMatrix3D.multiplyVector(this._worldInvInertia, rotImpulse);
		this._currRotVelocityAux = Vector3DUtil.add(this._currRotVelocityAux, rotImpulse);

		this._velChanged = true;
	};

	/**
	 * @function applyBodyWorldImpulse add impulses in the body coordinate frame
	 * @param {array} impulse impulse expressed as a 3D vector
	 * @param {array} delta impulse delta expressed as a 3D vector 
	 * @type void
	 **/
	RigidBody.prototype.applyBodyWorldImpulse=function(impulse, delta){

		if (!this._movable) return;
				
		this._currState.linVelocity = Vector3DUtil.add(this._currState.linVelocity, JNumber3D.getScaleVector(impulse, this._invMass));
		var rotImpulse = Vector3DUtil.crossProduct(delta, impulse); 
		JMatrix3D.multiplyVector(this._worldInvInertia, rotImpulse);
		this._currState.rotVelocity = Vector3DUtil.add(this._currState.rotVelocity, rotImpulse);

		this._velChanged = true;
	};

	/**
	 * @function applyBodyWorldImpulseAux
	 * @param {array} impulse impulse expressed as a 3D vector
	 * @param {array} delta impulse delta expressed as a 3D vector 
	 * @type void
	 **/
	RigidBody.prototype.applyBodyWorldImpulseAux=function(impulse, delta){
		if (!this._movable) return;
				
		this._currLinVelocityAux = Vector3DUtil.add(this._currLinVelocityAux, JNumber3D.getScaleVector(impulse, this._invMass));

		var rotImpulse = Vector3DUtil.crossProduct(delta, impulse);
		JMatrix3D.multiplyVector(this._worldInvInertia, rotImpulse);
		this._currRotVelocityAux = Vector3DUtil.add(this._currRotVelocityAux, rotImpulse);

		this._velChanged = true;
	};

	/**
	 * @function addConstraint add a constraint to this body
	 * @param {JConstraint} constraint the constraint
	 * @type void
	 **/
	RigidBody.prototype.addConstraint=function(constraint){
		if (!this.findConstraint(constraint)){
			this._constraints.push(constraint);
		}
	};

	/**
	 * @function removeConstraint remove a constraint from this body
	 * @param {JConstraint} constraint the constraint
	 * @type void
	 **/
	RigidBody.prototype.removeConstraint=function(constraint){
		if (this.findConstraint(constraint)){
			this._constraints.splice(this._constraints.indexOf(constraint), 1);
		}
	};

	/**
	 * @function removeAllConstraints remove all constraints from this body
	 * @type void
	 **/
	RigidBody.prototype.removeAllConstraints=function(){
		this._constraints = [];
	};

	/**
	 * @function findConstraint checks if a given constraint is applied to this body
	 * @param {JConstraint} constraint the constraint
	 * @type void
	 **/
	RigidBody.prototype.findConstraint=function(constraint){
		for(var i=0, cl=this._constraints.length; i<cl; i++){
			if (constraint == this._constraints[i]){
				return true;
			}
		}
		return false;
	};

	/**
	 * @function updateVelocity update the velocity/angular rotation with the force/torque
	 * @param {number} dt a UNIX timestamp
	 * @type void
	 **/
	RigidBody.prototype.updateVelocity=function(dt){
		if (!this._movable || !this._activity) 
			return;
		
		this._currState.linVelocity = Vector3DUtil.add(this._currState.linVelocity, JNumber3D.getScaleVector(this._force, this._invMass * dt));

		var rac = JNumber3D.getScaleVector(this._torque, dt);
		JMatrix3D.multiplyVector(this._worldInvInertia, rac);
		this._currState.rotVelocity = Vector3DUtil.add(this._currState.rotVelocity, rac);
	};
	
	/**
	 * @function updateVelocity update the position with the auxiliary velocities, and zeros them
	 * @param {number} dt a UNIX timestamp
	 * @type void
	 **/
	RigidBody.prototype.updatePositionWithAux=function(dt){
		if (!this._movable || !this._activity){
			this._currLinVelocityAux = [0,0,0,0];
			this._currRotVelocityAux = [0,0,0,0];
			return;
		}
		
		var ga = jigLib.PhysicsSystem.getInstance().get_gravityAxis();
		
		if (ga != -1){
			var arr = this._currLinVelocityAux.slice(0);
			arr[(ga + 1) % 3] *= 0.1;
			arr[(ga + 2) % 3] *= 0.1;
			JNumber3D.copyFromArray(this._currLinVelocityAux, arr);
		}

		var angMomBefore = this._currState.rotVelocity.slice(0);
		JMatrix3D.multiplyVector(this._worldInertia, angMomBefore);
		
		this._currState.position = Vector3DUtil.add(this._currState.position, JNumber3D.getScaleVector(Vector3DUtil.add(this._currState.linVelocity, this._currLinVelocityAux), dt));

		var dir = Vector3DUtil.add(this._currState.rotVelocity, this._currRotVelocityAux);
		var ang = Vector3DUtil.get_length(dir) * 180 / Math.PI;
		if (ang > 0){
			Vector3DUtil.normalize(dir);
			ang *= dt;
			var rot = JMatrix3D.getRotationMatrix(dir[0], dir[1], dir[2], ang);
			this._currState.set_orientation(JMatrix3D.getAppendMatrix3D(this._currState.get_orientation(), rot));
				
			this.updateInertia();
		}
		this._currLinVelocityAux = [0,0,0,0];
		this._currRotVelocityAux = [0,0,0,0];
		
		JMatrix3D.multiplyVector(this._worldInvInertia, angMomBefore);
		this._currState.rotVelocity = angMomBefore.slice(0);
			
		this.updateBoundingBox();
	};

	/**
	 * @function postPhysics to be implemented by inheriting classes
	 * @param {number} dt a UNIX timestamp
	 * @type void
	 **/
	RigidBody.prototype.postPhysics=function(dt){};

	/**
	 * @function tryToFreeze provided for the use of Physics system
	 * @param {number} dt a UNIX timestamp
	 * @type void
	 **/
	RigidBody.prototype.tryToFreeze=function(dt){
		if (!this._movable || !this._activity)
			return;
		
		if (Vector3DUtil.get_length(Vector3DUtil.subtract(this._currState.position, this._lastPositionForDeactivation)) > JConfig.posThreshold){
			this._lastPositionForDeactivation = this._currState.position.slice(0);
			this._inactiveTime = 0;
			return;
		}
		
		var ot = JConfig.orientThreshold;
		var deltaMat = JMatrix3D.getSubMatrix(this._currState.get_orientation(), this._lastOrientationForDeactivation);

		var cols = JMatrix3D.getCols(deltaMat);

		if (Vector3DUtil.get_length(cols[0]) > ot || Vector3DUtil.get_length(cols[1]) > ot || Vector3DUtil.get_length(cols[2]) > ot){
			this._lastOrientationForDeactivation = this._currState.get_orientation().clone();
			this._inactiveTime = 0;
			return;
		}

		if (this.getShouldBeActive()){
			return;
		}

		this._inactiveTime += dt;
		if (this._inactiveTime > JConfig.deactivationTime){
			this._lastPositionForDeactivation = this._currState.position.slice(0);
			this._lastOrientationForDeactivation = this._currState.get_orientation().clone();
			this.setInactive();
		}
	};

	/**
	 * @function set_mass set the mass for this body
	 * @param {number} m the mass
	 * @type void
	 **/
	RigidBody.prototype.set_mass=function(m){
		this._mass = m;
		this._invMass = 1 / m;
		this.setInertia(this.getInertiaProperties(m));
	};

	/**
	 * @function setInertia set the inertia for this body
	 * @param {Matrix3D} matrix3D the inertia expressed as a 3D matrix
	 * @type void
	 **/
	RigidBody.prototype.setInertia=function(matrix3D){
		this._bodyInertia =  matrix3D.clone();
		this._bodyInvInertia = JMatrix3D.getInverseMatrix(this._bodyInertia.clone());
			
		this.updateInertia();
	};
	
	/**
	 * @function updateInertia
	 * @type void
	 **/
	RigidBody.prototype.updateInertia=function(){
		this._invOrientation = JMatrix3D.getTransposeMatrix(this._currState.get_orientation());
			
		this._worldInertia = JMatrix3D.getAppendMatrix3D(
			this._invOrientation,
			JMatrix3D.getAppendMatrix3D(this._currState.get_orientation(), this._bodyInertia)
		);

		this._worldInvInertia = JMatrix3D.getAppendMatrix3D(
			this._invOrientation,
				JMatrix3D.getAppendMatrix3D(this._currState.get_orientation(), this._bodyInvInertia)
			);
	};

	/**
	 * @function get_movable checks if this body is movable
	 * @type boolean
	 **/
	RigidBody.prototype.get_movable=function(){
		return this._movable;
	};

	/**
	 * @function set_movable set whether this body is movable or not - if this is a PLANE or TERRAIN this method does nothing (movable is always false)
	 * @param {boolean} mov 
	 * @type void
	 **/
	RigidBody.prototype.set_movable=function(mov){
		if (this._type == "PLANE" || this._type == "TERRAIN" || this._type == "TRIANGLEMESH") 
			return;

		this._movable = mov;
		this.isActive = this._activity = mov;
		this._origMovable = mov;
	};

	/**
	 * @function internalSetImmovable for internal use
	 * @type void
	 **/
	RigidBody.prototype.internalSetImmovable=function(){
		if (this._type == "PLANE" || this._type == "TERRAIN" || this._type == "TRIANGLEMESH") 
			return;
		this._origMovable = this._movable;
		this._movable = false;
	};

	/**
	 * @function internalRestoreImmovable for internal use
	 * @type void
	 **/
	RigidBody.prototype.internalRestoreImmovable=function(){
		if (this._type == "PLANE" || this._type == "TERRAIN" || this._type == "TRIANGLEMESH") 
			return;
		this._movable = this._origMovable;
	};

	/**
	 * @function getVelChanged checks whether velocity has changed
	 * @type boolean
	 **/
	RigidBody.prototype.getVelChanged=function(){
		return this._velChanged;
	};

	/**
	 * @function clearVelChanged resets the velocity changed flag
	 * @type void
	 **/
	RigidBody.prototype.clearVelChanged=function(){
		this._velChanged = false;
	};

	/**
	 * @function setActive makes this body active
	 * @param {number} activityFactor
	 * @type void
	 **/
	RigidBody.prototype.setActive=function(activityFactor){
		if(!activityFactor) activityFactor=1;
		if (this._movable){
			this.isActive = this._activity = true;
			this._inactiveTime = (1 - activityFactor) * JConfig.deactivationTime;
		}
	};

	/**
	 * @function setInactive makes this body inactive
	 * @type void
	 **/
	RigidBody.prototype.setInactive=function(){
		if (this._movable){
			this.isActive = this._activity = false;
		}
	};

	/**
	 * @function getVelocity gets the velocity of a point at body-relative position
	 * @param {array} relPos the body-relative position expressed as a 3D vector
	 * @type array
	 **/
	RigidBody.prototype.getVelocity=function(relPos){
		return Vector3DUtil.add(this._currState.linVelocity, Vector3DUtil.crossProduct(this._currState.rotVelocity, relPos));
	};

	/**
	 * @function getVelocityAux gets the velocity of a point at body-relative position using aux velocities
	 * @param {array} relPos the body-relative position expressed as a 3D vector
	 * @type array
	 **/
	RigidBody.prototype.getVelocityAux=function(relPos){
		return Vector3DUtil.add(this._currLinVelocityAux, Vector3DUtil.crossProduct(this._currRotVelocityAux, relPos));
	};
		

	/**
	 * @function getShouldBeActive indicates if the velocity is above the threshold for freezing
	 * @type boolean
	 **/
	RigidBody.prototype.getShouldBeActive=function(){
		return ((Vector3DUtil.get_length(this._currState.linVelocity) > JConfig.velThreshold) || (Vector3DUtil.get_length(this._currState.rotVelocity) > JConfig.angVelThreshold));
	};

	/**
	 * @function getShouldBeActiveAux indicates if the aux velocity is above the threshold for freezing
	 * @type boolean
	 **/
	RigidBody.prototype.getShouldBeActiveAux=function(){
		return ((Vector3DUtil.get_length(this._currLinVelocityAux) > JConfig.velThreshold) || (Vector3DUtil.get_length(this._currRotVelocityAux) > JConfig.angVelThreshold));
	};

	/**
	 * @function dampForDeactivation damp movement as the body approaches deactivation
	 * @type void
	 **/
	RigidBody.prototype.dampForDeactivation=function(){
		this._currState.linVelocity[0] *= this._linVelDamping[0];
		this._currState.linVelocity[1] *= this._linVelDamping[1];
		this._currState.linVelocity[2] *= this._linVelDamping[2];
		this._currState.rotVelocity[0] *= this._rotVelDamping[0];
		this._currState.rotVelocity[1] *= this._rotVelDamping[1];
		this._currState.rotVelocity[2] *= this._rotVelDamping[2];
			
		this._currLinVelocityAux[0] *= this._linVelDamping[0];
		this._currLinVelocityAux[1] *= this._linVelDamping[1];
		this._currLinVelocityAux[2] *= this._linVelDamping[2];
		this._currRotVelocityAux[0] *= this._rotVelDamping[0];
		this._currRotVelocityAux[1] *= this._rotVelDamping[1];
		this._currRotVelocityAux[2] *= this._rotVelDamping[2];
			
		var r = 0.5;
		var frac = this._inactiveTime / JConfig.deactivationTime;
		if (frac < r){
			return;
		}

		var scale = 1 - ((frac - r) / (1 - r));
		if (scale < 0){
			scale = 0;
		}else if (scale > 1){
			scale = 1;
		}
		this._currState.linVelocity = JNumber3D.getScaleVector(this._currState.linVelocity, scale);
		this._currState.rotVelocity = JNumber3D.getScaleVector(this._currState.rotVelocity, scale);
	};

	/**
	 * @function doMovementActivations provided for use of physics system. 
	 * Activates any body in its list if it's moved more than a certain distance,
	 * in which case it also clears its list.
	 * @type void
	 **/
	RigidBody.prototype.doMovementActivations=function(){
		var numBodies = this._bodiesToBeActivatedOnMovement.length;
		if (numBodies == 0 || Vector3DUtil.get_length(Vector3DUtil.subtract(this._currState.position, this._storedPositionForActivation)) < JConfig.posThreshold)
			return;
		
		for (var i = 0; i<numBodies; i++){
			jigLib.PhysicsSystem.getInstance().activateObject(this._bodiesToBeActivatedOnMovement[i]);
		}
		this._bodiesToBeActivatedOnMovement = [];
	};

	/**
	 * @function addMovementActivation adds the other body to the list of bodies to be activated if this body 
	 * moves more than a certain distance from either a previously stored position, or the position passed in.
	 * in which case it also clears its list.
	 * 
	 * @param {array} pos position expressed as a 3D vector
	 * @param {RigidBody} otherBody the other body
	 * @type void
	 **/
	RigidBody.prototype.addMovementActivation=function(pos, otherBody){
		var len = this._bodiesToBeActivatedOnMovement.length;
		for (var i = 0; i < len; i++){
			if (this._bodiesToBeActivatedOnMovement[i] == otherBody){
				return;
			}
		}
		if (this._bodiesToBeActivatedOnMovement.length == 0){
			this._storedPositionForActivation = pos;
		}
		this._bodiesToBeActivatedOnMovement.push(otherBody);
	};

	/**
	 * @function setConstraintsAndCollisionsUnsatisfied marks all constraints/collisions as being unsatisfied 
	 * 
	 * @type void
	 **/
	RigidBody.prototype.setConstraintsAndCollisionsUnsatisfied=function(){
		for(var i=0, cl=this._constraints.length; i<cl; i++){
			this._constraints[i].set_satisfied(false);
		}
		for(var i=0, cll=this.collisions.length; i<cll; i++){
			this.collisions[i].satisfied = false;
		}
	};

	/**
	 * @function segmentIntersect to be implemented by inheriting classes
	 * @param {object} out
	 * @param {JSegment} seg
	 * @param {PhysicsState} state
	 * @type boolean
	 **/
	RigidBody.prototype.segmentIntersect=function(out, seg, state){
		return false;
	};

	/**
	 * @function getInertiaProperties to be implemented by inheriting classes
	 * @param {number} m
	 * @type Matrix3D
	 **/
	RigidBody.prototype.getInertiaProperties=function(m){
		return new Matrix3D();
	};
		
	/**
	 * @function updateBoundingBox to be implemented by inheriting classes
	 * @type void
	 **/
	RigidBody.prototype.updateBoundingBox=function(){
	};

	/**
	 * @function hitTestObject3D
	 * @param {RigidBody} obj3D
	 * @type boolean
	 **/
	RigidBody.prototype.hitTestObject3D=function(obj3D){
		var num1 = Vector3DUtil.get_length(Vector3DUtil.subtract(this._currState.position, obj3D.get_currentState().position));
		var num2 = this._boundingSphere + obj3D.get_boundingSphere();

		if (num1 <= num2){
			return true;
		}

		return false;
	};

	/**
	 * @function findNonCollidablesBody
	 * @param {RigidBody} body
	 * @type boolean
	 **/
	RigidBody.prototype.findNonCollidablesBody=function(body){
		for(var i=0, ncl=this._nonCollidables.length; i<ncl; i++){
			if (body == this._nonCollidables[i])
				return true;
		}
		return false;
	};

	/**
	 * @function disableCollisions
	 * @param {RigidBody} body
	 * @type void
	 **/
	RigidBody.prototype.disableCollisions=function(body){
		if (!this.findNonCollidablesBody(body)){
			this._nonCollidables.push(body);
		}
	};

	/**
	 * @function enableCollisions
	 * @param {RigidBody} body
	 * @type void
	 **/
	RigidBody.prototype.enableCollisions=function(body){
		if (this.findNonCollidablesBody(body)){
			this._nonCollidables.splice(this._nonCollidables.indexOf(body), 1);
		}
	};

	/**
	 * @function copyCurrentStateToOld copies the current position etc to old - normally called only by physicsSystem.
	 * @type void
	 **/
	RigidBody.prototype.copyCurrentStateToOld=function(){
		this._oldState.position = this._currState.position.slice(0);
		this._oldState.set_orientation(this._currState.get_orientation().clone());
		this._oldState.linVelocity = this._currState.linVelocity.slice(0);
		this._oldState.rotVelocity = this._currState.rotVelocity.slice(0);
	};

	/**
	 * @function storeState copy the current state into the stored state
	 * @type void
	 **/
	RigidBody.prototype.storeState=function(){
		this._storeState.position = this._currState.position.slice(0);
		this._storeState.set_orientation(this._currState.get_orientation().clone());
		this._storeState.linVelocity = this._currState.linVelocity.slice(0);
		this._storeState.rotVelocity = this._currState.rotVelocity.slice(0);
	};

	/**
	 * @function restoreState restore from the stored state into the current state.
	 * @type void
	 **/
	RigidBody.prototype.restoreState=function(){
		this._currState.position = this._storeState.position.slice(0);
		this._currState.set_orientation(this._storeState.get_orientation().clone());
		this._currState.linVelocity = this._storeState.linVelocity.slice(0);
		this._currState.rotVelocity = this._storeState.rotVelocity.slice(0);
	};

	/**
	 * @function get_currentState get the "working" state
	 * @type PhysicsState
	 **/
	RigidBody.prototype.get_currentState=function(){
		return this._currState;
	};

	/**
	 * @function get_oldState the previous state - copied explicitly using copyCurrentStateToOld
	 * @type PhysicsState
	 **/
	RigidBody.prototype.get_oldState=function(){
		return this._oldState;
	};

	/**
	 * @function get_id the unique ID for this body
	 * @type number
	 **/
	RigidBody.prototype.get_id=function(){
		return this._id;
	};

	/**
	 * @function get_id the body type (e.g. BOX, PLANE, SPHERE etc.)
	 * @type string
	 **/
	RigidBody.prototype.get_type=function(){
		return this._type;
	};

	/**
	 * @function get_skin the skin 
	 * @type ISkin3D
	 **/
	RigidBody.prototype.get_skin=function(){
		return this._skin;
	};

	/**
	 * @function get_boundingSphere the bounding sphere radius
	 * @type number
	 **/
	RigidBody.prototype.get_boundingSphere=function(){
		return this._boundingSphere;
	};
		
	/**
	 * @function get_boundingSphere the bounding box dimensions
	 * @type JAABox
	 **/
	RigidBody.prototype.get_boundingBox=function(){
		return this._boundingBox;
	};

	/**
	 * @function get_force current force in world frame expressed as a 3D vector
	 * @type array
	 **/
	RigidBody.prototype.get_force=function(){
		return this._force;
	};

	/**
	 * @function get_mass the mass of this body
	 * @type number
	 **/
	RigidBody.prototype.get_mass=function(){
		return this._mass;
	};

	/**
	 * @function get_invMass the inverse mass of this body
	 * @type number
	 **/
	RigidBody.prototype.get_invMass=function(){
		return this._invMass;
	};

	/**
	 * @function get_worldInertia the inertia tensor in world space
	 * @type Matrix3D
	 **/
	RigidBody.prototype.get_worldInertia=function(){
		return this._worldInertia;
	};

	/**
	 * @function get_worldInvInertia the inverse inertia tensor in world space
	 * @type Matrix3D
	 **/
	RigidBody.prototype.get_worldInvInertia=function(){
		return this._worldInvInertia;
	};

	/**
	 * @function get_nonCollidables 
	 * @returns a collection of RigidBody objects
	 * @type array
	 **/
	RigidBody.prototype.get_nonCollidables=function(){
		return this._nonCollidables;
	};
	
	/**
	 * @function get_doShockProcessing returns whether shock processing is being applied to this body
	 * @type boolean
	 **/
	RigidBody.prototype.get_doShockProcessing=function(){
		return this._doShockProcessing;
	};
	
	/**
	 * @function set_doShockProcessing sets whether shock processing should be applied to this body
	 * @param {boolean} doShock
	 * @type void
	 **/
	RigidBody.prototype.set_doShockProcessing=function(doShock){
		this._doShockProcessing = doShock;
	};

	/**
	 * @function set_linVelocityDamping each dimension will be limited to the range 0-1
	 * @param {array} vel a 3D vector
	 * @type void
	 **/
	RigidBody.prototype.set_linVelocityDamping=function(vel){
		this._linVelDamping[0] = JNumber3D.getLimiteNumber(vel[0], 0, 1);
		this._linVelDamping[1] = JNumber3D.getLimiteNumber(vel[1], 0, 1);
		this._linVelDamping[2] = JNumber3D.getLimiteNumber(vel[2], 0, 1);
	};
		
	/**
	 * @function get_linVelocityDamping
	 * @type array
	 **/
	RigidBody.prototype.get_linVelocityDamping=function(){
		return this._linVelDamping;
	};
		
	/**
	 * @function set_rotVelocityDamping each dimension will be limited to the range 0-1
	 * @param {array} vel a 3D vector
	 * @type void
	 **/
	RigidBody.prototype.set_rotVelocityDamping=function(vel){
		this._rotVelDamping[0] = JNumber3D.getLimiteNumber(vel[0], 0, 1);
		this._rotVelDamping[1] = JNumber3D.getLimiteNumber(vel[1], 0, 1);
		this._rotVelDamping[2] = JNumber3D.getLimiteNumber(vel[2], 0, 1);
	};
	
	/**
	 * @function get_rotVelocityDamping
	 * @type array
	 **/
	RigidBody.prototype.get_rotVelocityDamping=function(){
		return this._rotVelDamping;
	};
		
	/**
	 * @function set_maxLinVelocities limit the max value of body's line velocity
	 * @param {number} vel
	 * @type void
	 **/
	RigidBody.prototype.set_maxLinVelocities=function(vel){
		this._maxLinVelocities = JNumber3D.getLimiteNumber(Math.abs(vel), 0, 500);
	};
	
	/**
	 * @function get_maxLinVelocities
	 * @type number
	 **/
	RigidBody.prototype.get_maxLinVelocities=function(){
		return this._maxLinVelocities;
	};

	/**
	 * @function set_maxRotVelocities limit the max value of body's angle velocity
	 * @param {number} vel
	 * @type void
	 **/
	RigidBody.prototype.set_maxRotVelocities=function(vel){
		this._maxRotVelocities = JNumber3D.getLimiteNumber(Math.abs(vel), JNumber3D.NUM_TINY, 50);
	};
	
	/**
	 * @function get_maxRotVelocities
	 * @type number
	 **/
	RigidBody.prototype.get_maxRotVelocities=function(){
		return this._maxRotVelocities;
	};

	/**
	 * @function limitVel
	 * @type void
	 **/
	RigidBody.prototype.limitVel=function(){
		this._currState.linVelocity[0] = JNumber3D.getLimiteNumber(this._currState.linVelocity[0], -this._maxLinVelocities, this._maxLinVelocities);
		this._currState.linVelocity[1] = JNumber3D.getLimiteNumber(this._currState.linVelocity[1], -this._maxLinVelocities, this._maxLinVelocities);
		this._currState.linVelocity[2] = JNumber3D.getLimiteNumber(this._currState.linVelocity[2], -this._maxLinVelocities, this._maxLinVelocities);
	};

	/**
	 * @function limitAngVel
	 * @type void
	 **/
	RigidBody.prototype.limitAngVel=function(){
		var fx = Math.abs(this._currState.rotVelocity[0]) / this._maxRotVelocities;
		var fy = Math.abs(this._currState.rotVelocity[1]) / this._maxRotVelocities;
		var fz = Math.abs(this._currState.rotVelocity[2]) / this._maxRotVelocities;
		var f = Math.max(fx, fy, fz);
		if (f > 1)
			this._currState.rotVelocity = JNumber3D.getDivideVector(this._currState.rotVelocity, f);
	};

	/**
	 * @function getTransform gets the transform matrix for the skin
	 * @type Matrix3D
	 **/
	RigidBody.prototype.getTransform=function(){
		if (this._skin != null){
			return this._skin.get_transform();
		}else{
			return null;
		}
	};

	/**
	 * @function updateObject3D updates the skin
	 * @type void
	 **/
	RigidBody.prototype.updateObject3D=function(){
		if (this._skin != null)
			this._skin.set_transform(JMatrix3D.getAppendMatrix3D(this._currState.get_orientation(), JMatrix3D.getTranslationMatrix(this._currState.position[0], this._currState.position[1], this._currState.position[2])));
	};

	/**
	 * @function get_material
	 * @type MaterialProperties
	 **/
	RigidBody.prototype.get_material=function(){
		return this._material;
	};

	/**
	 * @function get_restitution get the coefficient of elasticity
	 * @type number
	 **/
	RigidBody.prototype.get_restitution=function(){
		return this._material.get_restitution();
	};

	/**
	 * @function set_restitution set the coefficient of elasticity
	 * @param {number} restitution
	 * @type void
	 **/
	RigidBody.prototype.set_restitution=function(restitution){
		this._material.set_restitution(JNumber3D.getLimiteNumber(restitution, 0, 1));
	};

	/**
	 * @function get_friction get the coefficient of friction
	 * @type number
	 **/
	RigidBody.prototype.get_friction=function(){
		return this._material.get_friction();
	};

	/**
	 * @function set_friction set the coefficient of friction
	 * @param {number} restitution
	 * @type void
	 **/
	RigidBody.prototype.set_friction=function(friction){
		this._material.set_friction(JNumber3D.getLimiteNumber(friction, 0, 1));
	};
	
	jigLib.RigidBody=RigidBody;
})(jigLib);