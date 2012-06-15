/*
 *
 * GridElementShapes.js
 * List of all basic parameters of each grid element shape.
 * Names = 'shape' + size (ex: '3x3') + 2D array from left to right, top to bottom of 1s for shape module and 0s for nothing
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/puzzles/GridElementShapes.js",
		_GridElementShapes = {};
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	init_internal();
	
	main.asset_register( assetPath, { 
		data: _GridElementShapes
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal () {
		console.log('internal grid element shapes', _GridElementShapes);
		
		// functions
		
		_GridElementShapes.SHAPE_3x3_000010000 = SHAPE_3x3_000010000;
		_GridElementShapes.SHAPE_3x3_010011000 = SHAPE_3x3_010011000;
		_GridElementShapes.SHAPE_3x3_010111000 = SHAPE_3x3_010111000;
		
		Object.defineProperty( _GridElementShapes, 'SHAPE_3x3_000010000', { 
			get: SHAPE_3x3_000010000
		});
		Object.defineProperty( _GridElementShapes, 'SHAPE_3x3_010011000', { 
			get: SHAPE_3x3_010011000
		});
		Object.defineProperty( _GridElementShapes, 'SHAPE_3x3_010111000', { 
			get: SHAPE_3x3_010111000
		});
		
	}
	
	/*===================================================
    
    3x3
    
    =====================================================*/
	
	function SHAPE_3x3_000010000 () {
		
		return {
			icon: {
				image: shared.pathToIcons + 'grid_element_3x3_000010000_64.png',
				tooltip: 'Single'
			},
			layout: [ [ 1 ] ]
		};
	
	}
	
	function SHAPE_3x3_010011000 () {
		
		return {
			icon: {
				image: shared.pathToIcons + 'grid_element_3x3_010011000_64.png',
				tooltip: 'Elbow'
			},
			layout: [
				[ 0, 1, 0 ],
				[ 0, 1, 1 ],
				[ 0, 0, 0 ]
			]
		};
	
	}
	
	function SHAPE_3x3_010111000 () {
		
		return {
			icon: {
				image: shared.pathToIcons + 'grid_element_3x3_010111000_64.png',
				tooltip: 'Tee'
			},
			layout: [
				[ 0, 1, 0 ],
				[ 1, 1, 1 ],
				[ 0, 0, 0 ]
			]
		};
	
	}
	
} (KAIOPUA) );