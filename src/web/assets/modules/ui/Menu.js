/*
 *
 * Menu.js
 * Handles collections of buttons.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/ui/Menu.js",
		_Menu = {},
		_UIElement,
		_Button,
		_MathHelper;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Menu,
		requirements: [
			"assets/modules/ui/UIElement.js",
			"assets/modules/ui/Button.js",
			"assets/modules/utils/MathHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( uie, btn, mh ) {
		console.log('internal menu', _Menu);
		_UIElement = uie;
		_Button = btn;
		_MathHelper = mh;
		
		_Menu.Instance = Menu;
		_Menu.Instance.prototype = new _Button.Instance();
		_Menu.Instance.prototype.constructor = _Menu.Instance;
		_Menu.Instance.prototype.supr = _Button.Instance.prototype;
		
		_Menu.Instance.prototype.enable = enable;
		_Menu.Instance.prototype.disable = disable;
		
		_Menu.Instance.prototype.themes = {};
		_Menu.Instance.prototype.themes.core = theme_core;
		
	}
	
	/*===================================================
    
    ui
    
    =====================================================*/
	
	function Menu ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.elementType = parameters.elementType || 'section';
		
		parameters.text = parameters.image = undefined;
		
		// prototype constructor
		
		_Button.Instance.call( this, parameters );
		
		// create new button for self
		
		if ( parameters.button instanceof _Button.Instance ) {
			
			this.button = parameters.button;
		
		}
		else if ( parameters.button !== null && typeof parameters.button === 'object' ) {
			
			this.button = new _Button.Instance( parameters.button );
			
		}
        
	}
	
	/*===================================================
    
    enable / disable
    
    =====================================================*/
	
	function enable () {
		
		var i, l,
			child;
		
		// proto
		
		_Menu.Instance.prototype.supr.enable.call( this );
		
		for ( i = 0, l = this.children.length; i < l; i++) {
			
			child = this.children[ i ];
			
			if ( child instanceof _Button.Instance && child.enabledSelf === true ) {
				
				child.enable_visual();
				
			}
			
		}
		
	}
	
	function disable () {
		
		var i, l,
			child;
		
		// proto
		
		_Menu.Instance.prototype.supr.disable.call( this );
		
		for ( i = 0, l = this.children.length; i < l; i++) {
			
			child = this.children[ i ];
			
			if ( child instanceof _Button.Instance && child.enabledSelf === true ) {
				
				child.disable_visual();
				
			}
			
		}
		
	}
	
	/*===================================================
    
    css
    
    =====================================================*/
	
	function generate_cssmap ( cssmap ) {
		
		cssmap = cssmap || {};
		
		cssmap[ "cursor" ] = cssmap[ "cursor" ] || "default";
		cssmap[ "background-color" ] = cssmap[ "background-color" ] || "transparent";
		cssmap[ "background-image" ] = cssmap[ "background-image" ] || "none";
		cssmap[ "box-shadow" ] = cssmap[ "box-shadow" ] || "none";
		cssmap[ "border-radius" ] = cssmap[ "border-radius" ] || "0";
			
		// proto
		
		cssmap = _Menu.Instance.prototype.supr.generate_cssmap.call( this, cssmap );
		
		return cssmap;

	}
	
	/*===================================================
    
    themes
    
    =====================================================*/
	
	function theme_core ( theme ) {
		
		var cssmap,
			enabled,
			disabled;
		
		theme = theme || {};
		
		// cssmap
		
		cssmap = theme.cssmap = theme.cssmap || {};
		
		cssmap[ "cursor" ] = cssmap[ "cursor" ] || "default";
		cssmap[ "background-color" ] = cssmap[ "background-color" ] || "transparent";
		cssmap[ "background-image" ] = cssmap[ "background-image" ] || "none";
		cssmap[ "box-shadow" ] = cssmap[ "box-shadow" ] || "none";
		cssmap[ "border-radius" ] = cssmap[ "border-radius" ] || "0";
		
		// proto
		
		theme = _Menu.Instance.prototype.supr.themes.core.call( this, theme );
		
		theme.enabled = theme.disabled = {};
		
		return theme;
		
	}
	
} (KAIOPUA) );