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
		assetPath = "assets/modules/puzzles/Grid.js",
		_Grid = {},
		_Model,
		_GridModule,
		_MathHelper,
		idStateMaterialBase = 'base';
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	main.asset_register( assetPath, {
		data: _Grid,
		requirements: [
			"assets/modules/core/Model.js",
			"assets/modules/puzzles/GridModule.js",
			"assets/modules/utils/MathHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
	
	init
	
	=====================================================*/
	
	function init_internal ( m, gu, mh ) {
		console.log("internal grid", _Grid);
		
		_Model = m;
		_GridModule = gu;
		_MathHelper = mh;
		
		_Grid.Instance = Grid;
		_Grid.Instance.prototype = new _Model.Instance();
		_Grid.Instance.prototype.constructor = _Grid.Instance;
		_Grid.Instance.prototype.modify_modules = modify_modules;
		_Grid.Instance.prototype.add_modules = add_modules;
		_Grid.Instance.prototype.add_module = add_module;
		_Grid.Instance.prototype.remove_modules = remove_modules;
		_Grid.Instance.prototype.remove_module = remove_module;
		_Grid.Instance.prototype.get_modules = get_modules;
		_Grid.Instance.prototype.each_module = each_module;
		
		// get / set
		
		Object.defineProperty( _Grid.Instance.prototype, 'puzzle', { 
			get : function () { return this._puzzle; },
			set: function ( puzzle ) {
				
				this._puzzle = puzzle;
				
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
			vertices,
			verticesFromFace,
			moduleGeometry,
			module;
		
		// prototype constructor
		
		_Model.Instance.call( this, parameters );
		
		// handle parameters
		
		parameters = parameters || {};
		
		// store puzzle reference
		
		this.puzzle = parameters.puzzle;
		
		// init modules
		
		this.modules = [];
		
		// if parameters passed modules as string
		
		if ( typeof parameters.modulesGeometry === 'string' ) {
			
			parameters.modulesGeometry = main.get_asset_data( parameters.modulesGeometry );
			
		}
		
		// if parameters passed modules as geometry
		
		if ( parameters.modulesGeometry instanceof THREE.Geometry ) {
			
			// store original modules geometry
			
			this.modulesGeometry = parameters.modulesGeometry;
			
			// create new module for each face
			
			faces = this.modulesGeometry.faces;
			
			vertices = this.modulesGeometry.vertices;
			
			for ( i = 0, l = faces.length; i < l; i++ ) {
				
				face = faces[ i ];
				
				// copy geometry references
				// keeps actual faces/vertices centralized with grid
				
				moduleGeometry = new THREE.Geometry();
				
				// vertices
				
				moduleGeometry.vertices = vertices;
				
				// face
				
				moduleGeometry.faces.push( face );
				
				// init
				
				module = new _GridModule.Instance( { geometry: moduleGeometry } );
				
				// store
				
				this.add_module( module );
				
			}
			
			// set grid for all modules to calculate all connected modules
			
			for ( i = 0, l = this.modules.length; i < l; i++ ) {
				
				module = this.modules[ i ];
				
				module.grid = this;
				
			}
			
		}
		
	}
	
	function modify_modules ( modules, remove ) {
		
		var i, l,
			module,
			index;
		
		if ( typeof modules !== 'undefined' ) {
			
			modules = main.ensure_array( modules );
			
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
			
			index = this.modules.indexOf( module );
			
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
					
					index = module.connected.indexOf( moduleRemove );
					
					if ( index !== -1 ) {
						
						module.dirtyConnected = true;
						
					}
					
				}
				
				// remove from grid
			
				this.remove( moduleRemove );
				
			}
			
		}
		
	}
	
	function get_modules ( searchFor, modulesExcluding, modulesMatching ) {
		
		var i, l,
			j, k,
			module,
			moduleFace,
			searchMatch,
			searchItem;
		
		// handle modules excluding list
		
		modulesExcluding = main.ensure_array( modulesExcluding );
		
		// handle modules matching list
		
		modulesMatching = main.ensure_array( modulesMatching );
		
		// search by modules, face, or vertex index
		
		// module
		
		if ( searchFor instanceof _GridModule.Instance ) {
			
			for ( i = 0, l = this.modules.length; i < l; i++ ) {
				
				module = this.modules[ i ];
				
				if ( searchFor === module && modulesMatching.indexOf( module ) === -1 && modulesExcluding.indexOf( module ) === -1 ) {
					
					modulesMatching.push( module );
					
				}
				
			}
			
		}
		// face
		else if ( searchFor instanceof THREE.Face4 || searchFor instanceof THREE.Face3 ) {
			
			for ( i = 0, l = this.modules.length; i < l; i++ ) {
				
				module = this.modules[ i ];
				
				if ( module.has_face_or_vertex_index( searchFor ) && modulesMatching.indexOf( module ) === -1 && modulesExcluding.indexOf( module ) === -1 ) {
					
					modulesMatching.push( module );
					
				}
				
			}
			
		}
		// vertex list
		else if ( main.is_array( searchFor ) ) {
			
			for ( i = 0, l = this.modules.length; i < l; i++ ) {
				
				module = this.modules[ i ];
				
				searchMatch = [];
				
				for ( j = 0, k = searchFor.length; j < k; j++ ) {
					
					searchItem = searchFor[ j ];
					
					if ( module.has_face_or_vertex_index( searchItem ) ) {
						
						searchMatch.push( true );
						
						if ( searchMatch.length === searchFor.length && modulesMatching.indexOf( module ) === -1 && modulesExcluding.indexOf( module ) === -1 ) {
							
							modulesMatching.push( module );
							
						}
					
					}
					
				}
				
			}
			
		}
		// vertex index
		else if ( _MathHelper.is_number( searchFor ) ) {
			
			for ( i = 0, l = this.modules.length; i < l; i++ ) {
				
				module = this.modules[ i ];
				
				if ( module.has_face_or_vertex_index( searchFor ) && modulesMatching.indexOf( module ) === -1 && modulesExcluding.indexOf( module ) === -1 ) {
					
					modulesMatching.push( module );
					
				}
				
			}
			
		}
		
		return modulesMatching;
		
	}
	
	function each_module( methods, modulesExcluding ) {
		
		var i, l,
			j, k,
			module,
			method;
		
		// handle parameters
		
		methods = main.ensure_array( methods );
		
		modulesExcluding = main.ensure_array( modulesExcluding );
		
		// for each module
		
		for ( i = 0, l = this.modules.length; i < l; i++ ) {
			
			module = this.modules[ i ];
			
			// if not to be excluded
			
			if ( modulesExcluding.indexOf( module ) === -1 ) {
				
				// for each method
				
				for ( j = 0, k = methods.length; j < k; j++ ) {
					
					method = methods[ j ];
					
					// call method in context of module
					
					method.call( module );
					
				}
				
			}
			
		}
		
	}
	
} (KAIOPUA) );