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
		enabled = false,
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
		projector,
		utilRay1Selection,
		utilVec31Selection,
		utilVec31CameraFollow,
		utilQ1CameraFollow,
		utilQ2CameraFollow,
		utilQ3CameraFollow,
		selecting;
	
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
	player.select_from_mouse_position = select_from_mouse_position;
	player.deselect = deselect;
	
	// getters and setters
	Object.defineProperty(player, 'cameraMode', { 
		get : function () { return cameraMode; },
		set : set_camera_mode
	});
	
	Object.defineProperty(player, 'enabled', { 
		get : function () { return enabled; },
		set : function ( val ) { 
			if ( val === true ) {
				enable();
			}
			else {
				disable();
			}
		}
	});
	
	/*===================================================
    
    external init
    
    =====================================================*/
	
	function init () {
		
		if ( ready !== true ) {
			
			// utility objects
			
			utilVec31CameraFollow = new THREE.Vector3();
			utilQ1CameraFollow = new THREE.Quaternion();
			utilQ2CameraFollow = new THREE.Quaternion();
			utilQ3CameraFollow = new THREE.Quaternion();
			
			utilRay1Selection = new THREE.Ray();
			utilVec31Selection = new THREE.Vector3();
			
			projector = new THREE.Projector();
			
			// selecting
			
			selecting = {};
			
			selecting.opacityMin = 0.2;
			selecting.opacityMax = 0.6;
			selecting.opacityStart = selecting.opacityMin;
			selecting.opacityTarget = selecting.opacityMax;
			selecting.opacityCycleTime = 0;
			selecting.opacityCycleTimeMax = 500;
			
			selecting.material = new THREE.MeshBasicMaterial( { color: 0xffffff, transparent: true, opacity: selecting.opacityStart, blending: THREE.AdditiveAlphaBlending } );
			
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
				pos: new THREE.Vector3( 0, 100, 300 ),//1000 ),
				rot: new THREE.Vector3( 25, 0, 0 )
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
			
			if ( ready === true ) {
				
				remove_control();
				
			}
			
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
			
			if ( ready === true ) {
				
				allow_control();
				
			}
			
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
		
		var cam = camera = game.camera,
			baseRotation = cameraFollowSettings.baseRotation,
			offset = cameraFollowSettings.offset,
			srcOffsetPos = offset.pos,
			srcOffsetRot = offset.rot,
			clamps = cameraFollowSettings.clamps,
			mesh = playerCharacter.model.mesh,
			meshScale = mesh.scale,
			meshScaleMax = Math.max( meshScale.x, meshScale.y, meshScale.z ), 
			meshQ = mesh.quaternion,
			camP = cam.position,
			camQ = cam.quaternion,
			camOffsetPos = utilVec31CameraFollow,
			camOffsetRot = utilQ1CameraFollow,
			camOffsetRotHalf = utilQ2CameraFollow;
		
		// set offset base position
		
		camOffsetPos.set( srcOffsetPos.x, srcOffsetPos.y, srcOffsetPos.z ).multiplyScalar( meshScaleMax );
		
		// set offset rotation
		
		camOffsetRot.setFromEuler( srcOffsetRot ).normalize();
		camOffsetRotHalf.set( camOffsetRot.x * 0.5, camOffsetRot.y * 0.5, camOffsetRot.z * 0.5, camOffsetRot.w).normalize();
		
		// create new camera offset position
		
		baseRotation.multiplyVector3( camOffsetPos );
		
		camOffsetRot.multiplyVector3( camOffsetPos );
		
		meshQ.multiplyVector3( camOffsetPos );
		
		// set new camera position
		
		camP.copy( mesh.position ).addSelf( camOffsetPos );
		
		// set new camera rotation
		
		camQ.copy( meshQ ).multiplySelf( camOffsetRot ).multiplySelf( baseRotation );
		
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
		
		kbMap[ 'mouseleft' ] = {
			keydown: function ( mouseIndex ) { character_action( 'ability_001_start', { mouseIndex: mouseIndex } ); },
			keyup: function ( mouseIndex ) { character_action( 'ability_001_end', { mouseIndex: mouseIndex } ); },
		};
		kbMap[ 'mousemiddle' ] = {
			keydown: function () { console.log('key down: mousemiddle'); },
			keyup: function () { console.log('key up: mousemiddle'); }
		};
		kbMap[ 'mouseright' ] = {
			keydown: function () { console.log('key down: mouseright'); },
			keyup: function () { console.log('key up: mouseright'); }
		};
		
		// wasd / uldr
		
		kbMap[ '38' /*up*/ ] = kbMap[ '87' /*w*/ ] = kbMap[ 'w' ] = {
			keydown: function () { character_move( 'forward' ); },
			keyup: function () { character_move( 'forward', true ); }
		};
		
		kbMap[ '40' /*down*/ ] = kbMap[ '83' /*s*/ ] = kbMap[ 's' ] = {
			keydown: function () { character_move( 'back' ); },
			keyup: function () { character_move( 'back', true ); }
		};
		
		kbMap[ '37' /*left*/ ] = kbMap[ '65' /*a*/ ] = kbMap[ 'a' ] = {
			keydown: function () { character_move( 'turnLeft' ); },
			keyup: function () { character_move( 'turnLeft', true ); }
		};
		
		kbMap[ '39' /*right*/ ] = kbMap[ '68' /*d*/ ] = kbMap[ 'd' ] = {
			keydown: function () { character_move( 'turnRight' ); },
			keyup: function () { character_move( 'turnRight', true ); }
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
			keydown: function () { character_move( 'up' ); },
			keyup: function () { character_move( 'up', true ); }
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
		
		shared.signals.mousedown.add( on_mouse_pressed );
		shared.signals.mouseup.add( on_mouse_pressed );
		
		shared.signals.keydown.add( on_keyboard_used );
		shared.signals.keyup.add( on_keyboard_used );
		
	}
	
	function remove_control () {
		
		// signals
		
		shared.signals.mousedown.remove( on_mouse_pressed );
		shared.signals.mouseup.remove( on_mouse_pressed );
		
		shared.signals.keydown.remove( on_keyboard_used );
		shared.signals.keyup.remove( on_keyboard_used );
		
	}
	
	function on_mouse_pressed ( e ) {
		
		var button,
			type,
			arguments = [];
		
		// handle button
		
		switch ( e.button ) {
			
			case 2: button = 'mouseright'; break;
			case 1: button = 'mousemiddle'; break;
			case 0: button = 'mouseleft'; break;
			
		}
		
		// handle type
		
		switch ( e.type ) {
			
			case 'mousedown': case 'touchstart': type = 'keydown'; break;
			case 'mouseup': case 'touchend': type = 'keyup'; break;
			
		}
		
		triggerKey( button, type, [ e.identifier ] );
		
	}
	
	function on_keyboard_used ( e ) {
		
		triggerKey( (e.key || e.keyCode).toString().toLowerCase(), e.type );
		
	}
	
	function triggerKey ( keyName, eventType, arguments ) {
		
		var kbMap = keybindings,
			kbInfo;
		
		// trigger by name
		
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
	
	function character_move ( movementTypeName, stop ) {
			
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
		
		// handle movement by type name
		
		if ( state.hasOwnProperty( movementTypeName ) ) {
			
			state[ movementTypeName ] = stop === true ? 0 : 1;
			
		}
		
		// special cases
		
		if ( movementTypeName === 'up' && stop === true ) {
			
			movement.jump.stopped = true;
			
		}
		
		// update vectors with state
		
		moveDir.x = ( state.left - state.right );
		moveDir.z = ( state.forward - state.back );
		
		rotateDir.y = ( state.turnLeft - state.turnRight );
			
	}
	
	function character_action ( actionName, parameters ) {
		
		var pc = playerCharacter;
		
		// handle action
		
		pc.action( actionName, parameters );
		
	}
	
	/*===================================================
    
    selection functions
    
    =====================================================*/
	
	function select_from_mouse_position ( parameters ) {
		
		var selectedMesh,
			selectedModel,
			targetsNum = 0,
			targetsNumMax,
			character,
			targeting,
			targets,
			targetsToRemove,
			worldParts,
			worldPartsIndex,
			materialIndex;
		
		// handle parameters
		
		parameters = parameters || {};
		
		mouse = parameters.mouse = parameters.mouse || game.get_mouse( parameters );
		
		character = parameters.character || playerCharacter;
		
		targetsNumMax = parameters.targetsNumMax || 1;
		
		targeting = character.targeting;
		
		targets = targeting.targets;
		
		targetsToRemove = targeting.targetsToRemove;
		
		// select
			
		selectedModel = find_selection( mouse );
		
		// check if selection is world
		
		worldParts = world.parts;
			
		worldPartsIndex = worldParts.indexOf( selectedModel );
		
		// if a selection was made
		
		if ( typeof selectedModel !== 'undefined' && worldPartsIndex === -1 ) {
			
			// todo
			// special selection cases
			
			// add selected to character targets
			// unless already selected, then add to removal list
			
			if ( targets.indexOf( selectedModel ) === -1 ) {
				
				// check current length of targets
				// if at or over max num targets, remove earliest
				
				if ( targets.length >= targetsNumMax ) {
					
					targetsToRemove.push( targets[ 0 ] );
					
					deselect( parameters );
					
				}
				
				targets.push( selectedModel );
				/*
				 * TODO: fix for single material case
				selectedMesh = selectedModel.mesh;
				
				materialIndex = selectedMesh.materials.indexOf( selecting.material );
				
				if ( materialIndex === -1 ) {
					
					selectedMesh.materials.push( selecting.material );
					
				}
				*/
			}
			else {
				
				targetsToRemove.push( selectedModel );
				
			}
			
			// update num targets
			
			targetsNum = targets.length;
			
			// set selected as current selection
			
			targeting.targetCurrent = selectedModel;
			
		}
		// else deselect all
		else {
			
			if ( targets.length > 0 ) {
				
				targeting.targetsToRemove = targetsToRemove.concat( targets );
				
				deselect( parameters );
				
			}
			
		}
		
		return targetsNum;
	}
	
	function deselect ( parameters ) {
		
		var i, l,
			character,
			targeting,
			targets,
			targetsToRemove,
			targetIndex,
			targetModel,
			targetMesh,
			materialIndex;
		
		// handle parameters
		
		parameters = parameters || {};
		
		character = parameters.character || playerCharacter;
		
		targeting = character.targeting;
		
		targets = targeting.targets;
		
		targetsToRemove = targeting.targetsToRemove;
		
		// for each target to remove
		
		for ( i = targetsToRemove.length - 1, l = 0; i >= l; i -= 1 ) {
			
			targetModel = targetsToRemove[ i ];
			
			targetMesh = targetModel.mesh;
			
			// find in targets and remove
			
			targetIndex = targets.indexOf( targetModel );
			
			if ( targetIndex !== -1 ) {
				
				targets.splice( targetIndex, 1 );
				
			}
			
			/* TODO: fix for no multimaterials
			// remove selecting material
			
			materialIndex = targetMesh.materials.indexOf( selecting.material );
			
			if ( materialIndex !== -1 ) {
				
				targetMesh.materials.splice( materialIndex, 1 );
				
			}
			*/
			
			// remove from targetsToRemove
			
			targetsToRemove.splice( i, 1 );
			
		}
		
	}
	
	function find_selection ( mouse ) {
		
		var ray = utilRay1Selection,
			mousePosition = utilVec31Selection,
			intersections,
			intersectedMesh;
		
		// handle mouse
		
		mouse = mouse || get_mouse();
		
		// get corrected mouse position
		
		mousePosition.x = ( mouse.x / shared.screenWidth ) * 2 - 1;
		mousePosition.y = -( mouse.y / shared.screenHeight ) * 2 + 1;
		mousePosition.z = 0.5;
		
		// unproject mouse position
		
		projector.unprojectVector( mousePosition, camera );
		
		// set ray

		ray.origin = camera.position;
		ray.direction = mousePosition.subSelf( camera.position ).normalize();
		
		// find ray intersections

		intersections = ray.intersectScene( scene );
		
		if ( intersections.length > 0 ) {
			
			intersectedMesh = intersections[ 0 ].object;
			
			return intersectedMesh.kaiopuaModel;
			
		}
		else {
			
			return;
			
		}
		
	}
	
	function update_selections ( timeDelta ) {
		
		var material = selecting.material,
			opacityMax = selecting.opacityMax,
			opacityMin = selecting.opacityMin,
			opacityStart = selecting.opacityStart,
			opacityTarget = selecting.opacityTarget,
			opacityTargetLast,
			opacityDelta = opacityTarget - opacityStart,
			opacityCycleTime,
			opacityCycleTimeMax = selecting.opacityCycleTimeMax;
		
		// update time
		
		selecting.opacityCycleTime += timeDelta;
		
		if ( selecting.opacityCycleTime >= opacityCycleTimeMax ) {
			
			material.opacity = opacityTarget;
			
			selecting.opacityCycleTime = 0;
			
			// update start and target
			
			opacityTargetLast = opacityTarget;
			
			selecting.opacityTarget = opacityStart;
			
			selecting.opacityStart = opacityTargetLast;
			
		}
		else {
		
			opacityCycleTime = selecting.opacityCycleTime;
			
			// quadratic easing
			
			opacityCycleTime /= opacityCycleTimeMax * 0.5;
			
			if ( opacityCycleTime < 1 ) {
				
				material.opacity = opacityDelta * 0.5 * opacityCycleTime * opacityCycleTime + opacityStart;
				
			}
			else {
				
				opacityCycleTime--;
				
				material.opacity = -opacityDelta * 0.5 * ( opacityCycleTime * ( opacityCycleTime - 2 ) - 1 ) + opacityStart;
				
			}
			
		}
		
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
		
		if ( enabled !== true ) {
			
			enabled = true;
			
			shared.signals.update.add( update );
			
			allow_control();
		
		}
		
	}
	
	function disable () {
		
		if ( enabled === true ) {
			
			enabled = false;
			
			remove_control();
			
			shared.signals.update.remove( update );
			
		}
	}
	
	function show () {
		
		scene = game.scene;
		
		game.add_to_scene( [ playerCharacter ], scene );
		
	}
	
	function hide () {
		
		game.remove_from_scene( [ playerCharacter ], scene );
		
	}
	
	function update ( timeDelta ) {
		
		// character
		
		playerCharacter.update( timeDelta );
		
		// camera
		
		update_camera();
		
		// selection material
		
		update_selections( timeDelta );
		
	}
	
	return main;
	
}(KAIOPUA || {}));