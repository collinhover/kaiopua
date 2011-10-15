(function(jigLib){
	var PhysicsSystem=jigLib.PhysicsSystem;
	
	/**
	 * @author bartekd
	 * 
	 * @name AbstractPhysics
	 * @class AbstractPhysics
	 * @requires PhysicsSystem
	 * @property {number} speed
	 * @property {number} inittime
	 * @property {PhysicsSystem} physicsSystem
	 * @constructor
	 * @param {number} speed
	 **/
	var AbstractPhysics=function(_speed) {
		if(_speed) this.speed = _speed;
		this.inittime=(new Date()).getTime();
		this.physicsSystem = PhysicsSystem.getInstance();
	};
	
	AbstractPhysics.prototype.speed=5;
	AbstractPhysics.prototype.inittime=null;
	AbstractPhysics.prototype.physicsSystem=null;
				
	/**
	 * @function addBody adds a body to the PhysicsSystem
	 * @param {RigidBody} body
	 * @type void
	 **/
	AbstractPhysics.prototype.addBody=function(body){
		this.physicsSystem.addBody(body);
	};
				
	/**
	 * @function removeBody removes a body from the PhysicsSystem
	 * @param {RigidBody} body
	 * @type void
	 **/
	AbstractPhysics.prototype.removeBody=function(body){
		physicsSystem.removeBody(body);
	};
				
	/**
	 * @function get_engine returns the PhysicsSystem
	 * @type PhysicsSystem
	 **/
	AbstractPhysics.prototype.get_engine=function(){
		return this.physicsSystem ;
	};
				
	/**
	 * @function step integrates the PhysicsSystem
	 * @type void
	 **/
	AbstractPhysics.prototype.step=function(){
		var stepTime = (new Date()).getTime();
		deltaTime = ((stepTime - this.initTime) / 1000) * this.speed;
		this.initTime = stepTime;
		this.physicsSystem.integrate(deltaTime);
	};
		
	jigLib.AbstractPhysics=AbstractPhysics;
		
})(jigLib);
		