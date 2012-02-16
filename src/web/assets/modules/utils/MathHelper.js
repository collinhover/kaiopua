/*
 *
 * MathHelper.js
 * Math utility helper module.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/utils/MathHelper.js",
		_MathHelper = {};
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	_MathHelper.is_number = function ( n ) {
		
		return isNaN( n ) === false && isFinite( n );
		
	};
	
	_MathHelper.clamp = function ( n, min, max ) {
		
		return Math.max( min, Math.min( max, n ) );
		
	};
	
	main.asset_register( assetPath, { data: _MathHelper } );
    
} ( KAIOPUA ) );