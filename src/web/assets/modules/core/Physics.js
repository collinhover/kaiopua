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
		_ObjectHelper,
		_MathHelper,
		ready = false,
		system,
		worldGravitySource,
		worldGravityMagnitude,
		linkBaseName = 'visual_physical_link_',
		linkCount = 0,
		links = [],
		scaleSpeedExp = Math.log( 1.5 ),
		utilVec31FaceSrc,
		utilVec31RotateToSrc,
		utilVec32RotateToSrc,
		utilQ1RotateToSrc,
		utilQ2RotateToSrc,
		utilQ3RotateToSrc,
		utilVec31Update,
		utilVec32Update,
		utilVec33Update,
		utilVec34Update,
		utilVec35Update,
		utilVec31Velocity,
		utilVec31Offset,
		utilQ4Offset,
		utilRay1Casting,
		utilVec31Pull,
		utilVec32Pull,
		utilVec33Pull;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Physics,
		requirements: [
			"assets/modules/utils/ObjectHelper.js",
			"assets/modules/utils/MathHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( oh, mh ) {
		console.log('internal physics');
		
		_ObjectHelper = oh;
		_MathHelper = mh;
		
		// functions
		
		_Physics.translate = translate;
		_Physics.clone = clone;
		_Physics.add = add;
		_Physics.remove = remove;
		_Physics.start = start;
		_Physics.stop = stop;
		_Physics.update = update;
		
		_Physics.rotate_relative_to_source = rotate_relative_to_source;
		_Physics.pull_to_source = pull_to_source;
		
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
		
		Object.defineProperty(_Physics, 'system', { 
			get : function () { return system; }
		});
		
		// init
		
		init_system();
		
	}
	
	function init_system() {
		
		// system
		
		system = new THREE.CollisionSystem();
		set_world_gravity_source( new THREE.Vector3( 0, 0, 0 ) );
		set_world_gravity_magnitude( new THREE.Vector3( 0, -1, 0 ) );
		
		// utility / conversion objects
		
		utilVec31RotateToSrc = new THREE.Vector3();
		
		utilVec31RotateToSrc = new THREE.Vector3();
		utilVec32RotateToSrc = new THREE.Vector3();
		utilQ1RotateToSrc = new THREE.Quaternion();
		utilQ2RotateToSrc = new THREE.Quaternion();
		utilQ3RotateToSrc = new THREE.Quaternion();
		
		utilVec31Update = new THREE.Vector3();
		utilVec32Update = new THREE.Vector3();
		utilVec33Update = new THREE.Vector3();
		utilVec34Update = new THREE.Vector3();
		utilVec35Update = new THREE.Vector3();
		
		utilVec31Offset = new THREE.Vector3();
		utilQ4Offset = new THREE.Quaternion();
		
		utilVec31Velocity = new THREE.Vector3();
		
		utilRay1Casting = new THREE.Ray();
		
		utilVec31Pull = new THREE.Vector3();
		utilVec32Pull = new THREE.Vector3();
		utilVec33Pull = new THREE.Vector3();
		
	}
	
	/*===================================================
    
    translate / add / remove
    
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
				
				collider = THREE.CollisionUtils.MeshColliderWBox( mesh );
				
			}
			else if ( bodyType === 'sphere' ) {
				
				radius = Math.max( width, height, depth ) * 0.5;
				
				collider = new THREE.SphereCollider( position, radius );
				
			}
			else if ( bodyType === 'plane' ) {
				
				collider = new THREE.PlaneCollider( position, parameters.normal || new THREE.Vector3( 0, 0, 1 ) );
				
			}
			// default box
			else {
				
				boxMax = new THREE.Vector3( width, height, depth ).multiplyScalar( 0.5 );
				boxMin = boxMax.clone().multiplyScalar( -1 );
				
				collider = new THREE.BoxCollider( boxMin, boxMax );
				
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
			
			// store mesh directly in collider
			// fixes some collision bugs?
			
			collider.mesh = mesh;
			
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
				
				if ( rigidBody.collider instanceof THREE.MeshCollider ) {
					
					parameters.bodyType = 'mesh';
					
				}
				else if ( rigidBody.collider instanceof THREE.SphereCollider ) {
					
					parameters.bodyType = 'sphere';
					
				}
				else if ( rigidBody.collider instanceof THREE.PlaneCollider ) {
					
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
		console.log(' PHYSICS CLONE... FROM: ', link, ' >>>> TO: ', c );
		return c;
		
	}
	
	// adds object's physics link to physics world
	
	function add ( object ) {
		
		modify_links( object, true );
		
	}
	
	// removes object's physics link from physics world
	
	function remove( object ) {
		
		modify_links( object );
		
	}
	
	// adds or removes physics links from physics world
	// TODO: allow passing of links directly
	
	function modify_links ( object, adding ) {
		
		var i, l,
			link,
			rigidBody,
			indexCollider,
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
				
				indexCollider = system.colliders.indexOf( rigidBody.collider );
				
				indexLink = links.indexOf( link );
				
				// if adding
				
				if ( adding === true ) {
					
					// system
					
					if ( indexCollider === -1 ) {
						
						system.colliders.push( rigidBody.collider );
						
					}
					
					// links
					
					if ( indexLink === -1 ) {
						
						links.push( link );
						
					}
					
				}
				// default to remove
				else {
					
					// system
					
					if ( indexCollider !== -1 ) {
						
						system.colliders.splice( indexCollider, 1 );
						
					}
					
					// links
					
					if ( indexLink !== -1 ) {
						
						links.splice( indexLink, 1 );
						
					}
					
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
		
		offset = rotate_vector3_to_mesh_rotation( mesh, offset );
		
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
		
		offset = rotate_vector3_to_mesh_rotation( mesh, offset );
		
		return offset;
	}
	
	/*===================================================
    
	rotation
    
    =====================================================*/
	
	function rotate_vector3_to_mesh_rotation ( mesh, vec3, rotatedVec3 ) {
		
		var rotation;
		
		if ( mesh.useQuaternion === true ) {
			
			rotation = mesh.quaternion;
			
		}
		else {
			
			rotation = mesh.matrix;
			
		}
		
		return rotate_vector3_relative_to( rotation, vec3, rotatedVec3 );
		
	}
	
	function rotate_vector3_relative_to ( rotation, vec3, rotatedVec3 ) {
		
		if ( rotatedVec3 instanceof THREE.Vector3 ) {
			rotatedVec3.copy( vec3 );
		}
		else {
			rotatedVec3 = vec3.clone();
		}
		
		if ( rotation instanceof THREE.Quaternion || rotation instanceof THREE.Matrix4 ) {
			
			rotation.multiplyVector3( rotatedVec3 );
			
		}
		else if ( rotation instanceof THREE.Vector3 ) {
			
			rotatedVec3.x = rotation.x * vec3.x + rotation.x * vec3.y + rotation.x * vec3.z;
			rotatedVec3.y = rotation.y * vec3.x + rotation.y * vec3.y + rotation.y * vec3.z;
			rotatedVec3.z = rotation.z * vec3.x + rotation.z * vec3.y + rotation.z * vec3.z;
			
		}
		else if ( rotation instanceof THREE.Object3D ) {
			
			rotatedVec3 = rotate_vector3_to_mesh_rotation( rotation, vec3, rotatedVec3 );
			
		}
		
		return rotatedVec3;
		
	}
	
	function rotate_relative_to_source ( mesh, source, axisAway, axisForward, lerpDelta, rigidBody ) {
		
		var uv31 = utilVec31RotateToSrc,
			uv32 = utilVec32RotateToSrc,
			uq1 = utilQ1RotateToSrc,
			uq2 = utilQ2RotateToSrc,
			uq3 = utilQ3RotateToSrc,
			position,
			rotation,
			ca = shared.cardinalAxes,
			axes,
			axisAwayNew,
			axisAwayToAwayNewDist,
			gravUp,
			gravDown,
			angleToNew,
			axisToNew,
			qToNew;
			
		// localize basics
		
		position = mesh.position;
		
		rotation = ( mesh.useQuaternion === true ? mesh.quaternion : mesh.matrix );
		
		// if source is 3D object, cascade
		if ( source instanceof THREE.Object3D ) {
			
			source = source.position;
		
		}
		
		// default is world gravity source
		if ( typeof source === 'undefined' ) {
			
			source = worldGravitySource;
			
		}
		
		axisAway = axisAway || ca.up;
		
		axisForward = axisForward || ca.forward;
		
		lerpDelta = lerpDelta || 1;
		
		// get normalized vector pointing from source to mesh
		
		axisAwayNew = uv31.sub( position, source ).normalize();
		
		// get new rotation based on vector
		
		// find dist between current axis away and new axis away
		
		axisAwayToAwayNewDist = Math.max( -1, Math.min( 1, axisAway.dot( axisAwayNew ) ) );
		
		// if up axes are not same
		
		if ( axisAwayToAwayNewDist !== 1 ) {
			
			// axis / angle
			
			angleToNew = Math.acos( axisAwayToAwayNewDist );
			axisToNew = uv32.cross( axisAway, axisAwayNew );
			axisToNew.normalize();
			
			// if new axis is exactly opposite of current
			// replace new axis with the forward axis
			
			if ( axisToNew.length() === 0 ) {
				
				axisToNew = axisForward;
				
			}
			
			// rotation change
			
			qToNew = uq3.setFromAxisAngle( axisToNew, angleToNew );
			
			// add to rotation
			
			if ( mesh.useQuaternion === true ) {
				
				// quaternion rotations
				
				uq1.multiply( qToNew, rotation );
				
				// normalized lerp to new rotation
				
				_MathHelper.lerp_normalized( rotation, uq1, lerpDelta );
			
			}
			else {
				
				// matrix rotations
				
				uq1.setFromRotationMatrix( rotation );
				
				uq2.multiply( qToNew, uq1 );
				
				rotation.setRotationFromQuaternion( uq2 );
				
			}
			
			// if physics rigid body passed
			
			if ( typeof rigidBody !== 'undefined' ) {
				
				/*
				quaternion = rigidBody.quaternion;
				
				uq1.multiply( qToNew, quaternion );
				
				_MathHelper.lerp_normalized( quaternion, uq1, lerpDelta );
				*/
				// find new axes based on new rotation
				
				axes = rigidBody.axes;
				
				rotation.multiplyVector3( axes.up.copy( ca.up ) );
				
				rotation.multiplyVector3( axes.forward.copy( ca.forward ) );
				
				rotation.multiplyVector3( axes.right.copy( ca.right ) );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    pull
    
    =====================================================*/
	
	function pull_to_source ( mesh, source, objectsToIntersect, distanceFrom, velocity, rigidBody ) {
		
		var i, l,
			position,
			difference = utilVec31Pull,
			direction = utilVec32Pull,
			shift = utilVec33Pull,
			object,
			rigidBody,
			colliders,
			intersection,
			intersectionDistance;
		
		// handle parameters
		
		position = mesh.position;
		
		// if source is 3D object, cascade
		if ( source instanceof THREE.Object3D ) {
			
			source = source.position;
		
		}
		
		// default is world gravity source
		if ( typeof source === 'undefined' ) {
			
			source = worldGravitySource;
			
		}
		
		// get normalized vector from position to source
		
		difference.sub( source, position );
		
		direction.copy( difference ).normalize();
		
		// if objects to intersect was passed
		
		if ( main.is_array( objectsToIntersect ) ) {
			
			// extract colliders from objects
			
			colliders = [];
			
			for ( i = 0, l = objectsToIntersect.length; i < l; i++ ) {
				
				object = objectsToIntersect[ i ];
				
				if( object instanceof THREE.Collider ) {
					
					colliders.push( object );
					
				}
				else if ( typeof object.collider !== 'undefined' ) {
					
					colliders.push( object.collider );
					
				}
				else if ( typeof object.rigidBody !== 'undefined' ) {
					
					colliders.push( object.rigidBody.collider );
					
				}
				else if ( typeof object.physics !== 'undefined' ) {
					
					colliders.push( object.physics.rigidBody.collider );
					
				}
				
			}
			
		}
		
		// cast ray from mesh to source
		
		intersection = _ObjectHelper.raycast( {
			physics: _Physics,
			origin: position,
			direction: direction,
			colliders: colliders
		} );//raycast_in_direction( position, direction, undefined, undefined, colliders );
		
		// if intersection found
		
		if ( typeof intersection !== 'undefined' ) {
			
			// get distance
			
			intersectionDistance = intersection.distance;
			
		}
		else {
			
			intersectionDistance = difference.length();
			
		}
		
		// if distance from needed
		
		if ( main.is_number( distanceFrom ) ) {
			
			intersectionDistance -= distanceFrom;
			
		}
		
		// multiply direction by distance
			
		shift.copy( direction ).multiplyScalar( intersectionDistance );
		
		// add shift to position
		
		position.addSelf( shift );
		
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
				
				rotate_relative_to_source( mesh, gravSrc, rigidBody.axes.up, rigidBody.axes.forward, lerpDelta, rigidBody );
				
				// movement velocity
				
				handle_velocity( link, velocityMovement );
				
				// find up direction
				
				gravUp.sub( mesh.position, gravSrc ).normalize();
				
				// add non rotated gravity to gravity velocity
				
				velocityGravity.force.addSelf( gravMag );
				
				velocityGravity.relativeRotation = gravUp;
				
				velocityGravityForceUpDir.copy( velocityGravity.force ).negate().normalize();
				
				velocityGravityForceUpDirRot = rotate_vector3_relative_to( velocityGravity.relativeRotation, velocityGravityForceUpDir, velocityGravityForceUpDirRot );
				
				// gravity velocity
				
				handle_velocity( link, velocityGravity );
				
				// post physics
				
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
						
						velocityGravity.timeWithoutIntersection += timeDelta;
						
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
						
						velocityGravity.timeWithoutIntersection = 0;
						
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
		
		velocityForceRotated = rotate_vector3_relative_to( relativeRotation, velocityForce, velocityForceRotated );
		
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
			
			velocityOffset = rotate_vector3_to_mesh_rotation( mesh, velocityOffset );
			
		}
		
		// get intersection
		
		intersection = _ObjectHelper.raycast( {
			physics: _Physics,
			origin: position,
			direction: velocityForceRotated,
			offset: velocityOffset,
			ignore: mesh
		} );//raycast_in_direction( position, velocityForceRotated, velocityOffset, mesh );
		
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
	
	/*===================================================
    
    raycast functions
    
    =====================================================*/
	
	function raycast_in_direction ( origin, direction, offset, mesh, colliders ) {
		
		var i, l,
			ray = utilRay1Casting,
			intersections = [],
			intersectionPotential,
			intersectionMeshRecast,
			intersectionDistance = Number.MAX_VALUE,
			intersection;
		
		// set ray
		
		ray.origin.copy( origin );
		ray.direction.copy( direction ).normalize();
		
		// add offset if passed
		
		if ( typeof offset !== 'undefined' ) {
			
			ray.origin.addSelf( offset );
			
		}
		
		// ray cast colliders, defaults to all in system
		
		intersections = system.rayCastAll( ray, colliders );
		
		// find nearest intersection
		
		if ( typeof intersections !== 'undefined' ) {
			
			for ( i = 0, l = intersections.length; i < l; i ++ ) {
				
				intersectionPotential = intersections[ i ];
				
				// if is collider for this object, skip
				
				if ( intersectionPotential.mesh === mesh ) {
					
					continue;
					
				}
				
				// cast ray again if collider is mesh
				// initial ray cast was to mesh collider's dynamic box
				
				if ( intersectionPotential instanceof THREE.MeshCollider ) {
					
					intersectionMeshRecast = system.rayMesh( ray, intersectionPotential );
					
					if ( intersectionMeshRecast.dist < Number.MAX_VALUE ) {
						intersectionPotential.distance = intersectionMeshRecast.dist;
						intersectionPotential.faceIndex = intersectionMeshRecast.faceIndex;
					}
					else {
						intersectionPotential.distance = Number.MAX_VALUE;
					}
					
				}
				
				// if distance is less than last ( last starts at number max value )
				// store as intersection
				
				if ( intersectionPotential.distance < intersectionDistance ) {
					
					intersectionDistance = intersectionPotential.distance;
					intersection = intersectionPotential;
					
				}
				
			}
			
		}
		
		return intersection;
		
	}
	
} ( KAIOPUA ) );