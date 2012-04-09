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
	
	_MathHelper.rad_between_PI = function ( n ) {
		
		var twopi = ( Math.PI * 2 );
		
		n = n % twopi;
		
		return ( n > Math.PI ) ? n - twopi : ( n < -Math.PI ) ? n + twopi : n;
		
	};
	
	_MathHelper.shortest_rotation_between_angles = function ( a1, a2 ) {
		
		var rot = a2 - a1;
		
		return ( rot > Math.PI ) ? rot - ( Math.PI * 2 ) : ( rot < -Math.PI ) ? rot + ( Math.PI * 2 ) : rot;
		
	};
	
	_MathHelper.degree_to_rad = function ( n ) {
		
		return n / 180 * Math.PI;
		
	};
	
	_MathHelper.rad_to_degree = function ( n ) {
		
		return n * 180 / Math.PI;
		
	};
	
	_MathHelper.get_orthonormal_vectors = function ( v1 ) {
		
		// returns 2 orthographic ( perpendicular ) vectors to the first
		
		var i,
			min = 0,
			minAxis,
			v1absx = Math.abs( v1.x ),
			v1absy = Math.abs( v1.y ),
			v1absz = Math.abs( v1.z ),
			v2 = new THREE.Vector3(),
			v3 = new THREE.Vector3();
		
		// use Gram-Schmidt orthogonalisation to find first perpendicular vector
		
		min = Math.min( v1absx, v1absy, v1absz );
		
		// min is x
		if ( min === v1absx ) {
			
			minAxis = 'x';
			
		}
		// min is y
		else if ( min === v1absy ) {
			
			minAxis = 'y';
			
		}
		// min is z
		else {
			
			minAxis = 'z';
			
		}
		
		v2[ minAxis ] = 1;
		v2.x -= v1[ minAxis ] * v1.x;
		v2.y -= v1[ minAxis ] * v1.y;
		v2.z -= v1[ minAxis ] * v1.z;
		
		v3.cross( v1, v2 );
		
		return { v1: v1, v2: v2, v3: v3 };
		
	};
	
	_MathHelper.get_rotation_to_normal = function ( normal, normalAxis ) {
		
		// returns a 4x4 matrix that defines a rotation to a normal
		
		var vectors = _MathHelper.get_orthonormal_vectors( normal ),
			v1 = vectors.v1,
			v2 = vectors.v2,
			v3 = vectors.v3,
			matrix;
		
		// normal on the x axis
		if ( normalAxis === 'x' ) {
			
			matrix = new THREE.Matrix4(
				v1.x, v2.x, v3.x, 0,
				v1.y, v2.y, v3.y, 0,
				v1.z, v2.z, v3.z, 0,
				0, 0, 0, 1
			);
			
		}
		// normal on the z axis
		else if ( normalAxis === 'z' ) {
			
			matrix = new THREE.Matrix4(
				v2.x, v3.x, v1.x, 0,
				v2.y, v3.y, v1.y, 0,
				v2.z, v3.z, v1.z, 0,
				0, 0, 0, 1
			);
			
		}
		// normal is on the y axis
		else {
			
			matrix = new THREE.Matrix4(
				v2.x, v1.x, v3.x, 0,
				v2.y, v1.y, v3.y, 0,
				v2.z, v1.z, v3.z, 0,
				0, 0, 0, 1
			);
			
		}
		
		return matrix;
		
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