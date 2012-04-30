/*
 *
 * OrbitUpdater.js
 * Property updater for orbiting.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/models/OrbitUpdater.js",
		_OrbitUpdater = {},
		_PropertyUpdater,
		_MathHelper,
		_ObjectHelper,
		accelerationDamping = 0.9,
		speedMax = 0.00005,
		speedMin = 0.000001;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _OrbitUpdater,
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
		console.log('internal orbit updater', _OrbitUpdater);
		
		_PropertyUpdater = pu;
		_MathHelper = mh;
		_ObjectHelper = oh;
		
		_OrbitUpdater.Instance = OrbitUpdater;
		_OrbitUpdater.Instance.prototype = new _PropertyUpdater.Instance();
		_OrbitUpdater.Instance.prototype.constructor = _OrbitUpdater.Instance;
		_OrbitUpdater.Instance.prototype.supr = _PropertyUpdater.Instance.prototype;
		
		_OrbitUpdater.Instance.prototype.start = start;
		_OrbitUpdater.Instance.prototype.update = update;
		_OrbitUpdater.Instance.prototype.reset = reset;
		_OrbitUpdater.Instance.prototype.integrate = integrate;
		_OrbitUpdater.Instance.prototype.apply = apply;
		
	}
	
	/*===================================================
    
    updater
    
    =====================================================*/
	
	function OrbitUpdater ( parameters ) {
		
		// prototype
		
		_PropertyUpdater.Instance.call( this, parameters );
		
		// utility
		
		this.utilVec31Orbit = new THREE.Vector3();
		
		// properties
		
		this.origin = new THREE.Vector3();
		this.positionOffset = new THREE.Vector3();
		this.rotationBase = new THREE.Quaternion();
		this.rotationOffset = new THREE.Quaternion();
		
		this.axis = shared.cardinalAxes.up.clone();
		this.acceleration = 0;
		this.accelerationDamping = accelerationDamping;
		this.speedMax = speedMax;
		this.speedMin = speedMin;
		this.speed = 0;
		this.radius = 0;
		this.angle = 0;
		
	}
	
	function start ( parameters ) {
		
		var posVec = this.utilVec31Orbit,
			angleA,
			lengthA,
			lengthB,
			lengthC;
		
		// handle parameters
		
		parameters = parameters || {};
		
		// properties
		
		if ( parameters.axis ) {
			
			this.axis.copy( parameters.axis );
			
		}
		
		if ( parameters.origin ) {
			
			this.origin.copy( parameters.origin );
			
		}
		// find origin based on axis and current position
		else {
			
			posVec.copy( this.object.position ).normalize();
			
			angleA = _MathHelper.angle_between_vectors( this.axis, posVec );
			
			lengthC = this.object.position.length();
			lengthA = ( Math.sin( angleA ) * lengthC ) / Math.sin( Math.PI * 0.5 );
			lengthB = Math.sqrt( Math.pow( lengthC, 2 ) - Math.pow( lengthA, 2 ) );
			
			this.origin.copy( this.axis ).multiplyScalar( lengthB );
			
		}
		
		this.radius = parameters.radius || this.object.position.distanceTo( this.origin );
		this.positionOffset.z = this.radius;
		
		this.angle = 0;
		this.rotationBase.copy( this.object.quaternion );
		
		this.accelerationDamping = parameters.accelerationDamping || this.accelerationDamping;
		this.speedMax = parameters.speedMax || parameters.speed || this.speedMax;
		this.speedMin = parameters.speedMin || parameters.speed || this.speedMin;
		this.speed = Math.random() * ( this.speedMax - this.speedMin ) + this.speedMin;
		
		// prototype
		
		_OrbitUpdater.Instance.prototype.supr.start.call( this, parameters );
		
	}
	
	function update () {
		
		// acceleration
		
		this.acceleration += this.speed;
		
		// position
		
		if ( this.positionOffset.z !== this.radius ) {
			
			this.positionOffset.z += this.acceleration * _MathHelper.sign( this.radius - this.positionOffset.z );
			
		}
		
		// rotation
		
		this.angle += this.acceleration;
		
		this.rotationOffset.setFromAxisAngle( this.axis, this.angle );
		
		// damping
		
		this.acceleration *= this.accelerationDamping;
		
		// prototype
		
		_OrbitUpdater.Instance.prototype.supr.update.call( this );
		
	}
	
	function reset () {
		
		this.origin.set( 0, 0, 0 );
		this.positionOffset.set( 0, 0, 0 );
		this.rotationBase.set( 0, 0, 0, 1 );
		this.rotationOffset.set( 0, 0, 0, 1 );
		
	}
	
	function integrate ( child ) {
		
		if ( child.origin ) {
			
			this.origin.addSelf( child.origin );
			
		}
		
		if ( child.positionOffset ) {
			
			this.positionOffset.addSelf( child.positionOffset );
			
		}
		
		if ( child.rotationBase ) {
			
			this.rotationBase.multiplySelf( child.rotationBase );
			
		}
		
		if ( child.rotationOffset ) {
			
			this.rotationOffset.multiplySelf( child.rotationOffset );
			
		}
		
	}
	
	function apply () {
		
		_ObjectHelper.object_orbit_source( this.object, this.origin, this.rotationBase, this.rotationOffset, this.positionOffset );
		
	}
	
} (KAIOPUA) );