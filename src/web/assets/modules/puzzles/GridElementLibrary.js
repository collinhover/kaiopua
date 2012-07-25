/*
 *
 * GridElementLibrary.js
 * List of all grid elements.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/puzzles/GridElementLibrary.js",
		_GridElementLibrary = {},
		_GridElement;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _GridElementLibrary,
		requirements: [
			"assets/modules/puzzles/GridElement.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    init
    
    =====================================================*/
	
	function init_internal( ge ) {
		console.log( 'internal GridElementLibrary' );
		var shape,
			$buttons;
		
		_GridElement = ge;
		
		// functions
		
		_GridElementLibrary.build = build;
		
		// properties
		
		_GridElementLibrary.shapeNames = [];
		_GridElementLibrary.shapes = {};
		
		// monomino
		
		_GridElementLibrary.shapes.monomino = {
			layout: [ [ 1 ] ]
		};
		
		// domino
		
		_GridElementLibrary.shapes.domino = {
			layout: [
				[ 0, 1, 0 ],
				[ 0, 1, 0 ],
				[ 0, 0, 0 ]
			]
		};
		
		// tromino
		
		_GridElementLibrary.shapes.trominoI = {
			layout: [
				[ 0, 1, 0 ],
				[ 0, 1, 0 ],
				[ 0, 1, 0 ]
			]
		};
		_GridElementLibrary.shapes.trominoL = {
			layout: [
				[ 0, 1, 0 ],
				[ 0, 1, 1 ],
				[ 0, 0, 0 ]
			]
		};
		
		// tetromino
		
		_GridElementLibrary.shapes.tetrominoJ = {
			layout: [
				[ 0, 1, 0 ],
				[ 0, 1, 0 ],
				[ 1, 1, 0 ]
			]
		};
		_GridElementLibrary.shapes.tetrominoL = {
			layout: [
				[ 0, 1, 0 ],
				[ 0, 1, 0 ],
				[ 0, 1, 1 ]
			]
		};
		_GridElementLibrary.shapes.tetrominoS = {
			layout: [
				[ 0, 1, 1 ],
				[ 1, 1, 0 ],
				[ 0, 0, 0 ]
			]
		};
		_GridElementLibrary.shapes.tetrominoZ = {
			layout: [
				[ 1, 1, 0 ],
				[ 0, 1, 1 ],
				[ 0, 0, 0 ]
			]
		};
		_GridElementLibrary.shapes.tetrominoT = {
			layout: [
				[ 1, 1, 1 ],
				[ 0, 1, 0 ],
				[ 0, 0, 0 ]
			]
		};
		_GridElementLibrary.shapes.tetrominoO = {
			layout: [
				[ 0, 1, 1 ],
				[ 0, 1, 1 ],
				[ 0, 0, 0 ]
			]
		};
		_GridElementLibrary.shapes.tetrominoI = {
			layout: [
				[ 0, 0, 1, 0 ],
				[ 0, 0, 1, 0 ],
				[ 0, 0, 1, 0 ],
				[ 0, 0, 1, 0 ]
			]
		};
		
		// for each shape
		
		for ( shape in _GridElementLibrary.shapes ) {
			
			if ( _GridElementLibrary.shapes.hasOwnProperty( shape ) ) {
				
				_GridElementLibrary.shapeNames.push( shape );
				
				// disable and hide all shape buttons
				
				$buttons = _GridElementLibrary.shapes[ shape ].$buttons = $( ".shape-" + shape ).addClass( "disabled hidden" ).data( 'shape', shape );
				_GridElementLibrary.shapes[ shape ].$buttonsPuzzleActive = shared.domElements.$puzzleActiveShapes.find( $buttons );
				_GridElementLibrary.shapes[ shape ].$buttonsShapePicker = shared.domElements.$puzzleActiveShapesPicker.find( $buttons );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    build
    
    =====================================================*/
	
	function build ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.shape = _GridElementLibrary.shapes.hasOwnProperty( parameters.shape ) ? parameters.shape : 'monomino';
		
		// TODO: skin
		
		// copy shape parameters
		
		parameters = main.extend( parameters, _GridElementLibrary.shapes[ parameters.shape ] );
		console.log( 'BUILD GRID ELEMENT', parameters );
		return new _GridElement.Instance( parameters );
		
	}
	
} (KAIOPUA) );