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
	
	_MathHelper.round = function ( n, places ) {
		
		var dec = ( _MathHelper.is_number( places ) && places > 0 ) ? Math.pow( 10, places ) : 1;
		
		return Math.round( n * dec ) / dec;
		
	};
	
	_MathHelper.sign = function ( n ) {
		
		return n > 0 ? 1 : n === 0 ? 0 : -1;
		
	};
	
	_MathHelper.round_towards_zero = function ( n ) {
		
		return n < 0 ? Math.ceil( n ) : Math.floor( n );
		
	};
	
	main.asset_register( assetPath, { data: _MathHelper } );
    
} ( KAIOPUA ) );