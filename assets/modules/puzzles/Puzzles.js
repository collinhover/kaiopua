/*
 *
 * Puzzles.js
 * Creates and tracks all puzzles.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/puzzles/Puzzles.js",
		_Puzzles = {},
		_Model,
		_Grid,
		allPuzzles,
		allModules;
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	main.asset_register( assetPath, {
		data: _Puzzles,
		requirements: [
			"assets/modules/core/Model.js",
			"assets/modules/puzzles/Grid.js"
		], 
		callbacksOnReqs: init_internal,
		wait: true
	} );

	/*===================================================
	
	init
	
	=====================================================*/
	
	function init_internal ( m, g ) {
		console.log('internal puzzles', _Puzzles);
		_Model = m;
		_Grid = g;
		
		// puzzles / modules list
		
		allPuzzles = [];
		
		Object.defineProperty( _Puzzles, 'allPuzzles', { 
			get: function () { return allPuzzles; }
		});
		
		Object.defineProperty( _Puzzles, 'allModules', { 
			get: function () {
				
				var i, l;
				
				// if puzzles list dirty
				
				if ( this._dirtyPuzzles !== false ) {
					
					allModules = [];
					
					for ( i = 0, l = allPuzzles.length; i < l; i++ ) {
						
						allModules = allModules.concat( allPuzzles[ i ].grid.modules );
						
					}
					
					this._dirtyPuzzles = false;
					
				}
				
				return allModules;
			
			}
		});
		
		// instance
		
		_Puzzles.Instance = Puzzle;
		_Puzzles.Instance.prototype = new _Model.Instance();
		_Puzzles.Instance.prototype.constructor = _Puzzles.Instance;
		_Puzzles.Instance.prototype.complete = complete;
		
		Object.defineProperty( _Puzzles.Instance.prototype, 'occupants', { 
			get: function () {
				
				var i, l,
					modules = this.grid.modules,
					module,
					allOccupants = [];
				
				for ( i = 0, l = modules.length; i < l; i++ ) {
					
					module = modules[ i ];
					
					if ( module.occupied && allOccupants.indexOf( module.occupant ) === -1 ) {
						
						allOccupants.push( module.occupant );
						
					}
					
				}
				
				return allOccupants;
			
			}
		});
		
	}
	
	/*===================================================
	
	puzzle
	
	=====================================================*/
	
	function Puzzle ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.grid = parameters.grid || {};
		parameters.grid.puzzle = this;
		
		// prototype constructor
		
		_Model.Instance.call( this, parameters );
		
		// init grid
		
		this.grid = new _Grid.Instance( parameters.grid );
		
		// add grid
			
		this.add( this.grid );
		
		// if not empty
		
		if ( this.grid.modules.length > 0 ) {
			
			// add to puzzles list
			
			allPuzzles.push( this );
			
			_Puzzles._dirtyPuzzles = true;
			
		}
		
	}
	
	/*===================================================
	
	complete
	
	=====================================================*/
	
	function complete () {
		
		// if grid is full
		
		if ( this.grid.full ) {
			
			
			
		}
		
	}
	
} (KAIOPUA) );