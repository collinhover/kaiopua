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
		ALL;
	
	main.asset_register( assetPath, {
		data: _Puzzles,
		requirements: [
			"assets/modules/core/Model.js",
			"assets/modules/puzzles/Grid.js"
		], 
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	function init_internal ( m, g ) {
		console.log('internal puzzles', _Puzzles);
		_Model = m;
		_Grid = g;
		
		// puzzles list
		
		ALL = [];
		
		Object.defineProperty( _Puzzles, 'all', { 
			get: function () { return ALL.slice( 0 ); }
		});
		
		// instance
		
		_Puzzles.Instance = Puzzle;
		_Puzzles.Instance.prototype = new _Model.Instance();
		_Puzzles.Instance.prototype.constructor = _Puzzles.Instance;
		
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
		
		// add to puzzles list
		
		ALL.push( this );
		
	}
	
} (KAIOPUA) );