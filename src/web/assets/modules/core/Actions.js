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
				
				index = main.index_of_value( this.actionNames, name );
				
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
		
		return ( this.map.hasOwnProperty( name ) && this.map[ name ].active ) || false;
		
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
		
		var eventName,
			deactivateCallbacks,
			deactivateCallback;
		
		// handle parameters
		
		parameters = parameters || {};
		
		// properties
		
		this.eventCallbacks = parameters.eventCallbacks || {};
		
		deactivateCallbacks = parameters.deactivateCallbacks;
		this.deactivateCallbacks = {};
		
		this.eventsActive = [];
		this.active = false; 
		this.activeCheck = parameters.activeCheck || {};
		
		// for each list of eventCallbacks
		
		for ( eventName in this.eventCallbacks ) {
			
			if ( this.eventCallbacks.hasOwnProperty( eventName ) ) {
				
				// ensure is array
				
				this.eventCallbacks[ eventName ] = main.ensure_array( this.eventCallbacks[ eventName ] );
				
				// check deactivateCallbacks
				if ( deactivateCallbacks ) {
					
					// all deactivates same
					if ( typeof deactivateCallbacks === 'function' ) {
						
						this.deactivateCallbacks[ eventName ] = deactivateCallbacks;
						
					}
					// all deactivates same event callback
					else if ( typeof deactivateCallbacks === 'string' && this.eventCallbacks.hasOwnProperty( deactivateCallbacks ) ) {
						
						this.deactivateCallbacks[ eventName ] = this.eventCallbacks[ deactivateCallbacks ];
						
					}
					// unique deactivate
					else if ( deactivateCallbacks.hasOwnProperty( eventName ) ) {
						
						deactivateCallback = deactivateCallbacks[ eventName ];
						
						// unique deactivate is event callback
						if ( typeof deactivateCallback === 'string' && this.eventCallbacks.hasOwnProperty( deactivateCallback ) ) {
							
							this.deactivateCallbacks[ eventName ] = this.eventCallbacks[ deactivateCallback ];
							
						}
						else {
							
							this.deactivateCallbacks[ eventName ] = deactivateCallback;
						
						}
						
					}
					
					// ensure is array
					
					this.deactivateCallbacks[ eventName ] = main.ensure_array( this.deactivateCallbacks[ eventName ] );
					
				}
				
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
				
				if ( main.index_of_value( this.eventsActive, eventName ) === -1 ) {
					
					this.eventsActive.push( eventName );
					
				}
				
				// execute each eventCallback
				
				eventCallbacks = this.eventCallbacks[ eventName ];
				
				for ( i = 0, l = eventCallbacks.length; i < l; i++ ) {
					
					eventCallbacks[ i ]( parameters );
					
				}
				
			}
			
			// if event passed
			
			if ( event && parameters.allowDefault !== true ) {
				
				event.preventDefault();
				
			}
			
		},
		
		deactivate: function () {
			
			var i, l,
				j, k,
				eventName,
				callbacks,
				callbacksCalled,
				callback;
			
			// if has current event
			
			if ( this.active && this.eventsActive.length > 0 ) {
				
				callbacksCalled = [];
				
				// execute each deactivate callback only once
				
				for ( i = 0, l = this.eventsActive.length; i < l; i++ ) {
				
					eventName = this.eventsActive[ i ];
					
					if ( this.deactivateCallbacks.hasOwnProperty( eventName ) ) {
						
						callbacks = this.deactivateCallbacks[ eventName ];
					
						for ( j = 0, k = callbacks.length; j < k; j++ ) {
							
							callback = callbacks[ j ];
							
							if ( main.index_of_value( callbacksCalled, callback ) === -1 ) {
								
								callback();
								
								callbacksCalled.push( callback );
								
							}
							
						}
						
					}
					
				}
				
				// clear eventName
				
				this.eventsActive = [];
				
			}
			
		}
		
	};
	
	Object.defineProperty( Action.prototype, 'active', { 
		get : function () { 
			
			// if has check
			if ( typeof this.activeCheck === 'function' ) {
				
				return this.activeCheck();
				
			}
			// else default
			else {
				
				return this.eventsActive.length > 0;
				
			}
			
		}
	});
	
} (KAIOPUA) );