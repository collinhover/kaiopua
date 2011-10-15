(function(jigLib){
	var Vector3DUtil=jigLib.Vector3DUtil;
	
	/**
	 * @author Jim Sangwine
	 * 
	 * @name Wind
	 * @class Wind a wind effect
	 * This effect has global influence - All objects that are movable in the scene will be affected, apart from those added to the exclusions array. 
	 * This effect will be applied continuously as long as it is enabled
	 * 
	 * @extends JEffect
	 * @requires Vector3DUtil
	 * @property {array} direction a 3D vector defining the force of the effect in each axis
	 * @property {array} exclusions optional - a list of bodies to be excluded from the effect
	 * @constructor
	 * @param {array} _direction a 3D vector defining the force of the effect in each axis
	 * @param {array} _exclusions optional - a list of bodies to be excluded from the effect
	 **/
	var Wind=function(_direction, _exclusions) {
		this.Super();
		this.direction=_direction;
		if (_exclusions) this.exclusions=_exclusions;
	};
	jigLib.extend(Wind,jigLib.JEffect);

	Wind.prototype.direction = null;
	Wind.prototype.exclusions = [];
	
	/**
	 * @function isExcluded checks if a given body is in the exclusions list
	 * @param {RigidBody} body the body to check for
	 * @type boolean
	 */
	Wind.prototype.isExcluded = function(body) {
		var i=this.exclusions.length;
		while (i--) { if (this.exclusions[i] == body) return true; }
		return false;
	};
	
	/**
	 * @function Apply applies the effect to the relevant bodies
	 * @see JEffect.Apply
	 * @type void
	 **/
	Wind.prototype.Apply = function() {
		var system=jigLib.PhysicsSystem.getInstance();
		var bodies=system.get_bodies();
		var i=bodies.length;
		var curBody;
		
		this._affectedBodies=[];
		while(i--) {
			curBody=bodies[i];
			if (!curBody.get_movable() || this.isExcluded(curBody)) continue;
			system.activateObject(curBody);
			curBody.applyWorldImpulse(this.direction, curBody.get_position());
		}
	};
	
	jigLib.Wind=Wind;
})(jigLib);