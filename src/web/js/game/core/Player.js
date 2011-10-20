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
		playerCharacter;
	
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
				pos: new THREE.Vector3( 0, 0, 200 ),
				rot: new THREE.Quaternion( -0.1, 0.1, 0, 1 )
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
		
		kbMap[ '38' /*up*/ ] = {
			keydown: function () { console.log('key down: up'); },
			keyup: function () { console.log('key up: up'); }
		};
		kbMap[ '87' /*w*/ ] = kbMap[ 'w' ] = {
			keydown: function () { characterMove(); },
			keyup: function () { console.log('key up: w'); }
		};
		
		kbMap[ '40' /*down*/ ] = {
			keydown: function () { console.log('key down: down'); },
			keyup: function () { console.log('key up: down'); }
		};
		kbMap[ '83' /*s*/ ] = kbMap[ 's' ] = {
			keydown: function () { console.log('key down: s'); },
			keyup: function () { console.log('key up: s'); }
		};
		
		kbMap[ '37' /*left*/ ] = {
			keydown: function () { console.log('key down: left'); },
			keyup: function () { console.log('key up: left'); }
		};
		kbMap[ '65' /*a*/ ] = kbMap[ 'a' ] = {
			keydown: function () { console.log('key down: a'); },
			keyup: function () { console.log('key up: a'); }
		};
		
		kbMap[ '39' /*right*/ ] = {
			keydown: function () { console.log('key down: right'); },
			keyup: function () { console.log('key up: right'); }
		};
		kbMap[ '68' /*d*/ ] = kbMap[ 'd' ] = {
			keydown: function () { console.log('key down: d'); },
			keyup: function () { console.log('key up: d'); }
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
		
		kbMap[ '81' /*q*/ ] = kbMap[ 'q' ] = {
			keyup: function () { console.log('key up: q'); }
		};
		
		kbMap[ '69' /*e*/ ] = kbMap[ 'e' ] = {
			keyup: function () { console.log('key up: e'); }
		};
		
		kbMap[ '82' /*r*/ ] = kbMap[ 'r' ] = {
			keyup: function () { console.log('key up: r'); }
		};
		
		kbMap[ '70' /*r*/ ] = kbMap[ 'f' ] = {
			keyup: function () { console.log('key up: f'); }
		};
		
		// set default as current
		
		set_keybindings( kbMap );
		
	}
	
	function init_controls () {
		
		
		
	}
	
	function init_character () {
		
		var mat = new THREE.MeshNormalMaterial();
		
		var playerCharacterGeometry = new THREE.CubeGeometry( 50, 100, 50 );
	
		playerCharacter = objectmaker.make_model({
			geometry: playerCharacterGeometry,
			materials: mat
		});
		
		playerCharacter.mesh.position.set( 0, 1900, 0 );
	
		playerCharacter.rigidBody = physics.translate( playerCharacter.mesh, {
			bodyType: 'box',
			rotatable: false
		});
		
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
	
	function camera_free_look () {
		
		// update camera controls
		cameraFreelookControls.update();
		
	}
	
	function camera_follow_character () {
		
		var offset = cameraFollowSettings.offset,
			srcOffsetPos = offset.pos,
			srcOffsetRot = offset.rot,
			clamps = cameraFollowSettings.clamps,
			pcMesh,
			pcQuat,
			camOffsetPos,
			camOffsetRot,
			camOffsetRotHalf,
			camPosNew;
		
		pcMesh = playerCharacter.mesh;
		pcQuat = pcMesh.quaternion;
		
		camPosNew = pcMesh.position.clone();
		camOffsetPos = new THREE.Vector3( srcOffsetPos.x, srcOffsetPos.y, srcOffsetPos.z );
		camOffsetRot = new THREE.Quaternion( srcOffsetRot.x, srcOffsetRot.y, srcOffsetRot.z, srcOffsetRot.w );
		camOffsetRotHalf = new THREE.Quaternion( camOffsetRot.x * 0.5, camOffsetRot.y * 0.5, camOffsetRot.z * 0.5, camOffsetRot.w);
		
		pcQuat.multiplyVector3( camOffsetPos );
		camOffsetRot.multiplyVector3( camOffsetPos );
		
		camPosNew.addSelf( camOffsetPos );
		
		camera.position = camPosNew;
		
		camera.quaternion.copy( pcQuat );
		
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
			rb = pc.rigidBody,
			rbState = rb.get_currentState(),
			rbMass = rb.get_mass(),
			rbPos = rbState.position,
			rbRot = rbState.orientation,
			gravitySource = {
				pos: new jiglib.Vector3D()
			},
			rbToGravityV,
			gravityNew = new jiglib.Vector3D();
		
		// get normalized vector between character and gravity source
		
		rbToGravityV = gravitySource.pos.subtract( rbPos )
		//rbToGravityV.normalize();
		rbToGravityV.scaleBy( world.gravityMagnitude );
		//rbToGravityV.negate();
		
		// apply world impulse
		
		rb.applyWorldImpulse( rbToGravityV, gravitySource.pos, true );
		
	}
	
	function characterMove ( direction ) {
		
		var pc = playerCharacter,
			rb = pc.rigidBody,
			rbState = rb.get_currentState(),
			rbPos = rbState.position;
			console.log('character move');
			
			rb.setLineVelocity( new jiglib.Vector3D( 200, 0, 0 ) );
		
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
		
		scene.add( playerCharacter.mesh );
		
		physics.add( playerCharacter.mesh, { rigidBody: playerCharacter.rigidBody } );
		
	}
	
	function hide () {
		
		scene.remove( playerCharacter.mesh );
		
		physics.remove( playerCharacter.mesh, { rigidBody: playerCharacter.rigidBody } );
		
	}
	
	function update () {
		
		// camera
		
		update_camera();
		
		// character
		
		update_character();
		
	}
	
	return main;
	
}(KAIOPUA || {}));