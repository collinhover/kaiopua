/*
Physics.js
Physics module, handles physics in game using JigLibJS.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        physics,
		game,
		mathhelper,
		ready = false,
		system,
		linksBaseName = 'vis_to_phys_link_',
		linksCount = 0,
		linksNames = [],
		linksMap = {},
		time,
		timeLast,
		convertMatrix4,
		convertVector3;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	physics = main.asset_register( "assets/modules/core/Physics", {} );
	
	physics.init = init;
	physics.translate = translate;
	physics.add = add;
	physics.remove = remove;
	physics.remove_by_name = remove_by_name;
	physics.start = start;
	physics.stop = stop;
	physics.update = update;
	
	// getters and setters
	
	Object.defineProperty(physics, 'gravity', { 
		get : function () { return system.get_gravity(); },
		set : set_gravity
	});
	
	Object.defineProperty(physics, 'system', { 
		get : function () { return system; }
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	main.assets_require( [
		"assets/modules/core/Game",
		"assets/modules/workers/MathHelper"
	], init );
	
	function init ( g, mh ) {
		
		if ( ready !== true ) {
			
			game = g;
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
		set_gravity( 0, -9.8, 0 );
		
		// conversion objects
		
		convertMatrix4 = new THREE.Matrix4();
		convertVector3 = new THREE.Vector3();
		
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
		
		// physics width is depth, height is width, depth is height
		// this might not be the right way to do it
		
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
		
			if ( !geometry.boundingBox || geometry.boundingBox.hasOwnProperty('length') === false ) {
				
				geometry.computeBoundingBox();
				
			}
			
			bbox = geometry.boundingBox;
			
			if ( needWidth === true ) {
				
				width = (bbox.z[1] - bbox.z[0]);
				
			}
			
			if ( needHeight === true ) {
				
				height = (bbox.x[1] - bbox.x[0]);
			
			}
			
			if ( needDepth === true ) {
				
				depth = (bbox.y[1] - bbox.y[0]);
				
			}
			
		}
		
		mass = parameters.mass || width * height * depth;
		
		// create physics object
		
		if ( bodyType === 'trimesh' ) {
			
			// handle vertices
			
			vertsThree = geometry.vertices;
			
			vertsJig = [];
			
			for( i = 0, l = vertsThree.length; i < l; i ++ ){
				
				vertex = vertsThree[ i ];
				
				vertPos = vertex.position;
				
				vertsJig.push( new jiglib.Vector3D( vertPos.x, vertPos.y, vertPos.z ) );
				
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
			
			rigidBody = new jiglib.JPlane( null, parameters.up || new jiglib.Vector3D( 0, 0, 1, 0 ) );
			
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
		
		var rigidBody,
			name;
		
		// parameters
		
		parameters = parameters || {};
		
		name = parameters.name || linksBaseName + linksCount;
		
		rigidBody = parameters.rigidBody || translate( mesh, parameters );
		
		// add to system
		
		system.addBody( rigidBody );
		
		// add to links
		
		linksCount ++;
		
		linksNames.push( name );
		
		linksMap[ name ] = { mesh: mesh, rigidBody: rigidBody };
		
		return rigidBody;
		
	}
	
	// removes mesh's rigid body from physics world
	
	function remove ( meshOrBody ) {
		
		var i, l,
			name,
			index, 
			info;
			
		for ( i = 0, l = linksNames.length; i < l; i ++ ) {
			
			name = linksNames[ i ];
			
			info = linksMap[ name ];
			
			if ( info.mesh === meshOrBody || info.rigidBody === meshOrBody ) {
				
				linksNames.splice( i, 1 );
				
				system.removeBody( info.rigidBody );
			
				delete linksMap[ name ];
				
				break;
				
			}
			
		}
		
	}
	
	function remove_by_name ( name ) {
		
		var index;
		
		index = linksNames.indexOf( name );
		
		if ( index !== -1 ) {
			
			linksNames.splice( i, 1 );
				
			system.removeBody( linksMap[ name ].rigidBody );
			
			delete linksMap[ name ];
			
		}
		
	}
	
	/*===================================================
    
    libraries translation
    
    =====================================================*/
	
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
		var vtemp = convertVector3;
		
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
		var mtemp = convertMatrix4,
			vtemp = convertVector3;
		
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
	
	function set_gravity ( vec ) {
		system.setGravity( vec );
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
		
		var i, l,
			timeDelta,
			timeStep,
			link,
			mesh,
			rigidBody,
			pbState,
			pbPos,
			pbOri,
			mtemp = convertMatrix4;
		
		// handle time
		
		timeLast = time;
		
		time = new Date().getTime();
		
		timeDelta = time - timeLast;
		
		timeStep = timeDelta / 1000;
		
		if ( timeStep > 0.05 ) {
			timeStep = 0.05;
		}
		
		// integrate system
		
		system.integrate( timeStep );
		
		// update links
		
		for ( i = 0, l = linksNames.length; i < l; i ++ ) {
			
			link = linksMap[ linksNames[ i ] ];
			
			rigidBody = link.rigidBody;
			
			mesh = link.mesh;
			
			pbState = rigidBody.get_currentState();
			
			pbPos = pbState.position;
			
			pbOri = pbState.orientation.get_rawData();
			
			mtemp.set( pbOri[0], pbOri[1], pbOri[2], pbOri[3], pbOri[4], pbOri[5], pbOri[6], pbOri[7], pbOri[8], pbOri[9], pbOri[10], pbOri[11], pbOri[12], pbOri[13], pbOri[14], pbOri[15] );
			
			mesh.position.copy( pbPos );
			
			if ( mesh.useQuaternion === true ) {
				
				mesh.quaternion.setFromRotationMatrix( mtemp );
				
			}
			else {
				
				mesh.rotation.setRotationFromMatrix( mtemp );
				
			}
			
		}
		
	}
	
	return main;
	
}(KAIOPUA || {}));