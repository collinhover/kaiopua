/*
 *
 * Planting.js
 * Basic activity of farming.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/farming/Planting.js",
		_Planting = {},
		_Game,
		_GUI,
		_Grid,
		_Puzzle,
		_GridModule,
		_Plant,
		_ObjectHelper,
		_MathHelper,
		allPlants,
		utilVec31Rotate,
		utilProjector1Rotate;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Planting,
		requirements: [
			"assets/modules/core/Game.js",
			"assets/modules/ui/GUI.js",
			"assets/modules/puzzles/Puzzle.js",
			"assets/modules/puzzles/Grid.js",
			"assets/modules/puzzles/GridModule.js",
			"assets/modules/farming/Plant.js",
			"assets/modules/utils/ObjectHelper.js",
			"assets/modules/utils/MathHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( g, gui, pzl, gr, gm, pl, oh, mh ) {
		console.log('internal planting', _Planting);
		
		_Game = g;
		_GUI = gui;
		_Puzzle = pzl;
		_Grid = gr;
		_GridModule = gm;
		_Plant = pl;
		_ObjectHelper = oh;
		_MathHelper = mh;
		
		utilVec31Rotate = new THREE.Vector3();
		utilProjector1Rotate = new THREE.Projector();
		
		// properties
		
		allPlants = [];
		
		Object.defineProperty( _Planting, 'allPlants', { 
			get: function () { return allPlants; }
		});
		
		_Planting.rotationSpeed = 0.05;
		_Planting.rotationDistanceMin = 10;
		_Planting.rotationStartThreshold = Math.PI * 0.1;
		_Planting.rotationDirChangeThreshold = 5;
		
		// instance
		
		_Planting.Instance = Planting;
		
		_Planting.Instance.prototype.reset = reset;
		_Planting.Instance.prototype.step = step;
		_Planting.Instance.prototype.step_rotate = step_rotate;
		_Planting.Instance.prototype.step_placement = step_placement;
		
		_Planting.Instance.prototype.setup = setup;
		_Planting.Instance.prototype.start = start;
		_Planting.Instance.prototype.update = update;
		_Planting.Instance.prototype.complete = complete;
		_Planting.Instance.prototype.stop = stop;
		
		_Planting.Instance.prototype.get_planting_object_under_mouse = get_planting_object_under_mouse;
		
		_Planting.Instance.prototype.change_field = change_field;
		_Planting.Instance.prototype.change_module = change_module;
		_Planting.Instance.prototype.change_plant = change_plant;
		
		_Planting.Instance.prototype.start_rotate_plant = start_rotate_plant;
		_Planting.Instance.prototype.update_rotate_plant = update_rotate_plant;
		_Planting.Instance.prototype.stop_rotate_plant = stop_rotate_plant;
		
	}
	
	/*===================================================
    
    planting
    
    =====================================================*/
	
	function Planting ( character ) {
		
		// store character reference
		
		this.character = character;
		
		// properties
		
		this.rotationSpeed = _Planting.rotationSpeed;
		this.rotationDistanceMin = _Planting.rotationDistanceMin;
		this.rotationStartThreshold = _Planting.rotationStartThreshold;
		this.rotationDirChangeThreshold = _Planting.rotationDirChangeThreshold;
		
		// reset
		
		this.reset();
		
	}
	
	/*===================================================
	
	reset
	
	=====================================================*/
	
	function reset () {
		
		this.started = false;
		this.rotating = false;
		this.module = undefined;
		
	}
	
	/*===================================================
	
	target
	
	=====================================================*/
	
	function get_planting_object_under_mouse ( parameters ) {
		
		var i, l,
			field,
			grid,
			modules,
			plantingObjects = [],
			targetObject;
		
		// handle parameters
		
		parameters = parameters || {};
		
		// build array of objects that are involved in planting process
		
		if ( parameters.modules !== false ) {
			
			if ( parameters.field === true && typeof this.field !== 'undefined' ) {
				
				plantingObjects = plantingObjects.concat( this.field.grid.modules );
				
			}
			else {
				
				plantingObjects = plantingObjects.concat( _Puzzle.allModules );
				
			}
			
		}
		
		if ( parameters.character === true ) {
			
			plantingObjects.push( this.character );
			
		}
		
		if ( parameters.plants === true ) {
			
			if ( parameters.field === true && typeof this.field !== 'undefined' ) {
				
				plantingObjects = plantingObjects.concat( this.field.plants );
				
			}
			else {
				
				plantingObjects = plantingObjects.concat( _Planting.allPlants );
				
			}
			
		}
		
		// find if any planting objects under mouse
		
		targetObject = _Game.get_object_under_mouse( plantingObjects, false, this.mouse );
		
		return targetObject;
		
	}
	
	/*===================================================
	
	step
	
	=====================================================*/
	
	function step ( parameters ) {
		console.log(' > PLANTING: STEP');
		// handle parameters
		
		parameters = parameters || {};
		
		// store mouse
				
		this.mouse = main.get_mouse( parameters.event );
		
		// if step rotate
		
		if ( parameters.rotate === true ) {
			
			this.step_rotate( parameters );
			
		}
		// else step placement
		else {
			
			this.step_placement( parameters );
			
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
				
				if ( this.plant instanceof _Plant.Instance ) {
					
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
		
		// if passed plant to use
		
		if ( parameters && parameters.plant ) {
			
			if ( parameters.plant instanceof _Plant.Instance ) {
				
				targetObject = parameters.plant;
				
			}
			else {
				
				targetObject = new _Plant.Instance( parameters.plant );
				
			}
		
		}
		// else if any plants under mouse
		else {
			
			targetObject = this.get_planting_object_under_mouse( { modules: false, character: false, plants: true } );
			
		}
		
		// if is a plant
		if ( targetObject instanceof _Plant.Instance ) {
			
			// use plant
			
			this.change_plant( targetObject );
			
		}
		
	}
	
	function start () {
		
		// if has not started planting and plant is valid
		
		if ( this.started !== true && this.plant instanceof _Plant.Instance ) {
			console.log('start PLANTING!');
			
			// set started
			
			this.started = true;
			
			// dim ui to focus on planting
					
			_GUI.layers.ui.hide( { opacity: 0.25, callback: function () { _GUI.layers.ui.set_pointer_events( false, true ); } } );
			
			// start updating planting
			
			this.update();
			
			shared.signals.mousemoved.add( this.update, this );
			
		}
		
	}
	
	function update ( skipRotate ) {
		console.log(' > PLANTING: update planting!');
		var targetObject;
		
		// if has plant, update seed position
		
		if ( this.plant instanceof _Plant.Instance ) {
			
			this.plant.seed.x = this.mouse.x - this.plant.seed.outerWidthHalf;
			this.plant.seed.y = this.mouse.y - this.plant.seed.outerHeightHalf;
			
		}
		
		// if rotating
		
		if ( skipRotate !== true && this.rotating === true ) {
			
			this.update_rotate_plant();
			
		}
		// else regular update
		else {
			
			// find if any planting objects under mouse
			
			targetObject = this.get_planting_object_under_mouse( { modules: true } );
			
			// change to new module
			
			this.change_module( targetObject );
			
		}
		
	}
	
	function complete () {
		console.log(' > PLANTING: completing...');
		var targetObject,
			plantSuccessful = false;
		
		// find if any planting objects under mouse
				
		targetObject = this.get_planting_object_under_mouse( { modules: true } );
		
		// if target is valid
		
		if ( targetObject instanceof _GridModule.Instance ) {
			
			// if target and current module do not match
			
			if ( this.module !== targetObject ) {
				
				// change module
	
				this.change_module( targetObject );
				
			}
			
			// try adding plant
			
			plantSuccessful = this.plant.occupy_module( this.module );
			
			// stop on success, else continue
			
			if ( plantSuccessful ) {
				console.log(' > PLANTING: plant added!', this.plant);
				this.stop();
				
			}
			else {
				
				console.log(' > PLANTING: plant does not fit!', this.plant);
				
			}
			
		}
		else {
			
			// stop planting
			
			this.stop();
			
		}
		
	}
	
	function stop () {
		console.log('stop PLANTING!');
		var field = this.field;
		
		// stop updating
		
		shared.signals.mousemoved.remove( this.update, this );
		
		// stop
			
		this.started = false;
		
		// stop rotating
		
		this.step_rotate( { stop: true } );
		
		// clear plant
		
		this.change_plant();
		
		// clear module / field
		
		this.change_module();
		
		// return ui to normal state
		
		_GUI.layers.ui.show();
		_GUI.layers.ui.set_pointer_events( false );
		
		// trigger field to check if solved
		// deferring until after planting process clean
		
		if ( field instanceof _Puzzle.Instance ) {
			
			field.solve();
			
		}
		
	}
	
	/*===================================================
	
	planting changes
	
	=====================================================*/
	
	function change_field ( field ) {
		
		// if new field
		
		if ( this.field !== field ) {
			
			// clear previous field grid
			
			if ( this.field instanceof _Puzzle.Instance ) {
				
				this.field.grid.clean();
				
			}
			
			// store new field
			
			this.field = field;
			
		}
		
	}
	
	function change_module ( target ) {
		
		var module,
			grid,
			field;
		
		// if target is module
		
		if ( target instanceof _GridModule.Instance ) {
			
			module = target;
			
		}
		
		// if is new module
		
		if ( this.module !== module ) {
			console.log(' > PLANTING: change MODULE: ', module);
			
			// store new module
			
			this.module = module;
			
			// if valid module
			
			if ( module instanceof _GridModule.Instance ) {
				
				// get grid
				
				if ( module.grid instanceof _Grid.Instance ) {
					
					grid = module.grid;
					
				}
				
				// get field
				
				field = grid.puzzle;
				
				console.log(' > PLANTING: intersected module is', module, ', with ', module.connectedList.length, ' connected modules', module.connected );
				
			}
			
			// change field
			
			this.change_field( field );
			
		}
		
		// test module
		
		if ( this.plant instanceof _Plant.Instance ) {
			
			this.plant.test_occupy_module( module, true );
			
		}
		
	}
	
	function change_plant ( plantNew ) {
		
		var index;
		
		// if new plant is different from one stored in planting
		
		if ( this.plant !== plantNew ) {
			
			// remove last plant
			
			if ( this.plant instanceof _Plant.Instance ) {
				
				// clear last test
				
				this.plant.test_occupy_module();
				
				// find if in all plants list
				
				index = _Planting.allPlants.indexOf( this.plant );
				
				// if planted
					
				if ( this.plant.planted === true ) {
					
					// store in all plants list
					
					if ( index === -1 ) {
						
						_Planting.allPlants.push( this.plant );
						
					}
					
				}
				else {
					
					// ensure plant is uprooted
					
					this.plant.uproot();
					
					// remove from all plants list
					
					if ( index !== -1 ) {
						
						_Planting.allPlants.splice( index, 1 );
						
					}
					
				}
				
				// hide seed
				
				this.plant.seed.hide( { remove: true, time: 0 } );
				
				// cursor
				
				_GUI.container.apply_css( 'cursor', 'auto' );
				
			}
			
			// store new plant
			
			this.plant = plantNew;
			console.log(' > PLANTING: plant to', this.plant);
			
			// if new plant
			
			if ( this.plant instanceof _Plant.Instance ) {
				
				// if currently planted
				
				if ( this.plant.planted === true ) { 
					
					// uproot
						
					this.plant.uproot();
					
				}
				
				// show seed
				
				this.plant.seed.show( { parent: _GUI.layers.uiPriority } );
				
				// cursor
				
				_GUI.container.apply_css( 'cursor', 'pointer' );
				
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
			
			position.copy( this.plant.matrixWorld.getPosition() );
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
			mouse = this.mouse,
			mx = mouse.x,
			my = mouse.y,
			mDist = Math.sqrt( Math.pow( mouse.x - r.x0, 2 ) + Math.pow( mouse.y - r.y0, 2 ) ),
			ax, ay, bx, by,
			angleA, angleB, radians;
		
		// keep track of last 2 locations
		
		r.x2 = r.x1;
		r.x1 = mouse.x;
		
		r.y2 = r.y1;
		r.y1 = mouse.y;
		
		// if has 3 numbers to work with, and mouse is at least minimum distance from rotation point
		
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
				
				plant.rotate( radians, this.module );
				
				// if rotator needed
				
				if ( r.rotated !== true ) {
					
					// hide seed temporarily
					
					this.plant.seed.hide( { remove: true, time: 0 } );
					
					// rotator
					
					this.plant.rotator.show( { parent: _GUI.layers.uiPriority } );
					
					this.plant.rotator.set_position( r.x0 - this.plant.rotator.widthHalf, r.y0 - this.plant.rotator.heightHalf );
					
				}
				
				// set rotated
				
				r.rotated = true;
				
			}
			
		}
		
	}
	
	function stop_rotate_plant () {
		
		
		if ( this.rotating !== false ) {
			console.log(' > PLANTING: rotation STOP ');
			this.plant.seed.show( { parent: _GUI.layers.uiPriority } );
				
			this.plant.rotator.hide( { remove: true } );
				
			this.rotating = false;
			
			this.plant.rotate_reset();
			
		}
		
	}
	
} (KAIOPUA) );