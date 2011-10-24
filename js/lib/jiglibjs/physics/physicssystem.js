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
	var CollPointInfo=jigLib.CollPointInfo;
	var CollisionSystemBrute=jigLib.CollisionSystemBrute;
	var CollisionSystemGrid=jigLib.CollisionSystemGrid;
	var ContactData=jigLib.ContactData;
	var JMatrix3D=jigLib.JMatrix3D;
	var JNumber3D=jigLib.JNumber3D;
	var BodyPair=jigLib.BodyPair;
	var CachedImpulse=jigLib.CachedImpulse;
	var JCollisionEvent=jigLib.JCollisionEvent;

	/**
	 * @name PhysicsSystem
	 * @class PhysicsSystem a singleton representing the physics system
	 * @requires Vector3DUtil
	 * @requires JConfig
	 * @requires CollPointInfo
	 * @requires CollisionSystem
	 * @requires ContactData
	 * @requires JMatrix3D
	 * @requires JNumber3D
	 * @requires BodyPair
	 * @requires CachedImpulse
	 * @property {PhysicsSystem} _currentPhysicsSystem
	 * @property {number} _maxVelMag
	 * @property {number} _minVelForProcessing
	 * @property {array} _bodies a collection of RigidBody objects
	 * @property {array} _activeBodies a collection of RigidBody objects
	 * @property {array} _collisions a collection of CollisionInfo objects
	 * @property {array} _constraints a collection of JConstraint objects
	 * @property {array} _controllers a collection of PhysicsController objects
	 * @property {array} _effects  a collection of JEffect objects
	 * @property {number} _gravityAxis
	 * @property {array} _gravity a 3D vector
	 * @property {boolean} _doingIntegration
	 * @property {function} preProcessCollisionFn
	 * @property {function} preProcessContactFn
	 * @property {function} processCollisionFn
	 * @property {function} processContactFn
	 * @property {array} _cachedContacts a collection of ContactData objects
	 * @property {CollisionSystem} _collisionSystem
	 * @constructor
	 **/
	var PhysicsSystem=function(){
		this.setSolverType(JConfig.solverType);
		this._doingIntegration = false;
		this._bodies = [];
		this._collisions = [];
		this._effects=[];
		this._activeBodies = [];
		this._constraints = [];
		this._controllers = [];

		this._cachedContacts = [];
		this._collisionSystem = new CollisionSystemBrute();

		this.setGravity(JNumber3D.getScaleVector(Vector3DUtil.Y_AXIS, -10));
	};
	
	PhysicsSystem.prototype._currentPhysicsSystem=null;

	PhysicsSystem.prototype._maxVelMag = 0.5;
	PhysicsSystem.prototype._minVelForProcessing = 0.001;

	PhysicsSystem.prototype._bodies = null;
	PhysicsSystem.prototype._activeBodies=null;
	PhysicsSystem.prototype._collisions=null;
	PhysicsSystem.prototype._constraints=null;
	PhysicsSystem.prototype._controllers=null;
	PhysicsSystem.prototype._effects=null;

	PhysicsSystem.prototype._gravityAxis=null;
	PhysicsSystem.prototype._gravity=null;

	PhysicsSystem.prototype._doingIntegration=null;

	PhysicsSystem.prototype.preProcessCollisionFn=function(){};
	PhysicsSystem.prototype.preProcessContactFn=function(){};
	PhysicsSystem.prototype.processCollisionFn=function(){};
	PhysicsSystem.prototype.processContactFn=function(){};

	PhysicsSystem.prototype._cachedContacts=null;
	PhysicsSystem.prototype._collisionSystem=null;
	
	/**
	 * @function getInstance returns the singleton instance
	 * @type PhysicsSystem
	 **/
	PhysicsSystem.getInstance=function(){
		if (!PhysicsSystem._currentPhysicsSystem){
			PhysicsSystem._currentPhysicsSystem = new PhysicsSystem();
		}
		return PhysicsSystem._currentPhysicsSystem;
	};
	
	/**
	 * @function getAllExternalForces
	 * @type void
	 **/
	PhysicsSystem.prototype.getAllExternalForces=function(dt){
		for(var i=0, bl=this._bodies.length; i<bl; i++){
			this._bodies[i].addExternalForces(dt);
		}

		for(var i=0, cl=this._controllers.length; i<cl; i++){
			this._controllers[i].updateController(dt);
		}
	};
	//TODO document here
	PhysicsSystem.prototype.setCollisionSystem=function(collisionSystemGrid, sx, sy, sz, nx, ny, nz, dx, dy, dz){
		if(sx==undefined) sx=0;
		if(sy==undefined) sy=0;
		if(sz==undefined) sz=0;
		if(nx==undefined) nx=20;
		if(ny==undefined) ny=20;
		if(nz==undefined) nz=20;
		if(dx==undefined) dx=200;
		if(dy==undefined) dy=200;
		if(dz==undefined) dz=200;
		// which collisionsystem to use grid / brute
		if (collisionSystemGrid){
			this._collisionSystem = new CollisionSystemGrid(sx, sy, sz, nx, ny, nz, dx, dy, dz);
		}else{
			this._collisionSystem = new CollisionSystemBrute(); // brute by default      
		}
	};

	/**
	 * @function getCollisionSystem getter for _collisionSystem
	 * @type CollisionSystem
	 **/
	PhysicsSystem.prototype.getCollisionSystem=function(){
		return this._collisionSystem;
	};

	/**
	 * @function setGravity
	 * @param {array} gravity a 3D vector
	 * @type void
	 **/
	PhysicsSystem.prototype.setGravity=function(gravity){
		this._gravity = gravity;
		if (this._gravity[0] == this._gravity[1] && this._gravity[1] == this._gravity[2])
			this._gravityAxis = -1;

		this._gravityAxis = 0;
		
		if (Math.abs(this._gravity[1]) > Math.abs(this._gravity[2]))
			this._gravityAxis = 1;

		if (Math.abs(this._gravity[2]) > Math.abs(this._gravity[this._gravityAxis]))
			this._gravityAxis = 2;
	};

	/**
	 * @function get_gravity global gravity acceleration
	 * @type array
	 **/
	PhysicsSystem.prototype.get_gravity=function(){
		return this._gravity;
	};

	/**
	 * @function get_gravityAxis getter for _gravityAxis
	 * @type number
	 **/
	PhysicsSystem.prototype.get_gravityAxis=function(){
		return this._gravityAxis;
	};

	/**
	 * @function get_bodies getter for _bodies
	 * @type array
	 **/
	PhysicsSystem.prototype.get_bodies=function(){
		return this._bodies;
	};

	/**
	 * @function addBody add a RigidBody to the simulation
	 * @param {RigidBody} body
	 * @type void
	 **/
	PhysicsSystem.prototype.addBody=function(body){
		if (!this.findBody(body)){
			this._bodies.push(body);
			this._collisionSystem.addCollisionBody(body);
		}
	};

	/**
	 * @function removeBody remove a RigidBody from the simulation
	 * @param {RigidBody} body
	 * @type void
	 **/
	PhysicsSystem.prototype.removeBody=function(body){
		if (this.findBody(body)){
			this._bodies.splice(this._bodies.indexOf(body), 1);
			this._collisionSystem.removeCollisionBody(body);
		}
	};

	/**
	 * @function removeAllBodies remove all bodies from the simulation
	 * @type void
	 **/
	PhysicsSystem.prototype.removeAllBodies=function(){
		this._bodies = [];
		this._collisionSystem.removeAllCollisionBodies();
	};

	/**
	 * @function addConstraint add a constraint to the simulation
	 * @param {JConstraint} constraint
	 * @type void
	 **/
	PhysicsSystem.prototype.addConstraint=function(constraint){
		if (!this.findConstraint(constraint))
			this._constraints.push(constraint);
	};
	
	/**
	 * @function removeConstraint remove a constraint from the simulation
	 * @param {JConstraint} constraint
	 * @type void
	 **/
	PhysicsSystem.prototype.removeConstraint=function(constraint){
		if (this.findConstraint(constraint))
			this._constraints.splice(this._constraints.indexOf(constraint), 1);
	};

	/**
	 * @function removeAllConstraints remove all constraints from the simulation
	 * @type void
	 **/
	PhysicsSystem.prototype.removeAllConstraints=function(){
		this._constraints = [];
	};
	
	/**
	 * @function addEffect add an effect to the simulation
	 * @param {JEffect} effect
	 * @type void
	 **/
	PhysicsSystem.prototype.addEffect=function(effect){
		if (!this.findEffect(effect))
			this._effects.push(effect);
	};
	
	/**
	 * @function removeEffect remove an effect from the simulation
	 * @param {JEffect} effect
	 * @type void
	 **/
	PhysicsSystem.prototype.removeEffect=function(effect){
		if (this.findEffect(effect))
			this._effects.splice(this._effects.indexOf(effect), 1);
	};

	/**
	 * @function removeAllEffects remove all effects from the simulation
	 * @type void
	 **/
	PhysicsSystem.prototype.removeAllEffects=function(){
		this._effects = [];
	};

	/**
	 * @function addController add a physics controller to the simulation
	 * @param {PhysicsController} controller
	 * @type void
	 **/
	PhysicsSystem.prototype.addController=function(controller){
		if (!this.findController(controller))
			this._controllers.push(controller);
	};

	/**
	 * @function removeController remove a physics controller from the simulation
	 * @param {PhysicsController} controller
	 * @type void
	 **/
	PhysicsSystem.prototype.removeController=function(controller){
		if (this.findController(controller))
			this._controllers.splice(this._controllers.indexOf(controller), 1);
	};

	/**
	 * @function removeAllControllers remove all physics controllers from the simulation
	 * @type void
	 **/
	PhysicsSystem.prototype.removeAllControllers=function(){
		this._controllers = [];
	};

	/**
	 * @function setSolverType select which solver type should be used for the simulation
	 * @see JConfig.solverType
	 * @param {string} type
	 * @type void
	 **/
	PhysicsSystem.prototype.setSolverType=function(type){
		switch (type)
		{
			case "FAST":
				this.preProcessCollisionFn = this.preProcessCollisionFast;
				this.preProcessContactFn = this.preProcessCollisionFast;
				this.processCollisionFn = this.processCollision;
				this.processContactFn = this.processCollision;
				return;
			case "NORMAL":
				this.preProcessCollisionFn = this.preProcessCollisionNormal;
				this.preProcessContactFn = this.preProcessCollisionNormal;
				this.processCollisionFn = this.processCollision;
				this.processContactFn = this.processCollision;
				return;
			case "ACCUMULATED":
				this.preProcessCollisionFn = this.preProcessCollisionAccumulated;
				this.preProcessContactFn = this.preProcessCollisionAccumulated;
				this.processCollisionFn = this.processCollision;
				this.processContactFn = this.processCollisionAccumulated;
				return;
			default:
				this.preProcessCollisionFn = this.preProcessCollisionNormal;
				this.preProcessContactFn = this.preProcessCollisionNormal;
				this.processCollisionFn = this.processCollision;
				this.processContactFn = this.processCollision;
				return;
		}
	};

	/**
	 * @function findBody find a body in _bodies
	 * @param {RigidBody} body
	 * @returns true if the body is found, otherwise false
	 * @type boolean
	 **/
	PhysicsSystem.prototype.findBody=function(body){
		return (this._bodies.indexOf(body)>-1);
	};

	/**
	 * @function findConstraint find a constraint in _constraints
	 * @param {JConstraint} constraint
	 * @returns true if the constraint is found, otherwise false
	 * @type boolean
	 **/
	PhysicsSystem.prototype.findConstraint=function(constraint){
		var i=this._constraints.length-1;
		if (i > 0) do { if(constraint==this._constraints[i]) return true; } while (i--);
		return false;
	};
	
	/**
	 * @function findEffect find an effect in _effects
	 * @param {JEffect} effect
	 * @returns true if the effect is found, otherwise false
	 * @type boolean
	 **/
	PhysicsSystem.prototype.findEffect=function(effect){
		var i=this._effects.length-1;
		if (i > 0) do { if(effect==this._effects[i]) return true; } while (i--);
		return false;
	};

	/**
	 * @function findController find a controller in _controllers
	 * @param {PhysicsController} controller
	 * @returns true if the controller is found, otherwise false
	 * @type boolean
	 **/
	PhysicsSystem.prototype.findController=function(controller){
		var i=this._controllers.length-1;
		if (i > 0) do { if(controller==this._controllers[i]) return true; } while (i--);
		return false;
	};

	/**
	 * @function preProcessCollisionFast a fast-but-inaccurate pre-processor
	 * @param {CollisionInfo} collision
	 * @param {number} dt a UNIX timestamp
	 * @type void
	 **/
	PhysicsSystem.prototype.preProcessCollisionFast=function(collision, dt){
		collision.satisfied=false;

		var body0 = collision.objInfo.body0;
		var body1 = collision.objInfo.body1;

		var N = collision.dirToBody;
		var timescale = JConfig.numPenetrationRelaxationTimesteps * dt;
		var approachScale = 0;
		var ptInfo;
		var tempV;
		var ptNum = collision.pointInfo.length;
		var numTiny = JNumber3D.NUM_TINY;

		if (ptNum > 1){
			var avR0 = [0,0,0,0];
			var avR1 = [0,0,0,0];
			var avDepth = 0;

			for (var i = 0; i < ptNum; i++){
				ptInfo = collision.pointInfo[i];
				avR0 = Vector3DUtil.add(avR0, ptInfo.r0);
				avR1 = Vector3DUtil.add(avR1, ptInfo.r1);
				avDepth += ptInfo.initialPenetration;
			}
			avR0 = JNumber3D.getDivideVector(avR0, ptNum);
			avR1 = JNumber3D.getDivideVector(avR1, ptNum);
			avDepth /= ptNum;

			var colPI = new CollPointInfo();
			colPI.r0 = avR0;
			colPI.r1 = avR1;
			colPI.initialPenetration = avDepth;
			collision.pointInfo = [colPI];
		}
		
		// removed loop because collision.pointInfo.length can only ever be 1 - Jim Sangwine
		ptInfo = collision.pointInfo[0];
		if (!body0.get_movable()){
			ptInfo.denominator = 0;
		}else{
			tempV = Vector3DUtil.crossProduct(ptInfo.r0, N);
			JMatrix3D.multiplyVector(body0.get_worldInvInertia(), tempV);
			ptInfo.denominator = body0.get_invMass() + Vector3DUtil.dotProduct(N, Vector3DUtil.crossProduct(tempV, ptInfo.r0));
		}
		if (body1.get_movable()){
			tempV = Vector3DUtil.crossProduct(ptInfo.r1, N);
			JMatrix3D.multiplyVector(body1.get_worldInvInertia(), tempV);
			ptInfo.denominator += (body1.get_invMass() + Vector3DUtil.dotProduct(N, Vector3DUtil.crossProduct(tempV, ptInfo.r1)));
		}
		if (ptInfo.denominator < numTiny)
			ptInfo.denominator = numTiny;

		if (ptInfo.initialPenetration > JConfig.allowedPenetration){
			ptInfo.minSeparationVel = (ptInfo.initialPenetration - JConfig.allowedPenetration) / timescale;
		}else{
			approachScale = -0.1 * (ptInfo.initialPenetration - JConfig.allowedPenetration) / JConfig.allowedPenetration;
			if (approachScale < numTiny)
				approachScale = numTiny;
			else if (approachScale > 1)
				approachScale = 1;
			var max = (dt > numTiny) ? dt : numTiny; // ~7x quicker than Math.max in Chromium, ~4x quicker in WebKit and marginally slower in Minefield
			ptInfo.minSeparationVel = approachScale * (ptInfo.initialPenetration - JConfig.allowedPenetration) / max;
		}
		
		if (ptInfo.minSeparationVel > this._maxVelMag)
			ptInfo.minSeparationVel = this._maxVelMag;
	};

	/**
	 * @function preProcessCollisionNormal a special pre-processor for the normal solver
	 * @param {CollisionInfo} collision
	 * @param {number} dt a UNIX timestamp
	 * @type void
	 **/
	PhysicsSystem.prototype.preProcessCollisionNormal=function(collision, dt){
		collision.satisfied = false;

		var body0 = collision.objInfo.body0;
		var body1 = collision.objInfo.body1;

		var N = collision.dirToBody;
		var timescale= JConfig.numPenetrationRelaxationTimesteps * dt;
		var approachScale = 0;
		var ptInfo;
		var tempV;
		var len= collision.pointInfo.length;
		for (var i = 0; i < len; i++){
			ptInfo = collision.pointInfo[i];
			if (!body0.get_movable()){
				ptInfo.denominator = 0;
			}else{
				tempV = Vector3DUtil.crossProduct(ptInfo.r0, N);
				JMatrix3D.multiplyVector(body0.get_worldInvInertia(), tempV);
				ptInfo.denominator = body0.get_invMass() + Vector3DUtil.dotProduct(N, Vector3DUtil.crossProduct(tempV, ptInfo.r0));
			}

			if (body1.get_movable()){
				tempV = Vector3DUtil.crossProduct(ptInfo.r1, N);
				JMatrix3D.multiplyVector(body1.get_worldInvInertia(), tempV);
				ptInfo.denominator += (body1.get_invMass() + Vector3DUtil.dotProduct(N, Vector3DUtil.crossProduct(tempV, ptInfo.r1)));
			}

			if (ptInfo.denominator < JNumber3D.NUM_TINY)
				ptInfo.denominator = JNumber3D.NUM_TINY;

			if (ptInfo.initialPenetration > JConfig.allowedPenetration){
				ptInfo.minSeparationVel = (ptInfo.initialPenetration - JConfig.allowedPenetration) / timescale;
			}else{
				approachScale = -0.1 * (ptInfo.initialPenetration - JConfig.allowedPenetration) / JConfig.allowedPenetration;
				if (approachScale < JNumber3D.NUM_TINY)
					approachScale = JNumber3D.NUM_TINY;
				else if (approachScale > 1)
					approachScale = 1;
				
				var max=(dt > JNumber3D.NUM_TINY) ? dt : JNumber3D.NUM_TINY;
				ptInfo.minSeparationVel = approachScale * (ptInfo.initialPenetration - JConfig.allowedPenetration) / max;
			}
			if (ptInfo.minSeparationVel > this._maxVelMag)
				ptInfo.minSeparationVel = this._maxVelMag;
		}
	};

	/**
	 * @function preProcessCollisionAccumulated a special pre-processor for the accumulated solver
	 * @param {CollisionInfo} collision
	 * @param {number} dt a UNIX timestamp
	 * @type void
	 **/
	PhysicsSystem.prototype.preProcessCollisionAccumulated=function(collision, dt){
		collision.satisfied = false;
		var body0 = collision.objInfo.body0;
		var body1 = collision.objInfo.body1;
		var N = collision.dirToBody;
		var timescale = JConfig.numPenetrationRelaxationTimesteps * dt;
		var tempV;
		var ptInfo;
		var initMinAllowedPen;
		var approachScale = 0;
		var numTiny = JNumber3D.NUM_TINY;
		var allowedPenetration = JConfig.allowedPenetration;
		var len = collision.pointInfo.length;
		for (var i = 0; i < len; i++){
			ptInfo = collision.pointInfo[i];
			initMinAllowedPen = ptInfo.initialPenetration - allowedPenetration;
			if (!body0.get_movable()){
				ptInfo.denominator = 0;
			}else{
				tempV = Vector3DUtil.crossProduct(ptInfo.r0, N);
				JMatrix3D.multiplyVector(body0.get_worldInvInertia(), tempV);
				ptInfo.denominator = body0.get_invMass() + Vector3DUtil.dotProduct(N, Vector3DUtil.crossProduct(tempV, ptInfo.r0));
			}

			if (body1.get_movable()){
				tempV = Vector3DUtil.crossProduct(ptInfo.r1, N);
				JMatrix3D.multiplyVector(body1.get_worldInvInertia(), tempV);
				ptInfo.denominator += (body1.get_invMass() + Vector3DUtil.dotProduct(N, Vector3DUtil.crossProduct(tempV, ptInfo.r1)));
			}
			if (ptInfo.denominator < numTiny) ptInfo.denominator = numTiny;

			if (ptInfo.initialPenetration > allowedPenetration){
				ptInfo.minSeparationVel = initMinAllowedPen / timescale;
			}else{
				approachScale = -0.1 * initMinAllowedPen / allowedPenetration;
				
				if (approachScale < numTiny) approachScale = numTiny;
				else if (approachScale > 1) approachScale = 1;
				
				var max=(dt>numTiny) ? dt : numTiny;
				ptInfo.minSeparationVel = approachScale * initMinAllowedPen / max;
			}

			ptInfo.accumulatedNormalImpulse = 0;
			ptInfo.accumulatedNormalImpulseAux = 0;
			ptInfo.accumulatedFrictionImpulse = [0,0,0,0];

			var bestDistSq = 0.04;
			var bp = new BodyPair(body0, body1, [0,0,0,0], [0,0,0,0]);

			for(var j=0, ccl=this._cachedContacts.length; j<ccl; j++){
				var cont=this._cachedContacts[j];
				var cpair=cont.pair;

				if (bp.body0 != cpair.body0 || bp.body1 == cpair.body1)
					continue;

				var distSq = (cpair.body0 == body0)  ? Vector3DUtil.get_lengthSquared(Vector3DUtil.subtract(cpair.r, ptInfo.r0)) 
													 : Vector3DUtil.get_lengthSquared(Vector3DUtil.subtract(cpair.r, ptInfo.r1));

				if (distSq < bestDistSq){
					bestDistSq = distSq;
					ptInfo.accumulatedNormalImpulse = this._cachedContacts[j].impulse.normalImpulse;
					ptInfo.accumulatedNormalImpulseAux = this._cachedContacts[j].impulse.normalImpulseAux;
					ptInfo.accumulatedFrictionImpulse = this._cachedContacts[j].impulse.frictionImpulse;
					if (this._cachedContacts[j].pair.body0 != body0){
						ptInfo.accumulatedFrictionImpulse = JNumber3D.getScaleVector(ptInfo.accumulatedFrictionImpulse, -1);
					}
				}
			}
			
			var impulse;
			if (ptInfo.accumulatedNormalImpulse != 0){
				impulse = JNumber3D.getScaleVector(N, ptInfo.accumulatedNormalImpulse);
				impulse = Vector3DUtil.add(impulse, ptInfo.accumulatedFrictionImpulse);
				body0.applyBodyWorldImpulse(impulse, ptInfo.r0);
				body1.applyBodyWorldImpulse(JNumber3D.getScaleVector(impulse, -1), ptInfo.r1);
			}
			if (ptInfo.accumulatedNormalImpulseAux != 0){
				impulse = JNumber3D.getScaleVector(N, ptInfo.accumulatedNormalImpulseAux);
				body0.applyBodyWorldImpulseAux(impulse, ptInfo.r0);
				body1.applyBodyWorldImpulseAux(JNumber3D.getScaleVector(impulse, -1), ptInfo.r1);
			}
		}
	};
	
	/**
	 * @function processCollision handle an individual collision by classifying it, calculating
	 * impulse, applying impulse and updating the velocities of the objects. Allows over-riding of the elasticity.
	 * 
	 * @param {CollisionInfo} collision
	 * @param {number} dt a UNIX timestamp
	 * @returns true if an impulse was applied, otherwise false
	 * @type boolean
	 **/
	PhysicsSystem.prototype.processCollision=function(collision, dt){
		collision.satisfied = true;

		var body0 = collision.objInfo.body0;
		var body1 = collision.objInfo.body1;

		var gotOne = false;
		var N = collision.dirToBody;

		var deltaVel = 0;
		var normalVel = 0;
		var finalNormalVel = 0;
		var normalImpulse= 0;
		var impulse;
		var Vr0;
		var Vr1;
		var ptInfo;
		
		// tracking var for the collision event
		var appliedImpulse = [0,0,0,0];
		
		var len = collision.pointInfo.length;
		for (var i = 0; i < len; i++){
			ptInfo = collision.pointInfo[i];

			Vr0 = body0.getVelocity(ptInfo.r0);
			Vr1 = body1.getVelocity(ptInfo.r1);

			normalVel = Vector3DUtil.dotProduct(Vector3DUtil.subtract(Vr0, Vr1), N);
			if (normalVel > ptInfo.minSeparationVel)
				continue;

			finalNormalVel = -1 * collision.mat.get_restitution() * normalVel;
			if (finalNormalVel < this._minVelForProcessing)
				finalNormalVel = ptInfo.minSeparationVel;

			deltaVel = finalNormalVel - normalVel;
			if (deltaVel <= this._minVelForProcessing)
				continue;

			normalImpulse = deltaVel / ptInfo.denominator;

			gotOne = true;
			impulse = JNumber3D.getScaleVector(N, normalImpulse);
			appliedImpulse = Vector3DUtil.add(appliedImpulse, impulse); // keep track of the total impulse applied

			body0.applyBodyWorldImpulse(impulse, ptInfo.r0);
			body1.applyBodyWorldImpulse(JNumber3D.getScaleVector(impulse, -1), ptInfo.r1);

			Vr0 = body0.getVelocity(ptInfo.r0);
			Vr1 = body1.getVelocity(ptInfo.r1);

			var tempV;
			var VR = Vr0.slice(0);
			if(body1.get_movable()) VR = Vector3DUtil.subtract(Vr0, Vr1);
			var tangent_vel = Vector3DUtil.subtract(VR, JNumber3D.getScaleVector(N, Vector3DUtil.dotProduct(VR, N)));
			var tangent_speed = Vector3DUtil.get_length(tangent_vel);

			if (tangent_speed > this._minVelForProcessing){
				var T = JNumber3D.getDivideVector(tangent_vel, -tangent_speed);
				var denominator = 0;

				if (body0.get_movable()){
					tempV = Vector3DUtil.crossProduct(ptInfo.r0, T);
					JMatrix3D.multiplyVector(body0.get_worldInvInertia(), tempV);
					denominator = body0.get_invMass() + Vector3DUtil.dotProduct(T, Vector3DUtil.crossProduct(tempV, ptInfo.r0));
				}

				if (body1.get_movable()){
					tempV = Vector3DUtil.crossProduct(ptInfo.r1, T);
					JMatrix3D.multiplyVector(body1.get_worldInvInertia(), tempV);
					denominator += (body1.get_invMass() + Vector3DUtil.dotProduct(T, Vector3DUtil.crossProduct(tempV, ptInfo.r1)));
				}

				if (denominator > JNumber3D.NUM_TINY){
					var impulseToReverse = tangent_speed / denominator;
					T = JNumber3D.getScaleVector(T, impulseToReverse);
					body0.applyBodyWorldImpulse(T, ptInfo.r0);
					body1.applyBodyWorldImpulse(JNumber3D.getScaleVector(T, -1), ptInfo.r1);
				}
			}
		}

		if (gotOne){
			body0.setConstraintsAndCollisionsUnsatisfied();
			body1.setConstraintsAndCollisionsUnsatisfied();
			// dispatch collision events
			if(Vector3DUtil.get_length(appliedImpulse)>0){ //only fire event if the impulse size is greater then zero
				body0.dispatchEvent(new JCollisionEvent(body1, appliedImpulse));
				body1.dispatchEvent(new JCollisionEvent(body0, JNumber3D.getScaleVector(appliedImpulse, -1)));
			}
		}
		return gotOne;
	};

	/**
	 * @function processCollisionAccumulated accumulated and clamp impulses
	 * 
	 * @param {CollisionInfo} collision
	 * @param {number} dt a UNIX timestamp
	 * @returns true if an impulse was applied, otherwise false
	 * @type boolean
	 **/
	PhysicsSystem.prototype.processCollisionAccumulated=function(collision, dt){
		collision.satisfied = true;
		var gotOne = false;
		var N = collision.dirToBody;
		var body0 = collision.objInfo.body0;
		var body1 = collision.objInfo.body1;

		var deltaVel = 0;
		var normalVel = 0;
		var normalImpulse = 0;
		var impulse;
		var Vr0;
		var Vr1;
		var ptInfo;
		
		// tracking var for the collision event
		var appliedImpulse = [0,0,0,0];
		
		var len = collision.pointInfo.length;
		for (var i = 0; i < len; i++){
			ptInfo = collision.pointInfo[i];

			Vr0 = body0.getVelocity(ptInfo.r0);
			Vr1 = body1.getVelocity(ptInfo.r1);
			normalVel = Vector3DUtil.dotProduct(Vector3DUtil.subtract(Vr0, Vr1), N);
			deltaVel = -normalVel;
			if (ptInfo.minSeparationVel < 0)
				deltaVel += ptInfo.minSeparationVel;

			if (Math.abs(deltaVel) > this._minVelForProcessing){
				normalImpulse = deltaVel / ptInfo.denominator;
				var origAccumulatedNormalImpulse = ptInfo.accumulatedNormalImpulse;
				var accImpulse=(origAccumulatedNormalImpulse + normalImpulse);
				if (accImpulse<0) accImpulse = 0;
				ptInfo.accumulatedNormalImpulse = accImpulse;
				var actualImpulse = accImpulse - origAccumulatedNormalImpulse;

				impulse = JNumber3D.getScaleVector(N, actualImpulse);
				appliedImpulse = Vector3DUtil.add(appliedImpulse, impulse); // keep track of the total impulse applied
				
				body0.applyBodyWorldImpulse(impulse, ptInfo.r0);
				body1.applyBodyWorldImpulse(JNumber3D.getScaleVector(impulse, -1), ptInfo.r1);

				gotOne = true;
			}

			Vr0 = body0.getVelocityAux(ptInfo.r0);
			Vr1 = body1.getVelocityAux(ptInfo.r1);
			normalVel = Vector3DUtil.dotProduct(Vector3DUtil.subtract(Vr0, Vr1), N);

			deltaVel = -normalVel;
			if (ptInfo.minSeparationVel > 0)
				deltaVel += ptInfo.minSeparationVel;

			if (Math.abs(deltaVel) > this._minVelForProcessing){
				normalImpulse = deltaVel / ptInfo.denominator;
				origAccumulatedNormalImpulse = ptInfo.accumulatedNormalImpulseAux;
				var accImpulseAux=ptInfo.accumulatedNormalImpulseAux + normalImpulse;
				if (accImpulseAux < 0) accImpulseAux = 0;
				ptInfo.accumulatedNormalImpulseAux = accImpulseAux;
				actualImpulse = accImpulseAux - origAccumulatedNormalImpulse;

				impulse = JNumber3D.getScaleVector(N, actualImpulse);
				body0.applyBodyWorldImpulseAux(impulse, ptInfo.r0);
				body1.applyBodyWorldImpulseAux(JNumber3D.getScaleVector(impulse, -1), ptInfo.r1);

				gotOne = true;
			}

			if (ptInfo.accumulatedNormalImpulse > 0){
				Vr0 = body0.getVelocity(ptInfo.r0);
				Vr1 = body1.getVelocity(ptInfo.r1);
				var tempV;
				var VR = Vector3DUtil.subtract(Vr0, Vr1);
				var tangent_vel = Vector3DUtil.subtract(VR, JNumber3D.getScaleVector(N, Vector3DUtil.dotProduct(VR, N)));
				var tangent_speed = Vector3DUtil.get_length(tangent_vel);
				if (tangent_speed > this._minVelForProcessing){
					var T= JNumber3D.getScaleVector(JNumber3D.getDivideVector(tangent_vel, tangent_speed), -1);
					var denominator = 0;
					if (body0.get_movable()){
						tempV = Vector3DUtil.crossProduct(ptInfo.r0, T);
						JMatrix3D.multiplyVector(body0.get_worldInvInertia(), tempV);
						denominator = body0.invMass + Vector3DUtil.dotProduct(T, Vector3DUtil.crossProduct(tempV, ptInfo.r0));
					}
					if (body1.get_movable()){
						tempV = Vector3DUtil.crossProduct(ptInfo.r1, T);
						JMatrix3D.multiplyVector(body1.get_worldInvInertia(), tempV);
						denominator += (body1.invMass + Vector3DUtil.dotProduct(T, Vector3DUtil.crossProduct(tempV, ptInfo.r1)));
					}
					if (denominator > JNumber3D.NUM_TINY){
						var impulseToReverse = tangent_speed / denominator;
						var frictionImpulseVec = JNumber3D.getScaleVector(T, impulseToReverse);

						var origAccumulatedFrictionImpulse = ptInfo.accumulatedFrictionImpulse.slice(0);
						ptInfo.accumulatedFrictionImpulse = Vector3DUtil.add(ptInfo.accumulatedFrictionImpulse, frictionImpulseVec);

						var AFIMag = Vector3DUtil.get_length(ptInfo.accumulatedFrictionImpulse);
						var maxAllowedAFIMag = collision.mat.friction * ptInfo.accumulatedNormalImpulse;

						if (AFIMag > JNumber3D.NUM_TINY && AFIMag > maxAllowedAFIMag)
							ptInfo.accumulatedFrictionImpulse = JNumber3D.getScaleVector(ptInfo.accumulatedFrictionImpulse, maxAllowedAFIMag / AFIMag);

						var actualFrictionImpulse = Vector3DUtil.subtract(ptInfo.accumulatedFrictionImpulse, origAccumulatedFrictionImpulse);

						body0.applyBodyWorldImpulse(actualFrictionImpulse, ptInfo.r0);
						body1.applyBodyWorldImpulse(JNumber3D.getScaleVector(actualFrictionImpulse, -1), ptInfo.r1);
					}
				}
			}
		}
		if (gotOne)
		{
			body0.setConstraintsAndCollisionsUnsatisfied();
			body1.setConstraintsAndCollisionsUnsatisfied();
			// dispatch collision events
			if(Vector3DUtil.get_length(appliedImpulse)>0){ //only fire event if the impulse size is greater then zero
				body0.dispatchEvent(new JCollisionEvent(body1, appliedImpulse));
				body1.dispatchEvent(new JCollisionEvent(body0, JNumber3D.getScaleVector(appliedImpulse, -1)));
			}
		}
		return gotOne;
	};
	
	
	/**
	 * @function sortPositionX
	 * 
	 * @param {RigidBody} body0
	 * @param {RigidBody} body1
	 * @type number
	 **/
	PhysicsSystem.prototype.sortPositionX=function(body0, body1){
		if (body0.get_currentState().position[0] < body1.get_currentState().position[0])
			return -1;
		else if (body0.get_currentState().position[0] > body1.get_currentState().position[0])
			return 1;
		else
			return 0;
	};
                
	/**
	 * @function sortPositionY
	 * 
	 * @param {RigidBody} body0
	 * @param {RigidBody} body1
	 * @type number
	 **/
	PhysicsSystem.prototype.sortPositionY=function(body0, body1){
		if (body0.get_currentState().position[1] < body1.get_currentState().position[1])
			return -1;
		else if (body0.get_currentState().position[1] > body1.get_currentState().position[1])
			return 1;
		else
			return 0;
	};
                
	/**
	 * @function sortPositionZ
	 * 
	 * @param {RigidBody} body0
	 * @param {RigidBody} body1
	 * @type number
	 **/
	PhysicsSystem.prototype.sortPositionZ=function(body0, body1){
		if (body0.get_currentState().position[2] < body1.get_currentState().position[2])
			return -1;
		else if (body0.get_currentState().position[2] > body1.get_currentState().position[2])
			return 1;
		else
			return 0;
	};
                
	/**
	 * @function doShockStep the shock step helps with stacking
	 * @see JConfig.doShockStep
	 * @param {RigidBody} body0
	 * @param {RigidBody} body1
	 * @type void
	 **/
	PhysicsSystem.prototype.doShockStep=function(dt){
		if (Math.abs(this._gravity[0]) > Math.abs(this._gravity[1]) && Math.abs(this._gravity[0]) > Math.abs(this._gravity[2])){
			this._bodies = this._bodies.sort(this.sortPositionX);
			this._collisionSystem.collBody = this._collisionSystem.collBody.sort(this.sortPositionX);
		}else if (Math.abs(this._gravity[1]) > Math.abs(this._gravity[2]) && Math.abs(this._gravity[1]) > Math.abs(this._gravity[0])){
			this._bodies = this._bodies.sort(this.sortPositionY);
			this._collisionSystem.collBody = this._collisionSystem.collBody.sort(this.sortPositionY);
		}else if (Math.abs(this._gravity[2]) > Math.abs(this._gravity[0]) && Math.abs(this._gravity[2]) > Math.abs(this._gravity[1])){
			this._bodies = this._bodies.sort(this.sortPositionZ);
			this._collisionSystem.collBody = this._collisionSystem.collBody.sort(this.sortPositionZ);
		}
                        
		var info;
		var setImmovable;
		var gotOne = true;
		var body_collisions=[];
                        
		var body0;
		var body1;
                        

		while (gotOne){
			gotOne = false;
			for(var i=0;i<this._bodies.length;i++){
				var body=this._bodies[i];
				if (body.get_movable() && body.get_doShockProcessing()){
					if (body.collisions.length == 0 || !body.isActive){
						body.internalSetImmovable();
					}else{
						setImmovable = false;
						body_collisions = body.collisions;
						for(var j=0;j<body_collisions.length;j++){
							info=body_collisions[j];

							body0 = info.objInfo.body0;
							body1 = info.objInfo.body1;
                                                                
							if ((body0 == body && !body1.get_movable()) || (body1 == body && !body0.get_movable())){
								this.preProcessCollisionFast(info, dt);
								this.processCollision(info, dt);
								setImmovable = true;
							}
						}
                                                        
						if (setImmovable){
							body.internalSetImmovable();
							gotOne = true;
						}
					}
				}
			}
		}

		for(var i=0;i<this._bodies.length;i++){
			body=this._bodies[i];
			body.internalRestoreImmovable();
			body_collisions = body.collisions;
			for(var j=0;j<body_collisions.length;j++){
				info=body_collisions[j];
				this.preProcessCollisionFn(info, dt);
				this.processCollisionFn(info, dt);
			}
		}
	};
	
	/**
	 * @function updateContactCache
	 * @type void
	 **/
	PhysicsSystem.prototype.updateContactCache=function(){
		this._cachedContacts = [];
		var ptInfo;
		var fricImpulse;
		var contact;
		for(var i=0, cl=this._collisions.length; i<cl; i++){
			var collInfo=this._collisions[i];
			for (var j=0, pilen=collInfo.pointInfo.length; j<pilen; j++){
				ptInfo = collInfo.pointInfo[j];
				fricImpulse = (collInfo.objInfo.body0.id > collInfo.objInfo.body1.id) ? ptInfo.accumulatedFrictionImpulse : JNumber3D.getScaleVector(ptInfo.accumulatedFrictionImpulse, -1);

				contact = new ContactData();
				contact.pair = new BodyPair(collInfo.objInfo.body0, collInfo.objInfo.body1, ptInfo.r0, ptInfo.r1);
				contact.impulse = new CachedImpulse(ptInfo.accumulatedNormalImpulse, ptInfo.accumulatedNormalImpulseAux, ptInfo.accumulatedFrictionImpulse);

				this._cachedContacts.push(contact);
			}
		}
	};

	/**
	 * @function handleAllConstraints applies all constraints registered with the PhysicsSystem
	 * @param {number} dt a UNIX timestamp
	 * @param {number} iter
	 * @param {boolean} forceInelastic
	 * @type void
	 **/
	PhysicsSystem.prototype.handleAllConstraints=function(dt, iter, forceInelastic){
		var origNumCollisions = this._collisions.length;
		var collInfo;
		var _constraint;

		for(var i=0, cl=this._constraints.length; i<cl; i++){
			this._constraints[i].preApply(dt);
		}

		if (forceInelastic){
			for(var i=0, cl=this._collisions.length; i<cl; i++){
				this.preProcessContactFn(this._collisions[i], dt);
				this._collisions[i].mat.set_restitution(0);
				this._collisions[i].satisfied=false;
			}
		}else{
			for(var i=0, cl=this._collisions.length; i<cl;i++){
				this.preProcessCollisionFn(this._collisions[i], dt);
			}
		}

		var flag;
		var gotOne;
		var len;
		for (var step = 0; step < iter; step++){
			gotOne = false;

			for(var i=0, cl=this._collisions.length; i<cl;i++){
				collInfo=this._collisions[i];
				if (!collInfo.satisfied){
					if (forceInelastic){
						flag = this.processContactFn(collInfo, dt);
						gotOne = gotOne || flag;
					}else{
						flag = this.processCollisionFn(collInfo, dt);
						gotOne = gotOne || flag;
					}
				}
			}
			for(var i=0, cl=this._constraints.length; i<cl; i++){
				var _constraint=this._constraints[i];
				if (!_constraint.get_satisfied()){
					flag = _constraint.apply(dt);
					gotOne = gotOne || flag;
				}
			}
			this.tryToActivateAllFrozenObjects();

			if (forceInelastic){
				len = this._collisions.length;
				for (var j = origNumCollisions; j < len; j++){
					this._collisions[j].mat.set_restitution(0);
					this._collisions[j].satisfied=false;
					this.preProcessContactFn(this._collisions[j], dt);
				}
			}else{
				len = this._collisions.length;
				for (j = origNumCollisions; j < len; j++){
					this.preProcessCollisionFn(this._collisions[j], dt);
				}
			}
			origNumCollisions = this._collisions.length;
			if (!gotOne) break;
		}
	};

	/**
	 * @function handleAllEffects applies all effects registered with the PhysicsSystem
	 * @type void
	 **/
	PhysicsSystem.prototype.handleAllEffects=function(){
		var effect;
		var i=this._effects.length-1;
		if (i < 0) return;
		
		do {
			effect=this._effects[i];
			if (effect.enabled) effect.Apply();
		} while(i--);
	};
	
	/**
	 * @function activateObject 
	 * @param {RigidBody} body
	 * @type void
	 **/
	PhysicsSystem.prototype.activateObject=function(body){
		if (!body.get_movable() || body.isActive)
			return;

		body.setActive();
		this._activeBodies.push(body);
		var orig_num = this._collisions.length;
		this._collisionSystem.detectCollisions(body, this._collisions);
		var other_body;
		var thisBody_normal;
		for (var i=orig_num, len=this._collisions.length; i<len; i++){
			other_body = this._collisions[i].objInfo.body0;
			thisBody_normal = this._collisions[i].dirToBody;
			if (other_body == body){
				other_body = this._collisions[i].objInfo.body1;
				thisBody_normal = JNumber3D.getScaleVector(this._collisions[i].dirToBody, -1);
			}
			if (!other_body.isActive && Vector3DUtil.dotProduct(other_body.get_force(), thisBody_normal) < -JNumber3D.NUM_TINY)
				this.activateObject(other_body);
		}
	};

	/**
	 * @function dampAllActiveBodies 
	 * @type void
	 **/
	PhysicsSystem.prototype.dampAllActiveBodies=function(){
		for(var i=0, abl=this._activeBodies.length; i<abl; i++){
			_activeBody=this._activeBodies[i];
			_activeBody.dampForDeactivation();
		}
	};

	/**
	 * @function tryToActivateAllFrozenObjects 
	 * @type void
	 **/
	PhysicsSystem.prototype.tryToActivateAllFrozenObjects=function(){
		for(var i=0, bl=this._bodies.length; i<bl; i++){
			var _body=this._bodies[i];
			if (!_body.isActive){
				if (_body.getShouldBeActive()){
					this.activateObject(_body);
				}else{
					if (_body.getVelChanged()){
						_body.setVelocity([0,0,0,0]);
						_body.setAngVel([0,0,0,0]);
						_body.clearVelChanged();
					}
				}
			}	
		}
	};

	/**
	 * @function activateAllFrozenObjectsLeftHanging 
	 * @type void
	 **/
	PhysicsSystem.prototype.activateAllFrozenObjectsLeftHanging=function(){
		var other_body;
		for(var i=0, bl=this._bodies.length; i<bl; i++){
			var _body=this._bodies[i];
			if (_body.isActive){
				_body.doMovementActivations();
				if (_body.collisions.length > 0){
					for (var j=0, bcl=_body.collisions.length; j<bcl; j++){
						other_body = _body.collisions[j].objInfo.body0;
						if (other_body == _body)
							other_body = _body.collisions[j].objInfo.body1;

						if (!other_body.isActive)
							_body.addMovementActivation(_body.get_currentState().position, other_body);
					}
				}
			}
		}
	};

	/**
	 * @function updateAllVelocities
	 * @param {number} dt a UNIX timestamp 
	 * @type void
	 **/
	PhysicsSystem.prototype.updateAllVelocities=function(dt){
		for(var i=0, abl=this._activeBodies.length; i<abl; i++){
			_activeBody=this._activeBodies[i];
			_activeBody.updateVelocity(dt);
		}
	};

	/**
	 * @function updateAllPositions
	 * @param {number} dt a UNIX timestamp 
	 * @type void
	 **/
	PhysicsSystem.prototype.updateAllPositions=function(dt){
		for(var i=0, abl=this._activeBodies.length; i<abl; i++){
			_activeBody=this._activeBodies[i];
			_activeBody.updatePositionWithAux(dt);
		}
	};

	/**
	 * @function notifyAllPostPhysics
	 * @param {number} dt a UNIX timestamp 
	 * @type void
	 **/
	PhysicsSystem.prototype.notifyAllPostPhysics=function(dt){
		for(var i=0, abl=this._bodies.length; i<abl; i++){
			_body=this._bodies[i];
			_body.postPhysics(dt);
		}
	};

	/**
	 * @function updateAllObject3D
	 * @type void
	 **/
	PhysicsSystem.prototype.updateAllObject3D=function(){
		for(var i=0, abl=this._bodies.length; i<abl; i++){
			_body=this._bodies[i];
			_body.updateObject3D();
		}
	};

	/**
	 * @function limitAllVelocities
	 * @type void
	 **/
	PhysicsSystem.prototype.limitAllVelocities=function(){
		for(var i=0, abl=this._activeBodies.length; i<abl; i++){
			_activeBody=this._activeBodies[i];
			_activeBody.limitVel();
			_activeBody.limitAngVel();
		}
	};

	/**
	 * @function tryToFreezeAllObjects
	 * @param {number} dt a UNIX timestamp 
	 * @type void
	 **/
	PhysicsSystem.prototype.tryToFreezeAllObjects=function(dt){
		for(var i=0, abl=this._activeBodies.length; i<abl; i++){
			_activeBody=this._activeBodies[i];
			_activeBody.tryToFreeze(dt);
		}
	};

	/**
	 * @function detectAllCollisions
	 * @param {number} dt a UNIX timestamp 
	 * @type void
	 **/
	PhysicsSystem.prototype.detectAllCollisions=function(dt){
		for (var i=0, abl=this._activeBodies.length; i<abl; i++)
		{
			_activeBody=this._activeBodies[i];
			_activeBody.storeState();
		}
		
		this.updateAllVelocities(dt);
		this.updateAllPositions(dt);
		
		for (var i=0, bl=this._bodies.length; i<bl; i++)
		{
			_body=this._bodies[i];
			_body.collisions = [];
		}
		
		this._collisions = [];
		this._collisionSystem.detectAllCollisions(this._activeBodies, this._collisions);
		
		for (var i=0, abl=this._activeBodies.length; i<abl; i++)
		{
			_activeBody=this._activeBodies[i];
			_activeBody.restoreState();
		}
	};

	/**
	 * @function copyAllCurrentStatesToOld
	 * @type void
	 **/
	PhysicsSystem.prototype.copyAllCurrentStatesToOld=function(){
		for(var i=0, bl=this._bodies.length; i<bl; i++){
			_body=this._bodies[i];
			if (_body.isActive || _body.getVelChanged())
				_body.copyCurrentStateToOld();
		}
	};

	/**
	 * @function findAllActiveBodies
	 * @type void
	 **/
	PhysicsSystem.prototype.findAllActiveBodies=function(){
		this._activeBodies = [];
		for(var i=0, bl=this._bodies.length; i<bl; i++){
			var _body=this._bodies[i];
			if (_body.isActive)
				this._activeBodies.push(_body);
		}
	};

	/**
	 * @function integrate integrates the system forwards by dt 
	 * the caller is responsible for making sure that repeated calls to this use the same dt (if desired)
	 * @param {number} dt a UNIX timestamp 
	 * @type void
	 **/
	PhysicsSystem.prototype.integrate=function(dt){
		this._doingIntegration = true;

		this.findAllActiveBodies();
		this.copyAllCurrentStatesToOld();

		this.getAllExternalForces(dt);
		this.handleAllEffects();
		this.detectAllCollisions(dt);
		this.handleAllConstraints(dt, JConfig.numCollisionIterations, false);
		this.updateAllVelocities(dt);
		this.handleAllConstraints(dt, JConfig.numContactIterations, true);

		if (JConfig.doShockStep) {
			this.doShockStep(dt);
		}

		this.dampAllActiveBodies();
		this.tryToFreezeAllObjects(dt);
		this.activateAllFrozenObjectsLeftHanging();

		this.limitAllVelocities();

		this.updateAllPositions(dt);
		this.notifyAllPostPhysics(dt);

		this.updateAllObject3D();
		if (JConfig.solverType == "ACCUMULATED")
			this.updateContactCache();

		for(var i=0, bl=this._bodies.length; i<bl; i++){
			_body=this._bodies[i];
			_body.clearForces();
		}

		this._doingIntegration = false;
	};
	
	jigLib.PhysicsSystem=PhysicsSystem;
	

})(jigLib);