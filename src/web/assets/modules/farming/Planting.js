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
		_Puzzles,
		_GridModule,
		_Plant,
		_ObjectHelper,
		_MathHelper;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Planting,
		requirements: [
			"assets/modules/core/Game.js",
			"assets/modules/puzzles/Puzzles.js",
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
	
	function init_internal ( g, pzl, gm, pl, oh, mh ) {
		console.log('internal planting', _Planting);
		
		_Game = g;
		_Puzzles = pzl;
		_GridModule = gm;
		_Plant = pl;
		_ObjectHelper = oh;
		_MathHelper = mh;
		
		_Planting.Instance = Planting;
		
		_Planting.Instance.prototype.reset = reset;
		_Planting.Instance.prototype.step = step;
		_Planting.Instance.prototype.start = start;
		_Planting.Instance.prototype.update = update;
		_Planting.Instance.prototype.update_visual = update_visual;
		_Planting.Instance.prototype.complete = complete;
		_Planting.Instance.prototype.stop = stop;
		
		_Planting.Instance.prototype.change_module = change_module;
		
		_Planting.Instance.prototype.change_plant = change_plant;
		_Planting.Instance.prototype.position_plant = position_plant;
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
		
	}
	
	/*===================================================
	
	step
	
	=====================================================*/
	
	function step () {
		
		var plantingObjects,
			targetModel,
			wasRotated;
		
		// if is rotating
		
		if ( this.rotating === true ) {
			
			// record if rotated
			
			wasRotated = this.rotation.rotated;
			
			// stop rotating
			
			this.rotate_plant( false );
			
		}
		
		// if was not just rotated
		
		if ( wasRotated !== true ) {
			
			// set array of objects that are involved in this step of planting process
			
			plantingObjects = [ this.farming.character ].concat( _Puzzles.all );
			
			// find if any planting objects under mouse
			
			targetModel = _Game.get_object_under_mouse( plantingObjects, this.mouse );
			
			console.log('step PLANTING, targetModel', targetModel);
			// steps
			
			// if has plant
			
			if ( this.plant instanceof _Plant.Instance ) {
				
				console.log(' > PLANTING: step has plant: ', this.plant);
				
				// if target is grid module
				if ( targetModel instanceof _GridModule.Instance ) {
					
					// complete planting
					
					this.complete();
					
				}
				else {
					
					this.stop();
					
				}
				
			}
			// if needs plant
			else {
				
				console.log(' > PLANTING: step no plant yet!');
				
				// if is character
				
				if ( targetModel === this.farming.character ) {
					
					// set plant
					// TODO: open menu with plant choice
					
					var plantTest = new _Plant.Instance();
					
					this.change_plant( plantTest );
					
					// start planting
					
					this.start();
					
				}
				
			}
			
		}
		
	}
	
	/*===================================================
	
	start / continue / complete / stop
	
	=====================================================*/
	
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
	
	function update ( skipRotate, updateVisualOnly ) {
		console.log(' > PLANTING: update planting!');
		var plantingObjects,
			targetModel,
			module,
			grid,
			field;
		
		// if rotating
		
		if ( skipRotate !== true && this.rotating === true ) {
			
			this.update_rotate_plant();
			
		}
		// else regular update
		else {
			
			// update visuals only
			
			if ( updateVisualOnly === true ) {
				
				this.update_visual();
				
			}
			// else update fully
			else {
				
				// set array of objects that are involved in planting process
				
				plantingObjects = _Puzzles.all;
				
				// find if any planting objects under mouse
				
				targetModel = _Game.get_object_under_mouse( plantingObjects, this.mouse );
				
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
	
	function update_visual () {
		
		var module = this.module;
		
		// clean all field modules
		
		this.farming.clean_field();
		
		// position plant
		
		this.position_plant();
		
		// test plant compatibility
		
		if ( module instanceof _GridModule.Instance ) {
			
			module.test_grid_element( this.plant, true );
			
		}
		
	}
	
	function complete () {
		console.log(' > PLANTING: completing...');
		var module = this.module,
			plantSuccessful = false;
		
		// try adding plant
		
		if ( module instanceof _GridModule.Instance ) {
			
			plantSuccessful = module.add_grid_element( this.plant, false );
			
		}
		
		// if successful
		
		if ( plantSuccessful ) {
			console.log(' > PLANTING: plant added!');
			
			// stop planting
		
			this.stop();
			
		}
		else {
			
			console.log(' > PLANTING: plant does not fit!');
			
		}
		
	}
	
	function stop () {
		console.log('stop PLANTING!');
		
		// stop updating
		
		shared.signals.mousemoved.remove( this.update, this );
		
		// stop rotating
		
		this.rotate_plant( false );
		
		// clear module
		
		this.change_module();
		
		// clear field modules
		
		this.farming.change_field();
		
		// clear plant
		
		this.change_plant();
		
		// stop
			
		this.started = false;
		
	}
	
	/*===================================================
	
	planting changes
	
	=====================================================*/
	
	function change_module ( moduleNew ) {
		
		var module,
			grid,
			field;
		
		// if is new module
		
		if ( this.module !== moduleNew ) {
			
			// store module
			
			module = this.module = moduleNew;
			
			// if valid module
			
			if ( module instanceof _GridModule.Instance ) {
				
				// get grid
				
				grid = module.grid;
				
				// get field
				
				field = grid.puzzle;
				
				console.log(' > PLANTING: intersected module is', module, ', with ', module.connectedList.length, ' connected modules', module.connected );
				
			}
			
			// change field
		
			this.farming.change_field( field );
			
		}
		
		// update planting visual
		
		this.update_visual();
		
	}
	
	function change_plant ( plantNew ) {
		
		// if new plant is different from one stored in planting
		
		if ( this.plant !== plantNew ) {
			
			// remove last plant
			
			if ( this.plant instanceof _Plant.Instance ) {
				
				this.farming.character.scene.remove( this.plant );
			
			}
			
			// store new plant
			
			this.plant = plantNew;
			console.log(' > PLANTING: plant to', this.plant);
			
			// add plant
			
			if ( this.plant instanceof _Plant.Instance ) {
				
				this.farming.character.scene.add( this.plant );
				
			}
			
			// update planting visual
			
			this.update_visual();
			
		}
		
	}
	
	/*===================================================
	
	plant position
	
	=====================================================*/
	
	function position_plant () {
		
		var plant = this.plant,
			module = this.module,
			mouse = this.mouse,
			matrix,
			position;
		
		// if plant valid
		
		if ( plant instanceof _Plant.Instance ) {
			
			// snap to module when possible
			
			if ( module instanceof _GridModule.Instance ) {
				
				_ObjectHelper.object_follow_object( plant, module );
				
			}
			// else follow mouse 
			else {
				
				matrix = this.farming.character.matrixWorld;
				
				position = matrix.getPosition();
				
				plant.position.copy( position );
				
			}
			
			console.log('plant.position:', plant.position.x.toFixed(2), plant.position.y.toFixed(2), plant.position.z.toFixed(2) );
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
		else if ( this.started === true && this.rotating !== true ) {
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
			
			plant.rotate_by( rotation );
			
			// if rotation made
			
			if ( rotationAbs >= 90 ) {
				
				// update planting
				
				this.update( true, true );
				
			}
			
		}
		
		// if direction change counters are over threshold, reset totals
			
		if ( rotationAbs >= 90 || pr.dcx/* + pr.dcy */ >= pr.dirChangeThreshold ) {
			
			this.reset_rotate_plant();
			
		}
		
	}
	
} (KAIOPUA) );