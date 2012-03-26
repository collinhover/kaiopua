/*
 *
 * Inventory.js
 * Menu based inventory system.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/ui/Inventory.js",
		_Inventory = {},
		_Menu;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Inventory,
		requirements: [
			"assets/modules/ui/Menu.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( m ) {
		console.log('internal inventory', _Inventory);
		
		_Menu = m;
		
		_Inventory.Instance = Inventory;
		_Inventory.Instance.prototype = new _Menu.Instance();
		_Inventory.Instance.prototype.constructor = _Inventory.Instance;
		
	}
	
	/*===================================================
    
    ui
    
    =====================================================*/
	
	function Inventory ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		// prototype constructor
		
		_Menu.Instance.call( this, parameters );
		
	}
	
} (KAIOPUA) );