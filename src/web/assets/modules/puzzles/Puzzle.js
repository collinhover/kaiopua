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
		assetPath = "assets/modules/puzzles/Puzzle.js",
		_Puzzle = {},
		_Model,
		_Grid,
		puzzleID = 'Puzzle',
		puzzleCount = 0,
		allPuzzles,
		allPuzzlesSolved,
		allModules;
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	main.asset_register( assetPath, {
		data: _Puzzle,
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
		console.log('internal puzzles', _Puzzle);
		_Model = m;
		_Grid = g;
		
		// properties
		
		allPuzzles = [];
		allPuzzlesSolved = [];
		
		Object.defineProperty( _Puzzle, 'allPuzzles', { 
			get: function () { return allPuzzles.slice( 0 ); }
		});
		
		Object.defineProperty( _Puzzle, 'allPuzzlesSolved', { 
			get: function () { return allPuzzlesSolved.slice( 0 ); }
		});
		
		Object.defineProperty( _Puzzle, 'allModules', { 
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
				
				return allModules.slice( 0 );
			
			}
		});
		
		// instance
		
		_Puzzle.Instance = Puzzle;
		_Puzzle.Instance.prototype = new _Model.Instance();
		_Puzzle.Instance.prototype.constructor = _Puzzle.Instance;
		_Puzzle.Instance.prototype.on_state_changed = on_state_changed;
		
		Object.defineProperty( _Puzzle.Instance.prototype, 'models', { 
			get: function () {
				
				return this.grid.models;
			
			}
		});
		
		Object.defineProperty( _Puzzle.Instance.prototype, 'elements', { 
			get: function () {
				
				return this.grid.elements;
			
			}
		});
		
	}
	
	/*===================================================
	
	puzzle
	
	=====================================================*/
	
	function Puzzle ( parameters ) {
		
		var solved = false;
		
		puzzleCount++;
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.grid = parameters.grid || {};
		parameters.grid.puzzle = this;
		
		// prototype constructor
		
		_Model.Instance.call( this, parameters );
		
		// properties
		
		this.id = typeof parameters.id === 'string' ? parameters.id : puzzleID + puzzleCount;
		
		// signals
		
		this.stateChanged = new signals.Signal();
		
		// grid
		
		this.grid = new _Grid.Instance( parameters.grid );
		this.grid.stateChanged.add( this.on_state_changed, this );
		
		this.add( this.grid );
		
		/*===================================================
		
		solved
		
		=====================================================*/
		
		Object.defineProperty( this, 'isSolved', { 
			get: function () {
				
				solved = this.grid.isFull;
				
				return solved;
			
			}
		});
		
		this.solve = function () {
			
			// set solved
			
			solved = this.grid.isFull;
			
			// if solved
			
			if ( solved === true ) {
				
				// add to list
				
				if ( allPuzzlesSolved.indexOf( this ) === -1 ) {
					
					allPuzzlesSolved.push( this );
					
				}
				
			}
			
		};
		
		/*===================================================
		
		reset
		
		=====================================================*/
		
		this.reset = function () {
			
			// grid
			
			this.grid.reset();
			
			// solve
			
			this.solve();
			
		}
		
		// reset self
		
		this.reset();
		
		shared.signals.gamestop.add( this.reset, this );
		
		// add to global list
		
		if ( this.grid.modules.length > 0 ) {
			
			// add to puzzles list
			
			allPuzzles.push( this );
			
			_Puzzle._dirtyPuzzles = true;
			
		}
		
	}
	
	/*===================================================
	
	state
	
	=====================================================*/
	
	function on_state_changed ( module ) {
		
		console.log(' PUZZLE GRID STATE CHANGE for ', this.id );
		this.stateChanged.dispatch( module );
		
	}
	
} (KAIOPUA) );