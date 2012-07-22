/*
 *
 * GridElementShapes.js
 * List of all basic parameters of each polyomino grid element shape.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/puzzles/GridElementShapes.js",
		_GridElementShapes = {};
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	init_internal();
	
	main.asset_register( assetPath, { 
		data: _GridElementShapes
	} );
	
	/*===================================================
    
    init
    
    =====================================================*/
	
	function init_internal() {
		
		var shape,
			$buttons;
		console.log( 'internal GridElementShapes' );
		
		// shapes
		
		_GridElementShapes.all = [];
		
		// monomino
		
		_GridElementShapes.monomino = {
			layout: [ [ 1 ] ]
		};
		
		// domino
		
		_GridElementShapes.domino = {
			layout: [
				[ 0, 1, 0 ],
				[ 0, 1, 0 ],
				[ 0, 0, 0 ]
			]
		};
		
		// tromino
		
		_GridElementShapes.trominoI = {
			layout: [
				[ 0, 1, 0 ],
				[ 0, 1, 0 ],
				[ 0, 1, 0 ]
			]
		};
		_GridElementShapes.trominoL = {
			layout: [
				[ 0, 1, 0 ],
				[ 0, 1, 1 ],
				[ 0, 0, 0 ]
			]
		};
		
		// tetromino
		
		_GridElementShapes.tetrominoJ = {
			layout: [
				[ 0, 1, 0 ],
				[ 0, 1, 0 ],
				[ 1, 1, 0 ]
			]
		};
		_GridElementShapes.tetrominoL = {
			layout: [
				[ 0, 1, 0 ],
				[ 0, 1, 0 ],
				[ 0, 1, 1 ]
			]
		};
		_GridElementShapes.tetrominoS = {
			layout: [
				[ 0, 1, 1 ],
				[ 1, 1, 0 ],
				[ 0, 0, 0 ]
			]
		};
		_GridElementShapes.tetrominoZ = {
			layout: [
				[ 1, 1, 0 ],
				[ 0, 1, 1 ],
				[ 0, 0, 0 ]
			]
		};
		_GridElementShapes.tetrominoT = {
			layout: [
				[ 1, 1, 1 ],
				[ 0, 1, 0 ],
				[ 0, 0, 0 ]
			]
		};
		_GridElementShapes.tetrominoO = {
			layout: [
				[ 0, 1, 1 ],
				[ 0, 1, 1 ],
				[ 0, 0, 0 ]
			]
		};
		_GridElementShapes.tetrominoI = {
			layout: [
				[ 0, 0, 1, 0 ],
				[ 0, 0, 1, 0 ],
				[ 0, 0, 1, 0 ],
				[ 0, 0, 1, 0 ]
			]
		};
		
		
		// for each shape
		
		for ( shape in _GridElementShapes ) {
			
			if ( _GridElementShapes.hasOwnProperty( shape ) && shape !== 'all' ) {
				
				_GridElementShapes.all.push( shape );
				
				// disable and hide all shape buttons
				
				$buttons = _GridElementShapes[ shape ].$buttons = $( ".shape-" + shape ).addClass( "disabled hidden" ).data( 'shape', shape );
				_GridElementShapes[ shape ].$buttonsPuzzleActive = shared.domElements.$puzzleActiveShapes.find( $buttons );
				_GridElementShapes[ shape ].$buttonsShapePicker = shared.domElements.$puzzleActiveShapesPicker.find( $buttons );
				
			}
			
		}
	}
	
} (KAIOPUA) );