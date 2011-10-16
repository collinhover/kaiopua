/*
Physics.js
Physics module, handles physics in game using JigLibJS.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
		core = game.core = game.core || {},
		physics = core.physics = core.physics || {},
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
	
	physics.init = init;
	physics.add = add;
	physics.remove = remove;
	physics.start = start;
	physics.stop = stop;
	physics.update = update;
	
	/*===================================================
    
    external init
    
    =====================================================*/
	
	function init () {
		
		init_system();
		
	}
	
	function init_system() {
		
		// system
		
		system = jigLib.PhysicsSystem.getInstance();
		//system.setCollisionSystem(true); // collisions missing and makes rigid bodies slide?
		//system.setSolverType("FAST");
		//system.setSolverType("NORMAL");
		system.setSolverType("ACCUMULATED");
		system.setGravity( [ 0, -100, 0, 0 ] );
		
		// conversion objects
		
		convertMatrix4 = new THREE.Matrix4();
		convertVector3 = new THREE.Vector3();
		
		// signals
		
		shared.signals.paused.add( stop );
		shared.signals.resumed.add( start );
		
	}
	
	/*===================================================
    
    add / remove
    
    =====================================================*/
	
	function add ( mesh, parameters ) {
		
		var geometry = mesh.geometry,
			bboxScale,
			bbox,
			bodyType,
			rigidBody,
			movable,
			width,
			height,
			depth,
			radius,
			mass,
			restitution,
			friction,
			position,
			rotation,
			velocity,
			name;
		
		// handle parameters
		
		parameters = parameters || {};
		
		scale = parameters.scale || 1;
		
		bodyType = parameters.bodyType || 'box';
		
		movable = parameters.movable || true;
		
		mass = parameters.mass || 1;
		
		restitution = parameters.restitution || 0.25;
		
		friction = parameters.friction || 0.25;
		
		position = init_jig_vec( parameters.position, true );
		
		rotation = init_jig_vec( parameters.rotation, false, true );
		
		velocity = init_jig_vec( parameters.velocity );
		
		name = parameters.name || linksBaseName + linksCount;
		
		// model bounding box
		
		if ( !geometry.boundingBox || geometry.boundingBox.hasOwnProperty('length') === false ) {
			
			geometry.computeBoundingBox();
			
		}
		
		bbox = geometry.boundingBox;
		
		width = (bbox.x[1] - bbox.x[0]) * scale;
		height = (bbox.y[1] - bbox.y[0]) * scale;
		depth = (bbox.z[1] - bbox.z[0]) * scale;
		
		// create physics object
		
		if ( bodyType === 'trimesh' ) {
			
		}
		else if ( bodyType === 'capsule' ) {
			
			rigidBody = new jigLib.JCapsule( null, Math.max( width, depth ), height );
			
			rotation[0] += 90;
			
		}
		else if ( bodyType === 'sphere' ) {
			
			radius = Math.max( width, Math.max( height, depth ) ) * 0.5;
			
			rigidBody = new jigLib.JSphere( null, radius );
			
		}
		else if ( bodyType === 'plane' ) {
			
			rigidBody = new jigLib.JPlane( null, parameters.up );
			
		}
		// default box
		else {
			
			rigidBody = new jigLib.JBox( null, width, height, depth );
			
		}
		
		// properties
		
		rigidBody.set_movable( movable );
		
		rigidBody.set_mass( mass );
		
		rigidBody.set_restitution( restitution );
			
		rigidBody.set_friction( friction );
		
		if ( parameters.hasOwnProperty( 'rotVelocityDamping' ) ) {
			
			rigidBody.set_rotVelocityDamping( parameters.rotVelocityDamping );
			
		}
		
		if ( parameters.hasOwnProperty( 'linVelocityDamping' ) ) {
			
			rigidBody.set_linVelocityDamping( parameters.linVelocityDamping );
			
		}
		
		// add to system
		
		system.addBody( rigidBody );
		
		// initial state
		
		rigidBody.moveTo( position );
		
		rigidBody.setRotation( rotation );
		
		rigidBody.setVelocity( velocity );
		
		// add to links
		
		linksCount += 1;
		
		linksNames.push( name );
		
		linksMap[ name ] = { mesh: mesh, rigidBody: rigidBody };
		
		return name;
		
	}
	
	function remove ( name ) {
		
		var linkIndex, linkInfo;
		
		linkIndex = linksNames.indexOf( name );
		
		if ( linkIndex !== -1 ) {
			
			linksNames.splice( linkIndex, 1 );
			
			linkInfo = linksMap[ name ];
			
			system.removeBody( linkInfo.rigidBody );
		
			delete linksMap[ name ];
			
		}
		
	}
	
	/*===================================================
    
    libraries translation
    
    =====================================================*/
	
	function init_jig_vec ( vsource, isArray4, isRotation, normalize ) {
		var vjig, i, l;
		
		if ( typeof vsource !== 'undefined' ) {
			
			// vthree is object
			if ( vsource.hasOwnProperty('length') === false ) {
				
				if ( isRotation === true ) {
					
					vjig = three_rot_to_jig_rot( vsource );
					
				}
				else {
					
					vjig = three_vec_to_jig_vec3( vsource );
					
				}
			}
			// vsource is array
			else {
				vjig = vsource.slice( 0 );
			}
			
		}
		else {
			vjig = [ 0, 0, 0 ];
		}
		
		// enforce correct length
		if ( isArray4 === true ) {
			l = 4;
		}
		else {
			l = 3;
		}
		
		for ( i = vjig.length; i < l; i += 1 ) {
			vjig.push( 0 );
		}
		
		// normalize
		
		if ( normalize === true ) {
			
			jigLib.Vector3DUtil.normalize( vjig );
			
		}
		
		return vjig;
	}
	
	function three_vec_to_jig_vec3 ( vthree ) {
		
		return [ vthree.x, vthree.y, vthree.z ];
		
	}
	
	function three_vec_to_jig_vec4 ( vthree ) {
		
		return [ vthree.x, vthree.y, vthree.z, 0 ];
		
	}
	
	function three_rot_to_jig_rot ( vthree ) {
		var vtemp = convertVector3;
		
		if ( vthree.hasOwnProperty('w') ) {
			
			return three_quat_to_jig_vec3( vthree );
			
		}
		else {
			
			vtemp.copy( vthree );
			
			vtemp.multiplyScalar( 180 / Math.PI );
			
			return three_vec_to_jig_vec3( vtemp );
			
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

		if( timeStep > 0.05 ) {
			timeStep = 0.05;
		}
		
		// integrate system
		
		system.integrate( timeStep );
		
		// update links
		
		for ( i = 0, l = linksNames.length; i < l; i += 1 ) {
			
			link = linksMap[ linksNames[ i ] ];
			
			rigidBody = link.rigidBody;
			
			mesh = link.mesh;
			
			pbState = rigidBody.get_currentState();
			
			pbPos = pbState.position;
			
			pbOri = pbState.get_orientation().glmatrix;
			
			mtemp.set( pbOri[0], pbOri[1], pbOri[2], pbOri[3], pbOri[4], pbOri[5], pbOri[6], pbOri[7], pbOri[8], pbOri[9], pbOri[10], pbOri[11], pbOri[12], pbOri[13], pbOri[14], pbOri[15] );
			
			mesh.position.set( pbPos[0], pbPos[1], pbPos[2] );
			
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