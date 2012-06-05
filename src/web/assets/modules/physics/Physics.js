/*
 *
 * Physics.js
 * Simple raycasting based physics that works directly with rendering engine.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/physics/Physics.js",
		_Physics = {},
		_Octree,
		_RigidBody,
		_RayHelper,
		_MathHelper,
		_VectorHelper,
		_ObjectHelper,
		_PhysicsHelper,
		ready = false,
		bodyCount = 0,
		bodies = [],
		bodiesDynamic = [],
		bodiesGravity = [],
		octree,
		worldGravitySource,
		worldGravityMagnitude,
		scaleSpeedExp = Math.log( 1.5 ),
		lerpDeltaGravityChange = 0.025,
		utilVec31Update,
		utilVec32Update,
		utilVec33Update,
		utilVec34Update,
		utilVec35Update,
		utilVec36Update,
		utilVec31Velocity,
		utilVec31Offset,
		utilQ4Offset,
		utilRay1Casting;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Physics,
		requirements: [
			"assets/modules/core/Game.js",
			"assets/modules/core/Octree.js",
			"assets/modules/physics/RigidBody.js",
			"assets/modules/utils/MathHelper.js",
			"assets/modules/utils/VectorHelper.js",
			"assets/modules/utils/RayHelper.js",
			"assets/modules/utils/ObjectHelper.js",
			"assets/modules/utils/PhysicsHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( game, oc, rb, mh, vh, rh, oh, ph ) {
		console.log('internal physics');
		
		_Octree = oc;
		_RigidBody = rb;
		_MathHelper = mh;
		_VectorHelper = vh;
		_RayHelper = rh;
		_ObjectHelper = oh;
		_PhysicsHelper = ph;
		
		// octree
		
		octree = new _Octree.Instance( {
			radius: 400,
			//scene: game.scene
		} );
		
		// utility / conversion objects
		
		utilVec31Update = new THREE.Vector3();
		utilVec32Update = new THREE.Vector3();
		utilVec33Update = new THREE.Vector3();
		utilVec34Update = new THREE.Vector3();
		utilVec35Update = new THREE.Vector3();
		utilVec36Update = new THREE.Vector3();
		utilVec31Offset = new THREE.Vector3();
		utilQ4Offset = new THREE.Quaternion();
		utilVec31Velocity = new THREE.Vector3();
		utilRay1Casting = new THREE.Ray();
		
		// properties
		
		set_world_gravity_source( new THREE.Vector3( 0, 0, 0 ) );
		set_world_gravity_magnitude( new THREE.Vector3( 0, -1, 0 ) );
		
		// functions
		
		_Physics.add = add;
		_Physics.remove = remove;
		_Physics.start = start;
		_Physics.stop = stop;
		_Physics.update = update;
		
		// signals
		
		shared.signals.physicssafetynetstart = new signals.Signal();
		shared.signals.physicssafetynetend = new signals.Signal();
		
		// properties
		
		_Physics.timeWithoutIntersectionThreshold = 500;
		
		Object.defineProperty(_Physics, 'worldGravitySource', { 
			get : function () { return worldGravitySource; },
			set : set_world_gravity_source
		});
		
		Object.defineProperty(_Physics, 'worldGravityMagnitude', { 
			get : function () { return worldGravityMagnitude; },
			set : set_world_gravity_magnitude
		});
		
		Object.defineProperty(_Physics, 'octree', { 
			get : function () { return octree; }
		});
		
	}
	
	/*===================================================
    
	add / remove
    
    =====================================================*/
	
	function add ( object ) {
		
		modify_bodies( object, true );
		
	}
	
	function remove( object ) {
		
		modify_bodies( object );
		
	}
	
	function modify_bodies ( object, adding ) {
		
		var i, l,
			rigidBody,
			collider,
			index,
			child;
		
		if ( typeof object !== 'undefined' ) {
			
			if ( typeof object.rigidBody !== 'undefined' ) {
				
				rigidBody = object.rigidBody;
				
				collider = rigidBody.collider;
				
				// zero out velocities
				
				rigidBody.velocityMovement.force.set( 0, 0, 0 );
				
				rigidBody.velocityGravity.force.set( 0, 0, 0 );
				
				// get indices
				
				index = bodies.indexOf( rigidBody );
				
				// if adding
				
				if ( adding === true ) {
					
					// bodies
					
					if ( index === -1 ) {
						
						bodies.push( rigidBody );
						
					}
					
					// gravity bodies
					
					if ( is_gravity_body( rigidBody ) ) {
					
						index = bodiesGravity.indexOf( rigidBody );
						
						if ( index === -1 ) {
							
							bodiesGravity.push( rigidBody );
							
						}
						
					}
					
					// dynamic body
					
					if ( rigidBody.dynamic === true ) {
						
						index = bodiesDynamic.indexOf( rigidBody );
						
						if ( index === -1 ) {
							
							bodiesDynamic.push( rigidBody );
							
						}
						
					}
					// static colliders in octree and split by faces if collider is mesh
					else {
						
						octree.add( object, collider instanceof _RayHelper.MeshCollider ? true : false );
						
					}
					
				}
				// default to remove
				else {
					
					// bodies
					
					if ( index !== -1 ) {
						
						bodies.splice( index, 1 );
						
					}
					
					// gravity bodies
					
					if ( is_gravity_body( rigidBody ) ) {
					
						index = bodiesGravity.indexOf( rigidBody );
						
						if ( index === -1 ) {
							
							bodiesGravity.splice( index, 1 );
							
						}
						
					}
					
					// dynamic colliders
					
					if ( rigidBody.dynamic === true ) {
						
						index = bodiesDynamic.indexOf( rigidBody );
						
						if ( index !== -1 ) {
							
							bodiesDynamic.splice( index, 1 );
							
						}
						
					}
					// static colliders in octree
					else {
						
						octree.remove( object );
						
					}
					
				}
				
			}
			
			// search for physics in children
			
			if ( typeof object.children !== 'undefined' ) {
				
				for ( i = 0, l = object.children.length; i < l; i++ ) {
					
					child = object.children[ i ];
					
					modify_bodies( child, adding );
					
				}
				
			}
			
		}
		
	}
	
	/*===================================================
    
    utility functions
    
    =====================================================*/
	
	function set_world_gravity_source ( source ) {
		worldGravitySource = new THREE.Vector3( source.x, source.y, source.z );
	}
	
	function set_world_gravity_magnitude ( magnitude ) {
		worldGravityMagnitude = new THREE.Vector3( magnitude.x, magnitude.y, magnitude.z );
	}
	
	function is_gravity_body ( rigidBody ) {
		return rigidBody instanceof _RigidBody.Instance && rigidBody.gravitySource;
	}
	
	/*===================================================
    
    start/stop/update functions
    
    =====================================================*/
	
	function start () {
		
		shared.signals.update.add( update );
		
	}
	
	function stop () {
		
		shared.signals.update.remove( update );
		
	}
	
	function update ( timeDelta, timeDeltaMod ) {
		
		var i, l,
			j, k,
			timeDeltaFix = timeDelta / timeDeltaMod,
			rigidBody,
			mesh,
			gravityBodyPotential,
			gravityMeshPotential,
			gravityBodyDifference = utilVec31Update,
			gravityBodyDistancePotential,
			gravityBody,
			gravityMesh,
			gravityBodyDistance,
			gravityOrigin = utilVec32Update,
			gravityMagnitude = utilVec33Update,
			gravityUp = utilVec34Update,
			velocityGravity,
			velocityGravityCollision,
			velocityGravityCollisionRigidBody,
			velocityGravityForceUpDir = utilVec35Update,
			velocityGravityForceUpDirRot = utilVec36Update,
			velocityMovement,
			velocityMovementCollision,
			velocityMovementCollisionRigidBody,
			safetynet;
		
		// dynamic bodies
		
		for ( i = 0, l = bodiesDynamic.length; i < l; i++ ) {
			
			rigidBody = bodiesDynamic[ i ];
			
			// properties
			
			mesh = rigidBody.mesh;
			
			velocityGravity = rigidBody.velocityGravity;
			
			velocityMovement = rigidBody.velocityMovement;
			
			safetynet = rigidBody.safetynet;
			
			gravityBody = rigidBody.gravityBody;
			
			// if has gravity body
			
			if ( gravityBody instanceof _RigidBody.Instance ) {
				
				gravityMesh = gravityBody.mesh;
				
				gravityOrigin.copy( gravityMesh.position );
				
				gravityMagnitude.copy( rigidBody.gravityMagnitude || worldGravityMagnitude );
				
			}
			// else use world gravity
			else {
				
				gravityOrigin.copy( worldGravitySource );
				
				gravityMagnitude.copy( worldGravityMagnitude );
				
			}
			
			gravityMagnitude.multiplyScalar( timeDeltaMod );
			
			// rotate to stand on source
			
			_PhysicsHelper.rotate_relative_to_source( mesh, gravityOrigin, rigidBody.axes.up, rigidBody.axes.forward, rigidBody.lerpDelta, rigidBody );
			
			// movement velocity
			
			handle_velocity( rigidBody, velocityMovement );
			
			// find up direction
			
			gravityUp.sub( mesh.position, gravityOrigin ).normalize();
			
			// add non rotated gravity to gravity velocity
			
			velocityGravity.force.addSelf( gravityMagnitude );
			
			velocityGravity.relativeRotation = gravityUp;
			
			velocityGravityForceUpDir.copy( velocityGravity.force ).negate().normalize();
			
			velocityGravityForceUpDirRot = _VectorHelper.rotate_vector3_relative_to( velocityGravity.relativeRotation, velocityGravityForceUpDir, velocityGravityForceUpDirRot );
			
			// gravity velocity
			
			handle_velocity( rigidBody, velocityGravity );
			
			// get velocity collisions
			
			velocityGravityCollision = velocityGravity.collision;
			velocityMovementCollision = velocityMovement.collision;
			
			// get velocity collision rigid bodies
			
			if ( velocityGravityCollision ) {
				velocityGravityCollisionRigidBody = velocityGravityCollision.object.rigidBody;
			}
			if ( velocityMovementCollision ) {
				velocityMovementCollisionRigidBody = velocityMovementCollision.object.rigidBody;
			}
			
			// get distance to current gravity body
			
			if ( gravityBody instanceof _RigidBody.Instance ) {
				
				gravityBodyDistance = gravityBodyDifference.sub( mesh.position, gravityMesh.position ).length();
				
			}
			else {
				
				gravityBodyDistance = Number.MAX_VALUE;
			
			}
			
			// attempt to change gravity body
			
			if ( ( is_gravity_body( velocityGravityCollisionRigidBody ) && gravityBody !== velocityGravityCollisionRigidBody ) ) {
				
				rigidBody.change_gravity_body_start( velocityGravityCollisionRigidBody );
				rigidBody.change_gravity_body_complete();
				
			}
			else if ( ( is_gravity_body( velocityMovementCollisionRigidBody ) && gravityBody !== velocityMovementCollisionRigidBody ) ) {
				
				rigidBody.change_gravity_body_start( velocityMovementCollisionRigidBody );
				rigidBody.change_gravity_body_complete();
				
			}
			else if ( gravityBody === rigidBody.gravityBodyLast && rigidBody.grounded === false ) {
				
				// delay time, so dynamic body does not get stuck between two close gravity bodies
			
				rigidBody.gravityBodyChangeDelayTime += timeDeltaFix;
				
				// if delay over max
				
				if ( rigidBody.gravityBodyChangeDelayTime >= rigidBody.gravityBodyChangeDelayTimeMax ) {
					
					rigidBody.gravityBodyChangeDelayTime = 0;
					
					console.log( 'gravity body check for ', rigidBody, ' from ', rigidBody.gravityBody, ' + current dist ', gravityBodyDistance );
					// get closest gravity body
					
					for ( j = 0, k = bodiesGravity.length; j < k; j++ ) {
						
						gravityBodyPotential = bodiesGravity[ j ];
						gravityMeshPotential = gravityBodyPotential.mesh;
						
						gravityBodyDifference.sub( mesh.position, gravityMeshPotential.position );
						gravityBodyDistancePotential = gravityBodyDifference.length() - gravityBodyPotential.radius;
						if ( gravityBodyPotential !== rigidBody.gravityBody ) console.log( ' > other gravity body at dist ', gravityBodyDistancePotential );
						if ( gravityBodyDistancePotential < gravityBodyDistance ) {
							
							gravityBody = gravityBodyPotential;
							gravityBodyDistance = gravityBodyDistancePotential;
							
						}
						
					}
					
					// swap to closest gravity body
					
					if ( rigidBody.gravityBody !== gravityBody ) {
						
						rigidBody.change_gravity_body_start( gravityBody, lerpDeltaGravityChange );
						
						velocityGravity.force.multiplyScalar( rigidBody.gravityBodyChangeForceMod );
						
						console.log( ' > > gravity body to ', gravityBody, ' at dist ', gravityBodyDistance, ' temp gravity magnitude = ', rigidBody.gravityMagnitude.x, rigidBody.gravityMagnitude.y, rigidBody.gravityMagnitude.z );
					}
					
				}
				
			}
			else if ( rigidBody.grounded === true ) {
				
				rigidBody.change_gravity_body_complete();
				
			}
			else if ( rigidBody.gravityBodyChanging === true ) {
				
				// gravity magnitude change
				
				rigidBody.gravityBodyChangeMagnitudeTime += timeDeltaFix;
				
				if ( rigidBody.gravityBodyChangeMagnitudeTime >= rigidBody.gravityBodyChangeMagnitudeTimeMax ) {
					
					rigidBody.gravityMagnitude = rigidBody.gravityMagnitudeLast;
					console.log( ' rigid body gravity magnitude reset to ', rigidBody.gravityMagnitude );
				}
				
			}
			
			// post physics
			// TODO: correct safety net for octree and non-infinite rays
			
			/*
			// if rigidBody is not safe
			if ( rigidBody.safe === false ) {
				
				// rescue rigidBody and set back to last safe
				
				mesh.position.copy( safetynet.position );
				
				if ( mesh.useQuaternion === true ) {
					
					mesh.quaternion.copy( safetynet.quaternion );
					
				}
				else {
					
					mesh.matrix.setRotationFromQuaternion( safetynet.quaternion );
					
				}
				
				velocityGravity.reset();
				velocityMovement.reset();
				
				rigidBody.safe = true;
				
				// safety net end
					
				rigidBody.safetynetend.dispatch();
				
				shared.signals.physicssafetynetend.dispatch( rigidBody );
				
			}		
			// if velocity gravity force is moving towards source
			else if ( velocityGravityForceUpDirRot.equals( gravityUp ) ) {
				
				// if no intersection
				if ( gravityBodyDistance < rigidBody.radius * 0.5 && !velocityGravityCollision ) {
					console.log(' SAFETY NET: ', gravityBodyDistance, velocityGravityCollision );
					// set rigidBody to unsafe, but do not reset to safe position immediately
					// wait until next update to allow dispatched signals to be handled first
					
					rigidBody.safe = false;
					
					// safety net start
					
					if ( rigidBody.safetynetstart ) {
						
						rigidBody.safetynetstart.dispatch();
						
					}
					
					shared.signals.physicssafetynetstart.dispatch( rigidBody );
					
				}
				// rigidBody is safe
				else {
					
					velocityGravity.timeWithoutIntersection = velocityGravity.updatesWithoutIntersection = 0;
					
					rigidBody.safe = true;
					
					// copy last safe position and rotation into rigidBody
					
					safetynet.position.copy( mesh.position );
					
					if ( mesh.useQuaternion === true ) {
						
						safetynet.quaternion.copy( mesh.quaternion );
						
					}
					else {
						
						safetynet.quaternion.setFromRotationMatrix( mesh.matrix );
						
					}
					
				}
				
			}
			*/
		}
		
	}
	
	/*===================================================
    
    velocity functions
    
    =====================================================*/
	
	function handle_velocity ( rigidBody, velocity ) {
		
		var mesh = rigidBody.mesh,
			position = mesh.position,
			scale = mesh.scale,
			scaleExp = scaleSpeedExp,
			scaleModded = utilVec31Velocity.copy( scale ),
			velocityForce = velocity.force,
			velocityForceRotated = velocity.forceRotated,
			velocityForceRotatedLength,
			velocityForceScalar,
			velocityOffset = velocity.offset,
			velocityDamping = velocity.damping,
			relativeRotation = velocity.relativeRotation,
			boundingRadius,
			intersection,
			intersectionDist;
		
		if ( rigidBody.dynamic !== true || velocityForce.isZero() === true ) {
			
			velocity.moving = false;
			
			return;
			
		} 
		else {
			
			velocity.moving = true;
			
		}
		
		// if velocity is relative to rotation, else will just copy force into rotated
		
		velocityForceRotated = _VectorHelper.rotate_vector3_relative_to( relativeRotation, velocityForce, velocityForceRotated );
		
		// scale velocity
		
		scaleModded.x = Math.pow( scaleModded.x, scaleExp );
		scaleModded.y = Math.pow( scaleModded.y, scaleExp );
		scaleModded.z = Math.pow( scaleModded.z, scaleExp );
		
		velocityForceRotated.multiplySelf( scaleModded );
		
		// get rotated length
		
		velocityForceRotatedLength = velocityForceRotated.length();
		
		// get bounding radius
		//boundingRadius = rigidBody.radius;
		
		// get bounding radius in direction of velocity
		// more accurate than plain radius, but about 4x more cost
		boundingRadius = rigidBody.offset_in_direction( velocityForceRotated ).length();
		
		// rotate offset if needed
		
		if ( velocityOffset.length() > 0 ) {
			
			velocityOffset = _VectorHelper.rotate_vector3_to_mesh_rotation( mesh, velocityOffset );
			
		}
		
		// get intersection
		
		intersection = _RayHelper.raycast( {
			octree: octree,
			origin: position,
			direction: velocityForceRotated,
			offset: velocityOffset,
			distance: boundingRadius + velocityForceRotatedLength,
			ignore: mesh
		} );
		
		// modify velocity based on intersection distances to avoid passing through or into objects
		
		if ( intersection ) {
			
			velocity.intersection = intersection;
			
			intersectionDist = intersection.distance;
			
			// set the rotated velocity to be no more than intersection distance
			
			if ( intersectionDist - velocityForceRotatedLength <= boundingRadius ) {
				
				velocityForceScalar = ( intersectionDist - boundingRadius ) / velocityForceRotatedLength;
				
				velocityForceRotated.multiplyScalar( velocityForceScalar );
				
				// setting force to 0 causes instability, ex: stuttering through world and run/falling when going downhill
				// but halves effective octree search radius, so fewer raycast checks
				// safe to set if jumping
				
				if ( mesh && mesh.movement && mesh.movement.jump && mesh.movement.jump.active === true ) {
					
					velocity.force.set( 0, 0, 0 );
					
				}
				
				velocity.moving = false;
				
				velocity.collision = intersection;
				
			}
			
		}
		else {
			
			velocity.intersection = false;
			velocity.collision = false;
		
		}
		
		// add velocity to position
		
		position.addSelf( velocityForceRotated );
		
		// damp velocity
		
		velocityForce.multiplySelf( velocityDamping );
		
		// if velocity low enough, set zero
		
		if ( velocityForce.length() < 0.01 ) {
			velocityForce.multiplyScalar( 0 );
		}
		
		// return intersection
		
		return intersection;
	}
	
} ( KAIOPUA ) );