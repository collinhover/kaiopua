/*
Physics.js
Physics module, handles physics in game using JigLibJS.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/core/Physics",
		physics = {},
		mathhelper,
		ready = false,
		system,
		gravitySource,
		gravityMagnitude,
		linkBaseName = 'visual_physical_link_',
		linkCount = 0,
		links = [],
		scaleSpeedExp = Math.log( 1.5 ),
		utilVec31Integrate,
		utilVec32Integrate,
		utilVec31Offset,
		utilVec31Raycast,
		utilVec31Velocity,
		utilQ1Integrate,
		utilQ2Integrate,
		utilQ3Integrate,
		utilQ4Offset,
		utilRay1Casting;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	physics.translate = translate;
	physics.add = add;
	physics.remove = remove;
	physics.start = start;
	physics.stop = stop;
	physics.update = update;
	
	// getters and setters
	
	Object.defineProperty(physics, 'gravitySource', { 
		get : function () { return gravitySource; },
		set : set_gravity_source
	});
	
	Object.defineProperty(physics, 'gravityMagnitude', { 
		get : function () { return gravityMagnitude; },
		set : set_gravity_magnitude
	});
	
	Object.defineProperty(physics, 'system', { 
		get : function () { return system; }
	});
	
	physics = main.asset_register( assetPath, physics, true );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	main.assets_require( [
		"assets/modules/utils/MathHelper"
	], init_internal, true );
	
	function init_internal ( mh ) {
		console.log('internal physics');
		
		if ( ready !== true ) {
			
			mathhelper = mh;
			
			init_system();
			
			ready = true;
			
			main.asset_ready( assetPath );
			
		}
		
	}
	
	function init_system() {
		
		// system
		
		system = THREE.Collisions;
		set_gravity_source( new THREE.Vector3( 0, 0, 0 ) );
		set_gravity_magnitude( new THREE.Vector3( 0, -1, 0 ) );
		
		// utility / conversion objects
		
		utilVec31Integrate = new THREE.Vector3();
		utilVec32Integrate = new THREE.Vector3();
		utilVec31Offset = new THREE.Vector3();
		utilVec31Raycast = new THREE.Vector3();
		utilVec31Velocity = new THREE.Vector3();
		utilQ1Integrate = new THREE.Quaternion();
		utilQ2Integrate = new THREE.Quaternion();
		utilQ3Integrate = new THREE.Quaternion();
		utilQ4Offset = new THREE.Quaternion();
		utilRay1Casting = new THREE.Ray();
		
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
		
		THREE.CollisionSystem.prototype.makeRayLocal = function( ray, m ) {
			
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
			
			var rt = this.makeRayLocal( ray, ab.mesh ),
				abMin = utilVec31RayBox.copy( ab.min ),
				abMax = utilVec32RayBox.copy( ab.max ),
				origin = rt.origin,
				direction = rt.direction,
				scale;
			
			//rt.origin.copy( ray.origin );
			//rt.direction.copy( ray.direction );
			
			if ( ab.dynamic && ab.mesh && ab.mesh.scale ) {
				
				scale = ab.mesh.scale;
				
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
		
		if ( mathhelper.is_number( width ) === false ) {
			
			needWidth = true;
			
		}
		
		if ( mathhelper.is_number( height ) === false ) {
			
			needHeight = true;
			
		}
		
		if ( mathhelper.is_number( depth ) === false ) {
			
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
		
		if ( bodyType === 'trimesh' ) {
			
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
					offset: parameters.movementOffset
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
	
	// adds mesh's rigid body to physics world
	// creates new rigid body if one is not passed
	
	function add ( mesh, link, parameters ) {
		
		var rigidBody;
		
		link = link || translate( mesh, parameters );
		
		rigidBody = link.rigidBody;
		
		// add to system
		
		system.colliders.push( rigidBody.collider );
		
		// zero out velocities
		
		rigidBody.velocityMovement.force.set( 0, 0, 0 );
		
		rigidBody.velocityGravity.force.set( 0, 0, 0 );
		
		// add to links list
		
		links.push( link );
		
	}
	
	// removes mesh's rigid body from physics world
	
	function remove ( linkorMeshOrBodyOrName ) {
		
		var i, l,
			link,
			index;
			
		for ( i = 0, l = links.length; i < l; i ++ ) {
			
			link = links[ i ];
			
			if ( link === linkorMeshOrBodyOrName || link.mesh === linkorMeshOrBodyOrName || link.rigidBody === linkorMeshOrBodyOrName || link.name === linkorMeshOrBodyOrName ) {
				
				links.splice( i, 1 );
				
				index = system.colliders.indexOf( link.rigidBody.collider );
				
				if ( index !== -1 ) {
				
					system.colliders.splice( index, 1 );
					
				}
				
				break;
				
			}
			
		}
		
	}
	
	/*===================================================
    
    utility functions
    
    =====================================================*/
	
	function set_gravity_source ( source ) {
		gravitySource = new THREE.Vector3( source.x, source.y, source.z );
	}
	
	function set_gravity_magnitude ( magnitude ) {
		gravityMagnitude = new THREE.Vector3( magnitude.x, magnitude.y, magnitude.z );
	}
	
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
		velocity.moving = false;
		
		return velocity;
	}
	
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
			centerOffset;
		
		// if needs calculation
		
		if ( !geometry.boundingBox ) {
			geometry.computeBoundingBox();
		}
		
		bbox = geometry.boundingBox;
		
		// get mesh's center offset
		
		//centerOffset = new THREE.Vector3( bbox.x[0] + (bbox.x[1] - bbox.x[0]) * 0.5, bbox.y[0] + (bbox.y[1] - bbox.y[0]) * 0.5, bbox.z[0] + (bbox.z[1] - bbox.z[0]) * 0.5 );
		centerOffset = new THREE.Vector3( bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y, bbox.max.z - bbox.min.z ).multiplyScalar( 0.5 ).addSelf( bbox.min );
		
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
	
	function rotate_vector3_to_mesh_rotation ( mesh, vec3, rotatedVec3 ) {
		
		if ( rotatedVec3 instanceof THREE.Vector3 ) {
			rotatedVec3.copy( vec3 );
		}
		else {
			rotatedVec3 = vec3.clone();
		}
		
		if ( mesh.useQuaternion === true ) {
			
			mesh.quaternion.multiplyVector3( rotatedVec3 );
			
		}
		else {
			
			mesh.matrix.multiplyVector3( rotatedVec3 );
			
		}
		
		return rotatedVec3;
		
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
	
	function update ( timeDelta ) {
		
		var i, l = 1,
			refreshInterval = shared.refreshInterval,
			currentInterval = timeDelta,
			timeStep;
		
		// handle time
		
		if ( currentInterval > refreshInterval ) {
			
			l = Math.ceil( currentInterval / refreshInterval );
			
		}
		
		// integrate
		
		//for ( i = 0; i < l; i ++ ) {
			
			currentInterval = refreshInterval;
			
			timeStep = currentInterval / 1000;
		
			integrate( timeStep );
			
		//}
		
	}
	
	/*===================================================
    
    integrate functions
    
    =====================================================*/
	
	function integrate ( timeStep ) {
		
		var i, l,
			uv31 = utilVec31Integrate, uv32 = utilVec32Integrate,
			uq1 = utilQ1Integrate, uq2 = utilQ2Integrate, uq3 = utilQ3Integrate,
			ca = shared.cardinalAxes,
			lerpDelta = 0.1,
			link,
			rigidBody,
			mesh,
			scale,
			collider,
			position,
			rotation,
			axes,
			axisUp,
			axisUpNew,
			axisUpToUpNewDist,
			axisForward,
			axisRight,
			velocityGravity,
			velocityMovement,
			gravSrc,
			gravMag,
			gravUp,
			gravDown,
			upToUpNewAngle,
			upToUpNewAxis,
			upToUpNewQ,
			collisionGravity;
		
		// handle rotation and check velocity
		
		for ( i = 0, l = links.length; i < l; i ++ ) {
			
			link = links[ i ];
			
			mesh = link.mesh;
			
			rigidBody = link.rigidBody;
			
			// is dynamic
			
			if ( rigidBody.dynamic === true ) {
				
				// localize dynamic basics
				
				position = mesh.position;
				
				rotation = ( mesh.useQuaternion === true ? mesh.quaternion : mesh.matrix );
				
				rotationGravity = rigidBody.rotationGravity;
				
				velocityGravity = rigidBody.velocityGravity;
				
				velocityMovement = rigidBody.velocityMovement;
				
				axes = rigidBody.axes;
				
				axisUp = axes.up;
				
				axisForward = axes.forward;
				
				axisRight = axes.right;
				
				gravSrc = rigidBody.gravitySource || gravitySource;
				
				gravMag = rigidBody.gravityMagnitude || gravityMagnitude;
				
				// get normalized up vector between character and gravity source
				
				gravUp = uv31.sub( position, gravSrc ).normalize();
				
				// negate gravity up
				
				gravDown = gravUp.clone().negate();//axisUp.clone().negate();//
				
				// movement velocity
				
				handle_velocity( link, velocityMovement );
				
				// ray cast in the direction of gravity
				
				//collisionGravity = raycast_in_direction( link, gravDown, undefined, true );
				
				// handle collision to find new up orientation
				
				if( collisionGravity ) {
					
					// get normal of colliding face as new up axis
					// this causes severe jitter 
					// when crossing faces that are not close in angle
					// tried many things to fix...
					
					axisUpNew = gravUp;//collisionGravity.normal;
					
				} else {
					
					// TODO
					// assume object has fallen through world
					// reset to ground plane
					
					axisUpNew = gravUp;
					
				}
				
				// get new rotation based on gravity
				
				// find dist between axis up and new axis up
				
				axisUpToUpNewDist = Math.max( -1, Math.min( 1, axisUp.dot( axisUpNew ) ) );
				
				// if up axes are not same
				
				if ( axisUpToUpNewDist !== 1 ) {
					
					// axis / angle
					
					upToUpNewAngle = Math.acos( axisUpToUpNewDist );
					upToUpNewAxis = uv32.cross( axisUp, axisUpNew );
					upToUpNewAxis.normalize();
					
					// if new up axis is exactly opposite of current up
					// replace upToUpNew axis with the player's current forward axis
					
					if ( upToUpNewAxis.length() === 0 ) {
						upToUpNewAxis = axisForward;
					}
					
					// rotation change
					
					upToUpNewQ = uq3.setFromAxisAngle( upToUpNewAxis, upToUpNewAngle );
					
					// add to rotation
					
					uq1.multiply( upToUpNewQ, rotationGravity );
					
					THREE.Quaternion.nlerp( rotationGravity, uq1, rotationGravity, lerpDelta );
					
					if ( mesh.useQuaternion === true ) {
						
						// quaternion rotations
						
						uq1.multiply( upToUpNewQ, rotation );
						
						// normalized lerp to new rotation
						
						THREE.Quaternion.nlerp( rotation, uq1, rotation, lerpDelta );
					
					}
					else {
						
						// matrix rotations
						
						uq1.setFromRotationMatrix( rotation );
						
						uq2.multiply( upToUpNewQ, uq1 );
						
						rotation.setRotationFromQuaternion( uq2 );
						
					}
					
					// find new axes based on new rotation
					
					rotation.multiplyVector3( axisUp.copy( ca.up ) );
					
					rotation.multiplyVector3( axisForward.copy( ca.forward ) );
					
					rotation.multiplyVector3( axisRight.copy( ca.right ) );
					
				}
				
				// add non rotated gravity to gravity velocity
				
				velocityGravity.force.addSelf( gravMag );
				
				// check gravity velocity
				
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
		
		// rotate velocity to mesh's rotation
		
		velocityForceRotated = rotate_vector3_to_mesh_rotation( mesh, velocityForce, velocityForceRotated );
		
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
		//for ( var i = 0; i < 2; i++ ) {
			collision = raycast_in_direction( link, velocityForceRotated, castDistance, velocityOffset );
		//}
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
		
		// return velocity
		
		return collision;
	}
	
	/*===================================================
    
    raycast functions
    
    =====================================================*/
	
	function raycast_in_direction ( link, direction, castDistance, offset, showLine ) {
		
		var i, l,
			rigidBody = link.rigidBody,
			mesh = link.mesh,
			position = mesh.position,
			ray = utilRay1Casting,
			rayPosition,
			rayDirection,
			collisions = [],
			collisionPotential,
			collisionMeshRecast,
			collisionDistance = Number.MAX_VALUE,
			collision,
			intersects,
			intersect;
		
		// if velocity is empty or rigidBody is not dynamic
		// no need to raycast
		
		if ( rigidBody.dynamic !== true || direction.isZero() === true ) {
			
			return;
			
		}
		
		// copy direction and normalize
		
		rayDirection = direction.clone();
		rayDirection.normalize();
		
		// set ray position
		
		rayPosition = position.clone();
		
		if ( typeof offset !== 'undefined' ) {
			
			rayPosition.addSelf( offset );
			
		}
		
		// set ray
		
		ray.origin = rayPosition;
		ray.direction = rayDirection;
		
		/*
		
		// ray cast all
		
		collisions = system.rayCastAll( ray );
		console.log(collisions.length);
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
				console.log(' > dist', collisionPotential.distance, ' vs ', collisionDistance);
				if ( collisionPotential.distance < collisionDistance ) {
					
					collisionDistance = collisionPotential.distance;
					collision = collisionPotential;
					
				}
				
			}
			
		}
		*/
		
		// ray casting individual objects
		
		for ( i = 0, l = system.colliders.length; i < l; i ++ ) {
			
			var collider = system.colliders[ i ];
			var cmesh = collider.mesh;
			
			if ( cmesh === mesh ) {
				continue;
			}
			
			intersects = ray.intersectObject( cmesh );
			console.log(intersects.length);
			var j, k;
			
			for ( j = 0, k = intersects.length; j < k; j ++ ) {
				
				intersect = intersects[ j ];
				console.log(' > dist', intersect.distance, ' vs ', collisionDistance);
				if ( intersect.distance < collisionDistance ) {
					
					collisionDistance = intersect.distance;
					collision = intersect;
					
				}
				
			}
			
		}
		
		return collision;
		
	}
	
	return main;
	
}(KAIOPUA || {}));