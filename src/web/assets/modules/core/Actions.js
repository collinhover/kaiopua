/*
 *
 * Actions.js
 * Action handler for player, character, etc.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/core/Actions.js",
		_Actions = {};
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	init_internal();
	
	main.asset_register( assetPath, { 
		data: _Actions
	} );
	
	/*===================================================
    
    init
    
    =====================================================*/
	
	function init_internal() {
		console.log( 'internal Actions' );
		
		// functions
		
		_Actions.Instance = Actions;
		_Actions.Instance.prototype.constructor = _Actions.Instance;
		
		_Actions.Instance.prototype.add = add;
		_Actions.Instance.prototype.remove = remove;
		_Actions.Instance.prototype.execute = execute;
		
		_Actions.Instance.prototype.is_active = is_active;
		_Actions.Instance.prototype.clear_active = clear_active;
		
	}
	
	/*===================================================
    
    instance
    
    =====================================================*/
	
	function Actions () {
		
		this.map = {};
		this.actionNames = [];
		
	}
	
	/*===================================================
    
    names
    
    =====================================================*/
	
	function handle_names ( names ) {
		
		var namesList;
		
		// handle names
		
		if ( typeof names === 'string' ) {
			
			namesList = names.replace(/\s{2,}/g, ' ').split( ' ' );
			
		}
		else {
			
			namesList = main.ensure_array( names );
			
		}
		
		return namesList;
		
	}
	
	/*===================================================
    
    add / remove
    
    =====================================================*/
	
	function add ( names, parameters ) {
		
		var i, l,
			namesList = handle_names( names ),
			name,
			action;
		
		// remove all previous actions at names
		
		this.remove( namesList );
			
		// create new action
		
		action = new Action( parameters );
		
		// for each name
		
		for ( i = 0, l = namesList.length; i < l; i++ ) {
			
			name = namesList[ i ];
			
			// store new action
			
			this.map[ name ] = action;
			this.actionNames.push( name );
			
			
		}
		
	}
	
	function remove ( names ) {
		
		var i, l,
			namesList = handle_names( names ),
			name,
			index;
		
		// for each name
		
		for ( i = 0, l = namesList.length; i < l; i++ ) {
			
			name = namesList[ i ];
			
			if ( this.map.hasOwnProperty( name ) ) {
				
				// deactivate action
				
				this.map[ name ].deactivate();
				
				// delete action from map
				
				delete this.map[ name ];
				
				index = this.actionNames.indexOf( name );
				
				if ( index !== -1 ) {
					
					this.actionNames.splice( name, 1 );
					
				}
				
			}
			
		}
		
	}
	
	/*===================================================
    
    execute
    
    =====================================================*/
	
	function execute ( name, callbackName, parameters ) {
		
		// if action exists
		
		if ( this.map.hasOwnProperty( name ) ) {
			
			this.map[ name].execute( callbackName, parameters );
		
		}
		
	}
	
	/*===================================================
    
    activity
    
    =====================================================*/
	
	function is_active ( name ) {
		
		var active = false;
		
		if ( this.map.hasOwnProperty( name ) ) {
			
			active = this.map[ name ].is_active();
			
		}
		console.log( name, ' is active? ', active );
		return active;
		
	}
	
	function clear_active () {
		
		var i, l;
		
		// for each action name
		
		for ( i = 0, l = this.actionNames.length; i < l; i++ ) {
			
			this.map[ this.actionNames[ i ] ].deactivate();
			
		}
		
	}
	
	/*===================================================
    
    action instance
    
    =====================================================*/
	
	function Action ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		// properties
		
		this.callbacks = parameters.callbacks || {};
		
		this.callbackNameActive = parameters.callbackNameActive || 'tap';
		this.callbackNameInactive = parameters.callbackNameInactive && parameters.callbackNameInactive !== this.callbackNameActive ? parameters.callbackNameInactive : 'release';
		
		this.active = false; 
		this.activeChecks = parameters.activeChecks || {};
		
	}
	
	Action.prototype = {
		
		execute: function ( callbackName, parameters ) {
			
			var event;
			
			// handle parameters
			
			parameters = parameters || {};
			
			event = parameters.event;
			
			// if callbackName exists
			
			if ( this.callbacks.hasOwnProperty( callbackName ) ) {
				
				// store callbackName
				
				this.callbackNameCurrent = callbackName;
				
				// execute
				
				this.callbacks[ callbackName ]( parameters );
				
				// update active
				
				this.is_active();
				
			}
			
			// if event passed
			
			if ( event && parameters.bubble !== true ) {
				
				event.preventDefault();
				event.stopPropagation();
				
			}
			
		},
		
		deactivate: function () {
			
			if ( this.callbacks.hasOwnProperty( this.callbackNameInactive ) && this.is_active() ) {
				
				this.execute( this.callbackNameInactive );
				this.active = false;
				
			}
			
		},
		
		is_active: function () {
			
			// if checks is function
			if ( typeof this.activeChecks === 'function' ) {
				
				this.active = this.activeChecks();
				
			}
			// else try active check for current callback
			else if ( this.activeChecks.hasOwnProperty( this.callbackNameCurrent ) ) {
				
				this.active = this.activeChecks[ this.callbackNameCurrent ]();
				
			}
			// else default to callback names
			else {
				
				this.active = this.callbackNameCurrent === this.callbackNameActive;
				
			}
			
			return this.active;
			
		}
		
	};
	
} (KAIOPUA) );