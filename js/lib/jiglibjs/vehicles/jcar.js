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
	var JNumber3D=jigLib.JNumber3D;
	var JChassis=jigLib.JChassis;
	var JWheel=jigLib.JWheel;
	var PhysicsSystem=jigLib.PhysicsSystem;
	
	// get local refs to Math methods to improve performance
	var mr=Math, mrAbs=mr.abs, mrSqrt=mr.sqrt;
	
	/**
	 * @author Muzer(muzerly@gmail.com)
	 * 
	 * @name JCar
	 * @class JCar represents a wheeled vehicle
	 * @requires Vector3DUtil
	 * @requires JNumber3D
	 * @requires JChassis
	 * @requires JWheel
	 * @requires PhysicsSystem
	 * @property {number} _maxSteerAngle the maximum steering angle
	 * @property {number} _steerRate the rate of steering angle change
	 * @property {number} _driveTorque the maximum torque of a wheel
	 * @property {number} _destSteering the target steering angle
	 * @property {number} _destAccelerate the target acceleration
	 * @property {number} _steering the current steering angle
	 * @property {number} _accelerate the current acceleration
	 * @property {number} _HBrake whether the handbrake is on (1) or off (0)
	 * @property {JChassis} _chassis the vehicle chassis
	 * @property {array} _wheels the wheels (a collection of Wheel objects)
	 * @property {array} _steerWheels the wheels used for steering (a collection of Wheel objects)
	 * @constructor
	 * @param {ISkin3D} skin
	 **/
	var JCar=function(skin){
		this._chassis = new JChassis(this, skin);
		this._wheels = [];
		this._steerWheels = [];
		this._destSteering = this._destAccelerate = this._steering = this._accelerate = this._HBrake = 0;
		this.setCar();
	};
	
	JCar.prototype._maxSteerAngle=null;
	JCar.prototype._steerRate=null;
	JCar.prototype._driveTorque=null;

	JCar.prototype._destSteering=null;
	JCar.prototype._destAccelerate=null;

	JCar.prototype._steering=null;
	JCar.prototype._accelerate=null;
	JCar.prototype._HBrake=null;

	JCar.prototype._chassis=null;
	JCar.prototype._wheels=null;
	JCar.prototype._steerWheels=null;
	
	/**
	 * @function setCar sets up the vehicle
	 * @param {number} maxSteerAngle the maximum steering angle
	 * @param {number} steerRate the rate of steering angle change
	 * @param {number} driveTorque the maximum torque of a wheel
	 * @type void
	 **/
	JCar.prototype.setCar=function(maxSteerAngle, steerRate, driveTorque){
		if(maxSteerAngle==null) maxSteerAngle=45;
		if(steerRate==null) steerRate=4;
		if(driveTorque==null) driveTorque=500;
		
		this._maxSteerAngle = maxSteerAngle;
		this._steerRate = steerRate;
		this._driveTorque = driveTorque;
	};

	/**
	 * @function setupWheel add a wheel to the vehicle
	 * @param {string} _name a unique name by which to identify the wheel (e.g. FrontRight, RearLeft etc.)
	 * @param {array} pos position of the wheel relative to the car's center
	 * @param {number} wheelSideFriction side friction
	 * @param {number} wheelFwdFriction forward friction
	 * @param {number} wheelTravel vertical suspension travel
	 * @param {number} wheelRadius wheel radius
	 * @param {number} wheelRestingFrac elasticity coefficient
	 * @param {number} wheelDampingFrac suspension damping
	 * @param {number} wheelNumRays 
	 * @param {number} drive
	 * @type void
	 **/
	JCar.prototype.setupWheel=function(_name, pos, wheelSideFriction, wheelFwdFriction, wheelTravel, wheelRadius, wheelRestingFrac, wheelDampingFrac, wheelNumRays, drive){
		if(wheelSideFriction==null) wheelSideFriction=2;
		if(wheelFwdFriction==null) wheelFwdFriction=2;
		if(wheelTravel==null) wheelTravel=3;
		if(wheelRadius==null) wheelRadius=10;
		if(wheelRestingFrac==null) wheelRestingFrac=0.5;
		if(wheelDampingFrac==null) wheelDampingFrac=0.5;
		if(wheelNumRays==null) wheelNumRays=1;
		if(drive==null) drive=1;

		
		var gravity = PhysicsSystem.getInstance().get_gravity().slice(0);
		var mass = this._chassis.get_mass();
		var mass4 = 0.25 * mass;
		var gravityLen = Vector3DUtil.get_length(gravity);

		Vector3DUtil.normalize(gravity);
		var axis = JNumber3D.getScaleVector(gravity,-1);
		var spring = mass4 * gravityLen / (wheelRestingFrac * wheelTravel);
		var inertia = 0.015 * wheelRadius * wheelRadius * mass;
		var damping = wheelDampingFrac/2;
		var normalForce = gravityLen*mass4;
		//var damping = 2 * mrSqrt(spring * mass);
		//damping *= (0.25 * wheelDampingFrac);
		//damping /= this._steerRate;
		//damping *= wheelDampingFrac;

		var wheel = new JWheel(this);
		wheel.name = _name;
		wheel.setup(pos, axis, spring, wheelTravel, inertia, wheelRadius, wheelSideFriction, wheelFwdFriction, damping, wheelNumRays, drive, normalForce);
		this._wheels.push(wheel);
	};

	/**
	 * @function setAccelerate set the target acceleration
	 * @param {number} val the target acceleration
	 * @type void
	 **/
	JCar.prototype.setAccelerate=function(val){
		this._destAccelerate = val;
	};

	/**
	 * @function setSteer set the target steering angle and define which wheels should turn
	 * @param {array} wheels a collection of Wheel objects
	 * @param {number} val the target acceleration
	 * @type void
	 **/
	JCar.prototype.setSteer=function(wheels, val){
		this._destSteering = val;
		this._steerWheels = [];
		var wheel=null;
		for (var i=0, l=wheels.length; i<l; i++){
			wheel=this.getWheel(wheels[i]);
			if (wheel)
				this._steerWheels.push(wheel);
		}
	};

	/**
	 * @function findWheel checks if a wheel exists matching a given name
	 * @param {string} name the name of the wheel to find
	 * @type boolean
	 **/
	JCar.prototype.findWheel=function(_name){
		for (var i=0, l=this._wheels.length; i<l; i++){
			if (this._wheels[i].name == _name) return true;
		}
		return false;
	};
	
	/**
	 * @function getWheel get a wheel by name
	 * @param {string} name the name of the wheel to get
	 * @type Wheel
	 **/
	JCar.prototype.getWheel=function(_name){
		for (var i=0; i<this._wheels.length; i++){
			if (this._wheels[i].name == _name) return this._wheels[i];
		}
		return null;
	};
	
	/**
	 * @function setHBrake sets the handbrake off or on
	 * @param {number} val 0 to set the handbrake off, and 1 to set it on
	 * @type void
	 **/
	JCar.prototype.setHBrake=function(val){
		this._HBrake = val;
	};

	/**
	 * @function addExternalForces applies wheel forces to the vehicle
	 * @param {number} dt a UNIX timestamp
	 * @type void
	 **/
	JCar.prototype.addExternalForces=function(dt){
		for(var i=0, wl=this._wheels.length; i<wl; i++){
			this._wheels[i].addForcesToCar(dt);
		}
	};

	/**
	 * @function postPhysics runs after the PhysicsSystem has been applied
	 * @param {number} dt a UNIX timestamp
	 * @type void
	 **/
	JCar.prototype.postPhysics=function(dt){
		for(var i=0, wl=this._wheels.length; i<wl; i++){
			this._wheels[i].update(dt);
		}

		var deltaAccelerate = dt;
		var deltaSteering = dt * this._steerRate;
		var dAccelerate = this._destAccelerate - this._accelerate;

		if (dAccelerate < -deltaAccelerate) dAccelerate = -deltaAccelerate;
		else if (dAccelerate > deltaAccelerate) dAccelerate = deltaAccelerate;

		this._accelerate += dAccelerate;

		var dSteering = this._destSteering - this._steering;

		if (dSteering < -deltaSteering) dSteering = -deltaSteering;
		else if (dSteering > deltaSteering) dSteering = deltaSteering;

		this._steering += dSteering;

		for(var i=0;i<this._wheels.length;i++){
			this._wheels[i].addTorque(this._driveTorque * this._accelerate);
			this._wheels[i].setLock(this._HBrake > 0.5);
		}

		var alpha = mrAbs(this._maxSteerAngle * this._steering);
		var angleSgn = (this._steering > 0) ? 1 : -1;
		for(var i=0, swl=this._steerWheels.length; i<swl; i++){
			this._steerWheels[i].setSteerAngle(angleSgn * alpha);
		}
	};

	/**
	 * @function getNumWheelsOnFloor returns the number of wheels in contact with the ground
	 * @param {number} dt a UNIX timestamp
	 * @type number
	 **/
	JCar.prototype.getNumWheelsOnFloor=function(dt){
		var count = 0;
		for(var i=0, wl=this._wheels.length; i<wl; i++){
			//this._wheels[i].update(dt);
			if (this._wheels[i].getOnFloor()) count++;
		}
		return count;
	};
	
	jigLib.JCar=JCar;
	
})(jigLib);