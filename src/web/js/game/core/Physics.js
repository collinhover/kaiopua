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
	physics.set_gravity = set_gravity;
	
	// getters and setters
	
	Object.defineProperty(physics, 'gravity', { 
		get : function () { return gravitySource; }
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
		set_gravity( new THREE.Vector3( 0, 0, 0 ), 9.8 );
		
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
			velocityLinear,
			velocityLinearDamping;
		
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
		
		// initial state
		
		velocityLinear = new THREE.Vector3();
		velocityLinearDamping = new THREE.Vector3();
		
		// create rigid body
		
		rigidBody = {
			mesh: mesh,
			collider: collider,
			movable: movable,
			mass: mass,
			velocity: {
				linear: velocityLinear,
				linearDamping: velocityLinearDamping
			}
		};
		
		// rigid body functions
		
		Object.defineProperty(rigidBody, 'velocityLinear', { 
			get : function () { return velocityLinear; },
			set : function ( vec ) {
				velocityLinear.copy( vec );
			}
		});
		
		Object.defineProperty(rigidBody, 'velocityLinearDamping', { 
			get : function () { return velocityLinearDamping; },
			set : function ( vec ) {
				velocityLinearDamping.copy( vec );
			}
		});
		
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
	
	function set_gravity ( source, magnitude ) {
		gravitySource = new THREE.Vector3( source.x, source.y, source.z );
		gravityMagnitude = magnitude || 9.8;
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
			rigidBody,
			mesh,
			collider,
			position,
			rotation,
			colMin,
			colMax,
			colDimensions,
			velocityLinear,
			velocityLinearDamping,
			gravSrc,
			gravMag,
			gravUp,
			gravDown,
			gravUpLen,
			gravPull,
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
				
				velocityLinear = rigidBody.velocityLinear;
				
				velocityLinearDamping = rigidBody.velocityLinearDamping;
				
				gravSrc = rigidBody.gravitySource || gravitySource;
				
				gravMag = rigidBody.gravityMagnitude || gravityMagnitude;
				
				// get collider width/height/depth
				// could use geometry bounding box, but what if collider is different size?
				
				/*
				if ( typeof collider.min !== 'undefined' ) {
					
					colMin = collider.min;
					colMax = collider.max;
					
				}
				else if ( typeof collider.box !== 'undefined' ) {
					
					colMin = collider.box.min;
					colMax = collider.box.max;
					
				}
				else if ( typeof collider.radiusSq !== 'undefined' ) {
					
					colMin = new THREE.Vector3();
					colMax = new THREE.Vector3().addScalar( collider.radiusSq );
					
				}
				// collider type not supported
				else {
					continue;
				}
				
				colDimensions = new THREE.Vector3().sub( colMax, colMin );
				*/
				
				// get mesh dimensions
				
				colDimensions = dimensions_from_bounding_box_scaled( mesh );
				
				// copy just half of height and add 1 to avoid ray casting to self
				
				var halfHeight = new THREE.Vector3( 0, colDimensions.y * 0.5 + 1, 0 );
				
				// rotate dimensions to mesh's rotation
				
				rotation.multiplyVector3( halfHeight );
				
				// find true bottom of mesh
				// add center offset of mesh to position
				// subtract rotated half height
				
				var centerOffset = center_offset_from_bounding_box( mesh );
				
				var positionBottom = new THREE.Vector3().copy( position ).addSelf( centerOffset ).subSelf( halfHeight );
				
				console.log( 'halfHeight dim: ' + halfHeight.x.toFixed(2) + ', ' + halfHeight.y.toFixed(2) + ', ' + halfHeight.z.toFixed(2) );
				console.log( 'position c: ' + position.x.toFixed(2) + ', ' + position.y.toFixed(2) + ', ' + position.z.toFixed(2) );
				console.log( 'position bot: ' + positionBottom.x.toFixed(2) + ', ' + positionBottom.y.toFixed(2) + ', ' + positionBottom.z.toFixed(2) );
				
				// get normalized up vector between character and gravity source
				
				gravUp = new THREE.Vector3().sub( positionBottom, gravSrc );
				gravUpLen = gravUp.length();
				if ( gravUpLen > 0 ) {
					gravUp.divideScalar( gravUpLen );
				}
				
				// negate gravity up
				
				gravDown = gravUp.clone().negate();
				
				// ray cast in the direction of gravity
				
				rayGravity = new THREE.Ray( positionBottom, gravDown );

				collisionGravity = THREE.Collisions.rayCastNearest( rayGravity );

				if( collisionGravity ) {
					
					// get pull of gravity
		
					gravPull = gravDown.clone();
					gravPull.multiplyScalar( gravMag );

					console.log("Found gravity ray collision at dist " + collisionGravity.distance + " and direction " + collisionGravity.normal.x.toFixed(2) + " , " + collisionGravity.normal.y.toFixed(2) + " , " + collisionGravity.normal.z.toFixed(2) );
					/*
					var ls4 = rayGravity.origin.clone().addSelf( rayGravity.direction.clone().multiplyScalar(collisionGravity.distance) );
					var le4 = ls4.clone().addSelf(collisionGravity.normal.multiplyScalar(100));
					
					line4.geometry.vertices[0].position = ls4;
					line4.geometry.vertices[1].position = le4;
					line4.geometry.__dirtyVertices = true;
					line4.geometry.__dirtyElements = true;
					*/

				} else {
					
					// try casting ray up instead
					// incase object has fallen through world
					
					console.log("No intersection");

				}
				
			}
			
		}
		
	}
	
	return main;
	
}(KAIOPUA || {}));