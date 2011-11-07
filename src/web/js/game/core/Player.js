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
		utilVec31,
		utilQ1,
		utilQ2,
		utilQ3,
		line1,
		line2,
		line3;
	
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
			
			// utility objects
			
			utilVec31 = new THREE.Vector3();
			utilQ1 = new THREE.Quaternion();
			utilQ2 = new THREE.Quaternion();
			utilQ3 = new THREE.Quaternion();
			
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
			baseRotation: new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI ),
			quaternionLast: new THREE.Quaternion(),
			offset: {
				pos: new THREE.Vector3( 0, 0, 1000 ),
				rot: new THREE.Vector3( 60, 0, 0 )
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
		
		kbMap[ '27' /*escape*/ ] = {
			keyup: function () { console.log('key up: escape'); }
		};
		
		kbMap[ '32' /*space*/ ] = {
			keydown: function () { characterMove( 'up' ); },
			keyup: function () { characterMove( 'up', true ); }
		};
		
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
		
		playerCharacter.model.mesh.position.set( 1, 3000, 1 );
		
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
				speed: 0.25,
				vector: new THREE.Vector3()
			},
			rotate: {
				speed: 0.01,
				vector: new THREE.Vector3(),
				update: new THREE.Quaternion(),
			},
			jump: {
				speedStart: 4,
				speedEnd: 0,
				jumping: false,
				updatesActive: 0,
				updatesActiveMax: 30
			}
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
		
		var baseRotation = cameraFollowSettings.baseRotation,
			offset = cameraFollowSettings.offset,
			srcOffsetPos = offset.pos,
			srcOffsetRot = offset.rot,
			clamps = cameraFollowSettings.clamps,
			pcMesh = playerCharacter.model.mesh,
			pcQ = pcMesh.quaternion,
			pcQLast = cameraFollowSettings.quaternionLast,
			camQ = camera.quaternion,
			camOffsetPos = utilVec31,
			camOffsetRot = utilQ1,
			camOffsetRotHalf = utilQ2;
		
		// set offset base position
		
		camPosNew = pcMesh.position.clone();
		camOffsetPos.set( srcOffsetPos.x, srcOffsetPos.y, srcOffsetPos.z );
		
		// set offset rotation
		
		camOffsetRot.setFromEuler( srcOffsetRot ).normalize();
		camOffsetRotHalf.set( camOffsetRot.x * 0.5, camOffsetRot.y * 0.5, camOffsetRot.z * 0.5, camOffsetRot.w).normalize();
		
		// create new camera offset position
		
		baseRotation.multiplyVector3( camOffsetPos );
		
		camOffsetRot.multiplyVector3( camOffsetPos );
		
		pcQ.multiplyVector3( camOffsetPos );
		
		// set new camera position
		
		camera.position.copy( pcMesh.position ).addSelf( camOffsetPos );
		
		// set new camera rotation
		
		//pcQLast = THREE.Quaternion.slerp( pcQLast, pcQ, new THREE.Quaternion(), 0.1 );
		
		camQ.copy( pcQ ).multiplySelf( camOffsetRot ).multiplySelf( baseRotation );
		
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
			mesh = model.mesh,
			meshQ = mesh.quaternion,
			movement = pc.movement,
			move = movement.move,
			moveVec = move.vector,
			moveSpeed = move.speed,
			moveActual = moveVec.clone().multiplyScalar( moveSpeed ),
			jump = movement.jump,
			jumpSpeedA,
			jumpSpeedZ,
			jumpTimeLast,
			jumpTimeMax,
			rotate = movement.rotate,
			rotateVec = rotate.vector,
			rotateUpdate = rotate.update,
			rotateSpeed = rotate.speed,
			rigidBody = model.rigidBody,
			velocityMovement = rigidBody.velocityMovement,
			velocityMovementForce = velocityMovement.force;
		
		// handle jumping
		
		if ( jump.jumping === true ) {
		
			/*
			jump: {
				speedStart: 4,
				speedEnd: 0,
				jumping: false,
				updatesActive: 0,
				updatesActiveMax: 30
			}
			*/

			jump = movement.jump;
			jumpSpeedA = jump.speedStart;
			jumpSpeedZ = jump.speedEnd;
			jumpTimeLast = jump.timeLast;
			jumpTimeMax = jump.timeMax;
		
		}
		
		// add move vec to rigidBody movement
		
		velocityMovementForce.addSelf( moveActual );
		
		// rotate self
		
		rotateUpdate.set( rotateVec.x * rotateSpeed, rotateVec.y * rotateSpeed, rotateVec.z * rotateSpeed, 1 ).normalize();
		
		utilQ1.multiply( meshQ, rotateUpdate );
		
		meshQ.copy( utilQ1 );
		
		// line testing
		
		var position = model.mesh.position;
		var axes = rigidBody.axes;
		var up = axes.up;
		var forward = new THREE.Vector3( 0, 0, 1 );//axes.forward;
		var right = new THREE.Vector3( -1, 0, 0 );//axes.right;
		
		meshQ.multiplyVector3( forward );
		meshQ.multiplyVector3( right );
		
		// forward
		
		var lineStart = forward.clone().addSelf( position );
		var lineEnd = forward.clone().multiplyScalar( 100 ).addSelf( position );
		
		line1.geometry.vertices[0].position = lineStart;
		line1.geometry.vertices[1].position = lineEnd;
		line1.geometry.__dirtyVertices = true;
		line1.geometry.__dirtyElements = true;
		
		// right
		
		var ls2 = right.clone().addSelf( position );
		var le2 = right.clone().multiplyScalar( 100 ).addSelf( position );
		
		line2.geometry.vertices[0].position = ls2;
		line2.geometry.vertices[1].position = le2;
		line2.geometry.__dirtyVertices = true;
		line2.geometry.__dirtyElements = true;
		
		// up
		
		var ls3 = up.clone().addSelf( position );
		var le3 = up.clone().multiplyScalar( 100 ).addSelf( position );
		
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
		
		moveV.x = ( state.left - state.right );
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
		
		scene.add( playerCharacter.model.mesh );
		
		physics.add( playerCharacter.model.mesh, { rigidBody: playerCharacter.model.rigidBody } );
		
	}
	
	function hide () {
		
		scene.remove( playerCharacter.model.mesh );
		
		physics.remove( playerCharacter.model.rigidBody );
		
	}
	
	function update () {
		
		// character
		
		update_character();
		
		// camera
		
		update_camera();
		
	}
	
	return main;
	
}(KAIOPUA || {}));