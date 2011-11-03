/*
Player.js
Player module, handles player in game.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
		core = game.core = game.core || {},
		player = core.player = core.player || {},
		ready = false,
		assets,
		objectmaker,
		physics,
		world,
		scene,
		camera,
		cameraModes = {
			follow: 'follow',
			freelook: 'freelook'
		},
		cameraMode = cameraModes.follow,
		cameraFollowSettings,
		cameraFreelookControls,
		keybindings = {},
		keybindingsDefault = {},
		playerCharacter,
		line1,
		line2,
		line3,
		line4;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	player.init = init;
	player.enable = enable;
	player.disable = disable;
	player.show = show;
	player.hide = hide;
	player.allow_control = allow_control;
	player.remove_control = remove_control;
	
	// getters and setters
	Object.defineProperty(player, 'cameraMode', { 
		get : function () { return cameraMode; },
		set : set_camera_mode
	});
	
	/*===================================================
    
    external init
    
    =====================================================*/
	
	function init () {
		
		if ( ready !== true ) {
		
			// assets
			
			assets = main.utils.loader.assets;
			
			// workers
			
			objectmaker = game.workers.objectmaker;
			
			// core
			
			physics = core.physics;
			
			world = core.world;
			
			// initialization
			
			init_camera();
			
			init_keybindings();
			
			init_controls();
			
			init_character();
			
			// signals
			
			shared.signals.paused.add( pause );
			
			ready = true;
			
		}
		
	}
	
	function init_camera () {
		
		// init camera follow settings
		
		cameraFollowSettings = {
			offset: {
				pos: new THREE.Vector3( 0, -600, 1000 ),//0, 0, 250 ),
				posRotated: new THREE.Vector3(),
				rot: new THREE.Vector3( -1, 0, 0 ),//-0.2, 0, 0 ),
				rotQuaternion: new THREE.Quaternion(),
				rotHalfQuaternion: new THREE.Quaternion()
			},
			clamps: {
				minRotX: -0.4,
				maxRotX: 0.1,
				minRotY: -1,
				maxRotY: 1,
				minPosZ: -100,
				maxPosZ: 300
			}
		}
		
		// set default camera mode
		
		set_camera_mode();
		
	}
	
	function init_keybindings () {
		
		var kbMap;
		
		// init keybindings
		
		kbMap = keybindingsDefault;
		
		// default keybindings
		
		// mouse buttons
		
		kbMap[ 'clickleft' ] = {
			mousedown: function () { 
				console.log('key down: clickleft');
			},
			mouseup: function () { console.log('key up: clickleft'); }
		};
		kbMap[ 'clickmiddle' ] = {
			mousedown: function () { console.log('key down: clickmiddle'); },
			mouseup: function () { console.log('key up: clickmiddle'); }
		};
		kbMap[ 'clickright' ] = {
			mousedown: function () { console.log('key down: clickright'); },
			mouseup: function () { console.log('key up: clickright'); }
		};
		
		// wasd / uldr
		
		kbMap[ '38' /*up*/ ] = kbMap[ '87' /*w*/ ] = kbMap[ 'w' ] = {
			keydown: function () { characterMove( 'forward' ); },
			keyup: function () { characterMove( 'forward', true ); }
		};
		
		kbMap[ '40' /*down*/ ] = kbMap[ '83' /*s*/ ] = kbMap[ 's' ] = {
			keydown: function () { characterMove( 'back' ); },
			keyup: function () { characterMove( 'back', true ); }
		};
		
		kbMap[ '37' /*left*/ ] = kbMap[ '65' /*a*/ ] = kbMap[ 'a' ] = {
			keydown: function () { characterMove( 'turnLeft' ); },
			keyup: function () { characterMove( 'turnLeft', true ); }
		};
		
		kbMap[ '39' /*right*/ ] = kbMap[ '68' /*d*/ ] = kbMap[ 'd' ] = {
			keydown: function () { characterMove( 'turnRight' ); },
			keyup: function () { characterMove( 'turnRight', true ); }
		};
		
		// qe
		
		kbMap[ '81' /*q*/ ] = kbMap[ 'q' ] = {
			keydown: function () { characterMove( 'left' ); },
			keyup: function () { characterMove( 'left', true ); }
		};
		
		kbMap[ '69' /*e*/ ] = kbMap[ 'e' ] = {
			keydown: function () { characterMove( 'right' ); },
			keyup: function () { characterMove( 'right', true ); }
		};
		
		// numbers
		
		kbMap[ '49' /*1*/ ] = kbMap[ '1' ] = {
			keyup: function () { console.log('key up: 1'); }
		};
		kbMap[ '50' /*2*/ ] = kbMap[ '2' ] = {
			keyup: function () { console.log('key up: 2'); }
		};
		kbMap[ '51' /*3*/ ] = kbMap[ '3' ] = {
			keyup: function () { console.log('key up: 3'); }
		};
		kbMap[ '52' /*4*/ ] = kbMap[ '4' ] = {
			keyup: function () { console.log('key up: 4'); }
		};
		kbMap[ '53' /*5*/ ] = kbMap[ '5' ] = {
			keyup: function () { console.log('key up: 5'); }
		};
		kbMap[ '54' /*6*/ ] = kbMap[ '6' ] = {
			keyup: function () { console.log('key up: 6'); }
		};
		
		// misc
		
		kbMap[ '82' /*r*/ ] = kbMap[ 'r' ] = {
			keyup: function () { console.log('key up: r'); }
		};
		
		kbMap[ '70' /*f*/ ] = kbMap[ 'f' ] = {
			keyup: camera_toggle_free_look
		};
		
		// set default as current
		
		set_keybindings( kbMap );
		
	}
	
	function init_controls () {
		
		
		
	}
	
	function init_character () {
		
		playerCharacter = {};
		
		// model
		
		var mat = new THREE.MeshNormalMaterial();
		
		// three
		
		playerCharacter.model = objectmaker.make_model({
			geometry: assets["assets/models/Hero.js"],
			materials: mat
		});
		
		playerCharacter.model.mesh.position.set( 0, 1800, 0 );
		
		// rigidbody
		
		playerCharacter.model.rigidBody = physics.translate( playerCharacter.model.mesh, {
			bodyType: 'box',
			width: 40,
			height: 100,
			depth: 40,
			movable: true
		});
		
		// movement
		
		playerCharacter.movement = {
			move: {
				speed: 200,
				vector: new THREE.Vector3()
			},
			rotate: {
				speed: 0.01,
				vector: new THREE.Vector3(),
				update: new THREE.Quaternion(),
				record: new THREE.Quaternion(),
				up: new THREE.Vector3( 0, 1, 0 )
			},
			state: {
				up: 0, 
				down: 0, 
				left: 0, 
				right: 0, 
				forward: 0, 
				back: 0, 
				turnLeft: 0, 
				turnRight: 0
			}
		}
		
		// lines for testing
		
		var geom = new THREE.Geometry();
		geom.vertices.push( new THREE.Vertex( new THREE.Vector3(-100, 0, 0) ) );
		geom.vertices.push( new THREE.Vertex( new THREE.Vector3( 100, 0, 0) ) );
		
		var lineMat1 = new THREE.LineBasicMaterial( { color: 0xff0000, opacity: 1, linewidth: 8 } );
		
		line1 = new THREE.Line(geom, lineMat1);
		
		var geom2 = new THREE.Geometry();
		geom2.vertices.push( new THREE.Vertex( new THREE.Vector3(-100, 0, 0) ) );
		geom2.vertices.push( new THREE.Vertex( new THREE.Vector3( 100, 0, 0) ) );
		
		var lineMat2 = new THREE.LineBasicMaterial( { color: 0x00ff00, opacity: 1, linewidth: 8 } );
		
		line2 = new THREE.Line(geom2, lineMat2);
		
		var geom3 = new THREE.Geometry();
		geom3.vertices.push( new THREE.Vertex( new THREE.Vector3(-100, 0, 0) ) );
		geom3.vertices.push( new THREE.Vertex( new THREE.Vector3( 100, 0, 0) ) );
		
		var lineMat3 = new THREE.LineBasicMaterial( { color: 0x0000ff, opacity: 1, linewidth: 8 } );
		
		line3 = new THREE.Line(geom3, lineMat3);
		
		var geom4 = new THREE.Geometry();
		geom4.vertices.push( new THREE.Vertex( new THREE.Vector3(-100, 0, 0) ) );
		geom4.vertices.push( new THREE.Vertex( new THREE.Vector3( 100, 0, 0) ) );
		
		var lineMat4 = new THREE.LineBasicMaterial( { color: 0xff00ff, opacity: 1, linewidth: 8 } );
		
		line4 = new THREE.Line(geom4, lineMat4);
		
	}
	
	/*===================================================
    
    camera
    
    =====================================================*/
	
	function set_camera_mode ( modeType ) {
		
		var cameraRot = new THREE.Quaternion();
		
		// update camera
		
		camera = game.camera;
		
		cameraRot.setFromRotationMatrix( camera.matrix );
		
		camera.useQuaternion = true;
		camera.quaternion = cameraRot;
		
		// set mode
		
		cameraMode = modeType;
		
		if ( modeType === cameraModes.freelook ) {
			
			remove_control();
			
			if ( typeof cameraFreelookControls === 'undefined' ) {
				
				cameraFreelookControls = new THREE.FlyControls( camera );
				cameraFreelookControls.rollSpeed = 0.5;
				cameraFreelookControls.movementSpeed = 800;
				
			}
			else {
				
				cameraFreelookControls.object = camera;
				cameraFreelookControls.moveVector.set( 0, 0, 0 );
				cameraFreelookControls.rotationVector.set( 0, 0, 0 );
				
			}
			
		}
		else {
			
			allow_control();
			
		}
		
	}
	
	function update_camera () {
		
		// update camera based on mode
		
		if ( cameraMode === cameraModes.freelook ) {
			
			camera_free_look();
			
		}
		else {
			
			camera_follow_character();
			
		}
		
	}
	
	function camera_toggle_free_look () {
		
		if ( cameraMode === cameraModes.freelook ) {
			
			set_camera_mode();
			
		}
		else {
			
			set_camera_mode( 'freelook' );
			
		}
		
	}
	
	function camera_free_look () {
		
		// update camera controls
		cameraFreelookControls.update();
		
	}
	
	function camera_follow_character () {
		
		var offset = cameraFollowSettings.offset,
			srcOffsetPos = offset.pos,
			srcOffsetRot = offset.rot,
			clamps = cameraFollowSettings.clamps,
			pcMesh = playerCharacter.model.mesh,
			pcQuaternion = pcMesh.quaternion,
			camOffsetPos = offset.posRotated,
			camOffsetRot = offset.rotQuaternion,
			camOffsetRotHalf = offset.rotHalfQuaternion;
		
		camPosNew = pcMesh.position.clone();
		camOffsetPos.set( srcOffsetPos.x, srcOffsetPos.y, srcOffsetPos.z );
		camOffsetRot.set( srcOffsetRot.x, srcOffsetRot.y, srcOffsetRot.z, 1 ).normalize();
		camOffsetRotHalf.set( camOffsetRot.x * 0.5, camOffsetRot.y * 0.5, camOffsetRot.z * 0.5, camOffsetRot.w).normalize();
		
		camOffsetRot.multiplyVector3( camOffsetPos );
		pcQuaternion.multiplyVector3( camOffsetPos );
		
		camera.position.copy( pcMesh.position ).addSelf( camOffsetPos );
		//camera.position.addSelf( camPosNew.subSelf( camera.position ).multiplyScalar( 0.1 ) );
		
		camera.quaternion.copy( pcQuaternion );
		camera.quaternion.multiplySelf( camOffsetRotHalf );
		
	}
	
	/*===================================================
    
    keybindings
    
    =====================================================*/
	
	function set_keybindings ( map ) {
		
		var key;
		
		// set all new keybindings in map
		
		for ( key in map ) {
			
			if ( map.hasOwnProperty( key ) === true ) {
				
				keybindings[ key ] = map[ key ];
				
			}
			
		}
		
	}
	
	/*===================================================
    
    controls
    
    =====================================================*/
	
	function allow_control () {
		
		// signals
		
		shared.signals.mousedown.add( onMouseClicked );
		shared.signals.mouseup.add( onMouseClicked );
		
		shared.signals.keydown.add( onKeyboardUsed );
		shared.signals.keyup.add( onKeyboardUsed );
		
	}
	
	function remove_control () {
		
		// signals
		
		shared.signals.mousedown.remove( onMouseClicked );
		shared.signals.mouseup.remove( onMouseClicked );
		
		shared.signals.keydown.remove( onKeyboardUsed );
		shared.signals.keyup.remove( onKeyboardUsed );
		
	}
	
	function onMouseClicked ( e ) {
		
		var button,
			arguments = [];
		
		switch ( e.button ) {
			
			case 2: button = 'clickright'; break;
			case 1: button = 'clickmiddle'; break;
			case 0: button = 'clickleft'; break;
			
		}
		
		triggerKey( button, e.type );
		
	}
	
	function onKeyboardUsed ( e ) {
		
		triggerKey( (e.key || e.keyCode).toString().toLowerCase(), e.type );
		
	}
	
	function triggerKey ( keyName, eventType, arguments ) {
		
		var kbMap = keybindings,
			kbInfo;
		
		if ( kbMap.hasOwnProperty( keyName ) === true ) {
			
			kbInfo = kbMap[ keyName ];
			
			if ( kbInfo.hasOwnProperty( eventType ) === true ) {
				
				kbInfo[ eventType ].apply( this, arguments );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    character
    
    =====================================================*/
	
	function update_character () {
		
		var pc = playerCharacter,
			model = pc.model,
			movement = pc.movement,
			move = movement.move,
			rotate = movement.rotate,
			state = movement.state,
			moveVec = move.vector,
			moveSpeed = move.speed,
			rotateVec = rotate.vector,
			rotateRecord = rotate.record,
			rotateUp = rotate.up,
			rotateUpdate = rotate.update,
			rotateSpeed = rotate.speed,
			pcRotQ,
			pcRotMat,
			rb = model.rigidBody,
			rbState = rb.get_currentState(),
			rbMass = rb.get_mass(),
			rbPosition = new THREE.Vector3().copy( rbState.position ),
			rbRotNew,
			linVelForce,
			gravitySource = {
				pos: new THREE.Vector3()
			},
			gravityForce = 200,//world.gravityMagnitude * rbMass,
			gravityUp,
			gravityPull,
			up = new THREE.Vector3( 0, 1, 0 ),
			down = new THREE.Vector3( 0, -1, 0 ),
			forward = new THREE.Vector3( 0, 0, 1 ),
			back = new THREE.Vector3( 0, 0, -1 ),
			right = new THREE.Vector3( 1, 0, 0 ),
			left = new THREE.Vector3( -1, 0, 0 ),
			upNew,
			forwardNew,
			rightNew,
			upToUpNewAxis,
			upToUpNewAngle,
			upToUpNewQ;
		
		// get normalized vector between character and gravity source
		gravityUp = new THREE.Vector3().sub( rbPosition, gravitySource.pos );
		var gupLen = gravityUp.length();
		if ( gupLen > 0 ) {
			gravityUp.divideScalar( gupLen );
		}
		//gravityUp.normalize();
		
		// get pull of gravity
		
		gravityPull = gravityUp.clone().negate();
		gravityPull.multiplyScalar( gravityForce );
		
		// commit rotation update
		
		rotateUpdate.set( rotateVec.x * rotateSpeed, rotateVec.y * rotateSpeed, rotateVec.z * rotateSpeed, 1 ).normalize();
		
		//rotateRecord.multiplySelf( rotateUpdate );
		
		// get new right / up / forward axes based on gravity
		
		/*
		
		var rayStart = new THREE.Vector3().copy( rbState.position );
		var rayDirection = new THREE.Vector3().copy( gravityUp.clone().negate() );
		
		var ray = new THREE.Ray( rayStart, rayDirection );

		var c = THREE.Collisions.rayCastNearest( ray );

		if( c ) {

			console.log("Found @ normal " + c.normal.x.toFixed(2) + " , " + c.normal.y.toFixed(2) + " , " + c.normal.z.toFixed(2) );
			
			var ls4 = ray.origin.clone().addSelf( ray.direction.clone().multiplyScalar(c.distance) );
			var le4 = ls4.clone().addSelf(c.normal.multiplyScalar(100));
			
			line4.geometry.vertices[0].position = ls4;
			line4.geometry.vertices[1].position = le4;
			line4.geometry.__dirtyVertices = true;
			line4.geometry.__dirtyElements = true;

		} else {

			console.log("No intersection");

		}
		*/
		
		upToUpNewAngle = Math.acos( Math.max( 0, Math.min( 1, rotateUp.dot( gravityUp ) ) ) );
		upToUpNewAxis = new THREE.Vector3().cross( rotateUp, gravityUp );
		var utunLen = upToUpNewAxis.length();
		if ( utunLen > 0 ) {
			upToUpNewAxis.divideScalar( utunLen );
		}
		//upToUpNewAxis.normalize();
		
		upToUpNewQ = new THREE.Quaternion();
		upToUpNewQ.setFromAxisAngle( upToUpNewAxis, upToUpNewAngle );
		upToUpNewQ.inverse();
		
		// store gravity up as rotate up
		
		rotateUp.copy( gravityUp );
		
		// add to rotation
		
		rotateRecord.multiplySelf( upToUpNewQ );
		
		var rrNew = new THREE.Quaternion();
		rrNew.multiplySelf( rotateUpdate.inverse() );
		rrNew.multiplySelf( rotateRecord );
		
		//var rrSlerp = THREE.Quaternion.slerp( rotateRecord, rrNew, new THREE.Quaternion(), 0.25 );
		//rotateRecord.copy( rrSlerp );
		
		rotateRecord.copy( rrNew );
		
		upNew = up.clone();
		
		forwardNew = forward.clone().negate();
		
		rightNew = right.clone();
		
		var rrInv = new THREE.Quaternion().copy( rotateRecord ).inverse();
		
		rrInv.multiplyVector3( upNew );
		rrInv.multiplyVector3( forwardNew );
		rrInv.multiplyVector3( rightNew );
		
		// commit final rotation
		
		//var rbQ = new THREE.Quaternion().copy( rotateRecord ).inverse();
		
		pcRotMat = new THREE.Matrix4().setRotationFromQuaternion( rotateRecord );
		
		rbRotNew = new jiglib.Matrix3D( pcRotMat.flatten() );
		
		rbState.orientation = rbRotNew;
		
		// commit movement update
		
		var moveForce = new THREE.Vector3( moveVec.x, moveVec.y, moveVec.z );
		
		moveForce.x = moveVec.z * forwardNew.x + moveVec.x * rightNew.x + moveVec.y * upNew.x;
		moveForce.y = moveVec.z * forwardNew.y + moveVec.x * rightNew.y + moveVec.y * upNew.y;
		moveForce.z = moveVec.z * forwardNew.z + moveVec.x * rightNew.z + moveVec.y * upNew.z;
	
		moveForce.multiplyScalar( 600 );//moveSpeed );// * rbMass );
		
		var forcesAll = new jiglib.Vector3D( gravityPull.x, gravityPull.y, gravityPull.z );
		forcesAll = forcesAll.add( moveForce );
		
		// apply world impulse
		rb.setLineVelocity( forcesAll );
		//rbState.linVelocity = rbState.linVelocity.add( moveForce );
		
		// apply forces
		
		//rb.applyWorldImpulse( gravityPull, gravitySource.pos, true );
		
		// line testing
		
		var lineStart = new THREE.Vector3().copy( forwardNew ).addSelf( rbPosition );
		var lineEnd = new THREE.Vector3().copy( forwardNew ).multiplyScalar( 100 ).addSelf( rbPosition );
		line1.geometry.vertices[0].position = lineStart;
		line1.geometry.vertices[1].position = lineEnd;
		line1.geometry.__dirtyVertices = true;
		line1.geometry.__dirtyElements = true;
		
		var ls2 = new THREE.Vector3().copy( rightNew ).addSelf( rbPosition );
		var le2 = new THREE.Vector3().copy( rightNew ).multiplyScalar( 100 ).addSelf( rbPosition );
		
		line2.geometry.vertices[0].position = ls2;
		line2.geometry.vertices[1].position = le2;
		line2.geometry.__dirtyVertices = true;
		line2.geometry.__dirtyElements = true;
		
		
		var ls3 = new THREE.Vector3().copy( upNew ).addSelf( rbPosition );
		var le3 = new THREE.Vector3().copy( upNew ).multiplyScalar( 100 ).addSelf( rbPosition );
		
		line3.geometry.vertices[0].position = ls3;
		line3.geometry.vertices[1].position = le3;
		line3.geometry.__dirtyVertices = true;
		line3.geometry.__dirtyElements = true;
		
	}
	
	function characterMove ( type, stop ) {
		
		var pc = playerCharacter,
			movement = pc.movement,
			move = movement.move,
			rotate = movement.rotate,
			state = movement.state,
			moveV = move.vector,
			rotateV = rotate.vector;
		
		if ( type === 'turnLeft' ) {
			
			state.turnLeft = stop === true ? 0 : 1;
			
		}
		else if ( type === 'turnRight' ) {
			
			state.turnRight = stop === true ? 0 : 1;
			
		}
		else if ( type === 'forward' ) {
			
			state.forward = stop === true ? 0 : 1;
			
		}
		else if ( type === 'back' ) {
			
			state.back = stop === true ? 0 : 1;
			
		}
		else if ( type === 'left' ) {
			
			state.left = stop === true ? 0 : 1;
			
		}
		else if ( type === 'right' ) {
			
			state.right = stop === true ? 0 : 1;
			
		}
		else if ( type === 'up' ) {
			
			state.up = stop === true ? 0 : 1;
			
		}
		
		// update vectors
		
		moveV.x = ( state.right - state.left );
		moveV.y = ( state.up - state.down );
		moveV.z = ( state.forward - state.back );
		
		rotateV.y = ( state.turnLeft - state.turnRight );
			
	}
	
	/*===================================================
    
    custom functions
    
    =====================================================*/
	
	function pause () {
		
		disable();
		
		shared.signals.resumed.add( resume );
		
	}
	
	function resume () {
		
		shared.signals.resumed.remove( resume );
		
		enable();
		
	}
	
	function enable () {
		
		shared.signals.update.add( update );
		
		allow_control();
		
	}
	
	function disable () {
		
		remove_control();
		
		shared.signals.update.remove( update );
		
	}
	
	function show () {
		
		scene = game.scene;
		
		scene.add( line1 );
		scene.add( line2 );
		scene.add( line3 );
		scene.add( line4 );
		
		scene.add( playerCharacter.model.mesh );
		
		physics.add( playerCharacter.model.mesh, { rigidBody: playerCharacter.model.rigidBody } );
		
	}
	
	function hide () {
		
		scene.remove( playerCharacter.model.mesh );
		
		physics.remove( playerCharacter.model.rigidBody );
		
	}
	
	function update () {
		
		// character
		
		//update_character();
		
		// camera
		
		update_camera();
		
	}
	
	return main;
	
}(KAIOPUA || {}));