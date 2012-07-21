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
		data: _GridElementShapes,
		/*requirements: [
			"assets/modules/core/Game.js",
			"assets/modules/core/CameraControls.js",
			"assets/modules/characters/Hero.js",
			"assets/modules/ui/Messenger.js",
			"assets/modules/utils/ObjectHelper.js",
			"assets/modules/utils/MathHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true*/
	} );
	
	/*===================================================
    
    init
    
    =====================================================*/
	
	function init_internal() {
		console.log( 'internal GridElementShapes' );
		// shapes
		
		Object.defineProperty(_GridElementShapes, 'MONOMINO', { 
			value : {
				layout: [ [ 1 ] ]
			}
		});
		Object.defineProperty(_GridElementShapes, 'DOMINO', { 
			value : {
				layout: [
					[ 0, 1, 0 ],
					[ 0, 1, 0 ],
					[ 0, 0, 0 ]
				]
			}
		});
		Object.defineProperty(_GridElementShapes, 'TROMINO_I', { 
			value : {
				layout: [
					[ 0, 1, 0 ],
					[ 0, 1, 0 ],
					[ 0, 1, 0 ]
				]
			}
		});
		Object.defineProperty(_GridElementShapes, 'TROMINO_L', { 
			value : {
				layout: [
					[ 0, 1, 0 ],
					[ 0, 1, 1 ],
					[ 0, 0, 0 ]
				]
			}
		});
		Object.defineProperty(_GridElementShapes, 'TETROMINO_J', { 
			value : {
				layout: [
					[ 0, 1, 0 ],
					[ 0, 1, 0 ],
					[ 1, 1, 0 ]
				]
			}
		});
		Object.defineProperty(_GridElementShapes, 'TETROMINO_L', { 
			value : {
				layout: [
					[ 0, 1, 0 ],
					[ 0, 1, 0 ],
					[ 0, 1, 1 ]
				]
			}
		});
		Object.defineProperty(_GridElementShapes, 'TETROMINO_S', { 
			value : {
				layout: [
					[ 0, 1, 1 ],
					[ 1, 1, 0 ],
					[ 0, 0, 0 ]
				]
			}
		});
		Object.defineProperty(_GridElementShapes, 'TETROMINO_Z', { 
			value : {
				layout: [
					[ 1, 1, 0 ],
					[ 0, 1, 1 ],
					[ 0, 0, 0 ]
				]
			}
		});
		Object.defineProperty(_GridElementShapes, 'TETROMINO_T', { 
			value : {
				layout: [
					[ 1, 1, 1 ],
					[ 0, 1, 0 ],
					[ 0, 0, 0 ]
				]
			}
		});
		Object.defineProperty(_GridElementShapes, 'TETROMINO_O', { 
			value : {
				layout: [
					[ 0, 1, 1 ],
					[ 0, 1, 1 ],
					[ 0, 0, 0 ]
				]
			}
		});
		Object.defineProperty(_GridElementShapes, 'TETROMINO_I', { 
			value : {
				layout: [
					[ 0, 0, 1, 0 ],
					[ 0, 0, 1, 0 ],
					[ 0, 0, 1, 0 ],
					[ 0, 0, 1, 0 ]
				]
			}
		});
		
	}
	
	/*===================================================
    
    name
    
    =====================================================*/
	
	
	
	/*===================================================
    
    dom
    
    =====================================================*/
	
} (KAIOPUA) );