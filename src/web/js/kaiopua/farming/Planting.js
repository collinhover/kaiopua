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
		assetPath = "js/kaiopua/farming/Planting.js",
		_Planting = {},
		_Grid,
		_Puzzle,
		_ToggleSwitch,
		_GridModule,
		_GridModel,
		_GridElement,
		_GridElementLibrary,
		_PuzzleLibrary,
		_UIQueue,
		_MathHelper,
		_ObjectHelper,
		_RayHelper,
		utilVec31Rotate,
		utilProjector1Rotate;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Planting,
		requirements: [
			"js/kaiopua/puzzles/Puzzle.js",
			"js/kaiopua/puzzles/ToggleSwitch.js",
			"js/kaiopua/puzzles/Grid.js",
			"js/kaiopua/puzzles/GridModule.js",
			"js/kaiopua/puzzles/GridModel.js",
			"js/kaiopua/puzzles/GridElement.js",
			"js/kaiopua/puzzles/GridElementLibrary.js",
			"js/kaiopua/puzzles/PuzzleLibrary.js",
			"js/kaiopua/ui/UIQueue.js",
			"js/kaiopua/utils/MathHelper.js",
			"js/kaiopua/utils/ObjectHelper.js",
			"js/kaiopua/utils/RayHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( pzl, ts, gr, gm, gmodel, ge, geLib, pLib, uiq, mh, oh, rh ) {
		console.log('internal planting', _Planting);
		
		_Puzzle = pzl;
		_ToggleSwitch = ts;
		_Grid = gr;
		_GridModule = gm;
		_GridModel = gmodel;
		_GridElement = ge;
		_GridElementLibrary = geLib;
		_PuzzleLibrary = pLib;
		_UIQueue = uiq;
		_MathHelper = mh;
		_ObjectHelper = oh;
		_RayHelper = rh;
		
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
		
		_Planting.Instance.prototype.add_to_collection = add_to_collection;
		_Planting.Instance.prototype.remove_from_collection = remove_from_collection;
		_Planting.Instance.prototype.toggle_puzzle_shape = toggle_puzzle_shape;
		
		_Planting.Instance.prototype.select_plant = select_plant;
		_Planting.Instance.prototype.select_puzzle = select_puzzle;
		_Planting.Instance.prototype.activate_plant = activate_plant;
		_Planting.Instance.prototype.activate_puzzle = activate_puzzle;
		_Planting.Instance.prototype.delete_plant = delete_plant;
		
		_Planting.Instance.prototype.start = start;
		_Planting.Instance.prototype.step = step;
		_Planting.Instance.prototype.update = update;
		_Planting.Instance.prototype.complete = complete;
		_Planting.Instance.prototype.stop = stop;
				
		_Planting.Instance.prototype.change_puzzle = change_puzzle;
		_Planting.Instance.prototype.change_module = change_module;
		_Planting.Instance.prototype.change_plant = change_plant;
		
		_Planting.Instance.prototype.start_rotate_plant = start_rotate_plant;
		_Planting.Instance.prototype.update_rotate_plant = update_rotate_plant;
		_Planting.Instance.prototype.stop_rotate_plant = stop_rotate_plant;
		
		_Planting.Instance.prototype.start_ui = start_ui;
		_Planting.Instance.prototype.update_ui = update_ui;
		_Planting.Instance.prototype.stop_ui = stop_ui;
		_Planting.Instance.prototype.clear_ui = clear_ui;
		_Planting.Instance.prototype.show_ui = show_ui;
		
		_Planting.Instance.prototype.select_ui_puzzle = select_ui_puzzle;
		_Planting.Instance.prototype.setup_ui_puzzle = setup_ui_puzzle;
		_Planting.Instance.prototype.update_ui_puzzle = update_ui_puzzle;
		_Planting.Instance.prototype.start_ui_puzzle = start_ui_puzzle;
		_Planting.Instance.prototype.stop_ui_puzzle = stop_ui_puzzle;
		_Planting.Instance.prototype.complete_ui_puzzle = complete_ui_puzzle;
		
		_Planting.Instance.prototype.select_ui_plant = select_ui_plant;
		_Planting.Instance.prototype.start_ui_plant = start_ui_plant;
		_Planting.Instance.prototype.step_ui_plant = step_ui_plant;
		_Planting.Instance.prototype.stop_ui_plant = stop_ui_plant;
		
	}
	
	/*===================================================
    
    planting
    
    =====================================================*/
	
	function Planting ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		// properties
		
		this.rotationSpeed = parameters.rotationSpeed || _Planting.rotationSpeed;
		this.rotationDistanceMin = parameters.rotationDistanceMin || _Planting.rotationDistanceMin;
		this.rotationStartThreshold = parameters.rotationStartThreshold || _Planting.rotationStartThreshold;
		this.rotationDirChangeThreshold = parameters.rotationDirChangeThreshold || _Planting.rotationDirChangeThreshold;
		this.plants = [];
		this.collection = {};
		this.collection.puzzles = [];
		this.collection.skins = [];
		this.collection.shapes = [];
		this.affectUI = parameters.affectUI || false;
		this.puzzleChanging = false;
		
		// signals
		
		this.onPuzzleStarted = new signals.Signal();
		this.onPuzzleSelected = new signals.Signal();
		this.onPuzzleStopped = new signals.Signal();
		
		this.onPlantSelected = new signals.Signal();
		this.onPlantStarted = new signals.Signal();
		this.onPlantStopped = new signals.Signal();
		
		this.onPlanted = new signals.Signal();
		this.onPlantedSingle = new signals.Signal();
		this.onPlantedMulti = new signals.Signal();
		
		// reset
		
		this.reset();
		
		// stop on pause
		
		shared.signals.onGamePaused.add( this.stop, this );
		
	}
	
	/*===================================================
	
	reset
	
	=====================================================*/
	
	function reset () {
		
		var i, l;
		
		// clear collection
		// skins
		
		for ( i = 0, l = this.collection.skins.length; i < l; i++ ) {
			
			this.remove_collection_skin( this.collection.skins[ i ] );
			
		}
		
		// shapes
		
		for ( i = 0, l = this.collection.shapes.length; i < l; i++ ) {
			
			this.remove_collection_shape( this.collection.shapes[ i ] );
			
		}
		
		// create collection
		
		this.add_to_collection( 'tutorial', 'puzzle' );
		
		this.add_to_collection( 'taro', 'skin' );
		this.add_to_collection( 'rock', 'skin' );
		
		this.add_to_collection( 'monomino', 'shape' );
		this.add_to_collection( 'domino', 'shape' );
		
		// stop planting
		
		this.stop();
		
	}
	
	/*===================================================
	
	collection
	
	=====================================================*/
	
	function add_to_collection ( item, type ) {
		
		var added = false;
		
		// skins
		
		if ( type === 'skin' || typeof type === 'undefined' ) {
			
			added = add_collection_item( item, this.collection.skins, _GridElementLibrary.skins );
			
			if ( added === true ) {
				
				//_GridElementLibrary.skins[ item ].$buttonsSkinPicker.removeClass( "disabled hidden" );
			
			}
			
		}
		
		// shapes
		
		if ( added !== true && ( type === 'shape' || typeof type === 'undefined' ) ) {
			
			added = add_collection_item( item, this.collection.shapes, _GridElementLibrary.shapes );
			
			if ( added === true ) {
				
				_GridElementLibrary.shapes[ item ].$buttonsShapePicker.removeClass( "disabled hidden" );
				
			}
			
		}
		
		// puzzles
		
		if ( added !== true && ( type === 'puzzle' || typeof type === 'undefined' ) ) {
			
			added = add_collection_item( item, this.collection.puzzles, _PuzzleLibrary.puzzles );
			
			if ( added === true ) {
				
				// TODO: enable / show puzzle tiki statue?
				
			}
			
		}
		console.log( 'added item ', item, ', which is a ', type, ' ? ', added, ' + collection ', this.collection );
		return added;
		
	}
	
	function remove_from_collection ( item, type ) {
		
		var removed = false;
		
		// skins
		
		if ( type === 'skin' || typeof type === 'undefined' ) {
			
			removed = remove_collection_item( item, this.collection.skins );
			
			if ( removed === true ) {
				
				//_GridElementLibrary.skins[ item ].$buttonsSkinPicker.addClass( "disabled hidden" );
			
			}
			
		}
		
		// shapes
		
		if ( removed !== true && ( type === 'shape' || typeof type === 'undefined' ) ) {
			
			removed = remove_collection_item( item, this.collection.shapes );
			
			if ( removed === true ) {
				
				_GridElementLibrary.shapes[ item ].$buttonsShapePicker.addClass( "disabled hidden" );
				
			}
			
		}
		
		// puzzles
		
		if ( removed !== true && ( type === 'puzzle' || typeof type === 'undefined' ) ) {
			
			removed = remove_collection_item( item, this.collection.puzzles );
			
		}
		console.log( 'removed item ', item, ' ? ', removed );
		
		return removed;
		
	}
	
	function add_collection_item ( item, collectionList, libraryList ) {
		
		if ( libraryList.hasOwnProperty( item ) && main.index_of_value( collectionList, item ) === -1 ) {
			
			collectionList.push( item );
			
			return true;
			
		}
		
		return false;
		
	}
	
	function remove_collection_item ( item, collectionList ) {
		
		var index;
		
		index = main.index_of_value( collectionList, item );
		
		if ( index !== -1 ) {
			
			collectionList.splice( index, 1 );
			
			return true;
			
		}
		
		return false;
		
	}
	
	/*===================================================
	
	toggle shapes
	
	=====================================================*/
	
	function toggle_puzzle_shape ( parameters ) {
		
		var shape,
			shapeData,
			$shapePicker,
			shapesChanged;
		
		// if valid puzzle
		
		if ( this.puzzle instanceof _Puzzle.Instance ) {
			
			// handle parameters
			
			parameters = parameters || {};
			
			if ( main.is_event( parameters ) ) {
				
				$shapePicker = $( parameters.target );
				shape = $shapePicker.data( 'shape' );
				shapeData = _GridElementLibrary.shapes[ shape ]
				
			}
			else {
				
				shape = parameters.shape;
				shapeData = _GridElementLibrary.shapes[ shape ];
				
				if ( shapeData ) {
					
					$shapePicker = shapeData.$buttonsShapePicker;
					
				}
				
			}
			
			// valid shape
			
			if ( main.index_of_value( this.collection.shapes, shape ) !== -1 && $shapePicker ) {
				
				// add / remove shapes based on whether picked
				
				if ( shapeData.picked ) {
					
					shapesChanged = this.puzzle.remove_shape( shape );
					console.log( 'removing shape', shape, ' shapesChanged? ', shapesChanged );
				}
				else {
					
					shapesChanged = this.puzzle.add_shape( shape );
					console.log( 'adding shape', shape, ' shapesChanged? ', shapesChanged );
				}
				
				// if shapes changed
				
				if ( shapesChanged === true ) {
					
					toggle_shape_picked( shape );
					
				}
				
			}
			
		}
		
	}
	
	function toggle_shape_picked ( shape ) {
		
		var shape,
			shapeData,
			$shapePicker,
			$shapeActivator,
			$button,
			shapesChanged,
			picked;
		
		shapeData = _GridElementLibrary.shapes[ shape ];
		
		if ( shapeData ) {
			
			// get picker
			
			$shapePicker = shapeData.$buttonsShapePicker;
			
			// toggle picker button
			
			$button = $shapePicker.find( 'button' ).andSelf().filter( 'button' );
			$button.toggleClass( 'active' );
			
			shapeData.picked = $button.is( '.active' );
			
			// toggle shape activator if button was active
			
			$shapeActivator = shapeData.$buttonsPuzzleActive;
			
			if ( shapeData.picked === true ) {
				
				$shapeActivator.removeClass( 'disabled hidden' );
				
			}
			else {
				
				$shapeActivator.addClass( 'disabled hidden' );
				
			}
			
		}
		
	}
	
	/*===================================================
	
	select
	
	=====================================================*/
	
	function select_plant ( parameters ) {
		
		var plant;
		
		if ( this.puzzle instanceof _Puzzle.Instance && this.puzzle.started === true ) {
			
			// handle parameters
			
			parameters = parameters || {};
			
			// set pointer
			
			this.pointer = main.get_pointer( parameters.event );
			
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
				
				plant = _RayHelper.raycast( {
					pointer: this.pointer,
					camera: shared.camera,
					objects: this.puzzle.occupants,//shared.scene.dynamics,
					octrees: shared.scene.octree,
					objectOnly: true
				} );
				
				// if is a grid model, get grid element
				
				if ( plant instanceof _GridModel.Instance ) {
					
					plant = plant.gridElement;
					
				}
				
			}
			
			// if is a plant
			
			if ( plant instanceof _GridElement.Instance ) {
				
				// store
				
				this.plantSelect = plant;
				
				// activate
				
				if ( parameters.activate === true ) {
					
					this.change_plant( plant );
					
				}
				// select
				else {
					
					this.onPlantSelected.dispatch( plant );
					
				}
				
				// ui
				
				if ( this.affectUI === true ) {
				
					this.select_ui_plant( plant, !parameters.activate );
					
				}
				
			}
			
		}
		
	}
	
	function select_puzzle ( parameters ) {
		
		var toggleSwitch,
			puzzle;
		
		// handle parameters
		
		parameters = parameters || {};
		
		// find puzzle toggle switch under pointer
		
		toggleSwitch = _RayHelper.raycast( {
			pointer: main.get_pointer( parameters.event ),
			camera: shared.camera,
			objects: _Puzzle.allToggleSwitches,//shared.scene.dynamics,
			octrees: shared.scene.octree,
			objectOnly: true
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
				
				this.onPuzzleSelected.dispatch( puzzle );
				
				if ( this.affectUI === true ) {
					
					this.select_ui_puzzle();
					
				}
				
			}
			
		}
		
	}
	
	/*===================================================
	
	activate
	
	=====================================================*/
	
	function activate_plant ( parameters ) {
		
		// if parameters is event
		
		if ( main.is_event( parameters ) ) {
			
			parameters = { 
				event: parameters,
				plant: {
					shape: $( parameters.target || parameters.srcElement ).data( 'shape' )
				}
			};
			
		}
		
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
	
	function delete_plant ( parameters ) {
		
		var plant;
		
		if ( this.puzzle instanceof _Puzzle.Instance && this.puzzle.started === true ) {
			
			// handle parameters
			
			parameters = parameters || {};
			
			// set pointer
			
			this.pointer = main.get_pointer( parameters.event );
			
			// if passed plant / parameters to use
			
			if ( parameters.plant instanceof _GridElement.Instance ) {
				
				plant = parameters.plant;
				
			}
			// else try to find under pointer
			else {
				
				plant = _RayHelper.raycast( {
					pointer: this.pointer,
					camera: shared.camera,
					objects: shared.scene.dynamics,
					octrees: shared.scene.octree,
					objectOnly: true
				} );
				
				// if is a grid model, get grid element
				
				if ( plant instanceof _GridModel.Instance ) {
					
					plant = plant.gridElement;
					
				}
				
			}
			
			// if plant found
			
			if ( plant instanceof _GridElement.Instance && plant.puzzle === this.puzzle ) {
				console.log( 'PLANTING: deleting plant', plant );
				
				// clear select timeout
				
				if ( typeof this.selectPlantTimeout !== 'undefined' ) {
					
					window.clearRequestTimeout( this.selectPlantTimeout );
					this.selectPlantTimeout = undefined;
					
				}
				
				plant.change_module();
				
			}
			
		}
		
	}
	
	/*===================================================
	
	start / step / complete / stop
	
	=====================================================*/
	
	function start () {
		
		// if has not started planting and plant is valid
		
		if ( this.started !== true && this.puzzle instanceof _Puzzle.Instance && this.puzzle.started === true && this.plant instanceof _GridElement.Instance ) {
			console.log('start PLANTING!');
			
			// set started
			
			this.started = true;
			
			// start updating planting
			
			this.update();
			shared.signals.onGameUpdated.add( this.update, this );
			
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
				
				// if affects ui
				
				if ( this.affectUI === true ) {
					
					this.step_ui_plant();
					
				}
				
				// find if any module under pointer
				
				targetObject = _RayHelper.raycast( {
					pointer: this.pointer,
					camera: shared.camera,
					objects: this.puzzle.grid.modules,
					objectOnly: true
				} );
				
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
			plantPlantedNodes;
		
		// if started
		
		if ( this.started === true ) {
			
			// find if any planting objects under pointer
					
			targetObject = _RayHelper.raycast( {
				pointer: this.pointer,
				camera: shared.camera,
				objects: this.puzzle.grid.modules,
				objectOnly: true
			} );
			
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
				
				if ( plantSuccessful === true ) {
					plantPlantedNodes = this.plant.get_layout_node_total();
					console.log(' > PLANTING: plant added!', this.plant, ' with nodes: ', plantPlantedNodes);
					
					// if affects ui
					
					if ( this.affectUI === true ) {
						
						this.update_ui();
						
					}
					
					// planted signal
					
					this.onPlanted.dispatch( this.plant );
					
					// also signal by type
					
					if ( plantPlantedNodes > 1 ) {
						
						this.onPlantedMulti.dispatch( this.plant );
						
					}
					else {
						
						this.onPlantedSingle.dispatch( this.plant );
						
					}
					
				}
				
			}
			
		}
		
		// stop planting
		
		this.stop();
		
	}
	
	function stop () {
		console.log('stop PLANTING!');
		
		// stop updating
		
		shared.signals.onGameUpdated.remove( this.update, this );
		
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
	
	changes
	
	=====================================================*/
	
	function change_puzzle ( puzzle ) {
		
		var puzzleNew;
		
		// queue puzzle for change
		// if queued puzzle would be same as current, treat as toggle off
		
		this.puzzleQueued = ( this.puzzle instanceof _Puzzle.Instance && this.puzzle === puzzle ) || ( puzzle instanceof _Puzzle.Instance && main.index_of_value( this.collection.puzzles, puzzle.libraryNames.puzzle ) === -1 ) ? undefined : puzzle;
		this.puzzleWaiting = this.puzzleQueued instanceof _Puzzle.Instance;
		
		// if not currently changing puzzles
		
		if ( this.puzzleChanging === false ) {
			console.log( 'PLANTING: change puzzle from ', this.puzzle, ' to ', this.puzzleQueued );
			// stop last
			
			if ( this.puzzle instanceof _Puzzle.Instance && this.puzzle.started === true ) {
				
				this.puzzleChanging = true;
				this.puzzleLast = this.puzzle;
				this.puzzle = undefined;
				
				// stop planting
				
				if ( this.affectUI === true ) {
					
					this.stop_ui();
					
				}
				
				if ( this.started === true ) {
					
					this.stop();
					
				}
				
				// toggle off
				
				this.puzzleLast.onStateChanged.remove( change_puzzle_to_new, this );
				this.puzzleLast.onStateChanged.addOnce( change_puzzle_from_last, this );
				
				this.puzzleLast.toggleSwitch.toggle();
				
			}
			// start new
			else if ( this.puzzleQueued instanceof _Puzzle.Instance ) {
				
				this.puzzleChanging = true;
				this.puzzleWaiting = false;
				this.puzzle = this.puzzleQueued;
				this.puzzleQueued = undefined;
				
				// toggle on
				
				this.puzzle.onStateChanged.remove( change_puzzle_from_last, this );
				this.puzzle.onStateChanged.addOnce( change_puzzle_to_new, this );
				
				this.puzzle.toggleSwitch.toggle();
				
			}
			
		}
		
	}
	
	function change_puzzle_from_last () {
		
		this.puzzleChanging = false;
		
		if ( this.affectUI === true ) {
			
			this.clear_ui();
			
		}
		
		this.onPuzzleStopped.dispatch( this.puzzleLast );
		
		// step puzzle queue
		
		if ( this.puzzleWaiting === true ) {
			
			this.change_puzzle( this.puzzleQueued );
			
		}
		
	}
	
	function change_puzzle_to_new () {
		
		this.puzzleChanging = false;
		
		// step puzzle queue
		
		if ( this.puzzleWaiting === true ) {
			
			this.change_puzzle( this.puzzleQueued );
			
		}
		// start new puzzle
		else {
			
			if ( this.affectUI === true ) {
				
				this.start_ui();
				
			}
			
			this.onPuzzleStarted.dispatch( this.puzzle );
			
		}
		
	}
	
	function change_module ( module ) {
		
		var grid,
			puzzle;
		
		// if is new module
		
		if ( typeof module === 'undefined' || ( module instanceof _GridModule.Instance && this.module !== module ) ) {
			console.log(' > PLANTING: change MODULE: ', module);
			
			// store new module
			
			this.module = module;
			
			// test module
			
			if ( this.plant instanceof _GridElement.Instance ) {
				
				this.plant.test_occupy_module_smart( module );
				
			}
			
		}
		
	}
	
	function change_plant ( plantNew ) {
		
		var i, l,
			index,
			plantModel;
		
		// if new plant is different from one stored in planting
		
		if ( this.plant !== plantNew ) {
			console.log(' > PLANTING: plant changing to ', plantNew );
			// remove last plant
			
			if ( this.plant instanceof _GridElement.Instance ) {
				
				// clear last test
				
				this.plant.test_occupy_module();
				
				// find if in all plants list
				
				index = main.index_of_value( this.plants, this.plant );
				
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
				
				// if affects ui
				
				if ( this.affectUI === true ) {
					
					// plant ui
					
					this.stop_ui_plant();
					
					// cursor
					
					shared.domElements.$game.css( 'cursor', 'auto' );
					
				}
				
				// signal
				
				this.onPlantStopped.dispatch( this.plant );
				
				// remove plant
				
				this.plant = undefined;
				
			}
			
			// handle new plant
			
			if ( plantNew instanceof _GridElement.Instance && main.index_of_value( this.collection.skins, plantNew.skin ) !== -1 && main.index_of_value( this.collection.shapes, plantNew.shape ) !== -1 ) {
				console.log(' > PLANTING: plant to', this.plant);
				this.plant = plantNew;
				
				// if currently planted
				
				if ( this.plant.hasModule === true ) { 
					
					// clear plant module
						
					this.plant.change_module();
					
				}
				
				// if affects ui
				
				if ( this.affectUI === true ) {
					
					// plant ui
					
					this.start_ui_plant();
					
					// cursor
					
					shared.domElements.$game.css( 'cursor', 'pointer' );
					
				}
				
				// signal
				
				this.onPlantStarted.dispatch( this.plant );
				
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
			position = projector.projectVector( position, shared.camera );
			
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
			px = this.pointer.x,
			py = this.pointer.y,
			mDist = Math.sqrt( Math.pow( px - r.x0, 2 ) + Math.pow( py - r.y0, 2 ) ),
			ax, ay, bx, by,
			angleA, angleB, radians;
		
		// keep track of last 2 locations
		
		r.x2 = r.x1;
		r.x1 = px;
		
		r.y2 = r.y1;
		r.y1 = py;
		
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
	
	/*===================================================
    
    ui
    
    =====================================================*/
	
	function start_ui () {
		
		var i, l,
			shape,
			shapeData,
			index;
		
		if ( this.puzzle instanceof _Puzzle.Instance ) {
			
			// started
			
			if ( this.puzzle.started === true ) {
				console.log( 'PLANTING: UI started' );
				
				// modify ui to reflect new puzzle
				
				// hide puzzle warning
				main.dom_collapse( {
					element: shared.domElements.$puzzleActiveWarning,
					time: 0
				} );
				
				// show puzzle
				main.dom_collapse( {
					element: shared.domElements.$puzzleActive,
					show: true,
					time: 0
				} );
				
				// deselect plant
				
				this.select_ui_plant();
				
				// shapes
				
				this.puzzle.onShapeAdded.add( this.update_ui, this );
				this.puzzle.onShapeRemoved.add( this.update_ui, this );
				
				for ( i = 0, l = this.collection.shapes.length; i < l; i++ ) {
					
					shape = this.collection.shapes[ i ];
					shapeData = _GridElementLibrary.shapes[ shape ];
					
					// add tap listeners
					
					_GridElementLibrary.shapes[ shape ].$buttonsShapePicker.removeClass( 'disabled' ).on( 'tap.shapeToggle', $.proxy( this.toggle_puzzle_shape, this ) );
					
					// toggle based on puzzle
					
					index = main.index_of_value( this.puzzle.shapes, shape );
					
					// puzzle has shape
					
					if ( index !== -1 ) {
						
						// ensure is picked
						
						if ( shapeData.picked !== true ) {
							
							toggle_shape_picked( shape );
							
						}
						
					}
					// ensure not picked
					else if ( shapeData.picked !== false ) {
						
						toggle_shape_picked( shape );
						
					}
					
				}
				
				this.puzzle.onShapesNeeded.add( this.setup_ui_puzzle, this );
				this.puzzle.onCompleted.add( this.complete_ui_puzzle, this );
				
				// start ui
				
				if ( this.puzzle.ready === true ) {
					
					this.update_ui_puzzle();
					this.start_ui_puzzle();
					
				}
				else {
					
					this.setup_ui_puzzle();
					
				}
				
				this.update_ui();
				
			}
		
		}
		
	}
	
	function update_ui () {
		
		if ( this.puzzle instanceof _Puzzle.Instance ) {
			
			// overview
			
			shared.domElements.$puzzleActiveName.html( this.puzzle.name );
			shared.domElements.$puzzleActiveScoreBar.css( 'width', this.puzzle.scorePct + '%' );
			shared.domElements.$puzzleActiveElementCount.html( this.puzzle.elements.length );
			shared.domElements.$puzzleActiveNumElementsMin.html( this.puzzle.numElementsMin );
			
			shared.domElements.$puzzleActiveNumShapesRequired.html( this.puzzle.numShapesRequired );
			shared.domElements.$puzzleActiveNumShapesChosen.html( this.puzzle.shapes.length );
			
		}
		
	}
	
	function stop_ui () {
		
		var i, l,
			shape;
		
		console.log( 'PLANTING: UI stopped' );
		
		// shapes
		
		for ( i = 0, l = this.collection.shapes.length; i < l; i++ ) {
			
			shape = this.collection.shapes[ i ];
			
			// remove tap listeners
			
			_GridElementLibrary.shapes[ shape ].$buttonsShapePicker.addClass( 'disabled' ).off( '.shapeToggle' );
			
		}
		
		// update ui
		
		this.stop_ui_puzzle();
		
		shared.signals.onGameResumed.remove( on_resume, this );
		this.puzzleLast.onShapeAdded.remove( this.update_ui, this );
		this.puzzleLast.onShapeRemoved.remove( this.update_ui, this );
		this.puzzleLast.onShapesNeeded.remove( this.setup_ui_puzzle, this );
		this.puzzleLast.onShapesReady.remove( this.update_ui_puzzle, this );
		
		// deselect plant
		
		this.select_ui_plant();
		
	}
	
	function clear_ui () {
		
		console.log( 'PLANTING: UI cleared' );
		
		this.puzzleLast.onCompleted.remove( this.complete_ui_puzzle, this );
		
		// hide puzzle
		main.dom_collapse( {
			element: shared.domElements.$puzzleActive
		} );
		
		// show puzzle warning
		main.dom_collapse( {
			element: shared.domElements.$puzzleActiveWarning,
			show: true,
			time: 0
		} );
		
	}
	
	function show_ui ( callback ) {
		
		if ( shared.domElements.$menuFarming.is( '.active' ) !== true || main.paused !== true ) {
			
			shared.domElements.$menuFarmingToggle.trigger( 'tap' );
			
		}
		
	}
	
	function on_resume () {
		
		shared.domElements.$puzzleActiveShapesPicker.placeholdme( 'revert' );
		
		if ( this.puzzle instanceof _Puzzle.Instance ) {
			
			this.puzzle.clean();
		
		}
		
		// if puzzle not ready on resume, stop
		
		if ( this.puzzle instanceof _Puzzle.Instance && this.puzzle.ready !== true ) {
			
			this.change_puzzle();
			
		}
		else {
			
			this.start_ui_puzzle();
			
		}
		
	}
	
	/*===================================================
    
    ui: puzzle
    
    =====================================================*/
	
	function select_ui_puzzle () {
		
		if ( this.puzzle instanceof _Puzzle.Instance && this.puzzle.started === true ) {
			
			this.show_ui();
			
			shared.domElements.$puzzle[0].scrollIntoView( true );
			
		}
		
	}
	
	function setup_ui_puzzle () {
		
		console.log( 'PLANTING: UI puzzle setup' );
		
		this.stop_ui_puzzle();
		
		if ( this.puzzle instanceof _Puzzle.Instance ) {
			
			shared.signals.onGameResumed.addOnce( on_resume, this );
			this.puzzle.onShapesReady.add( this.update_ui_puzzle, this );
			
			// update status
			
			if ( this.puzzle.completed === true ) {
				
				shared.domElements.$puzzleActiveCompletionIcons.addClass( 'hidden' ).filter( "#" + this.puzzle.scoreStatus.toLowerCase()  ).removeClass( 'hidden' );
				shared.domElements.$puzzleActiveStatusText.html( "completed at level '" + this.puzzle.scoreStatus + "'" );
				
			}
			else {
				
				shared.domElements.$puzzleActiveStatusText.html( 'waiting for shapes' );
				
			}
			
			shared.domElements.$puzzleActiveStatusIcons.addClass( 'hidden' ).filter( "#waiting" ).removeClass( 'hidden' );
			
			// if not already on farming menu, isolate and show puzzle start menu
			
			if ( shared.domElements.$menuFarming.is( '.active' ) !== true ) {
				
				// puzzle start menu
				
				_UIQueue.add( {
					element: shared.domElements.$puzzleActiveStarted,
					container: shared.domElements.$menuActive,
					activate: function () {
						
						shared.domElements.$puzzleActiveStarted.placeholdme()
							.appendTo( shared.domElements.$menuActive.data( '$inner' ) );
						
					},
					deactivate: function () {
						
						shared.domElements.$puzzleActiveStarted.placeholdme( 'revert' );
						
					}
				} );
				
				// add puzzle shapes picker to start menu
				
				_UIQueue.add( {
					element: shared.domElements.$puzzleActiveShapesPicker,
					container: shared.domElements.$puzzleActiveStarted,
					activate: function () {
						
						shared.domElements.$puzzleActiveShapesPicker.placeholdme()
							.appendTo( shared.domElements.$puzzleActiveStartedPlan );
						
					},
					deactivate: function () {
						
						shared.domElements.$puzzleActiveShapesPicker.placeholdme( 'revert' );
						
					}
				} );
				
			}
			
			// show counter
			
			main.dom_collapse( {
				element: shared.domElements.$puzzleActiveShapesCounter,
				show: true
			} );
			
		}
		
	}
	
	function update_ui_puzzle () {
		
		var i, l,
			shapes,
			shape;
		
		// new puzzle ready
		if ( this.puzzle instanceof _Puzzle.Instance && this.puzzle.ready === true ) {
			
			console.log( 'PLANTING: UI puzzle update' );
			
			this.puzzle.onShapesReady.remove( this.update_ui_puzzle, this );
			
			// update status
			
			if ( this.puzzle.completed === true ) {
				
				shared.domElements.$puzzleActiveCompletionIcons.addClass( 'hidden' ).filter( "#" + this.puzzle.scoreStatus.toLowerCase()  ).removeClass( 'hidden' );
				shared.domElements.$puzzleActiveStatusText.html( "completed at level '" + this.puzzle.scoreStatus + "'" );
				
			}
			else {
				
				shared.domElements.$puzzleActiveStatusText.html( 'ready' );
				
			}
			
			shared.domElements.$puzzleActiveStatusIcons.addClass( 'hidden' ).filter( "#ready" ).removeClass( 'hidden' );
			
			// hide shapes picker elements
			
			main.dom_collapse( {
				element: $().add( shared.domElements.$puzzleActiveShapesRequiredWarning ).add( shared.domElements.$puzzleActiveShapesCounter )
			} );
			
			// show ready items
			
			main.dom_collapse( {
				element: $().add( shared.domElements.$puzzleActiveReady ).add( shared.domElements.$puzzleActiveStartedPlanReady ),
				show: true
			} );
			
			// ensure started plan ready in view
			
			shared.domElements.$puzzleActiveStartedPlanReady.get( 0 ).scrollIntoView( true );
			
			// handle puzzle shape activators
			
			shapes = this.puzzle.shapes;
			
			for ( i = 0, l = shapes.length; i < l; i++ ) {
				
				shape = shapes[ i ];
				
				_GridElementLibrary.shapes[ shape ].$buttonsPuzzleActive.on( 'dragstart.activatePlant', $.proxy( this.activate_plant, this ) );
				
			}
			
		}
		
	}
	
	function start_ui_puzzle () {
		
		// new puzzle ready
		if ( this.puzzle instanceof _Puzzle.Instance && this.puzzle.ready === true ) {
			
			console.log( 'PLANTING: UI puzzle start' );
			
			// show shape activators
			
			main.dom_fade( { 
				element: shared.domElements.$puzzleActiveShapes,
				opacity: 1
			} );
			
		}
		
	}
	
	function stop_ui_puzzle () {
		
		var i, l,
			shapes,
			shape;
		
		console.log( 'PLANTING: UI puzzle stop' );
		
		// hide ready items
		
		main.dom_collapse( {
			element: $().add( shared.domElements.$puzzleActiveReady ).add( shared.domElements.$puzzleActiveStartedPlanReady )
		} );
		
		// disable all shape activators
		
		shapes = _GridElementLibrary.shapeNames;
		
		for ( i = 0, l = shapes.length; i < l; i++ ) {
			
			shape = shapes[ i ];
			
			_GridElementLibrary.shapes[ shape ].$buttonsPuzzleActive.off( '.activatePlant' );
			
		}
		
		// hide shape activators
		
		main.dom_fade( { 
			element: shared.domElements.$puzzleActiveShapes
		} );
		
	}
	
	function complete_ui_puzzle () {
		
		var scores;
		console.log( 'PLANTING: UI puzzle complete, changed? ', this.puzzleLast.changed );
		if ( this.puzzleLast instanceof _Puzzle.Instance && this.puzzleLast.changed === true ) {
			
			// scores
			
			scores = this.puzzleLast.scores;
			
			$().add( shared.domElements.$rewardsPoorList )
				.add( shared.domElements.$rewardsGoodList )
				.add( shared.domElements.$rewardsPerfectList )
				.empty();
			
			$().add( shared.domElements.$scorePoor )
					.add( shared.domElements.$rewardsPoor )
					.add( shared.domElements.$scoreGood )
					.add( shared.domElements.$rewardsGood )
					.add( shared.domElements.$scorePerfect )
					.add( shared.domElements.$rewardsPerfect )
					.removeClass( 'active' );
			
			if ( scores.poor.beat === true ) {
				
				shared.domElements.$scorePoor.addClass( 'active' );
				shared.domElements.$rewardsPoor.addClass( 'active' );
				
			}
			
			if ( scores.good.beat === true  ) {
				
				shared.domElements.$scoreGood.addClass( 'active' );
				shared.domElements.$rewardsGood.addClass( 'active' );
				
			}
			
			if ( scores.perfect.beat === true ) {
				
				shared.domElements.$scorePerfect.addClass( 'active' );
				shared.domElements.$rewardsPerfect.addClass( 'active' );
				
			}
			
			handle_rewards.call( this, scores.poor.rewards, shared.domElements.$rewardsPoorList, scores.poor.beat === true  );
			handle_rewards.call( this, scores.good.rewards, shared.domElements.$rewardsGoodList, scores.good.beat === true  );
			handle_rewards.call( this, scores.perfect.rewards, shared.domElements.$rewardsPerfectList, scores.perfect.beat === true  );
			
			// properties
			
			shared.domElements.$scorePuzzleName.html( this.puzzleLast.name );
			shared.domElements.$scoreTitle.html( this.puzzleLast.scoreTitle );
			shared.domElements.$scoreElementCount.html( this.puzzleLast.numElementsUsed );
			shared.domElements.$scoreElementCountGoal.html( this.puzzleLast.numElementsMin );
			shared.domElements.$scorePct.html( this.puzzleLast.scorePct );
			shared.domElements.$scoreHint.html( this.puzzleLast.scoreHint );
			
			// score menu
			
			_UIQueue.add( {
				element: shared.domElements.$score,
				container: shared.domElements.$menuActive,
				activate: function () {
					
					shared.domElements.$score.placeholdme()
						.appendTo( shared.domElements.$menuActive.data( '$inner' ) );
					
				},
				deactivate: function () {
					
					shared.domElements.$score.placeholdme( 'revert' );
					
				},
				priority: true
			} );
			
		}
		
	}
	
	function handle_rewards ( rewards, $list, give ) {
		
		var i, l,
			reward,
			$reward,
			type,
			typeDisplay,
			tipTitle,
			isNew;
		
		for ( i = 0, l = rewards.length; i < l; i++ ) {
			
			reward = rewards[ i ];
			
			type = $.trim( reward.type );
			typeDisplay = main.str_to_title( type );
			
			// show in ui
			
			$reward = shared.domElements.cloneables.$reward.clone()
				.find( '.reward-icon' )
					.attr( 'src', shared.pathToIcons + reward.icon )
				.end()
				.find( '.reward-name' )
					.html( main.str_to_title( $.trim( reward.name ) ) )
				.end()
				.find( '.reward-type ' )
					.html( typeDisplay )
				.end()
				.appendTo( $list );
			
			// give by type
			
			if ( give === true ) {
				
				isNew = this.add_to_collection( reward.data || reward.name, type );
				
				if ( isNew === true ) {
					
					$reward.addClass( 'new' );
					
					tipTitle = 'New ' + typeDisplay + '!';
					
				}
				else {
					
					tipTitle = 'You already have it!';
					
				}
				
			}
			else {
				
				tipTitle = 'Unlock at higher score!';
				
			}
			
			$reward.tooltip( { title: tipTitle, trigger: 'hover' } );
			
		}
		
	}
	
	/*===================================================
    
    ui: plant
    
    =====================================================*/
	
	function select_ui_plant ( plant, moveScreen ) {
		
		var shape,
			skin;
		
		// select
		
		if ( this.puzzle instanceof _Puzzle.Instance && this.puzzle.started === true && plant instanceof _GridElement.Instance ) {
			console.log( 'PLANTING: plant select ', this.plantSelect, ' vs plant ', this.plant );
			// if new
			
			if ( this.plantSelect !== plant ) {
				
				this.plantSelect = plant;
				
			}
			
			// update information
			
			shape = this.plantSelect.shape;
			skin = this.plantSelect.skin;
			
			shared.domElements.$plantActiveShape.html( shape.charAt(0).toUpperCase() + shape.slice(1) );
			shared.domElements.$plantActiveSkin.html( skin.charAt(0).toUpperCase() + skin.slice(1) );
			
			
			// TODO: shape/skin icons
			//shared.domElements.$plantActiveShapeIcon;
			//shared.domElements.$plantActiveSkinIcon;
			
			
			// TODO: show 3D portrait
			//shared.domElements.$plantActivePortrait;
			
			
			// hide plant warning
			main.dom_collapse( {
				element: shared.domElements.$plantActiveWarning,
				time: 0
			} );
			
			// show plant
			main.dom_collapse( {
				element: shared.domElements.$plantActive,
				show: true,
				time: 0
			} );
			
			// if should move screen
			
			if ( moveScreen === true ) {
				
				show_ui();
				
				// scroll to plant
				
				shared.domElements.$plant[0].scrollIntoView( true );
				
			}
			
		}
		// deselect
		else if ( this.plantSelect instanceof _GridElement.Instance ) {
			console.log( 'PLANTING: plant deselected');
			this.plantSelect = undefined;
			
			
			// TODO: stop 3D portrait
			//shared.domElements.$plantActivePortrait;
			
			// show plant warning
			main.dom_collapse( {
				element: shared.domElements.$plantActiveWarning,
				show: true,
				time: 0
			} );
			
			// hide plant
			main.dom_collapse( {
				element: shared.domElements.$plantActive,
				time: 0
			} );
			
		}
		
	}
	
	function start_ui_plant () {
		
		var shape,
			shapeData,
			dd;
		
		// if has plant
		
		if ( this.plant instanceof _GridElement.Instance ) {
			
			// get shape and data
			
			shape = this.plant.shape;
			shapeData = _GridElementLibrary.shapes[ shape ];
			
			if ( shape && shapeData ) {
				
				// stop previous
				
				this.stop_ui_plant();
				
				// store new shape
				console.log( 'PLANTING: start ui plant' );
				this.$shapeActivator = shapeData.$buttonsPuzzleActive;
				
				// get drag data
				
				dd = this.$shapeActivator.data( 'dragData' );
				
				if ( !dd ) {
					
					dd = shared.domElements.$uiInGame.offset();
					
				}
				
				// get proxy
				
				dd.$proxy = dd.$proxy || this.$shapeActivator.clone().addClass( 'draggable' ).css( { opacity: 0.75 } );
				
				// add proxy
				
				dd.$proxy.appendTo( shared.domElements.$uiInGame );
				
				// update drag bounds
				
				dd.width = this.$shapeActivator.outerWidth();
				dd.height = this.$shapeActivator.outerHeight();
				dd.widthHalf = dd.width * 0.5;
				dd.heightHalf = dd.height * 0.5;
				dd.right = dd.left + shared.domElements.$uiInGame.outerWidth() - dd.width;
				dd.bottom = dd.top + shared.domElements.$uiInGame.outerHeight() - dd.height;
				
				// store data
				
				this.$shapeActivator.data( 'dragData', dd );
				console.log( 'PLANTING: ui plant shape', this.$shapeActivator, 'dragdata', this.$shapeActivator.data( 'dragData' ) );
			}
		
		}
		
	}
	
	function step_ui_plant () {
		
		var dd,
			boundedX,
			boundedY;
		
		// if has plant
		
		if ( this.plant instanceof _GridElement.Instance && this.$shapeActivator ) {
			
			// get updated position
			
			dd = this.$shapeActivator.data( 'dragData' );
			boundedX = Math.min( dd.right, Math.max( dd.left, this.pointer.x - dd.widthHalf ) );
			boundedY = Math.min( dd.bottom, Math.max( dd.top, this.pointer.y - dd.heightHalf ) );
			
			// handle proxy
			
			dd.$proxy.css( {
				left: boundedX,
				top: boundedY
			} );
			
		}
		
	}
	
	function stop_ui_plant () {
		
		var dd;
		
		if ( this.$shapeActivator ) {
			console.log( 'PLANTING: stop ui plant' );
			// remove proxy
			
			dd = this.$shapeActivator.data( 'dragData' );
			dd.$proxy.remove();
			
			// clear shape
			
			this.$shapeActivator = undefined;
			
		}
		
	}
	
} (KAIOPUA) );