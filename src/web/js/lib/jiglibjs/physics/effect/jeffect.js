(function(jigLib){
	
	/**
	 * @author Jim Sangwine
	 * 
	 * @name JEffect
	 * @class JEffect the base class for effects
	 * @property {boolean} _effectEnabled changing this boolean registers and de-registers the effect with the physics system
	 * @constructor
	 **/
	var JEffect=function(){
		this._effectEnabled = true;
	};
	
	JEffect.prototype._effectEnabled=false;
	
	JEffect.prototype.__defineGetter__('enabled', 
										function() { return this._effectEnabled; });
	JEffect.prototype.__defineSetter__('enabled', 
										function(bool) {
											  				if (bool == this._effectEnabled) return;
											  				this._effectEnabled = bool;
											  				if (bool) jigLib.PhysicsSystem.getInstance().addEffect(this);
											  				else jigLib.PhysicsSystem.getInstance().removeEffect(this);
														});
	
	/**
	 * @function Apply this should be implemented by the effect to apply force to bodies in the physics system as appropriate.
	 * @see PhysicsSystem.handleAllEffects
	 * 
	 * @type void
	 */
	JEffect.prototype.Apply=function(){
		return;
	};
	
	jigLib.JEffect=JEffect;
})(jigLib);