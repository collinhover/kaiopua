(function(jigLib){
	var Vector3DUtil=jigLib.Vector3DUtil;
	
	/**
	 * @author Jim Sangwine
	 * 
	 * @name GravityField
	 * @class GravityField a gravity field effect
	 * This effect has a radius within which it will either attract or repel bodies depending on the defined force 
	 * (positive values attract, negative repel) and their distance (the closer the object, the stronger the effect).
	 * This effect will be applied continuously as long as it is enabled
	 * This effect can either be placed at an arbitrary location in the scene, or it can be attached to a parent object.
	 * 
	 * @extends JEffect
	 * @requires Vector3DUtil
	 * @property {array} location initial location of the effect expressed as a 3D vector
	 * @property {number} radius radius of effect - the distance at which the effect's influence will drop to zero
	 * @property {number} force the force of the effect at 0 distance (impulse will be force/distance)
	 * @property {RigidBody} parent optional - a RigidBody that the gravitational field will follow - excluded from effect
	 * @constructor
	 * @param {array} location initial location of the effect expressed as a 3D vector
	 * @param {number} _radius radius of effect - the distance at which the effect's influence will drop to zero
	 * @param {number} _force the force of the effect at 0 distance (impulse will be force/distance)
	 * @param {RigidBody} _parent optional - a RigidBody that the gravitational field will follow - excluded from effect 
	 **/
	var GravityField=function(_location, _radius, _force, _parent) {
		this.Super();
		this.location=_location;
		this.radius=_radius;
		this.force=_force;
		if (_parent) this.parent=_parent;
	};
	jigLib.extend(GravityField,jigLib.JEffect);

	GravityField.prototype.location = null;
	GravityField.prototype.radius = null;
	GravityField.prototype.force = null;
	GravityField.prototype.parent = null;
	
	/**
	 * @function Apply applies the effect to the relevant bodies
	 * @see JEffect.Apply
	 * @type void
	 **/
	GravityField.prototype.Apply = function() {
		var system=jigLib.PhysicsSystem.getInstance();
		var bodies=system.get_bodies();
		var i=bodies.length-1;
		var curBody, distance, force, forceV;
		
		if (this.parent)
			this.location = this.parent.get_position();
		
		this._affectedBodies=[];
		do {
			curBody=bodies[i];
			if (!curBody.get_movable() || (this.parent && curBody == this.parent)) continue;

			distance=Vector3DUtil.distance(curBody.get_position(), this.location);
			if (distance < this.radius)
			{
				forceV=Vector3DUtil.subtract(curBody.get_position(), this.location);
				force=(1-(distance / this.radius)) * this.force;
				Vector3DUtil.scaleBy(forceV, force);
				Vector3DUtil.negate(forceV);
				system.activateObject(curBody);
				curBody.applyWorldImpulse(forceV, this.location);
			}
		} while(i--);
	};
	
	jigLib.GravityField=GravityField;
})(jigLib);