/*
 *
 * GridElement.js
 * Basic element of puzzle solving.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/puzzles/GridElement.js",
		_GridElement = {},
		_Model,
		_MathHelper;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _GridElement,
		requirements: [
			"assets/modules/core/Model.js",
			"assets/modules/utils/MathHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal( m, mh ) {
		console.log('internal grid element', _GridElement);
		
		_Model = m;
		_MathHelper = mh;
		
		_GridElement.Instance = GridElement;
		_GridElement.Instance.prototype = new _Model.Instance();
		_GridElement.Instance.prototype.constructor = _GridElement.Instance;
		_GridElement.Instance.prototype.get_center_layout = get_center_layout;
		_GridElement.Instance.prototype.rotate = rotate;
		_GridElement.Instance.prototype.rotate_layout = rotate_layout;
		
	}
	
	/*===================================================
    
    grid element
    
    =====================================================*/
	
	function GridElement ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		// prototype constructor
		
		_Model.Instance.call( this, parameters );
		
		// layout
		
		this.layout = generate_layout( parameters.layout );
		
	}
	
	/*===================================================
    
    layout
    
    =====================================================*/
	
	function generate_layout ( source ) {
		
		var layout;
		
		// generate layout as matrix from source
		
		if ( source instanceof Matrix ) {
			
			layout = source;
			
		}
		else if ( main.is_array( source ) ) {
			
			layout = $M( source );
			
		}
		
		// if layout is not valid, fallback to default 1x1
		
		if ( layout instanceof Matrix !== true ) {
			
			layout = $M( [
				[ 1 ]
			] );
			/*
			layout = $M( [
				[ 0, 0, 0 ],
				[ 0, 1, 0 ],
				[ 0, 0, 0 ]
			] );
			*/
			/*
			layout = $M( [
				[ 0, 1, 1, 0, 0 ],
				[ 0, 0, 0, 1, 0 ],
				[ 0, 0, 1, 0, 0 ],
				[ 0, 0, 1, 0, 0 ],
				[ 0, 0, 0, 0, 0 ]
			] );
			*/
			layout = $M( [
				[ Math.round( Math.random() ), Math.round( Math.random() ), Math.round( Math.random() ) ],
				[ Math.round( Math.random() ), Math.round( Math.random() ), Math.round( Math.random() ) ],
				[ Math.round( Math.random() ), Math.round( Math.random() ), Math.round( Math.random() ) ]
			] );
			
		}
		
		// clamp layout values between 0 and 1, and force all non-zero to snap to 1
		
		layout = layout.map( function( x ) { return Math.ceil( _MathHelper.clamp( x, 0, 1 ) ); } );
		
		return layout;
		
	}
	
	/*===================================================
    
    rotation
    
    =====================================================*/
	
	function rotate ( degrees ) {
		
		return this.rotate_layout( degrees );
		
	}
	
	function rotate_layout ( degrees ) {
		
		var i, l,
			j, k,
			rotated = false,
			turns,
			layout,
			layoutRotated,
			dimensions,
			rows,
			cols,
			elements,
			elementsRot;
		
		// if degrees is number
		
		if ( _MathHelper.is_number( degrees ) ) {
			
			// basics
			
			layout = this.layout;
			dimensions = layout.dimensions();
			rows = dimensions.rows;
			cols = dimensions.cols;
			layoutRotated = Matrix.Zero( cols, rows );
			elements = layout.elements;
			elementsRot = layoutRotated.elements;
			
			// snap degrees to closest multiple of 90
			
			turns = _MathHelper.round_towards_zero( ( degrees % 360 ) / 90 );
			
			degrees = 90 * turns;
			
			// rotate layout by degrees into new rotated matrix
			
			if ( degrees !== 0 ) {
				
				console.log(' layout before rotated: ');
				console.log(this.layout.inspect());
				
				// positive rotation
				if ( degrees > 0 ) {
					console.log('ROTATION ++++ POSITIVE');
					for ( i = 0, l = cols; i < l; i++ ) {
						
						for ( j = 0, k = rows; j < k; j++ ) {
							//console.log('i', (rows - 1 - j), ', j', i, ' >> i', i, ', j', j );
							elementsRot[ i ][ j ] = elements[ rows - 1 - j ][ i ];
							
						}
						
					}
					
				}
				// negative rotation
				else {
					console.log('ROTATION ---- NEGATIVE');
					for ( i = 0, l = rows; i < l; i++ ) {
						
						for ( j = 0, k = cols; j < k; j++ ) {
							//console.log('i', i, ', j', j, ' >> i', (cols - 1 - j), ', j', i );
							elementsRot[ cols - 1 - j ][ i ] = elements[ i ][ j ];
							
						}
						
					}
					
				}
				
				// set layout as rotated
				
				this.layout = layoutRotated;
				console.log(' layout after rotated: ');
				console.log(this.layout.inspect());
				
				// set rotated
				
				rotated = true;
				
			}
			
		}
		
		return rotated;
		
	}
	
	/*===================================================
    
    utility
    
    =====================================================*/
	
	function get_center_layout ( layout ) {
		
		layout = layout || this.layout;
		
		var dimensions = layout.dimensions(),
			centerRow = Math.ceil( dimensions.rows * 0.5 ),
			centerCol = Math.ceil( dimensions.cols * 0.5 );
		
		return { row: centerRow, col: centerCol };
		
	}
	
} (KAIOPUA) );