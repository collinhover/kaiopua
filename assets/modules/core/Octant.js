/*
 *
 * Octant.js
 * Node used in Octree.
 * 
 * based on Octree by Marek Pawlowski @ pawlowski.it
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/core/Octant.js",
		_Octant = {};
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Octant/*,
		requirements: [
			"assets/modules/core/Octant.js"
		],
		callbacksOnReqs: init_internal,
		wait: true*/
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	//function init_internal ( o ) {
		console.log('internal octant', _Octant);
		
		_Octant.Instance = Octant;
		
	//}
	
	/*===================================================
    
    octant
    
    =====================================================*/
	
	function Octant ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		
		
	}
	
} (KAIOPUA) );