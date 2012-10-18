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
		assetPath = "js/kaiopua/model/OrbitUpdater.js",
		_OrbitUpdater = {},
		_PropertyUpdater,
		_MathHelper,
		_VectorHelper,
		_ObjectHelper,
		accelerationDamping = 0.9,
		speedLerp = 0.01,
		speedMax = 0.00002,
		speedMin = 0.00001,
		snapThreshold = 0.01;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _OrbitUpdater,
		requirements: [
			"js/kaiopua/core/PropertyUpdater.js",
			"js/kaiopua/utils/MathHelper.js",
			"js/kaiopua/utils/VectorHelper.js",
			"js/kaiopua/utils/ObjectHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( pu, mh, vh, oh ) {
		console.log('internal orbit updater', _OrbitUpdater);
		
		_PropertyUpdater = pu;
		_MathHelper = mh;
		_VectorHelper = vh;
		_ObjectHelper = oh;
		
		_OrbitUpdater.Instance = OrbitUpdater;
		_OrbitUpdater.Instance.prototype = new _PropertyUpdater.Instance();
		_OrbitUpdater.Instance.prototype.constructor = _OrbitUpdater.Instance;
		_OrbitUpdater.Instance.prototype.supr = _PropertyUpdater.Instance.prototype;
		
		_OrbitUpdater.Instance.prototype.start = start;
		_OrbitUpdater.Instance.prototype.step = step;
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
		
		this.utilVec31Start = new THREE.Vector3();
		
		// properties
		
		this.axisTarget = shared.cardinalAxes.up.clone();
		this.axis = new THREE.Vector3().copy( this.axisTarget );
		this.acceleration = 0;
		this.accelerationDamping = accelerationDamping;
		this.speedLerp = speedLerp;
		this.speedMax = speedMax;
		this.speedMin = speedMin;
		this.speed = 0;
		this.radius = 0;
		this.angle = 0;
		
		this.originTarget = new THREE.Vector3();
		this.origin = new THREE.Vector3();
		this.positionOffset = new THREE.Vector3();
		this.rotationBase = new THREE.Quaternion();
		this.rotationOffset = new THREE.Quaternion();
		
		this.forApply = {
			origin: new THREE.Vector3(),
			positionOffset: new THREE.Vector3(),
			rotationBase: new THREE.Quaternion(),
			rotationOffset: new THREE.Quaternion()
		};
		
		this.reset();
		
	}
	
	function reset () {
		
		var fa = this.forApply;
		
		fa.origin.set( 0, 0, 0 );
		fa.positionOffset.set( 0, 0, 0 );
		fa.rotationBase.set( 0, 0, 0, 1 );
		fa.rotationOffset.set( 0, 0, 0, 1 );
		
	}
	
	function start ( parameters ) {
		
		var posVec = this.utilVec31Start,
			angleA,
			lengthA,
			lengthB,
			lengthC;
		
		// handle parameters
		
		parameters = parameters || {};
		
		// properties
		
		if ( parameters.axis ) {
			
			this.axisTarget.copy( parameters.axis );
			
		}
		
		if ( parameters.origin ) {
			
			this.originTarget.copy( parameters.origin );
			
		}
		// find origin based on axis and current position
		else {
			
			posVec.copy( this.object.position ).normalize();
			
			angleA = _VectorHelper.angle_between_vectors( posVec, this.axisTarget );
			
			lengthC = this.object.position.length();
			lengthA = ( Math.sin( angleA ) * lengthC ) / Math.sin( Math.PI * 0.5 );
			lengthB = Math.sqrt( Math.pow( lengthC, 2 ) - Math.pow( lengthA, 2 ) );
			
			this.originTarget.copy( this.axis ).multiplyScalar( lengthB );
			
		}
		
		this.radius = main.is_number( parameters.radius ) ? parameters.radius : this.object.position.distanceTo( this.originTarget );
		this.positionOffset.z = this.radius;
		
		this.angle = 0;
		this.rotationBase.copy( this.object.quaternion );
		
		this.accelerationDamping = main.is_number( parameters.accelerationDamping ) ? parameters.accelerationDamping : this.accelerationDamping;
		this.speedLerp = main.is_number( parameters.speedLerp ) ? parameters.speedLerp : this.speedLerp;
		this.speedMax = main.is_number( parameters.speedMax ) ? parameters.speedMax : main.is_number( parameters.speed ) ? parameters.speed : speedMax;
		this.speedMin = main.is_number( parameters.speedMin ) ? parameters.speedMin : main.is_number( parameters.speed ) ? parameters.speed : speedMin;
		this.speed = Math.random() * ( this.speedMax - this.speedMin ) + this.speedMin;
		
		// snap to initial values
		
		if ( parameters.snapToInitial === true ) {
			
			this.axis.copy( this.axisTarget );
			this.origin.copy( this.originTarget );
			
		}
		
		// prototype
		
		_OrbitUpdater.Instance.prototype.supr.start.call( this, parameters );
		
	}
	
	function step () {
		
		if ( this.speed !== 0 ) {
			
			// reset
			
			this.reset();
			
			// acceleration
			
			this.acceleration += this.speed;
			
			// origin
			
			_VectorHelper.lerp_snap( this.origin, this.originTarget, this.speedLerp, snapThreshold );
			
			// position
			
			if ( this.positionOffset.z !== this.radius ) {
				
				this.positionOffset.z += this.acceleration * ( this.radius - this.positionOffset.z );
				
			}
			
			// rotation
			
			this.angle = _MathHelper.rad_between_PI( this.angle + this.acceleration );
			
			//this.axisTarget.set( Math.random(), Math.random(), Math.random() );
			
			_VectorHelper.lerp_snap( this.axis, this.axisTarget, this.speedLerp, snapThreshold );
			
			this.rotationOffset.setFromAxisAngle( this.axis, this.angle );
			
			// damping
			
			this.acceleration *= this.accelerationDamping;
			
			// integrate step
			
			this.integrate( this );
			
		}
		
	}
	
	function integrate ( child ) {
		
		var fa = this.forApply;
		
		if ( child.origin ) {
			
			fa.origin.addSelf( child.origin );
			
		}
		
		if ( child.positionOffset ) {
			
			fa.positionOffset.addSelf( child.positionOffset );
			
		}
		
		if ( child.rotationBase ) {
			
			fa.rotationBase.multiplySelf( child.rotationBase );
			
		}
		
		if ( child.rotationOffset ) {
			
			fa.rotationOffset.multiplySelf( child.rotationOffset );
			
		}
		
	}
	
	function apply () {
		
		var fa;
		
		if ( this.parent instanceof _PropertyUpdater.Instance !== true && this.object instanceof THREE.Object3D ) {
			
			fa = this.forApply;
			
			_ObjectHelper.object_orbit_source( this.object, fa.origin, fa.positionOffset, fa.rotationBase, fa.rotationOffset );
			
		}
	}
	
} (KAIOPUA) );