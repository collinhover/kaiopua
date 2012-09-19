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
		_UIQueue,
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
			"assets/modules/ui/UIQueue.js",
			"assets/modules/utils/MathHelper.js",
			"assets/modules/utils/ObjectHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( g, pzl, ts, gr, gm, gmodel, ge, ges, uiq, mh, oh ) {
		console.log('internal planting', _Planting);
		
		_Game = g;
		_Puzzle = pzl;
		_ToggleSwitch = ts;
		_Grid = gr;
		_GridModule = gm;
		_GridModel = gmodel;
		_GridElement = ge;
		_GridElementLibrary = ges;
		_UIQueue = uiq;
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
		
		_Planting.Instance.prototype.add_collection_skin = add_collection_skin;
		_Planting.Instance.prototype.remove_collection_skin = remove_collection_skin;
		_Planting.Instance.prototype.add_collection_shape = add_collection_shape;
		_Planting.Instance.prototype.remove_collection_shape = remove_collection_shape;
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
		
		_Planting.Instance.prototype.get_planting_object_under_pointer = get_planting_object_under_pointer;
		
		_Planting.Instance.prototype.change_puzzle = change_puzzle;
		_Planting.Instance.prototype.change_module = change_module;
		_Planting.Instance.prototype.change_plant = change_plant;
		
		_Planting.Instance.prototype.start_rotate_plant = start_rotate_plant;
		_Planting.Instance.prototype.update_rotate_plant = update_rotate_plant;
		_Planting.Instance.prototype.stop_rotate_plant = stop_rotate_plant;
		
		_Planting.Instance.prototype.start_ui = start_ui;
		_Planting.Instance.prototype.stop_ui = stop_ui;
		_Planting.Instance.prototype.update_ui = update_ui;
		_Planting.Instance.prototype.show_ui = show_ui;
		
		_Planting.Instance.prototype.select_ui_puzzle = select_ui_puzzle;
		_Planting.Instance.prototype.select_ui_plant = select_ui_plant;
		
		_Planting.Instance.prototype.update_ui_puzzle = update_ui_puzzle;
		
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
		this.skins = [];
		this.shapes = [];
		this.affectUI = parameters.affectUI || false;
		
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
		// skins
		
		for ( i = 0, l = this.skins.length; i < l; i++ ) {
			
			this.remove_collection_skin( this.skins[ i ] );
			
		}
		
		// shapes
		
		for ( i = 0, l = this.shapes.length; i < l; i++ ) {
			
			this.remove_collection_shape( this.shapes[ i ] );
			
		}
		
		// create collection
		// plants
		
		this.add_collection_skin( 'taro' );
		this.add_collection_skin( 'pineapple' );
		this.add_collection_skin( 'rock' );
		
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
	
	function add_collection_skin ( skin ) {
		
		// if valid
		
		if ( _GridElementLibrary.skins.hasOwnProperty( skin ) ) {
			
			this.skins.push( skin );
			
			// skin picker buttons
			
			//_GridElementLibrary.skins[ skin ].$buttonsSkinPicker.removeClass( "disabled hidden" );
			
		}
		
	}
	
	function remove_collection_skin ( skin ) {
		
		var index;
		
		index = main.index_of_value( this.skins, skin );
		
		if ( index !== -1 ) {
			
			this.skins.splice( index, 1 );
			
			// skin picker buttons
			
			//_GridElementLibrary.skins[ skin ].$buttonsSkinPicker.addClass( "disabled hidden" );
			
		}
		
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
		
		index = main.index_of_value( this.shapes, shape );
		
		if ( index !== -1 ) {
			
			this.shapes.splice( index, 1 );
			
			// shape picker buttons
			
			_GridElementLibrary.shapes[ shape ].$buttonsShapePicker.addClass( "disabled hidden" );
			
		}
		
	}
	
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
			
			if ( main.index_of_value( this.shapes, shape ) !== -1 && $shapePicker ) {
				
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
				
				plant = this.get_planting_object_under_pointer( { modules: false, plants: true } );
				
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
					
					this.plantSelected.dispatch( plant );
					
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
		
		toggleSwitch = _Game.get_pointer_intersection( {
			objects: _Puzzle.allToggleSwitches,
			pointer: main.get_pointer( parameters.event ),
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
				
				this.puzzleSelected.dispatch( puzzle );
				
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
				
				plant = this.get_planting_object_under_pointer( { modules: false, plants: true } );
				
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
				
				// if affects ui
				
				if ( this.affectUI === true ) {
					
					this.step_ui_plant();
					
				}
				
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
			plantPlantedNodes;
		
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
				
				if ( plantSuccessful === true ) {
					plantPlantedNodes = this.plant.get_layout_node_total();
					console.log(' > PLANTING: plant added!', this.plant, ' with nodes: ', plantPlantedNodes);
					
					// if affects ui
					
					if ( this.affectUI === true ) {
						
						this.update_ui();
						
					}
					
					// planted signal
					
					this.planted.dispatch( this.plant );
					
					// also signal by type
					
					if ( plantPlantedNodes > 1 ) {
						
						this.plantedMulti.dispatch( this.plant );
						
					}
					else {
						
						this.plantedSingle.dispatch( this.plant );
						
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
			targetObject;
		
		// handle parameters
		
		parameters = parameters || {};
		
		// build array of objects that are involved in planting process
		
		if ( this.puzzle instanceof _Puzzle.Instance ) {
			
			// modules
			
			if ( parameters.modules === true ) {
				
				plantingObjects = plantingObjects.concat( this.puzzle.grid.modules );
				
			}
			
			/*targetObject = _Game.get_pointer_intersection( {
				objects: this.puzzle.grid.modules,
				pointer: this.pointer,
				hierarchySearch: false,
				objectOnly: true
			} );*/
			
			// plants
			
			if ( parameters.plants === true ) {
				
				plantingObjects = plantingObjects.concat( this.puzzle.occupants );
				
			}
			
			// find if any planting objects under pointer
			targetObject = _Game.get_pointer_intersection( {
				objects: plantingObjects,
				pointer: this.pointer,
				objectOnly: true
			} );
			
		}
		
		return targetObject;
		
	}
	
	/*===================================================
	
	planting changes
	
	=====================================================*/
	
	function change_puzzle ( puzzle ) {
		
		var puzzleNew;
		
		// if new puzzle
		
		if ( this.puzzle !== puzzle && puzzle instanceof _Puzzle.Instance ) {
			
			puzzleNew = true;
			this.puzzleLast = this.puzzle;
			
			// change
			
			this.puzzle = puzzle;
			
		}
		// else toggle current off
		else if ( typeof puzzle === 'undefined' || this.puzzle === puzzle || ( this.puzzle instanceof _Puzzle.Instance && this.puzzle.started === false ) ) {
			
			this.puzzleLast = this.puzzle;
			
			// clear current
			
			this.puzzle = undefined;
			
		}
		
		// handle last puzzle
		
		if ( this.puzzleLast instanceof _Puzzle.Instance ) {
			
			// remove state change listener
			
			this.puzzleLast.stateChanged.remove( this.change_puzzle, this );
			
			// toggle off
			
			if ( this.puzzleLast.started === true ) {
				
				this.puzzleLast.toggleSwitch.toggle();
			
			}
			
			// if affects ui
			
			if ( this.affectUI === true ) {
				
				this.stop_ui();
				
			}
			
			// signal
			
			this.puzzleStopped.dispatch( this.puzzleLast );
			
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
			
			// if affects ui
			
			if ( this.affectUI === true ) {
				
				this.start_ui();
				
			}
			
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
				
				this.plantStopped.dispatch( this.plant );
				
				// remove plant
				
				this.plant = undefined;
				
			}
			
			// handle new plant
			
			if ( plantNew instanceof _GridElement.Instance && main.index_of_value( this.skins, plantNew.skin ) !== -1 && main.index_of_value( this.shapes, plantNew.shape ) !== -1 ) {
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
				
				this.puzzle.shapeAdded.add( this.update_ui, this );
				this.puzzle.shapeRemoved.add( this.update_ui, this );
				
				console.log( ' this.shapes ', this.shapes.length, this.shapes, ' + puzzle shapes: ', this.puzzle.shapes.length, this.puzzle.shapes );
				for ( i = 0, l = this.shapes.length; i < l; i++ ) {
					
					shape = this.shapes[ i ];
					shapeData = _GridElementLibrary.shapes[ shape ];
					
					// add tap listeners
					
					_GridElementLibrary.shapes[ shape ].$buttonsShapePicker.removeClass( 'disabled' ).on( 'tap.shapeToggle', $.proxy( this.toggle_puzzle_shape, this ) );
					
					// toggle based on puzzle
					
					index = main.index_of_value( this.puzzle.shapes, shape );
					
					// puzzle has shape
					console.log( 'shape ', shape, ' picked? ', shapeData.picked );
					if ( index !== -1 ) {
						
						// ensure is picked
						
						if ( shapeData.picked !== true ) {
							console.log( ' > toggling shape on ', shape );
							toggle_shape_picked( shape );
							
						}
						
					}
					// ensure not picked
					else if ( shapeData.picked !== false ) {
						console.log( ' > toggling shape off ', shape );
						toggle_shape_picked( shape );
						
					}
					
				}
				
				// puzzle specific ui
				
				this.puzzle.shapesNeeded.add( this.update_ui_puzzle, this );
				
				this.update_ui_puzzle();
				
				// update ui
				
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
		
		for ( i = 0, l = this.shapes.length; i < l; i++ ) {
			
			shape = this.shapes[ i ];
			
			// remove tap listeners
			
			_GridElementLibrary.shapes[ shape ].$buttonsShapePicker.addClass( 'disabled' ).off( '.shapeToggle' );
			
		}
		
		// update ui
		
		this.update_ui_puzzle();
		
		shared.signals.gameResumed.remove( on_resume, this );
		this.puzzleLast.shapeAdded.remove( this.update_ui, this );
		this.puzzleLast.shapeRemoved.remove( this.update_ui, this );
		this.puzzleLast.shapesNeeded.remove( this.update_ui_puzzle, this );
		this.puzzleLast.shapesReady.remove( this.update_ui_puzzle, this );
		
		// deselect plant
		
		this.select_ui_plant();
		
		// remove puzzle from ui
		
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
	
	function on_resume () {
		
		shared.domElements.$puzzleActiveShapesPicker.placeholdme( 'revert' );
		
		if ( this.puzzle instanceof _Puzzle.Instance ) {
			
			this.puzzle.clean();
		
		}
		
	}
	
	function show_ui ( callback ) {
		
		if ( shared.domElements.$menuFarming.is( '.active' ) !== true || _Game.paused !== true ) {
			
			shared.domElements.$menuFarmingToggle.trigger( 'tap' );
			
		}
		
	}
	
	function select_ui_puzzle () {
		
		if ( this.puzzle instanceof _Puzzle.Instance && this.puzzle.started === true ) {
			
			this.show_ui();
			
			shared.domElements.$puzzle[0].scrollIntoView( true );
			
		}
		
	}
	
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
			//shared.domElements.$plantActive3DPortrait;
			
			
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
			//shared.domElements.$plantActive3DPortrait;
			
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
	
	function update_ui_puzzle () {
		
		var i, l,
			shapes,
			shape,
			puzzle;
		
		// new puzzle ready
		if ( this.puzzle instanceof _Puzzle.Instance && this.puzzle.ready === true ) {
			
			console.log( 'PLANTING: update puzzle ui to ready' );
			
			this.puzzle.shapesReady.remove( this.update_ui_puzzle, this );
			
			_UIQueue.remove( shared.domElements.$menuCenter );
			
			// update status
			
			shared.domElements.$puzzleActiveStatusIcons.addClass( 'hidden' ).filter( "#ready" ).removeClass( 'hidden' );
			shared.domElements.$puzzleActiveStatusText.html( 'ready' );
			
			// hide shapes picker elements
			
			main.dom_collapse( {
				element: $().add( shared.domElements.$puzzleActiveShapesRequiredWarning ).add( shared.domElements.$puzzleActiveShapesCounter )
			} );
			
			// show ready items
			
			main.dom_collapse( {
				element: shared.domElements.$puzzleActiveReady,
				show: true
			} );
			
			// handle puzzle shape activators
			
			shapes = this.puzzle.shapes;
			
			for ( i = 0, l = shapes.length; i < l; i++ ) {
				
				shape = shapes[ i ];
				
				_GridElementLibrary.shapes[ shape ].$buttonsPuzzleActive.on( 'dragstart.activatePlant', $.proxy( this.activate_plant, this ) );
				
			}
			
			// show shape activators
			
			main.dom_fade( { 
				element: shared.domElements.$puzzleActiveShapes,
				opacity: 1
			} );
			
		}
		// waiting or no puzzle
		else {
			
			console.log( 'PLANTING: update puzzle ui to waiting' );
			
			if ( this.puzzle instanceof _Puzzle.Instance ) {
				
				this.puzzle.shapesReady.add( this.update_ui_puzzle, this );
				shared.signals.gameResumed.addOnce( on_resume, this );
				
				// isolate and show shapes picker
				
				if ( shared.domElements.$menuFarming.is( '.active' ) !== true ) {
					
					_UIQueue.add( {
						element: shared.domElements.$puzzleActiveShapesPicker,
						container: shared.domElements.$menuCenter,
						activate: function () {
							
							shared.domElements.$puzzleActiveShapesPicker.placeholdme()
								.appendTo( shared.domElements.$menuCenter.data( '$inner' ) );
							
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
			
			// update status
			
			shared.domElements.$puzzleActiveStatusIcons.addClass( 'hidden' ).filter( "#waiting" ).removeClass( 'hidden' );
			shared.domElements.$puzzleActiveStatusText.html( 'waiting for shapes' );
			
			// hide ready items
			
			main.dom_collapse( {
				element: shared.domElements.$puzzleActiveReady
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