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
		_Messenger;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Field,
		requirements: [
			"assets/modules/puzzles/Puzzle.js",
			"assets/modules/farming/Dirt.js",
			"assets/modules/ui/Messenger.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( pzl, dirt, msg ) {
		console.log('internal field', _Field);
		
		_Puzzle = pzl;
		_Dirt = dirt;
		_Messenger = msg;
		
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
				scoreStatus;
				
			// try solve puzzle
			
			solvePuzzle.call( this );
			
			// if is solved
			
			if ( this.isSolved === true ){
				
				// get elements filling grid
				
				elements = this.grid.elements;
				
				numElementsUsed = elements.length;
				
				// compare num elements used to base num required
				
				numElementsDiff = numElementsBase - numElementsUsed;
				
				numElementsMin = main.is_number( numElementsMin ) && numElementsMin <= numElementsDiff ? numElementsMin : numElementsDiff;
				
				numElementsToMin = Math.max( 0, numElementsUsed - numElementsMin );
				
				score = Math.max( 1, 1 - numElementsToMin / ( numElementsBase - numElementsMin ) );
				
				scorePct = score * 100 + "%";
				
				scoreStatus = _Puzzle.scoreStatus[ Math.floor( ( _Puzzle.scoreStatus.length - 1 ) * score ) ];
				
				// send message notifying user of score
				
				var scoreHTML = "<div id='score'><ul><li class='counter'><div class='counter_inner'><img src='assets/icons/character_rev_64.png' class='image'></div><p class='label'>" + scoreStatus + "</p></li><li class='counter'><div class='counter_inner'><p class='count text_huge'>" + numElementsBase + "</p><p class='label'>total spaces</p></div></li>";
				
				if ( numElementsToMin > 0 ) {
					
					scoreHTML += "<li class='counter'><div class='counter_inner'><p class='label'>you used</p><p class='count text_huge'>" + numElementsUsed + "</p><p class='label'>plants</p></div></li>";
					scoreHTML += "<li class='counter'><div class='counter_inner'><p class='label'>we bet you can do it with only</p><p class='count text_huge count_highlight'>" + numElementsMin + "</p><p class='label'>plants</p></div></li>";
					
				}
				else {
					
					scoreHTML += "<li class='counter'><div class='counter_inner'><p class='label'>you solved it with only</p><p class='count text_huge count_highlight'>" + numElementsUsed + "</p><p class='label'>plants</p></div></li>";
					
				}
				
				scoreHTML += "<li class='counter'><div class='counter_inner'><p class='count text_huge'>" + scorePct + "</p><p class='label'>score</p></div></li></ul></div>";
				
				_Messenger.show_message( { 
					head: scoreHTML,
					title: "Hurrah! You solved the " + this.id + " puzzle!",
					body: "The tiki spirits favor you with gifts!",
					active: true,
					transitionerOpacity: 0.9
				} );
				
			}
			
		};
		
	}
	
} (KAIOPUA) );