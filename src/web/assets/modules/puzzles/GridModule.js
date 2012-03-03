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
		_GridModuleState,
		_Model,
		states;
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	main.asset_register( assetPath, {
		data: _GridModule,
		requirements: [
			"assets/modules/puzzles/GridModuleState.js",
			"assets/modules/core/Model.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
	
	init
	
	=====================================================*/
	
	function init_internal ( gms, m ) {
		console.log("internal grid module", _GridModule);
		_GridModuleState = gms;
		_Model = m;
	
		// instance
		
		_GridModule.Instance = GridModule;
		_GridModule.Instance.prototype = new _Model.Instance();
		_GridModule.Instance.prototype.constructor = _GridModule.Instance;
		_GridModule.Instance.prototype.reset = reset;
		_GridModule.Instance.prototype.change_state = change_state;
		_GridModule.Instance.prototype.show_state = show_state;
		_GridModule.Instance.prototype.get_state = get_state;
		_GridModule.Instance.prototype.has_face_or_vertex_index = has_face_or_vertex_index;
		_GridModule.Instance.prototype.get_modules_connected = get_modules_connected;
		_GridModule.Instance.prototype.find_and_store_connected = find_and_store_connected;
		
		Object.defineProperty( _GridModule.Instance.prototype, 'connected', { 
			get: function () { return this._connected; }
		});
		
		Object.defineProperty( _GridModule.Instance.prototype, 'connectedList', { 
			get: function () { return this._connectedList; }
		});
		
		Object.defineProperty( _GridModule.Instance.prototype, 'grid', { 
			get: function () { return this._grid; },
			set: function ( grid ) {
				
				this._grid = grid;
				
				this._dirtyConnected = true;
				
				this.get_modules_connected();
				
			}
		});
		
		Object.defineProperty( _GridModule.Instance.prototype, 'occupied', { 
			get: function () { return Boolean( this.states.occupied.active ); }
		});
		
	}
	
	/*===================================================
	
	grid modules
	
	=====================================================*/
	
	function GridModule ( parameters ) {
		
		var me = this;
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.materials = new THREE.MeshLambertMaterial();
		
		// prototype constructor
		
		_Model.Instance.call( me, parameters );
		
		// store grid reference
		
		me.grid = parameters.grid;
		
		// states
		
		me.states = {};
		me.states.list = [
			'base',
			'occupied',
			'water'
		];
		
		me.states.overdraw = false;
		
		me.states.base = new _GridModuleState.Instance( {
			active: 1,
			dynamic: false,
			color: 0xe6b266,
			ambient: 0xe6b266
		} );
		me.states.water = new _GridModuleState.Instance( {
			priority: 1,
			color: 0x17DAF8,
			ambient: 0x17DAF8
		} );
		me.states.occupied = new _GridModuleState.Instance( {
			constant: false,
			color0: 0x0ccd6f,
			ambient0: 0x0ccd6f,
			color1: 0xff2830,
			ambient1: 0xff2830
		} );
		
		// set to base state
		
		me.reset();
		
	}
	
	function reset () {
		
		var states = this.states,
			statesList = states.list;
		
		// reset active for each state in states list
		
		this.change_state( statesList, false );
			
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
					
					this._dirtyStates = true;
					
				}
				
			}
			
		}
		
		// recalculate state showing
		
		this.show_state();
		
	}
	
	function show_state ( overdraw ) {
		
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
			
			this._dirtyStates = true;
			
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
			
			state.modify_material( this.material );
			
			// clear dirty
			
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
	
	function has_face_or_vertex_index( searchFor ) {
		
		var i, l,
			faces,
			face,
			has = false;
		
		// search all faces
		
		faces = this.geometry.faces;
		
		for ( i = 0, l = faces.length; i < l; i++ ) {
			
			face = faces[ i ];
			
			if ( ( ( searchFor instanceof THREE.Face4 || searchFor instanceof THREE.Face3 ) && searchFor === face ) 
				|| ( _MathHelper.is_number( searchFor ) && ( searchFor === face.a || searchFor === face.b || searchFor === face.c || searchFor === face.d ) ) ) {
				
				has = true;
				
				break;
				
			}
			
		}
		
		return has;
		
	}
		
	function get_modules_connected ( connected, recalculate ) {
		
		var i, l,
			j, k,
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
				
				faces = this.geometry.faces;
				
				for ( i = 0, l = faces.length; i < l; i++ ) {
					
					face = faces[ i ];
					
					// get connected sides
					
					// ab / up
					
					this.find_and_store_connected( face.a, face.b, [ 'ab', 'up' ] );
					
					// bc / left
					
					this.find_and_store_connected( face.b, face.c, [ 'bc', 'left' ] );
					
					// by face type
					
					if ( face instanceof THREE.Face4 ) {
						
						// cd / down
						
						this.find_and_store_connected( face.c, face.d, [ 'cd', 'down' ] );
						
						// da / right
						
						this.find_and_store_connected( face.d, face.a, [ 'da', 'right' ] );
						
					}
					else {
						
						// ca / right / down
						
						this.find_and_store_connected( face.c, face.a, [ 'ca', 'right', 'down' ] );
						
					}
					
					// get connected corners
					
					// a / upright
					
					this.find_and_store_connected( face.a, undefined, [ 'a', 'upright' ] );
					
					// b / upleft
					
					this.find_and_store_connected( face.b, undefined, [ 'b', 'upleft' ] );
					
					// c / downleft
					
					this.find_and_store_connected( face.c, undefined, [ 'c', 'downleft' ] );
					
					// d / downright
					
					this.find_and_store_connected( face.d, undefined, [ 'd', 'downright' ] );
					
				}
				
				// remove flag
				
				this._dirtyConnected = false;
				
			}
			
		}
		
		// add all connections to connected
		
		connected = connected.concat( this._connectedList );
		
		return connected;
		
	}
	
	function find_and_store_connected ( vertexIndexA, vertexIndexB, ids ) {
		
		var i, l,
			searchFor,
			connectedModules,
			connectedModule;
		
		// if grid is valid
		
		if ( typeof this.grid !== 'undefined' ) {
			
			// set search target(s)
			
			if ( typeof vertexIndexB !== 'undefined' ) {
				
				searchFor = [ vertexIndexA, vertexIndexB ];
				
			}
			else {
				
				searchFor = vertexIndexA;
				
			}
			
			// get connected modules
			
			connectedModules = this.grid.get_modules( searchFor, [ this ].concat( this._connectedList ) );
			
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
	
} (KAIOPUA) );