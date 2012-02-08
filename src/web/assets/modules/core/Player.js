/*
Player.js
Player module, handles player in game.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/core/Player",
        player = {},
		game,
		cameracontrols,
		character,
		hero,
		physics,
		world,
		objecthelper,
		mathhelper,
		ready = false,
		enabled = false,
		showing = false,
		scene,
		addOnShow = [],
		keybindings = {},
		keybindingsDefault = {},
		playerCharacter,
		playerLight,
		playerLightFollowSettings,
		following = [],
		projector,
		utilRay1Selection,
		utilVec31Selection,
		selecting;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	player.enable = enable;
	player.disable = disable;
	player.show = show;
	player.hide = hide;
	player.allow_control = allow_control;
	player.remove_control = remove_control;
	player.select_from_mouse_position = select_from_mouse_position;
	player.deselect = deselect;
	
	// getters and setters
	
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
	
	Object.defineProperty(player, 'character', { 
		get : function () { return playerCharacter; }
	});
	
	Object.defineProperty(player, 'moving', { 
		get : function () { return playerCharacter.movement.state.moving; }
	});
	
	player = main.asset_register( assetPath, player, true );
	
	/*===================================================
    
    external init
    
    =====================================================*/
	
	main.asset_require( [
		"assets/modules/core/Game",
		"assets/modules/core/CameraControls",
		"assets/modules/core/Character",
		"assets/modules/characters/Hero",
		"assets/modules/core/Physics",
		"assets/modules/core/World",
		"assets/modules/utils/ObjectHelper",
		"assets/modules/utils/MathHelper"
	], init_internal, true );
	
	function init_internal ( g, cc, c, h, physx, w, oh, mh ) {
		console.log('internal player');
		
		if ( ready !== true ) {
			
			// assets
			
			game = g;
			cameracontrols = cc;
			character = c;
			hero = h;
			physics = physx;
			world = w;
			objecthelper = oh;
			mathhelper = mh;
			
			// utility objects
			
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
			
			// initialization
			
			init_cameracontrols();
			
			init_keybindings();
			
			init_controls();
			
			init_character();
			
			// signals
			
			shared.signals.paused.add( pause );
			
			ready = true;
			
			main.asset_ready( assetPath );
			
		}
		
	}
	
	/*===================================================
    
    camera
    
    =====================================================*/
	
	function init_cameracontrols () {
		
		cameracontrols.init( player, game.camera );
		
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
			keydown: function ( e ) { cameracontrols.rotate( e ); },//character_action( 'ability_001_start', { mouseIndex: e ? e.identifier : 0 } ); },
			keyup: function ( e ) { cameracontrols.rotate( e, true ); }//character_action( 'ability_001_end', { mouseIndex: e ? e.identifier : 0 } ); }
		};
		kbMap[ 'mousemiddle' ] = {
			keydown: function ( e ) { console.log('key down: mousemiddle'); },
			keyup: function ( e ) { console.log('key up: mousemiddle'); }
		};
		kbMap[ 'mouseright' ] = {
			keydown: function ( e ) { cameracontrols.rotate( e ); },
			keyup: function ( e ) { cameracontrols.rotate( e, true ); }
		};
		kbMap[ 'mousewheel' ] = {
			keyup: function ( e ) { cameracontrols.zoom( e ); }
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
			keyup: function () { 
				
				if ( game.paused === true ) {
					game.resume();
				}
				else {
					game.pause();
				}
			
			}
		};
		
		kbMap[ '32' /*space*/ ] = {
			keydown: function () { character_move( 'up' ); },
			keyup: function () { character_move( 'up', true ); }
		};
		
		kbMap[ '82' /*r*/ ] = kbMap[ 'r' ] = {
			keyup: function () { console.log('key up: r'); }
		};
		
		kbMap[ '70' /*f*/ ] = kbMap[ 'f' ] = {
			keyup: function () { console.log('key up: f'); }
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
		
		if ( showing === true ) {
			
			// signals
			
			shared.signals.mousedown.add( on_mouse_pressed );
			shared.signals.mouseup.add( on_mouse_pressed );
			shared.signals.mousewheel.add( on_mouse_pressed );
			
			shared.signals.keydown.add( on_keyboard_used );
			shared.signals.keyup.add( on_keyboard_used );
			
		}
		
	}
	
	function remove_control () {
		
		// clear keys
		
		clear_keys_active();
		
		// signals
		
		shared.signals.mousedown.remove( on_mouse_pressed );
		shared.signals.mouseup.remove( on_mouse_pressed );
		shared.signals.mousewheel.remove( on_mouse_pressed );
		
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
			case 'mousewheel': button = 'mousewheel'; type = 'keyup'; break;
			
		}
		
		trigger_key( button, type, e );
		
	}
	
	function on_keyboard_used ( e ) {
		
		trigger_key( (e.key || e.keyCode).toString().toLowerCase(), e.type );
		
	}
	
	function trigger_key ( keyName, eventType, arguments ) {
		
		var kbMap = keybindings,
			kbInfo;
		
		// trigger by name
		
		if ( kbMap.hasOwnProperty( keyName ) === true ) {
			
			kbInfo = kbMap[ keyName ];
			
			if ( kbInfo.hasOwnProperty( eventType ) === true ) {
				
				if ( eventType === 'keydown' ) {
					
					kbInfo.active = true;
					
				}
				else {
					
					kbInfo.active = false;
					
				}
				
				// check arguments
				
				if ( typeof arguments !== 'undefined' && arguments.hasOwnProperty('length') === false ) {
					arguments = [ arguments ];
				}
				
				kbInfo[ eventType ].apply( this, arguments );
				
			}
			
		}
		
	}
	
	function clear_keys_active () {
		
		var keyName,
			kbInfo;
		
		for ( keyName in keybindings ) {
			
			kbInfo = keybindings[ keyName ];
			
			if ( kbInfo.active === true ) {
				
				trigger_key( keyName, 'keyup' );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    character
    
    =====================================================*/
	
	function init_character () {
		
		// create character
		
		playerCharacter = new character.Instance( {
			
			type: hero
			
		} );
		
		// init light to follow character
		
		playerLight = new THREE.PointLight( 0xfeb41c, 0.35, 400 );
		
		playerLightFollowSettings = {
			obj: playerLight,
			rotationBase: new THREE.Quaternion(),
			rotationOffset: new THREE.Vector3( 0, 0, 0 ),
			positionOffset: new THREE.Vector3( 0, 40, 0 )
		};
		
		following.push( playerLightFollowSettings );
		
		// add on show
		
		addOnShow.push( playerCharacter, playerLight );
		
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
		
		// set moving
				
		if ( state.forward === 1 || state.back === 1 || state.turnLeft === 1 || state.turnRight === 1 || state.up === 1 || state.down === 1 || state.left === 1 || state.right === 1 ) {
			
			state.moving = true;
			
		}
		else {
			
			state.moving = false;
			
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
		
		// if a selection was made
		
		if ( typeof selectedModel !== 'undefined' ) {
			
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
			
			targetMesh = targetModel;//.mesh;
			
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
			camera = cameracontrols.camera,
			intersections,
			intersectedMesh,
			intersectedModel;
		
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
			
			intersectedModel = intersectedMesh.kaiopuaModel;
			
			if ( typeof intersectedModel !== 'undefined' && intersectedModel.targetable === true ) {
			
				return intersectedModel;
				
			}
			
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
    
    following
    
    =====================================================*/
	
	function update_following () {
		
		var i, l,
			followSettings;
		
		for ( i = 0, l = following.length; i < l; i ++ ) {
			
			followSettings = following[ i ];
			
			objecthelper.object_follow_object( playerCharacter, followSettings.obj, followSettings.rotationBase, followSettings.rotationOffset, followSettings.positionOffset );
				
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
		
		if ( game.started === true && enabled !== true ) {
			
			enabled = true;
			
			shared.signals.update.add( update );
			
			allow_control();
		
		}
		
	}
	
	function disable () {
		
		enabled = false;
		
		remove_control();
		
		shared.signals.update.remove( update );
		
	}
	
	function show () {
		
		if ( showing === false ) {
			
			scene = game.scene;
			
			game.add_to_scene( addOnShow, scene );
			
			showing = true;
			
		}
		
	}
	
	function hide () {
		
		if ( showing === true ) {
		
			game.remove_from_scene( addOnShow, scene );
			
			showing = false;
			
		}
		
	}
	
	function update ( timeDelta ) {
		
		// character
		
		playerCharacter.update( timeDelta );
		
		// update camera
		
		cameracontrols.update( timeDelta );
		
		// items that follow character
		
		update_following();
		
		// selection material
		
		update_selections( timeDelta );
		
	}
	
	return main;
	
} ( KAIOPUA ) );