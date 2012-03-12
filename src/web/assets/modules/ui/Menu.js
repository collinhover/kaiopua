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
		
		_Menu.Instance.prototype.generate_css_map = generate_css_map;
		
	}
	
	/*===================================================
    
    ui
    
    =====================================================*/
	
	function Menu ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.elementType = parameters.elementType || 'section';
		
		parameters.classes = 'menu info_panel clearfix ' + ( parameters.classes || '' );
		
		if ( parameters.transparent === true ) {
			parameters.classes += ' info_panel_nobg';
		}
		
		// prototype constructor
		
		_Button.Instance.call( this, parameters );
        
	}
	
	/*===================================================
    
    enable / disable
    
    =====================================================*/
	
	function enable () {
		
		var i, l,
			item;
		
		// proto
		
		_Menu.Instance.prototype.supr.enable.call( this );
		
		for ( i = 0, l = this.itemsList.length; i < l; i++) {
			
			item = this.itemsList[ i ];
			
			if ( item instanceof _Button.Instance && item.enabledSelf === true ) {
				
				item.enable_visual();
				
			}
			
		}
		
	}
	
	function disable () {
		
		var i, l,
			item;
		
		// proto
		
		_Menu.Instance.prototype.supr.disable.call( this );
		
		for ( i = 0, l = this.itemsList.length; i < l; i++) {
			
			item = this.itemsList[ i ];
			
			if ( item instanceof _Button.Instance && item.enabledSelf === true ) {
				
				item.disable_visual();
				
			}
			
		}
		
	}
	
	/*===================================================
    
    css
    
    =====================================================*/
	
	function generate_css_map ( parameters ) {
		
		var cssmap;
		
		// proto
		
		cssmap = _Menu.Instance.prototype.supr.generate_css_map( parameters );
		
		// css overrides
		cssmap[ "color" ] = cssmap[ "color" ] || "#FF0000";
		/*
		cssmap[ "display" ] = "table";
		cssmap[ "overflow" ] = "hidden";
		cssmap[ "padding" ] = "5px 5px 5px 5px";
		cssmap[ "margin" ] = "10px 10px 10px 10px";
		cssmap[ "cursor" ] = "default";
		cssmap[ "font" ] = "24px 'OpenSansRegular', Helmet, Freesans, sans-serif";
		
		cssmap[ "text-align" ] = "center";
		cssmap[ "background" ] = "table";
		cssmap[ "display" ] = "table";
		cssmap[ "display" ] = "table";
		cssmap[ "display" ] = "table";
		cssmap[ "display" ] = "table";
		cssmap[ "display" ] = "table";*/
		
		return cssmap;

	}
	
} (KAIOPUA) );