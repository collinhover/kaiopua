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
		assetPath = "assets/modules/core/Puzzles.js",
		_Puzzles = {},
		_Model;
	
	main.asset_register( assetPath, {
		data: _Puzzles,
		requirements: [
			"assets/modules/core/Model.js"
		], 
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	function init_internal ( m ) {
		console.log('internal puzzles', _Puzzles);
		_Model = m;
		
		_Puzzles.Instance = Puzzle;
		_Puzzles.Instance.prototype = new _Model.Instance();
		_Puzzles.Instance.prototype.constructor = _Puzzles.Instance;
		
	}
	
	/*===================================================
	
	puzzle
	
	=====================================================*/
	
	function Puzzle ( parameters ) {
		
		var i, l,
			faces,
			face;
		
		// handle parameters
		
		parameters = parameters || {};
		
		// prototype constructor
		
		_Model.Instance.call( this, parameters );
		
		// add materials to be used in geometry to signify various states
		
		faces = this.geometry.faces;
		
		for ( i = 0, l = faces.length; i < l; i++ ) {
			
			face = faces[ i ];
			
			
		}
		
	}
	
} (KAIOPUA) );