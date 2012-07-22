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
			"assets/modules/utils/MathHelper.js",
			"assets/modules/utils/ObjectHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( g, pzl, ts, gr, gm, gmodel, ge, mh, oh ) {
		console.log('internal planting', _Planting);
		
		_Game = g;
		_Puzzle = pzl;
		_ToggleSwitch = ts;
		_Grid = gr;
		_GridModule = gm;
		_GridModel = gmodel;
		_GridElement = ge;
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
		
		_Planting.Instance.prototype.select_plant = select_plant;
		_Planting.Instance.prototype.select_field = select_field;
		
		_Planting.Instance.prototype.step = step;
		_Planting.Instance.prototype.step_rotate = step_rotate;
		_Planting.Instance.prototype.step_placement = step_placement;
		
		_Planting.Instance.prototype.setup = setup;
		_Planting.Instance.prototype.start = start;
		_Planting.Instance.prototype.on_pointer_moved = on_pointer_moved;
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
		
		// signals
		
		this.puzzleStarted = new signals.Signal();
		this.puzzleStopped = new signals.Signal();
		
		this.planted = new signals.Signal();
		this.plantedSingle = new signals.Signal();
		this.plantedMulti = new signals.Signal();
		this.plantSelected = new signals.Signal();
		
		// reset
		
		this.reset();
		
	}
	
	/*===================================================
	
	reset
	
	=====================================================*/
	
	function reset () {
		
		// plants list
		
		this.plants = [];
		
		// stop planting
		
		this.stop();
		
	}
	
	/*===================================================
	
	select
	
	=====================================================*/
	
	function select_plant ( parameters ) {
		
		this.step( parameters );
		
	}
	
	function select_field ( parameters ) {
		
		var toggleSwitch;
		
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
			
			// change puzzle
			
			this.change_puzzle( toggleSwitch.target );
			
		}
		
	}
	
	/*===================================================
	
	step
	
	=====================================================*/
	
	function step ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		// if has active puzzle
		
		if ( this.puzzle instanceof _Puzzle.Instance ) {
			console.log(' > PLANTING: STEP');
			// store pointer
					
			this.pointer = main.get_pointer( parameters.event );
			
			// if step rotate
			
			if ( parameters.rotate === true ) {
				
				this.step_rotate( parameters );
				
			}
			// else step placement
			else {
				
				this.step_placement( parameters );
				
			}
		
		}
		
	}
	
	function step_rotate ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		console.log(' > PLANTING: rotation step');
		if ( parameters.stop === true ) {
			
			// stop
			
			this.stop_rotate_plant();
			
		}
		else if ( this.started === true ) {
			
			// start
			
			this.start_rotate_plant();
			
		}
		
	}
	
	function step_placement ( parameters ) {
		
		var wasRotated;
		
		// handle parameters
		
		parameters = parameters || {};
		
		console.log(' > PLANTING: placement step, parameters', parameters, ' + is stop? ', parameters.stop );
		if ( parameters.stop === true ) {
			
			this.stop();
			
		}
		else {
			
			// if is rotating
			
			if ( this.rotating === true ) {
				
				// record if rotated
				
				wasRotated = this.rotation.rotated;
				
				// stop rotating
				
				this.step_rotate( { stop: true } );
				
			}
			
			// if was not just rotated
			
			if ( wasRotated !== true ) {
				
				// steps
				
				// if has plant
				
				if ( this.plant instanceof _GridElement.Instance ) {
					
					console.log(' > PLANTING: step has plant: ', this.plant);
					
					this.complete();
					
				}
				// if needs plant
				else {
					
					console.log(' > PLANTING: step no plant yet!');
					
					this.setup( parameters );
					
				}
				
			}
			
		}
		
	}
	
	/*===================================================
	
	setup / start / continue / complete / stop
	
	=====================================================*/
	
	function setup ( parameters ) {
		
		var targetObject;
		
		// properties
		
		this.plantFromSelection = false;
		
		// if passed plant to use
		
		if ( parameters && parameters.plant ) {
			
			if ( parameters.plant instanceof _GridElement.Instance ) {
				
				targetObject = parameters.plant;
				
			}
			else {
				
				targetObject = new _GridElement.Instance( parameters.plant );
				
			}
		
		}
		// else if any plants under pointer
		else {
			
			targetObject = this.get_planting_object_under_pointer( { modules: false, plants: true } );
			
			// if is a grid model
			
			if ( targetObject instanceof _GridModel.Instance ) {
				
				targetObject = targetObject.gridElement;
				
			}
			
			this.plantFromSelection = true;
			
		}
		
		// if is a plant
		
		if ( targetObject instanceof _GridElement.Instance ) {
			
			// use plant
			
			this.change_plant( targetObject );
			
			// selected
			
			if ( this.plantFromSelection === true ) {
				
				this.plantSelected.dispatch( targetObject );
				
			}
			
		}
		
	}
	
	function start () {
		
		// if has not started planting and plant is valid
		
		if ( this.started !== true && this.plant instanceof _GridElement.Instance ) {
			console.log('start PLANTING!');
			
			// set started
			
			this.started = true;
			
			// TODO: dim ui to focus on planting
					
			
			
			// start updating planting
			
			this.update();
			
			// signals
			
			shared.signals.gameUpdated.add( this.update, this );
			shared.signals.gamePointerDragged.add( this.on_pointer_moved, this );
			
		}
		
	}
	
	function on_pointer_moved () {
		console.log(' > PLANTING: pointer move!');
		var targetObject;
		
		// if has plant, update seed position
		
		if ( this.plant instanceof _GridElement.Instance ) {
			
			//this.plant.$seed
			
		}
		
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
	
	function update () {
		
		// if has plant and module
		
		if ( this.plant instanceof _GridElement.Instance && this.module instanceof _GridModule.Instance ) {
			
			// show last test between plant and module
			
			this.plant.show_last_modules_tested();
			
		}
		
	}
	
	function complete () {
		console.log(' > PLANTING: completing...');
		var targetObject,
			plantSuccessful = false,
			plantPlanted,
			plantPlantedNodes,
			plantPlantedClone;
		
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
			
			if ( plantSuccessful && this.plant instanceof _GridElement.Instance ) {
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
					
					this.setup( { plant: plantPlantedClone } );
					
				}
				
			}
			
		}
		else {
			
			// stop planting
			
			this.stop();
			
		}
		
	}
	
	function stop () {
		console.log('stop PLANTING!');
		
		// stop updating
		
		shared.signals.gameUpdated.remove( this.update, this );
		shared.signals.gamePointerDragged.remove( on_pointer_moved, this );
		
		// stop
			
		this.started = false;
		
		// stop rotating
		
		this.step_rotate( { stop: true } );
		
		// clear plant
		
		this.change_plant();
		
		// clear module / puzzle
		
		this.change_module();
		
		// TODO: return ui to normal state
		
		
		
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
				
				// hide seed
				
				//this.plant.$seed
				
				// cursor
				
				shared.domElements.$game.css( 'cursor', 'auto' );
				
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
				
				// show seed
				
				//this.plant.$seed
				
				// cursor
				
				shared.domElements.$game.css( 'cursor', 'pointer' );
				
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