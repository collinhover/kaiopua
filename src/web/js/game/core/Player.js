/*
Player.js
Player module, handles player in game.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
		core = game.core = game.core || {},
		player = core.player = core.player || {},
		characters = game.characters = game.characters || {},
		ready = false,
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
		utilQ1CameraFollow,
		utilQ2CameraFollow;
	
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
			
			// utility objects
			
			utilVec31 = new THREE.Vector3();
			utilQ1CameraFollow = new THREE.Quaternion();
			utilQ2CameraFollow = new THREE.Quaternion();
			
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
	
	/*===================================================
    
    camera
    
    =====================================================*/
	
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
			camOffsetRot = utilQ1CameraFollow,
			camOffsetRotHalf = utilQ2CameraFollow;
		
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
			keyup: function () { console.log('key up: q'); }
		};
		
		kbMap[ '69' /*e*/ ] = kbMap[ 'e' ] = {
			keyup: function () { console.log('key up: e'); }
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
	
	function init_controls () {
		
		
		
	}
	
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
	
	function init_character () {
		
		// create character
		
		playerCharacter = core.character.make_character( {
			
			type: characters.hero
			
		} );
		
		// testing position
		
		playerCharacter.model.mesh.position.set( 1, 3000, 1 );
		
	}
	
	function characterMove ( type, stop ) {
			
			var pc = playerCharacter,
				movement = pc.movement,
				move = movement.move,
				rotate = movement.rotate,
				state = movement.state,
				moveDir = move.direction,
				rotateDir = rotate.direction;
			
			if ( typeof stop === 'undefined' ) {
				stop = false;
			}
			
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
				
				if ( stop === true ) {
					
					movement.jump.stopped = true;
					
					state.up = 0;
					
				}
				else {
					
					state.up = 1;
					
				}
				
			}
			
			// update vectors with state
			
			moveDir.x = ( state.left - state.right );
			moveDir.z = ( state.forward - state.back );
			
			rotateDir.y = ( state.turnLeft - state.turnRight );
				
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
		
		scene.add( playerCharacter.model.mesh );
		
		physics.add( playerCharacter.model.mesh, { rigidBody: playerCharacter.model.rigidBody } );
		
	}
	
	function hide () {
		
		scene.remove( playerCharacter.model.mesh );
		
		physics.remove( playerCharacter.model.rigidBody );
		
	}
	
	function update ( timeDelta ) {
		
		// character
		
		playerCharacter.update( timeDelta );
		
		// camera
		
		update_camera();
		
	}
	
	return main;
	
}(KAIOPUA || {}));