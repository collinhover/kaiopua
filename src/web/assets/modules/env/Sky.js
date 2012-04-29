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
		_Cloud,
		_MathHelper,
		_ObjectHelper;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Sky,
		requirements: [
			"assets/modules/core/Model.js",
			"assets/modules/core/Physics.js",
			"assets/modules/env/Cloud.js",
			"assets/modules/utils/MathHelper.js",
			"assets/modules/utils/ObjectHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( m, phy, cld, mh, oh ) {
		console.log('internal sky', _Sky);
		
		_Model = m;
		_Physics = phy;
		_Cloud = cld;
		_MathHelper = mh;
		_ObjectHelper = oh;
		
		// properties
		
		_Sky.numClouds = 10;
		_Sky.cloudInitAxis = new THREE.Vector3( 0, 1, 0 );
		_Sky.cloudInitAngle = 0;
		_Sky.cloudRotateTowardWorld = true;
		_Sky.cloudOpacityByDistance = 0;
		_Sky.cloudScaleMax = 6;
		_Sky.cloudScaleMin = 1;
		_Sky.cloudBoundRadius = 1500;
		_Sky.cloudDistanceFromSurfaceMin = 1000;
		_Sky.cloudDistanceFromSurfaceMax = 3000;
		_Sky.layout = 'box';
		_Sky.zonePolar = {
			min: 0,
			max: Math.PI
		};
		_Sky.zoneAzimuth = {
			min: 0,
			max: Math.PI * 2
		};
		_Sky.zones = [ {
			polar: _Sky.zonePolar,
			azimuth: _Sky.zoneAzimuth
		} ];
		
		// instance
		
		_Sky.Instance = Sky;
		_Sky.Instance.prototype = new _Model.Instance();
		_Sky.Instance.prototype.constructor = _Sky.Instance;
		_Sky.Instance.prototype.supr = _Model.Instance.prototype;
		
		_Sky.Instance.prototype.set_world = set_world;
		_Sky.Instance.prototype.set_clouds = set_clouds;
		
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
		this.cloudOpacityByDistance = _MathHelper.clamp( main.is_number( parameters.cloudOpacityByDistance ) ? parameters.cloudOpacityByDistance : _Sky.cloudOpacityByDistance, -1, 1 );
		this.cloudRotateUtilVec31 = new THREE.Vector3();
		this.cloudRotateUtilVec32 = new THREE.Vector3();
		this.cloudScaleMax = main.is_number( parameters.cloudScaleMax ) ? parameters.cloudScaleMax : _Sky.cloudScaleMax;
		this.cloudScaleMin = main.is_number( parameters.cloudScaleMin ) ? parameters.cloudScaleMin : _Sky.cloudScaleMin;
		this.cloudBoundRadius =  main.is_number( parameters.cloudBoundRadius ) ? parameters.cloudBoundRadius : _Sky.cloudBoundRadius;
		this.cloudDistanceFromSurfaceMin = main.is_number( parameters.cloudDistanceFromSurfaceMin ) ? parameters.cloudDistanceFromSurfaceMin : _Sky.cloudDistanceFromSurfaceMin;
		this.cloudDistanceFromSurfaceMax = main.is_number( parameters.cloudDistanceFromSurfaceMax ) ? parameters.cloudDistanceFromSurfaceMax : _Sky.cloudDistanceFromSurfaceMax;
		this.cloudsGeometry = parameters.cloudsGeometry || _Sky.cloudsGeometry;
		this.bounds = parameters.bounds || { min: new THREE.Vector3(), max: new THREE.Vector3() };
		this.layout = typeof parameters.layout === 'string' ? parameters.layout : _Sky.layout;
		this.zones = main.type( parameters.zones ) === 'array' ? parameters.zones : _Sky.zones;
		
		// generate clouds
		
		this.clouds = [];
		
		for ( i = 0, l = this.numClouds; i < l; i++ ) {
			
			cloud = new _Cloud.Instance();
			
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
		
		// store new world
		
		this._world = world;
		
		// clouds
		
		this.set_clouds();
		
	}
	
	/*===================================================
    
    clouds
    
    =====================================================*/
	
	function set_clouds () {
		
		var i, l,
			children,
			child;
		
		// reset bounds
		
		this.bounds.min.set( -this.cloudBoundRadius, -this.cloudBoundRadius, -this.cloudBoundRadius );
		this.bounds.max.set( this.cloudBoundRadius, this.cloudBoundRadius, this.cloudBoundRadius );
		
		// world influence, pre layout
		
		if ( this._world instanceof _Model.Instance ) {
			
			// get world children
			
			children = _ObjectHelper.extract_children_from_objects( this._world, this._world );
			
			// get new bounds based on world and children
			
			for ( i = 0, l = children.length; i < l; i++ ) {
				
				child = children[ i ];
				
				this.bounds = _ObjectHelper.push_bounds( child, this.bounds );
				
			}
			
		}
		
		// layout
		
		// sphere
		
		if ( this.layout === 'sphere' ) {
			
			clouds_layout_sphere.call( this, children );
			
		}
		// default to box
		else {
			
			clouds_layout_sphere.call( this, children );//clouds_layout_box.call( this );
			
		}
		
	}
	
	function clouds_layout_sphere ( children ) {
		
		var i, l,
			bmin = this.bounds.min,
			bmax = this.bounds.max,
			cloud,
			radius,
			scale,
			distance,
			zone,
			zpolar, zazimuth,
			tx, ty, tz,
			azimuth, polar,
			x, y, z,
			cloudForward = this.cloudRotateUtilVec31,
			cloudUp = this.cloudRotateUtilVec32;
		
		// get children
		
		children = main.type( children ) === 'array' ? children : _ObjectHelper.extract_children_from_objects( this._world, this._world );
		
		// set radius
		
		radius = Math.abs( _MathHelper.max_magnitude( bmin.x, bmin.y, bmin.z, bmax.x, bmax.y, bmax.z ) );
		
		// update clouds
		
		for ( i = 0, l = this.clouds.length; i < l; i++ ) {
			
			cloud = this.clouds[ i ];
			
			// zone / angles
			
			zone = this.zones[ Math.round( Math.random() * ( this.zones.length - 1 ) ) ];
			zpolar = ( zone.polar && main.is_number( zone.polar.min ) && main.is_number( zone.polar.max ) ) ? zone.polar : _Sky.zonePolar;
			zazimuth = ( zone.azimuth && main.is_number( zone.azimuth.min ) && main.is_number( zone.azimuth.max ) ) ? zone.azimuth : _Sky.zoneAzimuth;
			
			polar = _MathHelper.clamp( Math.random() * ( zpolar.max - zpolar.min ) + zpolar.min, 0, Math.PI );
			azimuth = _MathHelper.clamp( Math.random() * ( zazimuth.max - zazimuth.min ) + zazimuth.min, 0, Math.PI * 2 );
			
			// position
			
			x = radius * Math.cos( azimuth ) * Math.sin( polar );
			y = radius * Math.sin( azimuth ) * Math.sin( polar );
			z = radius * Math.cos( polar );
			
			cloud.position.set( x, y, z );
			
			// rotate
			
			cloud.quaternion.setFromAxisAngle( this.cloudInitAxis, this.cloudInitAngle + Math.atan2( x, z ) );
			
			if ( this.cloudRotateTowardWorld ) {
				
				cloudForward.copy( shared.cardinalAxes.forward );
				cloudUp.copy( shared.cardinalAxes.up );
				
				cloud.quaternion.multiplyVector3( cloudForward );
				cloud.quaternion.multiplyVector3( cloudUp );
				
				_Physics.rotate_relative_to_source( cloud, this._world, cloudUp, cloudForward );
				
			}
			
			// scale
			
			scale = Math.random() * ( this.cloudScaleMax - this.cloudScaleMin ) + this.cloudScaleMin;
			
			cloud.scale.set( scale, scale, scale );
			
		}
		
		// pull towards world
		
		for ( i = 0, l = this.clouds.length; i < l; i++ ) {
			
			cloud = this.clouds[ i ];
			
			// pull
			
			distance = Math.random() * ( this.cloudDistanceFromSurfaceMax - this.cloudDistanceFromSurfaceMin ) + this.cloudDistanceFromSurfaceMin;
			
			_Physics.pull_to_source( cloud, this._world, children, distance );
			
			/*
			// opacity by distance
			
			if ( this.cloudOpacityByDistance > 0 ) {
				
				cloud.material.opacity = 1 - ( cloud.position.length() / radius ) * this.cloudOpacityByDistance;
				
			}
			else if ( this.cloudOpacityByDistance < 0 ) {
				
				cloud.material.opacity = -( cloud.position.length() / radius ) * this.cloudOpacityByDistance;
				
			}
			else {
				
				cloud.material.opacity = 1;
				
			}
			
			if ( cloud.material.opacity < 1 ) {
				
				cloud.material.transparent = true;
				
			}
			else {
				
				cloud.material.transparent = false;
				
			}
			*/
			
		}
		
	}
	
	function clouds_layout_box () {
		
		
		
	}
	
} (KAIOPUA) );