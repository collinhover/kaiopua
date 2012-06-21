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
		_GUI,
		_Messenger,
		_UIElement,
		_Button,
		_Menu,
		farmers = [],
		plantsWaitingForUI = [];
	
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
		
		Object.defineProperty( _Farming, 'plantTypesBase', { 
			get: function () {
				
				return [ 'SHAPE_3x3_000010000', 'SHAPE_3x3_010011000', 'SHAPE_3x3_010111000' ];
			
			}
		} );
		
		// reset
		
		_Farming.reset();
		
		shared.signals.gamestop.add( _Farming.reset, _Farming );
		
		// ui
		
		main.asset_require( [
				"assets/modules/core/Player.js",
				"assets/modules/ui/GUI.js",
				"assets/modules/ui/Messenger.js",
				"assets/modules/ui/UIElement.js",
				"assets/modules/ui/Button.js",
				"assets/modules/ui/Menu.js"
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
				
				// remove all non-starter plants
				
				for ( j = 0, k = _Farming.plantTypesBase.length; j < k; j++ ) {
					
					index = plantsToRemove.indexOf( _Farming.plantTypesBase[ j ] );
					
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
	
	function init_farming_ui( p, gui, msg, uie, btn, mn ) {
		console.log('internal farming ui');
		var i, l,
			b, m;
		
		_Player = p;
		_GUI = gui;
		_Messenger = msg;
		_UIElement = uie;
		_Button = btn;
		_Menu = mn;
		
		b = _GUI.buttons;
		m = _GUI.menus;
		
		// menu
		
		_Farming.menu = m.farming = new _Menu.Instance( {
            id: 'farming',
			openAlone: false
        } );
		
		_Farming.menu.buttonOpen = new _Button.Instance( {
			id: 'open',
			image: shared.pathToIcons + 'farming_64.png',
			imageSize: _UIElement.sizes.iconMedium,
			size: _UIElement.sizes.iconMediumContainer,
			tooltip: 'Farming',
			spacing: _UIElement.sizes.spacing,
			circle: true
		} );
		
		_Farming.menu.buttonClose = _GUI.generate_button_close();
		_Farming.menu.buttonClose.alignment = 'topleft';
		_Farming.menu.buttonClose.alignmentGuide = _Farming.menu.buttonOpen;
		_Farming.menu.buttonClose.spacingLeft = -_Farming.menu.buttonClose.width;
		
		_Farming.menu.arrange_line( {
			childrenPerLine: 5
		} );
		
		_Farming.menu.alignmentOpen = 'lefttop';
		_Farming.menu.alignmentClosed = false;
		_Farming.menu.alignmentGuide = _Farming.menu.buttonOpen;
		_Farming.menu.alignmentOutside = true;
		
		m.navigation.add( _Farming.menu, 0 );
		
		// create farmer for player
		
		generate_farmer( _Player.character );
		
		// reset
		
		reset_farming_ui();
		
		// handle plants waiting for UI
		
		for ( i = 0, l = plantsWaitingForUI.length; i < l; i++ ) {
			
			add_plant_to_ui( plantsWaitingForUI[ i ] );
			
		}
		
	}
	
	function reset_farming_ui () {
		
		var i, l,
			farmer,
			planting,
			bindings,
			binding;
			
		if ( typeof _Farming.menu !== 'undefined' && typeof _Player !== 'undefined' ) {
			
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
			
			// add basic hint bindings
			
			bindings.push( planting.planted.addOnce( function () {
				
				_Messenger.show_message( {
					image: shared.pathToIcons + "mouse_left_rev_64.png",
					title: "Planting Basics: Selecting",
					body: "You can <span class='highlight'>select and move</span> plants you've already planted with a <span class='highlight'>single click.</span>",
					priority: true,
					transitionerOpacity: 0.9,
					confirmRequired: true
				} );
				
			} ) );
			
			bindings.push( planting.plantedMulti.addOnce( function () {
				
				_Messenger.show_message( {
					image: shared.pathToIcons + "rotate_rev_64.png",
					title: "Planting Basics: Rotating",
					body: "To <span class='highlight'>rotate</span> a plant, first select it, then <span class='highlight'>hold click and drag.</span>",
					priority: true,
					transitionerOpacity: 0.9,
					confirmRequired: true
				} );
				
			} ) );
			
			bindings.push( planting.selected.addOnce( function () {
				
				_Messenger.show_message( { 
					image: shared.pathToIcons + "close_rev_64.png",
					title: "Planting Basics: Removing",
					body: "If you want to <span class='highlight'>remove</span> a plant, first select it, then <span class='highlight'>click it outside any field.</span>",
					priority: true,
					transitionerOpacity: 0.9,
					confirmRequired: true
				} );
				
			} ) );
			
		}
		
	}
	
	function add_plant_to_ui ( plantType ) {
		
		var b,
			m,
			shapeParameters,
			type,
			image,
			tooltip,
			button;
		
		// is ui ready
		
		if ( typeof _Farming.menu !== 'undefined' ) {
			
			b = _GUI.buttons;
			m = _GUI.menus;
			
			// valid plant type
			
			if ( _GridElementShapes.hasOwnProperty( plantType ) ) {
				
				// if exists, remove
				
				if ( _Farming.menu.childrenByID.hasOwnProperty( plantType ) ) {
					
					remove_plant_from_ui( plantType );
					
				}
				
				// create new
				
				shapeParameters = _GridElementShapes[ plantType ];
				
				button = new _Button.Instance( {
					id: plantType,
					image: shapeParameters.icon.image || shared.pathToIcons + 'plant_64.png',
					imageSize: _UIElement.sizes.iconMedium,
					size: _UIElement.sizes.iconMediumContainer,
					tooltip: shapeParameters.icon.tooltip,
					spacing: _UIElement.sizes.spacing,
					circle: true,
					theme: 'green',
					callback: plant_from_ui,
					context: _Farming,
					data: plantType
				} );
				
				_Farming.menu.add( button );
				
				// if not starter plant, show indicator
				
				if ( _Farming.plantTypesBase.indexOf( plantType ) === -1 ) {
					
					button.indicator = true;
					
				}
				
			}
			
		}
		// else add to waiting list
		else {
			
			plantsWaitingForUI = plantsWaitingForUI || [];
			
			if ( plantsWaitingForUI.indexOf( plantType ) === -1 ) {
				
				plantsWaitingForUI.push( plantType );
				
			}
			
		}
		
	}
	
	function remove_plant_from_ui ( plantType ) {
		
		var b,
			m,
			index,
			plantButton,
			type,
			image,
			tooltip,
			button;
		
		// is ui ready
		
		if ( typeof _Farming.menu !== 'undefined' ) {
			
			b = _GUI.buttons;
			m = _GUI.menus;
			
			// if plant in menu
			
			if ( _Farming.menu.childrenByID.hasOwnProperty( plantType ) ) {
				
				plantButton = _Farming.menu.childrenByID[ plantType ];
				
				plantButton.indicator = false;
				
				plantButton.hide( { remove: true, time: 0 } );
				
			}
			
		}
		// else if on waiting list
		else if ( main.type( plantsWaitingForUI ) === 'array' && plantsWaitingForUI.length > 0 ) {
			
			index = plantsWaitingForUI.indexOf( plantType );
			
			if ( index !== -1 ) {
				
				plantsWaitingForUI.splice( index, 1 );
				
			}
			
		}
		
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
				
				// give starter plants
				
				give_plants( _Farming.plantTypesBase, character );
				
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