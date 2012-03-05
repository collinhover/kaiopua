/*
 *
 * Plant.js
 * Basic element of farming.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/puzzles/Plant.js",
		_Plant = {},
		_GridElement;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Plant,
		requirements: [
			"assets/modules/puzzles/GridElement.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal( ge ) {
		console.log('internal plant', _Plant);
		
		_GridElement = ge;
		
		_Plant.Instance = Plant;
		_Plant.Instance.prototype = new _GridElement.Instance();
		_Plant.Instance.prototype.constructor = _Plant.Instance;
		
	}
	
	/*===================================================
    
    plant
    
    =====================================================*/
	
	function Plant ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		// prototype constructor
		
		_GridElement.Instance.call( this, parameters );
		
		// properties
		
		this.seed = parameters.seed;
		
	}
	
} (KAIOPUA) );