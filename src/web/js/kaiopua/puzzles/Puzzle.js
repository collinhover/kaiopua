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
		assetPath = "js/kaiopua/puzzles/Puzzle.js",
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
			"js/kaiopua/core/Model.js",
			"js/kaiopua/puzzles/Grid.js",
			"js/kaiopua/puzzles/ToggleSwitch.js"
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
		
		_Puzzle.hints = [ 
			"Not bad! The next puzzle will be more difficult... are you ready?"
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
		this.grid.onStateChanged.add( on_grid_changed, this );
		this.add( this.grid );
		
		// toggle
		
		parameters.toggleSwitch = typeof parameters.toggleSwitch === 'string' || parameters.toggleSwitch instanceof THREE.Geometry ? { geometry: parameters.toggleSwitch } : ( parameters.toggleSwitch || {} );
		parameters.toggleSwitch.target = this;
		
		this.toggleSwitch = new _ToggleSwitch.Instance( parameters.toggleSwitch );
		this.toggleSwitch.onStateChanged.add( this.toggle, this );
		this.add( this.toggleSwitch );
		
		// additional properties
		
		this.numGridModules = this.grid.modules.length;
		this.numElementsMin = main.is_number( parameters.numElementsMin ) && parameters.numElementsMin > 0 ? parameters.numElementsMin : this.numGridModules;
		this.shapesEnabled = main.to_array( parameters.shapesEnabled );
		this.shapesDisabled = main.to_array( parameters.shapesDisabled );
		this.shapes = [];
		this.numShapesRequired = main.is_number( parameters.numShapesRequired ) && parameters.numShapesRequired > 0 ? parameters.numShapesRequired : 1;
		if ( this.shapesEnabled.length > 0 && this.numShapesRequired > this.shapesEnabled.length ) {
			
			this.numShapesRequired = this.shapesEnabled.length;
			
		}
		
		this.hints = {
			list: main.type( parameters.hints ) === 'array' ? ( parameters.hintsCombine === true ? [].concat( parameters.hints, _Puzzle.hints ) : parameters.hints ) : _Puzzle.hints,
			used: []
		}
		
		this.scores = new Scores( parameters.scores );
		
		// signals
		
		this.onStateChanged = new signals.Signal();
		this.onShapesReady = new signals.Signal();
		this.onShapesNeeded = new signals.Signal();
		this.onShapeAdded = new signals.Signal();
		this.onShapeRemoved = new signals.Signal();
		this.onCompleted = new signals.Signal();
		
		// reset self
		
		shared.signals.onGameStopped.add( this.reset, this );
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
		
		this.started = this.completed = this.perfect = this.changed = false;
		this.score = this.scoreLast = this.scoreMax = this.scorePct = 0;
		this.numElementsUsed = 0;
		this.scoreTitle = this.scoreStatus = '';
		this.scores.reset();
		
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
		
		this.changed = false;
		
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
		
		// signal
		
		this.onStateChanged.dispatch( this.started );
		
		// check shape count
		
		if ( this.ready ) {
			
			this.onShapesReady.dispatch( this );
			
		}
		else {
			
			this.onShapesNeeded.dispatch( this );
			
		}
		
	}
	
	function stop () {
		console.log( this, this.name, ' stop!' );
		this.started = false;
		
		// try completing
		
		this.complete();
		
		// signal
		
		this.onStateChanged.dispatch( this.started );
		
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
				
				this.onShapeAdded.dispatch( this );
				
				added = true;
				
			}
			
			if ( this.ready ) {
				
				this.onShapesReady.dispatch( this );
				
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
			
			this.onShapeRemoved.dispatch( this );
			
			removed = true;
			
			// set shapes dirty
			
			this._dirtyShapes = true;
			
			// signal
			
			if ( this.ready !== true ) {
				
				this.onShapesNeeded.dispatch( this );
			
			}
			
		}
		
		return removed;
	
	}
	
	/*===================================================
	
	grid
	
	=====================================================*/
	
	function on_grid_changed () {
		
		this.changed = true;
		
	}
	
	/*===================================================
	
	complete
	
	=====================================================*/
	
	function complete () {
		
		var i, l,
			j, k,
			numElementsToMin,
			scoreData,
			scoreHighestIndex,
			scoreHighestInfo,
			rewards,
			rewardInfo,
			rewardList,
			reward,
			numRewardsGiven = 0;
		
		// properties
		
		this.completed = this.grid.isFull;
		console.log( this.name, ' puzzle complete?', this.completed, this);
		// if completed
		
		if ( this.completed === true ) {
				
			// get elements filling grid
			
			this.numElementsUsed = this.elements.length;
			
			// compare num elements used to base num required
			
			numElementsToMin = Math.max( 0, this.numElementsUsed - this.numElementsMin );
			
			// store score
			
			this.scoreLast = this.score;
			
			this.score = Math.min( 1, 1 - numElementsToMin / ( this.numGridModules - this.numElementsMin ) );
			
			if ( isNaN( this.score ) || this.score < 0 ) {
				
				this.score = 1;
				
			}
			
			this.scoreMax = Math.max( this.score, this.scoreMax );
			
			this.scorePct = Math.round( this.score * 100 ) + "%";
			console.log( 'this.numElementsUsed', this.numElementsUsed, 'this.numElementsMin', this.numElementsMin, ' numElementsToMin / ( this.numGridModules - this.numElementsMin )', (numElementsToMin / ( this.numGridModules - this.numElementsMin )), ' score', this.score);
			this.perfect = this.score === 1 ? true : false;
			
			// use score map to determine status/icon/rewards
			
			rewards = [];
			
			for ( i = 0, l = this.scores.map.length; i < l; i++ ) {
				
				scoreData = this.scores[ this.scores.map[ i ] ];
				
				// set highest score
				
				if ( this.score >= scoreData.threshold ) {
					
					scoreHighestInfo = scoreData;
					
					scoreHighestIndex = i;
					
					scoreData.beat = true;
					
				}
				
			}
			
			this.scoreStatus = scoreHighestInfo.status;
			
			// titles
			
			if ( this.perfect === true ) {
				
				this.scoreTitle = "Hurrah! You completed the " + this.name + " puzzle!";
				
			}
			else {
				
				if ( scoreHighestIndex === 0 ) {
					
					this.scoreTitle = "You've got the basics of the " + this.name + " puzzle!";
					
				}
				else {
					
					this.scoreTitle = "Getting better at the " + this.name + " puzzle!";
					
				}
				
			}
			
			// reset hints
			
			if ( this.hints.list.length === 0 && this.hints.used.length > 0 ) {
				
				this.hints.list = this.hints.list.concat( this.hints.used.splice( 0, this.hints.used.length ) );
				
			}
			
			// hint
			
			if ( this.hints.list.length > 0 ) {
				
				this.scoreHint = this.hints.list.shift();
				
				this.hints.used.push( this.scoreHint );
				
			}
			
			// add to list
			
			if ( main.index_of_value( allPuzzlesCompleted, this ) === -1 ) {
				
				allPuzzlesCompleted.push( this );
				
			}
			
			// grid
			
			if ( this.grid instanceof _Grid.Instance ) {
				
				this.grid.complete();
				
			}
			
			// signal
			
			this.onCompleted.dispatch();
			
		}
		
	}
	
	/*===================================================
	
	scores
	
	=====================================================*/
	
	function Scores ( parameters ) {
		
		var me = this,
			i, l,
			scoreData;
		
		parameters = parameters || {};
		
		// score levels
		
		this.poor = {
			threshold: 0,
			status: "Poor"
		};
		this.good = {
			threshold: 0.8,
			status: 'Good'
		};
		this.perfect = {
			threshold: 1,
			status: 'Perfect',
			rewards: []
		};
		
		// map
		
		this.map = [ 'poor', 'good', 'perfect' ];
		
		for ( i = 0, l = this.map.length; i < l; i++ ) {
			
			scoreData = this[ this.map[ i ] ];
			scoreData.rewards = [];
			
		}
		
		this.reset();
		
		// override with parameters
		
		$.extend( this.poor, parameters.poor );
		$.extend( this.good, parameters.good );
		$.extend( this.perfect, parameters.perfect );
		
		// sort by threshold
		
		this.map.sort( function ( a, b ) {
			
			return me[ a ].threshold - me[ b ].threshold;
			
		} );
		
	}
	
	Scores.prototype.reset = function () {
		
		var i, l,
			scoreData;
		
		for ( i = 0, l = this.map.length; i < l; i++ ) {
			
			scoreData = this[ this.map[ i ] ];
			
			scoreData.beat = false;
			
		}
		
	};
	
} (KAIOPUA) );