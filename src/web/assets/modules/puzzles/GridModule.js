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
		_GridElement,
		states;
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	main.asset_register( assetPath, {
		data: _GridModule,
		requirements: [
			"assets/modules/core/Model.js",
			"assets/modules/puzzles/GridModuleState.js",
			"assets/modules/puzzles/GridElement.js",
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
	
	init
	
	=====================================================*/
	
	function init_internal ( m, gms, ge ) {
		console.log("internal grid module", _GridModule);
		_Model = m;
		_GridModuleState = gms;
		_GridElement = ge;
	
		// instance
		
		_GridModule.Instance = GridModule;
		_GridModule.Instance.prototype = new _Model.Instance();
		_GridModule.Instance.prototype.constructor = _GridModule.Instance;
		_GridModule.Instance.prototype.reset = reset;
		_GridModule.Instance.prototype.change_state = change_state;
		_GridModule.Instance.prototype.show_state = show_state;
		_GridModule.Instance.prototype.get_state = get_state;
		_GridModule.Instance.prototype.add_grid_element = add_grid_element;
		_GridModule.Instance.prototype.test_grid_element = test_grid_element;
		_GridModule.Instance.prototype.has_face_or_vertex = has_face_or_vertex;
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
			get: function () { return this.states.occupied.active; }
		});
		
	}
	
	/*===================================================
	
	grid modules
	
	=====================================================*/
	
	function GridModule ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.materials = new THREE.MeshLambertMaterial();
		
		parameters.center = true;
		
		// prototype constructor
		
		_Model.Instance.call( this, parameters );
		
		// store grid reference
		
		this.grid = parameters.grid;
		
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
			color: 0xe6b266,
			ambient: 0xe6b266
		} );
		this.states.water = new _GridModuleState.Instance( {
			priority: 1,
			color: 0x17DAF8,
			ambient: 0x17DAF8
		} );
		this.states.occupied = new _GridModuleState.Instance( {
			constant: false,
			color0: 0x0ccd6f,
			ambient0: 0x0ccd6f,
			color1: 0xff2830,
			ambient1: 0xff2830
		} );
		
		// set to base state
		
		this.reset();
		
	}
	
	function reset () {
		
		var states = this.states,
			statesList = states.list;
		
		// reset active for each state in states list
		
		this.change_state( statesList, false );
			
	}
	
	/*===================================================
	
	states
	
	=====================================================*/
	
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
			
			state.modify_material( this.material, activeLevel );
			
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
	
	/*===================================================
	
	grid elements
	
	=====================================================*/
	
	function add_grid_element ( gridElement, show ) {
		
		return this.test_grid_element( gridElement, show, true );
		
	}
	
	function test_grid_element ( gridElement, show, add ) {
		
		var i, l,
			success = 0,
			layout,
			dimensions,
			rows,
			cols,
			testResults,
			spreadRecord,
			center,
			modulesTested,
			moduleTested;
		
		// valid grid element
		
		if ( gridElement instanceof _GridElement.Instance ) {
			
			// basics
			
			layout = gridElement.layout;
			dimensions = layout.dimensions();
			rows = dimensions.rows;
			cols = dimensions.cols;
			testResults = Matrix.Zero( rows, cols );
			spreadRecord = testResults.dup();
			center = gridElement.get_center_layout();
			modulesTested = [];
			
			// return recursive test results
			
			success = test_grid_element_spread( this, layout, testResults, spreadRecord, center.row, center.col, rows, cols, modulesTested );
			
			// show / add test results of grid element on modules tested
			// force occupied state to match success
			
			for ( i = 0, l = modulesTested.length; i < l; i++ ) {
				
				moduleTested = modulesTested[ i ];
				
				// show if required
				
				if ( show === true ) {
				
					moduleTested.show_state( 'occupied', 1 - success );
					
				}
				
				// add if successful and required
				
				if ( success && add === true ) {
					
					moduleTested.change_state( 'occupied', true );
					
				}
				
			}
			
		}
		
		return Boolean( success );
		
	}
	
	function test_grid_element_spread ( module, layout, testResults, spreadRecord, rowIndex, colIndex, numRows, numCols, modulesTested ) {
		
		var i, l,
			j, k,
			success = 1,
			successNext,
			connected,
			moduleNext,
			index,
			elements = layout.elements,
			elementsTR = testResults.elements,
			elementsSR = spreadRecord.elements,
			element,
			rowNext,
			rowArr = Math.max( 0, rowIndex - 1 ),
			rowMin,
			rowIndexToMin,
			rowMax,
			rowsSq,
			colNext,
			colArr = Math.max( 0, colIndex - 1 ),
			colMin,
			colIndexToMin,
			colMax,
			colsSq;
		
		// update spread record
		
		elementsSR[ rowArr ][ colArr ] = 1;
		
		// test element
			
		element = elements[ rowArr ][ colArr ];
		
		// if layout element present
		
		if ( element === 1 ) {
			
			// if module is valid
			
			if ( module instanceof _GridModule.Instance ) {
				
				// test success
				
				success = 1 - module.occupied;
				
				// add module to tested list
				
				index = modulesTested.indexOf( module );
				
				if ( index === -1 ) {
					
					modulesTested.push( module );
					
				}
				
			}
			// no module where needed
			else {
				
				success = 0;
				
			}
			
			// store success
			
			elementsTR[ rowArr ][ colArr ] = success;
			
		}
		
		// if module is valid
			
		if ( module instanceof _GridModule.Instance ) {
			
			// get square around module in layout
			
			rowMin = Math.max( 1, rowArr );
			rowIndexToMin = rowIndex - rowMin;
			rowMax = Math.min( numRows, rowIndex + 1 );
			rowsSq = Math.min( numRows, rowMax - rowMin + 1 );
			colMin = Math.max( 1, colArr );
			colIndexToMin = colIndex - colMin;
			colMax = Math.min( numCols, colIndex + 1 );
			colsSq = Math.min( numCols, colMax - colMin + 1 );
			
			// spread to all connected modules
			// continue even if unsuccessful to record all modules affected by layout
			
			connected = module.connected;
			
			for ( i = 0, l = rowsSq; i < l; i++ ) {
				
				for ( j = 0, k = colsSq; j < k; j++ ) {
					
					rowNext = rowMin + i;
					colNext = colMin + j;
					
					// get next module
					
					moduleNext = connected[ ( ( i + ( 1 - rowIndexToMin ) ) * 3 + ( j + ( 1 - colIndexToMin ) ) ) ];
					
					// if module location not tested yet
					
					if ( spreadRecord.e( rowNext, colNext ) !== 1 ) {
						
						successNext = test_grid_element_spread( moduleNext, layout, testResults, spreadRecord, rowNext, colNext, numRows, numCols, modulesTested );
						
						// record next success while successful
						
						if ( success ) {
							success = successNext;
						}
						
					}
					
				}
				
			}
			
		}
			
		return success;
		
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