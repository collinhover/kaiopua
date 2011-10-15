(function(jigLib){
	var Vector3DUtil=jigLib.Vector3DUtil;
	/**
	 * @author Jim Sangwine
	 * 
	 * This effect has a radius within which it will repel bodies depending on the defined force 
	 * and their distance (the closer the object, the stronger the effect). 
	 * 
	 * This effect will only be applied during a single cycle of the PhysicsSystem, imparting a sudden impulse.
	 * 
	 * This effect can either be placed at an arbitrary location in the scene, or it can be attached to a parent object.
	 * 
	 **/
	/**
	 * @author Jim Sangwine
	 * 
	 * @name Explosion
	 * @class Explosion an explosive force effect
	 * This effect has a radius within which it will repel bodies depending on the defined force 
	 * and their distance (the closer the object, the stronger the effect). 
	 * This effect will only be applied during a single cycle of the PhysicsSystem, imparting a sudden impulse.
	 * This effect can either be placed at an arbitrary location in the scene, or it can be attached to a parent object.
	 * 
	 * @extends JEffect
	 * @requires Vector3DUtil
	 * @property {array} location initial location of the effect expressed as a 3D vector
	 * @property {number} radius radius of effect - the distance at which the effect's influence will drop to zero
	 * @property {number} force the force of the effect at 0 distance (impulse will be force/distance)
	 * @property {RigidBody} parent optional - a RigidBody that the gravitational field will follow - excluded from the main effect force, but optionally receives relative force
	 * @property {boolean} relativity optional - toggle whether or not the parent receives a reactive impulse relative to that delivered to bodies falling within the effect radius 
	 * @constructor
	 * @param {array} _location initial location of the effect expressed as a 3D vector
	 * @param {number} _radius radius of effect
	 * @param {number} _force the force of the effect at 0 distance
	 * @param {RigidBody} _parent optional parent body
	 * @param {boolean} _relativity optional toggle whether or not the parent receives a reactive impulse
	 **/
	var Explosion=function(_location, _radius, _force, _parent, _relativity) {
		this.Super();
		this.location=_location;
		this.radius=_radius;
		this.force=_force;
		if (_parent) this.parent=_parent;
		if (_parent && _relativity) this.relativity=true;
		// set to NOT fire instantly...
		this.enabled = false;
	};
	jigLib.extend(Explosion,jigLib.JEffect);

	Explosion.prototype.location = null;
	Explosion.prototype.radius = null;
	Explosion.prototype.force = null;
	Explosion.prototype.parent = null;
	Explosion.prototype.relativity = false;

	/**
	 * @function explode triggers the effect (sets the effect to fire the next time Apply() is called)
	 * 
	 * @type void
	 **/
	Explosion.prototype.explode = function() {
		this.enabled = true;
	};
	
	/**
	 * @function Apply applies the effect to the relevant bodies
	 * @see JEffect.Apply
	 * @type void
	 **/
	Explosion.prototype.Apply = function() {
		this.enabled = false;
		var system=jigLib.PhysicsSystem.getInstance();
		
		var bodies=system.get_bodies();
		var i=bodies.length;
		var curBody, distance, force, forceV;
		var forceVP=[0,0,0,0];
		
		if (this.parent)
			this.location = this.parent.get_position();
		
		this._affectedBodies=[];
		while(i--) {
			curBody=bodies[i];
			if (this.parent && curBody == this.parent) continue;
			
			// handle normal bodies first
			if (curBody._type!="PLANE")
			{
				distance=Vector3DUtil.distance(curBody.get_position(), this.location);
				if (distance < this.radius)
				{
					forceV=Vector3DUtil.subtract(curBody.get_position(), this.location);
					force=(1-(distance / this.radius)) * this.force;
					Vector3DUtil.scaleBy(forceV, force);
					
					if(this.relativity) forceVP = Vector3DUtil.add(forceV,forceVP);
					
					if(curBody.get_movable()) 
					{
						system.activateObject(curBody);
						curBody.addWorldForce(forceV, this.location);
					}
				}
			}
			else if (this.relativity)
			{
				// allow ground and wall type immovable bodies to impart relative force to the exploding body
				distance=curBody.pointPlaneDistance(this.location);
				if (distance<this.radius)
				{
					forceV=Vector3DUtil.negate(curBody.get_normal().slice(0));
					force=(1-(distance / this.radius)) * (this.force*2);
					Vector3DUtil.scaleBy(forceV, force);
					forceVP = Vector3DUtil.add(forceV,forceVP);
				}
			}
		}
		if(this.relativity) {
			Vector3DUtil.limitSum(forceVP,this.force);
			Vector3DUtil.negate(forceVP);
			system.activateObject(this.parent);
			this.parent.applyWorldImpulse(forceVP, this.location);
		}
	};
	
	jigLib.Explosion=Explosion;
})(jigLib);