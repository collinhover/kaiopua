/*
 *
 * Player.js
 * Centralizes all player related functionality.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/core/Player.js",
        _Player = {},
		_Game,
		_CameraControls,
		_Hero,
		_Messenger,
		_ObjectHelper,
		_MathHelper,
		ready = false,
		enabled = false,
		showing = false,
		eventHandles = {},
		cameraControls,
		actionsMap,
		keybindings,
		keybindingsDefault,
		character,
		following = [],
		selecting = {},
		eventHandles = {};
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	_Player.enable = enable;
	_Player.disable = disable;
	_Player.show = show;
	_Player.hide = hide;
	_Player.allow_control = allow_control;
	_Player.remove_control = remove_control;
	_Player.select_from_mouse_position = select_from_mouse_position;
	_Player.deselect = deselect;
	
	// getters and setters
	
	Object.defineProperty(_Player, 'enabled', { 
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
	
	Object.defineProperty(_Player, 'cameraControls', { 
		get : function () { return cameraControls; }
	});
	
	Object.defineProperty(_Player, 'camera', { 
		get : function () { return cameraControls.camera; }
	});
	
	Object.defineProperty(_Player, 'character', { 
		get : function () { return character; }
	});
	
	Object.defineProperty(_Player, 'scene', { 
		get : function () { return character.scene; }
	});
	
	Object.defineProperty(_Player, 'moving', { 
		get : function () { return character.movement.state.moving; }
	});
	
	main.asset_register( assetPath, { 
		data: _Player,
		requirements: [
			"assets/modules/core/Game.js",
			"assets/modules/core/CameraControls.js",
			"assets/modules/characters/Hero.js",
			"assets/modules/ui/Messenger.js",
			"assets/modules/utils/ObjectHelper.js",
			"assets/modules/utils/MathHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    external init
    
    =====================================================*/
	
	function init_internal ( g, cc, h, msg, oh, mh ) {
		console.log('internal player');
		
		if ( ready !== true ) {
			
			// assets
			
			_Game = g;
			_CameraControls = cc;
			_Hero = h;
			_Messenger = msg;
			_ObjectHelper = oh;
			_MathHelper = mh;
			
			// selecting
			
			selecting.opacityMin = 0.2;
			selecting.opacityMax = 0.6;
			selecting.opacityStart = selecting.opacityMin;
			selecting.opacityTarget = selecting.opacityMax;
			selecting.opacityCycleTime = 0;
			selecting.opacityCycleTimeMax = 500;
			
			selecting.material = new THREE.MeshBasicMaterial( { color: 0xffffff, transparent: true, opacity: selecting.opacityStart, blending: THREE.AdditiveAlphaBlending } );
			
			// initialization
			
			init_cameracontrols();
			
			init_character();
			
			init_keybindings();
			
			init_controls();
			
			// events
			
			eventHandles[ 'Game.pause' ] = dojo.subscribe( 'Game.pause', pause );
			
			ready = true;
			
		}
		
	}
	
	/*===================================================
    
    camera
    
    =====================================================*/
	
	function init_cameracontrols () {
		
		cameraControls = new _CameraControls.Instance( _Player, _Game.camera );
		
	}
    
    /*===================================================
    
    character
    
    =====================================================*/
	
	function init_character () {
		
		// create character
		
		character = new _Hero.Instance();
		
		// add handler for physics safety net
		
		if ( character.rigidBody ) {
			
			dojo.subscribe( character.rigidBody.id + '.RigidBody.safetyNetStart', this, character_on_safety_net );
			
		}
		
	}
	
	function character_on_safety_net () {
		
		_Messenger.show_message( { 
			image: shared.pathToIcons + 'alertcircle_64.png',
			title: "Well, this is embarrassing!",
			body: "Our physics broke, but we'll do our best to drop you off at your last safe location.",
			priority: true,
			confirmRequired: true,
			transitionerOpacity: 1
		} );
		
	}
	
	function character_move ( movementTypeName, stop ) {
		
		character.move_state_change( movementTypeName, stop );
		
	}
	
	/*===================================================
    
    keybindings
    
    =====================================================*/
	
	function init_keybindings () {
		
		var map = keybindingsDefault = {};
		
		// default keybindings
		
		// mouse buttons
		
		map[ 'mouseleft' ] = {
			keypress: function ( e ) {
				
				// modify character action if started
				
				character.action( '001', { event: e, stop: !enabled } );
				
				// start rotating camera if character is not acting
				
				if ( character.get_is_performing_action( '001' ) !== true ) {
					
					cameraControls.rotate( e );
					
				}
				
			},
			keyup: function ( e ) {
				
				var rotated = cameraControls.rotating;
				
				// stop camera rotate
				
				cameraControls.rotate( e, true );
				
				// start character action if camera was not just rotated
				
				if ( rotated !== true ) {
					
					character.action( '002', { event: e, stop: !enabled } );
					
				}
				
			}
		};
		map[ 'mousemiddle' ] = {
			keypress: function ( e ) { console.log('key down: mousemiddle'); },
			keyup: function ( e ) { console.log('key up: mousemiddle'); }
		};
		map[ 'mouseright' ] = {
			keypress: function ( e ) { cameraControls.rotate( e ); },
			keyup: function ( e ) {
				
				var rotated = cameraControls.rotating;
				
				// stop camera rotate
				
				cameraControls.rotate( e, true );
				
				// stop character action if camera was not just rotated
				
				if ( rotated !== true ) {
					
					character.action( '001', { event: e, stop: true } );
					character.action( '002', { event: e, stop: true } );
					
				}
			}
		};
		map[ 'mousewheel' ] = {
			keyup: function ( e ) { cameraControls.zoom( e ); }
		};
		
		// wasd / uldr
		
		map[ '38' /*up*/ ] = map[ '87' /*w*/ ] = map[ 'w' ] = {
			keypress: function () { character_move( 'forward' ); },
			keyup: function () { character_move( 'forward', true ); }
		};
		
		map[ '40' /*down*/ ] = map[ '83' /*s*/ ] = map[ 's' ] = {
			keypress: function () { character_move( 'back' ); },
			keyup: function () { character_move( 'back', true ); }
		};
		
		map[ '37' /*left*/ ] = map[ '65' /*a*/ ] = map[ 'a' ] = {
			keypress: function () { character_move( 'turnleft' ); },
			keyup: function () { character_move( 'turnleft', true ); }
		};
		
		map[ '39' /*right*/ ] = map[ '68' /*d*/ ] = map[ 'd' ] = {
			keypress: function () { character_move( 'turnright' ); },
			keyup: function () { character_move( 'turnright', true ); }
		};
		
		// qe
		
		map[ '81' /*q*/ ] = map[ 'q' ] = {
			keyup: function () { console.log('key up: q'); }
		};
		
		map[ '69' /*e*/ ] = map[ 'e' ] = {
			keyup: function () { console.log('key up: e'); }
		};
		
		// numbers
		
		map[ '49' /*1*/ ] = map[ '1' ] = {
			keyup: function () { console.log('key up: 1'); }
		};
		map[ '50' /*2*/ ] = map[ '2' ] = {
			keyup: function () { console.log('key up: 2'); }
		};
		map[ '51' /*3*/ ] = map[ '3' ] = {
			keyup: function () { console.log('key up: 3'); }
		};
		map[ '52' /*4*/ ] = map[ '4' ] = {
			keyup: function () { console.log('key up: 4'); }
		};
		map[ '53' /*5*/ ] = map[ '5' ] = {
			keyup: function () { console.log('key up: 5'); }
		};
		map[ '54' /*6*/ ] = map[ '6' ] = {
			keyup: function () { console.log('key up: 6'); }
		};
		
		// misc
		
		map[ '27' /*escape*/ ] = {
			keyup: function () {
				
				if ( _Game.paused === true ) {
					_Game.resume();
				}
				else {
					_Game.pause();
				}
			
			}
		};
		
		map[ '32' /*space*/ ] = {
			keypress: function () { character_move( 'up' ); },
			keyup: function () { character_move( 'up', true ); }
		};
		
		map[ '82' /*r*/ ] = map[ 'r' ] = {
			keypress: function () { console.log('key down: r'); },
			keyup: function () { console.log('key up: r'); }
		};
		
		map[ '70' /*f*/ ] = map[ 'f' ] = {
			keyup: function () { console.log('key up: f'); }
		};
		
		// set list of keys that are always available
		
		map.alwaysAvailable = ['27'];
		
		// set default as current
		
		set_keybindings( map );
		
	}
	
	function set_keybindings ( map ) {
		
		var key;
		
		// reset keybindings
		
		keybindings = {};
		
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
		
		// events
		
		eventHandles[ 'onkeypress' ] = dojo.connect( window, 'onkeypress', on_keyboard_used );
		eventHandles[ 'onkeyup' ] = dojo.connect( window, 'onkeyup', on_keyboard_used );
		eventHandles[ 'oninputpress' ] = dojo.connect( window, dojo.touch.press, on_mouse_pressed );
		eventHandles[ 'oninputrelease' ] = dojo.connect( window, dojo.touch.release, on_mouse_pressed );
		eventHandles[ 'inputScroll' ] = dojo.subscribe( 'inputScroll', on_mouse_pressed );
		
	}
	
	function remove_control () {
		
		// clear keys
		
		clear_keys_active();
		
		// events
		
		dojo.disconnect( eventHandles[ 'onkeypress' ] );
		dojo.disconnect( eventHandles[ 'onkeyup' ] );
		dojo.disconnect( eventHandles[ 'oninputpress' ] );
		dojo.disconnect( eventHandles[ 'oninputrelease' ] );
		dojo.unsubscribe( eventHandles[ 'inputScroll' ] );
		
	}
	
	function on_mouse_pressed ( e ) {
		
		var i, l,
			button,
			type,
			arguments = [];
		
		if ( e && ( _Game.is_event_in_game( e ) === true || cameraControls.rotating ) ) {
			
			// handle button
			
			switch ( e.button ) {
				
				case 2: button = 'mouseright'; break;
				case 1: button = 'mousemiddle'; break;
				case 'mousewheel': button = 'mousewheel'; break;
				default: button = 'mouseleft'; break;
				
			}
			
			// handle type
			
			switch ( e.type ) {
				
				case 'mousedown': case 'touchstart': type = 'keypress'; break;
				case 'mousewheel': case 'DOMMouseScroll' : default: type = 'keyup'; break;
				
			}
			
			trigger_key( button, type, e );
			
		}
		
	}
	
	function on_keyboard_used ( e ) {
		
		trigger_key( String( e.charOrCode || e.key || e.keyCode ).toLowerCase(), e.type );
		
	}
	
	function trigger_key ( keyName, eventType, parameters ) {
		
		var kbMap = keybindings,
			kbInfo;
		
		// trigger by name
		
		if ( kbMap.hasOwnProperty( keyName ) === true && ( enabled === true || kbMap.alwaysAvailable.indexOf( keyName ) !== -1 ) ) {
			
			kbInfo = kbMap[ keyName ];
			
			if ( kbInfo.hasOwnProperty( eventType ) === true ) {
				
				if ( eventType === 'keypress' ) {
					
					kbInfo.active = true;
					
				}
				else {
					
					kbInfo.active = false;
					
				}
				
				// check arguments
				
				parameters = main.ensure_array( parameters );
				
				kbInfo[ eventType ].apply( this, parameters );
				
			}
			
		}
		
	}
	
	function clear_keys_active () {
		
		var keyName,
			kbInfo;
		
		for ( keyName in keybindings ) {
			
			kbInfo = keybindings[ keyName ];
			
			if ( kbInfo.active === true && kbInfo.hasOwnProperty( 'keyup' ) ) {
				
				kbInfo.active = false;
				kbInfo[ 'keyup' ].call( this );
				
			}
			
		}
		
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
		
		mouse = parameters.mouse = parameters.mouse || main.get_mouse( parameters );
		
		character = parameters.character || character;
		
		targetsNumMax = parameters.targetsNumMax || 1;
		
		targeting = character.targeting;
		
		targets = targeting.targets;
		
		targetsToRemove = targeting.targetsToRemove;
		
		// select
			
		selectedModel = object_under_mouse( mouse );
		
		// if a selection was made
		
		if ( typeof selectedModel !== 'undefined' && selectedModel.targetable === true ) {
			
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
				
				materialIndex = selectedMesh.material.indexOf( selecting.material );
				
				if ( materialIndex === -1 ) {
					
					selectedMesh.material.push( selecting.material );
					
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
		
		character = parameters.character || character;
		
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
			
			materialIndex = targetMesh.material.indexOf( selecting.material );
			
			if ( materialIndex !== -1 ) {
				
				targetMesh.material.splice( materialIndex, 1 );
				
			}
			*/
			
			// remove from targetsToRemove
			
			targetsToRemove.splice( i, 1 );
			
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
		
		eventHandles[ 'Game.resume' ] = dojo.subscribe( 'Game.resume', resume );
		
	}
	
	function resume () {
		
		dojo.unsubscribe( eventHandles[ 'Game.resume' ] );
		
		enable();
		
	}
	
	function enable () {
		
		if ( _Game.started === true && enabled !== true ) {
			
			enabled = true;
			
			eventHandles[ 'Game.update' ] = dojo.subscribe( 'Game.update', update );
		
		}
		
	}
	
	function disable () {
		
		// set enabled state
		
		enabled = false;
		
		// clear keys
		
		clear_keys_active();
		
		// clear character actions
		
		character.stop_action();
		
		// pause updating
		
		dojo.unsubscribe( eventHandles[ 'Game.update' ] );
		
	}
	
	function show () {
		
		if ( showing === false ) {
			
			character.show( _Game.scene );
			
			cameraControls.camera = _Game.camera;
			
			showing = true;
			
			allow_control();
			
		}
		
	}
	
	function hide () {
		
		if ( showing === true ) {
			
			remove_control();
			
			disable();
			
			character.hide();
			
			showing = false;
			
		}
		
	}
	
	function update ( timeDelta, timeDeltaMod ) {
		
		// character
		
		character.update( timeDelta, timeDeltaMod );
		
		// update camera
		
		cameraControls.update( timeDelta );
		
		// selection material
		
		update_selections( timeDelta );
		
	}
	
} ( KAIOPUA ) );