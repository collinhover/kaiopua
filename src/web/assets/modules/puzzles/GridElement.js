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
		
		parameters.geometry = new THREE.CubeGeometry( 50, 100, 50 );
		
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
		
		this.rotate_layout( degrees );
		
	}
	
	function rotate_layout ( degrees ) {
		
		this.layout = _MathHelper.rotate_matrix2d_90( this.layout, degrees );
		
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