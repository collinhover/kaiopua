/*
 *
 * Physics.js
 * Simple raycasting based physics using octree for faster casting.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/physics/Physics.js",
		_Physics = {},
		_RigidBody,
		_Obstacle,
		_RayHelper,
		_MathHelper,
		_VectorHelper,
		_PhysicsHelper;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Physics,
		requirements: [
			"js/kaiopua/physics/RigidBody.js",
			"js/kaiopua/physics/Obstacle.js",
			"js/kaiopua/utils/MathHelper.js",
			"js/kaiopua/utils/VectorHelper.js",
			"js/kaiopua/utils/RayHelper.js",
			"js/kaiopua/utils/PhysicsHelper.js",
			"js/lib/three/ThreeOctree.min.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( rb, ob, mh, vh, rh, ph ) {
		console.log('internal physics');
		
		_RigidBody = rb;
		_Obstacle = ob;
		_MathHelper = mh;
		_VectorHelper = vh;
		_RayHelper = rh;
		_PhysicsHelper = ph;
		
		// instance
		
		_Physics.Instance = Physics;
		_Physics.Instance.prototype = {};
		_Physics.Instance.prototype.constructor = _Physics.Instance;
		
		_Physics.Instance.prototype.add = add;
		_Physics.Instance.prototype.remove = remove;
		_Physics.Instance.prototype.update = update;
		
	}
	
	/*===================================================
    
	instance
    
    =====================================================*/
	
	function Physics ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		// shared
		
		shared.universeGravitySource = parameters.universeGravitySource instanceof THREE.Vector3 ? parameters.universeGravitySource : shared.universeGravitySource;
		shared.universeGravityMagnitude = parameters.universeGravityMagnitude instanceof THREE.Vector3 ? parameters.universeGravityMagnitude : shared.universeGravityMagnitude;
		
		// util
		
		this.utilVec31Update = new THREE.Vector3();
		this.utilVec32Update = new THREE.Vector3();
		this.utilVec33Update = new THREE.Vector3();
		this.utilVec34Update = new THREE.Vector3();
		this.utilVec35Update = new THREE.Vector3();
		this.utilVec31Apply = new THREE.Vector3();
		this.utilVec31Velocity = new THREE.Vector3();
		this.utilVec32Velocity = new THREE.Vector3();
		this.utilVec33Velocity = new THREE.Vector3();
		this.utilQ1Velocity = new THREE.Quaternion();
		
		// octree
		
		this.octree = new THREE.Octree();
		
		// properties
		
		this.bodies = [];
		this.bodiesGravity = [];
		this.bodiesDynamic = [];
		
		this.obstacles = [];
		
	}
	
	/*===================================================
    
	add / remove
    
    =====================================================*/
	
	function add ( object ) {
		
		modify_bodies.call( this, object, true );
		
	}
	
	function remove( object ) {
		
		modify_bodies.call( this, object );
		
	}
	
	function modify_bodies ( object, adding ) {
		
		var i, l,
			rigidBody,
			collider,
			index,
			child;
		
		if ( typeof object !== 'undefined' && object.rigidBody instanceof _RigidBody.Instance ) {
			
			rigidBody = object.rigidBody;
			collider = rigidBody.collider;
			
			// zero out velocities
			
			rigidBody.velocityMovement.reset();
			rigidBody.velocityGravity.reset();
			
			// get indices
			
			index = main.index_of_value( this.bodies, rigidBody );
			
			// if adding
			
			if ( adding === true ) {
				
				// snap rotation on next update
				
				rigidBody.rotateSnapOnNextUpdate = true;
				
				// bodies
				
				if ( index === -1 ) {
					
					this.bodies.push( rigidBody );
					
				}
				
				// gravity bodies
				
				if ( rigidBody.gravitySource === true ) {
					
					main.array_cautious_add( this.bodiesGravity, rigidBody );
					rigidBody.mesh.morphs.play( 'idle', { loop: true, startDelay: true } );
					
				}
				
				// dynamic body
				
				if ( rigidBody.dynamic === true ) {
					
					main.array_cautious_add( this.bodiesDynamic, rigidBody );
					
				}
				// static colliders in octree and split by faces if collider is mesh
				else {
					
					this.octree.add( object, collider instanceof _RayHelper.MeshCollider ? true : false );
					
				}
				
				// obstacle
				
				if ( object instanceof _Obstacle.Instance ) {
					
					main.array_cautious_add( this.obstacles, object );
					
				}
				
			}
			// default to remove
			else {
				
				// bodies
				
				if ( index !== -1 ) {
					
					this.bodies.splice( index, 1 );
					
				}
				
				// gravity bodies
				
				if ( rigidBody.gravitySource === true ) {
					
					main.array_cautious_remove( this.bodiesGravity, rigidBody );
					
				}
				
				// dynamic colliders
				
				if ( rigidBody.dynamic === true ) {
					
					main.array_cautious_remove( this.bodiesDynamic, rigidBody );
					
				}
				// static colliders in octree
				else {
					
					this.octree.remove( object );
					
				}
				
				// obstacle
				
				if ( object instanceof _Obstacle.Instance ) {
					
					main.array_cautious_remove( this.obstacles, object );
					
				}
				
			}
			
		}
		
		// search for physics in children
		
		if ( typeof object.children !== 'undefined' ) {
			
			for ( i = 0, l = object.children.length; i < l; i++ ) {
				
				child = object.children[ i ];
				
				modify_bodies.call( this, child, adding );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    update
    
    =====================================================*/
	
	function update ( timeDelta, timeDeltaMod ) {
		
		var i, l,
			j, k,
			rigidBody,
			mesh,
			gravityOrigin = this.utilVec31Update,
			gravityMagnitude = this.utilVec32Update,
			gravityUp = this.utilVec33Update,
			lerpDelta,
			velocityGravity,
			velocityMovement;
		
		// dynamic bodies
		
		for ( i = 0, l = this.bodiesDynamic.length; i < l; i++ ) {
			
			rigidBody = this.bodiesDynamic[ i ];
			
			// properties
			
			mesh = rigidBody.mesh;
			
			velocityGravity = rigidBody.velocityGravity;
			
			velocityMovement = rigidBody.velocityMovement;
			
			gravityBody = rigidBody.gravityBody;
			
			// if has gravity body
			
			if ( gravityBody instanceof _RigidBody.Instance ) {
				
				gravityMesh = gravityBody.mesh;
				
				gravityOrigin.copy( gravityMesh.matrixWorld.getPosition() );
				
				gravityMagnitude.copy( rigidBody.gravityMagnitude || shared.universeGravityMagnitude );
				
			}
			// else use world gravity
			else {
				
				gravityOrigin.copy( shared.universeGravitySource );
				
				gravityMagnitude.copy( shared.universeGravityMagnitude );
				
			}
			
			// add non rotated gravity to gravity velocity
			
			gravityMagnitude.multiplyScalar( timeDeltaMod );
			
			velocityGravity.forceDelta.addSelf( gravityMagnitude );
			
			// rotate to stand on source
			
			if ( rigidBody.rotateSnapOnNextUpdate === true ) {
				
				lerpDelta = 1;
				rigidBody.rotateSnapOnNextUpdate = false;
				
			}
			else {
				
				lerpDelta = rigidBody.lerpDelta;
				
			}
			
			_PhysicsHelper.rotate_relative_to_source( mesh.quaternion, mesh.position, gravityOrigin, rigidBody.axes.up, rigidBody.axes.forward, lerpDelta, rigidBody );
			
			// movement velocity
			
			handle_velocity.call( this, rigidBody, velocityMovement );
			
			// find up direction and set relative rotation of gravity
			
			gravityUp.sub( mesh.position, gravityOrigin ).normalize();
			
			velocityGravity.relativeTo = gravityUp;
			
			// gravity velocity
			
			handle_velocity.call( this, rigidBody, velocityGravity );
			
			// update gravity body
			
			rigidBody.find_gravity_body( this.bodiesGravity, timeDelta );
			
		}
		
	}
	
	/*===================================================
    
    velocity
    
    =====================================================*/
	
	function handle_velocity ( rigidBody, velocity ) {
		
		var forGravity = velocity == rigidBody.velocityGravity,
			mesh = rigidBody.mesh,
			position = mesh.position,
			force = velocity.force,
			forceRotated = velocity.forceRotated,
			forceLength,
			forceScalar,
			damping = velocity.damping,
			dampingPre = velocity.dampingPre,
			boundingRadius,
			intersection,
			intersectionParameters,
			intersectionAlt,
			intersectionJump,
			intersectionDouble,
			angle,
			angleInverted,
			normalOfIntersected,
			direction = this.utilVec31Velocity,
			axisInitial = this.utilVec32Velocity,
			axisDown = this.utilVec33Velocity,
			angleFixCollisionQ,
			moveForceRotated,
			obstacle,
			clear;
		
		// update velocity
		
		velocity.update();
		
		// if moving / movable
		
		if ( rigidBody.dynamic !== true || force.isZero() === true ) {
			
			velocity.reset();
			
			return;
			
		} 
		else {
			
			velocity.moving = true;
			
		}
		
		// get length
		
		forceLength = force.length();
		
		// get bounding radius
		//boundingRadius = rigidBody.radius;
		
		// get bounding radius in direction of velocity
		// more accurate than plain radius, but about 4x more cost
		boundingRadius = rigidBody.bounds_in_direction( forceRotated ).length();
		
		// get intersection, and allow a longer search for movement velocity
		
		intersectionParameters = {
			octrees: this.octree,
			origin: position,
			direction: forceRotated,
			offsets: velocity.offsetsRotated,
			far: forceLength + ( velocity === rigidBody.velocityMovement ? rigidBody.radius : boundingRadius ),
			ignore: mesh
		};
		
		intersection = _RayHelper.raycast( intersectionParameters );
		
		// jumping needs a pre-application check in opposite direction of velocity to ensure the intersection application does not force rigid body through ground
		
		if ( forGravity && intersection && mesh.jumping === true ) {
			
			// reverse force
			
			forceRotated.multiplyScalar( -1 );
			
			intersectionJump = _RayHelper.raycast( intersectionParameters );
			
			// clear force
			
			if ( intersectionJump ) {
				
				forceRotated.set( 0, 0, 0 );
				
			}
			// revert force, jump is safe
			else {
				
				forceRotated.multiplyScalar( -1 );
				
			}
			
		}
		
		// velocity primary application
		
		clear = apply_velocity.call( this, position, velocity, intersection, forceLength, boundingRadius, true );
		
		// gravity offsets may allow character to walk up steep walls
		// check intersection normal vs normal of velocity, and compare angle between to velocity.collisionAngleThreshold
		
		if ( intersection && velocity.collisionAngleThreshold < _RigidBody.collisionAngleThresholdMax ) {
			
			direction.copy( forceRotated ).normalize();
			
			// normal is local to object intersected, so rotate normal accordingly
			
			normalOfIntersected = intersection.normal;
			intersection.object.matrixWorld.rotateAxis( normalOfIntersected );
			
			// invert the angle between velocity direction and normal of intersected
			// the perfect collision is an intersection normal direction opposite of the velocity direction
			
			angle = _VectorHelper.angle_between_vectors( direction, normalOfIntersected );
			angleInverted = ( Math.PI - angle );
			
			if ( angleInverted >= velocity.collisionAngleThreshold ) {
				
				// pre damp movement force, if movement force rotated and normal of intersected are in opposite directions ( dot < 0 )
				// this should allow characters to continue to walk over small objects with bad angles
				
				if ( velocity !== rigidBody.velocityMovement ) {
					
					moveForceRotated = rigidBody.velocityMovement.forceRotated;
					
					if ( moveForceRotated.dot( normalOfIntersected ) < 0 ) {
						
						rigidBody.velocityMovement.dampingPre.multiplyScalar( rigidBody.velocityMovement.dampingDecay );
						
						// if this velocity and movement velocity intersecting something, assume a large object with bad angle
						
						intersectionDouble = rigidBody.velocityMovement.intersection && intersection;
						
						if ( intersectionDouble ) {
							
							rigidBody.velocityMovement.dampingPre.multiplyScalar( 0 );
							
						}
						
					}
					// revert movement pre damping
					else {
						
						rigidBody.velocityMovement.dampingPre.set( 1, 1, 1 );
						
					}
					
				}
				
				// if inverted angle is below max
				
				if ( angleInverted < _RigidBody.collisionAngleThresholdMax ) {
					
					// find axis perpendicular to normal of intersected and in general direction of velocity
					
					axisInitial.copy( _VectorHelper.axis_between_vectors( direction, normalOfIntersected ) );
					axisDown.copy( _VectorHelper.axis_between_vectors( normalOfIntersected, axisInitial ) );
					angleFixCollisionQ = _VectorHelper.q_to_axis( direction, axisDown );
					
					if ( angleFixCollisionQ instanceof THREE.Quaternion ) {
						
						// do not clear force
						
						clear = false;
						
						// rotate velocity with new fixed rotation
						
						velocity.rotate( angleFixCollisionQ );
						
						// redo raycast with new fixed rotation of velocity force
						
						intersectionAlt = _RayHelper.raycast( intersectionParameters );
						
						// secondary velocity application
						
						apply_velocity.call( this, position, velocity, intersectionAlt, forceLength, boundingRadius );
						
						// revert rotation back to original
						
						velocity.rotate( angleFixCollisionQ.inverse() );
						
					}
					
				}
				
			}
			
		}
		
		// obstacles
		
		if ( velocity.collision ) {
			
			obstacle = velocity.collision.object;
			
		}
		
		// if any collision object found or when not for gravity velocity
		// gravity should retain obstacle until another collision found
		// movement should shed obstacle as soon as not colliding with that obstacle
		
		if ( ( obstacle || forGravity !== true ) && velocity.obstacle instanceof _Obstacle.Instance && velocity.obstacle !== obstacle ) {
			
			velocity.obstacle.unaffect( mesh );
			delete velocity.obstacle;
			
		}
		
		if ( obstacle instanceof _Obstacle.Instance ) {
			
			velocity.obstacle = obstacle;
			
			obstacle.affect( mesh );
			
		}
		
		// gravity velocity extras
		
		if ( forGravity ) {
			
			// revert movement pre damping
			
			if ( angleFixCollisionQ instanceof THREE.Quaternion !== true ) {
				
				rigidBody.velocityMovement.dampingPre.set( 1, 1, 1 );
				
			}
			
		}
		
		// sliding
		
		if ( angleFixCollisionQ instanceof THREE.Quaternion && intersectionDouble !== true && !intersectionAlt ) {
			
			velocity.sliding = true;
			
		}
		else if ( intersection ) {
			
			velocity.sliding = false;
			
		}
		
		// damp velocity
		
		if ( clear === true ) {
			
			velocity.reset();
			
		}
		else {
			
			force.multiplySelf( damping );
			forceRotated.multiplySelf( damping );
			
		}
		
	}
	
	function apply_velocity ( position, velocity, intersection, forceLength, boundingRadius, record ) {
		
		var intersectionToBoundsDist,
			colliding;
		
		velocity.forceApplied.copy( velocity.forceRotated );
		
		if ( intersection ) {
			
			// modify velocity based on intersection distances to avoid passing through or into objects
			
			intersectionToBoundsDist = intersection.distance - boundingRadius;
			
			if ( intersectionToBoundsDist - forceLength <= 0 ) {
				
				velocity.forceApplied.multiplyScalar( intersectionToBoundsDist /  forceLength );
				
				colliding = true;
				
			}
			
		}
		
		// add velocity to position
		
		position.addSelf( velocity.forceApplied );
		
		// record
		
		if ( record === true ) {
			
			velocity.intersection = intersection;
			
			if ( colliding === true ) {
				
				velocity.collision = intersection;
				velocity.moving = false;
				
			}
			else {
				
				velocity.collision = false;
				
			}
			
			return colliding;
			
		}
		
	}
	
} ( KAIOPUA ) );