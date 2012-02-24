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
		_GridUnit,
		colorDefault = 0xffffff,
		ambientDefault = 0xffffff,
		transparentDefault = false,
		opacityDefault = 1;
	
	main.asset_register( assetPath, {
		data: _Grid,
		requirements: [
			"assets/modules/puzzles/GridUnit.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	function init_internal ( gu ) {
		console.log("internal grid", _Grid);
		_GridUnit = gu;
		
		_Grid.Instance = Grid;
		
	}
	
	/*===================================================
	
	grid
	
	=====================================================*/
	
	function Grid ( puzzle ) {
		
		this.init( puzzle );
		
	}
	
	Grid.prototype = {
		
		init: function ( puzzle ) {
			
			// if valid puzzle
			
			if ( typeof puzzle !== 'undefined' && typeof puzzle.geometry !== 'undefined' ) {
				
				this._puzzle = puzzle;
				
				// init state materials
				
				this.init_state_materials( true );
				
				// init units
				
				this.init_units( true );
				
			}
			
		},
		
		init_state_materials: function ( reset ) {
		
			if ( reset === true || typeof this.stateMaterials === 'undefined' ) {
				
				// if valid puzzle
				
				if ( typeof this.puzzle !== 'undefined' && typeof this.puzzle.geometry !== 'undefined' ) {
					
					this.stateMaterials = main.ensure_array( this.puzzle.geometry.materials );
					
				}
				else {
					
					this.stateMaterials = [];
					
				}
				
				// set default material
			
				this.set_default_state_material( colorDefault, ambientDefault, transparentDefault, opacityDefault );
				
			}
			
		},
		
		modify_state_materials: function ( materials, remove ) {
			
			var i, l,
				material;
			
			if ( typeof materials !== 'undefined' ) {
				
				// ensure array in case of single material
				
				materials = main.ensure_array( materials );
				
				this.init_state_materials();
					
				for ( i = 0, l = materials.length; i < l; i++ ) {
					
					material = materials[ i ];
					
					// remove if needed
					
					if ( remove === true ) {
						
						this.remove_state_material( material );
						
					}
					// default to add
					else {
						
						this.add_state_material( material );
						
					}
					
				}
				
			}
			
		},
		
		add_state_materials: function ( materials ) {
			
			this.modify_state_materials( materials );
			
		},
		
		remove_state_materials: function ( materials ) {
			
			this.modify_state_materials( materials, true );
			
		},
		
		add_state_material: function ( material ) {
			
			var index;
			
			if ( typeof material !== 'undefined' ) {
				
				this.init_state_materials();
				
				index = this.stateMaterials.indexOf( material );
				
				if ( index === -1 ) {
					
					this.stateMaterials.push( material );
					
				}
				
			}
			
		},
		
		remove_state_material: function ( material ) {
			
			var index;
			
			if ( typeof material !== 'undefined' ) {
				
				this.init_state_materials();
					
				index = this.stateMaterials.indexOf( material );
				
				if ( index !== -1 ) {
					
					this.stateMaterials.splice( index, 1 );
					
				}
				
			}
			
		},
		
		set_default_state_material: function ( color, ambient, transparent, opacity ) {
			
			// if default material exists, remove
			
			this.remove_state_material( this.stateMaterialDefault );
			
			// init default material
			
			this.stateMaterialDefault = new THREE.MeshLambertMaterial( { color: color, ambient: ambient, transparent: transparent, opacity: opacity } );
			
			// add default material
			
			this.add_state_material( this.stateMaterialDefault );
			
		},
		
		init_units: function ( reset ) {
			
			if ( reset === true || typeof this.units === 'undefined' ) {
				
				// init units list
				
				this.units = [];
				
				// if valid puzzle
				
				if ( typeof this.puzzle !== 'undefined' && typeof this.puzzle.geometry !== 'undefined' ) {
					
					// parse faces as units
					
					this.modify_units( this.puzzle.geometry.faces );
					
				}
				
			}
			
		},
		
		modify_units: function ( facesOrUnits, remove ) {
			
			var i, l,
				faceOrUnit,
				unit,
				index;
			
			if ( typeof facesOrUnits !== 'undefined' ) {
				
				facesOrUnits = main.ensure_array( facesOrUnits );
				
				// for each face or unit
				
				for ( i = 0, l = facesOrUnits.length; i < l; i++ ) {
					
					faceOrUnit = facesOrUnits[ i ];
					
					// if should remove
					
					if ( remove === true ) {
						
						this.remove_unit( faceOrUnit );
					
					}
					// default to add
					else {
						
						this.add_unit( faceOrUnit );
						
					}
					
				}
				
			}
			
		},
		
		add_units: function ( facesOrUnits ) {
			
			this.modify_units( facesOrUnits );
			
		},
		
		remove_units: function ( facesOrUnits ) {
			
			this.modify_units( facesOrUnits, true );
			
		},
		
		add_unit: function ( faceOrUnit ) {
			
			var unit,
				index;
			
			if ( typeof faceOrUnit !== 'undefined' ) {
				
				this.init_units();
				
				// if is unit already
				
				if ( faceOrUnit instanceof _GridUnit.Instance ) {
					
					unit = faceOrUnit;
					
				}
				// else assume is face
				else {
					
					unit = new _GridUnit.Instance( faceOrUnit, this );
					
				}
				
				// store unit
				
				index = this.units.indexOf( unit );
				
				if ( index === -1 ) {
					
					this.units.push( unit );
					
				}
				
			}
			
		},
		
		remove_unit: function ( faceOrUnit ) {
			
			var i, l,
				unit,
				index;
			
			if ( typeof faceOrUnit !== 'undefined' ) {
				
				this.init_units();
				
				// search all units and remove matches
				
				for ( i = this.units.length - 1, l = 0; i >= l; i-- ) {
					
					unit = this.units[ i ];
					
					if ( faceOrUnit === unit || faceOrUnit === unit.face ) {
						
						this.units.splice( i, 1 );
						
					}
					
				}
				
			}
			
		},
		
	};
	
	/*===================================================
	
	get / set
	
	=====================================================*/
	
	Object.defineProperty( Grid.prototype, 'puzzle', { 
		get : function () { return this._puzzle; },
		set : Grid.prototype.init
	});
	
} (KAIOPUA) );