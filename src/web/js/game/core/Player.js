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
		scene,
		camera,
		cameraModes = {
			follow: 'follow',
			freelook: 'freelook'
		},
		cameraMode = cameraModes.follow,
		cameraControls,
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
			
			// initialization
			
			init_camera();
			
			init_keybindings();
			
			init_controls();
			
			init_character();
			
			init_signals();
			
			ready = true;
			
		}
		
	}
	
	function init_camera () {
		
		set_camera_mode();
		
	}
	
	function init_keybindings () {
		
		var kbMap;
		
		// init keybindings
		
		kbMap = keybindingsDefault;
		
		// default keybindings
		
		// mouse buttons
		
		kbMap[ 'clickleft' ] = {
			mousedown: function () { console.log('key down: clickleft'); },
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
	
	function init_signals () {
		
		shared.signals.resumed.add( enable );
		shared.signals.paused.add( disable );
		
	}
	
	/*===================================================
    
    camera
    
    =====================================================*/
	
	function set_camera_mode ( modeType ) {
		
		var currRot = new THREE.Quaternion();
		
		// update camera
		
		camera = game.camera;
		
		currRot.setFromRotationMatrix( camera.matrix );
		
		camera.useQuaternion = true;
		camera.quaternion = currRot;
		
		// set mode
		
		cameraMode = modeType;
		
		if ( modeType === cameraModes.freelook ) {
			
			remove_control();
			
			free_look();
			
		}
		else {
			
			allow_control();
			
		}
		
	}
	
	function free_look () {
		
		if ( typeof cameraControls === 'undefined' ) {
			
			cameraControls = new THREE.FlyControls( camera );
			cameraControls.rollSpeed = 0.5;
			cameraControls.movementSpeed = 800;
			
		}
		else {
			
			cameraControls.object = camera;
			cameraControls.moveVector.set( 0, 0, 0 );
			cameraControls.rotationVector.set( 0, 0, 0 );
			
		}
		
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
    
    character movement
    
    =====================================================*/
	
	function characterMove ( direction ) {
		
		var pc = playerCharacter,
			rb = pc.rigidBody,
			rbState = rb.get_currentState(),
			rbPos = rbState.position;
			console.log('character move');
			//rb.addWorldForce( new jiglib.Vector3D( 0, 200, 0 ), rbPos );
			rb.setLineVelocity( new jiglib.Vector3D( 0, 200, 0 ) );
		
	}
	
	/*===================================================
    
    custom functions
    
    =====================================================*/
	
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
		
		var pcMesh,
			pcQuat,
			camOffsetPos,
			camOffsetRot,
			camOffsetRotHalf,
			camPosNew;
		
		// update camera based on mode
		
		if ( cameraMode === cameraModes.freelook ) {
			
			// update camera controls
			cameraControls.update();
			
		}
		else {
			
			pcMesh = playerCharacter.mesh;
			pcQuat = pcMesh.quaternion;
			
			camPosNew = pcMesh.position.clone();
			camOffsetPos = new THREE.Vector3( 0, 0, 200 );
			camOffsetRot = new THREE.Quaternion( -0.1, 0.1, 0, 1 );
			camOffsetRotHalf = new THREE.Quaternion( camOffsetRot.x * 0.5, camOffsetRot.y * 0.5, camOffsetRot.z * 0.5, 1);
			
			pcQuat.multiplyVector3( camOffsetPos );
			camOffsetRot.multiplyVector3( camOffsetPos );
			
			camPosNew.addSelf( camOffsetPos );
			
			camera.position = camPosNew;
			
			camera.quaternion.copy( pcQuat );
			
			camera.quaternion.multiplySelf( camOffsetRotHalf );
			
		}
	
	}
	
	return main;
	
}(KAIOPUA || {}));