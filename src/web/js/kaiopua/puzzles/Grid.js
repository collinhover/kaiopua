/*
 *
 * Grid.js
 * Creates grids for use in puzzles.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/puzzles/Grid.js",
		_Grid = {},
		_Model,
		_GridModule,
		_GridModel,
		_GridElement,
		_MathHelper,
		_ObjectHelper,
		idStateMaterialBase = 'base',
		utilVec31Vertex,
		utilVec32Vertex,
		utilVec33Vertex,
		utilVec34Vertex,
		utilMat41Vertex,
		utilMat42Vertex;
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	main.asset_register( assetPath, {
		data: _Grid,
		requirements: [
			"js/kaiopua/core/Model.js",
			"js/kaiopua/puzzles/GridModule.js",
			"js/kaiopua/puzzles/GridModel.js",
			"js/kaiopua/puzzles/GridElement.js",
			"js/kaiopua/utils/MathHelper.js",
			"js/kaiopua/utils/ObjectHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
	
	init
	
	=====================================================*/
	
	function init_internal ( m, gm, gmodel, ge, mh, oh ) {
		console.log("internal grid", _Grid);
		
		_Model = m;
		_GridModule = gm;
		_GridModel = gmodel;
		_GridElement = ge;
		_MathHelper = mh;
		_ObjectHelper = oh;
		
		utilVec31Vertex = new THREE.Vector3();
		utilVec32Vertex = new THREE.Vector3();
		utilVec33Vertex = new THREE.Vector3();
		utilVec34Vertex = new THREE.Vector3();
		utilMat41Vertex = new THREE.Matrix4();
		utilMat42Vertex = new THREE.Matrix4();
		
		// grid
		
		_Grid.Instance = Grid;
		_Grid.Instance.prototype = new _Model.Instance();
		_Grid.Instance.prototype.constructor = _Grid.Instance;
		
		_Grid.Instance.prototype.reset = reset;
		_Grid.Instance.prototype.clean = clean;
		
		_Grid.Instance.prototype.remove_elements = remove_elements;
		
		_Grid.Instance.prototype.complete = complete;
		
		_Grid.Instance.prototype.each_module = each_module;
		_Grid.Instance.prototype.modify_modules = modify_modules;
		_Grid.Instance.prototype.add_modules = add_modules;
		_Grid.Instance.prototype.add_module = add_module;
		_Grid.Instance.prototype.remove_modules = remove_modules;
		_Grid.Instance.prototype.remove_module = remove_module;
		_Grid.Instance.prototype.get_modules_with_vertices = get_modules_with_vertices;
		
		// get / set
		
		Object.defineProperty( _Grid.Instance.prototype, 'puzzle', { 
			get : function () { return this._puzzle; },
			set: function ( puzzle ) {
				
				this._puzzle = puzzle;
				
			}
		});
		
		Object.defineProperty( _Grid.Instance.prototype, 'isFull', { 
			get : function () {
				
				var i, l,
					full = this.modules.length > 0 ? true : false,
					module;
				
				// for each module
				
				for ( i = 0, l = this.modules.length; i < l; i++ ) {
					
					module = this.modules[ i ];
					
					if ( !module.occupant ) {
						
						full = false;
						break;
						
					}
					
				}
				
				return full;
				
			}
		});
		
		Object.defineProperty( _Grid.Instance.prototype, 'occupants', { 
			get : function () {
				
				var i, l,
					module,
					occupant,
					occupants = [];
				
				// find all models occupying grid
				
				for ( i = 0, l = this.modules.length; i < l; i++ ) {
					
					module = this.modules[ i ];
					
					occupant = module.occupant;
					
					if ( occupant && main.index_of_value( occupants, occupant ) === -1 ) {
						
						occupants.push( occupant );
						
					}
					
				}
				
				return occupants;
				
			}
		});
		
		Object.defineProperty( _Grid.Instance.prototype, 'elements', { 
			get : function () {
				
				var i, l,
					module,
					occupant,
					element,
					elements = [];
				
				// find all elements occupying grid
				
				for ( i = 0, l = this.modules.length; i < l; i++ ) {
					
					module = this.modules[ i ];
					
					occupant = module.occupant;
					
					if ( occupant ) {
						
						element = occupant.gridElement;
						
						if ( element instanceof _GridElement.Instance && main.index_of_value( elements, element ) === -1 ) {
							
							elements.push( element );
							
						}
					
					}
					
				}
				
				return elements;
				
			}
		});
		
	}
	
	/*===================================================
	
	grid
	
	=====================================================*/
	
	function Grid ( parameters ) {
		
		var i, l,
			psm,
			faces,
			face,
			faceCopy,
			vertices,
			faceUvs,
			faceVertexUvs,
			faceVerticesUvs,
			moduleGeometry,
			moduleVertexUvs,
			moduleInstance,
			module;
		
		// handle parameters
		
		parameters = parameters || {};
		
		// prototype constructor
		
		_Model.Instance.call( this, parameters );
		
		// properties
		
		this.modules = [];
		this.puzzle = parameters.puzzle;
		this.vertexDistanceMergeLimit = main.is_number( parameters.vertexDistanceMergeLimit ) ? parameters.vertexDistanceMergeLimit : 5;
		
		// signal
		
		this.onStateChanged = new signals.Signal();
		
		// handle modulesGeometry
		
		modulesGeometry = parameters.modulesGeometry;
		
		if ( typeof modulesGeometry === 'string' ) {
			
			modulesGeometry = main.get_asset_data( modulesGeometry );
			
		}
		
		if ( modulesGeometry instanceof THREE.Geometry ) {
			
			// store original modules modulesGeometry
			
			this.modulesGeometry = modulesGeometry;
			
			// create new module for each face
			
			faces = this.modulesGeometry.faces;
			vertices = this.modulesGeometry.vertices;
			faceUvs = this.modulesGeometry.faceUvs[ 0 ];
			faceVertexUvs = this.modulesGeometry.faceVertexUvs[ 0 ];
			console.log(this.puzzle, this.puzzle.name, 'grid CREATING MODULES');
			for ( i = 0, l = faces.length; i < l; i++ ) {
				
				face = faces[ i ];
				
				// copy geometry references
				// keeps actual faces/vertices centralized with grid
				
				moduleGeometry = new THREE.Geometry();
				
				// vertices
				
				moduleGeometry.vertices.push( vertices[ face.a ].clone() );
				moduleGeometry.vertices.push( vertices[ face.b ].clone() );
				moduleGeometry.vertices.push( vertices[ face.c ].clone() );
				
				// face
				
				faceCopy = face.clone();
				faceCopy.a = 0;
				faceCopy.b = 1;
				faceCopy.c = 2;
				
				moduleGeometry.faces.push( faceCopy );
				
				// UVs
				
				if ( faceUvs.length > i ) {
					
					moduleGeometry.faceUvs[ 0 ].push( faceUvs[ i ].clone() );
					
				}
				
				moduleVertexUvs = [];
				
				// if should clone uvs
				
				if ( parameters.modulesCloneUvs === true && faceVertexUvs.length > i ) {
					
					moduleVertexUvs.push( faceVertexUvs[ i ][ 0 ].clone(), faceVertexUvs[ i ][ 1 ].clone(), faceVertexUvs[ i ][ 2 ].clone() );
					
				}
				else {
					
					moduleVertexUvs[ 0 ] = new THREE.UV( 0, 0 );
					moduleVertexUvs[ 1 ] = new THREE.UV( 0, 1 );
					moduleVertexUvs[ 2 ] = new THREE.UV( 1, 1 );
					
				}
				
				// add module vertex uvs (for just single face)
				
				moduleGeometry.faceVertexUvs[ 0 ][ 0 ] = moduleVertexUvs;
				
				// extras for face4
				
				if ( face instanceof THREE.Face4 ) {
					
					moduleGeometry.vertices.push( vertices[ face.d ].clone() );
					
					faceCopy.d = 3;
					
					if ( parameters.modulesCloneUvs === true && faceVertexUvs.length > i ) {
						
						moduleVertexUvs.push( faceVertexUvs[ i ][ 3 ].clone() );
						
					}
					else {
						
						moduleVertexUvs[ 3 ] = new THREE.UV( 1, 0 );
						
					}
					
				}
				
				// init
				
				this.moduleInstance = typeof parameters.moduleInstance !== 'undefined' && parameters.moduleInstance.prototype instanceof _GridModule.Instance ? parameters.moduleInstance : _GridModule.Instance;
				
				module = new this.moduleInstance( { 
					geometry: moduleGeometry
				} );
				
				// store
				
				this.add_module( module );
				
			}
			
			// set grid for all modules to calculate all connected modules
			
			for ( i = 0, l = this.modules.length; i < l; i++ ) {
				
				module = this.modules[ i ];
				
				module.grid = this;
				
				module.onOccupantAdded.add( on_occupant_added, this );
				module.onOccupantRemoved.add( on_occupant_removed, this );
				module.onOccupantChanged.add( on_occupant_changed, this );
				module.onDirtied.add( on_module_dirty, this );
				
			}
			
			// reset grid
			
			this.reset();
			
		}
		
	}
	
	/*===================================================
	
	reset
	
	=====================================================*/
	
	function reset () {
		
		// remove all elements
		
		this.remove_elements();
		
		// clean
		
		this.clean( undefined, true );
		
	}
	
	function clean ( modulesExcluding, force ) {
		
		// if dirty
		
		if ( this._dirtyModules !== false || force === true ) {
			
			each_module.call( this, function ( module ) {
				
				module.show_state( false );
				
			}, modulesExcluding );
			
			this._dirtyModules = false;
			
		}
		
	}
	
	/*===================================================
	
	occupants / elements
	
	=====================================================*/
	
	function remove_elements ( shape ) {
		
		var i, l,
			module,
			occupant,
			gridElement;
		
		// for each module
		
		for ( i = 0, l = this.modules.length; i < l; i++ ) {
			
			module = this.modules[ i ];
			occupant = module.occupant;
			
			if ( occupant instanceof _GridModel.Instance ) {
				
				gridElement = occupant.gridElement;
				
				if ( !shape || gridElement.shape === shape ) {
					
					gridElement.change_module();
					
				}
				
			}
			else {
				
				module.set_occupant();
				
			}
			
		}
		
	}
	
	/*===================================================
	
	complete
	
	=====================================================*/
	
	function complete () {
		console.log( ' > grid complete', this);
		var i, l,
			module;
		
		// for each module
		
		for ( i = 0, l = this.modules.length; i < l; i++ ) {
			
			module = this.modules[ i ];
			
			// active
			
			module.active = this.puzzle.completed;
			
		}
		
	}
	
	/*===================================================
	
	modules
	
	=====================================================*/
	
	function each_module ( callback, modulesExcluding ) {
		
		var i, l,
			j, k,
			module;
		
		// handle parameters
		
		modulesExcluding = main.to_array( modulesExcluding );
		
		// for each module
		
		for ( i = 0, l = this.modules.length; i < l; i++ ) {
			
			module = this.modules[ i ];
			
			// if not to be excluded
			
			if ( main.index_of_value( modulesExcluding, module ) === -1 ) {
				
				// pass module to callback
				
				callback.call( this, module );
				
			}
			
		}
		
	}
	
	function modify_modules ( modules, remove ) {
		
		var i, l,
			module,
			index;
		
		if ( typeof modules !== 'undefined' ) {
			
			modules = main.to_array( modules );
			
			// for each module
			
			for ( i = 0, l = modules.length; i < l; i++ ) {
				
				module = modules[ i ];
				
				// if should remove
				
				if ( remove === true ) {
					
					this.remove_module( module );
				
				}
				// base to add
				else {
					
					this.add_module( module );
					
				}
				
			}
			
		}
		
	}
	
	function add_modules( modules ) {
		
		this.modify_modules( modules );
		
	}
	
	function remove_modules( modules ) {
		
		this.modify_modules( modules, true );
		
	}
	
	function add_module ( module ) {
		
		var index;
		
		if ( module instanceof _GridModule.Instance ) {
			
			// store module
			
			index = main.index_of_value( this.modules, module );
			
			if ( index === -1 ) {
				
				this.modules.push( module );
				
			}
			
			// add module to grid
			
			this.add( module );
			
		}
		
	}
	
	function remove_module ( module ) {
		
		var i, l,
			j, k,
			modulePotential,
			removing,
			moduleRemove,
			index;
		
		if ( module instanceof _GridModule.Instance ) {
			
			// init removing list
			
			removing = [];
			
			// search all potential modules and remove matches
			
			for ( i = this.modules.length - 1, l = 0; i >= l; i-- ) {
				
				modulePotential = this.modules[ i ];
				
				if ( modulePotential === module ) {
					
					// remove from this list
					
					removing.push( this.modules.splice( i, 1 )[ 0 ] );
					
				}
				
			}
			
			// for all removing
			
			for ( i = 0, l = removing.length; i < l; i++ ) {
				
				moduleRemove = removing[ i ];
				
				// check for connections and set connected dirty flag
				
				for ( j = 0, k = this.modules.length; j < k; j++ ) {
					
					module = this.modules[ j ];
					
					index = main.index_of_value( module.connected, moduleRemove );
					
					if ( index !== -1 ) {
						
						module.dirtyConnected = true;
						
					}
					
				}
				
				// remove from grid
			
				this.remove( moduleRemove );
				
			}
			
		}
		
	}
	
	function get_modules_with_vertices ( searchVertices, searchFrom, modulesExcluding, modulesMatching ) {
		
		var i, l,
			j, k,
			n, m,
			searchVertex,
			searchVertexPosition = utilVec31Vertex,
			searchFromMatrix = utilMat41Vertex,
			searchPosition = utilVec32Vertex,
			searchScale = 1,
			searchRadius = 0,
			searchMatches,
			module,
			moduleScale,
			moduleRadius,
			moduleMatrix = utilMat42Vertex,
			modulePosition = utilVec33Vertex,
			vertices,
			vertex,
			position = utilVec34Vertex,
			distance;
		
		// handle arguments
		
		searchVertices = main.to_array( searchVertices );
		
		modulesExcluding = main.to_array( modulesExcluding );
		
		modulesMatching = main.to_array( modulesMatching );
		
		// find search matrix world
		
		if ( searchFrom instanceof THREE.Matrix4 ) {
			
			searchFromMatrix.copy( searchFrom );
			
		}
		else if ( searchFrom instanceof THREE.Object3D ) {
			
			searchFromMatrix.copy( searchFrom.matrixWorld );
			
			searchRadius += searchFrom.geometry.boundingSphere.radius;
			
			searchScale = Math.max( searchFromMatrix.getColumnX().length(), searchFromMatrix.getColumnY().length(), searchFromMatrix.getColumnZ().length() );
			
		}
		else {
			
			searchFromMatrix.identity();
			
		}
		
		// set search position
		
		searchPosition.copy( searchFromMatrix.getPosition() );
		
		// set search radius
		
		searchRadius = searchRadius * searchScale + this.vertexDistanceMergeLimit;
		
		// search each module
		
		for ( i = 0, l = this.modules.length; i < l; i++ ) {
					
			module = this.modules[ i ];
			
			// if module not matched or excluded
			
			if ( main.index_of_value( modulesMatching, module ) === -1 && main.index_of_value( modulesExcluding, module ) === -1 ) {
				
				// get module matrix world
				
				moduleMatrix.copy( module.matrixWorld );
				
				// get module position
				
				modulePosition.copy( moduleMatrix.getPosition() );
				
				// distance from search to module 
				
				distance = searchPosition.distanceTo( modulePosition );
				
				// module radius
				
				moduleRadius = module.geometry.boundingSphere.radius * Math.max( moduleMatrix.getColumnX().length(), moduleMatrix.getColumnY().length(), moduleMatrix.getColumnZ().length() );

				if ( searchRadius + moduleRadius >= distance ) {
					
					vertices = module.geometry.vertices;
					
					searchMatches = [];
					
					for ( j = 0, k = searchVertices.length; j < k; j++ ) {
						
						searchVertex = searchVertices[ j ];
						
						searchVertexPosition.copy( searchVertex );
						
						searchFromMatrix.multiplyVector3( searchVertexPosition );
						
						// for each vertex in module
						
						for ( n = 0, m = vertices.length; n < m; n++ ) {
							
							vertex = vertices[ n ];
							
							position.copy( vertex );
							
							moduleMatrix.multiplyVector3( position );
							
							// find distance between search and position 
							
							distance = searchVertexPosition.distanceTo( position );
							
							// if distance between positions is less than or equal to merge limit
							
							if ( distance <= this.vertexDistanceMergeLimit ) {
								
								searchMatches.push( 1 );
								
								break;
								
							}
							
						}
						
						if ( searchMatches.length === searchVertices.length ) {
							
							modulesMatching.push( module );
							
							break;
							
						}
						
					}
					
				}
				
			}
			
		}
		
		return modulesMatching;
		
	}
	
	/*===================================================
	
	change
	
	=====================================================*/
	
	function on_occupant_added ( module ) {
		
		
	}
	
	function on_occupant_removed ( module ) {
		
		
		
	}
	
	function on_occupant_changed ( module ) {
		
		// set dirty
		
		this._dirtyModules = true;
		
		// clean
		
		this.clean();
		
		// signal
		
		this.onStateChanged.dispatch( this, module );
		
	}
	
	function on_module_dirty ( module ) {
		
		// set dirty
		
		this._dirtyModules = true;
		
	}
	
} (KAIOPUA) );