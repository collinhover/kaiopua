/*
 *
 * GridModel.js
 * Basic part of grid element.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/puzzles/GridModel.js",
		_GridModel = {},
		_Model;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _GridModel,
		requirements: [
			"assets/modules/core/Model.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( m ) {
		console.log('internal grid model', _GridModel);
		_Model = m;
		
		// instance
		
		_GridModel.Instance = GridModel;
		_GridModel.Instance.prototype = new _Model.Instance();
		_GridModel.Instance.prototype.constructor = _GridModel.Instance;
		_GridModel.Instance.prototype.supr = _Model.Instance.prototype;
		
	}
	
	/*===================================================
    
    model
    
    =====================================================*/
	
	function GridModel ( parameters ) {
		
		var gridElement;
		
		// handle parameters
		
		parameters = parameters || {};
		
		gridElement = parameters.gridElement;
		parameters.material = parameters.material || gridElement.material;
		parameters.geometry = parameters.geometry || gridElement.geometry;
		
		// proto
		
		_Model.Instance.call( this, parameters );
		
		// properties
		
		this.gridElement = gridElement;
		
	}
	
} (KAIOPUA) );