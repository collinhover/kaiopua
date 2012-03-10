/*
 *
 * Field.js
 * Basic puzzle of farming.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/farming/Field.js",
		_Field = {},
		_Puzzles;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Field,
		requirements: [
			"assets/modules/puzzles/Puzzles.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( pzl ) {
		console.log('internal field', _Field);
		
		_Puzzles = pzl;
		
		_Field.Instance = Field;
		_Field.Instance.prototype = new _Puzzles.Instance();
		_Field.Instance.prototype.constructor = _Field.Instance;
		
	}
	
	/*===================================================
    
    planting
    
    =====================================================*/
	
	function Field ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		// prototype constructor
		
		_Puzzles.Instance.call( this, parameters );
		
	}
	
} (KAIOPUA) );