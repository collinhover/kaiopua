/*
 *
 * WanderUpdater.js
 * Property updater for wandering.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/models/WanderUpdater.js",
		_WanderUpdater = {},
		_PropertyUpdater,
		_MathHelper,
		_ObjectHelper,
		accelerationDamping = 0.9,
		speedLerp = 0.01,
		speedMax = 0.0001,
		speedMin = 0.0001,
		snapThreshold = 0.01,
		range = 100;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _WanderUpdater,
		requirements: [
			"assets/modules/core/PropertyUpdater.js",
			"assets/modules/utils/MathHelper.js",
			"assets/modules/utils/ObjectHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( pu, mh, oh ) {
		console.log('internal wander updater', _WanderUpdater);
		
		_PropertyUpdater = pu;
		_MathHelper = mh;
		_ObjectHelper = oh;
		
		_WanderUpdater.Instance = WanderUpdater;
		_WanderUpdater.Instance.prototype = new _PropertyUpdater.Instance();
		_WanderUpdater.Instance.prototype.constructor = _WanderUpdater.Instance;
		_WanderUpdater.Instance.prototype.supr = _PropertyUpdater.Instance.prototype;
		
		_WanderUpdater.Instance.prototype.start = start;
		_WanderUpdater.Instance.prototype.reset = reset;
		_WanderUpdater.Instance.prototype.step = step;
		_WanderUpdater.Instance.prototype.integrate = integrate;
		_WanderUpdater.Instance.prototype.apply = apply;
		
	}
	
	/*===================================================
    
    updater
    
    =====================================================*/
	
	function WanderUpdater ( parameters ) {
		
		// prototype
		
		_PropertyUpdater.Instance.call( this, parameters );
		
		// properties
		
		this.acceleration = 0;
		this.accelerationDamping = accelerationDamping;
		this.speedLerp = speedLerp;
		this.speedMax = speedMax;
		this.speedMin = speedMin;
		this.speed = 0;
		this.angleSeed = Math.PI * 2;
		this.angleA = 0;
		this.angleB = 0;
		this.angleC = 0;
		this.rangeMax = new THREE.Vector3( range, range, range );
		this.rangeMin = new THREE.Vector3( -range, -range, -range );
		
		this.originTarget = new THREE.Vector3();
		this.origin = new THREE.Vector3();
		this.positionOffsetTarget = new THREE.Vector3();
		this.positionOffset = new THREE.Vector3();
		
		this.forApply = {
			origin: new THREE.Vector3(),
			positionOffset: new THREE.Vector3()
		};
		
		this.reset();
		
	}
	
	function reset () {
		
		var fa = this.forApply;
		
		fa.origin.set( 0, 0, 0 );
		fa.positionOffset.set( 0, 0, 0 );
		
	}
	
	function start ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		// properties
		
		if ( parameters.origin ) {
			
			this.originTarget.copy( parameters.origin );
			
		}
		
		if ( parameters.rangeMin instanceof THREE.Vector3 ) {
			
			this.rangeMin.copy( parameters.rangeMin );
			
		}
		else if ( main.is_number( parameters.rangeMin ) ) {
			
			this.rangeMin.set( parameters.rangeMin, parameters.rangeMin, parameters.rangeMin );
			
		}
		
		if ( parameters.rangeMax instanceof THREE.Vector3 ) {
			
			this.rangeMax.copy( parameters.rangeMax );
			
		}
		else if ( main.is_number( parameters.rangeMax ) ) {
			
			this.rangeMax.set( parameters.rangeMax, parameters.rangeMax, parameters.rangeMax );
			
		}
		
		this.accelerationDamping = parameters.accelerationDamping || this.accelerationDamping;
		this.speedLerp = parameters.speedLerp || this.speedLerp;
		this.speedMax = parameters.speedMax || parameters.speed || this.speedMax;
		this.speedMin = parameters.speedMin || parameters.speed || this.speedMin;
		this.speed = Math.random() * ( this.speedMax - this.speedMin ) + this.speedMin;
		
		this.angleSeed = parameters.angleSeed || this.angleSeed;
		this.angleA = parameters.angleA || parameters.angle || ( Math.random() * ( this.angleSeed * 2 ) - this.angleSeed );
		this.angleB = parameters.angleB || parameters.angle || ( Math.random() * ( this.angleSeed * 2 ) - this.angleSeed );
		this.angleC = parameters.angleC || parameters.angle || ( Math.random() * ( this.angleSeed * 2 ) - this.angleSeed );
		
		// snap to initial values
		
		if ( parameters.snapToInitial === true ) {
			
			this.origin.copy( this.originTarget );
			
		}
		
		// prototype
		
		_WanderUpdater.Instance.prototype.supr.start.call( this, parameters );
		
	}
	
	function step () {
		
		var rangeMax = this.rangeMax,
			rangeMin = this.rangeMin;
		
		// reset
		
		this.reset();
		
		// acceleration
		
		this.acceleration += this.speed;
		
		// origin
		
		_MathHelper.lerp_snap( this.origin, this.originTarget, this.speedLerp, snapThreshold );
		
		// position
		
		// random movement
		
		if ( this.randomWalk ) {
			
			// TODO
			
		}
		// wave movement
		else {
			
			this.angleA = _MathHelper.rad_between_PI( this.angleA + this.acceleration );
			this.angleB = _MathHelper.rad_between_PI( this.angleB + this.acceleration );
			this.angleC = _MathHelper.rad_between_PI( this.angleC + this.acceleration );
			
			this.positionOffsetTarget.set( 0, Math.sin( this.angleB ) * ( rangeMax.y - rangeMin.y ), 0 );
			
		}
		
		_MathHelper.lerp_snap( this.positionOffset, this.positionOffsetTarget, this.speedLerp, snapThreshold );
		
		// damping
		
		this.acceleration *= this.accelerationDamping;
		
		// integrate step
		
		this.integrate( this );
		
	}
	
	function integrate ( child ) {
		
		var fa = this.forApply;
		
		if ( child.origin ) {
			
			fa.origin.addSelf( child.origin );
			
		}
		
		if ( child.positionOffset ) {
			
			fa.positionOffset.addSelf( child.positionOffset );
			
		}
		
	}
	
	function apply () {
		
		var fa;
		
		if ( this.parent instanceof _PropertyUpdater.Instance !== true && this.object instanceof THREE.Object3D ) {
			
			fa = this.forApply;
			
			_ObjectHelper.object_orbit_source( this.object, fa.origin, fa.positionOffset );
			
		}
	}
	
} (KAIOPUA) );