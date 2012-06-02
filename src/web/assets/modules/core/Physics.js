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
		assetPath = "assets/modules/core/Physics.js",
		_Physics = {},
		_Octree,
		_RayHelper,
		_MathHelper,
		_VectorHelper,
		_ObjectHelper,
		_PhysicsHelper,
		ready = false,
		linkBaseName = 'visual_physical_link_',
		linkCount = 0,
		links = [],
		octree,
		worldGravitySource,
		worldGravityMagnitude,
		scaleSpeedExp = Math.log( 1.5 ),
		utilVec31Update,
		utilVec32Update,
		utilVec33Update,
		utilVec34Update,
		utilVec35Update,
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
	
	function init_internal ( game, oc, mh, vh, rh, oh, ph ) {
		console.log('internal physics');
		
		_Octree = oc;
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
		utilVec31Offset = new THREE.Vector3();
		utilQ4Offset = new THREE.Quaternion();
		utilVec31Velocity = new THREE.Vector3();
		utilRay1Casting = new THREE.Ray();
		
		// properties
		
		set_world_gravity_source( new THREE.Vector3( 0, 0, 0 ) );
		set_world_gravity_magnitude( new THREE.Vector3( 0, -1, 0 ) );
		
		// functions
		
		_Physics.translate = translate;
		_Physics.clone = clone;
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
    
    translate / clone
    
    =====================================================*/
	
	// translates a mesh + parameters into a new rigid body
	
	function translate ( mesh, parameters ) {
		
		var i, l,
			geometry,
			bbox,
			bboxDimensions,
			bodyType,
			link,
			collider,
			dynamic = false,
			width,
			height,
			depth,
			needWidth,
			needHeight,
			needDepth,
			radius,
			boxMax,
			boxMin,
			mass,
			position;
		
		// handle parameters
		
		parameters = parameters || {};
		
		bodyType = parameters.bodyType;
		
		// validity check
		
		if ( typeof mesh !== 'undefined' && typeof bodyType === 'string' ) {
			
			// handle mesh
			
			geometry = parameters.geometry || mesh.geometry;
			
			if ( parameters.hasOwnProperty('dynamic') === true ) {
				
				dynamic = parameters.dynamic;
				
			}
			
			position = mesh.position;
			
			// physics width/height/depth
			
			width = parameters.width;
			
			height = parameters.height;
			
			depth = parameters.depth;
			
			if ( main.is_number( width ) === false ) {
				
				needWidth = true;
				
			}
			
			if ( main.is_number( height ) === false ) {
				
				needHeight = true;
				
			}
			
			if ( main.is_number( depth ) === false ) {
				
				needDepth = true;
				
			}
			
			if ( needWidth === true || needHeight === true || needDepth === true ) {
				
				// model bounding box
				
				bboxDimensions = _ObjectHelper.dimensions( mesh );
				
				if ( needWidth === true ) {
					
					width = bboxDimensions.x;
					
				}
				
				if ( needHeight === true ) {
					
					height = bboxDimensions.y;
				
				}
				
				if ( needDepth === true ) {
					
					depth = bboxDimensions.z;
					
				}
				
			}
			
			mass = parameters.mass || width * height * depth;
			
			// create collider
			
			if ( bodyType === 'mesh' ) {
				
				collider = new _RayHelper.MeshCollider( mesh );
				
			}
			else if ( bodyType === 'sphere' ) {
				
				radius = Math.max( width, height, depth ) * 0.5;
				
				collider = new _RayHelper.SphereCollider( position, radius );
				
			}
			else if ( bodyType === 'plane' ) {
				
				collider = new _RayHelper.PlaneCollider( position, parameters.normal || new THREE.Vector3( 0, 0, 1 ) );
				
			}
			// default box
			else {
				
				collider = new _RayHelper.ObjectColliderOBB( mesh );
				
				/*
				boxMax = new THREE.Vector3( width, height, depth ).multiplyScalar( 0.5 );
				boxMin = boxMax.clone().multiplyScalar( -1 );
				
				collider = new _RayHelper.BoxCollider( boxMin, boxMax );
				collider.object = mesh;
				*/
			}
			
			// dynamic or static
			
			if ( mass <= 0 ) {
				
				dynamic = false;
				
			}
			else if ( parameters.hasOwnProperty('dynamic') === true ) {
				
				dynamic = parameters.dynamic;
				
			}
			
			// if not dynamic set mass to 0 for a static object
			
			if ( dynamic !== true ) {
				
				mass = 0;
				
			}
			
			// create link
			
			linkCount++;
			
			link = {
				name: parameters.name || linkBaseName + linkCount,
				mesh: mesh,
				rigidBody: {
					collider: collider,
					dynamic: dynamic,
					mass: mass,
					velocityMovement: generate_velocity_tracker( { 
						damping: parameters.movementDamping,
						offset: parameters.movementOffset,
						relativeRotation: mesh
					} ),
					velocityGravity: generate_velocity_tracker( { 
						damping: parameters.gravityDamping,
						offset: parameters.gravityOffset
					} ),
					axes: {
						up: shared.cardinalAxes.up.clone(),
						forward: shared.cardinalAxes.forward.clone(),
						right: shared.cardinalAxes.right.clone()
					}
				},
				safe: true,
				safetynet: {
					position: new THREE.Vector3(),
					quaternion: new THREE.Quaternion(),
				},
				safetynetstart: new signals.Signal(),
				safetynetend: new signals.Signal()
			};
			
		}
		
		return link;
	}
	
	function clone ( link, meshNew ) {
		
		var c,
			mesh,
			rigidBody,
			parameters;
		
		if ( typeof link !== 'undefined' && typeof link.mesh !== 'undefined' ) {
			
			mesh = meshNew || link.mesh;
			rigidBody = link.rigidBody;
			parameters = {};
			
			if ( typeof rigidBody !== 'undefined' ) {
				
				if ( rigidBody.collider instanceof _RayHelper.MeshCollider ) {
					
					parameters.bodyType = 'mesh';
					
				}
				else if ( rigidBody.collider instanceof _RayHelper.SphereCollider ) {
					
					parameters.bodyType = 'sphere';
					
				}
				else if ( rigidBody.collider instanceof _RayHelper.PlaneCollider ) {
					
					parameters.bodyType = 'plane';
					parameters.normal = rigidBody.collider.normal.clone();
					
				}
				else {
					
					parameters.bodyType = 'box';
					
				}
				
				parameters.dynamic = rigidBody.dynamic;
				parameters.mass = rigidBody.mass;
				parameters.movementDamping = rigidBody.velocityMovement.damping.clone();
				parameters.movementOffset = rigidBody.velocityMovement.offset.clone();
				parameters.gravityDamping = rigidBody.velocityGravity.damping.clone();
				parameters.gravityOffset = rigidBody.velocityGravity.offset.clone();
				
			}
			
			c = translate( mesh, parameters );
			
		}
		
		return c;
		
	}
	
	/*===================================================
    
	add / remove
    
    =====================================================*/
	
	function add ( object ) {
		
		modify_links( object, true );
		
	}
	
	function remove( object ) {
		
		modify_links( object );
		
	}
	
	function modify_links ( object, adding ) {
		
		var i, l,
			link,
			rigidBody,
			indexLink,
			child;
		
		if ( typeof object !== 'undefined' ) {
				
			// own physics
			
			if ( typeof object.physics !== 'undefined' ) {
				
				link = object.physics;
				
				rigidBody = link.rigidBody;
				
				// zero out velocities
				
				rigidBody.velocityMovement.force.set( 0, 0, 0 );
				
				rigidBody.velocityGravity.force.set( 0, 0, 0 );
				
				// get indices
				
				indexLink = links.indexOf( link );
				
				// if adding
				
				if ( adding === true ) {
					
					// links
					
					if ( indexLink === -1 ) {
						
						links.push( link );
						
					}
					
					// octree, split by faces if collider is mesh
					
					octree.add( object, rigidBody.collider instanceof _RayHelper.MeshCollider ? true : false );
					
				}
				// default to remove
				else {
					
					// links
					
					if ( indexLink !== -1 ) {
						
						links.splice( indexLink, 1 );
						
					}
					
					// octree
					
					octree.remove( object );
					
				}
				
			}
			
			// search for physics in children
			
			if ( typeof object.children !== 'undefined' ) {
				
				for ( i = 0, l = object.children.length; i < l; i++ ) {
					
					child = object.children[ i ];
					
					modify_links( child, adding );
					
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
	
	/*===================================================
    
    velocity
    
    =====================================================*/
	
	function generate_velocity_tracker ( parameters ) {
		var velocity = {};
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.damping = parameters.damping || 0.99;
		
		// init velocity
		
		velocity.force = new THREE.Vector3();
		velocity.forceRotated = new THREE.Vector3();
		velocity.damping = parameters.damping instanceof THREE.Vector3 ? parameters.damping : new THREE.Vector3();
		velocity.offset = parameters.offset instanceof THREE.Vector3 ? parameters.offset : new THREE.Vector3();
		velocity.relativeRotation = parameters.relativeRotation;
		velocity.moving = false;
		velocity.intersection = false;
		velocity.timeWithoutIntersection = 0;
		
		if ( main.is_number( parameters.damping ) === true ) {
			
			velocity.damping.addScalar( parameters.damping );
			
		}
		
		return velocity;
	}
	
	/*===================================================
    
    dimensions and bounds
    
    =====================================================*/
	
	function dimensions_from_collider ( rigidBody ) {
		var collider = rigidBody.collider,
			colliderMin,
			colliderMax,
			dimensions = new THREE.Vector3();
		
		// get collider type by collider properties
		
		if ( typeof collider.min !== 'undefined' ) {
			
			colliderMin = collider.min;
			colliderMax = collider.max;
			
		}
		else if ( typeof collider.box !== 'undefined' ) {
			
			colliderMin = collider.box.min;
			colliderMax = collider.box.max;
			
		}
		else if ( typeof collider.radiusSq !== 'undefined' ) {
			
			colliderMin = new THREE.Vector3();
			colliderMax = new THREE.Vector3().addScalar( collider.radiusSq );
			
		}
		// collider type not supported
		else {
			return dimensions;
		}
		
		dimensions.sub( colliderMax, colliderMin );
		
		return dimensions;
	}
	
	function dimensions_from_collider_scaled ( rigidBody, mesh ) {
		
		return dimensions_from_collider( rigidBody ).multiplySelf( mesh.scale );
		
	}
	
	function offset_by_length_in_local_direction ( mesh, localDirection, length ) {
		
		var offset = new THREE.Vector3( length, length, length ),
			maxDim,
			localDirection,
			uV33 = utilVec31Offset,
			uQ4 = utilQ4Offset;
		
		// set in direction
		
		offset.multiplySelf( localDirection );
		
		// rotate to match mesh
		
		offset = _VectorHelper.rotate_vector3_to_mesh_rotation( mesh, offset );
		
		return offset;
		
	}
	
	function offset_from_dimensions_in_direction ( mesh, direction, dimensions ) {
		
		var offset,
			maxDim,
			localDirection,
			uV33 = utilVec31Offset,
			uQ4 = utilQ4Offset;
		
		// set all dimensions to max dimension
		
		//maxDim = Math.max( dimensions.x, dimensions.y, dimensions.z );
		
		//dimensions.set( maxDim, maxDim, maxDim );
		
		// copy half of dimensions and add 1 to avoid ray casting to self
		
		offset = dimensions.clone().multiplyScalar( 0.5 ).addScalar( 1 );
		
		// add center offset
		
		offset.subSelf( _ObjectHelper.center_offset( mesh ) );
		
		// get local direction
		// seems like extra unnecessary work
		// not sure if there is better way
		
		uQ4.copy( mesh.quaternion ).inverse();
		
		localDirection = uV33.copy( direction );
		localDirection.normalize();
		
		uQ4.multiplyVector3( localDirection );
		
		// set in direction
		
		offset.multiplySelf( localDirection );
		
		// rotate to match mesh
		
		offset = _VectorHelper.rotate_vector3_to_mesh_rotation( mesh, offset );
		
		return offset;
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
			lerpDelta = 0.1,
			link,
			rigidBody,
			mesh,
			gravSrc = utilVec31Update,
			gravMag = utilVec32Update,
			gravUp = utilVec33Update,
			velocityGravity,
			velocityGravityForceUpDir = utilVec34Update,
			velocityGravityForceUpDirRot = utilVec35Update,
			velocityMovement,
			safetynet;
		
		// handle rotation and check velocity
		
		for ( i = 0, l = links.length; i < l; i ++ ) {
			
			link = links[ i ];
			
			mesh = link.mesh;
			
			rigidBody = link.rigidBody;
			
			safetynet = link.safetynet;
			
			// is dynamic
			
			if ( rigidBody.dynamic === true ) {
				
				// localize dynamic basics
				
				velocityGravity = rigidBody.velocityGravity;
				
				velocityMovement = rigidBody.velocityMovement;
				
				gravSrc.copy( rigidBody.gravSrc || worldGravitySource );
				
				gravMag.copy( rigidBody.gravMag || worldGravityMagnitude ).multiplyScalar( timeDeltaMod );
				
				// rotate to stand on source
				
				_PhysicsHelper.rotate_relative_to_source( mesh, gravSrc, rigidBody.axes.up, rigidBody.axes.forward, lerpDelta, rigidBody );
				
				// movement velocity
				
				handle_velocity( link, velocityMovement );
				
				// find up direction
				
				gravUp.sub( mesh.position, gravSrc ).normalize();
				
				// add non rotated gravity to gravity velocity
				
				velocityGravity.force.addSelf( gravMag );
				
				velocityGravity.relativeRotation = gravUp;
				
				velocityGravityForceUpDir.copy( velocityGravity.force ).negate().normalize();
				
				velocityGravityForceUpDirRot = _VectorHelper.rotate_vector3_relative_to( velocityGravity.relativeRotation, velocityGravityForceUpDir, velocityGravityForceUpDirRot );
				
				// gravity velocity
				
				handle_velocity( link, velocityGravity );
				
				// post physics
				// TODO: correct safety net for octree and non-infinite rays
				
				/*
				// if link is not safe
				if ( link.safe === false ) {
					
					// rescue link and set back to last safe
					
					mesh.position.copy( safetynet.position );
					
					if ( mesh.useQuaternion === true ) {
						
						mesh.quaternion.copy( safetynet.quaternion );
						
					}
					else {
						
						mesh.matrix.setRotationFromQuaternion( safetynet.quaternion );
						
					}
					
					velocityGravity.force.set( 0, 0, 0 );
					velocityMovement.force.set( 0, 0, 0 );
					
					velocityGravity.timeWithoutIntersection = 0;
					
					link.safe = true;
					
					// safety net end
						
					link.safetynetend.dispatch();
					
					shared.signals.physicssafetynetend.dispatch( link );
					
				}		
				// if velocity gravity force is moving towards source
				else if ( velocityGravityForceUpDirRot.equals( gravUp ) ) {
					
					// if no intersection
					if ( !velocityGravity.intersection ) {
						
						velocityGravity.timeWithoutIntersection += timeDelta / timeDeltaMod;
						
						// without intersection for time above threshold
						if ( velocityGravity.timeWithoutIntersection > _Physics.timeWithoutIntersectionThreshold ) {
							
							// set link to unsafe, but do not reset to safe position immediately
							// wait until next update to allow dispatched signals to be handled first
							
							link.safe = false;
							
							// safety net start
							
							if ( link.safetynetstart ) {
								
								link.safetynetstart.dispatch();
								
							}
							
							shared.signals.physicssafetynetstart.dispatch( link );
							
						}
						
					}
					// link is safe
					else {
						
						velocityGravity.timeWithoutIntersection = velocityGravity.updatesWithoutIntersection = 0;
						
						link.safe = true;
						
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
		
	}
	
	/*===================================================
    
    velocity functions
    
    =====================================================*/
	
	function handle_velocity ( link, velocity ) {
		
		var rigidBody = link.rigidBody,
			mesh = link.mesh,
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
			boundingOffset,
			boundingOffsetLength,
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
		
		// get bounding box offset
		
		boundingOffset = offset_from_dimensions_in_direction( mesh, velocityForceRotated, dimensions_from_collider_scaled( rigidBody, mesh ) );//_ObjectHelper.dimensions( mesh ) );
		
		boundingOffsetLength = boundingOffset.length();
		
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
			distance: boundingOffsetLength + velocityForceRotatedLength,
			ignore: mesh
		} );
		
		// modify velocity based on intersection distances to avoid passing through or into objects
		
		if ( intersection ) {
			
			velocity.intersection = intersection;
			
			intersectionDist = intersection.distance;
			
			// set the rotated velocity to be no more than intersection distance
			
			if ( intersectionDist - velocityForceRotatedLength <= boundingOffsetLength ) {
				
				velocityForceScalar = ( intersectionDist - boundingOffsetLength ) / velocityForceRotatedLength;
				
				velocityForceRotated.multiplyScalar( velocityForceScalar );
				
				// set the base velocity to 0
				
				velocityForce.set( 0, 0, 0 );
				
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