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
		_Puzzle,
		_Planting,
		_Field,
		_Character,
		_Player,
		_GUI,
		_Button,
		_Menu,
		farmers = [];
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Farming,
		requirements: [
			"assets/modules/core/Game.js",
			"assets/modules/puzzles/Puzzle.js",
			"assets/modules/farming/Planting.js",
			"assets/modules/farming/Field.js",
			"assets/modules/characters/Character.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal( g, pzl, pl, f, c ) {
		console.log('internal farming', _Farming);
		
		_Game = g;
		_Puzzle = pzl;
		_Planting = pl;
		_Field = f;
		_Character = c;
		
		// properties
		
		_Farming.plantParameters = {};
		
		Object.defineProperty( _Farming.plantParameters, 'rock', { 
			get: function () {
				
				return {
					seed: {
						image: shared.pathToIcons + 'rock_64.png'
					},
					geometry: "assets/models/Rock.js",
					layout: [ [ 1 ] ]
				};
			
			}
		});
		
		Object.defineProperty( _Farming.plantParameters, 'taro', { 
			get: function () {
				
				return {
					seed: {
						image: shared.pathToIcons + 'taro_64.png'
					},
					geometry: "assets/models/Taro_Plant.js",
					layout: [ [ 1 ] ]
				};
			
			}
		});
		
		// functions
		
		_Farming.plant = plant;
		_Farming.is_character_planting = is_character_planting;
		
		// ui
		
		main.asset_require( [
				"assets/modules/core/Player.js",
				"assets/modules/ui/GUI.js",
				"assets/modules/ui/Button.js",
				"assets/modules/ui/Menu.js"
			],
			init_farming_ui,
			true
		);
	}
	
	/*===================================================
	
	ui
	
	=====================================================*/
	
	function init_farming_ui( p, gui, btn, mn ) {
		console.log('internal farming ui');
		var b, m;
		
		_Player = p;
		_GUI = gui;
		_Button = btn;
		_Menu = mn;
		
		b = _GUI.buttons;
		m = _GUI.menus;
		
		// menu
		
		this.menu = m.farming = new _Menu.Instance( {
            id: 'farming',
			openAlone: false
        } );
		
		m.farming.buttonOpen = new _Button.Instance( {
			id: 'open',
			image: shared.pathToIcons + 'farming_64.png',
			imageSize: _GUI.sizes.iconMedium,
			size: _GUI.sizes.iconMediumContainer,
			tooltip: 'Farming',
			spacing: _GUI.sizes.buttonSpacing,
			circle: true
		} );
		
		m.farming.buttonClose = _GUI.generate_button_close();
		m.farming.buttonClose.alignment = 'topleft';
		m.farming.buttonClose.alignmentGuide = m.farming.buttonOpen;
		m.farming.buttonClose.spacingLeft = -m.farming.buttonClose.width;
		
		m.farming.add(
			new _Button.Instance( {
				id: 'rock',
				image: shared.pathToIcons + 'rock_64.png',
				imageSize: _GUI.sizes.iconMedium,
				size: _GUI.sizes.iconMediumContainer,
				tooltip: 'Rock',
				spacing: _GUI.sizes.buttonSpacing,
				circle: true,
				theme: 'green',
				callback: plant_from_ui,
				context: _Farming,
				data: 'rock'
			} ),
			new _Button.Instance( {
				id: 'taro',
				image: shared.pathToIcons + 'taro_64.png',
				imageSize: _GUI.sizes.iconMedium,
				size: _GUI.sizes.iconMediumContainer,
				tooltip: 'Taro',
				spacing: _GUI.sizes.buttonSpacing,
				circle: true,
				theme: 'green',
				callback: plant_from_ui,
				context: _Farming,
				data: 'taro'
			} ),
			new _Button.Instance( {
				id: 'tarodouble',
				image: shared.pathToIcons + 'taro_double_64.png',
				imageSize: _GUI.sizes.iconMedium,
				size: _GUI.sizes.iconMediumContainer,
				tooltip: 'Two-headed Taro',
				spacing: _GUI.sizes.buttonSpacing,
				circle: true,
				theme: 'green'
			} ),
			new _Button.Instance( {
				id: 'tarotriple',
				image: shared.pathToIcons + 'taro_triple_64.png',
				imageSize: _GUI.sizes.iconMedium,
				size: _GUI.sizes.iconMediumContainer,
				tooltip: 'Triple Taro',
				spacing: _GUI.sizes.buttonSpacing,
				circle: true,
				theme: 'green'
			} )
		);
		
		m.farming.arrange_line( {
			childrenPerLine: 5
		} );
		
		m.farming.alignmentOpen = 'lefttop';
		m.farming.alignmentClosed = false;
		m.farming.alignmentGuide = m.farming.buttonOpen;
		m.farming.alignmentOutside = true;
		
		m.navigation.add( m.farming, 0 );
		
	}
	
	function plant_from_ui ( plantType ) {
		
		plant( _Player.character, { plant: _Farming.plantParameters[ plantType ] } );
		
	}
	
	/*===================================================
	
	planting
	
	=====================================================*/
	
	function plant ( character, parameters ) {
		
		var i, l,
			farmer,
			planting,
			index = -1;
		
		// if character passed
		
		if ( character instanceof _Character.Instance ) {
			
			// if character on farmer list
			
			index = main.index_of_object_with_property_value( farmers, 'character', character );
			
			// create new farmer
			
			if ( index === -1 ) {
				
				farmer = {
					character: character,
					planting: new _Planting.Instance( character )
				};
				
				farmers.push( farmer );
				
			}
			// or use existing
			else {
				
				farmer = farmers[ index ];
				
			}
			
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
		
		// if character passed
		
		if ( character instanceof _Character.Instance ) {
			
			// if character on farmer list
			
			index = main.index_of_object_with_property_value( farmers, 'character', character );
			
			// if character on farmer list
			
			if ( index !== -1 ) {
				
				farmer = farmers[ index ];
				
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
			
		}
		
		return result;
		
	}
	
} (KAIOPUA) );