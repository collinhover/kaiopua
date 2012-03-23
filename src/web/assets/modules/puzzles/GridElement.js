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
		_MathHelper;
	
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
		
		// instance
		
		_GridElement.Instance = GridElement;
		_GridElement.Instance.prototype = new _Model.Instance();
		_GridElement.Instance.prototype.constructor = _GridElement.Instance;
		
		_GridElement.Instance.prototype.rotate = rotate;
		_GridElement.Instance.prototype.rotate_layout = rotate_layout;
		
		_GridElement.Instance.prototype.change_module = change_module;
		
		_GridElement.Instance.prototype.update = update;
		
		_GridElement.Instance.prototype.occupy_module = occupy_module;
		_GridElement.Instance.prototype.test_occupy_module = test_occupy_module;
		_GridElement.Instance.prototype.each_layout_element = _GridElement.each_layout_element = each_layout_element;
		_GridElement.Instance.prototype.get_center_layout = get_center_layout;
		
	}
	
	/*===================================================
    
    grid element
    
    =====================================================*/
	
	function GridElement ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.geometry = new THREE.CubeGeometry( 50, 100, 50 );
		parameters.materials = new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } );
		
		// prototype constructor
		
		_Model.Instance.call( this, parameters );
		
		// layout
		
		this.layout = generate_layout( parameters.layout );
		
		// modules layout
		
		this.layoutModules = this.layout.dup();
		
	}
	
	/*===================================================
    
    layout
    
    =====================================================*/
	
	function generate_layout ( source ) {
		
		var layout;
		
		// generate layout as matrix from source
		
		if ( source instanceof Matrix ) {
			
			layout = source;
			
		}
		else if ( main.is_array( source ) ) {
			
			layout = $M( source );
			
		}
		
		// if layout is not valid, fallback to default 1x1
		
		if ( layout instanceof Matrix !== true ) {
			
			layout = $M( [
				[ 1 ]
			] );
			/*
			layout = $M( [
				[ 0, 0, 0 ],
				[ 0, 1, 0 ],
				[ 0, 0, 0 ]
			] );
			*/
			/*
			layout = $M( [
				[ 0, 1, 1, 0, 0 ],
				[ 0, 0, 0, 1, 0 ],
				[ 0, 0, 1, 0, 0 ],
				[ 0, 0, 1, 0, 0 ],
				[ 0, 0, 0, 0, 0 ]
			] );
			*/
			/*layout = $M( [
				[ Math.round( Math.random() ), Math.round( Math.random() ), Math.round( Math.random() ) ],
				[ Math.round( Math.random() ), Math.round( Math.random() ), Math.round( Math.random() ) ],
				[ Math.round( Math.random() ), Math.round( Math.random() ), Math.round( Math.random() ) ]
			] );*/
			
		}
		
		// clamp layout values between 0 and 1, and force all non-zero to snap to 1
		
		layout = layout.map( function( x ) { return Math.ceil( _MathHelper.clamp( x, 0, 1 ) ); } );
		
		return layout;
		
	}
	
	/*===================================================
    
    rotation
    
    =====================================================*/
	
	function rotate ( degrees, testModule ) {
		
		this.rotate_layout( degrees, testModule );
		
	}
	
	function rotate_layout ( degrees, testModule ) {
		
		var layoutRotated,
			safeRotation = true;
		
		// rotate layout by degrees
		
		layoutRotated = _MathHelper.rotate_matrix2d_90( this.layout, degrees );
		
		// if layout was rotated
		
		if ( this.layout.eql( layoutRotated ) !== true ) {
			
			// test new layout
			
			testModule = testModule || this.module;
			
			if ( testModule instanceof _GridModule.Instance ) {
			
				safeRotation = this.test_occupy_module( testModule, true, false, layoutRotated );
				
			}
			
			// if rotation is safe or only testing
			
			if ( safeRotation || testModule !== this.module ) {
				
				this.layout = layoutRotated;
				
			}
			
		}
		
	}
	
	/*===================================================
    
    module
    
    =====================================================*/
	
	function change_module ( moduleNew, layoutModulesNew ) {
		
		// if is change
		
		if ( this.module !== moduleNew ) {
			
			// remove self from previous
			
			if ( typeof this.parent !== 'undefined' ) {
				
				this.parent.remove( this );
			
			}
			
			// for each module in previous layout modules
			
			if ( typeof this.layoutModules !== 'undefined' ) {
				
				// unoccupy
				
				this.each_layout_element( function ( layoutModule ) {
					
					if ( layoutModule instanceof _GridModule.Instance ) {
						
						layoutModule.occupant = undefined;
						
					}
					
				}, this.layoutModules );
				
			}
			
			// store
			
			this.module = moduleNew;
			
			this.layoutModules = layoutModulesNew;
			
			// if new module and layouts are valid
			
			if ( this.module instanceof _GridModule.Instance && typeof this.layoutModules !== 'undefined' ) {
				
				// add
				
				this.module.add( this );
				
				// for each module in layout modules set this as occupant
				
				this.each_layout_element( function ( layoutModule ) {
					
					if ( layoutModule instanceof _GridModule.Instance ) {
						
						layoutModule.occupant = this;
						
					}
					
				}, this.layoutModules );
				
			}
			
		}
		
	}
	
	function occupy_module ( module ) {
		
		var occupied = this.test_occupy_module( module, true, true );
		
		return occupied;
		
	}
	
	function test_occupy_module ( testModule, show, occupy, testLayout ) {
		
		var i, l,
			success = 0,
			dimensions,
			rows,
			cols,
			center,
			testResults,
			spreadRecord,
			testLayoutModules;
		
		// change test modules
			
		if ( this.testModule !== testModule ) {
			
			// remove self from current parent
			
			if ( typeof this.parent !== 'undefined' ) {
				
				// if has module, add this to it
				
				if ( this.module instanceof _GridModule.Instance ) {
					
					this.module.add( this );
					
				}
				// otherwise just remove 
				else {
					
					this.parent.remove( this );
					
				}
				
			}
			
			// store as test
			
			this.testModule = testModule;
			
		}
		
		// valid testModule
		
		if ( typeof testModule !== 'undefined' ) {
			
			// add
			
			if ( this.parent !== testModule ) {
				
				testModule.add( this );
				
			}
			
			// snap to
			
			_ObjectHelper.object_follow_object( this, testModule );
			
			// clean testModule's grid
			
			if ( typeof testModule.grid !== 'undefined' ) {
				
				testModule.grid.clean();
				
			}
			
			// basics
			
			testLayout = testLayout || this.layout;
			dimensions = this.layout.dimensions();
			rows = dimensions.rows;
			cols = dimensions.cols;
			center = this.get_center_layout();
			testResults = Matrix.Zero( rows, cols );
			spreadRecord = testResults.dup();
			testLayoutModules = testResults.dup();
			
			// return recursive test results
			
			success = test_spread( testModule, testLayout, testResults, spreadRecord, center.row, center.col, rows, cols, testLayoutModules );
			
			// show test results of occupy on modules tested
			
			if ( show === true ) {
				
				this.each_layout_element( function ( testLayoutModule ) {
					
					if ( testLayoutModule instanceof _GridModule.Instance ) {
						
						testLayoutModule.show_state( 'occupied', 1 - success );
						
					}
					
				}, testLayoutModules );
				
			}
			
			// if successful and should occupy
			
			if ( success && occupy === true ) {
				
				this.change_module( testModule, testLayoutModules );
				
			}
			
		}
		
		return Boolean( success );
		
	}
	
	function test_spread ( testModule, testLayout, testResults, spreadRecord, rowIndex, colIndex, numRows, numCols, testLayoutModules ) {
		
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
				
				testLayoutModules.elements[ rowArr ][ colArr ] = testModule;
				
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
						
						successNext = test_spread( moduleNext, testLayout, testResults, spreadRecord, rowNext, colNext, numRows, numCols, testLayoutModules );
						
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
	
	function each_layout_element ( methods, layout ) {
		
		layout = layout || this.layout;
		
		var i, il,
			j, jl,
			m, ml,
			elements = layout.elements,
			row,
			node,
			method;
		
		// handle parameters
		
		methods = main.ensure_array( methods );
		
		// for each row
		
		for ( i = 0, il = elements.length; i < il; i++ ) {
			
			row = elements[ i ];
			
			// for each column
			
			for ( j = 0, jl = row.length; j < jl; j++ ) {
				
				node = row[ j ];
				
				// for each node
				
				for ( m = 0, ml = methods.length; m < ml; m++ ) {
					
					method = methods[ m ];
					
					// call method and pass node and row and column indices
					
					method.call( this, node, i, j );
					
				}
				
			}
			
		}
		
	}
	
	function get_center_layout ( layout ) {
		
		layout = layout || this.layout;
		
		var dimensions = layout.dimensions(),
			centerRow = Math.ceil( dimensions.rows * 0.5 ),
			centerCol = Math.ceil( dimensions.cols * 0.5 );
		
		return { row: centerRow, col: centerCol };
		
	}
	
} (KAIOPUA) );