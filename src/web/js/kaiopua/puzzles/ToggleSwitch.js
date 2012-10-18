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
		assetPath = "js/kaiopua/puzzles/ToggleSwitch.js",
		_ToggleSwitch = {},
		_Model;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _ToggleSwitch,
		requirements: [
			"js/kaiopua/core/Model.js"
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
		
		// properties
		
		_ToggleSwitch.options = {
			interactive: true
		}
		
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
    
    instance
    
    =====================================================*/
	
	function ToggleSwitch ( parameters ) {
		
		var signalId;
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.options = $.extend( true, {}, _ToggleSwitch.options, parameters.options );
		
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
		
		this.onStateChanged = new signals.Signal();
		
		// reset self
		
		shared.signals.onGameStopped.add( this.reset, this );
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
			
			this.morphs.play( 'off', { duration: this.options.morphs.duration, callback: $.proxy( off, this ) } );
			
		}
		else {
			
			this.morphs.play( 'on', { duration: this.options.morphs.duration, callback: $.proxy( on, this ) } );
			
		}
		
	}
	
	function on () {
		
		if ( this.state !== true ) {
			
			this.state = true;
			
			this.onStateChanged.dispatch( this );
			
		}
		
	}
	
	function off () {
		
		if ( this.state !== false ) {
			
			this.state = false;
			
			this.onStateChanged.dispatch( this );
			
		}
		
	}
	
} (KAIOPUA) );