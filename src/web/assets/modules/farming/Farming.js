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
		assetPath = "assets/modules/farming/Farming.js",
		_Farming = {},
		_Game,
		_Puzzles,
		_Planting,
		_Field;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Farming,
		requirements: [
			"assets/modules/core/Game.js",
			"assets/modules/puzzles/Puzzles.js",
			"assets/modules/farming/Planting.js",
			"assets/modules/farming/Field.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal( g, pzl, pl, f ) {
		console.log('internal farming', _Farming);
		
		_Game = g;
		_Puzzles = pzl;
		_Planting = pl;
		_Field = f;
		
		_Farming.Instance = Farming;
		
		_Farming.Instance.prototype.plant = plant;
		
		_Farming.Instance.prototype.change_field = change_field;
		_Farming.Instance.prototype.clean_field = clean_field;
		
	}
	
	/*===================================================
    
    farming
    
    =====================================================*/
	
	function Farming ( character ) {
		
		var planting;
		
		// store character ref
		
		this.character = character;
		
		// planting
		
		this.planting = new _Planting.Instance( this );
		
	}
	
	/*===================================================
	
	planting
	
	=====================================================*/
	
	function plant ( parameters ) {
		
		// handle parameters
		
		if ( _Game.is_stop_parameter( parameters ) ) {
			
			// stop planting cycle
			
			this.planting.stop();
			
		}
		else {
			
			// store mouse
			
			this.planting.mouse = _Game.get_mouse( this.planting.event );
			
			// step planting cycle
			
			this.planting.step();
			
		}
		
		return this.planting.started;
		
	}
	
	/*===================================================
	
	fields
	
	=====================================================*/
	
	function change_field ( field ) {
		
		// if new field
		
		if ( this.field !== field ) {
			
			// clear previous field
			
			this.clean_field();
			
			// store new field
			
			this.field = field;
			
		}
		
	}
	
	function clean_field ( field, module ) {
		
		field = field || this.field;
		
		if ( field instanceof _Puzzles.Instance ) {
			
			field.grid.each_module( function () {
				this.show_state( false );
			}, module );
			
		}
		
	}
	
} (KAIOPUA) );