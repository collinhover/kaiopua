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
		_Grid;
	
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
		console.log(' grid!', this.grid);
		this.add( this.grid );
		
		/*
		this.geometry.materials = [
			new THREE.MeshLambertMaterial( { color: 0xA9844C, ambient: 0xA9844C, transparent: true, opacity: 0.85 } ), // brown
			new THREE.MeshLambertMaterial( { color: 0x7FB662, ambient: 0x7FB662, transparent: true, opacity: 0.85 } ), // green
			new THREE.MeshLambertMaterial( { color: 0x0CD9F9, ambient: 0x0CD9F9, transparent: true, opacity: 0.85 } ), // blue
			new THREE.MeshLambertMaterial( { color: 0xDA2128, ambient: 0xDA2128, transparent: true, opacity: 0.85 } ), // red
			new THREE.MeshLambertMaterial( { color: 0xEEC835, ambient: 0xEEC835, transparent: true, opacity: 0.85 } ), // yellow
		];
		
		// state material testing
		
		faces[ 5 ].materialIndex = 1;
		faces[ 6 ].materialIndex = 1;
		faces[ 9 ].materialIndex = 1;
		faces[ 14 ].materialIndex = 1;
		faces[ 17 ].materialIndex = 1;
		
		faces[ 0 ].materialIndex = 3;
		faces[ 1 ].materialIndex = 3;
		faces[ 6 ].materialIndex = 3;
		faces[ 7 ].materialIndex = 3;
		
		faces[ 27 ].materialIndex = 2;
		faces[ 26 ].materialIndex = 2;
		faces[ 25 ].materialIndex = 2;
		faces[ 21 ].materialIndex = 2;
		faces[ 20 ].materialIndex = 2;
		faces[ 19 ].materialIndex = 2;
		*/
		
	}
	
} (KAIOPUA) );