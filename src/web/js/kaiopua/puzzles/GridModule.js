/*
 *
 * GridModule.js
 * Single module of puzzle grids.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/puzzles/GridModule.js",
		_GridModule = {},
		_Model,
		_GridModuleState,
		_ObjectHelper,
		states;
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	main.asset_register( assetPath, {
		data: _GridModule,
		requirements: [
			"js/kaiopua/core/Model.js",
			"js/kaiopua/puzzles/GridModuleState.js",
			"js/kaiopua/utils/ObjectHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
	
	init
	
	=====================================================*/
	
	function init_internal ( m, gms, oh ) {
		console.log("internal grid module", _GridModule);
		_Model = m;
		_GridModuleState = gms;
		_ObjectHelper = oh;
		
		// properties
		
		_GridModule.colors = {};
		_GridModule.colors.base = new THREE.Color( 0xffffff );
		_GridModule.colors.baseOccupied = new THREE.Color( 0xe6b266 );
		_GridModule.colors.vacant = new THREE.Color( 0x0ccd6f );
		_GridModule.colors.occupied = new THREE.Color( 0xff2830 );
		
		// instance
		
		_GridModule.Instance = GridModule;
		_GridModule.Instance.prototype = new _Model.Instance();
		_GridModule.Instance.prototype.constructor = _GridModule.Instance;
		_GridModule.Instance.prototype.reset = reset;
		_GridModule.Instance.prototype.set_dirty = set_dirty;
		
		_GridModule.Instance.prototype.change_state = change_state;
		_GridModule.Instance.prototype.show_state = show_state;
		_GridModule.Instance.prototype.get_state = get_state;
		_GridModule.Instance.prototype.get_state_active = get_state_active;
		
		_GridModule.Instance.prototype.set_occupant = set_occupant;
		
		_GridModule.Instance.prototype.set_active = set_active;
		
		_GridModule.Instance.prototype.has_face_or_vertex = has_face_or_vertex;
		_GridModule.Instance.prototype.get_modules_connected = get_modules_connected;
		_GridModule.Instance.prototype.find_and_store_connected = find_and_store_connected;
		
		Object.defineProperty( _GridModule.Instance.prototype, 'connected', { 
			get: function () { 
				
				if ( this._dirtyConnected !== false ) {
					
					this.get_modules_connected();
					
				}
				
				return this._connected;
			
			}
		});
		
		Object.defineProperty( _GridModule.Instance.prototype, 'connectedList', { 
			get: function () { 
				
				if ( this._dirtyConnected !== false ) {
					
					this.get_modules_connected();
					
				}
				
				return this._connectedList;
			
			}
		});
		
		Object.defineProperty( _GridModule.Instance.prototype, 'puzzle', { 
			get: function () { 
				if ( this.grid ) {
					return this.grid.puzzle;
				}
			}
		});
		
		Object.defineProperty( _GridModule.Instance.prototype, 'grid', { 
			get: function () { return this._grid; },
			set: function ( grid ) {
				
				this._grid = grid;
				
				this._dirtyConnected = true;
				
			}
		});
		
		Object.defineProperty( _GridModule.Instance.prototype, 'occupant', { 
			get: function () { return this._occupant; }
		});
		
		Object.defineProperty( _GridModule.Instance.prototype, 'occupied', { 
			get: function () { return this.get_state_active( 'occupied' ); }
		});
		
		Object.defineProperty( _GridModule.Instance.prototype, 'active', { 
			get: function () { return this.get_state_active( 'active' ); },
			set: function ( active ) { this.set_active( active ); }
		});
		
	}
	
	/*===================================================
	
	grid modules
	
	=====================================================*/
	
	function GridModule ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.material = parameters.material || new THREE.MeshLambertMaterial();
		
		parameters.physics = parameters.physics || {
			bodyType: 'mesh'
		};
		
		parameters.center = true;
		parameters.centerRotation = true;
		parameters.normalizeFaces = true;
		
		// prototype constructor
		
		_Model.Instance.call( this, parameters );
		
		// store grid reference
		
		this.grid = parameters.grid;
		
		// signals
		
		this.onOccupantAdded = new signals.Signal();
		this.onOccupantRemoved = new signals.Signal();
		this.onOccupantChanged = new signals.Signal();
		this.onActiveChanged = new signals.Signal();
		this.onDirtied = new signals.Signal();
		
		// states
		
		this.states = {};
		this.states.list = [
			'base',
			'occupied',
			'water'
		];
		
		this.states.overdraw = false;
		
		this.states.base = new _GridModuleState.Instance( {
			color0: _GridModule.colors.base,
			ambient0: _GridModule.colors.base,
			color1: _GridModule.colors.baseOccupied,
			ambient1: _GridModule.colors.baseOccupied
		} );
		this.states.occupied = new _GridModuleState.Instance( {
			constant: false,
			color0: _GridModule.colors.vacant,
			ambient0: _GridModule.colors.vacant,
			color1: _GridModule.colors.occupied,
			ambient1: _GridModule.colors.occupied
		} );
		this.states.active = new _GridModuleState.Instance( {
			constant: false
		} );
		this.states.water = new _GridModuleState.Instance( {
			priority: 1,
			color: 0x17DAF8,
			ambient: 0x17DAF8
		} );
		
		// set to base state
		
		this.reset();
		
	}
	
	/*===================================================
	
	reset
	
	=====================================================*/
	
	function reset () {
		
		var states = this.states,
			statesList = states.list;
		
		this.set_dirty();
		
		// reset active for each state in states list
		
		this.change_state( statesList, false );
		
		// clear occupant
		
		this.set_occupant();
		
	}
	
	/*===================================================
	
	states
	
	=====================================================*/
	
	function set_dirty () {
		
		this._dirtyStates = true;
		this._dirtyConnected = true;
		
		this.onDirtied.dispatch( this );
		
	}
	
	function change_state ( ids, activates ) {
		
		var i, l, k,
			id,
			activate,
			state,
			activePrev;
		
		// for each id
		
		ids = main.to_array( ids );
		
		activates = main.to_array( activates );
		
		for ( i = 0, l = ids.length, k = activates.length; i < l; i++ ) {
			
			id = ids[ i ];
			
			activate = ( i < k ) ? activates[ i ] : activates[ 0 ];
			
			// handle state active property, default to 0
			
			if ( this.states.hasOwnProperty( id ) ) {
				
				state = this.states[ id ];
				
				activePrev = state.active;
				
				state.active = activate === true ? 1 : 0;
				
				// if active changed, set states dirty
				
				if ( state.active !== activePrev ) {
					
					this.set_dirty();
					
				}
				
			}
			
		}
		
		// recalculate state showing
		
		this.show_state();
		
	}
	
	function show_state ( overdraw, activeLevel ) {
		
		var state,
			overdrawPrev = this.states.overdraw;
		
		// set overdraw parameter
		
		if ( overdraw === false ) {
			
			this.states.overdraw = false;
			
		}
		else if ( typeof overdraw === 'string' && this.states.hasOwnProperty( overdraw ) ) {
			
			this.states.overdraw = this.states[ overdraw ];
			
		}
		
		// if overdraw changed
		
		if ( this.states.overdraw !== overdrawPrev ) {
			
			this.set_dirty();
			
		}
		
		// if states dirty
		
		if ( this._dirtyStates !== false ) {
			
			// use overdraw state if exists
			
			if ( this.states.overdraw instanceof _GridModuleState.Instance ) {
				
				state = this.states.overdraw;
				
			}
			// else get top priority constant state
			else {
				
				state = this.get_state();
				
			}
			
			// modify module material with state
			
			state.modify_material( this.material, activeLevel );
			
			// clear dirty states
			
			this._dirtyStates = false;
			
		}
		
	}
	
	function get_state ( id ) {
		
		var i, l,
			states = this.states,
			statesList = states.list,
			state,
			statesPotential;
		
		// get state by id
		if ( typeof id === 'string' ) {
			
			state = states[ id ];
			
		}
		// else get top priority state based on all active constant states
		else {
			
			// get all potential states
			
			statesPotential = [];
			
			for ( i = 0, l = statesList.length; i < l; i++ ) {
				
				id = statesList[ i ];
				
				state = states[ id ];
				
				// if is active and constant
				
				if ( state.active && state.constant ) {
					
					statesPotential.push( state );
					
				}
				
			}
			
			// sort potential states by priority and extract top
			
			if ( statesPotential.length > 0 ) {
				
				statesPotential.sort( sort_by_priority );
				
				state = statesPotential[ 0 ];
				
			}
			else {
				
				state = states.base;
				
			}
			
		}
		
		return state;
		
	}
	
	function get_state_active ( id ) {
		
		var state = this.get_state( id );
		
		return state instanceof _GridModuleState.Instance ? Boolean( state.active ) : false;
		
	}
	
	function sort_by_priority ( a, b ) {
		return b.priority - a.priority;
	}
	
	/*===================================================
	
	occupants
	
	=====================================================*/
	
	function set_occupant ( occupant ) {
		
		var occupantPrev = this._occupant;
		
		// if has occupant and occupant is in module
		
		if ( typeof this._occupant !== 'undefined' && this._occupant.parent === this ) {
			
			this.remove( this._occupant );
			
		}
		
		// store new
		
		this._occupant = occupant;
		
		// if has new occupant
		
		if ( typeof this._occupant !== 'undefined' ) {
			
			this.add( this._occupant );
			this.change_state( [ 'occupied', 'base' ], true );
			
			// if did not have previous
			
			if ( typeof occupantPrev === 'undefined' ) {
				
				this.onOccupantAdded.dispatch( this );
				
			}
			
		}
		// else empty
		else {
			
			this.change_state( [ 'occupied', 'base' ], false );
			
			// set inactive
			
			this.set_active( false );
			
			// if had previous
			
			if ( typeof occupantPrev !== 'undefined' ) {
				
				this.onOccupantRemoved.dispatch( this );
				
			}
			
		}
		
		// if change occurred
		
		if ( occupant !== occupantPrev ) {
			
			this.onOccupantChanged.dispatch( this );
			
		}
		
	}
	
	/*===================================================
	
	active
	
	=====================================================*/
	
	function set_active ( active ) {
		
		var activePrev = this._active,
			gridElement;
		
		// store new
		
		this._active = active;
		
		// update state
		
		this.change_state( 'active', this._active );
		
		// if change occured
		
		if ( this._active !== activePrev ) {
			
			this.onActiveChanged.dispatch( this );
			
		}
		
	}
	
	/*===================================================
	
	connected
	
	=====================================================*/
		
	function get_modules_connected ( connected, recalculate ) {
		
		var i, l,
			j, k,
			vertices,
			faces,
			face;
		
		// handle connected
		
		connected = main.to_array( connected );
		
		// if should recalculate
		
		if ( this._dirtyConnected !== false || recalculate === true ) {
			
			// reset connected
			
			this._connected = {};
			this._connectedList = [];
			
			// if grid valid
			
			if ( typeof this.grid !== 'undefined' ) {
				
				// for each face
				
				vertices = this.geometry.vertices;
				
				faces = this.geometry.faces;
				
				for ( i = 0, l = faces.length; i < l; i++ ) {
					
					face = faces[ i ];
					
					// get connected sides
					
					// ab / up
					
					this.find_and_store_connected( vertices[ face.a ], vertices[ face.b ], [ 1, 'ab', 'up' ] );
					
					// bc / left
					
					this.find_and_store_connected( vertices[ face.b ], vertices[ face.c ], [ 3, 'bc', 'left' ] );
					
					// by face type
					
					if ( face instanceof THREE.Face4 ) {
						
						// cd / down
						
						this.find_and_store_connected( vertices[ face.c ], vertices[ face.d ], [ 7, 'cd', 'down' ] );
						
						// da / right
						
						this.find_and_store_connected( vertices[ face.d ], vertices[ face.a ], [ 5, 'da', 'right' ] );
						
					}
					else {
						
						// ca / right / down
						
						this.find_and_store_connected( vertices[ face.c ], vertices[ face.a ], [ 5, 7, 'ca', 'right', 'down' ] );
						
					}
					
					// get connected corners
					
					// a / upright
					
					this.find_and_store_connected( vertices[ face.a ], undefined, [ 2, 'a', 'upright' ] );
					
					// b / upleft
					
					this.find_and_store_connected( vertices[ face.b ], undefined, [ 0, 'b', 'upleft' ] );
					
					// c / downleft
					
					this.find_and_store_connected( vertices[ face.c ], undefined, [ 6, 'c', 'downleft' ] );
					
					// d / downright
					
					this.find_and_store_connected( vertices[ face.d ], undefined, [ 8, 'd', 'downright' ] );
					
				}
				
				// remove flag
				
				this._dirtyConnected = false;
				
			}
			
		}
		
		// add all connections to connected
		
		connected = connected.concat( this._connectedList );
		
		return connected;
		
	}
	
	function find_and_store_connected ( vertexA, vertexB, ids ) {
		
		var i, l,
			searchFor,
			connectedModules,
			connectedModule;
		
		// if grid is valid
		
		if ( typeof this.grid !== 'undefined' ) {
			
			// set search target(s)
			
			if ( typeof vertexB !== 'undefined' ) {
				
				searchFor = [ vertexA, vertexB ];
				
			}
			else {
				
				searchFor = vertexA;
				
			}
			
			// get connected modules
			
			connectedModules = this.grid.get_modules_with_vertices( searchFor, this, [ this ].concat( this._connectedList ) );
			
			if ( connectedModules.length > 0 ) {
				
				// take just first found module
				
				connectedModule = connectedModules[ 0 ];
				
				// check ids
				
				ids = main.to_array( ids );
				
				// store for each id
				
				for ( i = 0, l = ids.length; i < l; i++ ) {
					
					this._connected[ ids[ i ] ] = connectedModule;
					
				}
				
				// store in list
				
				this._connectedList.push( connectedModule );
				
			}
			
		}
		
	}
	
	function has_face_or_vertex( searchFor ) {
		
		var i, l,
			vertices,
			vertex,
			faces,
			has = false;
		
		// search
		
		if ( searchFor instanceof THREE.Vertex ) {
			
			vertices = this.geometry.vertices;
			
			// compare searchFor to each vertex
			// instead of searching via indexOf
			
			for ( i = 0, l = vertices.length; i < l; i++ ) {
				
				vertex = vertices[ i ];
				
				if ( searchFor.equals( vertex ) ) {
					
					has = true;
					
					break;
					
				}
				
			}
			
		}
		else if ( searchFor instanceof THREE.Face4 || searchFor instanceof THREE.Face3 ) {
			
			faces = this.geometry.faces;
			
			if ( main.index_of_value( faces, searchFor ) !== -1 ) {
				
				has = true;
				
			}
			
		}
		
		return has;
		
	}
	
} (KAIOPUA) );