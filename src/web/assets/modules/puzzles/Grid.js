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
		_GridModule,
		_MathHelper,
		idStateMaterialBase = 'base',
		colorBase = 0xffffff,
		ambientBase = 0xffffff,
		transparentBase = false,
		opacityBase = 1;
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	main.asset_register( assetPath, {
		data: _Grid,
		requirements: [
			"assets/modules/puzzles/GridModule.js",
			"assets/modules/utils/MathHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
	
	init
	
	=====================================================*/
	
	function init_internal ( gu, mh ) {
		console.log("internal grid", _Grid);
		_GridModule = gu;
		_MathHelper = mh;
		
		_Grid.Instance = Grid;
		
	}
	
	/*===================================================
	
	grid
	
	=====================================================*/
	
	function Grid ( puzzle, parameters ) {
		
		// init via reset
		
		this.reset( puzzle, parameters );
		
	}
	
	Grid.prototype = {
		
		reset: function ( puzzle, parameters ) {
			
			this._puzzle = puzzle;
			
			// init state materials
				
			this.init_state_materials( true, parameters );
			
			// if valid puzzle
			
			if ( typeof this.puzzle !== 'undefined' ) {
				
				// init modules
				
				this.init_modules( true );
				
			}
			
		},
		
		init_state_materials: function ( reset, parameters ) {
			
			var psm;
		
			if ( reset === true || typeof this.stateMaterials === 'undefined' ) {
				
				// handle parameters
				
				parameters = parameters || {};
				
				// state materials
				
				psm = parameters.stateMaterials = parameters.stateMaterials || {};
				
				psm.base = ( psm.base instanceof THREE.Material ) ? psm.base : new THREE.MeshLambertMaterial( { color: colorBase, ambient: ambientBase, transparent: transparentBase, opacity: opacityBase } );
				
				// if valid puzzle, init state materials list
				
				if ( typeof this.puzzle !== 'undefined' && typeof this.puzzle.geometry !== 'undefined' ) {
					
					this.stateMaterials = main.ensure_array( this.puzzle.geometry.materials );
					
				}
				else {
					
					this.stateMaterials = [];
					
				}
				
				// init state materials names map
				
				this.stateMaterialsMap = {};
				
				// set base material
			
				this.add_state_material( psm.base );
				
			}
			
		},
		
		modify_state_materials: function ( materials, ids, remove ) {
			
			var i, l,
				material,
				id;
			
			if ( typeof materials !== 'undefined'  && ( remove === true || typeof ids !== 'undefined' ) ) {
				
				// ensure arrays
				
				materials = main.ensure_array( materials );
				
				ids = main.ensure_array( ids );
				
				this.init_state_materials();
				
				// for each material
					
				for ( i = 0, l = materials.length; i < l; i++ ) {
					
					material = materials[ i ];
					
					id = ids[ i ];
					
					// remove if needed
					
					if ( remove === true ) {
						
						this.remove_state_material( material || id );
						
					}
					// default to add
					else {
						
						this.add_state_material( material, id );
						
					}
					
				}
				
			}
			
		},
		
		add_state_materials: function ( materials, ids ) {
			
			this.modify_state_materials( materials, ids );
			
		},
		
		remove_state_materials: function ( materials, ids ) {
			
			this.modify_state_materials( materials, ids, true );
			
		},
		
		add_state_material: function ( material, id ) {
			
			var stateMaterialIndex;
			
			// if is valid material
			
			if ( material instanceof THREE.Material ) {
				
				this.init_state_materials();
				
				// check id
				
				id = ( typeof id === 'string' ) ? id : idStateMaterialBase;
				
				stateMaterialIndex = this.stateMaterialsMap[ id ];
					
				// if material exists, remove
				
				this.remove_state_material( stateMaterialIndex );
				
				// add material
				
				this.stateMaterials.push( material );
				
				// store entry in map
				
				this.stateMaterialsMap[ id ] = this.stateMaterials.indexOf( material );
				
			}
			
		},
		
		remove_state_material: function ( searchFor ) {
			
			var index,
				id,
				idPotential;
			
			if ( typeof materialOrId !== 'undefined' ) {
				
				this.init_state_materials();
				
				// remove by material, index, or id
				
				if ( searchFor instanceof THREE.Material ) {
					
					index = this.stateMaterials.indexOf( searchFor );
					
				}
				else if ( _MathHelper.is_number( searchFor ) ) {
					
					index = searchFor;
					
				}
				else if ( typeof materialOrId === 'string' ) {
					
					id = materialOrId;
					
					index = this.stateMaterialsMap[ id ];
					
				}
				
				// remove by index
				
				if ( index !== -1 ) {
					
					this.stateMaterials.splice( index, 1 );
					
				}
				
				// remove by id
				
				if ( typeof id !== 'string' ) {
					
					for ( idPotential in stateMaterialsMap ) {
						
						if ( this.stateMaterialsMap.hasOwnProperty( idPotential ) && this.stateMaterialsMap[ idPotential ] === index ) {
							
							id = idPotential;
							
							break;
							
						}
						
					}
					
				}
				
				if ( typeof id === 'string' ) {
					
					delete this.stateMaterialsMap[ id ];
					
				}
				
			}
			
		},
		
		get_state_material: function ( id ) {
			
			return this.stateMaterials[ this.get_state_material_index( id ) ];
			
		},
		
		get_state_material_index: function ( id ) {
			
			this.init_state_materials();
			
			return this.stateMaterialsMap[ id ];
			
		},
		
		init_modules: function ( reset ) {
			
			if ( reset === true || typeof this.modules === 'undefined' ) {
				
				// init modules list
				
				this.modules = [];
				
				// if valid puzzle
				
				if ( typeof this.puzzle !== 'undefined' && typeof this.puzzle.geometry !== 'undefined' ) {
					
					// parse faces as modules
					
					this.modify_modules( this.puzzle.geometry.faces );
					
				}
				
			}
			
		},
		
		modify_modules: function ( facesOrModules, remove ) {
			
			var i, l,
				faceOrModule,
				module,
				index;
			
			if ( typeof facesOrModules !== 'undefined' ) {
				
				facesOrModules = main.ensure_array( facesOrModules );
				
				// for each face or module
				
				for ( i = 0, l = facesOrModules.length; i < l; i++ ) {
					
					faceOrModule = facesOrModules[ i ];
					
					// if should remove
					
					if ( remove === true ) {
						
						this.remove_module( faceOrModule );
					
					}
					// base to add
					else {
						
						this.add_module( faceOrModule );
						
					}
					
				}
				
			}
			
		},
		
		add_modules: function ( facesOrModules ) {
			
			this.modify_modules( facesOrModules );
			
		},
		
		remove_modules: function ( facesOrModules ) {
			
			this.modify_modules( facesOrModules, true );
			
		},
		
		add_module: function ( faceOrModule ) {
			
			var module,
				index;
			
			if ( typeof faceOrModule !== 'undefined' ) {
				
				this.init_modules();
				
				// if is module already
				
				if ( faceOrModule instanceof _GridModule.Instance ) {
					
					module = faceOrModule;
					
				}
				// else assume is face
				else {
					
					module = new _GridModule.Instance( faceOrModule, this );
					
				}
				
				// store module
				
				index = this.modules.indexOf( module );
				
				if ( index === -1 ) {
					
					this.modules.push( module );
					
				}
				
			}
			
		},
		
		remove_module: function ( faceOrModule ) {
			
			var i, l,
				j, k,
				module,
				removed,
				index;
			
			if ( typeof faceOrModule !== 'undefined' ) {
				
				this.init_modules();
				
				// init removed list
				
				removed = [];
				
				// search all modules and remove matches
				
				for ( i = this.modules.length - 1, l = 0; i >= l; i-- ) {
					
					module = this.modules[ i ];
					
					if ( faceOrModule === module || faceOrModule === module.face ) {
						
						// remove from this list
						
						removed.push( this.modules.splice( i, 1 )[ 0 ] );
						
					}
					
				}
				
				// for all removed, check for connections and set connected dirty flag
				
				for ( i = 0, l = removed.length; i < l; i++ ) {
					
					for ( j = 0, k = this.modules.length; j < k; j++ ) {
						
						module = this.modules[ j ];
						
						index = module.connected.indexOf( removed[ i ] );
						
						if ( index !== -1 ) {
							
							module.dirtyConnected = true;
							
						}
						
					}
					
				}
				
			}
			
		},
		
		get_modules: function ( searchFor, modulesExcluding, modulesMatching ) {
			
			var i, l,
				module,
				moduleFace;
			
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
					
					if ( searchFor === module.face && modulesMatching.indexOf( module ) === -1 && modulesExcluding.indexOf( module ) === -1 ) {
						
						modulesMatching.push( module );
						
					}
					
				}
				
			}
			// vertex index
			else if ( _MathHelper.is_number( searchFor ) ) {
				
				for ( i = 0, l = this.modules.length; i < l; i++ ) {
					
					module = this.modules[ i ];
					
					moduleFace = module.face;
					
					if ( typeof moduleFace !== 'undefined' && ( searchFor === moduleFace.a || searchFor === moduleFace.b || searchFor === moduleFace.c || searchFor === moduleFace.d ) && modulesMatching.indexOf( module ) === -1 && modulesExcluding.indexOf( module ) === -1 ) {
						
						modulesMatching.push( module );
						
					}
					
				}
				
			}
			
			return modulesMatching;
			
		}
		
	};
	
	/*===================================================
	
	get / set
	
	=====================================================*/
	
	Object.defineProperty( Grid.prototype, 'puzzle', { 
		get : function () { return this._puzzle; },
		set : Grid.prototype.reset
	});
	
} (KAIOPUA) );