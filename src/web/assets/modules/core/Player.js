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
		_KeyHelper,
		ready = false,
		enabled = false,
		showing = false,
		cameraControls,
		actionsMap,
		keybindings,
		keybindingsDefault,
		actions,
		character,
		following = [],
		selecting;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	_Player.enable = enable;
	_Player.disable = disable;
	_Player.show = show;
	_Player.hide = hide;
	_Player.allow_control = allow_control;
	_Player.remove_control = remove_control;
	_Player.select = select;
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
	
	Object.defineProperty(_Player, 'actions', { 
		get : function () { return actions; }
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
			"assets/modules/core/Actions.js",
			"assets/modules/characters/Hero.js",
			"assets/modules/ui/Messenger.js",
			"assets/modules/utils/ObjectHelper.js",
			"assets/modules/utils/MathHelper.js",
			"assets/modules/utils/KeyHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    external init
    
    =====================================================*/
	
	function init_internal ( g, cc, ac, h, msg, oh, mh, kh ) {
		console.log('internal player');
		
		if ( ready !== true ) {
			
			// assets
			
			_Game = g;
			_CameraControls = cc;
			_Actions = ac;
			_Hero = h;
			_Messenger = msg;
			_ObjectHelper = oh;
			_MathHelper = mh;
			_KeyHelper = kh;
			
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
			
			init_character();
			
			init_actions();
			
			init_keybindings();
			
			init_controls();
			
			// signals
			
			shared.signals.gamePaused.add( pause );
			
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
		
		// listen for planting puzzle changes
		
		character.planting.puzzleStarted.add( on_puzzle_started );
		character.planting.puzzleStopped.add( on_puzzle_stopped );
		
		// add handler for physics safety net
		
		if ( character.rigidBody ) {
			
			character.rigidBody.safetynetstart.add( character_on_safety_net, this );
			
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
    
    actions
    
    =====================================================*/
	
	function init_actions () {
		
		actions = new _Actions.Instance();
		
		// add actions
		
		// pointer
		
		actions.add( 'pointer', {
			callbacks: {
				drag: function ( parameters ) {
					
					// start rotating camera if character is not acting
					
					if ( character.actions.is_active( 'pointer' ) !== true ) {
						
						cameraControls.rotate( parameters.event );
						
					}
					
				},
				dragend: function ( parameters ) {
					
					// stop camera rotate
					
					cameraControls.rotate( parameters.event, true );
					
				},
				wheel: function ( parameters ) {
					
					cameraControls.zoom( parameters.event );
					
				}
			}
		} );
		
		// wasd / arrows
		
		actions.add( 'w up_arrow', {
			callbacks: {
				down: function () {
					character_move( 'forward' );
				},
				up: function () {
					character_move( 'forward', true );
				}
			}
		} );
		
		actions.add( 's down_arrow', {
			callbacks: {
				down: function () {
					character_move( 'back' );
				},
				up: function () {
					character_move( 'back', true );
				}
			}
		} );
		
		actions.add( 'a left_arrow', {
			callbacks: {
				down: function () {
					character_move( 'turnleft' );
				},
				up: function () {
					character_move( 'turnleft', true );
				}
			}
		} );
		
		actions.add( 'd right_arrow', {
			callbacks: {
				down: function () {
					character_move( 'turnright' );
				},
				up: function () {
					character_move( 'turnright', true );
				}
			}
		} );
		
		// jump
		
		actions.add( 'space', {
			callbacks: {
				down: function () {
					character_move( 'up' );
				},
				up: function () {
					character_move( 'up', true );
				}
			}
		} );
		
		// misc
		
		actions.add( 'escape', {
			callbacks: {
				up: function () {
					
					if ( _Game.paused === true ) {
						_Game.resume();
					}
					else {
						_Game.pause();
					}
					
				}
			}
		} );
		
	}
	
	/*===================================================
    
    keybindings
    
    =====================================================*/
	
	function init_keybindings () {
		
		var map = keybindingsDefault = {};
		
		// default keybindings
		
		// pointer
		
		map[ 'pointer' ] = 'pointer';
		
		// wasd / arrows
		
		map[ 'w' ] = map[ 'up_arrow' ] = 'w';
		map[ 's' ] = map[ 'down_arrow' ] = 's';
		map[ 'a' ] = map[ 'left_arrow' ] = 'a';
		map[ 'd' ] = map[ 'right_arrow' ] = 'd';
		
		// qe
		
		map[ 'q' ] = 'q';
		map[ 'e' ] = 'e';
		
		// numbers
		
		map[ '1' ] = '1';
		map[ '2' ] = '2';
		map[ '3' ] = '3';
		map[ '4' ] = '4';
		map[ '5' ] = '5';
		map[ '6' ] = '6';
		
		// misc
		
		map[ 'escape' ] = 'escape'
		map[ 'space' ] = 'space';
		
		// set list of keys that are always available
		
		map.alwaysAvailable = ['escape'];
		
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
		
		// start control immediately
		
		allow_control();
		
	}
	
	function allow_control () {
		
		// signals
		
		shared.signals.gamePointerTapped.add( trigger_key );
		shared.signals.gamePointerDoubleTapped.add( trigger_key );
		shared.signals.gamePointerHeld.add( trigger_key );
		shared.signals.gamePointerDragStarted.add( trigger_key );
		shared.signals.gamePointerDragged.add( trigger_key );
		shared.signals.gamePointerDragEnded.add( trigger_key );
		shared.signals.gamePointerWheel.add( trigger_key );
		
		shared.signals.keyPressed.add( trigger_key );
		shared.signals.keyReleased.add( trigger_key );
		
	}
	
	function remove_control () {
		
		// clear keys
		
		actions.clear_active();
		
		// signals
		
		shared.signals.gamePointerTapped.remove( trigger_key );
		shared.signals.gamePointerDoubleTapped.remove( trigger_key );
		shared.signals.gamePointerHeld.remove( trigger_key );
		shared.signals.gamePointerDragStarted.remove( trigger_key );
		shared.signals.gamePointerDragged.remove( trigger_key );
		shared.signals.gamePointerDragEnded.remove( trigger_key );
		shared.signals.gamePointerWheel.remove( trigger_key );
		
		shared.signals.keyPressed.remove( trigger_key );
		shared.signals.keyReleased.remove( trigger_key );
		
	}
	
	/*===================================================
    
    actions
    
    =====================================================*/
	
	function trigger_key ( e ) {
		
		var kbMap = keybindings,
			keyCode,
			keyName,
			keyNameActual,
			state,
			type,
			isAlwaysAvailable,
			cameraRotated;
		
		// check for meta keys
		
		if ( e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ) {
			return;
		}
		
		// handle by type
		
		type = ( e.type + '' );
		
		// special cases for pointer / mouse
		
		if ( type === 'tap' || type === 'doubletap' || type === 'hold' || type === 'dragstart' || type === 'drag' || type === 'dragend' ) {
			
			keyName = 'pointer';
			state = type;
			
		}
		else if ( type === 'mousewheel' || type === 'DOMMouseScroll' ) {
			
			keyName = 'pointer';
			state = 'wheel';
			
		}
		// fallback to key press
		else {
			
			keyCode = ( ( e.which || e.key || e.keyCode ) + '' ).toLowerCase();
			keyName = _KeyHelper.key( keyCode );
			
			state = type.toLowerCase();
			state = state.replace( 'key', '', 1 );
			
		}
		
		// get mapped key name
		
		keyNameActual = kbMap[ keyName ] || keyName;
		
		// if enabled or key is always available
		
		isAlwaysAvailable = kbMap.alwaysAvailable.indexOf( keyNameActual ) !== -1;
		
		if ( enabled === true || isAlwaysAvailable ) {
			
			parameters = {
				event: e,
				bubble: isAlwaysAvailable || _Game.paused
			};
			
			// perform character action
			
			character.actions.execute( keyNameActual, state, parameters );
			
			// perform action
			
			actions.execute( keyNameActual, state, parameters );
			
		}
		
	}
	
	/*===================================================
    
    ui
    
    =====================================================*/
	
	function on_puzzle_started ( puzzle ) {
		
		console.log( 'puzzle started', puzzle );
		
		// modify ui to reflect new puzzle
		
		main.dom_collapse( {
			element: $( "#fieldActiveWarning" ),
			time: 0
		} );
		
		main.dom_collapse( {
			element: $( "#fieldActive" ),
			show: true,
			time: 0
		} );
		
		// overview
		
		$( "#fieldActiveName" ).html( puzzle.name );
		$( "#fieldActiveScoreBar" ).css( 'width', this.scorePct + '%' );
		$( "#fieldActiveElementCount" ).html( puzzle.elements.length );
		$( "#fieldActiveNumElementsMin" ).html( puzzle.numElementsMin );
		
		// shapes
		
		$( "#fieldActiveShapesRequired" ).html( puzzle.numShapesRequired );
		
		$( "#fieldActiveShapesPicker button" ).on( 'tap.toggleShape', on_toggle_shape );
		
		$.each($('#fieldActiveShapesPicker button').data('events'), function(i, event){
			console.log( event );
			$.each(event, function(i, handler){

				console.log( ' > ', handler );

			});

		});
		
		// puzzle ready status
		
		puzzle.shapesNeeded.add( on_puzzle_waiting );
		
		if ( puzzle.ready !== true ) {
			
			on_puzzle_waiting( puzzle );
			
		}
		else {
			
			on_puzzle_ready( puzzle );
			
		}
		
	}
	
	function on_toggle_shape ( e ) {
		
		var puzzle = character.planting.puzzle,
			$button = $( e.currentTarget ),
			shape = $button.attr( 'id' ),
			shapesChanged;
		console.log( 'toggle shape, puzzle is ', puzzle, ' e ', e, 'button is ', $button, ' and shape is ', shape );
		// if valid puzzle
		
		if ( puzzle ) {
			
			// add / remove shapes based on whether button active
			
			if ( $button.hasClass( 'active' ) ) {
				
				shapesChanged = puzzle.remove_shape( shape );
				console.log( 'removing shape', shape, ' shapesChanged? ', shapesChanged );
			}
			else {
				
				shapesChanged = puzzle.add_shape( shape );
				console.log( 'adding shape', shape, ' shapesChanged? ', shapesChanged );
			}
			
			// toggle button active if shapes changed
			
			if ( shapesChanged === true ) {
				
				$button.toggleClass( 'active' );
				
			}
			
		}
		
	}
	
	function on_puzzle_waiting ( puzzle ) {
		
		console.log( 'puzzle waiting', puzzle );
		
		puzzle.shapesReady.add( on_puzzle_ready );
		
		// trigger farming menu
		
		shared.domElements.$buttonFarmingMenu.trigger( 'tap' );
		
		// scroll to field
		
		$.scrollTo( shared.domElements.$field, shared.domScrollTime, {
			easing: 'easeInOutCubic'
		} );
		
		// update status
		
		$( "#fieldActiveStatusIcons img" ).addClass( 'hidden' );
		$( "#fieldActiveStatusText" ).html( 'waiting' );
		$( "#fieldActiveStatusIcons #waiting" ).removeClass( 'hidden' );
		
		// hide map and rewards
		
		main.dom_collapse( {
			element: $( "#fieldActiveMap, #fieldActiveRewards" )
		} );
		
	}
	
	function on_puzzle_ready ( puzzle ) {
		
		console.log( 'puzzle ready', puzzle );
		
		puzzle.shapesReady.remove( on_puzzle_ready );
		
		// update status
		
		$( "#fieldActiveStatusIcons img" ).addClass( 'hidden' );
		$( "#fieldActiveStatusText" ).html( 'ready' );
		$( "#fieldActiveStatusIcons #ready" ).removeClass( 'hidden' );
		
		// hide shapes required warning
		
		main.dom_collapse( {
			element: $( "#fieldActiveShapesRequiredWarning" ),
			time: 0
		} );
		
		// show map and rewards
		
		main.dom_collapse( {
			element: $( "#fieldActiveMap, #fieldActiveRewards" ),
			show: true
		} );
		
	}
	
	function on_puzzle_stopped ( puzzle ) {
		
		console.log( 'puzzle stopped', puzzle );
		
		// shapes
		
		$( "#fieldActiveShapesPicker button" ).off( '.toggleShape' );
		
		puzzle.shapesNeeded.remove( on_puzzle_waiting );
		puzzle.shapesReady.remove( on_puzzle_ready );
		
		// remove puzzle from ui
		
		main.dom_collapse( {
			element: $( "#fieldActive, #fieldActiveMap, #fieldActiveRewards" ),
			time: 0
		} );
		
		main.dom_collapse( {
			element: $( "#fieldActiveWarning" ),
			show: true,
			time: 0
		} );
		
	}
	
	/*===================================================
    
    selection functions
    
    =====================================================*/
	
	function select ( parameters ) {
		
		var selectedMesh,
			selectedModel,
			targetsNum = 0,
			targetsNumMax,
			pointer,
			character,
			targeting,
			targets,
			targetsToRemove,
			materialIndex;
		
		// handle parameters
		
		parameters = parameters || {};
		
		pointer = parameters.pointer = parameters.pointer || main.get_pointer( parameters );
		
		character = parameters.character || character;
		
		targetsNumMax = parameters.targetsNumMax || 1;
		
		targeting = character.targeting;
		
		targets = targeting.targets;
		
		targetsToRemove = targeting.targetsToRemove;
		
		// select
			
		selectedModel = _Game.get_pointer_object( pointer );
		
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
		
		shared.signals.gameResumed.add( resume );
		
	}
	
	function resume () {
			
		shared.signals.gameResumed.remove( resume );
		
		enable();
		
	}
	
	function enable () {
		
		if ( _Game.started === true && enabled !== true ) {
			
			enabled = true;
			
			shared.signals.gameUpdated.add( update );
		
		}
		
	}
	
	function disable () {
		
		// set enabled state
		
		enabled = false;
		
		// clear actions
		
		actions.clear_active();
		character.actions.clear_active();
		
		// pause updating
		
		shared.signals.gameUpdated.remove( update );
		
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