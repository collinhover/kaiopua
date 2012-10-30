/*
 *
 * PuzzleLibrary.js
 * List of all puzzle build parameters, with capability to generate puzzles.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/puzzles/PuzzleLibrary.js",
		_PuzzleLibrary = {},
		_Puzzle,
		_Dirt;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _PuzzleLibrary,
		requirements: [
			"js/kaiopua/puzzles/Puzzle.js",
			"js/kaiopua/farming/Dirt.js",
			{ path: shared.pathToAsset + "Puzzle_Tutorial.js", type: 'model' },
			{ path: shared.pathToAsset + "Puzzle_Tutorial_Grid.js", type: 'model' },
			{ path: shared.pathToAsset + "Puzzle_Tutorial_Toggle.js", type: 'model' },
			{ path: shared.pathToAsset + "Puzzle_Rolling_Hills.js", type: 'model' },
			{ path: shared.pathToAsset + "Puzzle_Rolling_Hills_Grid.js", type: 'model' },
			{ path: shared.pathToAsset + "Puzzle_Rolling_Hills_Toggle.js", type: 'model' },
			{ path: shared.pathToAsset + "Puzzle_Basics_Abilities.js", type: 'model' },
			{ path: shared.pathToAsset + "Puzzle_Basics_Abilities_Grid.js", type: 'model' }
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    init
    
    =====================================================*/
	
	function init_internal( pzl, dt ) {
		console.log( 'internal PuzzleLibrary' );
		
		_Puzzle = pzl;
		_Dirt = dt;
		
		// functions
		
		_PuzzleLibrary.build = build;
		
		// puzzles
		
		_PuzzleLibrary.puzzles = {};
		
		Object.defineProperty(_PuzzleLibrary.puzzles, 'tutorial', { 
			value : {
				name: 'Tutorial',
				geometry: shared.pathToAsset + "Puzzle_Tutorial.js",
				physics: {
					bodyType: 'mesh'
				},
				grid: {
					modulesGeometry: shared.pathToAsset + "Puzzle_Tutorial_Grid.js",
					moduleInstance: _Dirt.Instance
				},
				toggleSwitch: shared.pathToAsset + "Puzzle_Tutorial_Toggle.js",
				numElementsMin: 6,
				numShapesRequired: 2,
				hints: [
					'Remember, the less plants you use, the better your score!'
				],
				scores: {
					poor: {
						rewards: [
							{ icon: 'shape_tromino_l_64.png', name: 'Tromino L', type: 'shape', data: 'trominol' }
						]
					},
					good: {
						rewards: [
							{ icon: 'grid_64.png', name: 'Rolling Hills', type: 'puzzle', data: 'rollinghills' }
						]
					},
					perfect: {
						rewards: [
							{ icon: 'pineapple_64.png', name: 'Pineapple', type: 'skin', data: 'pineapple' }
						]
					}
				}
			}
		});
		
		Object.defineProperty(_PuzzleLibrary.puzzles, 'abilities', { 
			value : {
				name: 'Abilities',
				geometry: shared.pathToAsset + "Puzzle_Basics_Abilities.js",
				physics: {
					bodyType: 'mesh'
				},
				grid: {
					modulesGeometry: shared.pathToAsset + "Puzzle_Basics_Abilities_Grid.js",
					moduleInstance: _Dirt.Instance
				},
				numElementsMin: 10,
				numShapesRequired: 2,
				hints: [
					'Some plants have special abilities that will help complete puzzles!'
				],
				hintsCombine: true,
				scores: {
					poor: {
						rewards: [
							{ icon: 'plant_64.png', name: 'Rock', type: 'skin', data: 'rock' }
						]
					},
					perfect: {
						rewards: [
							{ icon: 'pineapple_64.png', name: 'Pineapple', type: 'skin', data: 'pineapple' }
						]
					}
				}
			}
		});
		
		Object.defineProperty(_PuzzleLibrary.puzzles, 'rollinghills', { 
			value : {
				name: 'Rolling Hills',
				geometry: shared.pathToAsset + "Puzzle_Rolling_Hills.js",
				physics: {
					bodyType: 'mesh'
				},
				grid: {
					modulesGeometry: shared.pathToAsset + "Puzzle_Rolling_Hills_Grid.js",
					moduleInstance: _Dirt.Instance
				},
				toggleSwitch: shared.pathToAsset + "Puzzle_Rolling_Hills_Toggle.js",
				numElementsMin: 13,
				numShapesRequired: 3,
				hints: [
					'Some plants will only grow when next to certain other plants!',
					'Some puzzles are split into smaller parts. Puzzles are much easier to complete if you think this way!'
				],
				hintsCombine: true,
				scores: {
					poor: {
						rewards: [
							{ icon: 'plant_64.png', name: 'Pineapple', type: 'skin', data: 'pineapple' }
						]
					}
				}
			}
		});
		
	}
	
	/*===================================================
    
    build
    
    =====================================================*/
	
	function build( parameters ) {
		
		var puzzleName,
			puzzle;
		
		var puzzleName,
			puzzle;
		
		// handle parameters
		
		parameters = parameters || {};
		
		// get and format name
		
		if ( typeof parameters === 'string' ) {
			
			puzzleName = parameters;
			
		}
		else  {
			
			puzzleName = parameters.id || parameters.name;
		
		}
		
		puzzleName = puzzleName.toLowerCase();
		
		// combine passed parameters with library parameters
		
		parameters = main.extend( _PuzzleLibrary.puzzles[ puzzleName ], parameters );
		
		puzzle = new _Puzzle.Instance( parameters );
		puzzle.libraryNames = {
			puzzle: puzzleName
		};
		
		return puzzle;
		
	}
	
} (KAIOPUA) );