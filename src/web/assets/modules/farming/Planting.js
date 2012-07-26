/*
 *
 * Planting.js
 * Gives character ability to plant.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/farming/Planting.js",
		_Planting = {},
		_Game,
		_Grid,
		_Puzzle,
		_ToggleSwitch,
		_GridModule,
		_GridModel,
		_GridElement,
		_GridElementLibrary,
		_MathHelper,
		_ObjectHelper,
		utilVec31Rotate,
		utilProjector1Rotate;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Planting,
		requirements: [
			"assets/modules/core/Game.js",
			"assets/modules/puzzles/Puzzle.js",
			"assets/modules/puzzles/ToggleSwitch.js",
			"assets/modules/puzzles/Grid.js",
			"assets/modules/puzzles/GridModule.js",
			"assets/modules/puzzles/GridModel.js",
			"assets/modules/puzzles/GridElement.js",
			"assets/modules/puzzles/GridElementLibrary.js",
			"assets/modules/utils/MathHelper.js",
			"assets/modules/utils/ObjectHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( g, pzl, ts, gr, gm, gmodel, ge, ges, mh, oh ) {
		console.log('internal planting', _Planting);
		
		_Game = g;
		_Puzzle = pzl;
		_ToggleSwitch = ts;
		_Grid = gr;
		_GridModule = gm;
		_GridModel = gmodel;
		_GridElement = ge;
		_GridElementLibrary = ges;
		_MathHelper = mh;
		_ObjectHelper = oh;
		
		utilVec31Rotate = new THREE.Vector3();
		utilProjector1Rotate = new THREE.Projector();
		
		// properties
		
		_Planting.rotationSpeed = 0.05;
		_Planting.rotationDistanceMin = 10;
		_Planting.rotationStartThreshold = Math.PI * 0.1;
		_Planting.rotationDirChangeThreshold = 5;
		
		// instance
		
		_Planting.Instance = Planting;
		
		_Planting.Instance.prototype.reset = reset;
		
		_Planting.Instance.prototype.add_collection_plant = add_collection_plant;
		_Planting.Instance.prototype.remove_collection_plant = remove_collection_plant;
		_Planting.Instance.prototype.add_collection_shape = add_collection_shape;
		_Planting.Instance.prototype.remove_collection_shape = remove_collection_shape;
		
		_Planting.Instance.prototype.select_plant = select_plant;
		_Planting.Instance.prototype.select_puzzle = select_puzzle;
		_Planting.Instance.prototype.activate_plant = activate_plant;
		_Planting.Instance.prototype.activate_puzzle = activate_puzzle;
		
		_Planting.Instance.prototype.start = start;
		_Planting.Instance.prototype.step = step;
		_Planting.Instance.prototype.update = update;
		_Planting.Instance.prototype.complete = complete;
		_Planting.Instance.prototype.stop = stop;
		
		_Planting.Instance.prototype.get_planting_object_under_pointer = get_planting_object_under_pointer;
		
		_Planting.Instance.prototype.change_puzzle = change_puzzle;
		_Planting.Instance.prototype.change_module = change_module;
		_Planting.Instance.prototype.change_plant = change_plant;
		
		_Planting.Instance.prototype.start_rotate_plant = start_rotate_plant;
		_Planting.Instance.prototype.update_rotate_plant = update_rotate_plant;
		_Planting.Instance.prototype.stop_rotate_plant = stop_rotate_plant;
		
	}
	
	/*===================================================
    
    planting
    
    =====================================================*/
	
	function Planting () {
		
		// properties
		
		this.rotationSpeed = _Planting.rotationSpeed;
		this.rotationDistanceMin = _Planting.rotationDistanceMin;
		this.rotationStartThreshold = _Planting.rotationStartThreshold;
		this.rotationDirChangeThreshold = _Planting.rotationDirChangeThreshold;
		this.plants = [];
		this.shapes = [];
		
		// signals
		
		this.puzzleStarted = new signals.Signal();
		this.puzzleSelected = new signals.Signal();
		this.puzzleStopped = new signals.Signal();
		
		this.plantSelected = new signals.Signal();
		this.plantStarted = new signals.Signal();
		this.plantStopped = new signals.Signal();
		
		this.planted = new signals.Signal();
		this.plantedSingle = new signals.Signal();
		this.plantedMulti = new signals.Signal();
		
		// reset
		
		this.reset();
		
	}
	
	/*===================================================
	
	reset
	
	=====================================================*/
	
	function reset () {
		
		var i, l;
		
		// clear collection
		// plants
		
		for ( i = 0, l = this.plants.length; i < l; i++ ) {
			
			this.remove_collection_plant( this.plants[ i ] );
			
		}
		
		// shapes
		
		for ( i = 0, l = this.shapes.length; i < l; i++ ) {
			
			this.remove_collection_shape( this.shapes[ i ] );
			
		}
		
		// create collection
		// plants
		
		this.add_collection_plant( 'taro' );
		this.add_collection_plant( 'rock' );
		
		// shapes
		
		this.add_collection_shape( 'monomino' );
		this.add_collection_shape( 'domino' );
		this.add_collection_shape( 'trominoL' );
		this.add_collection_shape( 'tetrominoT' );
		
		// stop planting
		
		this.stop();
		
	}
	
	/*===================================================
	
	collection
	
	=====================================================*/
	
	function add_collection_plant ( plant ) {
		
		
		
	}
	
	function remove_collection_plant ( plant ) {
		
		
		
	}
	
	function add_collection_shape ( shape ) {
		
		// if valid shape
		
		if ( _GridElementLibrary.shapes.hasOwnProperty( shape ) ) {
			
			this.shapes.push( shape );
			
			// shape picker buttons
			
			_GridElementLibrary.shapes[ shape ].$buttonsShapePicker.removeClass( "disabled hidden" );
			
		}
		
	}
	
	function remove_collection_shape ( shape ) {
		
		var index;
		
		index = this.shapes.indexOf( shape );
		
		if ( index !== -1 ) {
			
			this.shapes.splice( index, 1 );
			
			// shape picker buttons
			
			_GridElementLibrary.shapes[ shape ].$buttonsShapePicker.addClass( "disabled hidden" );
			
		}
		
	}
	
	/*===================================================
	
	select
	
	=====================================================*/
	
	function select_plant ( parameters ) {
		
		var plant;
		
		// handle parameters
		
		parameters = parameters || {};
		
		this.plantFromSelection = false;
		
		// if passed plant / parameters to use
		
		if ( parameters.plant ) {
			
			if ( parameters.plant instanceof _GridElement.Instance ) {
				
				plant = parameters.plant;
				
			}
			else {
				
				plant = _GridElementLibrary.build( parameters.plant );
				
			}
			
		}
		// else try to find under pointer
		else {
			
			plant = this.get_planting_object_under_pointer( { modules: false, plants: true } );
			
			// if is a grid model, get grid element
			
			if ( plant instanceof _GridModel.Instance ) {
				
				plant = plant.gridElement;
				
			}
			
			this.plantFromSelection = true;
			
		}
		
		// if is a plant
		
		if ( plant instanceof _GridElement.Instance ) {
			console.log( 'plant select, activate? ', parameters.activate );
			// activate
			
			if ( parameters.activate === true ) {
				
				this.change_plant( plant );
				
			}
			// select
			else {
				
				this.plantSelected.dispatch( plant );
				
			}
			
		}
		
	}
	
	function select_puzzle ( parameters ) {
		
		var toggleSwitch,
			puzzle;
		
		// handle parameters
		
		parameters = parameters || {};
		
		// find puzzle toggle switch under pointer
		
		toggleSwitch = _Game.get_pointer_object( {
			objects: _Puzzle.allToggleSwitches,
			hierarchical: false,
			pointer: main.get_pointer( parameters.event )
		} );
		
		// if toggle switch found
		
		if ( toggleSwitch instanceof _ToggleSwitch.Instance ) {
			
			puzzle = toggleSwitch.target;
			
			// activate
			
			if ( parameters.activate === true ) {
				
				this.change_puzzle( puzzle );
				
			}
			// select
			else {
				
				this.puzzleSelected.dispatch( puzzle );
				
			}
			
		}
		
	}
	
	/*===================================================
	
	activate
	
	=====================================================*/
	
	function activate_plant ( parameters ) {
		console.log( 'planting activate_plant', parameters );
		// handle parameters
		
		parameters = parameters || {};
		parameters.activate = true;
		
		this.select_plant( parameters );
		
	}
	
	function activate_puzzle ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		parameters.activate = true;
		
		this.select_puzzle( parameters );
		
	}
	
	/*===================================================
	
	start / step / complete / stop
	
	=====================================================*/
	
	function start () {
		
		// if has not started planting and plant is valid
		
		if ( this.started !== true && this.puzzle instanceof _Puzzle.Instance && this.plant instanceof _GridElement.Instance ) {
			console.log('start PLANTING!');
			
			// set started
			
			this.started = true;
			
			// start updating planting
			
			this.update();
			shared.signals.gameUpdated.add( this.update, this );
			
		}
		
	}
	
	function step () {
		
		var targetObject;
		
		if ( this.started === true ) {
			console.log(' > PLANTING: step!');
			
			// if rotating
			
			if ( this.rotating === true ) {
				
				this.update_rotate_plant();
				
			}
			// else regular update
			else {
				
				// find if any planting objects under pointer
				
				targetObject = this.get_planting_object_under_pointer( { modules: true } );
				
				// change to new module
				
				this.change_module( targetObject );
				
			}
			
		}
		
	}
	
	function update () {
		
		if ( this.started === true ) {
			
			// if has plant and module
			
			if ( this.plant instanceof _GridElement.Instance && this.module instanceof _GridModule.Instance ) {
				
				// show last test between plant and module
				
				this.plant.show_last_modules_tested();
				
			}
		
		}
		
	}
	
	function complete () {
		console.log(' > PLANTING: completing...');
		var targetObject,
			plantSuccessful,
			plantPlanted,
			plantPlantedNodes,
			plantPlantedClone;
		
		// if started
		
		if ( this.started === true ) {
			
			// find if any planting objects under pointer
					
			targetObject = this.get_planting_object_under_pointer( { modules: true } );
			
			// if target is valid
			
			if ( targetObject instanceof _GridModule.Instance ) {
				
				// if target and current module do not match
				
				if ( this.module !== targetObject ) {
					
					// change module
		
					this.change_module( targetObject );
					
				}
				
				// try adding plant
				
				plantSuccessful = this.plant.occupy_module( this.module );
				
				// if successful
				
				if ( plantSuccessful === true && this.plant instanceof _GridElement.Instance ) {
					console.log(' > PLANTING: plant added!', this.plant );
					plantPlanted = this.plant;
					plantPlantedNodes = plantPlanted.get_layout_node_total();
					
					// stop if plant was selected from puzzle or on puzzle complete
					
					if ( this.plantFromSelection === true || ( this.puzzle instanceof _Puzzle.Instance && this.puzzle.isCompleted === true ) ) {
						
						this.stop();
						
					}
					
					// planted signal
					
					this.planted.dispatch( plantPlanted );
					
					// also signal by type
					
					if ( plantPlantedNodes > 1 ) {
						
						this.plantedMulti.dispatch( plantPlanted );
						
					}
					else {
						
						this.plantedSingle.dispatch( plantPlanted );
						
					}
					
					// if still started, clone plant planted and continue planting
					
					if ( this.started === true ) {
						
						plantPlantedClone = plantPlanted.clone();
						
						this.select_plant( { plant: plantPlantedClone } );
						
					}
					
				}
				
			}
			
		}
		
		if ( plantSuccessful !== true ) {
			
			// stop planting
			
			this.stop();
			
		}
		
	}
	
	function stop () {
		console.log('stop PLANTING!');
		
		// stop updating
		
		shared.signals.gameUpdated.remove( this.update, this );
		
		// stop
			
		this.started = false;
		
		// stop rotating
		
		this.stop_rotate_plant();
		
		// clear plant
		
		this.change_plant();
		
		// clear module
		
		this.change_module();
		
	}
	
	/*===================================================
	
	target
	
	=====================================================*/
	
	function get_planting_object_under_pointer ( parameters ) {
		
		var i, l,
			puzzle,
			grid,
			modules,
			plant,
			plantingObjects = [],
			pointer = this.pointer,
			targetObject;
		
		// handle parameters
		
		parameters = parameters || {};
		
		// build array of objects that are involved in planting process
		
		if ( this.puzzle instanceof _Puzzle.Instance ) {
			
			// modules
			
			if ( parameters.modules === true ) {
				
				plantingObjects = plantingObjects.concat( this.puzzle.grid.modules );
				
			}
			
			// plants
			
			if ( parameters.plants === true ) {
				
				plantingObjects = plantingObjects.concat( this.puzzle.occupants );
				
			}
			
			// find if any planting objects under pointer
			
			targetObject = _Game.get_pointer_object( {
				objects: plantingObjects,
				hierarchical: false,
				pointer: pointer
			} );
			
		}
		
		return targetObject;
		
	}
	
	/*===================================================
	
	planting changes
	
	=====================================================*/
	
	function change_puzzle ( puzzle ) {
		
		var puzzleNew,
			puzzleLast;
		
		// if new puzzle
		
		if ( this.puzzle !== puzzle && puzzle instanceof _Puzzle.Instance ) {
			
			puzzleNew = true;
			puzzleLast = this.puzzle;
			
			// change
			
			this.puzzle = puzzle;
			
		}
		// else toggle current off
		else if ( typeof puzzle === 'undefined' || this.puzzle === puzzle || ( this.puzzle instanceof _Puzzle.Instance && this.puzzle.started === false ) ) {
			
			puzzleLast = this.puzzle;
			
			// clear current
			
			this.puzzle = undefined;
			
		}
		
		// handle last puzzle
		
		if ( puzzleLast instanceof _Puzzle.Instance ) {
			
			// remove state change listener
			
			puzzleLast.stateChanged.remove( this.change_puzzle, this );
			
			// toggle off
			
			if ( puzzleLast.started === true ) {
				
				puzzleLast.toggleSwitch.toggle();
			
			}
			
			// signal
			
			this.puzzleStopped.dispatch( puzzleLast );
			
			// if started, stop
			
			if ( this.started === true ) {
				
				this.stop();
				
			}
			
		}
		
		// handle new puzzle
		
		if ( puzzleNew === true ) {
			
			// toggle on
			
			if ( this.puzzle.started !== true ) {
				
				this.puzzle.toggleSwitch.toggle();
				
			}
			
			// listen for state change
			
			this.puzzle.stateChanged.add( this.change_puzzle, this );
			
			// signal
			
			this.puzzleStarted.dispatch( this.puzzle );
			
		}
		
	}
	
	function change_module ( module ) {
		
		var grid,
			puzzle;
		
		// if is new module
		
		if ( this.module !== module ) {
			console.log(' > PLANTING: change MODULE: ', module);
			
			// store new module
			
			this.module = module;
			
		}
		
		// test module
		
		if ( this.plant instanceof _GridElement.Instance ) {
			
			this.plant.test_occupy_module_smart( module );
			
		}
		
	}
	
	function change_plant ( plantNew ) {
		
		var i, l,
			index,
			plantModel;
		
		// if new plant is different from one stored in planting
		
		if ( this.plant !== plantNew ) {
			
			// remove last plant
			
			if ( this.plant instanceof _GridElement.Instance ) {
				console.log(' > PLANTING: plant changing, current planted?', this.plant.hasModule );
				// clear last test
				
				this.plant.test_occupy_module();
				
				// find if in all plants list
				
				index = this.plants.indexOf( this.plant );
				
				// if planted
				
				if ( this.plant.hasModule === true ) {
					
					// plants list
					
					if ( index === -1 ) {
						
						this.plants.push( this.plant );
						
					}
					
				}
				else {
					
					// clear plant module
					
					this.plant.change_module();
					
					// all plants list
					
					if ( index !== -1 ) {
						
						this.plants.splice( index, 1 );
						
					}
					
				}
				
				// TODO: hide ui
				
				// cursor
				
				shared.domElements.$game.css( 'cursor', 'auto' );
				
				// signal
				
				this.plantStopped.dispatch( this.plant );
				
			}
			
			// store new plant
			
			this.plant = plantNew;
			console.log(' > PLANTING: plant to', this.plant);
			
			// if new plant
			
			if ( this.plant instanceof _GridElement.Instance ) {
				
				// if currently planted
				
				if ( this.plant.hasModule === true ) { 
					
					// clear plant module
						
					this.plant.change_module();
					
				}
				
				// TODO: show ui
				
				// cursor
				
				shared.domElements.$game.css( 'cursor', 'pointer' );
				
				// signal
				
				this.plantStarted.dispatch( this.plant );
				
				// start planting
			
				this.start();
				
			}
			
		}
		
	}
	
	/*===================================================
	
	plant rotation
	
	=====================================================*/
	
	function start_rotate_plant () {
		
		var position = utilVec31Rotate,
			projector = utilProjector1Rotate,
			r;
		
		if ( this.rotating !== true && this.module instanceof _GridModule.Instance ) {
			console.log(' > PLANTING: rotation START ');
			// rotate start
				
			this.rotating = true;
			
			// init rotation info
			
			r = this.rotation = {};
			
			position.copy( this.module.matrixWorld.getPosition() );
			position = projector.projectVector( position, _Game.camera );
			
			r.x0 = ( ( position.x + 1 ) * shared.screenWidth ) * 0.5;
			r.y0 = ( ( -position.y + 1 ) * shared.screenHeight ) * 0.5;
			
			r.angleTotal = 0;
			r.x1 = r.x2 = r.y1 = r.y2 = undefined;
			r.rotated = false;
			
		}
		
	}
	
	function update_rotate_plant () {
		
		var plant = this.plant,
			r = this.rotation,
			pointer = this.pointer,
			mx = pointer.x,
			my = pointer.y,
			mDist = Math.sqrt( Math.pow( pointer.x - r.x0, 2 ) + Math.pow( pointer.y - r.y0, 2 ) ),
			ax, ay, bx, by,
			angleA, angleB, radians;
		
		// keep track of last 2 locations
		
		r.x2 = r.x1;
		r.x1 = pointer.x;
		
		r.y2 = r.y1;
		r.y1 = pointer.y;
		
		// if has 3 numbers to work with, and pointer is at least minimum distance from rotation point
		
		if ( main.is_number( r.x2 ) && mDist >= this.rotationDistanceMin ) {
			
			// handle direction
			
			ax = r.x0 - r.x1;
			ay = r.y0 - r.y1;
			bx = r.x0 - r.x2;
			by = r.y0 - r.y2;
			
			angleA = Math.atan2( ay, ax );
			angleB = Math.atan2( by, bx );
			
			radians = _MathHelper.shortest_rotation_between_angles( angleB, angleA );
			
			// totals
			
			r.angleTotal += radians;
			
			// if rotation above threshold
			
			if ( r.rotated === true || Math.abs( r.angleTotal ) >= this.rotationStartThreshold ) {
				
				// rotate plant
				
				plant.rotate( radians, this.module, true, false );
				
				// rotate seed
				
				if ( r.rotated !== true ) {
					
					//this.plant.$seed
					
				}
				
				// set rotated
				
				r.rotated = true;
				
			}
			
		}
		
	}
	
	function stop_rotate_plant () {
		console.log(' > PLANTING: rotation STOP ');
		if ( this.plant instanceof _GridElement.Instance ) {
			
			//this.plant.$seed
			
			this.plant.rotate_reset();
		
		}
		
		this.rotating = false;
		
	}
	
} (KAIOPUA) );