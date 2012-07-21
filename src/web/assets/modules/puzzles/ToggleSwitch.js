/*
 *
 * ToggleSwitch.js
 * Activation toggle switch.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/puzzles/ToggleSwitch.js",
		_ToggleSwitch = {},
		_Model;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _ToggleSwitch,
		requirements: [
			"assets/modules/core/Model.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    init
    
    =====================================================*/
	
	function init_internal( m ) {
		console.log( 'internal ToggleSwitch' );
		
		_Model = m;
		
		// functions
		
		_ToggleSwitch.Instance = ToggleSwitch;
		_ToggleSwitch.Instance.prototype = new _Model.Instance();
		_ToggleSwitch.Instance.prototype.constructor = _ToggleSwitch.Instance;
		_ToggleSwitch.Instance.prototype.supr = _Model.Instance.prototype;
		
		_ToggleSwitch.Instance.prototype.reset = reset;
		_ToggleSwitch.Instance.prototype.toggle = toggle;
		_ToggleSwitch.Instance.prototype.on = on;
		_ToggleSwitch.Instance.prototype.off = off;
		
	}
	
	/*===================================================
    
    events
    
    =====================================================*/
	
	function on_toggle ( e, pointer ) {
		
		var toggleTarget;
		
		// find toggle target 
		
		toggleTarget = _Game.get_pointer_object( {
			octree: octree,
			pointer: pointer
		} );
		console.log( ' TOGGLE EVENT, toggleTarget ', toggleTarget );
		// if pointer toggling any switch
		
		if ( toggleTarget instanceof ToggleSwitch ) {
			
			toggleTarget.toggle();
			
		}
		
	}
	
	/*===================================================
    
    instance
    
    =====================================================*/
	
	function ToggleSwitch ( parameters ) {
		
		var signalId;
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.physics = parameters.physics || {
			bodyType: 'mesh'
		};
		
		parameters.center = true;
		
		// proto
		
		_Model.Instance.call( this, parameters );
		
		// properties
		
		this.target = parameters.target;
		this.stateInitial = typeof parameters.state === 'boolean' ? parameters.state : false;
		
		// signal
		
		this.stateChanged = new signals.Signal();
		
		// reset self
		
		shared.signals.gameStopped.add( this.reset, this );
		this.reset();
		
	}
	
	/*===================================================
    
    reset
    
    =====================================================*/
	
	function reset () {
		
		// set state to initial
		
		if( this.stateInitial === true ) {
			
			this.on();
			
		}
		else {
			
			this.off();
			
		}
		
	}
	
	/*===================================================
    
    toggle
    
    =====================================================*/
	
	function toggle () {
		
		if ( this.state === true ) {
			
			this.off();
			
		}
		else {
			
			this.on();
			
		}
		
	}
	
	function on () {
		
		if ( this.state !== true ) {
			
			this.state = true;
			
			this.stateChanged.dispatch( this.state );
			
		}
		
	}
	
	function off () {
		
		if ( this.state !== false ) {
			
			this.state = false;
			
			this.stateChanged.dispatch( this.state );
			
		}
		
	}
	
} (KAIOPUA) );