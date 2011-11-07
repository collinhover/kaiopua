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
		utilMat4,
		utilVec31,
		utilVec32,
		utilVec33,
		utilVec34,
		utilQ1,
		utilQ2,
		utilQ3,
		utilQ4,
		utilQ5,
		line4;
	
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
		
		utilMat4 = new THREE.Matrix4();
		utilVec31 = new THREE.Vector3();
		utilVec32 = new THREE.Vector3();
		utilVec33 = new THREE.Vector3();
		utilVec34 = new THREE.Vector3();
		utilQ1 = new THREE.Quaternion();
		utilQ2 = new THREE.Quaternion();
		utilQ3 = new THREE.Quaternion();
		utilQ4 = new THREE.Quaternion();
		utilQ5 = new THREE.Quaternion();
		
		// line testing
		
		var geom4 = new THREE.Geometry();
		geom4.vertices.push( new THREE.Vertex( new THREE.Vector3(-100, 0, 0) ) );
		geom4.vertices.push( new THREE.Vertex( new THREE.Vector3( 100, 0, 0) ) );
		
		var lineMat4 = new THREE.LineBasicMaterial( { color: 0xff00ff, opacity: 1, linewidth: 8 } );
		
		line4 = new THREE.Line(geom4, lineMat4);
		
		game.scene.add( line4 );
		
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
			boxMax,
			boxMin,
			centerOffset,
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
		
		width = parameters.width;
		
		height = parameters.height;
		
		depth = parameters.depth;
		
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
		
		// store mesh directly in collider
		// fixes some collision bugs?
		
		collider.mesh = mesh;
		
		// create rigid body
		
		rigidBody = {
			mesh: mesh,
			collider: collider,
			movable: movable,
			mass: mass,
			velocityMovement: generate_velocity_tracker(),
			velocityGravity: generate_velocity_tracker(),
			axes: {
				up: new THREE.Vector3( 0, 1, 0 ),
				forward: new THREE.Vector3( 0, 0, 1 ),
				right: new THREE.Vector3( -1, 0, 0 )
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
		//if ( typeof rigidBody.collider.min === 'undefined' ) 
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
	
	function generate_velocity_tracker ( parameters ) {
		var velocity = {};
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.damping = parameters.damping || 0.98;
		
		velocity.force = new THREE.Vector3();
		velocity.damping = new THREE.Vector3().addScalar( parameters.damping );
		velocity.offset = new THREE.Vector3();
		velocity.moving = false;
		
		return velocity;
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
	
	function offset_by_length_in_local_direction ( mesh, localDirection, length ) {
		
		var offset = new THREE.Vector3( length, length, length ),
			maxDim,
			localDirection,
			uV33 = utilVec33,
			uQ4 = utilQ4;
		
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
			uV33 = utilVec33,
			uQ4 = utilQ4;
		
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
			uv31 = utilVec31, uv32 = utilVec32,
			uq1 = utilQ1, uq2 = utilQ2, uq3 = utilQ3,
			lerpDelta = 0.1,
			rigidBody,
			mesh,
			collider,
			position,
			rotation,
			rotationHelper,
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
		
		// update links
		
		for ( i = 0, l = links.length; i < l; i += 1 ) {
			
			rigidBody = links[ i ];
			
			// is movable
			
			if ( rigidBody.movable === true ) {
				
				// localize basics
				
				mesh = rigidBody.mesh;
				
				collider = rigidBody.collider;
				
				position = mesh.position;
				
				rotation = ( mesh.useQuaternion === true ? mesh.quaternion : mesh.matrix );
				
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
				
				gravDown = axisUp.clone().negate();//gravUp.clone().negate();//
				
				// handle movement velocity
				
				handle_velocity( rigidBody, velocityMovement );
				
				// ray cast in the direction of gravity
				
				collisionGravity = raycast_in_direction( rigidBody, gravDown );
				
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
					
					// rotation change
					
					upToUpNewQ = uq3.setFromAxisAngle( upToUpNewAxis, upToUpNewAngle );
					
					// add to rotation
					
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
					
					// store new axes
					
					THREE.Vector3.nlerp( axisUp, axisUpNew, axisUp, lerpDelta );
					//axisUp.copy( axisUpNew );
					
					// necessary?
					//
					//
					//
					
					upToUpNewQ.multiplyVector3( axisForward );
					
					upToUpNewQ.multiplyVector3( axisRight );
					
				}
				
				// add non rotated gravity to gravity velocity
				
				velocityGravity.force.addSelf( gravMag );
				
				// handle gravity velocity
				
				handle_velocity( rigidBody, velocityGravity, collisionGravity );
				
			}
			
		}
		
	}
	
	function handle_velocity ( rigidBody, velocity, collision, offset ) {
		
		var mesh = rigidBody.mesh,
			position = mesh.position,
			velocityForce = velocity.force,
			velocityForceRotated,
			velocityForceRotatedLength,
			velocityDamping = velocity.damping,
			velocityOffset = velocity.offset,
			boundingOffset,
			boundingOffsetLength,
			collision,
			collisionDist;
		
		if ( rigidBody.movable !== true || velocityForce.isZero() === true ) {
			
			velocity.moving = false;
			
			return;
			
		} 
		else {
			
			velocity.moving = true;
			
		}
		
		// rotate velocity to mesh's rotation
		
		velocityForceRotated = rotate_vector3_to_mesh_rotation( mesh, velocityForce );
		
		// get rotated length
		
		velocityForceRotatedLength = velocityForceRotated.length();
		
		// get bounding box offset
		
		boundingOffset = offset_from_dimensions_in_direction( mesh, velocityForceRotated, dimensions_from_collider_scaled( rigidBody ) );//dimensions_from_bounding_box_scaled( mesh ) );
		
		// override offset
		
		if ( typeof offset !== 'undefined' ) {
		
			velocityOffset = offset;
			
		}
		
		// rotate offset if needed
		
		if ( velocityOffset.length() > 0 ) {
			
			velocityOffset = rotate_vector3_to_mesh_rotation( mesh, velocityOffset );
			
		}
		
		// get collision
		
		if ( typeof collision === 'undefined' ) {
			
			collision = raycast_in_direction( rigidBody, velocityForceRotated, velocityOffset, ( typeof offset === 'undefined' ? true : false) );
			
		}
		
		// modify velocity based on collision distances to avoid passing through or into objects
		
		if ( collision ) {
			
			collisionDist = collision.distance;
			
			boundingOffsetLength = boundingOffset.length();
			
			// set the rotated velocity to be no more than collision distance
			
			if ( collisionDist - velocityForceRotatedLength <= boundingOffsetLength ) {
				
				var velForceScalar = ( collisionDist - boundingOffsetLength ) / velocityForceRotatedLength;
				
				velocityForceRotated.multiplyScalar( velForceScalar );
				
				// set the base velocity to 0
				
				velocityForce.set( 0, 0, 0 );
				
				velocity.moving = false;
				
			}
			
		}
		
		// add velocity to position
		
		position.addSelf( velocityForceRotated );
		
		// damp velocity
		
		velocityForce.multiplySelf( velocityDamping );
		
		// return collision from ray
		
		return collision;
	}
	
	function raycast_in_direction ( rigidBody, direction, offset, showLine ) {
		
		var i, l,
			mesh = rigidBody.mesh,
			position = mesh.position,
			rayPosition,
			rayDirection,
			ray,
			collisions,
			collisionPotential,
			collisionMeshRecast,
			collisionDistance = Number.MAX_VALUE,
			collision,
			intersects,
			intersect;
		
		// if velocity is empty or rigidBody is not movable
		// no need to raycast
		
		if ( rigidBody.movable !== true || direction.isZero() === true ) {
			
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
		
		// create ray
		
		ray = new THREE.Ray( rayPosition, rayDirection );
		
		// ray cast all
		
		collisions = system.rayCastAll( ray );
		
		// find nearest collision
		
		for ( i = 0, l = collisions.length; i < l; i += 1 ) {
			
			collisionPotential = collisions[ i ];
			
			// if is collider for this object, skip
			
			if ( collisionPotential.mesh === rigidBody.mesh ) {
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
		
		//collision = system.rayCastNearest( ray );
		//intersects = ray.intersectScene( game.scene );
		//console.log('intersects.length: ' + intersects.length);
		if ( intersects && intersects.length && intersects.length > 0 ) {
			
			// loop through intersects for first object that is not self
			
			for ( i = 0, l = intersects.length; i < l; i += 1 ) {
				
				intersect = intersects[ i ];
				
				if ( intersect.object !== mesh ) {
					
					// store as collision
					
					collision = intersect;
					
					break;
					
				}
				else {
					continue;
				}
				
			}
			
		}
		
		// test
		
		if ( showLine === true ) {
			
			if ( collision ) {
				
				console.log( 'collision with object at distance ' + collision.distance );
				
				var ls4 = rayDirection.clone().addSelf( rayPosition );
				var le4 = rayDirection.clone().multiplyScalar( collision.distance ).addSelf( rayPosition );
				
			}
			else {
				console.log('no collisions');
				
				var ls4 = rayDirection.clone().addSelf( rayPosition );
				var le4 = rayDirection.clone().multiplyScalar( 100 ).addSelf( rayPosition );
				
			}
			
			line4.geometry.vertices[0].position = ls4;
			line4.geometry.vertices[1].position = le4;
			line4.geometry.__dirtyVertices = true;
			line4.geometry.__dirtyElements = true;
		
		}
		
		return collision;
		
	}
	
	return main;
	
}(KAIOPUA || {}));