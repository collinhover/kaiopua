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
		_Puzzle;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Field,
		requirements: [
			"assets/modules/puzzles/Puzzle.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( pzl ) {
		console.log('internal field', _Field);
		
		_Puzzle = pzl;
		
		_Field.Instance = Field;
		_Field.Instance.prototype = new _Puzzle.Instance();
		_Field.Instance.prototype.constructor = _Field.Instance;
		_Field.Instance.prototype.supr = _Puzzle.Instance.prototype;
		
		Object.defineProperty( _Field.Instance.prototype, 'plants', { 
			get: function () {
				
				// prototype call
				
				return this.elements;
			
			}
		});
		
	}
	
	/*===================================================
    
    planting
    
    =====================================================*/
	
	function Field ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		// prototype constructor
		
		_Puzzle.Instance.call( this, parameters );
		
	}
	
} (KAIOPUA) );