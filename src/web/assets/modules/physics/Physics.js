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
		assetPath = "assets/modules/physics/Physics.js",
		_Physics = {},
		_RigidBody,
		_RayHelper,
		_MathHelper,
		_VectorHelper,
		_ObjectHelper,
		_PhysicsHelper;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Physics,
		requirements: [
			"assets/modules/physics/RigidBody.js",
			"assets/modules/utils/MathHelper.js",
			"assets/modules/utils/VectorHelper.js",
			"assets/modules/utils/RayHelper.js",
			"assets/modules/utils/ObjectHelper.js",
			"assets/modules/utils/PhysicsHelper.js",
			"js/three/ThreeOctree.min.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( rb, mh, vh, rh, oh, ph ) {
		console.log('internal physics');
		
		_RigidBody = rb;
		_MathHelper = mh;
		_VectorHelper = vh;
		_RayHelper = rh;
		_ObjectHelper = oh;
		_PhysicsHelper = ph;
		
		// properties
		
		_Physics.timeWithoutIntersectionThreshold = 500;
		
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
		
		this.timeWithoutIntersectionThreshold = main.is_number( parameters.timeWithoutIntersectionThreshold ) ? parameters.timeWithoutIntersectionThreshold : _Physics.timeWithoutIntersectionThreshold;
		
		this.bodies = [];
		this.bodiesGravity = [];
		this.bodiesDynamic = [];
		
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
		
		if ( typeof object !== 'undefined' ) {
			
			if ( typeof object.rigidBody !== 'undefined' ) {
				
				rigidBody = object.rigidBody;
				
				collider = rigidBody.collider;
				
				// zero out velocities
				
				rigidBody.velocityMovement.force.set( 0, 0, 0 );
				
				rigidBody.velocityGravity.force.set( 0, 0, 0 );
				
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
					
						index = main.index_of_value( this.bodiesGravity, rigidBody );
						
						if ( index === -1 ) {
							
							this.bodiesGravity.push( rigidBody );
							
							rigidBody.mesh.morphs.play( 'idle', { loop: true, startDelay: true } );
							
						}
						
					}
					
					// dynamic body
					
					if ( rigidBody.dynamic === true ) {
						
						index = main.index_of_value( this.bodiesDynamic, rigidBody );
						
						if ( index === -1 ) {
							
							this.bodiesDynamic.push( rigidBody );
							
						}
						
					}
					// static colliders in octree and split by faces if collider is mesh
					else {
						
						this.octree.add( object, collider instanceof _RayHelper.MeshCollider ? true : false );
						
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
					
						index = main.index_of_value( this.bodiesGravity, rigidBody );
						
						if ( index === -1 ) {
							
							this.bodiesGravity.splice( index, 1 );
							
						}
						
					}
					
					// dynamic colliders
					
					if ( rigidBody.dynamic === true ) {
						
						index = main.index_of_value( this.bodiesDynamic, rigidBody );
						
						if ( index !== -1 ) {
							
							this.bodiesDynamic.splice( index, 1 );
							
						}
						
					}
					// static colliders in octree
					else {
						
						this.octree.remove( object );
						
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
			velocityMovement,
			safetynet;
		
		// dynamic bodies
		
		for ( i = 0, l = this.bodiesDynamic.length; i < l; i++ ) {
			
			rigidBody = this.bodiesDynamic[ i ];
			
			// properties
			
			mesh = rigidBody.mesh;
			
			velocityGravity = rigidBody.velocityGravity;
			
			velocityMovement = rigidBody.velocityMovement;
			
			safetynet = rigidBody.safetynet;
			
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
			
			velocityGravity.force.addSelf( gravityMagnitude );
			
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
			
			// post physics
			// TODO: correct safety net for octree and non-infinite rays
			
		}
		
	}
	
	/*===================================================
    
    velocity functions
    
    =====================================================*/
	
	function handle_velocity ( rigidBody, velocity ) {
		
		var forGravity = velocity == rigidBody.velocityGravity,
			mesh = rigidBody.mesh,
			position = mesh.position,
			force = velocity.force,
			forceRotated = velocity.forceRotated,
			forceRotatedLast = velocity.forceRotatedLast,
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
			clear;
		
		// make velocity relative
		
		velocity.update();
		
		// pre damp
		
		force.multiplySelf( dampingPre );
		
		// if moving / movable
		
		if ( rigidBody.dynamic !== true || force.isZero() === true ) {
			
			velocity.moving = false;
			force.set( 0, 0, 0 );
			
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
			octree: this.octree,
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
				
				forceRotated.multiplyScalar( 0 );
				
			}
			// revert force, jump is safe
			else {
				
				forceRotated.multiplyScalar( -1 );
				
			}
			
		}
		
		// velocity primary application
		
		clear = apply_velocity_affect.call( this, position, velocity, intersection, forceLength, boundingRadius );
		
		// gravity offsets may allow character to walk up steep walls
		// check intersection normal vs normal of velocity, and compare angle between to velocity.collisionAngleThreshold
		
		if ( intersection && velocity.collisionAngleThreshold < _RigidBody.collisionAngleThresholdMax ) {
			
			// reset force rotated to before primary application
			
			forceRotated.copy( forceRotatedLast );
			
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
						
					}
					
				}
				
			}
			
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
			
			force.set( 0, 0, 0 );
			
		}
		else {
			
			force.multiplySelf( damping );
			
		}
		
	}
	
	function apply_velocity ( position, velocity, intersection, forceLength, boundingRadius ) {
		
		var intersectionToBoundsDist;
		
		velocity.forceRotatedLast.copy( velocity.forceRotated );
		
		if ( intersection ) {
			
			// modify velocity based on intersection distances to avoid passing through or into objects
			
			intersectionToBoundsDist = intersection.distance - boundingRadius;
			
			if ( intersectionToBoundsDist - forceLength <= 0 ) {
				
				velocity.forceRotated.multiplyScalar( intersectionToBoundsDist /  forceLength );
				
			}
			
		}
		
		// add velocity to position
		
		position.addSelf( velocity.forceRotated );
		
	}
	
	function apply_velocity_affect ( position, velocity, intersection, forceLength, boundingRadius ) {
		
		var intersectionToBoundsDist,
			clear;
		
		velocity.forceRotatedLast.copy( velocity.forceRotated );
		
		if ( intersection ) {
			
			velocity.intersection = intersection;
			
			// modify velocity based on intersection distances to avoid passing through or into objects
			
			intersectionToBoundsDist = intersection.distance - boundingRadius;
			
			if ( intersectionToBoundsDist - forceLength <= 0 ) {
				
				velocity.forceRotated.multiplyScalar( intersectionToBoundsDist /  forceLength );
				
				velocity.collision = intersection;
				velocity.moving = false;
				
				clear = true;
				
			}
			
		}
		else {
			
			velocity.intersection = false;
			velocity.collision = false;
			
		}
		
		// add velocity to position
		
		position.addSelf( velocity.forceRotated );
		
		return clear;
		
	}
	
} ( KAIOPUA ) );