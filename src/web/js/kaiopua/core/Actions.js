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
		assetPath = "js/kaiopua/core/Actions.js",
		_Actions = {},
		actionCount = 0,
		actionOptions = {
			priority: 0,
			blocking: false,
			silencing: false
		};
	
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
    
    utility
    
    =====================================================*/
	
	function handle_names ( names ) {
		
		var namesList;
		
		// handle names
		
		if ( typeof names === 'string' ) {
			
			namesList = names.replace(/\s{2,}/g, ' ').split( ' ' );
			
		}
		else {
			
			namesList = main.to_array( names );
			
		}
		
		return namesList;
		
	}
	
	function sort_priority ( a, b ) {
		
		return b.options.priority - a.options.priority;
		
	}
	
	/*===================================================
    
    add / remove
    
    =====================================================*/
	
	function add ( names, parameters, clean ) {
		
		var i, l,
			namesList = handle_names( names ),
			name,
			nameActions,
			action;
		
		// remove all previous actions at names
		
		if ( clean === true ) {
			
			this.remove( namesList );
			
		}
		
		// for each name
		
		for ( i = 0, l = namesList.length; i < l; i++ ) {
			
			name = namesList[ i ];
			nameActions = this.map[ name ] = this.map[ name ] || [];
			
			action = new Action( parameters );
			
			nameActions.push( action );
			nameActions.sort( sort_priority );
			
			main.array_cautious_add( this.actionNames, name );
			
		}
	}
	
	function remove ( names ) {
		
		var i, l,
			j, k,
			namesList = handle_names( names ),
			name,
			nameActions,
			action,
			index;
		
		// for each name
		
		for ( i = 0, l = namesList.length; i < l; i++ ) {
			
			name = namesList[ i ];
			
			if ( this.map.hasOwnProperty( name ) ) {
				
				nameActions = this.map[ name ];
				
				// deactivate each action
				
				for ( j = 0, k = nameActions.length; j < k; j++ ) {
					
					action = nameActions[ j ];
					
					action.deactivate();
					
				}
				
				delete this.map[ name ];
				main.array_cautious_remove( this.actionNames, name );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    execute
    
    =====================================================*/
	
	function execute ( name, eventName, parameters ) {
		
		var i, l,
			nameActions,
			action,
			executable;
		
		if ( this.map.hasOwnProperty( name ) ) {
			
			nameActions = this.map[ name];
			
			for ( i = 0, l = nameActions.length; i < l; i++ ) {
				
				action = nameActions[ i ];
				
				executable = action.execute( eventName, parameters );
				
				if ( ( action.options.silencing === true || ( executable === true && action.options.blocking === true ) ) && action.active === true ) {
					
					break;
					
				}
				
			}
		
		}
		
	}
	
	/*===================================================
    
    activity
    
    =====================================================*/
	
	function is_active ( name ) {
		
		return ( this.map.hasOwnProperty( name ) && this.map[ name ].active ) || false;
		
	}
	
	function clear_active () {
		
		var i, l,
			j, k,
			nameActions;
		
		// for each action name
		
		for ( i = 0, l = this.actionNames.length; i < l; i++ ) {
			
			nameActions = this.map[ this.actionNames[ i ] ];
			
			for ( j = 0, k = nameActions.length; j < k; j++ ) {
				
				nameActions[ j ].deactivate();
				
			}
			
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
		
		// options
		
		this.options = $.extend( true, {}, actionOptions, parameters.options );
		
		// properties
		
		this.id = actionCount++;
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
				
				this.eventCallbacks[ eventName ] = main.to_array( this.eventCallbacks[ eventName ] );
				
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
					
					this.deactivateCallbacks[ eventName ] = main.to_array( this.deactivateCallbacks[ eventName ] );
					
				}
				
			}
			
		}
		
	}
	
	Action.prototype = {
		
		execute: function ( eventName, parameters ) {
			
			var i, l,
				eventCallbacks,
				executable = this.eventCallbacks.hasOwnProperty( eventName );
			
			if ( executable ) {
				
				parameters = parameters || {};
				
				main.array_cautious_add( this.eventsActive, eventName );
				
				// execute each eventCallback
				
				eventCallbacks = this.eventCallbacks[ eventName ];
				
				for ( i = 0, l = eventCallbacks.length; i < l; i++ ) {
					
					eventCallbacks[ i ]( parameters );
					
				}
				
				// if event passed
				
				if ( parameters.event && parameters.allowDefault !== true ) {
					
					parameters.event.preventDefault();
					
				}
				
			}
			
			return executable;
			
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