/*
 *
 * GUI.js
 * Game user interface.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/ui/GUI.js",
		_GUI = {},
		_UIElement,
		_Button,
		_Menu;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _GUI,
		requirements: [
			"assets/modules/ui/UIElement.js",
			"assets/modules/ui/Button.js",
			"assets/modules/ui/Menu.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( uie, btn, mn ) {
		console.log('internal gui', _GUI);
		
		_UIElement = uie;
		_Button = btn;
		_Menu = mn;
		
		// properties
		_GUI.sizes = {};
		_GUI.sizes.buttonLarge = 300;
		_GUI.sizes.buttonMedium = 160;
		_GUI.sizes.buttonSmall = 100;
		_GUI.sizes.iconLargeContainer = 100;
		_GUI.sizes.iconMediumContainer = 60;
		_GUI.sizes.iconSmallContainer = 40;
		_GUI.sizes.iconLarge = 64;
		_GUI.sizes.iconMedium = 32;
		_GUI.sizes.iconSmall = 16;
		_GUI.sizes.buttonSpacing = 10;
		
		_GUI.active = [];
		_GUI.groups = {};
		_GUI.groupsNames = [];
		
		// functions
		
		_GUI.generate_button_back = generate_button_back;
		_GUI.generate_button_close = generate_button_close;
		
		_GUI.show_group = show_group;
		_GUI.hide_group = hide_group;
		
		_GUI.add_to_group = add_to_group;
		_GUI.remove_from_group = remove_from_group;
		_GUI.clean_groups = clean_groups;
		
		_GUI.fullscreen_api = ( function () {
			
			var fullScreenApi = { 
					supportsFullScreen: false,
					isFullScreen: function() { return false; }, 
					requestFullScreen: function() {}, 
					cancelFullScreen: function() {},
					fullScreenEventName: '',
					prefix: ''
				},
				browserPrefixes = 'webkit moz o ms khtml'.split(' ');
			
			// check for native support
			if (typeof document.cancelFullScreen != 'undefined') {
				fullScreenApi.supportsFullScreen = true;
				
			} else {	 
				// check for fullscreen support by vendor prefix
				for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
					fullScreenApi.prefix = browserPrefixes[i];
					
					if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
						fullScreenApi.supportsFullScreen = true;
						
						break;
					}
				}
			}
			
			// update methods to do something useful
			if (fullScreenApi.supportsFullScreen) {
				fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';
				
				fullScreenApi.isFullScreen = function() {
					switch (this.prefix) {	
						case '':
							return document.fullScreen;
						case 'webkit':
							return document.webkitIsFullScreen;
						default:
							return document[this.prefix + 'FullScreen'];
					}
				}
				fullScreenApi.requestFullScreen = function(el) {
					return (this.prefix === '') ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
				}
				fullScreenApi.cancelFullScreen = function(el) {
					return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
				}		
			}
			
			return fullScreenApi;
			
		} () );
		
		// init
		
		init_core();
		
		init_layers();
		
		init_buttons();
		
		init_menus();
		
		// build
		
		build_gui();
		
	}
	
	/*===================================================
    
    close / back
    
    =====================================================*/
	
	function generate_button_back () {
		
		var button = new _Button.Instance( {
			id: 'close',
			image: shared.pathToIcons + 'undo_64.png',
			imageSize: _GUI.sizes.iconSmall,
			width: _GUI.sizes.iconSmallContainer,
			tooltip: 'Go Back',
			spacing: _GUI.sizes.buttonSpacing,
			spacingRight: -_GUI.sizes.iconMediumContainer - _GUI.sizes.iconSmallContainer - _GUI.sizes.buttonSpacing,
			alignment: 'rightcenter',
			circle: true
		} );
		
		return button;
		
	}
	
	function generate_button_close () {
		
		var button = new _Button.Instance( {
			id: 'close',
			image: shared.pathToIcons + 'undo_64.png',
			imageSize: _GUI.sizes.iconMedium,
			width: _GUI.sizes.iconMediumContainer,
			tooltip: 'Close',
			spacing: _GUI.sizes.buttonSpacing,
			circle: true
		} );
		
		return button;
		
	}
	
	/*===================================================
    
    core
    
    =====================================================*/
	
	function init_core () {
		
		// container
		
		_GUI.container = new _UIElement.Instance( { 
			domElement: shared.html.gameContainer,
			fullwindow: true
		} );
		
		// transitioner
		
        _GUI.transitioner = new _UIElement.Instance( {
			id: 'transitioner',
			cssmap: {
				"background-color" : "#333333"
			},
			fullwindow: true,
			timeShow: 500,
			timeHide: 500,
			opacityShow: 0.75
        } );
		
	}
	
	/*===================================================
    
    layers
    
    =====================================================*/
	
	function init_layers() {
		
		var l = _GUI.layers = {};
		
		l.display = new _UIElement.Instance( {
			id: 'layer_display',
			fullwindow: true
        } );
		
		l.ui = new _UIElement.Instance( {
			id: 'layer_ui',
			pointerEvents: false,
			fullwindow: true
        } );
		
		l.overlayDisplay = new _UIElement.Instance( {
			id: 'layer_overlayDisplay',
			pointerEvents: false,
			fullwindow: true
        } );
		
		l.overlayAll = new _UIElement.Instance( {
			id: 'layer_overlayAll',
			pointerEvents: false,
			fullwindow: true
        } );
		
		l.errors = new _UIElement.Instance( { 
			domElement: shared.html.errorContainer,
			pointerEvents: false,
			fullwindow: true
		} );
		
	}
	
	/*===================================================
    
    buttons
    
    =====================================================*/
	
	function init_buttons() {
		
		var b = _GUI.buttons = {};
		
		// fullscreen disabled until allows alphanumeric input
		
		b.fullscreenEnter = new _Button.Instance( {
			id: 'fullscreenEnter',
			image: shared.pathToIcons + 'fullscreen_32.png',
			imageSize: _GUI.sizes.iconSmall,
			size: _GUI.sizes.iconSmallContainer,
			tooltip: 'Fullscreen',
			spacing: _GUI.sizes.buttonSpacing,
			circle: true,
			callback: fullscreen_enter,
			context: this,
			alignment: 'bottomright',
			enabled: false
		} );
		
		b.fullscreenEnter.hide( { remove: true, time: 0 } );
	
		b.fullscreenExit = new _Button.Instance( {
			id: 'fullscreenExit',
			image: shared.pathToIcons + 'fullscreen_exit_32.png',
			imageSize: _GUI.sizes.iconSmall,
			size: _GUI.sizes.iconSmallContainer,
			tooltip: 'Exit Fullscreen',
			spacing: _GUI.sizes.buttonSpacing,
			circle: true,
			callback: fullscreen_exit,
			context: this,
			alignment: 'bottomright',
			enabled: false
		} );
	
		b.fullscreenExit.hide( { remove: true, time: 0 } );
		
		
		b.end = new _Button.Instance( {
			id: 'end',
			image: shared.pathToIcons + 'confirm_64.png',
			imageSize: _GUI.sizes.iconMedium,
			size: _GUI.sizes.iconMediumContainer,
			tooltip: 'Really Quit?',
			spacing: _GUI.sizes.buttonSpacing,
			circle: true
		} );
		
		b.save = new _Button.Instance( {
			id: 'save',
			image: shared.pathToIcons + 'save_64.png',
			imageSize: _GUI.sizes.iconMedium,
			size: _GUI.sizes.iconMediumContainer,
			tooltip: 'Save progress',
			spacing: _GUI.sizes.buttonSpacing,
			circle: true,
			enabled: false
		} );
		
		b.load = new _Button.Instance( {
			id: 'load',
			image: shared.pathToIcons + 'load_64.png',
			imageSize: _GUI.sizes.iconMedium,
			size: _GUI.sizes.iconMediumContainer,
			tooltip: {
				content: 'Load a saved game',
				contentDisabled: '(no save found!)'
			},
			spacing: _GUI.sizes.buttonSpacing,
			circle: true,
			enabled: false
		} );
		
		b.mainMenu = new _Button.Instance( {
			id: 'mainMenu',
			image: shared.pathToIcons + 'computer_alt_64.png',
			imageSize: _GUI.sizes.iconMedium,
			size: _GUI.sizes.iconMediumContainer,
			tooltip: 'Main Menu',
			spacing: _GUI.sizes.buttonSpacing,
			circle: true
		} );
	
		b.companionMenu = new _Button.Instance( {
			id: 'companionMenu',
			image: shared.pathToIcons + 'companion_64.png',
			imageSize: _GUI.sizes.iconMedium,
			size: _GUI.sizes.iconMediumContainer,
			tooltip: 'Companions!',
			spacing: _GUI.sizes.buttonSpacing,
			circle: true,
			enabled: false
		} );
		
		b.houseMenu = new _Button.Instance( {
			id: 'houseMenu',
			image: shared.pathToIcons + 'home_64.png',
			imageSize: _GUI.sizes.iconMedium,
			size: _GUI.sizes.iconMediumContainer,
			tooltip: 'House Parts',
			spacing: _GUI.sizes.buttonSpacing,
			circle: true,
			enabled: false
		} );
		
		b.map = new _Button.Instance( {
			id: 'map',
			image: shared.pathToIcons + 'whale_64.png',
			imageSize: _GUI.sizes.iconMedium,
			size: _GUI.sizes.iconMediumContainer,
			tooltip: 'Map',
			spacing: _GUI.sizes.buttonSpacing,
			circle: true,
			enabled: false
		} );
		
	}
	
	/*===================================================
    
    menus
    
    =====================================================*/
	
	function init_menus() {
		
		var m = _GUI.menus = {};
		
		// init
		
		m.start = new _Menu.Instance( {
            id: 'start'
        } );
		
		m.main = new _Menu.Instance( {
            id: 'main'
        } );
		
		m.options = new _Menu.Instance( {
            id: 'options'
        } );
		
		m.navigation = new _Menu.Instance( {
			id: 'navigation'
		} );
		
		m.end = new _Menu.Instance( {
			id: 'end'
		} );
		
		m.footer = new _UIElement.Instance( { 
			domElement: shared.html.footerMenu
		} );
		
	}
	
	function build_start_menu () {
		
		var m = _GUI.menus,
			b = _GUI.buttons;
		
		m.start.hide( { remove: true, time: 0 } );
	
		m.start.add( 
			new _Button.Instance( {
				id: 'play',
				text: 'Play!',
				theme: 'white',
				size: _GUI.sizes.buttonMedium,
				spacing: _GUI.sizes.buttonSpacing,
				circle: true,
				cssmap: {
					'font-size' : "30px",
					'font-family' : "'CoustardRegular', Georgia, serif"
				},
				alignment: 'center'
			} ),
			b.load,
			m.options
		);
		
		m.start.childrenAlwaysVisible.push( m.start.childrenByID.play );
		
		m.start.arrange_circle( {
			degrees: 360,
			radius: _GUI.sizes.buttonMedium + _GUI.sizes.buttonSpacing
		} );
		
	}
	
	function build_main_menu () {
		
		var m = _GUI.menus,
			b = _GUI.buttons;
		
		m.main.hide( { remove: true, hide: 0 } );
		
		m.main.add( 
			new _Button.Instance( {
				id: 'resume',
				text: 'Resume',
				width: _GUI.sizes.buttonMedium,
				spacing: _GUI.sizes.buttonSpacing,
				circle: true,
				cssmap: {
					'font-size' : "30px",
					'font-family' : "'CoustardRegular', Georgia, serif"
				},
				alignment: 'center'
			} ),
			b.save,
			b.load,
			m.options,
			m.end
		);
		
		m.main.childrenAlwaysVisible.push( m.main.childrenByID.resume );
		
		m.main.arrange_circle( {
			degrees: 360,
			radius: _GUI.sizes.buttonMedium + _GUI.sizes.buttonSpacing
		} );
	
	}
	
	function build_navigation_menu () {
		
		var m = _GUI.menus,
			b = _GUI.buttons;
		
		m.navigation.hide( { remove: true, hide: 0 } );
		
		m.navigation.add(
			b.companionMenu,
			b.houseMenu,
			b.map,
			b.mainMenu, 9999
		);
		
		m.navigation.arrange_line();
		
	}
	
	function build_options_menu () {
		
		var m = _GUI.menus;
		
		m.options.buttonOpen = new _Button.Instance( {
			id: 'open',
			image: shared.pathToIcons + 'cog_64.png',
			imageSize: _GUI.sizes.iconMedium,
			size: _GUI.sizes.iconMediumContainer,
			tooltip: 'Options',
			spacing: _GUI.sizes.buttonSpacing,
			circle: true
		} );
		
		m.options.buttonClose = _GUI.generate_button_back();
		
		m.options.add(
			new _Button.Instance( {
				id: 'quality',
				theme: 'white',
				image: shared.pathToIcons + 'computer_64.png',
				imageSize: _GUI.sizes.iconMedium,
				size: _GUI.sizes.iconMediumContainer,
				tooltip: 'Quality',
				spacing: _GUI.sizes.buttonSpacing,
				circle: true,
				enabled: false
			} ),
			new _Button.Instance( {
				id: 'keybindings',
				theme: 'white',
				image: shared.pathToIcons + 'keyboard_64.png',
				imageSize: _GUI.sizes.iconMedium,
				size: _GUI.sizes.iconMediumContainer,
				tooltip: 'Keybindings',
				spacing: _GUI.sizes.buttonSpacing,
				circle: true,
				enabled: false
			} ),
			new _Button.Instance( {
				id: 'mouse',
				theme: 'white',
				image: shared.pathToIcons + 'mouse_64.png',
				imageSize: _GUI.sizes.iconMedium,
				size: _GUI.sizes.iconMediumContainer,
				tooltip: 'Hand Orientation',
				spacing: _GUI.sizes.buttonSpacing,
				circle: true,
				enabled: false
			} ),
			new _Button.Instance( {
				id: 'volume',
				theme: 'white',
				image: shared.pathToIcons + 'sound_64.png',
				imageSize: _GUI.sizes.iconMedium,
				size: _GUI.sizes.iconMediumContainer,
				tooltip: 'Volume',
				spacing: _GUI.sizes.buttonSpacing,
				circle: true,
				enabled: false
			} ),
			new _Button.Instance( {
				id: 'accessibility',
				theme: 'white',
				image: shared.pathToIcons + 'accessibility_64.png',
				imageSize: _GUI.sizes.iconMedium,
				size: _GUI.sizes.iconMediumContainer,
				tooltip: 'Accessibility',
				spacing: _GUI.sizes.buttonSpacing,
				circle: true,
				enabled: false
			} )
		);
	
		m.options.arrange_circle( {
			degreeStart: 0,
			direction: -1,
			radius: _GUI.sizes.buttonMedium + _GUI.sizes.buttonSpacing
		} );
		
	}
	
	function build_end_menu () {
		
		var m = _GUI.menus,
			b = _GUI.buttons;
		
		m.end.buttonOpen = new _Button.Instance( {
			id: 'open',
			image: shared.pathToIcons + 'exit_64.png',
			imageSize: _GUI.sizes.iconMedium,
			size: _GUI.sizes.iconMediumContainer,
			tooltip: 'End Game',
			spacing: _GUI.sizes.buttonSpacing,
			circle: true
		} );
		
		m.end.buttonClose = _GUI.generate_button_back();
		
		m.end.add( b.end );
		
		m.end.arrange_circle( {
			degreeStart: 0,
			radius: _GUI.sizes.buttonMedium + _GUI.sizes.buttonSpacing,
			forceShapeOnOpen: true
		} );
	
	}
	
	function build_footer_menu () {
		
		var m = _GUI.menus;
		
		m.footer.width = m.footer.domElement.width();
		m.footer.height = m.footer.domElement.height();
		m.footer.domElement.removeClass( 'sticky_footer' );
		m.footer.alignment = 'bottomcenter';
		
	}
	
	/*===================================================
    
    build
    
    =====================================================*/
	
	function build_gui() {
		
		var l = _GUI.layers,
			b = _GUI.buttons,
			m = _GUI.menus,
			c = _GUI.container;
		
		// menus
		
		build_start_menu();
		
		build_navigation_menu();
		
		build_options_menu();
		
		build_end_menu();
		
		build_main_menu();
		
		build_footer_menu();
		
		// layers
		
		c.add( l.display, l.overlayDisplay, l.ui, l.overlayAll, l.errors, m.footer );
		
	}
	
	/*===================================================
    
    fullscreen
    
    =====================================================*/
	
	function fullscreen_enter () {
		
		var b = _GUI.buttons,
			c = _GUI.container,
			parent;
		
		_GUI.fullscreen_api.requestFullScreen( c.domElement.get( 0 ) );
		
		parent = b.fullscreenEnter.parent;
		
		b.fullscreenEnter.hide( { 
			remove: true,
			callback: function () {
				b.fullscreenExit.show( { parent: parent } );
			}
		} );
		
		document.addEventListener( _GUI.fullscreen_api.fullScreenEventName, on_fullscreen_changed );
		
	}
	
	function on_fullscreen_changed () {
		
		if ( _GUI.fullscreen_api.isFullScreen() !== true ) {
			
			fullscreen_exit();
			
		}
		
	}
	
	function fullscreen_exit () {
		
		var b = _GUI.buttons,
			c = _GUI.container,
			parent;
		
		document.removeEventListener( _GUI.fullscreen_api.fullScreenEventName, on_fullscreen_changed );
			
		_GUI.fullscreen_api.cancelFullScreen( c.domElement.get( 0 ) );
		
		parent = b.fullscreenExit.parent;
		
		b.fullscreenExit.hide( {
			remove: true, 
			callback: function () {
				b.fullscreenEnter.show( { parent: parent } );
			}
		} );
		
	}
	
	/*===================================================
    
    ui groups
    
    =====================================================*/
	
	function show_group ( groupName, parameters ) {
		
		var i, l,
			group,
			children,
			parents,
			child,
			parent,
			parametersChild;
		
		if ( _GUI.groups.hasOwnProperty( groupName ) ) {
			
			group = _GUI.groups[ groupName ];
			
			children = group.children;
			parents = group.parents;
			
			for ( i = 0, l = children.length; i < l; i++ ) {
				
				child = children[ i ];
				parent = parents[ i ];
				
				parametersChild = main.extend( parameters, {} );
				parametersChild.parent = parametersChild.parent || parent;
				
				child.show( parametersChild );
				
			}
			
		}
		
	}
	
	function hide_group ( groupName, parameters ) {
		
		var i, l,
			group,
			children,
			child;
		
		if ( _GUI.groups.hasOwnProperty( groupName ) ) {
			
			group = _GUI.groups[ groupName ];
			
			children = group.children;
			
			for ( i = 0, l = children.length; i < l; i++ ) {
				
				child = children[ i ];
				
				child.hide( parameters );
				
			}
			
		}
		
	}
	
	function add_to_group ( groupName, childParentPairs ) {
		
		var i, l,
			pair,
			child,
			parent,
			group,
			index;
		
		childParentPairs = main.ensure_array( childParentPairs );
		
		for ( i = 0, l = childParentPairs.length; i < l; i++ ) {
			
			pair = childParentPairs[ i ];
			
			child = pair.child;
			
			parent = pair.parent;
			
			// add to active list
			
			index = _GUI.active.indexOf( child );
			
			if ( index === -1 ) {
				
				_GUI.active.push( child );
				
			}
			
			if ( typeof groupName === 'string' ) {
				
				// if group does not exist, create
				
				if ( _GUI.groups.hasOwnProperty( groupName ) === false ) {
					
					_GUI.groupsNames.push( groupName );
					_GUI.groups[ groupName ] = {
						children: [],
						parents: []
					};
					
				}
				
				group = _GUI.groups[ groupName ];
				
				index = group.children.indexOf( child );
				
				if ( index === -1 ) {
					
					group.children.push( child );
					group.parents.push( parent );
					
				}
				
			}
			
		}
		
	}
	
	function remove_from_group ( groupName, uielements ) {
		
		var i, l,
			j, k,
			uielement,
			group,
			index;
		
		// search specific group
		
		if ( _GUI.groups.hasOwnProperty( groupName ) ) {
					
			uielements = main.ensure_array( uielements );
			
			for ( i = 0, l = uielements.length; i < l; i++ ) {
				
				uielement = uielements[ i ];
				
				group = _GUI.groups[ groupName ];
				
				index = group.children.indexOf( uielement );
				
				// if found, remove from group
				
				if ( index !== -1 ) {
					
					group.children.splice( index, 1 );
					group.parents.splice( index, 1 );
					
					// if nothing left in group, delete group
					
					if ( group.children.length === 0 ) {
						
						index = _GUI.groupsNames.indexOf( groupName );
						
						if ( index !== -1 ) {
							
							_GUI.groupsNames.splice( index, 1 );
							
						}
						
						delete _GUI.groups[ groupName ];
						
					}
					
				}
				
			}
			
		}
		else {
			
			// search for and remove from all groups
			
			for ( i = _GUI.groupsNames.length - 1; i >= 0; i-- ) {
				
				remove_from_group( uielements, _GUI.groupsNames[ i ] );
				
			}
			
		}
		
	}
	
	function clean_groups ( groupsNames, parameters ) {
		
		var i, l,
			groupName,
			group,
			uielement;
		
		groupsNames = main.ensure_array( groupsNames );
		
		// if no group names passed, default to all groups
		
		if ( groupsNames.length === 0 ) {
			
			groupsNames = _GUI.groupsNames.slice( 0 );
			
		}
		
		// clean each group
		
		for ( i = 0, l = groupsNames.length; i < l; i++ ) {
			
			groupName = groupsNames[ i ];
			
			if ( _GUI.groups.hasOwnProperty( groupName ) ) {
				
				group = _GUI.groups[ groupName ];
				
				for ( i = 0, l = group.children.length; i < l; i++ ) {
					
					uielement = group.children[ i ];
					
					uielement.hide( parameters );
					
				}
				
				remove_from_group( groupName, group.children );
				
			}
			
		}
		
	}
	
} (KAIOPUA) );