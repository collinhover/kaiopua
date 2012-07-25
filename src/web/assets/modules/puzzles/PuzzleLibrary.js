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
		assetPath = "assets/modules/puzzles/PuzzleLibrary.js",
		_PuzzleLibrary = {},
		_Puzzle,
		_Dirt;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _PuzzleLibrary,
		requirements: [
			"assets/modules/puzzles/Puzzle.js",
			"assets/modules/farming/Dirt.js"
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
		
		_PuzzleLibrary.parameters = {};
		
		Object.defineProperty(_PuzzleLibrary.parameters, 'Tutorial', { 
			value : {
				name: 'Tutorial',
				geometry: "assets/models/Puzzle_Tutorial.js",
				physics: {
					bodyType: 'mesh'
				},
				grid: {
					modulesGeometry: "assets/models/Puzzle_Tutorial_Grid.js",
					moduleInstance: _Dirt.Instance
				},
				moduleInstance: _Dirt.Instance,
				numElementsMin: 0,
				rewards: [
					{
						image: shared.pathToIcons + 'plant_rev_64.png',
						label: 'New Plant!',
						//callback: _Farming.give_plants,
						data: 'taro_003'
					}
				]
			}
		});
		
		Object.defineProperty(_PuzzleLibrary.parameters, 'Abilities', { 
			value : {
				name: 'Abilities',
				geometry: "assets/models/Puzzle_Basics_Abilities.js",
				physics: {
					bodyType: 'mesh'
				},
				grid: {
					modulesGeometry: "assets/models/Puzzle_Basics_Abilities_Grid.js",
					moduleInstance: _Dirt.Instance
				},
				numElementsMin: 10,
				hints: [
					'Some plants have special abilities that will help complete puzzles!'
				],
				hintsCombine: true,
				rewards: [
					{
						image: shared.pathToIcons + 'plant_rev_64.png',
						label: 'New Plant!',
						//callback: _Farming.give_plants,
						data: 'rock'
					},
					false,
					{
						image: shared.pathToIcons + 'plant_rev_64.png',
						label: 'New Plant!',
						//callback: _Farming.give_plants,
						data: 'pineapple_001'
					}
				]
			}
		});
		
		Object.defineProperty(_PuzzleLibrary.parameters, 'RollingHills', { 
			value : {
				name: 'Rolling Hills',
				geometry: "assets/models/Puzzle_Rolling_Hills.js",
				physics: {
					bodyType: 'mesh'
				},
				grid: {
					modulesGeometry: "assets/models/Puzzle_Rolling_Hills_Grid.js",
					moduleInstance: _Dirt.Instance
				},
				toggleSwitch: "assets/models/Puzzle_Rolling_Hills_Toggle.js",
				moduleInstance: _Dirt.Instance,
				numElementsMin: 13,
				numShapesRequired: 3,
				hints: [
					'Some plants will only grow when next to certain other plants!',
					'Some puzzles are split into smaller parts. Puzzles are much easier to complete if you think this way!'
				],
				hintsCombine: true,
				rewards: [
					{
						image: shared.pathToIcons + 'plant_rev_64.png',
						label: 'New Plant!',
						//callback: _Farming.give_plants,
						data: 'pineapple_001'
					}
				]
			}
		});
		
	}
	
	/*===================================================
    
    build
    
    =====================================================*/
	
	function build( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		return new _Puzzle.Instance( main.extend( parameters, _PuzzleLibrary.parameters.hasOwnProperty( parameters.name ) ? _PuzzleLibrary.parameters[ parameters.name ] : {} ) );
		
	}
	
} (KAIOPUA) );