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
		assetPath = "assets/modules/puzzles/GridModule.js",
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
			"assets/modules/core/Model.js",
			"assets/modules/puzzles/GridModuleState.js",
			"assets/modules/utils/ObjectHelper.js"
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
		_GridModule.colors.base = new THREE.Color( 0xe6b266 );
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
		
		_GridModule.Instance.prototype.set_occupant = set_occupant;
		
		_GridModule.Instance.prototype.has_face_or_vertex = has_face_or_vertex;
		_GridModule.Instance.prototype.get_modules_connected = get_modules_connected;
		_GridModule.Instance.prototype.find_and_store_connected = find_and_store_connected;
		
		_GridModule.Instance.prototype.remove = function ( object ) {
			
			_Model.Instance.prototype.remove.call( this, object );
			
			// if is occupant, clear
			
			if ( this.occupant === object ) {
				
				this.occupant = undefined;
				
			}
			
			// clean grid
			
			if ( typeof this.grid !== 'undefined' ) {
				
				this.grid.clean();
				
			}
			
		};
		
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
		
		Object.defineProperty( _GridModule.Instance.prototype, 'grid', { 
			get: function () { return this._grid; },
			set: function ( grid ) {
				
				this._grid = grid;
				
				this._dirtyConnected = true;
				
			}
		});
		
		Object.defineProperty( _GridModule.Instance.prototype, 'occupant', { 
			get: function () { return this._occupant; },
			set: function ( occupant ) { this.set_occupant( occupant ); }
		});
		
		Object.defineProperty( _GridModule.Instance.prototype, 'occupied', { 
			get: function () { return typeof this.occupant !== 'undefined'; }
		});
		
	}
	
	/*===================================================
	
	grid modules
	
	=====================================================*/
	
	function GridModule ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.materials = parameters.materials || new THREE.MeshLambertMaterial();
		
		parameters.center = true;
		
		parameters.centerRotation = true;
		
		// prototype constructor
		
		_Model.Instance.call( this, parameters );
		
		if ( this.geometry.vertices.length > 0 ) {
			
			_ObjectHelper.normalize_faces( this );
			
			/*
			var face = this.geometry.faces[ 0 ];
			
			var temp = this.geometry.vertices[ 0 ];
			this.geometry.vertices[ 0 ] = this.geometry.vertices[ 1 ];
			this.geometry.vertices[ 1 ] = temp;
			this.geometry.vertices[ face.a ].position.addScalar( 50 );
			
			var tindex = face.a;
			this.geometry.faces[ 0 ].a = this.geometry.faces[ 0 ].b;
			this.geometry.faces[ 0 ].b = tindex;*/
		}
		
		// store grid reference
		
		this.grid = parameters.grid;
		
		// signals
		
		this.stateChanged = new signals.Signal();
		this.occupiedStateChanged = new signals.Signal();
		
		// states
		
		this.states = {};
		this.states.list = [
			'base',
			'occupied',
			'water'
		];
		
		this.states.overdraw = false;
		
		this.states.base = new _GridModuleState.Instance( {
			active: 1,
			dynamic: false,
			color: _GridModule.colors.base,
			ambient: _GridModule.colors.base
		} );
		this.states.water = new _GridModuleState.Instance( {
			priority: 1,
			color: 0x17DAF8,
			ambient: 0x17DAF8
		} );
		this.states.occupied = new _GridModuleState.Instance( {
			constant: false,
			color0: _GridModule.colors.vacant,
			ambient0: _GridModule.colors.vacant,
			color1: _GridModule.colors.occupied,
			ambient1: _GridModule.colors.occupied
		} );
		
		// set to base state
		
		this.reset();
		
	}
	
	function reset () {
		
		var states = this.states,
			statesList = states.list;
		
		this.set_dirty();
		
		// reset active for each state in states list
		
		this.change_state( statesList, false );
		
		// clear occupant
		
		this.occupant = undefined;
			
	}
	
	/*===================================================
	
	states
	
	=====================================================*/
	
	function set_dirty () {
		
		this._dirtyStates = true;
		this._dirtyConnected = true;
		
		if ( typeof this.grid !== 'undefined' ) {
			
			this.grid._dirtyModules = true;
			
		}
	}
	
	function change_state ( ids, activates ) {
		
		var i, l, k,
			id,
			activate,
			state,
			activePrev;
		
		// for each id
		
		ids = main.ensure_array( ids );
		
		activates = main.ensure_array( activates );
		
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
		
		// signal
		
		this.stateChanged.dispatch( this );
		
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
			
			statesPotential.sort( sort_by_priority );
			
			state = statesPotential[ 0 ];
			
		}
		
		return state;
		
	}
	
	function sort_by_priority ( a, b ) {
		return b.priority - a.priority;
	}
	
	/*===================================================
	
	occupants
	
	=====================================================*/
	
	function set_occupant ( occupant ) {
		
		// store
		
		this._occupant = occupant;
		
		// set occupied state
		
		this.change_state( 'occupied', ( typeof this.occupant !== 'undefined' ) );
		
		// signal
		
		this.occupiedStateChanged.dispatch( this );
		
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
		
		connected = main.ensure_array( connected );
		
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
			//console.log( this.id, ' searching for connected at ', ids[ 2 ]);
			connectedModules = this.grid.get_modules_with_vertices( searchFor, this, [ this ].concat( this._connectedList ) );
			
			if ( connectedModules.length > 0 ) {
				
				// take just first found module
				
				connectedModule = connectedModules[ 0 ];
				
				// check ids
				
				ids = main.ensure_array( ids );
				
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
				
				if ( searchFor.position.equals( vertex.position ) ) {
					
					has = true;
					
					break;
					
				}
				
			}
			
		}
		else if ( searchFor instanceof THREE.Face4 || searchFor instanceof THREE.Face3 ) {
			
			faces = this.geometry.faces;
			
			if ( faces.indexOf( searchFor ) !== -1 ) {
				
				has = true;
				
			}
			
		}
		
		return has;
		
	}
	
} (KAIOPUA) );