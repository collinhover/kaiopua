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
		_Sky.cloudInitAxis = new THREE.Vector3( 0, 1, 0 );
		_Sky.cloudInitAngle = 0;
		_Sky.cloudRotateTowardWorld = true;
		_Sky.cloudScaleMax = 6;
		_Sky.cloudScaleMin = 1;
		_Sky.cloudDistanceFromSurfaceMin = 1000;
		_Sky.cloudDistanceFromSurfaceMax = 3000;
		_Sky.cloudsGeometry = [ main.get_asset_data( "assets/models/Cloud_001.js" ), main.get_asset_data( "assets/models/Cloud_002.js" ) ];
		_Sky.bounds = { min: new THREE.Vector3(), max: new THREE.Vector3() };
		_Sky.xThetaMin = 0;
		_Sky.xThetaMax = Math.PI * 2;
		_Sky.yThetaMin = 0;
		_Sky.yThetaMax = Math.PI * 2;
		
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
		this.cloudInitAxis = main.is_number( parameters.cloudInitAxis ) ? parameters.cloudInitAxis : _Sky.cloudInitAxis;
		this.cloudInitAngle = main.is_number( parameters.cloudInitAngle ) ? parameters.cloudInitAngle : _Sky.cloudInitAngle;
		this.cloudRotateTowardWorld = typeof parameters.cloudRotateTowardWorld === 'boolean' ? parameters.cloudRotateTowardWorld : _Sky.cloudRotateTowardWorld;
		this.cloudRotateUtilVec31 = new THREE.Vector3();
		this.cloudRotateUtilVec32 = new THREE.Vector3();
		this.cloudScaleMax = main.is_number( parameters.cloudScaleMax ) ? parameters.cloudScaleMax : _Sky.cloudScaleMax;
		this.cloudScaleMin = main.is_number( parameters.cloudScaleMin ) ? parameters.cloudScaleMin : _Sky.cloudScaleMin;
		this.cloudDistanceFromSurfaceMin = main.is_number( parameters.cloudDistanceFromSurfaceMin ) ? parameters.cloudDistanceFromSurfaceMin : _Sky.cloudDistanceFromSurfaceMin;
		this.cloudDistanceFromSurfaceMax = main.is_number( parameters.cloudDistanceFromSurfaceMax ) ? parameters.cloudDistanceFromSurfaceMax : _Sky.cloudDistanceFromSurfaceMax;
		this.cloudsGeometry = parameters.cloudsGeometry || _Sky.cloudsGeometry;
		this.bounds = parameters.bounds || _Sky.bounds;
		this.xThetaMin = parameters.xThetaMin || _Sky.xThetaMin;
		this.xThetaMax = parameters.xThetaMax || _Sky.xThetaMax;
		this.yThetaMin = parameters.yThetaMin || _Sky.yThetaMin;
		this.yThetaMax = parameters.yThetaMax || _Sky.yThetaMax;
		
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
			distance,
			cloudForward = this.cloudRotateUtilVec31,
			cloudUp = this.cloudRotateUtilVec32,
			rt, tx, ty, w,
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
					
					this.bounds = _ObjectHelper.push_bounds( child, this.bounds );
					
				}
				
				radius = Math.max( this.bounds.min.length(), this.bounds.max.length() );
				
				// update clouds
				
				for ( i = 0, l = this.clouds.length; i < l; i++ ) {
					
					cloud = this.clouds[ i ];
					
					// position
					
					z = ( radius * 2 ) * Math.random() - radius;
					rt = Math.random();
					tx = rt * ( this.xThetaMax - this.xThetaMin ) + this.xThetaMin;
					ty = rt * ( this.yThetaMax - this.yThetaMin ) + this.yThetaMin;
					w = Math.asin( z / radius );
					x = radius * Math.cos( w ) * Math.cos( tx );
					y = radius * Math.cos( w ) * Math.sin( ty );
					
					cloud.position.set( x, y, z );
					
					// rotate
					
					cloud.quaternion.setFromAxisAngle( this.cloudInitAxis, this.cloudInitAngle + Math.atan2( x, z ) );
					
					if ( this.cloudRotateTowardWorld ) {
					
						cloudForward.copy( shared.cardinalAxes.forward );
						cloudUp.copy( shared.cardinalAxes.up );
						
						cloud.quaternion.multiplyVector3( cloudForward );
						cloud.quaternion.multiplyVector3( cloudUp );
						
						_Physics.rotate_relative_to_source( cloud, this._world, cloudForward, cloudUp );
						
					}
					
					// distance
					
					distance = Math.random() * ( this.cloudDistanceFromSurfaceMax - this.cloudDistanceFromSurfaceMin ) + this.cloudDistanceFromSurfaceMin;
					
					_Physics.pull_to_source( cloud, this._world, children, distance );
					
					// scale
					
					scale = Math.random() * ( this.cloudScaleMax - this.cloudScaleMin ) + this.cloudScaleMin;
					
					cloud.scale.set( scale, scale, scale );
					
				}
				
			}
			
		}
		
	}
	
} (KAIOPUA) );