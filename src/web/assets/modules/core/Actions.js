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
	
	function execute ( name, eventName, parameters ) {
		
		// if action exists
		
		if ( this.map.hasOwnProperty( name ) ) {
			
			this.map[ name].execute( eventName, parameters );
		
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
		
		var eventName;
		
		// handle parameters
		
		parameters = parameters || {};
		
		// properties
		
		this.eventCallbacks = parameters.eventCallbacks || {};
		
		this.eventNameActive = parameters.eventNameActive;
		this.eventNameInactive = parameters.eventNameInactive;
		
		this.active = false; 
		this.activeChecks = parameters.activeChecks || {};
		
		// for each list of eventCallbacks
		
		for ( eventName in this.eventCallbacks ) {
			
			if ( this.eventCallbacks.hasOwnProperty( eventName ) ) {
				
				// ensure is array
				
				this.eventCallbacks[ eventName ] = main.ensure_array( this.eventCallbacks[ eventName ] );
				
			}
			
		}
		
	}
	
	Action.prototype = {
		
		execute: function ( eventName, parameters ) {
			
			var i, l,
				event,
				eventCallbacks;
			
			// handle parameters
			
			parameters = parameters || {};
			
			event = parameters.event;
			
			// if eventName exists
			
			if ( this.eventCallbacks.hasOwnProperty( eventName ) ) {
				
				// store eventName
				
				this.eventNameCurrent = eventName;
				
				// execute each eventCallback
				
				eventCallbacks = this.eventCallbacks[ eventName ];
				
				for ( i = 0, l = eventCallbacks.length; i < l; i++ ) {
					
					eventCallbacks[ i ]( parameters );
					
				}
				
				// update active
				
				this.is_active();
				
			}
			
			// if event passed
			
			if ( event && parameters.allowDefault !== true ) {
				
				event.preventDefault();
				
			}
			
		},
		
		deactivate: function () {
			
			if ( typeof this.eventNameInactive !== 'undefined' && this.eventCallbacks.hasOwnProperty( this.eventNameInactive ) && this.is_active() ) {
				
				this.execute( this.eventNameInactive );
				this.active = false;
				
			}
			
		},
		
		is_active: function () {
			
			// if checks is function
			if ( typeof this.activeChecks === 'function' ) {
				
				this.active = this.activeChecks();
				
			}
			// else try active check for current eventCallback
			else if ( this.activeChecks.hasOwnProperty( this.eventNameCurrent ) ) {
				
				this.active = this.activeChecks[ this.eventNameCurrent ]();
				
			}
			// else default to eventCallback names
			else if ( typeof this.eventNameActive !== 'undefined' ) {
				
				this.active = this.eventNameCurrent === this.eventNameActive;
				
			}
			
			return this.active;
			
		}
		
	};
	
} (KAIOPUA) );