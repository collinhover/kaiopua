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
		_GridElementShapes,
		_Planting,
		_Character,
		_Player,
		_Messenger,
		farmers = [];
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Farming,
		requirements: [
			"assets/modules/puzzles/GridElementShapes.js",
			"assets/modules/farming/Planting.js",
			"assets/modules/characters/Character.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal( ges, pl, c ) {
		console.log('internal farming', _Farming);
		
		_GridElementShapes = ges;
		_Planting = pl;
		_Character = c;
		
		// functions
		
		_Farming.reset = reset;
		_Farming.plant = plant;
		_Farming.get_farmer_by_character = get_farmer_by_character;
		_Farming.is_character_planting = is_character_planting;
		_Farming.give_plants = give_plants;
		_Farming.remove_plants = remove_plants;
		
		Object.defineProperty( _Farming, 'plantShapesBase', { 
			get: function () {
				
				return [ 'MONOMINO', 'DOMINO', 'TROMINO_L' ];
			
			}
		} );
		
		// reset
		
		_Farming.reset();
		
		shared.signals.gameStopped.add( _Farming.reset, _Farming );
		
		// ui
		
		main.asset_require( [
				"assets/modules/core/Player.js",
				"assets/modules/ui/Messenger.js"
			],
			init_farming_ui,
			true
		);
	}
	
	/*===================================================
	
	reset
	
	=====================================================*/
	
	function reset () {
		
		var i, l,
			j, k,
			character,
			index,
			farmer,
			plants,
			plantsToRemove;
		
		// for each farmer
		
		for ( i = 0, l = farmers.length; i < l; i++ ) {
			
			// get farmer
			
			character = character instanceof _Character.Instance ? character : _Player.character;
			
			index = main.index_of_object_with_property_value( farmers, 'character', character );
			
			if ( index !== -1 ) {
				
				farmer = farmers[ index ];
				
				// reset planting
				
				farmer.planting.reset();
				
				// handle plants
				
				plants = farmer.plants || [];
				
				// copy farmer plants
				
				plantsToRemove = plants.slice( 0 );
				
				// remove all non-starter plant shapes
				
				for ( j = 0, k = _Farming.plantShapesBase.length; j < k; j++ ) {
					
					index = plantsToRemove.indexOf( _Farming.plantShapesBase[ j ] );
					
					if ( index !== -1 ) {
						
						plantsToRemove.splice( index, 1 );
						
					}
					
				}
				
				remove_plants( plantsToRemove, character );
				
			}
			
		}
		
		// ui
		
		reset_farming_ui();
		
	}
	
	/*===================================================
	
	ui
	
	=====================================================*/
	
	function init_farming_ui( p, msg ) {
		console.log('internal farming ui');
		var i, l,
			b, m;
		
		_Player = p;
		_Messenger = msg;
		
		// create farmer for player
		
		generate_farmer( _Player.character );
		
		// reset
		
		reset_farming_ui();
		
	}
	
	function reset_farming_ui () {
		
		var i, l,
			farmer,
			planting,
			bindings,
			binding;
			
		if ( typeof _Player !== 'undefined' ) {
			
			// get player farmer
			
			farmer = get_farmer_by_character( _Player.character, true );
			planting = farmer.planting;
			
			// init bindings list
			
			bindings = farmer.bindings = farmer.bindings || [];
			
			// remove existing hint bindings
			
			for ( i = 0, l = bindings.length; i < l; i++ ) {
				
				binding = bindings[ i ];
				
				binding.detach();
				
			}
			
			// TODO: add basic hint bindings
			
			bindings.push( planting.planted.addOnce( function () {
				/*
				_Messenger.show_message( {
					image: shared.pathToIcons + "tap_rev_128.png",
					title: "Planting Basics: Selecting",
					body: "You can <span class='highlight'>select</span> plants you've already planted with a <span class='highlight'>single tap.</span>",
					priority: true,
					transitionerOpacity: 0.9,
					confirmRequired: true
				} );
				*/
			} ) );
			
			bindings.push( planting.planted.addOnce( function () {
				/*
				_Messenger.show_message( {
					image: shared.pathToIcons + "tap_rev_128.png",
					title: "Planting Basics: Selecting",
					body: "To <span class='highlight'>move</span> a plant, change into move mode, then <span class='highlight'>tap, hold, and drag</span> in any direction.",
					priority: true,
					transitionerOpacity: 0.9,
					confirmRequired: true
				} );
				*/
			} ) );
			
			bindings.push( planting.plantedMulti.addOnce( function () {
				/*
				_Messenger.show_message( {
					image: shared.pathToIcons + "rotate_rev_64.png",
					title: "Planting Basics: Rotating",
					body: "To <span class='highlight'>rotate</span> a plant, change into rotate mode, then <span class='highlight'>tap, hold, and drag</span> in circles.",
					priority: true,
					transitionerOpacity: 0.9,
					confirmRequired: true
				} );
				*/
			} ) );
			
			bindings.push( planting.selected.addOnce( function () {
				/*
				_Messenger.show_message( { 
					image: shared.pathToIcons + "close_rev_64.png",
					title: "Planting Basics: Removing",
					body: "To <span class='highlight'>delete</span> a plant, <span class='highlight'>double tap it</span> or move and drop it outside of the field.",
					priority: true,
					transitionerOpacity: 0.9,
					confirmRequired: true
				} );
				*/
			} ) );
			
		}
		
	}
	
	function add_plant_to_ui ( plantType ) {
		
		var shapeParameters;
		
		// valid plant type
		
		if ( _GridElementShapes.hasOwnProperty( plantType ) ) {
			
			// if exists, remove
			
			// create new
			
			shapeParameters = _GridElementShapes[ plantType ];
			
			// add to menu
			
			
			// if not starter plant, show indicator
			
		}
		
	}
	
	function remove_plant_from_ui ( plantType ) {
		
		// remove if plant in menu
		
	}
	
	function plant_from_ui ( plantType ) {
		
		plant( _Player.character, { plant: _GridElementShapes[ plantType ] } );
		
	}
	
	/*===================================================
	
	farmers
	
	=====================================================*/
	
	function get_farmer_by_character( character, createFor ) {
		
		var farmer,
			index;
		
		if ( character instanceof _Character.Instance ) {
			
			// if character on farmer list
			
			index = main.index_of_object_with_property_value( farmers, 'character', character );
			
			// if found, use existing
			
			if ( index !== -1 ) {
				
				farmer = farmers[ index ];
				
			}
			// else if allowed to create for character
			else if ( createFor === true ) {
				
				farmer = generate_farmer( character );
				
			}
			
		}
		
		return farmer;
		
	}
	
	function generate_farmer ( character ) {
		
		var farmer;
		
		if ( character instanceof _Character.Instance ) {
			
			// if character on farmer list
			
			index = main.index_of_object_with_property_value( farmers, 'character', character );
			
			// create new
			
			if ( index === -1 ) {
				
				farmer = {
					character: character,
					planting: new _Planting.Instance( character ),
					plants: []
				};
				
				farmers.push( farmer );
				
				// give starter plant shapes
				
				give_plants( _Farming.plantShapesBase, character );
				
			}
			// if found, use existing
			else {
				
				farmer = farmers[ index ];
				
			}
			
		}
		
		return farmer;
		
	}
	
	/*===================================================
	
	planting
	
	=====================================================*/
	
	function plant ( character, parameters ) {
		
		var i, l,
			farmer,
			planting,
			index = -1;
		
		// get farmer
		
		farmer = _Farming.get_farmer_by_character( character, true );
		
		if ( farmer ) {
			
			// get planting
			
			planting = farmer.planting;
			
			// step planting cycle
			
			planting.step( parameters );
			
		}
		
	}
	
	function is_character_planting ( character, property ) {
		
		var i, l,
			farmer,
			planting,
			result = false,
			index = -1;
			
		// get farmer
		
		farmer = _Farming.get_farmer_by_character( character );
		
		if ( farmer ) {
			
			// get planting
			
			planting = farmer.planting;
			
			// check planting cycle
			
			if ( planting.hasOwnProperty( property ) ) {
				
				result = planting[ property ];
				
			}
			else {
				
				result = planting.started || planting.rotating;
				
			}
			
		}
		
		return result;
		
	}
	
	/*===================================================
	
	add plants
	
	=====================================================*/
	
	function give_plants ( plantTypes, character ) {
		
		var i, l,
			plantType,
			index,
			farmer,
			plants;
		
		plantTypes = main.ensure_array( plantTypes );
		
		// get farmer
		
		character = character instanceof _Character.Instance ? character : _Player.character;
		
		index = main.index_of_object_with_property_value( farmers, 'character', character );
		
		if ( index !== -1 ) {
			
			farmer = farmers[ index ];
			
			plants = farmer.plants = farmer.plants || [];
			
			// for each plant type
			
			for ( i = 0, l = plantTypes.length; i < l; i++ ) {
				
				plantType = plantTypes[ i ];
				
				// valid plant type
				
				if ( _GridElementShapes.hasOwnProperty( plantType ) ) {
					
					// if doesn't have plant yet
					
					if ( plants.indexOf( plantType ) === -1 ) {
						
						plants.push( plantType );
						
						// if is player
						
						if ( character === _Player.character ) {
							
							add_plant_to_ui( plantType );
							
						}
						
					}
					
				}
				
			}
			
		}
		
	}
	
	function remove_plants ( plantTypes, character ) {
		
		var i, l,
			plantType,
			index,
			farmer,
			plants;
		
		plantTypes = main.ensure_array( plantTypes );
		
		// get farmer
		
		character = character instanceof _Character.Instance ? character : _Player.character;
		
		index = main.index_of_object_with_property_value( farmers, 'character', character );
		
		if ( index !== -1 ) {
			
			farmer = farmers[ index ];
			
			plants = farmer.plants = farmer.plants || [];
			
			// for each plant type
			
			for ( i = 0, l = plantTypes.length; i < l; i++ ) {
				
				plantType = plantTypes[ i ];
					
				// if has type
				
				index = plants.indexOf( plantType );
				
				if ( index !== -1 ) {
					
					plants.splice( index, 1 );
					
					// if is player
					
					if ( character === _Player.character ) {
						
						remove_plant_from_ui( plantType );
						
					}
					
				}
				
			}
			
		}
		
	}
	
} (KAIOPUA) );