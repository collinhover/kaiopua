(function(jigLib){
	/**
	 * @author Jim Sangwine
	 * 
	 * @name JCollisionEvent
	 * @class JCollisionEvent An event representing a collision with another RigidBody (to be dispatched by RigidBody)
	 * @extends JEvent
	 * @constant {string} COLLISION
	 * @constructor
	 * @param body {RigidBody} The other body involved in the collision
	 * @param impulse {Array} A 3D vector representing the impulse applied to this RigidBody as a result of the collision
	 **/
	var JCollisionEvent=function(body, impulse)
	{
		this.Super(JCollisionEvent.COLLISION);
		this.collisionBody=body;
		this.collisionImpulse=impulse;
	};
	jigLib.extend(JCollisionEvent,jigLib.JEvent);
	
	JCollisionEvent.prototype.collisionBody=null;
	JCollisionEvent.prototype.collisionImpulse=null;
	
	JCollisionEvent.COLLISION='JigLibJSCollisionEvent';
	
	jigLib.JCollisionEvent=JCollisionEvent;
})(jigLib);