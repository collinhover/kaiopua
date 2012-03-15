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
	
	_MathHelper.max_magnitude = function ( n1, n2 ) {
		
		var n1abs = Math.abs( n1 ),
			n2abs = Math.abs( n2 ),
			max = Math.max( n1abs, n2abs );
		
		return ( max === n1abs ) ? n1 : n2;
		
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
	
	_MathHelper.degree_between_180 = function ( n ) {
		
		n = n % 360;
		
		return ( n > 180 ) ? n - 360 : ( n < -180 ) ? n + 360 : n;
		
	};
	
	_MathHelper.degree_to_rad = function ( n ) {
		
		return n / 180 * Math.PI;
		
	};
	
	_MathHelper.rad_to_degree = function ( n ) {
		
		return n * Math.PI / 180;
		
	};
	
	_MathHelper.rotate_matrix2d_90 = function ( matrix2d, degrees ) {
		
		var i, l,
			turns;
		
		// snap degrees to closest multiple of increment
		
		turns = _MathHelper.round_towards_zero( ( degrees % 360 ) / 90 );
			
		degrees = 90 * turns;
		
		// rotate matrix2d
		
		if ( turns !== 0 ) {
			
			// positive rotation
			if ( degrees > 0 ) {
				
				for ( i = 0, l = Math.abs( turns ); i < l; i++ ) {
					
					matrix2d = _MathHelper.rotate_matrix2d_clockwise_90( matrix2d );
					
				}
				
			}
			// negative rotation
			else {
				
				for ( i = 0, l = Math.abs( turns ); i < l; i++ ) {
					
					matrix2d = _MathHelper.rotate_matrix2d_anticlockwise_90( matrix2d );
					
				}
				
			}
			
		}
		
		return matrix2d;
		
	};
	
	_MathHelper.rotate_matrix2d_clockwise_90 = function ( matrix2d ) {
		
		var i, l,
			j, k,
			dimensions = matrix2d.dimensions(),
			rows = dimensions.rows,
			cols = dimensions.cols,
			matrix2dRotated = Matrix.Zero( cols, rows ),
			elements = matrix2d.elements,
			elementsRot = matrix2dRotated.elements;
		
		// 90 degree positive / clockwise rotation of 2d ( n x m ) matrix
		
		for ( i = 0, l = cols; i < l; i++ ) {
			
			for ( j = 0, k = rows; j < k; j++ ) {
				
				elementsRot[ i ][ j ] = elements[ rows - 1 - j ][ i ];
				
			}
			
		}
		
		return matrix2dRotated;
		
	}
	
	_MathHelper.rotate_matrix2d_anticlockwise_90 = function ( matrix2d ) {
		
		var i, l,
			j, k,
			dimensions = matrix2d.dimensions(),
			rows = dimensions.rows,
			cols = dimensions.cols,
			matrix2dRotated = Matrix.Zero( cols, rows ),
			elements = matrix2d.elements,
			elementsRot = matrix2dRotated.elements;
		
		// 90 degree negative / anticlockwise rotation of 2d ( n x m ) matrix
		
		for ( i = 0, l = rows; i < l; i++ ) {
			
			for ( j = 0, k = cols; j < k; j++ ) {
				
				elementsRot[ cols - 1 - j ][ i ] = elements[ i ][ j ];
				
			}
			
		}
		
		return matrix2dRotated;
		
	}
	
	_MathHelper.trig_table = function ( increment, degreeMin, degreeMax ) {
		
		var i, l,
			rad,
			table = {
				sin: {},
				cos: {}
			};
		
		increment = _MathHelper.is_number( increment ) ? increment : 1;
		degreeMin = _MathHelper.is_number( degreeMin ) ? degreeMin : -180;
		degreeMax = _MathHelper.is_number( degreeMax ) ? degreeMax : 180;
		
		for ( i = degreeMin, l = degreeMax; i < l; i += increment ) {
			
			rad = _MathHelper.degree_to_rad( i );
			
			table.sin[ i ] = Math.sin( rad );
			table.cos[ i ] = Math.cos( rad );
			
		}
		
		return table;
		
	}
	
	main.asset_register( assetPath, { data: _MathHelper } );
    
} ( KAIOPUA ) );