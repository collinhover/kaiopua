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
		_Puzzle,
		_GridModule,
		_Plant,
		_ObjectHelper,
		_MathHelper,
		allPlants;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Planting,
		requirements: [
			"assets/modules/core/Game.js",
			"assets/modules/ui/GUI.js",
			"assets/modules/puzzles/Puzzle.js",
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
	
	function init_internal ( g, gui, pzl, gm, pl, oh, mh ) {
		console.log('internal planting', _Planting);
		
		_Game = g;
		_GUI = gui;
		_Puzzle = pzl;
		_GridModule = gm;
		_Plant = pl;
		_ObjectHelper = oh;
		_MathHelper = mh;
		
		allPlants = [];
		
		Object.defineProperty( _Planting, 'allPlants', { 
			get: function () { return allPlants; }
		});
		
		// instance
		
		_Planting.Instance = Planting;
		
		_Planting.Instance.prototype.reset = reset;
		_Planting.Instance.prototype.step = step;
		
		_Planting.Instance.prototype.setup = setup;
		_Planting.Instance.prototype.start = start;
		_Planting.Instance.prototype.update = update;
		_Planting.Instance.prototype.complete = complete;
		_Planting.Instance.prototype.stop = stop;
		
		_Planting.Instance.prototype.get_planting_object_under_mouse = get_planting_object_under_mouse;
		
		_Planting.Instance.prototype.change_module = change_module;
		_Planting.Instance.prototype.change_plant = change_plant;
		
		_Planting.Instance.prototype.rotate_plant = rotate_plant;
		_Planting.Instance.prototype.reset_rotate_plant = reset_rotate_plant;
		_Planting.Instance.prototype.update_rotate_plant = update_rotate_plant;
		
	}
	
	/*===================================================
    
    planting
    
    =====================================================*/
	
	function Planting ( farming ) {
		
		// store farming reference
		
		this.farming = farming;
		
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
			
			if ( parameters.field === true && typeof this.farming.field !== 'undefined' ) {
				
				plantingObjects = plantingObjects.concat( this.farming.field.grid.modules );
				
			}
			else {
				
				plantingObjects = plantingObjects.concat( _Puzzle.allModules );
				
			}
			
		}
		
		if ( parameters.character === true ) {
			
			plantingObjects.push( this.farming.character );
			
		}
		
		if ( parameters.plants === true ) {
			
			if ( parameters.field === true && typeof this.farming.field !== 'undefined' ) {
				
				plantingObjects = plantingObjects.concat( this.farming.field.plants );
				
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
	
	function step () {
		
		var wasRotated;
		
		// if is rotating
		
		if ( this.rotating === true ) {
			
			// record if rotated
			
			wasRotated = this.rotation.rotated;
			
			// stop rotating
			
			this.rotate_plant( false );
			
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
				
				this.setup();
				
			}
			
		}
		
	}
	
	/*===================================================
	
	setup / start / continue / complete / stop
	
	=====================================================*/
	
	function setup () {
		
		var targetObject;
		
		// find if any planting objects under mouse
		
		targetObject = this.get_planting_object_under_mouse( { modules: false, character: true, plants: true } );
		
		// if is character
		
		if ( targetObject === this.farming.character ) {
			
			// set plant
			// TODO: open menu with plant choice
			
			var plantTest = new _Plant.Instance();
			
			this.change_plant( plantTest );
			
			// start planting
			
			this.start();
			
		}
		// if is a plant
		else if ( targetObject instanceof _Plant.Instance ) {
			
			// use plant
			
			this.change_plant( targetObject );
			
			// start planting
			
			this.start();
			
		}
		
	}
	
	function start () {
		
		// if has not started planting and plant is valid
		
		if ( this.started !== true && this.plant instanceof _Plant.Instance ) {
			console.log('start PLANTING!');
			
			// set started
			
			this.started = true;
			
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
				
		targetObject = this.get_planting_object_under_mouse( { modules: true, character: true } );
		
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
		
		// stop updating
		
		shared.signals.mousemoved.remove( this.update, this );
		
		// stop rotating
		
		this.rotate_plant( false );
		
		// clear plant
		
		this.change_plant();
		
		// clear module / field
		
		this.change_module();
		
		// stop
			
		this.started = false;
		
	}
	
	/*===================================================
	
	planting changes
	
	=====================================================*/
	
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
				
				grid = module.grid;
				
				// get field
				
				field = module.puzzle;
				
				console.log(' > PLANTING: intersected module is', module, ', with ', module.connectedList.length, ' connected modules', module.connected );
				
			}
			
			// change field
			
			this.farming.change_field( field );
			
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
				
				this.plant.seed.hide( { remove: true } );
				
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
				
				this.plant.seed.show( { parent: _GUI.layers.ui } );
				
				// cursor
				
				_GUI.container.apply_css( 'cursor', 'pointer' );
				
			}
			
		}
		
	}
	
	/*===================================================
	
	plant rotation
	
	=====================================================*/
	
	function rotate_plant ( parameters ) {
		
		var pr;
		
		if ( _Game.is_stop_parameter( parameters ) ) {
			console.log(' > PLANTING: rotation STOP ');
			// rotate stop
			
			this.rotating = false;
			
		}
		else if ( this.started === true && this.rotating !== true && this.module instanceof _GridModule.Instance ) {
			console.log(' > PLANTING: rotation START ');
			// init rotation info
			
			pr = this.rotation = {};
			pr.startThreshold = 10;
			pr.dirChangeThreshold = 15;
			
			// reset
			
			this.reset_rotate_plant( true );
			
			// rotate start
			
			this.rotating = true;
			
		}
		
		return this.rotating;
		
	}
	
	function reset_rotate_plant ( all ) {
		console.log(' > PLANTING: rotation TOTALS RESET ');
		var pr = this.rotation;
		
		// counters
		
		//pr.x.total = pr.totaly = 0;
		
		pr.dirx = pr.diry = pr.dcx = pr.dcy = pr.tx = pr.ty = 0;
		
		// all others
		
		if ( all === true ) {
			
			pr.rotated = false;
			
		}
		
	}
	
	function update_rotate_plant () {
		
		var plant = this.plant,
			pr = this.rotation,
			mouse = this.mouse,
			rotation,
			rotationAbs,
			resetTotals,
			dirx,
			diry;
		
		// handle direction
		
		dirx = _MathHelper.sign( mouse.dx );
		//diry = _MathHelper.sign( mouse.dy );
		
		// if x direction has changed
		
		if ( pr.dirx !== 0 && pr.dirx !== dirx ) {//|| pr.diry !== diry ) {
			
			// increase direction change counters
			
			pr.dcx += Math.abs( mouse.dx );
			//pr.dcy += Math.abs( mouse.dy );
			
		}
		else {
			
			// store new direction
		
			pr.dirx = dirx;
			//pr.diry = diry;
			
			// add delta x/y to totals
			
			pr.tx += mouse.dx;
			pr.ty += mouse.dy;
			
		}
		
		// set rotation from totals
		
		rotation = pr.tx + ( Math.abs( pr.ty ) * _MathHelper.sign( pr.tx ) );
		rotationAbs = Math.abs( rotation );
		
		// if rotation above threshold
		
		if ( rotationAbs >= pr.startThreshold ) {
			
			// set rotated
			
			pr.rotated = true;
			
			// rotate plant
			
			plant.rotate( rotation, this.module );
			
		}
		
		// if direction change counters are over threshold, reset totals
			
		if ( rotationAbs >= 90 || pr.dcx/* + pr.dcy */ >= pr.dirChangeThreshold ) {
			
			this.reset_rotate_plant();
			
		}
		
	}
	
} (KAIOPUA) );