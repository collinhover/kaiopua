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
		utilVec31Velocity,
		utilVec31Offset,
		utilQ4Offset,
		utilVec31Raycast,
		utilRay1Casting,
		utilVec31Pull,
		utilVec32Pull,
		utilVec33Pull;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	_Physics.translate = translate;
	_Physics.add = add;
	_Physics.remove = remove;
	_Physics.start = start;
	_Physics.stop = stop;
	_Physics.update = update;
	
	_Physics.rotate_relative_to_source = rotate_relative_to_source;
	_Physics.pull_to_source = pull_to_source;
	
	// getters and setters
	
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
	
	main.asset_register( assetPath, { 
		data: _Physics,
		requirements: [
			"assets/modules/utils/MathHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( mh ) {
		console.log('internal physics');
		
		if ( ready !== true ) {
			
			_MathHelper = mh;
			
			init_system();
			
			ready = true;
			
		}
		
	}
	
	function init_system() {
		
		// system
		
		system = THREE.Collisions;
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
		
		utilVec31Offset = new THREE.Vector3();
		utilQ4Offset = new THREE.Quaternion();
		
		utilVec31Velocity = new THREE.Vector3();
		
		utilVec31Raycast = new THREE.Vector3();
		utilRay1Casting = new THREE.Ray();
		
		utilVec31Pull = new THREE.Vector3();
		utilVec32Pull = new THREE.Vector3();
		utilVec33Pull = new THREE.Vector3();
		
		// three collision fixes
		
		add_three_collision_fixes();
		
	}
	
	/*===================================================
    
    collision fixes
    
    =====================================================*/
	
	function add_three_collision_fixes () {
		
		var utilMat1RayLocal = new THREE.Matrix4(),
			utilVec31RayLocal = new THREE.Vector3(),
			utilVec31RayBox = new THREE.Vector3(),
			utilVec32RayBox = new THREE.Vector3();
		
		// localize ray to collider
		
		THREE.CollisionSystem.prototype.makeRayLocal = function( ray, m, i ) {
			
			var scale,
				mMat,
				mCopy;

			var rt = THREE.CollisionSystem.__r;
			rt.origin.copy( ray.origin );
			rt.direction.copy( ray.direction );
			
			if ( m instanceof THREE.Mesh ) {
				
				scale = m.scale,
				mMat = m.matrixWorld,
				mCopy = utilMat1RayLocal;
				
				// get copy of m world matrix without scale applied
				// matrix with scale does not seem to invert correctly
				
				mCopy.extractPosition( mMat );
				mCopy.extractRotation( mMat, scale );
				
				// invert copy
				
				var mt = THREE.CollisionSystem.__m;
				mt.getInverse( mCopy );
				
				mt.multiplyVector3( rt.origin );
				mt.rotateAxis( rt.direction );
				
				rt.direction.normalize();
				
			}

			return rt;

		};
		
		// ray mesh
		
		THREE.CollisionSystem.prototype.rayMesh = function( r, me ) {
			
			var i, l,
				p0 = new THREE.Vector3(),
				p1 = new THREE.Vector3(),
				p2 = new THREE.Vector3(),
				p3 = new THREE.Vector3(),
				mesh = me.mesh,
				scale = mesh.scale,
				geometry = mesh.geometry,
				vertices = geometry.vertices,
				rt = this.makeRayLocal( r, mesh );
			
			var d = Number.MAX_VALUE;
			var nearestface;
			
			for( i = 0, l = me.numFaces; i < l; i ++ ) {
				
				var face = geometry.faces[ i ];
				
				p0.copy( vertices[ face.a ].position ).multiplySelf( scale );
				p1.copy( vertices[ face.b ].position ).multiplySelf( scale );
				p2.copy( vertices[ face.c ].position ).multiplySelf( scale );
				
				if ( face instanceof THREE.Face4 ) {
					
					p3.copy( vertices[ face.d ].position ).multiplySelf( scale );
					
					var nd = this.rayTriangle( rt, p0, p1, p3, d, this.collisionNormal, mesh );
					
					if( nd < d ) {
						
						d = nd;
						nearestface = i;
						me.normal.copy( this.collisionNormal );
						me.normal.normalize();
						
					}
					
					nd = this.rayTriangle( rt, p1, p2, p3, d, this.collisionNormal, mesh );
					
					if( nd < d ) {
						
						d = nd;
						nearestface = i;
						me.normal.copy( this.collisionNormal );
						me.normal.normalize();
						
					}
					
				}
				else {
					
					var nd = this.rayTriangle( rt, p0, p1, p2, d, this.collisionNormal, mesh );
					
					if( nd < d ) {
						
						d = nd;
						nearestface = i;
						me.normal.copy( this.collisionNormal );
						me.normal.normalize();
						
					}
					
				}
				
			}
			
			return {dist: d, faceIndex: nearestface};
			
		};
		
		// ray box
		
		THREE.CollisionSystem.prototype.rayBox = function( ray, ab ) {
			
			var mesh = ab.mesh,
				rt = this.makeRayLocal( ray, mesh ),
				abMin = utilVec31RayBox.copy( ab.min ),
				abMax = utilVec32RayBox.copy( ab.max ),
				origin = rt.origin,
				direction = rt.direction,
				scale;
			
			//rt.origin.copy( ray.origin );
			//rt.direction.copy( ray.direction );
			
			if ( ab.dynamic && typeof mesh !== 'undefined' ) {
				
				// scale
				
				scale = mesh.scale;
				
				abMin.multiplySelf( scale );
				abMax.multiplySelf( scale );
				
			}
			
			var xt = 0, yt = 0, zt = 0;
			var xn = 0, yn = 0, zn = 0;
			var ins = true;
			
			if( origin.x < abMin.x ) {
				
				xt = abMin.x - origin.x;
				xt /= direction.x;
				ins = false;
				xn = -1;
				
			} else if( origin.x > abMax.x ) {
				
				xt = abMax.x - origin.x;
				xt /= direction.x;
				ins = false;
				xn = 1;
				
			}
			
			if( origin.y < abMin.y ) {
				
				yt = abMin.y - origin.y;
				yt /= direction.y;
				ins = false;
				yn = -1;
				
			} else if( origin.y > abMax.y ) {
				
				yt = abMax.y - origin.y;
				yt /= direction.y;
				ins = false;
				yn = 1;
				
			}
			
			if( origin.z < abMin.z ) {
				
				zt = abMin.z - origin.z;
				zt /= direction.z;
				ins = false;
				zn = -1;
				
			} else if( origin.z > abMax.z ) {
				
				zt = abMax.z - origin.z;
				zt /= direction.z;
				ins = false;
				zn = 1;
				
			}
			
			if( ins ) return -1;
			
			var which = 0;
			var t = xt;
			
			if( yt > t ) {
				
				which = 1;
				t = yt;
				
			}
			
			if ( zt > t ) {
				
				which = 2;
				t = zt;
				
			}
			
			switch( which ) {
				
				case 0:
					
					var y = origin.y + direction.y * t;
					if ( y < abMin.y || y > abMax.y ) return Number.MAX_VALUE;
					var z = origin.z + direction.z * t;
					if ( z < abMin.z || z > abMax.z ) return Number.MAX_VALUE;
					ab.normal.set( xn, 0, 0 );
					break;
					
				case 1:
					
					var x = origin.x + direction.x * t;
					if ( x < abMin.x || x > abMax.x ) return Number.MAX_VALUE;
					var z = origin.z + direction.z * t;
					if ( z < abMin.z || z > abMax.z ) return Number.MAX_VALUE;
					ab.normal.set( 0, yn, 0) ;
					break;
					
				case 2:
					
					var x = origin.x + direction.x * t;
					if ( x < abMin.x || x > abMax.x ) return Number.MAX_VALUE;
					var y = origin.y + direction.y * t;
					if ( y < abMin.y || y > abMax.y ) return Number.MAX_VALUE;
					ab.normal.set( 0, 0, zn );
					break;
					
			}
			
			return t;
			
		};
		
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
			centerOffset,
			mass,
			position,
			rotation,
			velocityMovement,
			velocityGravity;
		
		// handle parameters
		
		parameters = parameters || {};
		
		bodyType = parameters.bodyType;
		
		// validity check
		
		if ( typeof mesh === 'undefined' || typeof bodyType !== 'string' ) {
			
			return;
			
		}
		
		// handle mesh
		
		geometry = parameters.geometry || mesh.geometry;
		
		if ( parameters.hasOwnProperty('dynamic') === true ) {
			
			dynamic = parameters.dynamic;
			
		}
		
		position = parameters.position || mesh.position;
		
		rotation = parameters.rotation || ( mesh.useQuaternion === true ? mesh.quaternion : mesh.rotation );
		
		// physics width/height/depth
		
		width = parameters.width;
		
		height = parameters.height;
		
		depth = parameters.depth;
		
		if ( _MathHelper.is_number( width ) === false ) {
			
			needWidth = true;
			
		}
		
		if ( _MathHelper.is_number( height ) === false ) {
			
			needHeight = true;
			
		}
		
		if ( _MathHelper.is_number( depth ) === false ) {
			
			needDepth = true;
			
		}
		
		if ( needWidth === true || needHeight === true || needDepth === true ) {
			
			// model bounding box
			
			bboxDimensions = dimensions_from_bounding_box_scaled( mesh );
			
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
			
			collider = new THREE.PlaneCollider( position, parameters.up || new THREE.Vector3( 0, 0, 1 ) );
			
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
				rotationGravity: new THREE.Quaternion(),
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
			}
		};
		
		return link;
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
		velocity.damping = new THREE.Vector3().addScalar( parameters.damping );
		velocity.offset = parameters.offset && parameters.offset instanceof THREE.Vector3 ? parameters.offset : new THREE.Vector3();
		velocity.relativeRotation = parameters.relativeRotation;
		velocity.moving = false;
		
		return velocity;
	}
	
	/*===================================================
    
    dimensions and bounds
    
    =====================================================*/
	
	function dimensions_from_bounding_box_scaled ( mesh ) {
		var geometry = mesh.geometry,
			scale = mesh.scale,
			bbox,
			dimensions;
		
		// if needs calculation
		
		if ( !geometry.boundingBox ) {
			geometry.computeBoundingBox();
		}
		
		bbox = geometry.boundingBox;
		
		// get original dimensions and scale to mesh's scale
		
		dimensions = new THREE.Vector3( bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y, bbox.max.z - bbox.min.z ).multiplySelf( scale );
		
		return dimensions;
	}
	
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
	
	function center_offset_from_bounding_box ( mesh ) {
		
		var geometry = mesh.geometry,
			bbox,
			centerOffset = new THREE.Vector3();
		
		// if needs calculation
		
		if ( !geometry.boundingBox ) {
			geometry.computeBoundingBox();
		}
		
		bbox = geometry.boundingBox;
		
		if ( bbox ) {
			
			// get mesh's center offset
			
			//centerOffset = new THREE.Vector3( bbox.x[0] + (bbox.x[1] - bbox.x[0]) * 0.5, bbox.y[0] + (bbox.y[1] - bbox.y[0]) * 0.5, bbox.z[0] + (bbox.z[1] - bbox.z[0]) * 0.5 );
			centerOffset.set( bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y, bbox.max.z - bbox.min.z ).multiplyScalar( 0.5 ).addSelf( bbox.min );
			
		}
		
		return centerOffset;
		
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
		
		offset.addSelf( center_offset_from_bounding_box( mesh ) );
		
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
				
				THREE.Quaternion.nlerp( rotation, uq1, rotation, lerpDelta );
			
			}
			else {
				
				// matrix rotations
				
				uq1.setFromRotationMatrix( rotation );
				
				uq2.multiply( qToNew, uq1 );
				
				rotation.setRotationFromQuaternion( uq2 );
				
			}
			
			// if physics rigid body passed
			
			if ( typeof rigidBody !== 'undefined' ) {
				
				// add to rotation gravity
				
				rotationGravity = rigidBody.rotationGravity;
				
				uq1.multiply( qToNew, rotationGravity );
				
				THREE.Quaternion.nlerp( rotationGravity, uq1, rotationGravity, lerpDelta );
				
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
	
	function pull_to_source ( mesh, source, velocity, offset, rigidBody ) {
		
		var position,
			difference = utilVec31Pull,
			direction = utilVec32Pull,
			shift = utilVec33Pull,
			collision,
			collisionDistance;
		
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
		
		// cast ray from mesh to source
		
		collision = raycast_in_direction( position, direction /*, offset, mesh */ );
		console.log('!!! pulling to source');
		console.log('position: ', position.x, position.y, position.z);
		console.log('direction: ', direction.x, direction.y, direction.z);
		console.log(collision);
		// if collision found
		
		if ( typeof collision !== 'undefined' ) {
			
			// get distance
			
			collisionDistance = collision.distance;
			console.log('>>>> collision found at distance ' + collisionDistance );
		}
		else {
			
			collisionDistance = difference.length();
			
		}
		
		// multiply direction by distance
			
		shift.copy( direction ).multiplyScalar( collisionDistance );
		console.log('shift: ', shift.x, shift.y, shift.z);
		// add shift to position
		
		position.addSelf( shift );
		
		/*
		
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
			collision,
			collisionDist;
		
		if ( rigidBody.dynamic !== true || velocityForce.isZero() === true ) {
			
			velocity.moving = false;
			
			return;
			
		} 
		else {
			
			velocity.moving = true;
			
		}
		
		// if velocity is relative to rotation, else will just copy force into rotated
		
		velocityForceRotated = rotate_vector3_relative_to( relativeRotation, velocityForce, velocityForceRotated );
		
		//velocityForceRotated = rotate_vector3_to_mesh_rotation( mesh, velocityForce, velocityForceRotated );
		
		// scale velocity
		
		scaleModded.x = Math.pow( scaleModded.x, scaleExp );
		scaleModded.y = Math.pow( scaleModded.y, scaleExp );
		scaleModded.z = Math.pow( scaleModded.z, scaleExp );
		
		velocityForceRotated.multiplySelf( scaleModded );
		
		// get rotated length
		
		velocityForceRotatedLength = velocityForceRotated.length();
		
		// get bounding box offset
		
		boundingOffset = offset_from_dimensions_in_direction( mesh, velocityForceRotated, dimensions_from_collider_scaled( rigidBody, mesh ) );//dimensions_from_bounding_box_scaled( mesh ) );
		
		boundingOffsetLength = boundingOffset.length();
		
		// override offset
		
		if ( typeof offset !== 'undefined' ) {
		
			velocityOffset = offset;
			
		}
		
		// rotate offset if needed
		
		if ( velocityOffset.length() > 0 ) {
			
			velocityOffset = rotate_vector3_to_mesh_rotation( mesh, velocityOffset );
			
		}
		
		var castDistance = boundingOffsetLength + velocityForceRotatedLength;
		
		// get collision
		
		collision = raycast_in_direction( link, velocityForceRotated, castDistance, velocityOffset );
		
		// modify velocity based on collision distances to avoid passing through or into objects
		
		if ( collision ) {
			
			collisionDist = collision.distance;
			
			// set the rotated velocity to be no more than collision distance
			
			if ( collisionDist - velocityForceRotatedLength <= boundingOffsetLength ) {
				
				velocityForceScalar = ( collisionDist - boundingOffsetLength ) / velocityForceRotatedLength;
				
				velocityForceRotated.multiplyScalar( velocityForceScalar );
				
				// set the base velocity to 0
				
				velocityForce.set( 0, 0, 0 );
				
				velocity.moving = false;
				
			}
			
		}
		
		// add velocity to position
		
		position.addSelf( velocityForceRotated );
		
		// damp velocity
		
		velocityForce.multiplySelf( velocityDamping );
		
		// return collision
		
		return collision;
		*/
		
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
			velocityMovement;
		
		// handle rotation and check velocity
		
		for ( i = 0, l = links.length; i < l; i ++ ) {
			
			link = links[ i ];
			
			mesh = link.mesh;
			
			rigidBody = link.rigidBody;
			
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
				
				// gravity velocity
				
				handle_velocity( link, velocityGravity );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    velocity functions
    
    =====================================================*/
	
	function handle_velocity ( link, velocity, offset ) {
		
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
			collision,
			collisionDist;
		
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
		
		boundingOffset = offset_from_dimensions_in_direction( mesh, velocityForceRotated, dimensions_from_collider_scaled( rigidBody, mesh ) );//dimensions_from_bounding_box_scaled( mesh ) );
		
		boundingOffsetLength = boundingOffset.length();
		
		// override offset
		
		if ( typeof offset !== 'undefined' ) {
		
			velocityOffset = offset;
			
		}
		
		// rotate offset if needed
		
		if ( velocityOffset.length() > 0 ) {
			
			velocityOffset = rotate_vector3_to_mesh_rotation( mesh, velocityOffset );
			
		}
		
		// get collision
		
		collision = raycast_in_direction( position, velocityForceRotated, velocityOffset, mesh );
		
		// modify velocity based on collision distances to avoid passing through or into objects
		
		if ( collision ) {
			
			collisionDist = collision.distance;
			
			// set the rotated velocity to be no more than collision distance
			
			if ( collisionDist - velocityForceRotatedLength <= boundingOffsetLength ) {
				
				velocityForceScalar = ( collisionDist - boundingOffsetLength ) / velocityForceRotatedLength;
				
				velocityForceRotated.multiplyScalar( velocityForceScalar );
				
				// set the base velocity to 0
				
				velocityForce.set( 0, 0, 0 );
				
				velocity.moving = false;
				
			}
			
		}
		
		// add velocity to position
		
		position.addSelf( velocityForceRotated );
		
		// damp velocity
		
		velocityForce.multiplySelf( velocityDamping );
		
		// if velocity low enough, set zero
		
		if ( velocityForce.length() < 0.01 ) {
			velocityForce.multiplyScalar( 0 );
		}
		
		// return collision
		
		return collision;
	}
	
	/*===================================================
    
    raycast functions
    
    =====================================================*/
	
	function raycast_in_direction ( origin, direction, offset, mesh ) {
		
		var i, l,
			ray = utilRay1Casting,
			collisions = [],
			collisionPotential,
			collisionMeshRecast,
			collisionDistance = Number.MAX_VALUE,
			collision;
		
		// set ray
		
		ray.origin.copy( origin );
		ray.direction.copy( direction ).normalize();
		
		// add offset if passed
		
		if ( typeof offset !== 'undefined' ) {
			
			ray.origin.addSelf( offset );
			
		}
		
		// ray cast all
		
		collisions = system.rayCastAll( ray );
		
		// find nearest collision
		
		if ( typeof collisions !== 'undefined' ) {
			
			for ( i = 0, l = collisions.length; i < l; i ++ ) {
				
				collisionPotential = collisions[ i ];
				
				// if is collider for this object, skip
				
				if ( collisionPotential.mesh === mesh ) {
					
					continue;
					
				}
				
				// cast ray again if collider is mesh
				// initial ray cast was to mesh collider's dynamic box
				
				if ( collisionPotential instanceof THREE.MeshCollider ) {
					
					collisionMeshRecast = system.rayMesh( ray, collisionPotential );
					
					if ( collisionMeshRecast.dist < Number.MAX_VALUE ) {
						collisionPotential.distance = collisionMeshRecast.dist;
						collisionPotential.faceIndex = collisionMeshRecast.faceIndex;
					}
					else {
						collisionPotential.distance = Number.MAX_VALUE;
					}
					
				}
				
				// if distance is less than last ( last starts at number max value )
				// store as collision
				
				if ( collisionPotential.distance < collisionDistance ) {
					
					collisionDistance = collisionPotential.distance;
					collision = collisionPotential;
					
				}
				
			}
			
		}
		
		/*
		// ray casting individual objects
		
		for ( i = 0, l = system.colliders.length; i < l; i ++ ) {
			
			var collider = system.colliders[ i ];
			var cmesh = collider.mesh;
			
			if ( cmesh === mesh ) {
				continue;
			}
			
			var intersects = ray.intersectObject( cmesh );
			//console.log(intersects.length);
			var j, k;
			
			for ( j = 0, k = intersects.length; j < k; j ++ ) {
				
				var intersect = intersects[ j ];
				//console.log(' > dist', intersect.distance, ' vs ', collisionDistance);
				if ( intersect.distance < collisionDistance ) {
					
					collisionDistance = intersect.distance;
					collision = intersect;
					
				}
				
			}
			
		}
		*/
		
		return collision;
		
	}
	
} ( KAIOPUA ) );