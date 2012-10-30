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
		assetPath = "js/kaiopua/core/Player.js",
        _Player = {},
		_Character,
		_MathHelper,
		_KeyHelper,
		_SceneHelper,
		_ObjectHelper,
		_RayHelper;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Player,
		requirements: [
			"js/kaiopua/core/Character.js",
			"js/kaiopua/utils/MathHelper.js",
			"js/kaiopua/utils/KeyHelper.js",
			"js/kaiopua/utils/SceneHelper.js",
			"js/kaiopua/utils/ObjectHelper.js",
			"js/kaiopua/utils/RayHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    external init
    
    =====================================================*/
	
	function init_internal ( c, mh, kh, sh, oh, rh ) {
		console.log('internal player');
		
		// assets
		
		_Character = c;
		_MathHelper = mh;
		_KeyHelper = kh;
		_SceneHelper = sh;
		_ObjectHelper = oh;
		_RayHelper = rh;
		
		// properties
		
		_Player.options = {
			stats: {
				respawnOnDeath: true
			},
			movement: {
				move: {
					speed: 3
				},
				jump: {
					speedStart: 3,
					duration: 200,
					startDelay: 125,
					moveSpeedMod: 0
				}
			}
		};
		
		// instance
		
		_Player.Instance = Player;
		_Player.Instance.prototype = new _Character.Instance();
		_Player.Instance.prototype.constructor = _Player.Instance;
		_Player.Instance.prototype.supr = _Character.Instance.prototype;
		
		_Player.Instance.prototype.die = die;
		_Player.Instance.prototype.respawn = respawn;
		_Player.Instance.prototype.select = select;
		
		_Player.Instance.prototype.set_keybindings = set_keybindings;
		_Player.Instance.prototype.trigger_key = trigger_key;
		
		Object.defineProperty( _Player.Instance.prototype, 'parent', { 
			get : function () { return this._parent; },
			set: function ( parent ) {
				
				var scene;
				
				this._parent = parent;
				
				if ( this._parent instanceof THREE.Object3D ) {
					
					scene = _SceneHelper.extract_parent_root( this );
					
					if ( scene instanceof THREE.Scene !== true ) {
						
						this.enabled = false;
						
					}
					
				}
				
			}
		});
		
		Object.defineProperty( _Player.Instance.prototype, 'enabled', { 
			get : function () { return this.state.enabled; },
			set : function ( enabled ) {
				
				var last = this.state.enabled;
				
				this.state.enabled = enabled;
				
				if ( this.state.enabled !== last ) {
					
					if ( this.state.enabled === true ) {
						
						shared.signals.onGameUpdated.add( this.update, this );
						
					}
					else {
						
						shared.signals.onGameUpdated.remove( this.update, this );
						
					}
					
				}
				
			}
		} );
		
		Object.defineProperty( _Player.Instance.prototype, 'controllable', { 
			get : function () { return this.state.controllable; },
			set : function ( controllable ) {
				
				var last = this.state.controllable;
				
				this.state.controllable = controllable;
				
				if ( this.state.controllable !== last ) {
					
					if ( this.state.controllable === true ) {
						
						shared.signals.onGamePointerMoved.add( this.trigger_key, this );
						shared.signals.onGamePointerTapped.add( this.trigger_key, this );
						shared.signals.onGamePointerDoubleTapped.add( this.trigger_key, this );
						shared.signals.onGamePointerHeld.add( this.trigger_key, this );
						shared.signals.onGamePointerDragStarted.add( this.trigger_key, this );
						shared.signals.onGamePointerDragged.add( this.trigger_key, this );
						shared.signals.onGamePointerDragEnded.add( this.trigger_key, this );
						shared.signals.onGamePointerWheel.add( this.trigger_key, this );
						
						shared.signals.onKeyPressed.add( this.trigger_key, this );
						shared.signals.onKeyReleased.add( this.trigger_key, this );
						
					}
					else {
						
						shared.signals.onGamePointerMoved.remove( this.trigger_key, this );
						shared.signals.onGamePointerTapped.remove( this.trigger_key, this );
						shared.signals.onGamePointerDoubleTapped.remove( this.trigger_key, this );
						shared.signals.onGamePointerHeld.remove( this.trigger_key, this );
						shared.signals.onGamePointerDragStarted.remove( this.trigger_key, this );
						shared.signals.onGamePointerDragged.remove( this.trigger_key, this );
						shared.signals.onGamePointerDragEnded.remove( this.trigger_key, this );
						shared.signals.onGamePointerWheel.remove( this.trigger_key, this );
						
						shared.signals.onKeyPressed.remove( this.trigger_key, this );
						shared.signals.onKeyReleased.remove( this.trigger_key, this );
						
						// clear keys
						
						this.actions.clear_active();
						
					}
					
				}
				
			}
		});
		
		Object.defineProperty( _Player.Instance.prototype, 'target', { 
			get : function () { return this._target; },
			set: function ( target ) {
				
				this._target = target;
				
				// TODO: update UI to reflect target change
				
			}
		});
		
	}
	
	/*===================================================
    
    instance
    
    =====================================================*/
	
    function Player ( parameters ) {
		
		var me = this,
			kb;
		
		parameters = parameters || {};
		
		parameters.name = 'Hero';
		
		parameters.geometry = parameters.geometry || new THREE.CubeGeometry( 50, 100, 50 );
		parameters.center = true;
		
		parameters.physics = parameters.physics || {};
		parameters.physics.bodyType = 'capsule';
		parameters.physics.movementDamping = 0.5;
		
		parameters.options = $.extend( true, {}, _Player.options, parameters.options );
		
		_Character.Instance.call( this, parameters );
		
		// default keybindings
		
		kb = this.keybindingsDefault = {};
		
		// pointer
		
		kb[ 'pointer' ] = 'pointer';
		
		// wasd / arrows
		
		kb[ 'w' ] = kb[ 'up_arrow' ] = 'w';
		kb[ 's' ] = kb[ 'down_arrow' ] = 's';
		kb[ 'a' ] = kb[ 'left_arrow' ] = 'a';
		kb[ 'd' ] = kb[ 'right_arrow' ] = 'd';
		
		// qe
		
		kb[ 'q' ] = 'q';
		kb[ 'e' ] = 'e';
		
		// numbers
		
		kb[ '1' ] = '1';
		kb[ '2' ] = '2';
		kb[ '3' ] = '3';
		kb[ '4' ] = '4';
		kb[ '5' ] = '5';
		kb[ '6' ] = '6';
		
		// misc
		
		kb[ 'escape' ] = 'escape'
		kb[ 'space' ] = 'space';
		
		// set list of keys that are always available
		
		kb.alwaysAvailable = ['escape'];
		
		this.set_keybindings( kb );
		
		// actions
		
		// wasd / arrows
		
		this.actions.add( 'w up_arrow', {
			eventCallbacks: {
				down: function () {
					me.move_state_change( 'forward' );
				},
				up: function () {
					me.move_state_change( 'forward', true );
				}
			},
			deactivateCallbacks: 'up'
		} );
		
		this.actions.add( 's down_arrow', {
			eventCallbacks: {
				down: function () {
					me.move_state_change( 'back' );
				},
				up: function () {
					me.move_state_change( 'back', true );
				}
			},
			deactivateCallbacks: 'up'
		} );
		
		this.actions.add( 'a left_arrow', {
			eventCallbacks: {
				down: function () {
					me.move_state_change( 'left' );
				},
				up: function () {
					me.move_state_change( 'left', true );
				}
			},
			deactivateCallbacks: 'up'
		} );
		
		this.actions.add( 'd right_arrow', {
			eventCallbacks: {
				down: function () {
					me.move_state_change( 'right' );
				},
				up: function () {
					me.move_state_change( 'right', true );
				}
			},
			deactivateCallbacks: 'up'
		} );
		
		// jump
		
		this.actions.add( 'space', {
			eventCallbacks: {
				down: function () {
					me.move_state_change( 'up' );
				},
				up: function () {
					me.move_state_change( 'up', true );
				}
			},
			deactivateCallbacks: 'up'
		} );
		
		// misc
		
		this.actions.add( 'escape', {
			eventCallbacks: {
				up: function () {
					
					if ( main.paused === true ) {
						
						main.resume();
						
					}
					else {
						
						main.pause();
						
					}
					
				}
			}
		} );
		
		// selection
		
		this.actions.add( 'pointer', {
			eventCallbacks: {
				mousemove: function ( parameters ) {
					
					parameters = parameters || {};
					
					var e = parameters.event,
						target = _RayHelper.raycast( {
							pointer: main.get_pointer( e ),
							camera: shared.camera,
							objects: shared.scene.dynamics,
							octrees: shared.scene.octree,
							objectOnly: true
						} );
						
					// cursor change on mouse over interactive
					
					if ( target instanceof THREE.Object3D && target.interactive === true ) {
						
						shared.domElements.$game.css( 'cursor', 'pointer' );
						
					}
					else {
						
						shared.domElements.$game.css( 'cursor', 'auto' );
						
					}
					
				},
				tap: $.proxy( this.select, this )
			}
		} );
		
		// camera rotating
		
		this.actions.add( 'pointer', {
			eventCallbacks: {
				dragstart: $.proxy( shared.cameraControls.rotate_start, shared.cameraControls ),
				drag: $.proxy( shared.cameraControls.rotate, shared.cameraControls  ),
				dragend: $.proxy( shared.cameraControls.rotate_stop, shared.cameraControls  ),
				wheel: $.proxy( shared.cameraControls.zoom, shared.cameraControls  )
			},
			activeCheck: function () {
				return shared.cameraControls.rotating;
			},
			options: {
				priority: 1,
				silencing: true
			}
		} );
		
	}
	
	/*===================================================
    
    die
    
    =====================================================*/
	
	function die () {
		
		_Player.Instance.prototype.supr.die.apply( this, arguments );
		
		this.controllable = false;
		
	}
	
	/*===================================================
    
    respawn
    
    =====================================================*/
	
	function respawn () {
		
		_Player.Instance.prototype.supr.respawn.apply( this, arguments );
		
		shared.cameraControls.target = undefined;
		shared.cameraControls.target = this;
		shared.cameraControls.rotateTarget = true;
		
		this.enabled = true;
		this.controllable = true;
		
	}
	
	/*===================================================
    
    selection
    
    =====================================================*/
	
	function select ( parameters ) {
	
		var target,
			e;
		
		parameters = parameters || {};
		
		// find target
		
		if ( parameters instanceof THREE.Object3D ) {
			
			target = parameters;
			
		}
		else if ( parameters.target instanceof THREE.Object3D ) {
			
			target = parameters.target;
			
		}
		else {
			
			e = parameters.event;
			
			target = _RayHelper.raycast( {
				pointer: main.get_pointer( e ),
				camera: shared.camera,
				objects: shared.scene.dynamics,
				octrees: shared.scene.octree,
				objectOnly: true
			} );
			
		}
		
		// update target
		
		_Player.Instance.prototype.supr.select.call( this, target );
		
	}
	
	/*===================================================
    
    keybindings
    
    =====================================================*/
	
	function set_keybindings ( keybindings ) {
		
		this.keybindings = $.extend( true, this.keybindings || {}, keybindings );
		
	}
	
	function trigger_key ( e ) {
		
		var kbMap = this.keybindings,
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
		
		if ( type === 'tap' || type === 'doubletap' || type === 'hold' || type === 'dragstart' || type === 'drag' || type === 'dragend' || type === 'mousemove' ) {
			
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
			state = state.replace( 'key', '' );
			
		}
		
		// get mapped key name
		
		keyNameActual = kbMap[ keyName ] || keyName;
		
		// if enabled or key is always available
		
		isAlwaysAvailable = main.index_of_value( kbMap.alwaysAvailable, keyNameActual ) !== -1;
		
		if ( this.state.enabled === true || isAlwaysAvailable ) {
			
			// perform action
			
			this.actions.execute( keyNameActual, state, {
				event: e,
				allowDefault: isAlwaysAvailable || main.paused
			} );
			
		}
		
	}
	
	/*===================================================
    
    update
    
    =====================================================*/
	
	function update ( timeDelta, timeDeltaMod ) {
		
		_Player.Instance.prototype.supr.update.apply( this, arguments );
		
		// TODO: update selected?
		
	}
	
} ( KAIOPUA ) );