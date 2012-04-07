/*
 *
 * Field.js
 * Basic puzzle of farming.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/farming/Field.js",
		_Field = {},
		_Puzzle,
		_Dirt,
		_Messenger,
		_MathHelper;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Field,
		requirements: [
			"assets/modules/puzzles/Puzzle.js",
			"assets/modules/farming/Dirt.js",
			"assets/modules/ui/Messenger.js",
			"assets/modules/utils/MathHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( pzl, dirt, msg, mh ) {
		console.log('internal field', _Field);
		
		_Puzzle = pzl;
		_Dirt = dirt;
		_Messenger = msg;
		_MathHelper = mh;
		
		// properties
		
		_Field.scoreStatus = [ 
			'uh oh...',
			'good',
			'perfect'
		];
		
		_Field.scoreIcon = [
			shared.pathToIcons + 'face_okay_rev_64.png', 
			shared.pathToIcons + 'face_smile_rev_64.png', 
			shared.pathToIcons + 'face_laugh_rev_64.png'
		];
		
		// instance
		
		_Field.Instance = Field;
		_Field.Instance.prototype = new _Puzzle.Instance();
		_Field.Instance.prototype.constructor = _Field.Instance;
		_Field.Instance.prototype.supr = _Puzzle.Instance.prototype;
		
		Object.defineProperty( _Field.Instance.prototype, 'plants', { 
			get: function () {
				
				// prototype call
				
				return this.elements;
			
			}
		});
		
	}
	
	/*===================================================
    
    field
    
    =====================================================*/
	
	function Field ( parameters ) {
		
		var pGrid,
			solvePuzzle,
			numElementsMin,
			rewards;
		
		// handle parameters
		
		parameters = parameters || {};
		
		pGrid = parameters.grid = parameters.grid || {};
		pGrid.moduleInstance = _Dirt.Instance;
		
		// prototype constructor
		
		_Puzzle.Instance.call( this, parameters );
		
		// properties
		
		rewards = parameters.rewards;
		numElementsMin = parameters.numElementsMin;
		
		/*===================================================
		
		solved override
		
		=====================================================*/
		
		solvePuzzle = this.solve;
		
		this.solve = function () {
			
			var elements,
				numElementsBase = this.grid.modules.length,
				numElementsUsed,
				numElementsDiff,
				numElementsToMin,
				score,
				scorePct,
				scoreStatus,
				scoreIcon;
				
			// try solve puzzle
			
			solvePuzzle.call( this );
			
			// if is solved
			
			if ( this.isSolved === true ){
				
				// get elements filling grid
				
				elements = this.grid.elements;
				
				numElementsUsed = elements.length;
				
				// compare num elements used to base num required
				
				numElementsDiff = numElementsBase - numElementsUsed;
				
				numElementsMin = main.is_number( numElementsMin ) ? numElementsMin : numElementsBase;
				
				numElementsToMin = Math.max( 0, numElementsUsed - numElementsMin );
				
				score = Math.min( 1, 1 - numElementsToMin / ( numElementsBase - numElementsMin ) );
				
				if ( isNaN( score ) ) {
					
					score = 0;
					
				}
				
				score = _MathHelper.round( score, 3 );
				
				scorePct = score * 100 + "%";
				
				scoreStatus = _Field.scoreStatus[ Math.floor( ( _Field.scoreStatus.length - 1 ) * score ) ];
				
				scoreIcon = _Field.scoreIcon[ Math.floor( ( _Field.scoreIcon.length - 1 ) * score ) ];
				
				// send message notifying user of score
				
				var scoreHTML = "<div class='grid'><ul><li class='grid_compartment score_counter'><div class='grid_cell_inner'><img src='" + scoreIcon + "' class='image'></div><p class='score_label'>" + scoreStatus + "</p></li><li class='grid_compartment score_counter'><div class='grid_cell_inner'><p class='score_count text_huge'>" + numElementsBase + "</p><p class='score_label'>total spaces</p></div></li>";
				
				if ( numElementsToMin > 0 ) {
					
					scoreHTML += "<li class='grid_compartment score_counter'><div class='grid_cell_inner'><p class='score_label'>you used</p><p class='score_count text_huge'>" + numElementsUsed + "</p><p class='score_label'>plants</p></div></li>";
					scoreHTML += "<li class='grid_compartment score_counter'><div class='grid_cell_inner'><p class='score_label'>we bet you can do it with only</p><p class='score_count text_huge score_count_highlight'>" + numElementsMin + "</p><p class='score_label'>plants</p></div></li>";
					
				}
				else {
					
					scoreHTML += "<li class='grid_compartment score_counter'><div class='grid_cell_inner'><p class='score_label'>you solved it with only</p><p class='score_count text_huge score_count_highlight'>" + numElementsUsed + "</p><p class='score_label'>plants</p></div></li>";
					
				}
				
				scoreHTML += "<li class='grid_compartment score_counter'><div class='grid_cell_inner'><p class='score_count text_huge'>" + scorePct + "</p><p class='score_label'>score</p></div></li></ul></div>";
				
				_Messenger.show_message( { 
					head: scoreHTML,
					title: "Hurrah! You solved the " + this.id + " puzzle!",
					body: "The tiki spirits favor you with gifts!",
					priority: true,
					transitionerOpacity: 0.9
				} );
				
			}
			
		};
		
	}
	
} (KAIOPUA) );