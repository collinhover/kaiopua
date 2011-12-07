/*
MathHelper.js
Math utility helper module.
*/

var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
		game = main.game = main.game || {},
		workers = game.workers = game.workers || {},
		mathhelper = workers.mathhelper = workers.mathhelper || {};
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	mathhelper.is_number = function ( n ) {
		
		return isNaN( n ) === false && isFinite( n );
		
	};
	
	mathhelper.clamp = function ( n, min, max ) {
		
		return Math.max( min, Math.min( max, n ) );
		
	};
	
	/*===================================================
    
    misc
    
    =====================================================*/
	
	return main; 
    
}(KAIOPUA || {}));