/*
MathHelper.js
Math utility helper module.
*/

var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/utils/MathHelper",
		mathhelper = {};
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	mathhelper.is_number = function ( n ) {
		
		return isNaN( n ) === false && isFinite( n );
		
	};
	
	mathhelper.clamp = function ( n, min, max ) {
		
		return Math.max( min, Math.min( max, n ) );
		
	};
	
	mathhelper = main.asset_register( assetPath, mathhelper );
	
	return main; 
    
} ( KAIOPUA ) );