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
			skin,
			data,
			$buttons;
		
		_GridElement = ge;
		
		// functions
		
		_GridElementLibrary.build = build;
		
		// properties
		
		_GridElementLibrary.shapeNames = [];
		_GridElementLibrary.shapes = {};
		_GridElementLibrary.skinNames = [];
		_GridElementLibrary.skins = {};
		
		// shapes
		
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
				
				// get data
				
				data = _GridElementLibrary.shapes[ shape ];
				
				// properties
				
				data.shape = shape;
				
				// store name in list
				
				_GridElementLibrary.shapeNames.push( shape );
				
				// disable and hide all buttons
				
				$buttons = data.$buttons = $( ".shape-" + shape ).addClass( "disabled hidden" ).data( 'shape', shape );
				data.$buttonsPuzzleActive = shared.domElements.$puzzleActiveShapes.find( $buttons );
				data.$buttonsShapePicker = shared.domElements.$puzzleActiveShapesPicker.find( $buttons );
				data.picked = false;
				
			}
			
		}
		
		// skins
		
		_GridElementLibrary.skins.taro = {
			//geometry: 'assets/models/Plant_Taro.js',
			customizations: {
				geometry: 'assets/models/Plant_Taro.js'
			}
		};
		
		_GridElementLibrary.skins.pineapple = {
			geometry: 'assets/models/Plant_Pineapple.js'
		};
		
		_GridElementLibrary.skins.rock = {
			geometry: 'assets/models/Plant_Rock.js'
		};
		
		// for each skin
		
		for ( skin in _GridElementLibrary.skins ) {
			
			if ( _GridElementLibrary.skins.hasOwnProperty( skin ) ) {
				
				// get data
				
				data = _GridElementLibrary.skins[ skin ];
				
				// properties
				
				data.skin = skin;
				
				// store name in list
				
				_GridElementLibrary.skinNames.push( skin );
				
				// TODO: disable and hide all buttons
				
				//$buttons = data.$buttons = $( ".skin-" + skin ).addClass( "disabled hidden" ).data( 'skin', skin );
				//data.$buttonsPuzzleActive = shared.domElements.$puzzleActiveShapes.find( $buttons );
				//data.$buttonsShapePicker = shared.domElements.$puzzleActiveShapesPicker.find( $buttons );
				
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
		parameters.skin = _GridElementLibrary.skins.hasOwnProperty( parameters.skin ) ? parameters.skin : 'taro';
		
		// copy parameters
		
		parameters = main.extend( parameters, _GridElementLibrary.shapes[ parameters.shape ] );
		parameters = main.extend( parameters, _GridElementLibrary.skins[ parameters.skin ] );
		console.log( 'BUILD GRID ELEMENT', parameters );
		return new _GridElement.Instance( parameters );
		
	}
	
} (KAIOPUA) );