/*
 *
 * Puzzles.js
 * Creates and tracks all puzzles.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/puzzles/Puzzle.js",
		_Puzzle = {},
		_Model,
		_Grid,
		_ToggleSwitch,
		puzzleNameBase = 'General',
		puzzleCount = 0,
		allPuzzles,
		allPuzzlesCompleted,
		allModules;
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	main.asset_register( assetPath, {
		data: _Puzzle,
		requirements: [
			"assets/modules/core/Model.js",
			"assets/modules/puzzles/Grid.js",
			"assets/modules/puzzles/ToggleSwitch.js"
		], 
		callbacksOnReqs: init_internal,
		wait: true
	} );

	/*===================================================
	
	init
	
	=====================================================*/
	
	function init_internal ( m, g, ts ) {
		console.log('internal puzzles', _Puzzle);
		_Model = m;
		_Grid = g;
		_ToggleSwitch = ts;
		
		// properties
		
		_Puzzle.hints = [];
		
		_Puzzle.scores = {};
		_Puzzle.scores.okay = {
			threshold: 0,
			icon: shared.pathToIcons + 'face_okay_rev_64.png',
			status: "Okay"
		};
		_Puzzle.scores.good = {
			threshold: 0.8,
			icon: shared.pathToIcons + 'face_smile_rev_64.png',
			status: 'Good'
		};
		_Puzzle.scores.perfect = {
			threshold: 1,
			icon: shared.pathToIcons + 'face_laugh_rev_64.png',
			status: 'Perfect'
		};
		
		_Puzzle.scoreMap = [
			_Puzzle.scores.okay,
			_Puzzle.scores.good,
			_Puzzle.scores.perfect
		];
		
		allPuzzles = [];
		allPuzzlesCompleted = [];
		allModules = [];
		allToggleSwitches = [];
		
		Object.defineProperty( _Puzzle, 'allPuzzles', { 
			get: function () { return allPuzzles.slice( 0 ); }
		});
		
		Object.defineProperty( _Puzzle, 'allPuzzlesCompleted', { 
			get: function () { return allPuzzlesCompleted.slice( 0 ); }
		});
		
		Object.defineProperty( _Puzzle, 'allToggleSwitches', { 
			get: function () { return allToggleSwitches.slice( 0 ); }
		});
		
		Object.defineProperty( _Puzzle, 'allModules', { 
			get: function () { return allModules.slice( 0 ); }
		});
		
		// instance
		
		_Puzzle.Instance = Puzzle;
		_Puzzle.Instance.prototype = new _Model.Instance();
		_Puzzle.Instance.prototype.constructor = _Puzzle.Instance;
		
		_Puzzle.Instance.prototype.reset = reset;
		_Puzzle.Instance.prototype.toggle = toggle;
		_Puzzle.Instance.prototype.activate = activate;
		_Puzzle.Instance.prototype.deactivate = deactivate;
		_Puzzle.Instance.prototype.complete = complete;
		_Puzzle.Instance.prototype.on_state_changed = on_state_changed;
		
		Object.defineProperty( _Puzzle.Instance.prototype, 'isCompleted', { 
			get: function () {
				
				return this.grid.isFull;
			
			}
		});
		
		Object.defineProperty( _Puzzle.Instance.prototype, 'occupants', { 
			get: function () {
				
				return this.grid.occupants;
			
			}
		});
		
		Object.defineProperty( _Puzzle.Instance.prototype, 'elements', { 
			get: function () {
				
				return this.grid.elements;
			
			}
		});
		
	}
	
	/*===================================================
	
	puzzle
	
	=====================================================*/
	
	function Puzzle ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		// prototype constructor
		
		_Model.Instance.call( this, parameters );
		
		// properties
		
		this.id = puzzleCount++;
		this.name = typeof parameters.name === 'string' ? parameters.name : puzzleNameBase;
		this.numElementsMin = parameters.numElementsMin;
			
		this.hints = {
			list: main.type( parameters.hints ) === 'array' ? ( parameters.hintsCombine === true ? [].concat( parameters.hints, _Puzzle.hints ) : parameters.hints ) : _Puzzle.hints,
			used: []
		}
		
		this.scoreMap = build_score_map( parameters.scores );
		this.scoreMap = add_rewards_to_scores( this.scoreMap, parameters.rewards );
		
		// signals
		
		this.stateChanged = new signals.Signal();
		
		// grid
		
		parameters.grid = typeof parameters.grid === 'string' || parameters.grid instanceof THREE.Geometry ? { modulesGeometry: parameters.grid } : ( parameters.grid || {} );
		parameters.grid.puzzle = this;
		
		this.grid = new _Grid.Instance( parameters.grid );
		this.grid.stateChanged.add( this.on_state_changed, this );
		this.add( this.grid );
		
		// toggle
		
		parameters.toggleSwitch = typeof parameters.toggleSwitch === 'string' || parameters.toggleSwitch instanceof THREE.Geometry ? { geometry: parameters.toggleSwitch } : ( parameters.toggleSwitch || {} );
		parameters.toggleSwitch.target = this;
		
		this.toggleSwitch = new _ToggleSwitch.Instance( parameters.toggleSwitch );
		this.toggleSwitch.stateChanged.add( this.toggle, this );
		this.add( this.toggleSwitch );
		
		// reset self
		
		shared.signals.gameStopped.add( this.reset, this );
		this.reset();
		
		// add to global list
		
		if ( this.grid.modules.length > 0 ) {
			
			// add to puzzles list
			
			allPuzzles.push( this );
			allModules = allModules.concat( this.grid.modules );
			allToggleSwitches.push( this.toggleSwitch );
			
		}
		
	}
	
	/*===================================================
	
	reset
	
	=====================================================*/
	
	function reset () {
		
		// properties
		
		this.completed = false;
		this.perfect = false;
		this.score = this.scoreLast = 0;
		this.scoreMap = reset_score_map( this.scoreMap );
		
		// grid
		
		this.grid.reset();
		
	}
	
	/*===================================================
	
	activate
	
	=====================================================*/
	
	function toggle () {
		
		// clean grid
		
		this.grid.clean();
		
		// set active state
		
		if ( this.toggleSwitch.state === true ) {
			
			this.activate();
			
		}
		else {
			
			this.deactivate();
			
		}
		
	}
	
	function activate () {
		
		console.log( this, this.name, ' ACTIVATED!' );
		
	}
	
	function deactivate () {
		
		console.log( this, this.name, ' deactivated :(' );
		
	}
	
	/*===================================================
	
	completed
	
	=====================================================*/
	
	function complete () {
		
		var i, l,
			j, k,
			elements,
			numElementsBase = this.grid.modules.length,
			numElementsUsed,
			numElementsDiff,
			numElementsMin,
			numElementsToMin,
			title,
			hint,
			scorePct,
			scoreInfo,
			scoreIndex,
			scoreHighestInfo,
			scoreStatus,
			scoreIcon,
			rewards,
			rewardInfo,
			rewardList,
			reward,
			numRewardsGiven = 0;
		
		// properties
		
		this.completed = this.grid.isFull;
		console.log( 'puzzle complete?', this.completed, this);
		// if completed
		
		if ( this.perfect !== true && this.completed === true ) {
			
			// get elements filling grid
			
			elements = this.elements;
			
			numElementsUsed = elements.length;
			
			// compare num elements used to base num required
			
			numElementsDiff = numElementsBase - numElementsUsed;
			
			numElementsMin = main.is_number( this.numElementsMin ) && this.numElementsMin > 0 ? this.numElementsMin : numElementsBase;
			
			numElementsToMin = Math.max( 0, numElementsUsed - numElementsMin );
			
			// store score
			
			this.scoreLast = this.score;
			
			this.score = Math.min( 1, 1 - numElementsToMin / ( numElementsBase - numElementsMin ) );
			
			if ( isNaN( this.score ) || this.score < 0 ) {
				
				this.score = 1;
				
			}
			
			scorePct = Math.round( this.score * 100 ) + "%";
			
			// use score map to determine status/icon/rewards
			
			rewards = [];
			
			for ( i = 0, l = this.scoreMap.length; i < l; i++ ) {
				
				scoreInfo = this.scoreMap[ i ];
				
				// set highest score
				
				if ( this.score >= scoreInfo.threshold ) {
					
					scoreHighestInfo = scoreInfo;
					
					scoreIndex = i;
					
				}
				
				// add all rewards possible
				
				if ( typeof scoreInfo.rewards !== 'undefined' && main.type( scoreInfo.rewards.list ) === 'array' && scoreInfo.rewards.list.length > 0 ) {
					
					// if giving to player
					
					if ( this.score >= scoreInfo.threshold ) {
						
						scoreInfo.rewards.enabled = true;
						
					}
					
					rewards.push( scoreInfo.rewards );
					
				}
				
			}
			
			scoreStatus = scoreHighestInfo.status;
			
			scoreIcon = scoreHighestInfo.icon;
			
			// perfect score
			if ( scoreIndex === this.scoreMap.length - 1 ) {
				
				this.perfect = true;
				
				// title
				
				title = "Hurrah! You completed the " + this.id + " puzzle!";
				
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
					
				}
				
			}
			
			//
			// TODO: use for dom > numElementsBase, numElementsMin, numElementsUsed, scorePct, scoreIcon, scoreStatus, title, hint
			//
			console.log( 'PUZZLE COMPLETE INFO: ' );
			console.log( 'numElementsBase ', numElementsBase, 'numElementsMin', numElementsMin, ' numElementsUsed ', numElementsUsed, ' scoreLast ', this.scoreLast, ' score ', this.score, 'scorePct', scorePct, ' scoreIcon', scoreIcon, ' scoreStatus', scoreStatus, 'title', title, 'hint', hint );
			
			// show all rewards
			// give all enabled rewards
			
			for ( i = 0, l = rewards.length; i < l; i++ ) {
				
				rewardInfo = rewards[ i ];
				
				rewardList = rewardInfo.list;
				
				// for each reward in list
				
				for ( j = 0, k = rewardList.length; j < k; j++ ) {
					
					reward = rewardList[ j ];
					
					// TODO: show dom > reward.image, reward.label
					
					if ( rewardInfo.enabled === true ) {
						
						if ( rewardInfo.given !== true ) {
							
							// new reward
							console.log( ' > puzzle new reward: ', reward.label, reward.image );
							
						}
						else {
							
							// already have reward
							console.log( ' > puzzle already have reward: ', reward.label );
							
						}
						
					}
					else {
						
						// reward at higher score
						console.log( ' > puzzle reward needs higher score: ', reward.label );
					
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
			
			
			if ( numRewardsGiven > 0 ) {
				
				console.log( ' > The tiki spirits favor you with ', numRewardsGiven, ' gifts ' );
				
			}
			else {
				
				console.log( ' > The tiki spirits have given all they can for now. ' );
				
			}
			
			// add to list
			
			if ( allPuzzlesCompleted.indexOf( this ) === -1 ) {
				
				allPuzzlesCompleted.push( this );
				
			}
			
		}
		
		// grid
		
		if ( this.grid instanceof _Grid.Instance ) {
			
			this.grid.complete();
			
		}
		
	}
	
	/*===================================================
	
	state
	
	=====================================================*/
	
	function on_state_changed ( module ) {
		console.log(' PUZZLE GRID STATE CHANGE for ', this.id );
		this.stateChanged.dispatch( module );
		
	}
	
	/*===================================================
	
	score map
	
	=====================================================*/
	
	function build_score_map ( parameters ) {
		
		var i, l,
			scoreBase = _Puzzle.scores.base,
			scoreMap,
			scoreInfo,
			rewards;
		
		// handle parameters
		
		parameters = parameters || {};
		
		scoreMap = parameters.scoreMap;
		
		if ( main.type( scoreMap ) !== 'array' || scoreMap.length === 0 ) {
			
			scoreMap = [
				main.extend( parameters.okay, main.extend( _Puzzle.scores.okay, {} ) ),
				main.extend( parameters.good, main.extend( _Puzzle.scores.good, {} ) ),
				main.extend( parameters.perfect, main.extend( _Puzzle.scores.perfect, {} ) )
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
			scoreInfo.rewards.list = main.ensure_array( scoreInfo.rewards.list );
			
		}
		
		// sort by threshold
		
		scoreMap.sort( function ( a, b ) {
			
			return a.threshold - b.threshold;
			
		} );
		
		// reset
		
		scoreMap = reset_score_map( scoreMap );
		
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
		
		return scoreMap;
		
	}
	
	function reset_score_map ( scoreMap ) {
		
		var i, l,
			scoreInfo;
		
		if ( main.is_array( scoreMap ) ) {
			
			for ( i = 0, l = scoreMap.length; i < l; i++ ) {
				
				scoreInfo = scoreMap[ i ];
				scoreInfo.rewards.given = false;
				scoreInfo.rewards.enabled = false;
				
			}
			
		}
		
		return scoreMap;
		
	}
	
} (KAIOPUA) );