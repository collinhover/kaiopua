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
		_MenuDynamic;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Inventory,
		requirements: [
			"assets/modules/ui/MenuDynamic.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( md ) {
		console.log('internal inventory', _Inventory);
		
		_MenuDynamic = md;
		
		_Inventory.Instance = Inventory;
		_Inventory.Instance.prototype = new _MenuDynamic.Instance();
		_Inventory.Instance.prototype.constructor = _Inventory.Instance;
		
	}
	
	/*===================================================
    
    ui
    
    =====================================================*/
	
	function Inventory ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		// prototype constructor
		
		_MenuDynamic.Instance.call( this, parameters );
		
	}
	
} (KAIOPUA) );