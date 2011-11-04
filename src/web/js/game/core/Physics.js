/*
Physics.js
Physics module, handles physics in game using JigLibJS.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
		core = game.core = game.core || {},
		physics = core.physics = core.physics || {},
		ready = false,
		system,
		gravitySource,
		gravityMagnitude,
		linksBaseName = 'vis_to_phys_link_',
		linksCount = 0,
		links = [],
		time,
		timeLast,
		cvMat4,
		cvVec3;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	physics.init = init;
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
	
	/*===================================================
    
    external init
    
    =====================================================*/
	
	function init () {
		
		if ( ready !== true ) {
		
			init_system();
			
			ready = true;
		
		}
		
	}
	
	function init_system() {
		
		// system
		
		system = THREE.Collisions;
		set_gravity_source( new THREE.Vector3( 0, 0, 0 ) );
		set_gravity_magnitude( new THREE.Vector3( 0, -1, 0 ) );
		
		// utility / conversion objects
		
		cvMat4 = new THREE.Matrix4();
		cvVec3 = new THREE.Vector3();
		
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
			rigidBody,
			collider,
			movable = false,
			width,
			height,
			depth,
			needWidth,
			needHeight,
			needDepth,
			radius,
			mass,
			position,
			rotation,
			velocityMovement,
			velocityGravity;
		
		geometry = parameters.geometry || mesh.geometry;
		
		// handle parameters
		
		parameters = parameters || {};
		
		bodyType = parameters.bodyType || 'box';
		
		if ( parameters.hasOwnProperty('movable') === true ) {
			
			movable = parameters.movable;
			
		}
		
		position = parameters.position || mesh.position;
		
		rotation = parameters.rotation || ( mesh.useQuaternion === true ? mesh.quaternion : mesh.rotation );
		
		// physics width/height/depth
		
		width = parameters.depth;
		
		height = parameters.width;
		
		depth = parameters.height;
		
		if ( isNaN( width ) || isFinite( width ) === false ) {
			
			needWidth = true;
			
		}
		
		if ( isNaN( height ) || isFinite( height ) === false ) {
			
			needHeight = true;
			
		}
		
		if ( isNaN( depth ) || isFinite( depth ) === false ) {
			
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
			
			radius = Math.max( width, Math.max( height, depth ) ) * 0.5;
			
			collider = new THREE.SphereCollider( position, radius );
			
		}
		else if ( bodyType === 'plane' ) {
			
			collider = new THREE.PlaneCollider( position, parameters.up || new jiglib.Vector3D( 0, 0, 1, 0 ) );
			
		}
		// default box
		else {
			
			collider = THREE.CollisionUtils.MeshOBB( mesh );
			
		}
		
		// init velocities
		
		velocityMovement = {
			force: new THREE.Vector3(),
			damping: new THREE.Vector3( 0.98, 0.98, 0.98 )
		};
		
		velocityGravity = {
			force: new THREE.Vector3(),
			damping: new THREE.Vector3( 0.98, 0.98, 0.98 )
		};
		
		// create rigid body
		
		rigidBody = {
			mesh: mesh,
			collider: collider,
			movable: movable,
			mass: mass,
			velocityMovement: velocityMovement,
			velocityGravity: velocityGravity,
			axes: {
				up: new THREE.Vector3( 0, 1, 0 ),
				forward: new THREE.Vector3( 0, 0, 1 ),
				right: new THREE.Vector3( 1, 0, 0 )
			}
		};
		
		// rigid body functions
		
		return rigidBody;
	}
	
	// adds mesh's rigid body to physics world
	// creates new rigid body if one is not passed
	
	function add ( mesh, parameters ) {
		
		var rigidBody;
		
		// parameters
		
		parameters = parameters || {};
		
		rigidBody = parameters.rigidBody || translate( mesh, parameters );
		
		rigidBody.name = parameters.name || rigidBody.name || linksBaseName + linksCount;
		
		// add to system
		
		system.colliders.push( rigidBody.collider );
		
		// add to links
		
		linksCount += 1;
		
		links.push( rigidBody );
		
		return rigidBody;
		
	}
	
	// removes mesh's rigid body from physics world
	
	function remove ( meshOrBodyOrName ) {
		
		var i, l,
			rigidBody,
			name,
			index;
			
		for ( i = 0, l = links.length; i < l; i += 1 ) {
			
			rigidBody = links[ i ];
			
			if ( rigidBody === meshOrBodyOrName || rigidBody.mesh === meshOrBodyOrName || rigidBody.name === meshOrBodyOrName ) {
				
				links.splice( i, 1 );
				
				index = system.colliders.indexOf( rigidBody.collider );
				
				if ( index !== -1 ) {
				
					system.colliders.splice( index, 1 );
					
				}
				
				break;
				
			}
			
		}
		
	}
	
	/*===================================================
    
    physics functions
    
    =====================================================*/
	
	function set_gravity_source ( source ) {
		gravitySource = new THREE.Vector3( source.x, source.y, source.z );
	}
	
	function set_gravity_magnitude ( magnitude ) {
		gravityMagnitude = new THREE.Vector3( magnitude.x, magnitude.y, magnitude.z );
	}
	
	function dimensions_from_bounding_box_scaled ( mesh ) {
		var geometry = mesh.geometry,
			scale = mesh.scale,
			bbox,
			dimensions;
		
		// if needs calculation
		
		if ( typeof geometry.boundingBox === 'undefined' || geometry.boundingBox === null ) {
			geometry.computeBoundingBox();
		}
		
		bbox = geometry.boundingBox;
		
		// get original dimensions and scale to mesh's scale
		
		dimensions = new THREE.Vector3( bbox.x[1] - bbox.x[0], bbox.y[1] - bbox.y[0], bbox.z[1] - bbox.z[0] ).multiplySelf( scale );
		
		return dimensions;
	}
	
	function dimensions_from_collider_scaled ( rigidBody ) {
		var collider = rigidBody.collider,
			mesh = rigidBody.mesh,
			scale = mesh.scale,
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
		
		dimensions.sub( colliderMax, colliderMin ).multiplySelf( scale );
		
		return dimensions;
	}
	
	function center_offset_from_bounding_box ( mesh ) {
		
		var geometry = mesh.geometry,
			bbox,
			centerOffset;
		
		// if needs calculation
		
		if ( typeof geometry.boundingBox === 'undefined' || geometry.boundingBox === null ) {
			geometry.computeBoundingBox();
		}
		
		bbox = geometry.boundingBox;
		
		// get mesh's center offset
		
		centerOffset = new THREE.Vector3( bbox.x[0] + (bbox.x[1] - bbox.x[0]) * 0.5, bbox.y[0] + (bbox.y[1] - bbox.y[0]) * 0.5, bbox.z[0] + (bbox.z[1] - bbox.z[0]) * 0.5 );
		
		return centerOffset;
		
	}
	
	function rotate_vector3_to_mesh_rotation ( mesh, vec3 ) {
		
		var rotatedVec3 = vec3.clone();
		
		if ( mesh.useQuaternion === true ) {
			
			mesh.quaternion.multiplyVector3( rotatedVec3 );
			
		}
		else {
			
			mesh.matrix.multiplyVector3( rotatedVec3 );
			
		}
		
		return rotatedVec3;
		
	}
	
	/*===================================================
    
    custom functions
    
    =====================================================*/
	
	function start () {
		
		time = timeLast = new Date().getTime();
		
		shared.signals.update.add( update );
		
	}
	
	function stop () {
		
		shared.signals.update.remove( update );
		
	}
	
	function update () {
		
		var timeDelta,
			timeStep;
		
		// handle time
		
		timeLast = time;
		
		time = new Date().getTime();
		
		timeDelta = time - timeLast;
		
		timeStep = timeDelta / 1000;
		
		if ( timeStep > 0.05 ) {
			timeStep = 0.05;
		}
		
		// integrate
		
		integrate( timeStep );
		
	}
	
	function integrate ( timeStep ) {
		
		var i, l,
			j, k,
			rigidBody,
			mesh,
			collider,
			position,
			rotation,
			axes,
			axisUp,
			axisUpNew,
			axisUpToUpNewDist,
			axisForward,
			axisRight,
			colMin,
			colMax,
			colDimensions,
			velocityGravity,
			velocityMovement,
			gravSrc,
			gravMag,
			gravUp,
			gravDown,
			gravUpLength,
			gravPull,
			upToUpNewAngle,
			upToUpNewAxis,
			upToUpNewLength,
			upToUpNewQ,
			rayPosition,
			rayGravity,
			collisionGravity,
			rayVelocity,
			collisionVelocity;
		
		// update links
		
		for ( i = 0, l = links.length; i < l; i += 1 ) {
			
			rigidBody = links[ i ];
			
			// is movable
			
			if ( rigidBody.movable === true ) {
				
				// localize basics
				
				mesh = rigidBody.mesh;
				
				collider = rigidBody.collider;
				
				position = mesh.position;
				
				rotation = ( mesh.useQuaternion === true ? mesh.quaternion : mesh.rotation );
				
				velocityGravity = rigidBody.velocityGravity;
				
				velocityMovement = rigidBody.velocityMovement;
				
				axes = rigidBody.axes;
				
				axisUp = axisUpNew = axes.up;
				
				axisForward = axes.forward;
				
				axisRight = axes.right;
				
				gravSrc = rigidBody.gravitySource || gravitySource;
				
				gravMag = rigidBody.gravityMagnitude || gravityMagnitude;
				
				// get normalized up vector between character and gravity source
				
				gravUp = new THREE.Vector3().sub( position, gravSrc );
				gravUpLength = gravUp.length();
				if ( gravUpLength > 0 ) {
					gravUp.divideScalar( gravUpLength );
				}
				
				// negate gravity up
				
				gravDown = gravUp.clone().negate();
				
				// add non rotated gravity to gravity velocity
				
				velocityGravity.force.addSelf( gravMag );
				
				// ray cast in the direction of gravity
				
				collisionGravity = raycast_in_direction( rigidBody, gravDown );
				
				if( collisionGravity ) {
					
					// get normal of colliding face as new up axis
					
					axisUpNew = collisionGravity.normal;
					
				} else {
					
					// TODO
					// assume object has fallen through world
					// reset to ground plane
					
				}
				
				// get new rotation based on gravity
				
				// find dist between axis up and new axis up
				
				axisUpToUpNewDist = Math.max( -1, Math.min( 1, axisUp.dot( axisUpNew ) ) );
				
				// if up axes are not same
				
				if ( axisUpToUpNewDist !== 1 ) {
					
					// axis / angle
					
					upToUpNewAngle = Math.acos( axisUpToUpNewDist );
					upToUpNewAxis = new THREE.Vector3().cross( axisUp, axisUpNew );
					upToUpNewLength = upToUpNewAxis.length();
					if ( upToUpNewLength > 0 ) {
						upToUpNewAxis.divideScalar( upToUpNewLength );
					}
					
					// rotation change
					
					upToUpNewQ = new THREE.Quaternion();
					upToUpNewQ.setFromAxisAngle( upToUpNewAxis, upToUpNewAngle );
					upToUpNewQ.inverse();
					
					// add to rotation
					
					if ( mesh.useQuaternion === true ) {
						
						rotation.multiplySelf( upToUpNewQ );
						
					}
					else {
						
						upToUpNewQ.multiplyVector3( rotation );
						
					}
					
					// store new axes
					
					axisUp.copy( axisUpNew );
					
					upToUpNewQ.multiplyVector3( axisForward );
					
					upToUpNewQ.multiplyVector3( axisRight );
					
				}
				
				// handle gravity velocity
				
				handle_velocity( rigidBody, velocityGravity, collisionGravity );
				
				// handle movement velocity
				
				handle_velocity( rigidBody, velocityMovement );
				
			}
			
		}
		
	}
	
	function handle_velocity ( rigidBody, velocity, collision ) {
		
		var mesh = rigidBody.mesh,
			position = mesh.position,
			rotation = mesh.rotation,
			rotationHelper,
			velocityForce = velocity.force,
			velocityForceRotated,
			velocityForceRotatedLength,
			velocityDamping = velocity.damping,
			collision,
			collisionDist;
		
		// rotate velocity to mesh's rotation
		
		velocityForceRotated = rotate_vector3_to_mesh_rotation( mesh, velocityForce );
		
		// if new velocity is not 0
		
		if ( velocityForceRotated.isZero() !== true ) {
			
			// get rotated length
			
			velocityForceRotatedLength = velocityForceRotated.length();
			
			// get collision
			
			collision = collision || raycast_in_direction( rigidBody, velocityForceRotated );
			
			// modify velocity based on collision distances to avoid passing through or into objects
			
			collisionDist = collision.distance;
			
			if ( velocityForceRotatedLength > collisionDist ) {
				
				velocityForceRotated.multiplyScalar( (collisionDist - 1) / velocityForceRotatedLength );
				
			}
			
			// add velocity to position
			
			position.addSelf( velocityForceRotated );
			
			// damp velocity
			
			velocityForce.multiplySelf( velocityDamping );
			
		}
		
		// return collision from ray
		
		return collision;
	}
	
	function raycast_in_direction ( rigidBody, direction ) {
		
		var mesh = rigidBody.mesh,
			position = mesh.position,
			rotation = mesh.rotation,
			colliderDimensions,
			halfDimension,
			centerOffset,
			rayPosition,
			rayDirection,
			rayDirectionLength,
			ray,
			collision;
		
		// if velocity is empty or rigidBody is not movable
		// no need to raycast
		
		if ( rigidBody.movable !== true || direction.isZero() === true ) {
			
			return;
			
		}
		// raycast
		else {
			
			// get collider width/height/depth
			// could use geometry bounding box, but what if collider is different size?
			
			colliderDimensions = dimensions_from_collider_scaled( rigidBody );
			//colliderDimensions = dimensions_from_bounding_box_scaled( mesh );
			
			// copy direction and normalize
			
			rayDirection = direction.clone();
			rayDirectionLength = rayDirection.length();
			if ( rayDirectionLength > 0 ) {
				rayDirection.divideScalar( rayDirectionLength );
			}
			
			// copy half of dimensions in direction and add 1 to avoid ray casting to self
			
			halfDimension = colliderDimensions.clone().multiplyScalar( 0.5 ).addScalar( 1 ).multiplySelf( rayDirection );//new THREE.Vector3( 0, colliderDimensions.y * 0.5 + 1, 0 );
			
			// rotate dimensions to mesh's rotation
			
			halfDimension = rotate_vector3_to_mesh_rotation( mesh, halfDimension );
			
			// find true bottom of mesh
			// add center offset of mesh to position
			// subtract rotated half height
			
			centerOffset = center_offset_from_bounding_box( mesh );
			
			rayPosition = position.clone().addSelf( centerOffset ).addSelf( halfDimension );
			
			// ray cast
			
			ray = new THREE.Ray( rayPosition, rayDirection );

			collision = THREE.Collisions.rayCastNearest( ray );
			
			// clamp distance to give a 1 unit gap
					
			collision.distance = Math.max( 1, collision.distance );
			
			return collision;
			
		}
		
	}
	
	return main;
	
}(KAIOPUA || {}));