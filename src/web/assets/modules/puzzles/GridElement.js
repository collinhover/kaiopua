/*
 *
 * GridElement.js
 * Basic element of puzzle solving.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/puzzles/GridElement.js",
		_GridElement = {},
		_Model,
		_GridModule,
		_ObjectHelper,
		_MathHelper,
		rotationAxis,
		utilQ1Rotate;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _GridElement,
		requirements: [
			"assets/modules/core/Model.js",
			"assets/modules/puzzles/GridModule.js",
			"assets/modules/utils/ObjectHelper.js",
			"assets/modules/utils/MathHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal( m, gm, oh, mh ) {
		console.log('internal grid element', _GridElement);
		
		_Model = m;
		_GridModule = gm;
		_ObjectHelper = oh;
		_MathHelper = mh;
		
		// utils
		
		utilQ1Rotate = new THREE.Quaternion();
		
		// properties
		
		rotationAxis = new THREE.Vector3( 0, 1, 0 );
		_GridElement.NODE_EMPTY = 0;
		_GridElement.NODE_SELF = 1;
		
		// instance
		
		_GridElement.Instance = GridElement;
		
		_GridElement.Instance.prototype.clone = clone;
		
		_GridElement.Instance.prototype.rotate = rotate;
		_GridElement.Instance.prototype.rotate_reset = rotate_reset;
		_GridElement.Instance.prototype.rotate_layout = rotate_layout;
		
		_GridElement.Instance.prototype.change_module = change_module;
		
		_GridElement.Instance.prototype.update = update;
		
		_GridElement.Instance.prototype.occupy_module = occupy_module;
		_GridElement.Instance.prototype.test_occupy_module = test_occupy_module;
		_GridElement.Instance.prototype.each_layout_element = each_layout_element;
		
		_GridElement.Instance.prototype.get_layout_node_total = get_layout_node_total
		_GridElement.Instance.prototype.get_layout_center_location = get_layout_center_location;
		_GridElement.Instance.prototype.get_layout_center_offset = get_layout_center_offset;
		
	}
	
	/*===================================================
    
    grid element
    
    =====================================================*/
	
	function GridElement ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		// properties
				
		this.rotationAngle = this.rotationAngleLayout = 0;
		
		// layout
		
		generate_layout.call( this, parameters.layout );
		
		// models
		
		generate_models.call( this, parameters );
		
	}
	
	/*===================================================
    
    clone
    
    =====================================================*/
	
	function clone ( c ) {
		
		var cGeometry,
			cGeometryMiniature;
		
		if ( typeof c === 'undefined' ) {
			
			c = new _GridElement.Instance();
			
		}
		
		if ( c instanceof _GridElement.Instance ) {
			
			// properties
			
			c.rotationAngle = this.rotationAngle;
			c.rotationAngleLayout = this.rotationAngleLayout;
			
			// layout
			
			generate_layout.call( c, this.layout );
			
			// geometry
			
			cGeometry = _ObjectHelper.clone_geometry( this.geometry );
			
			if ( this.geometry !== this.geometryMiniature ) {
				
				cGeometryMiniature = _ObjectHelper.clone_geometry( this.geometryMiniature );
				
			}
			
			// models
			
			generate_models.call( c, {
				materials: _ObjectHelper.clone_materials( this.material ),
				geometry: cGeometry,
				geometryMiniature: cGeometryMiniature
			} );
			
		}
		
		return c;
		
	}
	
	/*===================================================
    
    layout
    
    =====================================================*/
	
	function generate_layout ( layout ) {
		
		// generate layout as matrix
		
		if ( layout instanceof Matrix ) {
			
			this.layout = layout;
			
		}
		else if ( main.is_array( layout ) ) {
			
			this.layout = $M( layout );
			
		}
		
		// if layout is not valid, fallback to default 1x1
		
		if ( this.layout instanceof Matrix !== true ) {
			
			this.layout = $M( [
				[ _GridElement.NODE_SELF ]
			] );
			/*
			this.layout = $M( [
				[ 0, 0, 0 ],
				[ 0, 1, 0 ],
				[ 0, 0, 0 ]
			] );
			*/
			/*
			this.layout = $M( [
				[ 0, 1, 1, 0, 0 ],
				[ 0, 0, 0, 1, 0 ],
				[ 0, 0, 1, 0, 0 ],
				[ 0, 0, 1, 0, 0 ],
				[ 0, 0, 0, 0, 0 ]
			] );
			*/
			/*
			this.layout = $M( [
				[ Math.round( Math.random() ), Math.round( Math.random() ), Math.round( Math.random() ) ],
				[ Math.round( Math.random() ), Math.round( Math.random() ), Math.round( Math.random() ) ],
				[ Math.round( Math.random() ), Math.round( Math.random() ), Math.round( Math.random() ) ]
			] );
			*/
			
		}
		
		// modules matrix from layout
		
		this.modules = this.layout.dup();
		
	}
	
	/*===================================================
    
    models
    
    =====================================================*/
	
	function generate_models ( parameters ) {
		
		var model,
			miniature;
		
		// handle parameters
		
		parameters = parameters || {};
		parameters.model = parameters.model || {};
		parameters.miniature = parameters.miniature || {};
		
		// properties
		
		this.material = parameters.model.materials = parameters.miniature.materials = main.ensure_not_array( parameters.materials || new THREE.MeshLambertMaterial( { vertexColors: THREE.VertexColors, shading: THREE.SmoothShading } ) );
		
		this.geometry = parameters.model.geometry = parameters.model.geometry || parameters.geometry;
		this.geometryMiniature = parameters.miniature.geometry = parameters.miniature.geometry || parameters.geometryMiniature || parameters.model.geometry;
		
		if ( typeof this.geometry === 'string' ) {
			
			this.geometry = parameters.model.geometry = main.get_asset_data( this.geometry );
			
		}
		if ( typeof this.geometryMiniature === 'string' ) {
			
			this.geometryMiniature = parameters.miniature.geometry = main.get_asset_data( this.geometryMiniature );
			
		}
		
		// lists
		
		this.models = [];
		
		if ( this.geometryMiniature === this.geometry ) {
			
			this.miniatures = this.models;
			
		}
		else {
			
			this.miniatures = [];
			
		}
		
		// create all models
		
		if ( this.geometry && this.material ) {
			
			each_layout_element.call( this, this.layout, function ( node ) {
				
				if ( node === _GridElement.NODE_SELF )  {
					
					// model
					
					model = new _Model.Instance( parameters.model );
					
					this.models.push( model );
					
					// miniature
					
					if ( this.geometryMiniature !== this.geometry ) {
						
						miniature = new _Model.Instance( parameters.miniature );
						
						this.miniatures.push( miniature );
						
					}
					
				}
				
			} );
			
		}
		
	}
	
	function add_models ( models ) {
		
		occupy_modules.call( this, models, true );
		
	}
	
	function remove_models () {
		
		var i, l,
			model;
		
		for ( i = 0, l = this.models.length; i < l; i++ ) {
			
			model = this.models[ i ];
			
			if ( typeof model.parent !== 'undefined' ) {
				
				model.parent.remove( model );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    rotation
    
    =====================================================*/
	
	function rotate ( radians, testModule ) {
		
		var q = utilQ1Rotate,
			angle;
		
		// add degrees
		
		this.rotationAngle = ( this.rotationAngle + radians ) % ( Math.PI * 2 );
		/*
		// rotate self
		// modify degrees based on cardinal right axis
		
		angle = shared.cardinalAxes.right.x * radians;
		q.setFromAxisAngle( rotationAxis, angle );
		
		this.quaternion.multiplySelf( q );
		*/
		// rotate layout
		
		this.rotate_layout( this.rotationAngle, testModule );
		
	}
	
	function rotate_reset () {
		
		var angle;
		
		// if is not a 1x1 layout
		// snap self back to last layout rotation angle
		
		if ( this.get_layout_node_total( this.layout, _GridElement.NODE_SELF ) > 1 ) {
			
			this.rotationAngle = this.rotationAngleLayout;
			/*
			angle = shared.cardinalAxes.right.x * this.rotationAngle;
			
			this.quaternion.setFromAxisAngle( rotationAxis, angle );
			*/
		}
		
	}
	
	function rotate_layout ( angle, testModule ) {
		
		var angleDelta = _MathHelper.shortest_rotation_between_angles( this.rotationAngleLayout, angle ),
			layoutRotated,
			safeRotation = true;
		
		// rotate layout by angleDelta
		
		layoutRotated = _MathHelper.rotate_matrix2d_90( this.layout, _MathHelper.rad_to_degree( angleDelta ) );
		
		// if layout was rotated
		
		if ( this.layout.eql( layoutRotated ) !== true ) {
			
			// test new layout
			
			testModule = testModule || this.module;
			
			if ( testModule instanceof _GridModule.Instance ) {
			
				safeRotation = this.test_occupy_module( testModule, true, false, layoutRotated );
				
			}
			
			// if rotation is safe or only testing
			
			if ( safeRotation || testModule !== this.module ) {
				
				this.rotationAngleLayout += ( Math.PI * 0.5 ) * _MathHelper.round_towards_zero( angleDelta / ( Math.PI * 0.5 ) );
				
				this.layout = layoutRotated;
				
			}
			
		}
		
	}
	
	/*===================================================
    
    module
    
    =====================================================*/
	
	function change_module ( moduleNew, modulesNew ) {
		
		var models,
			model;
		
		// if is change
		
		if ( this.module !== moduleNew ) {
			
			// for each module in previous layout modules
			
			if ( typeof this.modules !== 'undefined' ) {
				
				// unoccupy
				
				unoccupy_modules.call( this );
				
			}
			
			// store
			
			this.module = moduleNew;
			
			this.modules = modulesNew;
			
			// if module and layouts are valid
			
			if ( this.module instanceof _GridModule.Instance && typeof this.modules !== 'undefined' ) {
				
				occupy_modules.call( this );
			
			}
			
		}
		
	}
	
	function unoccupy_modules () {
		
		// for each module in layout modules add model as occupant
		
		each_layout_element.call( this, this.modules, function ( layoutModule ) {
			
			if ( layoutModule instanceof _GridModule.Instance ) {
				
				layoutModule.occupant = undefined;
				
			}
			
		} );
		
	}
	
	function occupy_modules ( models, temporary ) {
		
		models = models || this.models;
		
		var modelCount = 0,
			model;
		
		// for each module in layout modules add model as occupant
		
		each_layout_element.call( this, this.modules, function ( layoutModule ) {
			
			if ( layoutModule instanceof _GridModule.Instance ) {
				
				model = models[ modelCount ];
				modelCount++;
				
				if ( temporary === true ) {
					
					layoutModule.add( model );

				}
				else {
					
					layoutModule.occupant = model;
					
				}
				
			}
			
		} );
		
	}
	
	function occupy_module ( module ) {
		
		var occupied = this.test_occupy_module( module, true, true );
		
		return occupied;
		
	}
	
	function test_occupy_module ( testModule, show, occupy, testLayout ) {
		
		var i, l,
			modelCount = 0,
			model,
			success = 0,
			dimensions,
			rows,
			cols,
			center,
			testResults,
			spreadRecord,
			testModules,
			moduleDimensions,
			modulesWidthTotal = 0,
			modulesDepthTotal = 0,
			modulesCount = 0,
			avgModuleWidth,
			avgModuleDepth;
		
		// change test modules
			
		if ( this.testModule !== testModule ) {
			
			// if no new test module add to current module
			if ( testModule instanceof _GridModule.Instance !== true && this.module instanceof _GridModule.Instance ) {
				
				add_models.call( this );
				
			}
			// remove models from current module
			else if ( this.testModule !== this.module ) {
				
				remove_models.call( this );
				
			}
			
			
			// store as test
			
			this.testModule = testModule;
			
		}
		
		// valid testModule
		
		if ( typeof testModule !== 'undefined' ) {
			
			// clean testModule's grid
			
			if ( typeof testModule.grid !== 'undefined' ) {
				
				testModule.grid.clean();
				
			}
			
			// basics
			
			testLayout = testLayout || this.layout;
			dimensions = testLayout.dimensions();
			rows = dimensions.rows;
			cols = dimensions.cols;
			center = get_layout_center_location( testLayout );
			testResults = Matrix.Zero( rows, cols );
			spreadRecord = testResults.dup();
			testModules = testResults.dup();
			
			// return recursive test results
			
			success = test_spread( testModule, testLayout, testResults, spreadRecord, center.row, center.col, rows, cols, testModules );
			
			// modules tested
			
			each_layout_element.call( this, testModules, function ( testLayoutModule ) {
				
				if ( testLayoutModule instanceof _GridModule.Instance ) {
					
					model = this.models[ modelCount ];
					modelCount++;
					
					// add
					
					testLayoutModule.add( model );
					
					// show test results of occupy
					
					if ( show === true ) {
						
						testLayoutModule.show_state( 'occupied', 1 - success );
						
					}
					
				}
				
			} );
			
			// if successful and should occupy
			
			if ( success && occupy === true ) {
				
				this.change_module( testModule, testModules );
				
			}
			
		}
		
		return Boolean( success );
		
	}
	
	function test_spread ( testModule, testLayout, testResults, spreadRecord, rowIndex, colIndex, numRows, numCols, testModules ) {
		
		var i, l,
			j, k,
			success = 1,
			successNext,
			connected,
			moduleNext,
			index,
			elements = testLayout.elements,
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
			
			// if testModule is valid
			
			if ( testModule instanceof _GridModule.Instance ) {
				
				// test success
				
				success = 1 - testModule.occupied;
				
				// add testModule to layout map
				
				testModules.elements[ rowArr ][ colArr ] = testModule;
				
			}
			// no module where needed
			else {
				
				success = 0;
				
			}
			
			// store success
			
			elementsTR[ rowArr ][ colArr ] = success;
			
		}
		
		// if testModule is valid
			
		if ( testModule instanceof _GridModule.Instance ) {
			
			// get square around testModule in layout
			
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
			
			connected = testModule.connected;
			
			for ( i = 0, l = rowsSq; i < l; i++ ) {
				
				for ( j = 0, k = colsSq; j < k; j++ ) {
					
					rowNext = rowMin + i;
					colNext = colMin + j;
					
					// get next testModule
					
					moduleNext = connected[ ( ( i + ( 1 - rowIndexToMin ) ) * 3 + ( j + ( 1 - colIndexToMin ) ) ) ];
					
					// if testModule location not tested yet
					
					if ( spreadRecord.e( rowNext, colNext ) !== 1 ) {
						
						successNext = test_spread( moduleNext, testLayout, testResults, spreadRecord, rowNext, colNext, numRows, numCols, testModules );
						
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
    
    update
    
    =====================================================*/
	
	function update () {
		
	}
	
	/*===================================================
    
    utility
    
    =====================================================*/
	
	function each_layout_element ( layout, callback ) {
		
		layout = layout || this.layout;
		
		var i, il,
			j, jl,
			elements = layout.elements,
			row,
			node;
		
		// for each row
		
		for ( i = 0, il = elements.length; i < il; i++ ) {
			
			row = elements[ i ];
			
			// for each column
			
			for ( j = 0, jl = row.length; j < jl; j++ ) {
				
				node = row[ j ];
				
				// call method and pass node and row and column indices
				
				callback.call( this, node, i, j );
				
			}
			
		}
		
	}
	
	function get_layout_node_total ( layout, nodeType ) {
		
		var nodeTotal = 0;
		
		nodeType = main.is_number( nodeType ) ? nodeType : -1;
		
		each_layout_element.call( this, layout, function ( node ) {
			
			if ( ( typeof nodeType === 'undefined' && node > 0 ) || ( main.is_number( nodeType ) ? node === nodeType : node instanceof nodeType ) )  {
				
				nodeTotal += 1;
				
			}
			
		} );
		
		return nodeTotal;
		
	}
	
	function get_layout_center_location ( layout ) {
		
		layout = layout || this.layout;
		
		var dimensions = layout.dimensions(),
			centerRow = Math.ceil( dimensions.rows * 0.5 ),
			centerCol = Math.ceil( dimensions.cols * 0.5 );
		
		return { row: centerRow, col: centerCol };
		
	}
	
	function get_layout_center_offset ( layout ) {
		
		var nodeTotal = 0,
			iTotal = 0,
			jTotal = 0;
		
		each_layout_element.call( this, layout, function ( node, i, j ) {
			
			if ( node > 0 ) {
				
				iTotal += i;
				jTotal += j;
				nodeTotal++;
				
			}
			
		} );
		
		return { row: iTotal / nodeTotal, col: jTotal / nodeTotal };
		
	}
	
} (KAIOPUA) );