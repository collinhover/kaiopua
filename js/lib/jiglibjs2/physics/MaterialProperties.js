
(function(jiglib) {

	var PhysicsController = jiglib.PhysicsController;
	var CachedImpulse = jiglib.CachedImpulse;
	var PhysicsState = jiglib.PhysicsState;
	var RigidBody = jiglib.RigidBody;
	var HingeJoint = jiglib.HingeJoint;
	var BodyPair = jiglib.BodyPair;
	var PhysicsSystem = jiglib.PhysicsSystem;

	var MaterialProperties = function(_restitution, _friction)
	{
		this.restitution = null; // Number
		this.friction = null; // Number

		this.restitution = _restitution || 0.25;
		this.friction = _friction || 0.9;
		
	}



	jiglib.MaterialProperties = MaterialProperties; 

})(jiglib);

