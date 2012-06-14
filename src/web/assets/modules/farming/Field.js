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
		
		_Field.hints = [
			"You can grab and move plants you've already planted by selecting them.",
			"You can rotate plants you've selected with a click, hold, and drag.",
			"You can get rid of plants by clicking them outside of a field."
		];
		
		_Field.scores = {};
		_Field.scores.base = {
			threshold: 0,
			icon: shared.pathToIcons + 'face_smile_rev_64.png',
			status: 'Good'
		};
		_Field.scores.okay = {
			threshold: 0,
			icon: shared.pathToIcons + 'face_okay_rev_64.png',
			status: "Average"
		};
		_Field.scores.good = {
			threshold: 0.8,
			icon: shared.pathToIcons + 'face_smile_rev_64.png',
			status: 'Good'
		};
		_Field.scores.perfect = {
			threshold: 1,
			icon: shared.pathToIcons + 'face_laugh_rev_64.png',
			status: 'Perfect'
		};
		
		_Field.scoreMap = [
			_Field.scores.okay,
			_Field.scores.good,
			_Field.scores.perfect
		];
		
		// instance
		
		_Field.Instance = Field;
		_Field.Instance.prototype = new _Puzzle.Instance();
		_Field.Instance.prototype.constructor = _Field.Instance;
		_Field.Instance.prototype.supr = _Puzzle.Instance.prototype;
		
		Object.defineProperty( _Field.Instance.prototype, 'plantModels', { 
			get: function () {
				
				// prototype call
				
				return this.models;
			
			}
		});
		
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
			solvedPerfect = false,
			solvePuzzle,
			resetPuzzle,
			numElementsMin;
		
		// handle parameters
		
		parameters = parameters || {};
		
		pGrid = parameters.grid = parameters.grid || {};
		pGrid.moduleInstance = _Dirt.Instance;
		
		// prototype constructor
		
		_Puzzle.Instance.call( this, parameters );
		
		// properties
		
		numElementsMin = parameters.numElementsMin;
			
		this.hints = {
			list: main.type( parameters.hints ) === 'array' ? ( parameters.hintsCombine === true ? [].concat( parameters.hints, _Field.hints ) : parameters.hints ) : _Field.hints,
			used: []
		}
		
		/*===================================================
		
		solved override
		
		=====================================================*/
		
		solvePuzzle = this.solve;
		
		this.solve = function () {
			
			var i, l,
				j, k,
				elements,
				numElementsBase = this.grid.modules.length,
				numElementsUsed,
				numElementsDiff,
				numElementsToMin,
				title,
				hint,
				score,
				scorePct,
				scoreInfo,
				scoreIndex,
				scoreHighestInfo,
				scoreStatus,
				scoreIcon,
				scoreHTML,
				bodyHTML,
				rewards,
				rewardInfo,
				rewardList,
				reward,
				numRewardsGiven = 0;
				
			// try solve puzzle
			
			solvePuzzle.call( this );
			
			// if is solved
			
			if ( solvedPerfect !== true && this.isSolved === true ){
				
				// get elements filling grid
				
				elements = this.plants;
				
				numElementsUsed = elements.length;
				
				// compare num elements used to base num required
				
				numElementsDiff = numElementsBase - numElementsUsed;
				
				numElementsMin = main.is_number( numElementsMin ) && numElementsMin > 0 ? numElementsMin : numElementsBase;
				
				numElementsToMin = Math.max( 0, numElementsUsed - numElementsMin );
				
				score = Math.min( 1, 1 - numElementsToMin / ( numElementsBase - numElementsMin ) );
				
				if ( isNaN( score ) || score < 0 ) {
					
					score = 1;
					
				}
				
				scorePct = Math.round( score * 100 ) + "%";
				
				// use score map to determine status/icon/rewards
				
				rewards = [];
				
				for ( i = 0, l = this.scoreMap.length; i < l; i++ ) {
					
					scoreInfo = this.scoreMap[ i ];
					
					// set highest score
					
					if ( score >= scoreInfo.threshold ) {
						
						scoreHighestInfo = scoreInfo;
						
						scoreIndex = i;
						
					}
					
					// add all rewards possible
					
					if ( typeof scoreInfo.rewards !== 'undefined' && main.type( scoreInfo.rewards.list ) === 'array' && scoreInfo.rewards.list.length > 0 ) {
						
						// if giving to player
						
						if ( score >= scoreInfo.threshold ) {
							
							scoreInfo.rewards.enabled = true;
							
						}
						
						rewards.push( scoreInfo.rewards );
						
					}
					
				}
				
				scoreStatus = scoreHighestInfo.status;
				
				scoreIcon = scoreHighestInfo.icon;
				
				
				// perfect score
				if ( scoreIndex === this.scoreMap.length - 1 ) {
					
					solvedPerfect = true;
					
					// title
					
					title = "Hurrah! You solved the " + this.id + " puzzle!";
					
				}
				// other scores
				else {
					
					// title
					
					if ( scoreIndex === 0 ) {
						
						title = "You've got the basics of the " + this.id + " puzzle!";
						
					}
					else {
						
						title = "Getting better at the " + this.id + " puzzle!";
						
					}
					
					// reset hints
					
					if ( this.hints.list.length === 0 && this.hints.used.length > 0 ) {
						
						this.hints.list = this.hints.list.concat( this.hints.used.splice( 0, this.hints.used.length ) );
						
					}
					
					// hint
					
					if ( this.hints.list.length > 0 ) {
						
						hint = this.hints.list.shift();
						
						this.hints.used.push( hint );
						
						title += "<br/><span class='highlight text_medium title_alt emphasis'>Hint: " + hint + "</span>";
						
					}
					
				}
				
				// send message notifying user of score
				
				scoreHTML = "<div class='grid align_center'><ul><li class='grid_compartment score_counter'><div class='grid_cell_inner'><img src='" + scoreIcon + "'></div><p class='score_label'>" + scoreStatus + "</p></li><li class='grid_compartment score_counter'><div class='grid_cell_inner'><p class='score_count text_huge'>" + numElementsBase + "</p><p class='score_label'>total spaces</p></div></li>";
				
				if ( numElementsToMin > 0 ) {
					
					scoreHTML += "<li class='grid_compartment score_counter'><div class='grid_cell_inner'><p class='score_label'>you used</p><p class='score_count text_huge'>" + numElementsUsed + "</p><p class='score_label'>plants</p></div></li>";
					scoreHTML += "<li class='grid_compartment score_counter'><div class='grid_cell_inner'><p class='score_label'>we bet you can do it with only</p><p class='score_count text_huge score_count_highlight'>" + numElementsMin + "</p><p class='score_label'>plants</p></div></li>";
					
				}
				else {
					
					scoreHTML += "<li class='grid_compartment score_counter'><div class='grid_cell_inner'><p class='score_label'>you solved it with only</p><p class='score_count text_huge score_count_highlight'>" + numElementsUsed + "</p><p class='score_label'>plants</p></div></li>";
					
				}
				
				scoreHTML += "<li class='grid_compartment score_counter'><div class='grid_cell_inner'><p class='score_count text_huge'>" + scorePct + "</p><p class='score_label'>score</p></div></li></ul></div>";
				
				// show all rewards
				// give all enabled rewards
				
				bodyHTML = '';
				
				if ( rewards.length > 0 ) {
					
					bodyHTML += "<div class='grid align_center'><ul>";
					
					for ( i = 0, l = rewards.length; i < l; i++ ) {
						
						rewardInfo = rewards[ i ];
						
						rewardList = rewardInfo.list;
						
						// for each reward in list
						
						for ( j = 0, k = rewardList.length; j < k; j++ ) {
							
							reward = rewardList[ j ];
							
							// show
							
							if ( typeof reward.image !== 'undefined' ) {
								
								if ( rewardInfo.enabled === true ) {
									
									if ( rewardInfo.given !== true ) {
										
										bodyHTML += "<li><div class='grid_cell_inner'><img src='" + reward.image + "'></div><p>" + ( reward.label || "New Gift!" ) + "</p></li>";
										
									}
									else {
										
										bodyHTML += "<li style='opacity:0.6'><div class='grid_cell_inner'><img src='" + ( shared.pathToIcons + "confirm_rev_64.png" ) + "'></div><p>You have this gift</p></li>";
										
									}
									
								}
								else {
									
									bodyHTML += "<li style='opacity:0.25'><div class='grid_cell_inner'><img src='" + reward.image + "'></div><p class='text_small'>unlock at higher score</p></li>";
								
								}
								
							}
							
							// if reward enabled
							
							if ( rewardInfo.enabled === true ) {
								
								// if not yet given
								
								if ( rewardInfo.given !== true ) {
									
									if ( typeof reward.callback === 'function' ) {
										
										reward.callback.apply( reward.context, main.ensure_array( reward.data ) );
										
									}
									
									numRewardsGiven++;
									
								}
								
							}
							
						}
						
						// set given
						
						if ( rewardInfo.enabled === true && rewardInfo.given !== true ) {
							
							rewardInfo.given = true;
						}
						
					}
					
					// notify about number of rewards given
					
					bodyHTML += "</ul></div>";
					
					if ( numRewardsGiven > 0 ) {
						
						bodyHTML = "<div class='info_panel align_center'><p>The tiki spirits <span class='highlight'>favor you with " + numRewardsGiven + " gift" + ( numRewardsGiven > 1 ? "s" : "" ) + "!</span></p><br/>" + bodyHTML + "</div>";
						
					}
					else {
						
						bodyHTML = "<div class='info_panel align_center'><p>The tiki spirits have given all they can for now.</p><br/>" + bodyHTML + "</div>";
						
					}
					
				}
				// no rewards
				else {
					
					bodyHTML += "<p>The tiki spirits have given all they can for now.</p>";
					
				}
				
				// send message
				
				_Messenger.show_message( { 
					head: scoreHTML,
					title: title,
					body: bodyHTML,
					priority: true,
					transitionerOpacity: 0.9,
					confirmRequired: true
				} );
				
			}
			
		};
		
		/*===================================================
		
		reset
		
		=====================================================*/
		
		resetPuzzle = this.reset;
		
		this.reset = function () {
			
			// reset puzzle
			
			resetPuzzle.call( this );
			
			// create score map
			
			this.scoreMap = generate_score_map( parameters.scores );
			
			add_rewards_to_scores( this.scoreMap, parameters.rewards );
			
			// perfect solution
			
			solvedPerfect = false;
			
		}
		
		// reset
		
		this.reset();
		
		shared.signals.gamestop.remove( resetPuzzle, this );
		shared.signals.gamestop.add( this.reset, this );
		
	}
	
	/*===================================================
	
	score map
	
	=====================================================*/
	
	function generate_score_map ( parameters ) {
		
		var i, l,
			scoreBase = _Field.scores.base,
			scoreMap,
			scoreInfo,
			rewards;
		
		// handle parameters
		
		parameters = parameters || {};
		
		scoreMap = parameters.scoreMap;
		
		if ( main.type( scoreMap ) !== 'array' || scoreMap.length === 0 ) {
			
			scoreMap = [
				main.extend( parameters.okay, main.extend( _Field.scores.okay, {} ) ),
				main.extend( parameters.good, main.extend( _Field.scores.good, {} ) ),
				main.extend( parameters.perfect, main.extend( _Field.scores.perfect, {} ) )
			];
			
		}
		
		// ensure all scores have required properties
		
		for ( i = 0, l = scoreMap.length; i < l; i++ ) {
			
			scoreInfo = scoreMap[ i ];
			
			if ( main.is_number( scoreInfo.threshold ) !== true ) {
				
				scoreInfo.threshold = scoreBase.threshold;
				
			}
			
			if ( typeof scoreInfo.status !== 'string' ) {
				
				scoreInfo.status = scoreBase.status;
				
			}
			
			if ( typeof scoreInfo.icon !== 'string' ) {
				
				scoreInfo.icon = scoreBase.icon;
				
			}
			
			scoreInfo.rewards = scoreInfo.rewards || {};
			scoreInfo.rewards.given = false;
			scoreInfo.rewards.list = main.ensure_array( scoreInfo.rewards.list );
			
		}
		
		// sort by threshold
		
		scoreMap.sort( function ( a, b ) {
			
			return a.threshold - b.threshold;
			
		} );
		
		return scoreMap;
		
	}
	
	function add_rewards_to_scores ( scoreMap, rewards ) {
		
		var i, l,
			scoreInfo,
			rewardAdditions;
		
		rewards = main.ensure_array( rewards );
		
		for ( i = 0, l = scoreMap.length; i < l; i++ ) {
			
			scoreInfo = scoreMap[ i ];
		
			if ( i < rewards.length ) {
				
				rewardAdditions = main.ensure_array( rewards[ i ] );
				
				scoreInfo.rewards.list = scoreInfo.rewards.list.concat( rewardAdditions );
				
			}
			
		}
		
	}
	
} (KAIOPUA) );