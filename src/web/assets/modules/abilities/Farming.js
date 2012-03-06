/*
 *
 * Farming.js
 * Gives a character the ability to farm.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/abilities/Farming.js",
		_Farming = {},
		_Plant,
		_Game,
		_Puzzles,
		_GridModule
		_MathHelper;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Farming,
		requirements: [
			"assets/modules/core/Game.js",
			"assets/modules/puzzles/Puzzles.js",
			"assets/modules/puzzles/GridModule.js",
			"assets/modules/puzzles/Plant.js",
			"assets/modules/utils/MathHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal( g, p, gm, pl, mh ) {
		console.log('internal farming', _Farming);
		
		_Game = g;
		_Puzzles = p;
		_GridModule = gm;
		_Plant = pl;
		_MathHelper = mh;
		
		_Farming.Instance = Farming;
		_Farming.Instance.prototype.plant = plant;
		_Farming.Instance.prototype.reset_planting = reset_planting;
		_Farming.Instance.prototype.step_planting = step_planting;
		_Farming.Instance.prototype.start_planting = start_planting;
		_Farming.Instance.prototype.update_planting = update_planting;
		_Farming.Instance.prototype.update_planting_visual = update_planting_visual;
		_Farming.Instance.prototype.complete_planting = complete_planting;
		_Farming.Instance.prototype.stop_planting = stop_planting;
		_Farming.Instance.prototype.change_plant = change_plant;
		_Farming.Instance.prototype.change_module = change_module;
		_Farming.Instance.prototype.change_puzzle = change_puzzle;
		_Farming.Instance.prototype.clear_puzzle = clear_puzzle;
		_Farming.Instance.prototype.rotate_plant = rotate_plant;
		_Farming.Instance.prototype.rotate_plant_reset = rotate_plant_reset;
		_Farming.Instance.prototype.rotate_plant_update = rotate_plant_update;
		
	}
	
	/*===================================================
    
    farming
    
    =====================================================*/
	
	function Farming ( character ) {
		
		var planting;
		
		// store character ref
		
		this.character = character;
		
		// reset planting
		
		this.reset_planting();
		
	}
	
	/*===================================================
	
	planting
	
	=====================================================*/
	
	function plant ( parameters ) {
		
		// handle parameters
		
		if ( is_stop( parameters ) ) {
			
			// stop planting cycle
			
			this.stop_planting();
			
		}
		else {
			
			// store parameters
			
			this.planting.parameters = parameters || {};
			
			this.planting.parameters.mouse = _Game.get_mouse( this.planting.parameters.event );
			
			// step planting cycle
			
			this.step_planting();
			
		}
		
		return this.planting.started;
		
	}
	
	/*===================================================
	
	planting reset
	
	=====================================================*/
	
	function reset_planting () {
		
		this.planting = {};
		this.planting.started = false;
		this.planting.rotating = false;
		
	}
	
	/*===================================================
	
	planting step
	
	=====================================================*/
	
	function step_planting () {
		
		var plantingObjects,
			intersection,
			targetModel,
			plantingWasRotated;
		
		// if is rotating
		
		if ( this.planting.rotating === true ) {
			
			// record if rotated
			
			plantingWasRotated = this.planting.rotation.rotated;
			
			// stop rotating
			
			this.rotate_plant( false );
			
		}
		
		// if was not just rotated
		
		if ( plantingWasRotated !== true ) {
			console.log('step PLANTING!');
			// set array of objects that are involved in this step of planting process
			
			plantingObjects = [ this.character ].concat( _Puzzles.all );
			
			// find if any planting objects under mouse
			
			intersection = _Game.get_intersection_from_mouse( plantingObjects, this.planting.parameters.mouse );
			
			// if planting object found
				
			if ( typeof intersection !== 'undefined' ) {
				
				// store info
					
				targetModel = intersection.object;
				
			}
				
			// steps
			
			// if has plant
			
			if ( this.planting.plant instanceof _Plant.Instance ) {
				
				console.log(' > PLANTING: step has plant: ', this.planting.plant);
				
				// if target is grid module
				if ( targetModel instanceof _GridModule.Instance ) {
					
					// complete planting
					
					this.complete_planting();
					
				}
				else {
					
					this.stop_planting();
					
				}
				
			}
			// if needs plant
			else {
				
				console.log(' > PLANTING: step no plant yet!');
				
				// if is character
				
				if ( targetModel === this.character ) {
					
					// set plant
					// TODO: open menu with plant choice
					
					var plantTest = new _Plant.Instance();
					
					this.change_plant( plantTest );
					
					// start planting
					
					this.start_planting();
					
				}
				
			}
			
		}
		
	}
	
	/*===================================================
	
	planting start / continue / complete / stop
	
	=====================================================*/
	
	function start_planting () {
		
		// if has not started planting and plant is valid
		
		if ( this.planting.started !== true && this.planting.plant instanceof _Plant.Instance ) {
			console.log('start PLANTING!');
			
			// set started
			
			this.planting.started = true;
			
			// start updating planting
			
			this.update_planting();
			
			shared.signals.mousemoved.add( this.update_planting, this );
			
		}
		
	}
	
	function update_planting ( skipRotate, updateVisualOnly ) {
		console.log(' > PLANTING: update planting!');
		var planting = this.planting,
			plantingObjects,
			intersection,
			targetModel,
			module,
			grid,
			puzzle;
		
		// if rotating
		
		if ( skipRotate !== true && planting.rotating === true ) {
			
			this.rotate_plant_update();
			
		}
		// else regular update
		else {
			
			// update visuals only
			
			if ( updateVisualOnly === true ) {
				
				this.update_planting_visual();
				
			}
			// else update fully
			else {
				
				// set array of objects that are involved in planting process
				
				plantingObjects = _Puzzles.all;
				
				// find if any planting objects under mouse
				
				intersection = _Game.get_intersection_from_mouse( plantingObjects, planting.parameters.mouse );
				
				// if planting object found
				
				if ( typeof intersection !== 'undefined' ) {
				
					// store info
					
					targetModel = intersection.object;
					
				}
				
				// if target is grid module
				
				if ( targetModel instanceof _GridModule.Instance ) {
					
					// set target as module
					
					module = targetModel;
					
				}
				
				// change to new module
				
				this.change_module( module );
				
			}
			
		}
		
	}
	
	function update_planting_visual () {
		
		var planting = this.planting,
			module = planting.module;
		
		// clear all puzzle modules
		
		this.clear_puzzle( planting.puzzle );
		
		// test plant compatibility
		
		if ( module instanceof _GridModule.Instance ) {
			
			module.test_grid_element( planting.plant, true );
			
		}
		
	}
	
	function complete_planting () {
		console.log(' > PLANTING: completing...');
		var planting = this.planting,
			module = planting.module,
			plantSuccessful = false;
		
		// try adding plant
		
		if ( module instanceof _GridModule.Instance ) {
			
			plantSuccessful = module.add_grid_element( planting.plant, false );
			
		}
		
		// if successful
		
		if ( plantSuccessful ) {
			console.log(' > PLANTING: plant added!');
			
			// stop planting
		
			this.stop_planting();
			
		}
		else {
			
			console.log(' > PLANTING: plant does not fit!');
			
		}
		
	}
	
	function stop_planting () {
		console.log('stop PLANTING!');
		var planting = this.planting;
		
		// stop updating
		
		shared.signals.mousemoved.remove( this.update_planting, this );
		
		// stop rotating
		
		this.rotate_plant( false );
		
		// clear module
		
		this.change_module();
		
		// clear puzzle modules
		
		this.change_puzzle();
		
		// clear plant
		
		this.change_plant();
		
		// stop
			
		planting.started = false;
		
	}
	
	/*===================================================
	
	planting changes
	
	=====================================================*/
	
	function change_module ( moduleNew ) {
		
		var planting = this.planting,
			module,
			grid,
			puzzle;
		
		// if is new module
		
		if ( planting.module !== moduleNew ) {
			
			// store module
			
			module = planting.module = moduleNew;
			
			// if valid module
			
			if ( module instanceof _GridModule.Instance ) {
				
				// get grid
				
				grid = module.grid;
				
				// get puzzle
				
				puzzle = grid.puzzle;
				
				console.log(' > PLANTING: intersected module is', module, ', with ', module.connectedList.length, ' connected modules', module.connected );
				
			}
			
			// change puzzle
		
			this.change_puzzle( puzzle );
			
		}
		
		// update planting visual
		
		this.update_planting_visual();
		
	}
	
	function change_plant ( plantNew ) {
		
		var planting = this.planting;
		
		// if new plant is different from one stored in planting
		
		if ( planting.plant !== plantNew ) {
			
			// store new plant
			
			planting.plant = plantNew;
			console.log(' > PLANTING: plant to', planting.plant);
			
			// update planting visual
		
			this.update_planting_visual();
			
		}
		
	}
	
	function change_puzzle ( puzzle ) {
		
		// if new puzzle is different from one stored in planting
		
		if ( this.planting.puzzle !== puzzle ) {
			
			// clear previous puzzle
			
			if ( this.planting.puzzle instanceof _Puzzles.Instance ) {
				
				this.clear_puzzle( this.planting.puzzle );
				
			}
			
			// store new puzzle
			
			this.planting.puzzle = puzzle;
			
		}
		
	}
	
	function clear_puzzle ( puzzle, module ) {
		
		if ( puzzle instanceof _Puzzles.Instance ) {
			
			puzzle.grid.each_module( function () {
				this.show_state( false );
			}, module );
			
		}
		
	}
	
	/*===================================================
	
	plant rotation
	
	=====================================================*/
	
	function rotate_plant ( parameters ) {
		
		var pr;
		
		if ( is_stop( parameters ) ) {
			
			// rotate stop
			
			this.planting.rotating = false;
			
		}
		else if ( this.planting.started === true && this.planting.rotating !== true ) {
			
			// init rotation info
			
			pr = this.planting.rotation = {};
			pr.mouse = _Game.get_mouse( parameters.event );
			pr.startThreshold = 10;
			pr.dirChangeThreshold = 15;
			
			// reset
			
			this.rotate_plant_reset( true );
			
			// rotate start
			
			this.planting.rotating = true;
			
		}
		
		return this.planting.rotating;
		
	}
	
	function rotate_plant_reset ( all ) {
		console.log(' > PLANTING: rotation TOTALS RESET ');
		var pr = this.planting.rotation;
		
		// counters
		
		pr.dirx = pr.diry = pr.dcx = pr.dcy = pr.tx = pr.ty = 0;
		
		// all others
		
		if ( all === true ) {
			
			pr.rotated = false;
			
		}
		
	}
	
	function rotate_plant_update () {
		
		var planting = this.planting,
			plant = planting.plant,
			pr = planting.rotation,
			mouse = pr.mouse,
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
			
			plant.rotate( rotation );
			
			// if rotation made
			
			if ( rotationAbs >= 90 ) {
				
				// update planting
				
				this.update_planting( true, true );
				
			}
			
		}
		
		// if direction change counters are over threshold, reset totals
			
		if ( rotationAbs >= 90 || pr.dcx/* + pr.dcy */ >= pr.dirChangeThreshold ) {
			
			this.rotate_plant_reset();
			
		}
		
	}
	
	/*===================================================
	
	utility
	
	=====================================================*/
	
	function is_stop ( parameters ) {
		
		return parameters === false || ( typeof parameters !== 'undefined' && parameters.stop === true );
		
	}
	
} (KAIOPUA) );