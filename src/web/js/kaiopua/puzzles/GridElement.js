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
		assetPath = "js/kaiopua/puzzles/GridElement.js",
		_GridElement = {},
		_GridModel,
		_GridModule,
		_ObjectHelper,
		_MathHelper,
		gridElementCount = 0,
		rotationAxis;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _GridElement,
		requirements: [
			"js/kaiopua/puzzles/GridModel.js",
			"js/kaiopua/puzzles/GridModule.js",
			"js/kaiopua/utils/ObjectHelper.js",
			"js/kaiopua/utils/MathHelper.js",
			"js/lib/sylvester.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal( gModel, gModule, oh, mh ) {
		console.log('internal grid element', _GridElement);
		
		_GridModel = gModel;
		_GridModule = gModule;
		_ObjectHelper = oh;
		_MathHelper = mh;
		
		// properties
		
		_GridElement.sizeBase = new THREE.Vector3( 20, 40, 20 );
		_GridElement.timeGrow = 500;
		_GridElement.timeShow = 125;
		_GridElement.timeHide = 125;
		_GridElement.opacityVacant = 0.5;
		_GridElement.opacityOccupied = 0.5;
		
		rotationAxis = new THREE.Vector3( 0, 1, 0 );
		_GridElement.NODE_EMPTY = 0;
		_GridElement.NODE_SELF = 1;
		
		
		// instance
		
		_GridElement.Instance = GridElement;
		
		_GridElement.Instance.prototype.reset = reset;
		_GridElement.Instance.prototype.reset_material = reset_material;
		
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
		this.utilQ1Rotate = new THREE.Quaternion();
		this.rotationAngle = this.rotationAngleLayout = 0;
		this.timeGrow = main.is_number( parameters.timeGrow ) ? parameters.timeGrow : _GridElement.timeGrow;
		
		this.geometry = typeof parameters.geometry === 'string' ? main.get_asset_data( parameters.geometry ) : ( parameters.geometry || new THREE.CubeGeometry( _GridElement.sizeBase.x, _GridElement.sizeBase.y, _GridElement.sizeBase.z ) );
		this.material = parameters.material instanceof THREE.Material ? parameters.material.clone() : new THREE.MeshLambertMaterial( { vertexColors: THREE.VertexColors, shading: THREE.SmoothShading } );
		this.materialBase = this.material.clone();
		
		this.shape = parameters.shape;
		this.skin = parameters.skin;
		this.layout = generate_layout.call( this, parameters.layout );
		this.modules = this.layout.dup();
		
		// container
		
		this.container = main.extend( parameters.container, {} );
		this.container.material = this.material;
		
		// models
		
		this.models = generate_models.call( this, parameters.models );
		
		// customizations
		
		this.customize( parameters.customizations );
		
		// reset
		
		this.reset();
		
	}
	
	/*===================================================
	
	reset
	
	=====================================================*/
	
	function reset () {
		
		this.reset_material();
		
	}
	
	function reset_material () {
		
		this.material.color.copy( this.materialBase.color );
		if ( this.material.ambient ) {
			this.material.ambient.copy( this.materialBase.ambient );
		}
		this.material.vertexColors = this.materialBase.vertexColors;
		this.material.transparent = false;
		this.material.opacity = 1;
		
	}
	
	/*===================================================
    
    clone
    
    =====================================================*/
	
	function clone ( c ) {
		console.log( this, ' CLONE ', c );
		var i, l,
			cMaterial,
			cMaterialCustom,
			cGeometry,
			cGeometryCustom,
			model,
			modelCustom;
		
		if ( typeof c === 'undefined' ) {
			
			c = new _GridElement.Instance();
			
		}
		
		if ( c instanceof _GridElement.Instance ) {
			
			// properties
			
			c.timeGrow = this.timeGrow;
			c.rotationAngle = this.rotationAngle;
			c.rotationAngleLayout = this.rotationAngleLayout;
			c.material = this.material.clone();
			c.geometry = _ObjectHelper.clone_geometry( this.geometry );
			c.shape = this.shape;
			c.skin = this.skin;
			c.layout = generate_layout.call( c, this.layout );
			
			// modules matrix from layout
			
			c.modules = c.layout.dup();
			
			// basic models
			
			c.models = generate_models.call( c );
			
			// customize
			
			customize.call( c, this.customizations );
			
			// handle customizations that need clone
			
			if ( this.customized ) {
				
				c.customizations.material = this.customizations.material.clone();
				c.customizations.geometry = _ObjectHelper.clone_geometry( this.customizations.geometry );

			}
			
			// models
			
			for ( i = 0, l = c.models.length; i < l; i++ ) {
				
				model = c.models[ i ];
				model.scale.set( 1, 1, 1 );
				
				if ( c.hasCustomModels ) {
					
					modelCustom = c.customizations.models[ i ];
					modelCustom.scale.set( 1, 1, 1 );
					
				}
				
			}
			
			// reset
			
			c.reset();
			
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
		c.geometry = typeof parameters.geometry === 'string' ? main.get_asset_data( parameters.geometry ) : ( c.geometry || this.geometry );
		
		// ensure proper material
		
		if ( c.material === true ) {

			c.material = this.material.clone();
			
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
	
	function occupy_modules_temporary ( models ) {
		
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
	
	function unoccupy_modules_temporary ( models ) {
		
		var i, l,
			model;
		
		models = models || this.modelsCurrent;
		
		for ( i = 0, l = models.length; i < l; i++ ) {
			
			model = models[ i ];
			
			if ( typeof model.parent !== 'undefined' ) {
				
				model.parent.remove( model );
				
				model.set_intersectable( false, true );
				
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
				
				this.modelsCurrent = models;
				this._dirtyModule = false;
				
				// for each module in layout modules add model as occupant
				
				each_layout_element.call( this, this.modules, function ( layoutModule ) {
					
					if ( layoutModule instanceof _GridModule.Instance ) {
						
						model = this.modelsCurrent[ modelCount ];
						modelCount++;
						
						model.set_intersectable( true, true );
						
						layoutModule.set_occupant( model );
						
						// grow core
						_ObjectHelper.tween( model.core.scale.set( 0, 0, 0 ), new THREE.Vector3( 1, 1, 1 ), { 
							duration: this.timeGrow,
							easing: TWEEN.Easing.Back.EaseOut
						} );
						
					}
					
				} );
				
			}
			
		}
		
	}
	
	function unoccupy_modules () {
		
		// for each module in layout modules add model as occupant
		
		each_layout_element.call( this, this.modules, function ( layoutModule ) {
			
			if ( layoutModule instanceof _GridModule.Instance ) {
				
				layoutModule.set_occupant();
				
			}
			
		} );
		
	}
	
	/*===================================================
    
    rotation
    
    =====================================================*/
	
	function rotate ( radians, testModule, show, occupy, force ) {
		
		var q = this.utilQ1Rotate,
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
		
		angleDelta = _MathHelper.shortest_rotation_between_angles( this.rotationAngleLayout, this.rotationAngle );
		
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
			
			// reset material
			
			this.reset_material();
			
			// previous
			
			if ( this.hasModule ) {
				
				// signal
				
				this.module.onActiveChanged.remove( this.occupy_modules, this );
				
				// unoccupy
				
				this.unoccupy_modules();
				
			}
			
			// store
			
			this.module = moduleNew;
			this.modules = modulesNew;
			this._dirtyModule = true;
			
			// if has module
			
			if ( this.hasModule ) {
				
				// puzzle
				
				this.puzzle = this.module.puzzle;
				
				// signal
				
				this.module.onActiveChanged.add( this.occupy_modules, this );
				
			}
			else {
				
				this.puzzle = undefined;
				
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
		
		var dimensions,
			rows,
			cols,
			center,
			testResults,
			spreadRecord;
		
		// change test modules
			
		if ( this.testModule !== testModule ) {
			
			// remove models from current module
			
			if ( this.testModule !== this.module ) {
				
				unoccupy_modules_temporary.call( this, this.models );
				
			}
			
			// clean current testModule's grid
			
			if ( this.testModule instanceof _GridModule.Instance && typeof this.testModule.grid !== 'undefined' ) {
				
				this.testModule.grid.clean();
				
			}
			
			// store as test
			
			this.testModule = testModule;
			this.testModules = undefined;
			this.testSuccess = this.testSuccessLast = undefined;
			
		}
		
		// valid testModule
		
		if ( this.testModule instanceof _GridModule.Instance ) {
			
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
			
			this.testSuccessLast = this.testSuccess;
			this.testSuccess = Boolean( test_spread( this.testModule, testLayout, testResults, spreadRecord, center.row, center.col, rows, cols, this.testModules ) );
			
			// show test results of occupy
			
			if ( show === true ) {
				
				this.show_last_modules_tested();
				
			}
			else if ( this.testSuccess !== this.testSuccessLast ) {
				
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
			
			// for each module
			
			each_layout_element.call( this, this.testModules, function ( testLayoutModule ) {
				
				if ( testLayoutModule instanceof _GridModule.Instance ) {
					
					model = this.models[ modelCount ];
					modelCount++;
					
					model.set_intersectable( false, true );
					
					testLayoutModule.add( model );
					testLayoutModule.show_state( 'occupied', success );
					
				}
				
			} );
			
			// handle this material
			
			// if successful
			
			if ( this.testSuccess === true ) {
				
				this.material.color.copy( _GridModule.colors.vacant );
				if ( this.material.ambient ) {
					this.material.ambient.copy( _GridModule.colors.vacant );
				}
				this.material.transparent = true;
				this.material.opacity = _GridElement.opacityVacant;
				
			}
			// unsuccessful, but tested on an actual module
			else if ( this.testModule instanceof _GridModule.Instance ) {
				
				this.material.color.copy( _GridModule.colors.occupied );
				if ( this.material.ambient ) {
					this.material.ambient.copy( _GridModule.colors.occupied );
				}
				this.material.transparent = true;
				this.material.opacity = _GridElement.opacityOccupied;
			
			}
			// base state
			else {
				
				this.reset_material();
					
			}
			
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
		nodeType = typeof nodeType !== 'undefined' ? nodeType : _GridElement.NODE_SELF;
		
		if ( typeof nodeType === 'function' ) {
			
			each_layout_element.call( this, layout, function ( node ) {
				
				if ( node instanceof nodeType )  {
					
					nodeTotal += 1;
					
				}
				
			} );
			
		}
		else {
			
			each_layout_element.call( this, layout, function ( node ) {
				
				if ( node === nodeType )  {
					
					nodeTotal += 1;
					
				}
				
			} );
			
		}
		
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