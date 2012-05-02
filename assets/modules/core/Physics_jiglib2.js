/*
Physics.js
Physics module, handles physics in game using JigLibJS.
*/
(function (main) {
    
    var shared = main.shared = main.shared || {},
        assetPath = "assets/modules/core/Physics.js",
		physics = {},
		mathhelper,
		ready = false,
		system,
		gravitySource,
		gravityMagnitude,
		rigidBodyBaseName = 'rigidBody_',
		rigidBodyCount = 0,
		rigidBodies = [],
		scaleSpeedExp = Math.log( 1.5 ),
		utilMat41Convert,
		utilVec31Convert,
		utilMat41Integrate,
		utilVec31Integrate,
		utilVec32Integrate,
		utilVec33Integrate,
		utilQ1Integrate,
		utilQ2Integrate,
		utilQ3Integrate,
		utilQ4Integrate,
		utilVec31Velocity,
		loadList = [
			"js/lib/jiglibjs2/jiglib.js",
			"js/lib/jiglibjs2/geom/glMatrix.js",
			"js/lib/jiglibjs2/geom/Vector3D.js",
			"js/lib/jiglibjs2/geom/Matrix3D.js",
			"js/lib/jiglibjs2/math/JMatrix3D.js",
			"js/lib/jiglibjs2/math/JMath3D.js",
			"js/lib/jiglibjs2/math/JNumber3D.js",
			"js/lib/jiglibjs2/cof/JConfig.js",
			"js/lib/jiglibjs2/data/CollOutData.js",
			"js/lib/jiglibjs2/data/ContactData.js",
			"js/lib/jiglibjs2/data/PlaneData.js",
			"js/lib/jiglibjs2/data/EdgeData.js",
			"js/lib/jiglibjs2/data/TerrainData.js",
			"js/lib/jiglibjs2/geometry/JAABox.js",
			"js/lib/jiglibjs2/data/OctreeCell.js",
			"js/lib/jiglibjs2/data/CollOutBodyData.js",
			"js/lib/jiglibjs2/data/TriangleVertexIndices.js",
			"js/lib/jiglibjs2/data/SpanData.js",
			"js/lib/jiglibjs2/physics/constraint/JConstraint.js",
			"js/lib/jiglibjs2/physics/constraint/JConstraintMaxDistance.js",
			"js/lib/jiglibjs2/physics/constraint/JConstraintWorldPoint.js",
			"js/lib/jiglibjs2/physics/constraint/JConstraintPoint.js",
			"js/lib/jiglibjs2/physics/MaterialProperties.js",
			"js/lib/jiglibjs2/geometry/JTriangle.js",
			"js/lib/jiglibjs2/geometry/JSegment.js",
			"js/lib/jiglibjs2/collision/CollPointInfo.js",
			"js/lib/jiglibjs2/collision/CollisionInfo.js",
			"js/lib/jiglibjs2/collision/CollDetectInfo.js",
			"js/lib/jiglibjs2/collision/CollDetectFunctor.js",
			"js/lib/jiglibjs2/collision/CollDetectBoxTerrain.js",
			"js/lib/jiglibjs2/collision/CollDetectSphereMesh.js",
			"js/lib/jiglibjs2/collision/CollDetectCapsuleBox.js",
			"js/lib/jiglibjs2/collision/CollDetectSphereCapsule.js",
			"js/lib/jiglibjs2/collision/CollDetectCapsuleTerrain.js",
			"js/lib/jiglibjs2/collision/CollDetectSphereBox.js",
			"js/lib/jiglibjs2/collision/CollDetectSphereTerrain.js",
			"js/lib/jiglibjs2/collision/CollDetectBoxBox.js",
			"js/lib/jiglibjs2/collision/CollDetectBoxMesh.js",
			"js/lib/jiglibjs2/collision/CollDetectBoxPlane.js",
			"js/lib/jiglibjs2/collision/CollDetectCapsuleCapsule.js",
			"js/lib/jiglibjs2/collision/CollDetectSphereSphere.js",
			"js/lib/jiglibjs2/collision/CollDetectSpherePlane.js",
			"js/lib/jiglibjs2/collision/CollDetectCapsulePlane.js",
			"js/lib/jiglibjs2/collision/CollisionSystemAbstract.js",
			"js/lib/jiglibjs2/collision/CollisionSystemGridEntry.js",
			"js/lib/jiglibjs2/collision/CollisionSystemGrid.js",
			"js/lib/jiglibjs2/collision/CollisionSystemBrute.js",
			"js/lib/jiglibjs2/geometry/JIndexedTriangle.js",
			"js/lib/jiglibjs2/geometry/JOctree.js",
			"js/lib/jiglibjs2/geometry/JRay.js",
			"js/lib/jiglibjs2/events/JCollisionEvent.js",
			"js/lib/jiglibjs2/physics/PhysicsController.js",
			"js/lib/jiglibjs2/physics/CachedImpulse.js",
			"js/lib/jiglibjs2/physics/HingeJoint.js",
			"js/lib/jiglibjs2/physics/BodyPair.js",
			"js/lib/jiglibjs2/physics/PhysicsState.js",
			"js/lib/jiglibjs2/physics/PhysicsSystem.js",
			"js/lib/jiglibjs2/physics/RigidBody.js",
			"js/lib/jiglibjs2/geometry/JSphere.js",
			"js/lib/jiglibjs2/geometry/JTriangleMesh.js",
			"js/lib/jiglibjs2/geometry/JPlane.js",
			"js/lib/jiglibjs2/geometry/JTerrain.js",
			"js/lib/jiglibjs2/geometry/JBox.js",
			"js/lib/jiglibjs2/geometry/JCapsule.js",
			"js/lib/jiglibjs2/vehicles/JChassis.js",
			"js/lib/jiglibjs2/vehicles/JWheel.js",
			"js/lib/jiglibjs2/vehicles/JCar.js",
		];
	
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
	
	main.asset_require( [
		"assets/modules/utils/MathHelper"
	], init_internal );
	
	function init_internal ( mh ) {
		console.log('internal physics');
		if ( ready !== true ) {
			
			mathhelper = mh;
		
			init_system();
			
			ready = true;
		
		}
		
	}
	
	function init_system() {
		
		// system
		
		system = jiglib.PhysicsSystem.getInstance();
		system.setCollisionSystem(true); // grid seems better than brute
		system.setSolverType("ACCUMULATED"); // accumulated seems better than fast or normal
		system.setGravity( init_jig_vec( new THREE.Vector3( 0, 0, 0 ) ) );
		
		set_gravity_source( new THREE.Vector3( 0, 0, 0 ) );
		set_gravity_magnitude( new THREE.Vector3( 0, -1000, 0 ) );
		
		// conversion objects
		
		utilMat41Convert = new THREE.Matrix4();
		utilVec31Convert = new THREE.Vector3();
		
		utilMat41Integrate = new THREE.Matrix4();
		utilVec31Integrate = new THREE.Vector3();
		utilVec32Integrate = new THREE.Vector3();
		utilVec33Integrate = new THREE.Vector3();
		utilQ1Integrate = new THREE.Quaternion();
		utilQ2Integrate = new THREE.Quaternion();
		utilQ3Integrate = new THREE.Quaternion();
		utilQ4Integrate = new THREE.Quaternion();
		
		utilVec31Velocity = new THREE.Vector3();
		
	}
	
	/*===================================================
    
    translate / add / remove
    
    =====================================================*/
	
	// translates a mesh + parameters into a new rigid body
	
	function translate ( mesh, parameters ) {
		
		var i, l,
			geometry,
			bbox,
			bodyType,
			rigidBody,
			movable = true,
			rotatable = true,
			width,
			height,
			depth,
			needWidth,
			needHeight,
			needDepth,
			radius,
			mass,
			restitution,
			friction,
			position,
			rotation,
			velocity,
			vertsThree,
			vertsJig,
			vertex,
			vertPos,
			facesThree,
			facesJig,
			face;
		
		geometry = parameters.geometry || mesh.geometry;
		
		// handle parameters
		
		parameters = parameters || {};
		
		bodyType = parameters.bodyType || 'box';
		
		if ( parameters.hasOwnProperty('movable') === true ) {
			
			movable = parameters.movable;
			
		}
		
		if ( parameters.hasOwnProperty('rotatable') === true ) {
			
			rotatable = parameters.rotatable;
			
		}
		
		restitution = parameters.restitution || 0.25;
		
		friction = parameters.friction || 0.9;
		
		position = init_jig_vec( parameters.position || mesh.position );
		
		rotation = init_jig_vec( parameters.rotation || ( mesh.useQuaternion === true ? mesh.quaternion : mesh.rotation ), true );
		
		velocity = init_jig_vec( parameters.velocity );
		
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
			// for some reason jig takes w = d, h = w, and d = h
			
			bboxDimensions = dimensions_from_bounding_box_scaled( mesh );
			
			if ( needWidth === true ) {
				
				width = bboxDimensions.z;//x;
				
			}
			
			if ( needHeight === true ) {
				
				height = bboxDimensions.x;//y;
			
			}
			
			if ( needDepth === true ) {
				
				depth = bboxDimensions.y;//z;
				
			}
			
		}
		
		mass = parameters.mass || width * height * depth;
		
		// create collider
		
		if ( bodyType === 'trimesh' ) {
			
			// handle vertices
			
			vertsThree = geometry.vertices;
			
			vertsJig = [];
			
			for( i = 0, l = vertsThree.length; i < l; i ++ ){
				
				vertex = vertsThree[ i ];
				
				vertsJig.push( new jiglib.Vector3D( vertex.x, vertex.y, vertex.z ) );
				
			}
			
			// handle faces
			
			facesThree = geometry.faces;
			
			facesJig = [];
			
			for( i = 0, l = facesThree.length; i < l; i ++ ){
				
				face = facesThree[ i ];
				
				facesJig.push( { i0: face.a, i1: face.b, i2: face.c } );

			}
			
			rigidBody = new jiglib.JTriangleMesh( null, parameters.trianglesPerCell, parameters.minCellSize );
			
			rigidBody.createMesh( vertsJig, facesJig );
			
		}
		else if ( bodyType === 'capsule' ) {
			
			rigidBody = new jiglib.JCapsule( null, Math.max( width, depth ), height );
			
			rotation.x += 90;
			
		}
		else if ( bodyType === 'sphere' ) {
			
			radius = Math.max( width, Math.max( height, depth ) ) * 0.5;
			
			rigidBody = new jiglib.JSphere( null, radius );
			
		}
		else if ( bodyType === 'plane' ) {
			
			rigidBody = new jiglib.JPlane( null, parameters.up || new jiglib.Vector3D( 0, 1, 0, 0 ) );
			
		}
		// default box
		else {
			
			rigidBody = new jiglib.JBox( null, width, height, depth );
			
		}
		
		// properties
		
		rigidBody.set_movable( movable );
		
		rigidBody.set_rotatableBySystem( rotatable );
		
		rigidBody.set_mass( mass );
		
		rigidBody.set_restitution( restitution );
			
		rigidBody.set_friction( friction );
		
		if ( parameters.hasOwnProperty( 'rotVelocityDamping' ) ) {
			
			rigidBody.set_rotVelocityDamping( parameters.rotVelocityDamping );
			
		}
		
		if ( parameters.hasOwnProperty( 'linVelocityDamping' ) ) {
			
			rigidBody.set_linVelocityDamping( parameters.linVelocityDamping );
			
		}
		
		rigidBody.mesh = mesh;
		//rigidBody.collider = collider;
		rigidBody.quaternion = new THREE.Quaternion();
		rigidBody.velocityMovement = generate_velocity_tracker( {
			damping: parameters.movementDamping,
			relativeToRotation: true
		} );
		rigidBody.velocityGravity = generate_velocity_tracker();
		rigidBody.axes = {
			up: shared.cardinalAxes.up.clone(),
			forward: shared.cardinalAxes.forward.clone(),
			right: shared.cardinalAxes.right.clone()
		};
		rigidBody.centerOffset = center_offset_from_bounding_box( mesh );
		
		// initial state
		
		rigidBody.moveTo( position );
		
		rigidBody.set_rotationX( rotation.x );
		rigidBody.set_rotationY( rotation.y );
		rigidBody.set_rotationZ( rotation.z );
		
		return rigidBody;
	}
	
	// adds mesh's rigid body to physics world
	// creates new rigid body if one is not passed
	
	function add ( mesh, parameters ) {
		
		var rigidBody;
		
		// parameters
		
		parameters = parameters || {};
		
		rigidBody = parameters.rigidBody || translate( mesh, parameters );
		
		rigidBody.name = parameters.name || rigidBody.name || rigidBodyBaseName + rigidBodyCount;
		
		// add to system
		
		system.addBody( rigidBody );
		
		// add to rigidBodies
		
		rigidBodyCount++;
		
		rigidBodies.push( rigidBody );
		
		return rigidBody;
		
	}
	
	// removes mesh's rigid body from physics world
	
	function remove ( meshOrBodyOrName ) {
		
		var i, l,
			rigidBody;
			
		for ( i = 0, l = rigidBodies.length; i < l; i ++ ) {
			
			rigidBody = rigidBodies[ i ];
			
			if ( rigidBody === meshOrBodyOrName || rigidBody.mesh === meshOrBodyOrName || rigidBody.name === meshOrBodyOrName ) {
				
				rigidBodies.splice( i, 1 );
				
				system.removeBody( rigidBody );
				
				break;
				
			}
			
		}
		
	}
	
	/*===================================================
    
    helper functions
    
    =====================================================*/
	
	function generate_velocity_tracker ( parameters ) {
		
		var velocity = {};
		
		// handle parameters
		
		parameters = parameters || {};
		
		// init info
		
		velocity.force = new THREE.Vector3();
		velocity.forceRotated = new THREE.Vector3();
		velocity.damping = parameters.damping;
		velocity.moving = false;
		velocity.relativeToRotation = parameters.relativeToRotation;
		
		return velocity;
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
		
		centerOffset = new THREE.Vector3( bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y, bbox.max.z - bbox.min.z ).multiplyScalar( 0.5 ).addSelf( bbox.min );
		
		return centerOffset;
		
	}
	
	function init_jig_vec ( vsource, isRotation, normalize ) {
		var vjig;
		
		if ( typeof vsource !== 'undefined' ) {
			
			if ( isRotation === true ) {
				
				vjig = three_rot_to_jig_rot( vsource );
				
			}
			else {
				
				vjig = three_vec_to_jig_vec( vsource );
				
			}
			
		}
		else {
			vjig = new jiglib.Vector3D( 0, 0, 0, 0 );
		}
		
		// normalize
		
		if ( normalize === true ) {
			
			vjig.normalize();
			
		}
		
		return vjig;
	}
	
	function three_vec_to_jig_vec ( vthree ) {
		
		return new jiglib.Vector3D( vthree.x, vthree.y, vthree.z, 0 );
		
	}
	
	function three_rot_to_jig_rot ( vthree ) {
		var vtemp = utilVec31Convert;
		
		if ( vthree.hasOwnProperty('w') ) {
			
			return three_quat_to_jig_vec3( vthree );
			
		}
		else {
			
			vtemp.copy( vthree );
			
			vtemp.multiplyScalar( 180 / Math.PI );
			
			return three_vec_to_jig_vec( vtemp );
			
		}
		
	}
	
	function three_quat_to_jig_vec3 ( qthree ) {
		var mtemp = utilMat41Convert,
			vtemp = utilVec31Convert;
		
		// translate rotation into matrix
		mtemp.identity();
		mtemp.setRotationFromQuaternion( qthree );
		
		// translate rotation into vector
		vtemp.setPositionFromMatrix( mtemp );
		vtemp.setRotationFromMatrix( mtemp );
		
		return three_rot_to_jig_rot( vtemp );
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
			refreshInterval = shared.timeDeltaExpected,
			currentInterval = timeDelta,
			timeStep;
		
		currentInterval = refreshInterval;
		
		timeStep = currentInterval / 1000;
	
		integrate( timeStep );
		
	}
	
	/*===================================================
    
    integrate functions
    
    =====================================================*/
	
	function integrate( timeStep ) {
		
		var i, l,
			um41 = utilMat41Integrate,
			uv31 = utilVec31Integrate,
			uv32 = utilVec32Integrate,
			uv33 = utilVec33Integrate,
			uq1 = utilQ1Integrate,
			uq2 = utilQ2Integrate,
			uq3 = utilQ3Integrate,
			uq4 = utilQ4Integrate,
			ca = shared.cardinalAxes,
			lerpDelta = 0.1,
			rigidBody,
			rbState,
			rbPos,
			rbOri,
			mesh,
			collider,
			position,
			centerOffset,
			rotation,
			axes,
			axisUp,
			axisUpNew,
			axisUpToUpNewDist,
			axisForward,
			axisRight,
			velocityMovement,
			gravSrc,
			gravMag,
			gravUp,
			gravDown,
			upToUpNewAngle,
			upToUpNewAxis,
			upToUpNewQ;
		
		// integrate system
		
		system.integrate( timeStep );
		
		// update links
		
		for ( i = 0, l = rigidBodies.length; i < l; i ++ ) {
			
			rigidBody = rigidBodies[ i ];
			
			// is movable
			
			if ( rigidBody._movable === true ) {
				
				// localize movable basics
				
				//collider = rigidBody.collider;
				
				mesh = rigidBody.mesh;
				
				position = mesh.position;
				
				centerOffset = rigidBody.centerOffset;
				
				rotation = ( mesh.useQuaternion === true ? mesh.quaternion : mesh.matrix );
				
				quaternion = rigidBody.quaternion;
				
				axes = rigidBody.axes;
				
				axisUp = axes.up;
				
				axisForward = axes.forward;
				
				axisRight = axes.right;
				
				// get rigid body state
				
				rbState = rigidBody.get_currentState();
				
				// set mesh position to match rigid body position
				
				rbPos = rbState.position;
				
				mesh.position.copy( rbPos ).addSelf( centerOffset );
				
				// set mesh rotation to match rigid body
				
				rbOri = rbState.orientation.get_rawData();
				
				um41.set( rbOri[0], rbOri[1], rbOri[2], rbOri[3], rbOri[4], rbOri[5], rbOri[6], rbOri[7], rbOri[8], rbOri[9], rbOri[10], rbOri[11], rbOri[12], rbOri[13], rbOri[14], rbOri[15] );
				
				if ( mesh.useQuaternion === true ) {
					
					mesh.quaternion.setFromRotationMatrix( um41 );
					
				}
				else {
					
					mesh.matrix.copy( um41 );
					
				}
				
				// get gravity information
				
				gravSrc = rigidBody.gravitySource || physics.gravitySource;
				
				gravMag = uv33.copy( rigidBody.gravityMagnitude || physics.gravityMagnitude );
				
				// get normalized up vector between character and gravity source
				
				gravUp = uv31.sub( position, gravSrc ).normalize();
				
				// negate gravity up
				
				gravDown = gravUp.clone().negate();
				
				// if mesh handles own rotation
				/*
				if ( rigidBody._rotatableBySystem !== true ) {
					
					// get new rotation based on gravity
					
					axisUpNew = gravUp;
					
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
						
						// add to rotation gravity
						
						uq1.multiply( upToUpNewQ, quaternion );
						
						_MathHelper.lerp_normalized( quaternion, uq1, lerpDelta );
						
						// lerp current rotation towards complete rotation
						
						if ( mesh.useQuaternion === true ) {
							
							// quaternion rotations
							
							uq1.multiply( upToUpNewQ, rotation );
							
							// normalized lerp to new rotation
							
							_MathHelper.lerp_normalized( rotation, uq1, lerpDelta );
							//console.log('new rotation: ' + rotation.x + '(' + uq4.x + '), ' + rotation.y + '(' + uq4.y + '), ' + rotation.z + '(' + uq4.z + '), ' + rotation.w + '(' + uq4.w + ') ' );
							// set rigid body rotation to new rotation
							
							
							// FLIP X and Z
							
							
							um41.setRotationFromQuaternion( rotation ).flattenToArray( rbOri );
						
						}
						else {
							
							// matrix rotations
							
							uq1.setFromRotationMatrix( rotation );
							
							uq2.multiply( upToUpNewQ, uq1 );
							
							rotation.setRotationFromQuaternion( uq2 );
							
							// set rigid body rotation to new rotation
							
							rotation.flattenToArray( rbOri );
							
						}
						
						// find new axes based on new rotation
						
						rotation.multiplyVector3( axisUp.copy( ca.up ) );
						
						rotation.multiplyVector3( axisForward.copy( ca.forward ) );
						
						rotation.multiplyVector3( axisRight.copy( ca.right ) );
						
					}
				
				}
				*/
				// add rotated gravity magnitude in direction of gravity to gravity force
				
				rigidBody._force.x += ( gravUp.x * gravMag.x + gravUp.x * gravMag.y + gravUp.x * gravMag.z ) * rigidBody._mass;
				rigidBody._force.y += ( gravUp.y * gravMag.x + gravUp.y * gravMag.y + gravUp.y * gravMag.z ) * rigidBody._mass;
				rigidBody._force.z += ( gravUp.z * gravMag.x + gravUp.z * gravMag.y + gravUp.z * gravMag.z ) * rigidBody._mass;
				
				//rigidBody._gravityForce = rigidBody._gravityForce.add( forceGravity.force.multiplyScalar( rigidBody._mass ) );
				
				// movement velocity
				
				velocityMovement = rigidBody.velocityMovement;
				
				handle_velocity( rigidBody, velocityMovement );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    velocity functions
    
    =====================================================*/
	
	function handle_velocity ( rigidBody, velocityInfo ) {
		
		var mesh = rigidBody.mesh,
			position = mesh.position,
			scale = mesh.scale,
			scaleExp = scaleSpeedExp,
			scaleModded = utilVec31Velocity.copy( scale ),
			velocity = velocityInfo.force,
			velocityRotated = velocityInfo.forceRotated,
			velocityDamping = velocityInfo.damping,
			relativeToRotation = velocityInfo.relativeToRotation;
		
		if ( rigidBody._movable !== true || velocity.isZero() === true ) {
			
			velocityInfo.moving = false;
			
			return;
			
		} 
		else {
			
			velocityInfo.moving = true;
			
		}
		
		// if velocity is relative to rotation of body
		
		if ( relativeToRotation === true ) {
			
			// rotate velocity to mesh's rotation
			
			velocityRotated = rotate_vector3_to_mesh_rotation( mesh, velocity, velocityRotated );
			
		}
		else {
			
			velocityRotated.copy( velocity );
			
		}
		
		// scale velocity
		
		scaleModded.x = Math.pow( scaleModded.x, scaleExp );
		scaleModded.y = Math.pow( scaleModded.y, scaleExp );
		scaleModded.z = Math.pow( scaleModded.z, scaleExp );
		
		velocityRotated.multiplySelf( scaleModded );
		
		// apply velocity to rigidBody
		
		rigidBody._currState.linVelocity.setTo( velocityRotated.x, velocityRotated.y, velocityRotated.z );
		
		// dampen velocity
		
		velocity.multiplyScalar( velocityDamping );
		
	}
	
} ( KAIOPUA ) );