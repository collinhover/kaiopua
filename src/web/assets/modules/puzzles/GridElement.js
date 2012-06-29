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
		_GridModel,
		_GridModule,
		_ObjectHelper,
		_MathHelper,
		gridElementCount = 0,
		rotationAxis,
		utilQ1Rotate;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _GridElement,
		requirements: [
			"assets/modules/puzzles/GridModel.js",
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
		
		_GridModel = m;
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
		
		_GridElement.Instance.prototype.customize = customize;
		
		_GridElement.Instance.prototype.occupy_modules = occupy_modules;
		_GridElement.Instance.prototype.unoccupy_modules = unoccupy_modules;
		
		_GridElement.Instance.prototype.rotate = rotate;
		_GridElement.Instance.prototype.rotate_reset = rotate_reset;
		
		_GridElement.Instance.prototype.change_module = change_module;
		_GridElement.Instance.prototype.occupy_module = occupy_module;
		_GridElement.Instance.prototype.test_occupy_module_smart = test_occupy_module_smart;
		_GridElement.Instance.prototype.test_occupy_module = test_occupy_module;
		_GridElement.Instance.prototype.show_last_modules_tested = show_last_modules_tested;
		_GridElement.Instance.prototype.each_layout_element = each_layout_element;
		
		_GridElement.Instance.prototype.get_layout_node_total = get_layout_node_total
		_GridElement.Instance.prototype.get_layout_center_location = get_layout_center_location;
		_GridElement.Instance.prototype.get_layout_center_offset = get_layout_center_offset;
		
		Object.defineProperty( _GridElement.Instance.prototype, 'customized', { 
			get: function () { return this.customizations && this.geometry !== this.customizations.geometry; }
		});
		
		Object.defineProperty( _GridElement.Instance.prototype, 'hasCustomModels', { 
			get: function () { return this.customizations && main.is_array( this.customizations.models ); }
		});
		
		Object.defineProperty( _GridElement.Instance.prototype, 'hasModule', { 
			get: function () { return this.module instanceof _GridModule.Instance && typeof this.modules !== 'undefined'; }
		});
		
	}
	
	/*===================================================
    
    grid element
    
    =====================================================*/
	
	function GridElement ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		// properties
		
		this.id = gridElementCount++;
		this.rotationAngle = this.rotationAngleLayout = 0;
		this.material = parameters.material || new THREE.MeshLambertMaterial( { vertexColors: THREE.VertexColors, shading: THREE.SmoothShading } );
		this.geometry = typeof parameters.geometry === 'string' ? main.get_asset_data( parameters.geometry ) : parameters.geometry;
		this.eventHandles = {};

		// layout
		
		this.layout = generate_layout.call( this, parameters.layout );
		
		// modules matrix from layout
		
		this.modules = this.layout.dup();
		
		// models
		
		this.models = generate_models.call( this, parameters.models );
		
		// customizations
		
		this.customize( parameters.customizations );
		
	}
	
	/*===================================================
    
    clone
    
    =====================================================*/
	
	function clone ( c ) {
		
		var cMaterial,
			cMaterialCustom,
			cGeometry,
			cGeometryCustom;
		
		if ( typeof c === 'undefined' ) {
			
			c = new _GridElement.Instance();
			
		}
		
		if ( c instanceof _GridElement.Instance ) {
			
			// properties
			
			c.rotationAngle = this.rotationAngle;
			c.rotationAngleLayout = this.rotationAngleLayout;
			c.material = _ObjectHelper.clone_material( this.material );
			c.geometry = _ObjectHelper.clone_geometry( this.geometry );
			
			// layout
			
			c.layout = generate_layout.call( c, this.layout );
			
			// modules matrix from layout
			
			c.modules = c.layout.dup();
			
			// basic models
			
			c.models = generate_models.call( c );
			
			// customize
			
			customize.call( c, this.customizations );
			
			// handle customizations that need clone
			
			if ( this.customized ) {
			
				c.customizations.material = _ObjectHelper.clone_material( this.customizations.material );
				c.customizations.geometry = _ObjectHelper.clone_geometry( this.customizations.geometry );

			}
			
		}
		
		return c;
		
	}
	
	/*===================================================
    
    customizations
    
    =====================================================*/
	
	function customize ( parameters ) {
		
		var c;
		
		// handle parameters
		
		parameters = parameters || {};
		
		c = this.customizations = this.hasOwnProperty( 'customizations' ) ? this.customizations : {};
		
		c.material = parameters.material || c.material;
		c.geometry = parameters.geometry || c.geometry || this.geometry;
		
		// ensure proper material
		
		if ( c.material === true ) {

			c.material = _ObjectHelper.clone_material( this.material );
			
		}
		else if ( c.material instanceof THREE.Material !== true ) {

			c.material = this.material;
			
		}
		
		// if custom is different from primary
		
		if ( this.customized === true ) {
			
			// set dirty
			
			this._dirtyCustomizations = true;
			
			// occupy
			
			this.occupy_modules();
			
		}
		
	}
	
	/*===================================================
    
    layout
    
    =====================================================*/
	
	function generate_layout ( layoutSource ) {
		
		var layout;
		
		// generate layout as matrix
		
		if ( layoutSource instanceof Matrix ) {
			
			layout = layoutSource;
			
		}
		else if ( main.is_array( layoutSource ) ) {
			
			layout = $M( layoutSource );
			
		}
		
		// if layout is not valid, fallback to default 1x1
		
		if ( layout instanceof Matrix !== true ) {
			
			layout = $M( [
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
		
		return layout;
		
	}
	
	/*===================================================
    
    models
    
    =====================================================*/	
	
	function generate_models ( parameters ) {
		
		var models = [],
			model;
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.gridElement = this;
		parameters.material = parameters.material || this.material;
		parameters.geometry = parameters.geometry || this.geometry;
		
		// if valid properties
		
		if ( parameters.material && parameters.geometry ) {
			
			// create all models
			
			each_layout_element.call( this, this.layout, function ( node ) {
				
				if ( node === _GridElement.NODE_SELF )  {
					
					// model
					
					model = new _GridModel.Instance( parameters );
					
					models.push( model );
					
				}
				
			} );
			
		}
		
		return models;
		
	}
	
	function add_models ( models ) {
		
		var modelCount = 0,
			model;
		
		models = models || this.modelsCurrent;
		
		// for each module in layout modules add model as occupant
		
		each_layout_element.call( this, this.modules, function ( layoutModule ) {
			
			if ( layoutModule instanceof _GridModule.Instance ) {
				
				model = models[ modelCount ];
				modelCount++;
				
				layoutModule.add( model );
				
			}
			
		} );
		
	}
	
	function remove_models ( models ) {
		
		var i, l,
			model;
		
		models = models || this.modelsCurrent;
		
		for ( i = 0, l = models.length; i < l; i++ ) {
			
			model = models[ i ];
			
			if ( typeof model.parent !== 'undefined' ) {
				
				model.parent.remove( model );
				
			}
			
		}
		
	}
	
	function occupy_modules () {
		
		var c,
			modelCount = 0,
			models,
			model;
		
		// if module and layouts are valid
		
		if ( this.hasModule ) {
			
			// get models list
			
			// if module active use customized
			
			if ( this.customized === true && this.module.active === true ) {
				
				// if needs customized models
				
				c = this.customizations;
				
				if ( this.hasCustomModels !== true || this._dirtyCustomizations === true ) {
					
					c.models = generate_models.call( this, c );
					this._dirtyCustomizations = false;
					
				}
				
				models = c.models;
				
			}
			// else use base models
			else {
				
				models = this.models;
				
			}
			
			// if does not match current models
			
			if ( this.modelsCurrent !== models || this._dirtyModule === true ) {
				console.log( this, ' OCCUPY modules' );
				this.modelsCurrent = models;
				this._dirtyModule = false;
				
				// for each module in layout modules add model as occupant
				
				each_layout_element.call( this, this.modules, function ( layoutModule ) {
					
					if ( layoutModule instanceof _GridModule.Instance ) {
						
						model = models[ modelCount ];
						modelCount++;
						
						layoutModule.occupant = model;
						
					}
					
				} );
				
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
	
	/*===================================================
    
    rotation
    
    =====================================================*/
	
	function rotate ( radians, testModule, show, occupy, force ) {
		
		var q = utilQ1Rotate,
			angle,
			angleDelta,
			layoutRotated,
			safeRotation = true;
		
		// add degrees
		
		this.rotationAngle = ( this.rotationAngle + radians ) % ( Math.PI * 2 );
		/*
		// rotate self
		// modify degrees based on cardinal right axis
		
		angle = shared.cardinalAxes.right.x * radians;
		q.setFromAxisAngle( rotationAxis, angle );
		
		this.quaternion.multiplySelf( q );
		*/
		// angle from current to new
		
		angleDelta = _MathHelper.shortest_rotation_between_angles( this.rotationAngleLayout, this.rotationAngle )
		
		// rotate layout by angleDelta
		
		layoutRotated = _MathHelper.rotate_matrix2d_90( this.layout, _MathHelper.rad_to_degree( angleDelta ) );
		
		// if layout was rotated
		
		if ( this.layout.eql( layoutRotated ) !== true || force === true ) {
			
			// test new layout
			
			testModule = testModule || this.module;
			
			if ( testModule instanceof _GridModule.Instance ) {
			
				safeRotation = this.test_occupy_module( testModule, show, occupy, layoutRotated );
				
			}
			
			// if rotation is safe or only testing
			
			if ( safeRotation || testModule !== this.module ) {
				
				this.rotationAngleLayout += ( Math.PI * 0.5 ) * _MathHelper.round_towards_zero( angleDelta / ( Math.PI * 0.5 ) );
				
				this.layout = layoutRotated;
				
			}
			
		}
		
		return safeRotation;
		
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
	
	/*===================================================
    
    module
    
    =====================================================*/
	
	function change_module ( moduleNew, modulesNew ) {
		
		var models,
			model;
		
		// if is change
		
		if ( this.module !== moduleNew ) {
			console.log( this, ' change module from ', this.module, ' >> to ', moduleNew );
			// previous
			
			if ( this.hasModule ) {
				
				// event
				
				dojo.unsubscribe( this.eventHandles[ this.module.id + '.GridModule.activeChanged' ] );
				
				// unoccupy
				
				this.unoccupy_modules();
				
			}
			
			// store
			
			this.module = moduleNew;
			this.modules = modulesNew;
			this._dirtyModule = true;
			
			// event
			
			if ( this.hasModule ) {
				
				this.eventHandles[ this.module.id + '.GridModule.activeChanged' ] = dojo.subscribe( this.module.id + '.GridModule.activeChanged', this, this.occupy_modules );
				
			}
			
			// occupy
			
			this.occupy_modules();
			
		}
		
	}
	
	function occupy_module ( module ) {
		
		var occupied = this.test_occupy_module( module, true, true );
		
		return occupied;
		
	}
	
	function test_occupy_module_smart ( testModule, show, occupy ) {
		
		var rotationAngleStart = this.rotationAngleLayout,
			rotationAngleStep = Math.PI * 0.5,
			rotationSteps = 4, // extra step to ensure return to original angle
			success;
		
		// test current angle
		
		success = this.test_occupy_module( testModule, false, occupy );
		
		// try other angles
		if ( success !== true && testModule instanceof _GridModule.Instance ) {
			
			for ( i = 0; i < rotationSteps; i++ ) {
				
				// test invisibly
				
				success = this.rotate( rotationAngleStep, testModule, false, occupy, true );
				
				// if successful rotation
				
				if ( success === true ) {
					
					break;
					
				}
				
			}
			
		}
		
		// show if needed
		
		if ( show === true ) {
			
			this.show_last_modules_tested();
			
		}
		
		return success;
		
	}
	
	function test_occupy_module ( testModule, show, occupy, testLayout ) {
		
		var success = 0,
			dimensions,
			rows,
			cols,
			center,
			testResults,
			spreadRecord;
		
		// change test modules
			
		if ( this.testModule !== testModule ) {
			
			/*// if no new test module add to current module
			if ( testModule instanceof _GridModule.Instance !== true && this.hasModule ) {
				
				add_models.call( this );
				
			}
			// remove models from current module
			else */if ( this.testModule !== this.module ) {
				
				remove_models.call( this, this.models );
				
			}
			
			
			// store as test
			
			this.testModule = testModule;
			this.testModules = undefined;
			this.testSuccess = false;
			
		}
		
		// valid testModule
		
		if ( this.testModule instanceof _GridModule.Instance ) {
			
			// clean testModule's grid
			
			if ( typeof this.testModule.grid !== 'undefined' ) {
				
				this.testModule.grid.clean();
				
			}
			
			// basics
			
			testLayout = testLayout || this.layout;
			dimensions = testLayout.dimensions();
			rows = dimensions.rows;
			cols = dimensions.cols;
			center = get_layout_center_location( testLayout );
			testResults = Matrix.Zero( rows, cols );
			spreadRecord = testResults.dup();
			this.testModules = testResults.dup();
			
			// get recursive test results
			
			success = test_spread( this.testModule, testLayout, testResults, spreadRecord, center.row, center.col, rows, cols, this.testModules );
			this.testSuccess = Boolean( success );
			
			// show test results of occupy
			
			if ( show === true ) {
				
				this.show_last_modules_tested();
				
			}
			else {
				
				this._dirtyModuleTest = true;
				
			}
			
			// if successful and should occupy
			
			if ( this.testSuccess === true && occupy === true ) {
				
				this.change_module( this.testModule, this.testModules );
				
			}
			
		}
		
		return this.testSuccess;
		
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
	
	function show_last_modules_tested ( force ) {
		
		var model,
			modelCount = 0,
			success = 1 - Number( this.testSuccess );
		
		// if has test results
		
		if ( ( this._dirtyModuleTest === true || force === true ) && this.testModule instanceof _GridModule.Instance && typeof this.testModules !== 'undefined' ) {
			
			this._dirtyModuleTest = false;
			
			each_layout_element.call( this, this.testModules, function ( testLayoutModule ) {
				
				if ( testLayoutModule instanceof _GridModule.Instance ) {
					
					model = this.models[ modelCount ];
					modelCount++;
					
					// add
					
					testLayoutModule.add( model );
					testLayoutModule.show_state( 'occupied', success );
					
				}
				
			} );
			
		}
		
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
		
		layout = layout || this.layout;
		nodeType = main.is_number( nodeType ) ? nodeType : -1;
		
		each_layout_element.call( this, layout, function ( node ) {
			
			if ( ( nodeType === -1 && node > 0 ) || ( main.is_number( nodeType ) ? node === nodeType : node instanceof nodeType ) )  {
				
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
		
		layout = layout || this.layout;
		
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