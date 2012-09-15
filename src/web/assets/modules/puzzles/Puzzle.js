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
		_Puzzle.scores.base = {
			threshold: 0,
			icon: 'plant',
			status: "Started"
		};
		_Puzzle.scores.okay = {
			threshold: 0,
			icon: 'face_okay',
			status: "Okay"
		};
		_Puzzle.scores.good = {
			threshold: 0.8,
			icon: 'face_smile',
			status: 'Good'
		};
		_Puzzle.scores.perfect = {
			threshold: 1,
			icon: 'face_laugh',
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
		_Puzzle.Instance.prototype.start = start;
		_Puzzle.Instance.prototype.stop = stop;
		
		_Puzzle.Instance.prototype.add_shape = add_shape;
		_Puzzle.Instance.prototype.remove_shape = remove_shape;
		
		_Puzzle.Instance.prototype.clean = clean;
		
		_Puzzle.Instance.prototype.complete = complete;
		
		Object.defineProperty( _Puzzle.Instance.prototype, 'ready', { 
			get: function () {
				
				return this.shapes.length === this.numShapesRequired;
			
			}
		});
		
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
		
		// grid
		
		parameters.grid = typeof parameters.grid === 'string' || parameters.grid instanceof THREE.Geometry ? { modulesGeometry: parameters.grid } : ( parameters.grid || {} );
		parameters.grid.puzzle = this;
		
		this.grid = new _Grid.Instance( parameters.grid );
		this.add( this.grid );
		
		// toggle
		
		parameters.toggleSwitch = typeof parameters.toggleSwitch === 'string' || parameters.toggleSwitch instanceof THREE.Geometry ? { geometry: parameters.toggleSwitch } : ( parameters.toggleSwitch || {} );
		parameters.toggleSwitch.target = this;
		
		this.toggleSwitch = new _ToggleSwitch.Instance( parameters.toggleSwitch );
		this.toggleSwitch.stateChanged.add( this.toggle, this );
		this.add( this.toggleSwitch );
		
		// additional properties
		
		this.numGridModules = this.grid.modules.length;
		this.numElementsMin = main.is_number( parameters.numElementsMin ) && parameters.numElementsMin > 0 ? parameters.numElementsMin : this.numGridModules;
		this.shapesEnabled = main.ensure_array( parameters.shapesEnabled );
		this.shapesDisabled = main.ensure_array( parameters.shapesDisabled );
		this.shapes = [];
		this.numShapesRequired = main.is_number( parameters.numShapesRequired ) && parameters.numShapesRequired > 0 ? parameters.numShapesRequired : 1;
		if ( this.shapesEnabled.length > 0 && this.numShapesRequired > this.shapesEnabled.length ) {
			
			this.numShapesRequired = this.shapesEnabled.length;
			
		}
		
		this.hints = {
			list: main.type( parameters.hints ) === 'array' ? ( parameters.hintsCombine === true ? [].concat( parameters.hints, _Puzzle.hints ) : parameters.hints ) : _Puzzle.hints,
			used: []
		}
		
		this.scoreMap = build_score_map( parameters.scores );
		this.scoreMap = add_rewards_to_scores( this.scoreMap, parameters.rewards );
		
		// signals
		
		this.stateChanged = new signals.Signal();
		this.shapesReady = new signals.Signal();
		this.shapesNeeded = new signals.Signal();
		
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
		
		this.started = this.completed = this.perfect = false;
		this.score = this.scoreLast = this.scorePct = 0;
		this.scoreStatus = _Puzzle.scores.base.status;
		this.scoreIcon = _Puzzle.scores.base.icon;
		this.scoreMap = reset_score_map( this.scoreMap );
		
		// clean
		
		this.clean( true );
		
		// grid
		
		this.grid.reset();
		
		// toggleSwitch handles own reset
		
	}
	
	/*===================================================
	
	clean
	
	=====================================================*/
	
	function clean ( force ) {
		
		var i, l,
			elements,
			element;
		
		// remove any element with shape in puzzle not in shapes list
		
		if ( this._dirtyShapes !== false || force === true ) {
			
			elements = this.elements;
			
			for ( i = 0, l = elements.length; i < l; i++ ) {
				
				element = elements[ i ];
				
				if ( main.index_of_value( this.shapes, element.shape ) === -1 ) {
					
					element.change_module();
					
				}
				
			}
			
			this._dirtyShapes = false;
			
		}
		
		// clean grid
		
		this.grid.clean( undefined, force );
		
	}
	
	/*===================================================
	
	toggle
	
	=====================================================*/
	
	function toggle () {
		
		// clean puzzle
		
		this.clean();
		
		// set active state
		
		if ( this.toggleSwitch.state === true ) {
			
			this.start();
			
		}
		else {
			
			this.stop();
			
		}
		
	}
	
	function start () {
		console.log( this, this.name, ' START!' );
		this.started = true;
		
		// TODO: start spawning farmer enemies that plant bad plants or destroy plants?
		
		// signal
		
		this.stateChanged.dispatch( this.started );
		
		// check shape count
		
		if ( this.ready ) {
			
			this.shapesReady.dispatch( this );
			
		}
		else {
			
			this.shapesNeeded.dispatch( this );
			
		}
		
	}
	
	function stop () {
		console.log( this, this.name, ' stop!' );
		this.started = false;
		
		// try completing
		
		this.complete();
		
		// signal
		
		this.stateChanged.dispatch( this.started );
		
	}
	
	/*===================================================
	
	shapes
	
	=====================================================*/
	
	function add_shape ( shape ) {
		
		var added = false;
		
		if ( this.ready !== true ) {
			
			// doesnt have shape yet and is an enabled shape
			
			if ( main.index_of_value( this.shapes, shape ) === -1 && ( this.shapesEnabled.length === 0 || main.index_of_value( this.shapesEnabled, shape ) !== -1 ) && ( this.shapesDisabled.length === 0 || main.index_of_value( this.shapesDisabled, shape ) === -1 ) ) {
				
				this.shapes.push( shape );
				added = true;
				
			}
			
			if ( this.ready ) {
				
				this.shapesReady.dispatch( this );
				
			}
			
		}
		
		return added;
		
	}
	
	function remove_shape ( shape ) {
		
		var removed = false,
			index;
		
		// remove from list
		
		index = main.index_of_value( this.shapes, shape );
		
		if ( index !== -1 ) {
			
			this.shapes.splice( index, 1 );
			removed = true;
			
			// set shapes dirty
			
			this._dirtyShapes = true;
			
			// signal
			
			this.shapesNeeded.dispatch( this );
			
		}
		
		return removed;
	
	}
	
	/*===================================================
	
	completed
	
	=====================================================*/
	
	function complete () {
		
		var i, l,
			j, k,
			elements,
			numElementsUsed,
			numElementsMin,
			numElementsToMin,
			title,
			hint,
			scoreInfo,
			scoreIndex,
			scoreHighestInfo,
			scoreIcon,
			rewards,
			rewardInfo,
			rewardList,
			reward,
			numRewardsGiven = 0;
		
		// properties
		
		this.completed = this.grid.isFull;
		console.log( this.id, ' puzzle complete?', this.completed, this);
		// if completed
		
		if ( this.completed === true ) {
			
			// until has perfect score
			
			if ( this.perfect !== true ) {
				
				// get elements filling grid
				
				elements = this.elements;
				
				numElementsUsed = elements.length;
				
				// compare num elements used to base num required
				
				numElementsToMin = Math.max( 0, numElementsUsed - this.numElementsMin );
				
				// store score
				
				this.scoreLast = this.score;
				
				this.score = Math.min( 1, 1 - numElementsToMin / ( this.numGridModules - numElementsMin ) );
				
				if ( isNaN( this.score ) || this.score < 0 ) {
					
					this.score = 1;
					
				}
				
				this.scorePct = Math.round( this.score * 100 ) + "%";
				
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
				
				this.scoreStatus = scoreHighestInfo.status;
				
				this.scoreIcon = scoreHighestInfo.icon;
				
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
				// TODO: use for ui > this.numGridModules, this.numElementsMin, numElementsUsed, this.scorePct, scoreIcon, this.scoreStatus, title, hint
				//
				console.log( 'PUZZLE COMPLETE INFO: ' );
				console.log( 'this.numGridModules', this.numGridModules, 'this.numElementsMin', this.numElementsMin, ' numElementsUsed ', numElementsUsed, ' scoreLast ', this.scoreLast, ' score ', this.score, 'scorePct', this.scorePct, ' scoreIcon', scoreIcon, ' this.scoreStatus', this.scoreStatus, 'title', title, 'hint', hint );
				
				// show all rewards
				// give all enabled rewards
				
				for ( i = 0, l = rewards.length; i < l; i++ ) {
					
					rewardInfo = rewards[ i ];
					
					rewardList = rewardInfo.list;
					
					// for each reward in list
					
					for ( j = 0, k = rewardList.length; j < k; j++ ) {
						
						reward = rewardList[ j ];
						
						// TODO: show ui > reward.image, reward.label
						
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
				
				if ( main.index_of_value( allPuzzlesCompleted, this ) === -1 ) {
					
					allPuzzlesCompleted.push( this );
					
				}
				
			}
			
			// grid
			
			if ( this.grid instanceof _Grid.Instance ) {
				
				this.grid.complete();
				
			}
			
		}
		
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