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
	var JSegment=jigLib.JSegment;
	var JConfig=jigLib.JConfig;
	var PhysicsSystem=jigLib.PhysicsSystem;
	
	// get local refs to Math methods to improve performance
	var mr=Math, mrPI=mr.PI, mrMin=mr.min, mrMax=mr.max, mrCos=mr.cos, mrAbs=mr.abs, mrSqrt=mr.sqrt;
	
	/**
	 * @author Muzer(muzerly@gmail.com)
	 * 
	 * @name JWheel
	 * @class JWheel represents a wheel
	 * @constant {number} noslipVel
	 * @constant {number} slipVel
	 * @constant {number} slipFactor
	 * @constant {number} smallVel
	 * @property {string} name a unique name by which to identify the wheel (e.g. FrontRight, RearLeft etc.)
	 * @property {JCar} _car the car this wheel belongs to
	 * @property {array} _pos position of the wheel relative to the car's center as a 3D vector
	 * @property {array} _axisUp the inverse of the gravity axis as a 3D vector
	 * @property {number} _spring amount of suspension spring
 	 * @property {number} _travel vertical suspension travel
	 * @property {number} _inertia the wheel inertia
	 * @property {number} _radius the wheel radius
	 * @property {number} _sideFriction side friction
	 * @property {number} _fwdFriction forward friction
	 * @property {number} _damping suspension damping
	 * @property {number} _numRays
	 * @property {number} _angVel
	 * @property {number} _steerAngle the steering angle
	 * @property {number} _torque amount of torque
	 * @property {number} _driveTorque
	 * @property {number} _axisAngle
	 * @property {number} _displacement current suspension travel
	 * @property {number} _upSpeed
	 * @property {number} _rotDamping
	 * @property {number} _normalForce
	 * @property {boolean} _locked whether the wheel is locked
	 * @property {number} _lastDisplacement previous suspension travel
	 * @property {boolean} _lastOnFloor whether the wheel was previously on the floor
	 * @property {number} _angVelForGrip
	 * @property {array} worldPos a 3D vector
	 * @property {array} worldAxis a 3D vector
	 * @property {array} wheelFwd a 3D vector
	 * @property {array} wheelUp a 3D vector
	 * @property {array} wheelLeft a 3D vector
	 * @property {array} wheelRayEnd a 3D vector
	 * @property {JSegment} wheelRay
	 * @property {array} groundUp a 3D vector
	 * @property {array} groundLeft a 3D vector
	 * @property {array} groundFwd a 3D vector
	 * @property {array} wheelPointVel a 3D vector
	 * @property {array} rimVel a 3D vector
	 * @property {array} worldVel a 3D vector
	 * @property {array} wheelCentreVel a 3D vector
	 * @property {CollisionSystem} _collSystem the collision system
	 * @constructor
	 * @param {JCar} car the vehicle this wheel belongs to
	 **/
	var JWheel=function(car){
		this._car = car;
	};
	
	JWheel.prototype.name = null;
	
	JWheel.prototype.noslipVel = 0.2;
	JWheel.prototype.slipVel = 0.4;
	JWheel.prototype.slipFactor = 0.7;
	JWheel.prototype.smallVel = 3;

	JWheel.prototype._car=null;
	JWheel.prototype._pos=null;
	JWheel.prototype._axisUp=null;
	JWheel.prototype._spring=null;
 	JWheel.prototype._travel=null;
	JWheel.prototype._inertia=null;
	JWheel.prototype._radius=null;
	JWheel.prototype._sideFriction=null;
	JWheel.prototype._fwdFriction=null;
	JWheel.prototype._damping=null;
	JWheel.prototype._numRays=null;

	JWheel.prototype._angVel=null;
	JWheel.prototype._steerAngle=null;
	JWheel.prototype._torque=null;
	JWheel.prototype._driveTorque=null;
	JWheel.prototype._axisAngle=null;
	JWheel.prototype._displacement=null;
	JWheel.prototype._upSpeed=null;
	JWheel.prototype._rotDamping=null;
	JWheel.prototype._normalForce=null;

	JWheel.prototype._locked=null;
	JWheel.prototype._lastDisplacement=null;
	JWheel.prototype._lastOnFloor=null;
	JWheel.prototype._angVelForGrip=null;

	JWheel.prototype.worldPos=null;
	JWheel.prototype.worldAxis=null;
	JWheel.prototype.wheelFwd=null;
	JWheel.prototype.wheelUp=null;
	JWheel.prototype.wheelLeft=null;
	JWheel.prototype.wheelRayEnd=null;
	JWheel.prototype.wheelRay=null;
	JWheel.prototype.groundUp=null;
	JWheel.prototype.groundLeft=null;
	JWheel.prototype.groundFwd=null;
	JWheel.prototype.wheelPointVel=null;
	JWheel.prototype.rimVel=null;
	JWheel.prototype.worldVel=null;
	JWheel.prototype.wheelCentreVel=null;
	
	JWheel.prototype._collSystem=null;
	
	/**
	 * @function setup setup the wheel
	 * @param {array} pos position relative to car, in car's space
	 * @param {array} axisUp in car's space
	 * @param {number} spring force per suspension offset
	 * @param {number} travel suspension travel upwards
	 * @param {number} inertia inertia about the axle
	 * @param {number} radius wheel radius
	 * @param {number} sideFriction side friction
	 * @param {number} fwdFriction forward friction
	 * @param {number} damping suspension damping
	 * @param {number} numRays 
	 * @param {number} drive 
	 * @param {number} normalForce 
	 * @type void
	 **/
	JWheel.prototype.setup=function(pos, axisUp, spring, travel, inertia, radius, sideFriction, fwdFriction, damping, numRays, drive, normalForce){
		if(spring==null) spring=0;
		if(travel==null) travel=0;
		if(inertia==null) inertia=0;
		if(radius==null) radius=0;
		if(sideFriction==null) sideFriction=0;
		if(fwdFriction==null) fwdFriction=0;
		if(damping==null) damping=0;
		if(numRays==null) numRays=0;
		if(drive==null) drive=0;
		if(normalForce==null) normalForce=0;
		
		this._pos = pos;
		this._axisUp = axisUp;
		this._spring = spring;
		this._travel = travel;
		this._inertia = inertia;
		this._radius = radius;
		this._sideFriction = sideFriction;
		this._fwdFriction = fwdFriction;
		this._damping = damping;
		this._numRays = numRays;
		this._drive = drive;
		this._normalForce = normalForce;
		this._torque = 0;
		this.reset();
	};

	/**
	 * @function addTorque add torque to the wheel
	 * @param {number} torque the amount of torque to add
	 * @type void
	 **/
	JWheel.prototype.addTorque=function(torque){
		this._driveTorque += torque;
	};

	/**
	 * @function setLock lock/unlock the wheel
	 * @param {boolean} lock
	 * @type void
	 **/
	JWheel.prototype.setLock=function(lock){
		this._locked = lock;
	};

	/**
	 * @function setSteerAngle set the target steering angle
	 * @param {number} steer
	 * @type void
	 **/
	JWheel.prototype.setSteerAngle=function(steer){
		this._steerAngle = steer;
	};

	/**
	 * @function setSteerAngle get the steering angle in degrees
	 * @type number
	 **/
	JWheel.prototype.getSteerAngle=function(){
		return this._steerAngle;
	};

	/**
	 * @function getPos get the base wheel position as a 3D vector
	 * @type array
	 **/
	JWheel.prototype.getPos=function(){
		return this._pos;
	};
	

	/**
	 * @function getLocalAxisUp get the suspension axis in the car's frame as a 3D vector
	 * @type array
	 **/
	JWheel.prototype.getLocalAxisUp=function(){
		return this._axisUp;
	};

	/**
	 * @function getActualPos get the real position of the wheel taking into account current suspension travel
	 * @type array
	 **/
	JWheel.prototype.getActualPos=function(){
		return Vector3DUtil.add(this._pos, JNumber3D.getScaleVector(this._axisUp, this._displacement));
	};

	/**
	 * @function getRadius get the wheel radius
	 * @type number
	 **/
	JWheel.prototype.getRadius=function(){
		return this._radius;
	};

	/**
	 * @function getDisplacement get the current suspension travel
	 * @type number
	 **/
	JWheel.prototype.getDisplacement=function(){
		return this._displacement;
	};

	/**
	 * @function getAxisAngle
	 * @type array
	 **/
	JWheel.prototype.getAxisAngle=function(){
		return this._axisAngle;
	};

	/**
	 * @function getRollAngle get the current rotation around the axle axis
	 * @type number
	 **/
	JWheel.prototype.getRollAngle=function(){
		return 0.1 * this._angVel * 180 / mrPI;
	};

	/**
	 * @function setRotationDamping set the rotation damping
	 * @param {number} vel
	 * @type void
	 **/
	JWheel.prototype.setRotationDamping=function(vel){
		this._rotDamping = vel;
	};
	
	/**
	 * @function getRotationDamping get the rotation damping value
	 * @type number
	 **/
	JWheel.prototype.getRotationDamping=function(){
		return this._rotDamping;
	};
				
	/**
	 * @function getOnFloor tests whether the wheel is on the ground or not
	 * @returns true if on the ground, else false
	 * @type boolean
	 **/
	JWheel.prototype.getOnFloor=function(){
		return this._lastOnFloor;
	};
	
	/**
	 * @function addForcesToCar adds the forces from this wheel to the parent vehicle.
	 * @returns true if the wheel is on the ground, else false
	 * @type boolean
	 **/
	JWheel.prototype.addForcesToCar=function(dt){
		var force = [0,0,0,0];
		this._lastDisplacement = this._displacement;
		this._displacement = 0;

		var carBody = this._car._chassis;
		worldPos = this._pos.slice(0);
		JMatrix3D.multiplyVector(carBody.get_currentState().get_orientation(), worldPos);
		worldPos = Vector3DUtil.add(carBody.get_currentState().position, worldPos);
		worldAxis = this._axisUp.slice(0);
		JMatrix3D.multiplyVector(carBody.get_currentState().get_orientation(), worldAxis);

		wheelFwd = carBody.get_currentState().getOrientationCols()[2].slice(0);
		JMatrix3D.multiplyVector(JMatrix3D.getRotationMatrix(worldAxis[0], worldAxis[1], worldAxis[2], this._steerAngle/180*2*Math.PI), wheelFwd);
		wheelUp = worldAxis;
		wheelLeft = Vector3DUtil.crossProduct(wheelUp, wheelFwd);
		Vector3DUtil.normalize(wheelLeft);

		var rayLen = 2 * this._radius + this._travel;
		wheelRayEnd = Vector3DUtil.subtract(worldPos, JNumber3D.getScaleVector(worldAxis, this._radius));
		wheelRay = new JSegment(Vector3DUtil.add(wheelRayEnd, JNumber3D.getScaleVector(worldAxis, rayLen)), JNumber3D.getScaleVector(worldAxis, -rayLen));

		if (this._collSystem == null)
			this._collSystem = PhysicsSystem.getInstance().getCollisionSystem();

		var maxNumRays = 10;
		var numRays = mrMin(this._numRays, maxNumRays);

		var objArr = [];
		var segments = [];

		var deltaFwd = (2 * this._radius) / (numRays +1);
		var deltaFwdStart = deltaFwd;

		this._lastOnFloor = false;

		var distFwd;
		var yOffset;
		var bestIRay = 0;
		var iRay = 0;
		var segment = null;
		for (iRay = 0; iRay < numRays; iRay++){
			objArr[iRay] = {};
			distFwd = (deltaFwdStart + iRay * deltaFwd) - this._radius;
			yOffset = this._radius * (1 - mrCos(90 * (distFwd / this._radius) * mrPI / 180));
			segment = wheelRay.clone();
			segment.origin = Vector3DUtil.add(segment.origin, Vector3DUtil.add(JNumber3D.getScaleVector(wheelFwd, distFwd), JNumber3D.getScaleVector(wheelUp, yOffset)));
			
			if (this._collSystem.segmentIntersect(objArr[iRay], segment, carBody)) {
				this._lastOnFloor = true;
				if (objArr[iRay].frac < objArr[bestIRay].frac){
					bestIRay = iRay;
				}
			}
			segments[iRay] = segment;
		}
		if (!this._lastOnFloor) return false;
		
		var frac= objArr[bestIRay].frac;
		var groundPos = objArr[bestIRay].position;
		var otherBody = objArr[bestIRay].rigidBody;

		var groundNormal = worldAxis.slice(0);
		if (numRays > 1){
			for (iRay = 0; iRay < numRays; iRay++){
				var rayFracOut=objArr[iRay].fracOut;
				if (rayFracOut <= 1)
					groundNormal = Vector3DUtil.add(groundNormal, JNumber3D.getScaleVector(Vector3DUtil.subtract(worldPos, segments[iRay].getEnd()), 1 - rayFracOut));
			}
			Vector3DUtil.normalize(groundNormal);
		}else groundNormal = objArr[bestIRay].normalOut;
		
		wheelFwd=Vector3DUtil.crossProduct(wheelLeft,groundNormal);
		
		this._displacement = rayLen * (1 - frac);

		if (this._displacement < 0) this._displacement = 0;
		
		var mass = carBody.get_mass();
		var mass4 = mass/4;
		var otherFriction=otherBody.get_friction();
	
		var wheelCenterVel=carBody.getVelocity(this._pos);
		
		
		//hit floor hard
		var origDisplacement=this._displacement;
		if (this._displacement > this._travel){
			this._displacement=this._travel;
			var cv=Vector3DUtil.dotProduct(wheelCenterVel,groundNormal)/dt*mass4;
			cv=cv*2*otherBody.get_restitution()/10;
			extraForce = JNumber3D.getScaleVector(groundNormal, -cv);
			force = Vector3DUtil.add(force, extraForce);
		}
		//suspension spring force
		extraForce = JNumber3D.getScaleVector(this._axisUp, this._spring*this._displacement+this._upSpeed*this._damping);
		force = Vector3DUtil.add(force, extraForce);

		
		groundUp = groundNormal;
		groundLeft = Vector3DUtil.crossProduct(groundNormal, wheelFwd);
		Vector3DUtil.normalize(groundLeft);
		groundFwd = Vector3DUtil.crossProduct(groundLeft, groundUp);
	
		var rimVel = JNumber3D.getScaleVector(Vector3DUtil.crossProduct(groundLeft, Vector3DUtil.subtract(groundPos, worldPos)), -this._angVel);
		var centerVel = JNumber3D.getScaleVector(groundFwd, Vector3DUtil.dotProduct(wheelCenterVel,groundFwd));

		var friction=this._fwdFriction*otherFriction;
		var extraForce = JNumber3D.getScaleVector(Vector3DUtil.subtract(rimVel,centerVel), mass4/dt/this._radius*friction);
		var forceSize=Vector3DUtil.get_length(extraForce);
		if(forceSize>this._normalForce*friction) extraForce = JNumber3D.getScaleVector(extraForce,this._normalForce*friction/forceSize);
		force = Vector3DUtil.add(force, extraForce);		
		this._torque-=Vector3DUtil.dotProduct(Vector3DUtil.subtract(rimVel,centerVel),groundFwd)/this._radius*mass4/dt;
		this._angVelForGrip = Vector3DUtil.dotProduct(wheelCenterVel, groundFwd) / this._radius;

		//sideways friction
		var sideVel = Vector3DUtil.dotProduct(wheelCenterVel,groundLeft);
		var friction=this._sideFriction*otherFriction;		
		var leftVel = JNumber3D.getScaleVector(groundLeft, -sideVel*friction);

		
		var extraForce = JNumber3D.getScaleVector(leftVel, mass4/dt/this._radius);	
		var forceSize=Vector3DUtil.get_length(extraForce);
		if(forceSize>this._normalForce*friction) extraForce = JNumber3D.getScaleVector(extraForce,this._normalForce*friction/forceSize);
		
		force = Vector3DUtil.add(force, extraForce);

		carBody.addWorldForce(force, groundPos);
		
		if (otherBody.get_movable()){
			var maxOtherBodyAcc = 500;
			var maxOtherBodyForce = maxOtherBodyAcc * otherBody.get_mass();
			if (Vector3DUtil.get_lengthSquared(force) > (maxOtherBodyForce * maxOtherBodyForce))
				force = JNumber3D.getScaleVector(force, maxOtherBodyForce / Vector3DUtil.get_length(force));

			otherBody.addWorldForce(JNumber3D.getScaleVector(force, -1), groundPos);
		}
		return true;
	};

	/**
	 * @function update updates the rotational state etc
	 * @type void
	 **/
	JWheel.prototype.update=function(dt){
		if (dt <= 0) return;

		var origAngVel = this._angVel;
		this._upSpeed = (this._displacement - this._lastDisplacement) / mrMax(dt, JNumber3D.NUM_TINY);

		if (this._locked){
			this._angVel = 0;
			this._torque = 0;
		}else{					
			this._angVel += (this._torque * dt / this._inertia);
			this._torque = 0;
			
			if (((origAngVel > this._angVelForGrip) && (this._angVel < this._angVelForGrip)) || ((origAngVel < this._angVelForGrip) && (this._angVel > this._angVelForGrip)))
				this._angVel = this._angVelForGrip;
			
			
			this._angVel += this._driveTorque * dt / this._inertia * this._drive;
			this._driveTorque = 0;

			if (this._angVel < -100) this._angVel = -100;
			else if (this._angVel > 100) this._angVel = 100;
			
			this._angVel *= this._rotDamping;
			this._axisAngle += (this._angVel * dt * 180 / mrPI);
		}
	};

	/**
	 * @function reset resets everything
	 * @type void
	 **/
	JWheel.prototype.reset=function(){
		this._angVel = 0;
		this._steerAngle = 0;
		this._torque = 0;
		this._driveTorque = 0;
		this._axisAngle = 0;
		this._displacement = 0;
		this._upSpeed = 0;
		this._locked = false;
		this._lastDisplacement = 0;
		this._lastOnFloor = false;
		this._angVelForGrip = 0;
		this._rotDamping = 0.99;
	};
	
	jigLib.JWheel=JWheel;
	
})(jigLib);