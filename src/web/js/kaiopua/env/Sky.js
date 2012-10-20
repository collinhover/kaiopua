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
		assetPath = "js/kaiopua/env/Sky.js",
		_Sky = {},
		_Model,
		_Cloud,
		_MathHelper,
		_SceneHelper,
		_ObjectHelper,
		_PhysicsHelper;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Sky,
		requirements: [
			"js/kaiopua/core/Model.js",
			"js/kaiopua/env/Cloud.js",
			"js/kaiopua/utils/MathHelper.js",
			"js/kaiopua/utils/SceneHelper.js",
			"js/kaiopua/utils/ObjectHelper.js",
			"js/kaiopua/utils/PhysicsHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( m, cld, mh, sh, oh, ph ) {
		console.log('internal sky', _Sky);
		
		_Model = m;
		_Cloud = cld;
		_MathHelper = mh;
		_SceneHelper = sh;
		_ObjectHelper = oh;
		_PhysicsHelper = ph;
		
		// properties
		
		_Sky.options = {
			intersectable: false
		}
		
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
		_Sky.cloudRangeWander = 200;
		_Sky.cloudAnimationDuration = 3000;
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
		
		_Sky.Instance.prototype.animate = animate;
		
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
		parameters.options = $.extend( true, {}, _Sky.options, parameters.options );
		
		// prototype constructor
		
		_Model.Instance.call( this, parameters );
		
		// properties
		
		this.numClouds = main.is_number( parameters.numClouds ) ? parameters.numClouds : _Sky.numClouds;
		this.cloudParameters = parameters.cloudParameters;
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
		this.cloudRangeWander = main.is_number( parameters.cloudRangeWander ) ? parameters.cloudRangeWander : _Sky.cloudRangeWander;
		this.cloudAnimationDuration = main.is_number( parameters.cloudAnimationDuration ) ? parameters.cloudAnimationDuration : _Sky.cloudAnimationDuration;
		this.cloudsGeometry = parameters.cloudsGeometry || _Sky.cloudsGeometry;
		this.bounds = parameters.bounds || { min: new THREE.Vector3(), max: new THREE.Vector3() };
		this.layout = parameters.layout;
		this.zones = main.type( parameters.zones ) === 'array' ? parameters.zones : _Sky.zones;
		
		// init clouds list
		
		this.clouds = [];
		
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
	
	function update_cloud_count ( count ) {
		
		var i, l,
			cloud,
			cloudsExtra;
		
		// change count
		
		if ( main.is_number( count ) && count >= 0 ) {
			
			this.numClouds = count;
			
		}
		
		// remove any extra clouds
		
		if ( this.clouds.length > this.numClouds ) {
			
			cloudsExtra = this.clouds.splice( this.numClouds, this.clouds.length - this.numClouds );
			
			for ( i = 0, l = cloudsExtra.length; i < l; i++ ) {
				
				cloud = cloudsExtra[ i ];
				
				this.remove( cloud );
				
			}
			
		}
		// add until num clouds reached
		else if ( this.clouds.length < this.numClouds ) {
			
			for ( i = this.clouds.length, l = this.numClouds; i < l; i++ ) {
				
				cloud = new _Cloud.Instance( this.cloudParameters );
				
				// store
				
				this.clouds.push( cloud );
				
				// add
				
				this.add( cloud );
				
			}
			
		}
		
	}
	
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
			
			children = _SceneHelper.extract_children_from_objects( this._world, this._world );
			
			// get new bounds based on world and children
			
			for ( i = 0, l = children.length; i < l; i++ ) {
				
				child = children[ i ];
				
				this.bounds = _ObjectHelper.push_bounds( child, this.bounds );
				
			}
			
		}
		
		// layout
		
		// prearranged
		
		if ( main.is_array( this.layout ) ) {
			
			clouds_layout_prearranged.call( this );
			
		}
		// default to sphere
		else {
			
			clouds_layout_sphere.call( this, children );
			
		}
		
	}
	
	function clouds_layout_prearranged () {
		
		var i, l,
			cloud,
			properties,
			position,
			rotation,
			scale,
			cloudForward = this.cloudRotateUtilVec31,
			cloudUp = this.cloudRotateUtilVec32;
		
		// update cloud count
		
		update_cloud_count.call( this, this.layout.length );
		
		// update clouds
		
		for ( i = 0, l = this.numClouds; i < l; i++ ) {
			
			cloud = this.clouds[ i ];
			
			properties = this.layout[ i ];
			position = properties.position;
			rotation = properties.rotation;
			scale = properties.scale;
			
			// position
			
			if ( position instanceof THREE.Vector3 ) {
				
				cloud.position.copy( position );
				
			}
			
			// rotate
			
			if ( rotation instanceof THREE.Quaternion ) {
				
				cloud.quaternion.copy( rotation );
				
			}
			else if ( rotation instanceof THREE.Vector3 ) {
				
				cloud.quaternion.setFromEuler( rotation );
			
			}
			else if ( this.cloudRotateTowardWorld ) {
				
				cloudForward.copy( shared.cardinalAxes.forward );
				cloudUp.copy( shared.cardinalAxes.up );
				
				cloud.quaternion.multiplyVector3( cloudForward );
				cloud.quaternion.multiplyVector3( cloudUp );
				
				_PhysicsHelper.rotate_relative_to_source( cloud.quaternion, cloud.position, this._world, cloudUp, cloudForward );
				
			}
			
			// scale
			if ( main.is_number( scale ) ) {
				
				cloud.scale.set( scale, scale, scale );
			
			}
			else if ( scale instanceof THREE.Vector3 ) {
				
				cloud.scale.copy( scale );
			
			}
			else {
				
				scale = Math.random() * ( this.cloudScaleMax - this.cloudScaleMin ) + this.cloudScaleMin;
				
				cloud.scale.set( scale, scale, scale );
				
			}
			
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
		
		children = main.type( children ) === 'array' ? children : _SceneHelper.extract_children_from_objects( this._world, this._world );
		
		// set radius
		
		radius = Math.abs( _MathHelper.max_magnitude( bmin.x, bmin.y, bmin.z, bmax.x, bmax.y, bmax.z ) );
		
		// update clouds
		
		update_cloud_count.call( this );
		
		for ( i = 0, l = this.numClouds; i < l; i++ ) {
			
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
				
				_PhysicsHelper.rotate_relative_to_source( cloud.quaternion, cloud.position, this._world, cloudForward, cloudUp );
				
			}
			
			// scale
			
			scale = Math.random() * ( this.cloudScaleMax - this.cloudScaleMin ) + this.cloudScaleMin;
			
			cloud.scale.set( scale, scale, scale );
			
			// pull towards world
			
			distance = Math.random() * ( this.cloudDistanceFromSurfaceMax - this.cloudDistanceFromSurfaceMin ) + this.cloudDistanceFromSurfaceMin;
			
			_PhysicsHelper.pull_to_source( cloud, this._world, children, distance );
			
		}
		
	}
	
	function animate ( parameters ) {
		
		var i, l,
			cloud,
			idleMod,
			stop;
		
		// handle parameters
		
		parameters = parameters || {};
		
		// clouds
		
		for ( i = 0, l = this.clouds.length; i < l; i++ ) {
			
			cloud = this.clouds[ i ];
			
			if ( parameters.stop === true ) {
				
				cloud.morphs.stop_all();
				
			}
			else {
				
				cloud.morphs.play( 'idle', { duration: this.cloudAnimationDuration, loop: true, startDelay: true } );
				
			}
			
		}
		
	}
	
} (KAIOPUA) );