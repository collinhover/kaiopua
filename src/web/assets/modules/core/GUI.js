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
		assetPath = "assets/modules/core/GUI.js",
		_GUI = {},
		_UIElement,
		_Button,
		_Menu,
		buttonSizeLarge = 300,
		buttonSizeMedium = 160,
		buttonSizeSmall = 100,
		buttonSizeForIconLarge = 100,
		buttonSizeForIconMedium = 60,
		buttonSizeForIconSmall = 40,
		iconSizeLarge = 64,
		iconSizeMedium = 32,
		iconSizeSmall = 16,
		buttonSpacing = 10;
	
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
		
		// gui properties
		
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
		
		b.fullscreenEnter = new _Button.Instance( {
			id: 'fullscreen',
			image: 'img/icon/fullscreen_32x32.png',
			imageSize: iconSizeSmall,
			width: buttonSizeForIconSmall,
			spacing: buttonSpacing,
			circle: true,
			callback: fullscreen_enter,
			context: this,
			alignment: 'bottomright'
		} );
	
		b.fullscreenEnter.hide( true, 0 );
	
		b.fullscreenExit = new _Button.Instance( {
			id: 'fullscreen',
			image: 'img/icon/fullscreen_exit_32x32.png',
			imageSize: iconSizeSmall,
			width: buttonSizeForIconSmall,
			spacing: buttonSpacing,
			circle: true,
			callback: fullscreen_exit,
			context: this,
			alignment: 'bottomright'
		} );
	
		b.fullscreenExit.hide( true, 0 );
		
		b.save = new _Button.Instance( {
			id: 'save',
			image: 'img/icon/save_64x64.png',
			imageSize: iconSizeMedium,
			size: buttonSizeForIconMedium,
			spacing: buttonSpacing,
			circle: true
		} );
		
		b.load = new _Button.Instance( {
			id: 'load',
			image: 'img/icon/load_64x64.png',
			imageSize: iconSizeMedium,
			size: buttonSizeForIconMedium,
			spacing: buttonSpacing,
			circle: true
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
		
		m.core = new _Menu.Instance( {
            id: 'core'
        } );
		
		m.options = new _Menu.Instance( {
            id: 'options'
        } );
		
		m.footer = new _UIElement.Instance( { 
			domElement: shared.html.footerMenu
		} );
		
	}
	
	function build_start_menu () {
		
		var m = _GUI.menus,
			b = _GUI.buttons;
		
		m.start.hide( true, 0 );
	
		m.start.add( 
			new _Button.Instance( {
				id: 'start',
				text: 'Start',
				size: buttonSizeMedium,
				spacing: buttonSpacing,
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
		
		m.start.childrenAlwaysVisible.push( m.start.childrenByID.start );
		
		m.start.arrange_circle( {
			radius: buttonSizeMedium + buttonSpacing
		} );
		
	}
	
	function build_main_menu () {
		
		var m = _GUI.menus;
		
		m.main.hide( true, 0 );
		
		m.main.add( 
			new _Button.Instance( {
				id: 'resume',
				text: 'Resume',
				width: buttonSizeMedium,
				spacing: buttonSpacing,
				circle: true,
				cssmap: {
					'font-size' : "30px",
					'font-family' : "'CoustardRegular', Georgia, serif"
				},
				alignment: 'center'
			} ),
			new _Button.Instance( {
				id: 'end',
				text: 'End<br/>Game',
				size: buttonSizeSmall,
				spacing: buttonSpacing,
				circle: true,
				cssmap: {
					'font-size' : "18px",
					//'font-family' : "'CoustardRegular', Georgia, serif",
					'text-align' : 'center'
				},
			} ),
			m.core
		);
		
		m.main.childrenAlwaysVisible.push( m.main.childrenByID.resume );
	
		m.main.arrange_circle( {
			radius: buttonSizeMedium + buttonSpacing
		} );
	
	}
	
	function build_core_menu () {
		
		var m = _GUI.menus,
			b = _GUI.buttons;
		
		m.core.buttonOpen = new _Button.Instance( {
			id: 'open',
			image: 'img/icon/computer_alt_64x64.png',
			imageSize: iconSizeMedium,
			width: buttonSizeForIconMedium,
			spacing: buttonSpacing,
			circle: true
		} );
		
		m.core.buttonClose = new _Button.Instance( {
			id: 'close',
			image: 'img/icon/undo_64x64.png',
			imageSize: iconSizeSmall,
			width: buttonSizeForIconSmall,
			spacing: buttonSpacing,
			circle: true
		} );
		
		m.core.add(
			b.load,
			b.save,
			m.options
		);
		
		m.core.arrange_circle( {
			degrees: 180,
			radius: buttonSizeMedium + buttonSpacing
		} );
	
	}
	
	function build_options_menu () {
		
		var m = _GUI.menus;
		
		m.options.buttonOpen = new _Button.Instance( {
			id: 'open',
			image: 'img/icon/cog_64x64.png',
			imageSize: iconSizeMedium,
			size: buttonSizeForIconMedium,
			spacing: buttonSpacing,
			circle: true
		} );
		
		m.options.buttonClose = new _Button.Instance( {
			id: 'close',
			image: 'img/icon/undo_64x64.png',
			imageSize: iconSizeSmall,
			width: buttonSizeForIconSmall,
			spacing: buttonSpacing,
			circle: true
		} );
		
		m.options.add(
			new _Button.Instance( {
				id: 'quality',
				image: 'img/icon/computer_64x64.png',
				imageSize: iconSizeMedium,
				size: buttonSizeForIconMedium,
				spacing: buttonSpacing,
				circle: true
			} ),
			new _Button.Instance( {
				id: 'keybindings',
				image: 'img/icon/keyboard_64x64.png',
				imageSize: iconSizeMedium,
				size: buttonSizeForIconMedium,
				spacing: buttonSpacing,
				circle: true
			} ),
			new _Button.Instance( {
				id: 'mouse',
				image: 'img/icon/mouse_64x64.png',
				imageSize: iconSizeMedium,
				size: buttonSizeForIconMedium,
				spacing: buttonSpacing,
				circle: true
			} ),
			new _Button.Instance( {
				id: 'sound',
				image: 'img/icon/sound_64x64.png',
				imageSize: iconSizeMedium,
				size: buttonSizeForIconMedium,
				spacing: buttonSpacing,
				circle: true
			} ),
			new _Button.Instance( {
				id: 'accessibility',
				image: 'img/icon/accessibility_64x64.png',
				imageSize: iconSizeMedium,
				size: buttonSizeForIconMedium,
				spacing: buttonSpacing,
				circle: true
			} )
		);
	
		m.options.arrange_circle( {
			degreeStart: 360 / m.options.children.length,
			radius: buttonSizeMedium + buttonSpacing
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
		
		build_core_menu();
		
		build_options_menu();
		
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
		
		b.fullscreenEnter.hide( true, undefined, undefined, function () {
			b.fullscreenExit.show( parent );
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
		
		b.fullscreenExit.hide( true, undefined, undefined, function () {
			b.fullscreenEnter.show( parent );
		} );
		
	}
	
} (KAIOPUA) );