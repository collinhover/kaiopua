/*
 *
 * MenuDynamic.js
 * Menu with movement.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/ui/MenuDynamic.js",
		_MenuDynamic = {},
		_Menu;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _MenuDynamic,
		requirements: [
			"assets/modules/ui/Menu.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( mn ) {
		console.log('internal menu dynamic', _MenuDynamic);
		
		_Menu = mn;
		
		_MenuDynamic.Instance = MenuDynamic;
		_MenuDynamic.Instance.prototype = new _Menu.Instance();
		_MenuDynamic.Instance.prototype.constructor = _MenuDynamic.Instance;
		
	}
	
	/*===================================================
    
    ui
    
    =====================================================*/
	
	function MenuDynamic ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		// prototype constructor
		
		_Menu.Instance.call( this, parameters );
		
	}
	
} (KAIOPUA) );