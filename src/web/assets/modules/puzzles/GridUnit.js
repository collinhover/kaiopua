/*
 *
 * GridUnit.js
 * Single unit of puzzle grids.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/puzzles/GridUnit.js",
		_GridUnit = {};
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	main.asset_register( assetPath, { data: _GridUnit } );
	
	/*===================================================
	
	grid units
	
	=====================================================*/
	
	_GridUnit.Instance = GridUnit;
	
	function GridUnit ( faces, grid ) {
		
		this.faces = main.ensure_array( faces );
		
		this.face = this.faces[ 0 ];
		
		this.grid = grid;
		
		this.reset();
		
	}
	
	GridUnit.prototype = {
		
		reset: function () {
			
			if ( typeof this.face !== 'undefined' ) {
				
				this.face.materialIndex = this.grid.stateMaterials.indexOf( this.grid.stateMaterialDefault );
				
			}
			
			this.occupied = false;
			
		},
		
	};
	
} (KAIOPUA) );