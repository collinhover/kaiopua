/*
 *
 * Sky.js
 * World Sky.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/env/Sky.js",
		_Sky = {},
		_Model,
		_Physics,
		_ObjectHelper;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Sky,
		requirements: [
			"assets/modules/core/Model.js",
			"assets/modules/core/Physics.js",
			"assets/modules/utils/ObjectHelper.js",
			"assets/models/Cloud_001.js",
			"assets/models/Cloud_002.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( m, phy, oh ) {
		console.log('internal sky', _Sky);
		
		_Model = m;
		_Physics = phy;
		_ObjectHelper = oh;
		
		// properties
		
		_Sky.numClouds = 10;
		_Sky.cloudScaleMax = 4;
		_Sky.cloudScaleMin = 1;
		_Sky.cloudsGeometry = [ main.get_asset_data( "assets/models/Cloud_001.js" ), main.get_asset_data( "assets/models/Cloud_002.js" ) ];
		_Sky.distanceFromSurface = 1000;
		_Sky.bounds = { min: new THREE.Vector3(), max: new THREE.Vector3() };
		
		// instance
		
		_Sky.Instance = Sky;
		_Sky.Instance.prototype = new _Model.Instance();
		_Sky.Instance.prototype.constructor = _Sky.Instance;
		_Sky.Instance.prototype.supr = _Model.Instance.prototype;
		
		_Sky.Instance.prototype.set_world = set_world;
		
		Object.defineProperty( _Sky.Instance.prototype, 'world', {
			get: function () { return this._world; },
			set: function ( world ) { this.set_world( world ); }
		});
		
		
	}
	
	/*===================================================
    
    sky
    
    =====================================================*/
	
	function Sky ( parameters ) {
		
		var i, l,
			cloud;
		
		// handle parameters
		
		parameters = parameters || {};
		
		// prototype constructor
		
		_Model.Instance.call( this, parameters );
		
		// properties
		
		this.numClouds = main.is_number( parameters.numClouds ) ? parameters.numClouds : _Sky.numClouds;
		this.cloudScaleMax = main.is_number( parameters.cloudScaleMax ) ? parameters.cloudScaleMax : _Sky.cloudScaleMax;
		this.cloudScaleMin = main.is_number( parameters.cloudScaleMin ) ? parameters.cloudScaleMin : _Sky.cloudScaleMin;
		this.cloudsGeometry = parameters.cloudsGeometry || _Sky.cloudsGeometry;
		this.distanceFromSurface = main.is_number( parameters.distanceFromSurface ) ? parameters.distanceFromSurface : _Sky.distanceFromSurface;
		this.bounds = parameters.bounds || _Sky.bounds;
		
		// generate clouds
		
		this.clouds = [];
		
		for ( i = 0, l = this.numClouds; i < l; i++ ) {
			
			cloud = new _Model.Instance( {
				geometry: this.cloudsGeometry[ Math.round( Math.random() * ( this.cloudsGeometry.length - 1 ) ) ],
				materials: new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff, vertexColors: THREE.VertexColors } ),
				shading: THREE.SmoothShading
			} );
			
			// store
			
			this.clouds.push( cloud );
			
			// add
			
			this.add( cloud );
			
		}
		
		// world
		
		this.world = parameters.world;
		
	}
	
	/*===================================================
    
    world
    
    =====================================================*/
	
	function set_world ( world ) {
		
		var i, l,
			cloud,
			children,
			child,
			radius,
			scale,
			t, w,
			x, y, z;
		
		// if new world
		
		if ( this._world !== world ) {
			
			// store new world
			
			this._world = world;
			
			if ( this._world instanceof _Model.Instance ) {
				
				// get world children
				
				children = _ObjectHelper.extract_children_from_objects( this._world, this._world );
				
				// get new bounds based on world and children
				
				this.bounds.min.set( 0, 0, 0 );
				this.bounds.max.set( 0, 0, 0 );
				
				for ( i = 0, l = children.length; i < l; i++ ) {
					
					child = children[ i ];
					console.log(' SKY bounds trying child', child );
					this.bounds = _ObjectHelper.object_push_bounds( child, this.bounds );
					
				}
				
				radius = Math.max( this.bounds.min.length(), this.bounds.max.length() );
				console.log( this, 'SKY bounds ', this.bounds, ' radius', radius);
				// update clouds
				
				for ( i = 0, l = this.clouds.length; i < l; i++ ) {
					
					cloud = this.clouds[ i ];
					
					z = ( radius * 2 ) * Math.random() - radius;
					t = 2 * Math.PI * Math.random();
					w = Math.sqrt( Math.pow( radius, 2 ) - z * z );
					x = w * Math.cos( t );
					y = w * Math.sin( t );
					
					// position
					
					cloud.position.set( x, y, z );
					
					// scale
					
					scale = Math.random() * ( this.cloudScaleMax - this.cloudScaleMin ) + this.cloudScaleMin;
					
					cloud.scale.set( scale, scale, scale );
					
					// rotate
					
					_Physics.rotate_relative_to_source( cloud, this._world, shared.cardinalAxes.up, shared.cardinalAxes.forward );
					
					_Physics.pull_to_source( cloud, this._world, children );
					
				}
				
			}
			
		}
		
	}
	
} (KAIOPUA) );