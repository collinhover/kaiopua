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
		_Messenger,
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
			"assets/modules/puzzles/Grid.js",
			"assets/modules/ui/Messenger.js"
		], 
		callbacksOnReqs: init_internal,
		wait: true
	} );

	/*===================================================
	
	init
	
	=====================================================*/
	
	function init_internal ( m, g, msg ) {
		console.log('internal puzzles', _Puzzle);
		_Model = m;
		_Grid = g;
		_Messenger = msg;
		
		// puzzles / modules list
		
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
		
		var solved = false,
			numElementsMin,
			rewards;
		
		puzzleCount++;
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.grid = parameters.grid || {};
		parameters.grid.puzzle = this;
		
		// prototype constructor
		
		_Model.Instance.call( this, parameters );
		
		// properties
		
		this.id = typeof parameters.id === 'string' ? parameters.id : puzzleID + puzzleCount;
		rewards = parameters.rewards;
		numElementsMin = parameters.numElementsMin;
		
		// init grid
		
		this.grid = new _Grid.Instance( parameters.grid );
		
		// add grid
		
		this.add( this.grid );
		
		/*===================================================
		
		solved
		
		=====================================================*/
		
		Object.defineProperty( this, 'isSolved', { 
			get: function () {
				
				return solved;
			
			}
		});
		
		this.solve = function () {
			
			var elements,
				numElementsBase = this.grid.modules.length,
				numElementsUsed,
				numElementsDiff;
			
			// if grid is full
			console.log('puzzle solve?');
			if ( solved !== true && this.grid.isFull === true ) {
				
				// set solved
				
				solved = true;
				
				// add to list
				
				if ( allPuzzlesSolved.indexOf( this ) === -1 ) {
					
					allPuzzlesSolved.push( this );
					
				}
				
				// get elements filling grid
				
				elements = this.grid.elements;
				
				numElementsUsed = elements.length;
				
				// compare num elements used to base num required
				
				numElementsDiff = numElementsBase - numElementsUsed;
				
				numElementsMin = main.is_number( numElementsMin ) && numElementsMin <= numElementsDiff ? numElementsMin : numElementsDiff;
				
				// send message notifying user of score
				
				_Messenger.show_message( { 
					//image: shared.pathToIcons + 'alertcircle_64.png',
					title: "Hurrah! You solved the " + this.id + " puzzle!",
					body: "Looks like you only needed " + numElementsUsed + " out of " + numElementsBase + " elements! You beat the baseline score by " + numElementsDiff + " and are " + ( numElementsMin - numElementsDiff ) + " away from a perfect score!",
					active: true
				} );
				
			}
			
		};
		
		// signal
		
		this.grid.stateChanged.add( this.solve, this );
		
		// add to global list
		
		if ( this.grid.modules.length > 0 ) {
			
			// add to puzzles list
			
			allPuzzles.push( this );
			
			_Puzzle._dirtyPuzzles = true;
			
		}
		
	}
	
} (KAIOPUA) );