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
		assetPath = "js/kaiopua/model/WanderUpdater.js",
		_WanderUpdater = {},
		_PropertyUpdater,
		_MathHelper,
		_VectorHelper,
		_ObjectHelper,
		accelerationDamping = 0.9,
		speedLerp = 0.01,
		speedMaxBase = 0.1,
		speedMaxWave = 0.001,
		speedMinBase = 0.001,
		speedMinWave = 0.0001,
		snapThreshold = 0.01,
		range = 100,
		directionChangeChance = 0.01;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _WanderUpdater,
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
		console.log('internal wander updater', _WanderUpdater);
		
		_PropertyUpdater = pu;
		_MathHelper = mh;
		_VectorHelper = vh;
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
		this.speedMax = speedMaxBase;
		this.speedMin = speedMinBase;
		this.speed = 0;
		this.direction = new THREE.Vector3( 1, 1, 1 );
		this.directionChangeChance = new THREE.Vector3( directionChangeChance, directionChangeChance, directionChangeChance );
		this.angleSeed = Math.PI * 2;
		this.angleX = 0;
		this.angleY = 0;
		this.angleZ = 0;
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
		
		if ( parameters.rangeMax instanceof THREE.Vector3 ) {
			
			this.rangeMax.copy( parameters.rangeMax );
			
		}
		else if ( main.is_number( parameters.rangeMax ) ) {
			
			this.rangeMax.set( parameters.rangeMax, parameters.rangeMax, parameters.rangeMax );
			
		}
		
		if ( parameters.rangeMin instanceof THREE.Vector3 ) {
			
			this.rangeMin.copy( parameters.rangeMin );
			
		}
		else if ( main.is_number( parameters.rangeMin ) ) {
			
			this.rangeMin.set( parameters.rangeMin, parameters.rangeMin, parameters.rangeMin );
			
		}
		
		if ( parameters.direction instanceof THREE.Vector3 ) {
			
			this.direction.copy( parameters.direction );
			
		}
		else if ( main.is_number( parameters.direction ) ) {
			
			this.direction.set( parameters.direction, parameters.direction, parameters.direction );
			
		}
		
		if ( parameters.directionChangeChance instanceof THREE.Vector3 ) {
			
			this.directionChangeChance.copy( parameters.directionChangeChance );
			
		}
		else if ( main.is_number( parameters.directionChangeChance ) ) {
			
			this.directionChangeChance.set( parameters.directionChangeChance, parameters.directionChangeChance, parameters.directionChangeChance );
			
		}
		
		this.waveX = typeof parameters.waveX === 'boolean' ? parameters.waveX : false;
		this.waveY = typeof parameters.waveY === 'boolean' ? parameters.waveY : false;
		this.waveZ = typeof parameters.waveZ === 'boolean' ? parameters.waveZ : false;
		this.angleSeed = main.is_number( parameters.angleSeed ) ? parameters.angleSeed : this.angleSeed;
		this.angleX = main.is_number( parameters.angleX ) ? parameters.angleX : main.is_number( parameters.angle ) ? parameters.angle : ( Math.random() * ( this.angleSeed * 2 ) - this.angleSeed );
		this.angleY = main.is_number( parameters.angleY ) ? parameters.angleY : main.is_number( parameters.angle ) ? parameters.angle : ( Math.random() * ( this.angleSeed * 2 ) - this.angleSeed );
		this.angleZ = main.is_number( parameters.angleZ ) ? parameters.angleZ : main.is_number( parameters.angle ) ? parameters.angle : ( Math.random() * ( this.angleSeed * 2 ) - this.angleSeed );
		
		this.accelerationDamping = main.is_number( parameters.accelerationDamping ) ? parameters.accelerationDamping : this.accelerationDamping;
		this.speedLerp = main.is_number( parameters.speedLerp ) ? parameters.speedLerp : this.speedLerp;
		
		if ( this.waveX === true || this.waveY === true || this.waveZ === true ) {
			
			this.speedMax = main.is_number( parameters.speedMax ) ? parameters.speedMax : main.is_number( parameters.speed ) ? parameters.speed : speedMaxWave;
			this.speedMin = main.is_number( parameters.speedMin ) ? parameters.speedMin : main.is_number( parameters.speed ) ? parameters.speed : speedMinWave;
			
		}
		else {
			
			this.speedMax = main.is_number( parameters.speedMax ) ? parameters.speedMax : main.is_number( parameters.speed ) ? parameters.speed : speedMaxBase;
			this.speedMin = main.is_number( parameters.speedMin ) ? parameters.speedMin : main.is_number( parameters.speed ) ? parameters.speed : speedMinBase;
			
		}
		
		this.speed = Math.random() * ( this.speedMax - this.speedMin ) + this.speedMin;
		
		// snap to initial values
		
		if ( parameters.snapToInitial === true ) {
			
			this.origin.copy( this.originTarget );
			
		}
		
		// prototype
		
		_WanderUpdater.Instance.prototype.supr.start.call( this, parameters );
		
	}
	
	function step () {
		
		var rangeMax = this.rangeMax,
			rangeMin = this.rangeMin,
			sinX, sinY, sinZ;
		
		if ( this.speed !== 0 ) {
			
			// reset
			
			this.reset();
			
			// acceleration
			
			this.acceleration += this.speed;
			
			// origin
			
			_VectorHelper.lerp_snap( this.origin, this.originTarget, this.speedLerp, snapThreshold );
			
			// position
			
			// wave movement
			if ( this.waveX === true || this.waveY === true || this.waveZ === true ) {
				
				if ( this.waveX === true ) {
					
					this.angleX = _MathHelper.rad_between_PI( this.angleX + this.acceleration );
					
					sinX = Math.sin( this.angleX );
					
					this.positionOffsetTarget.x = sinX > 0 ? sinX * rangeMax.x : -sinX * rangeMin.x;
					
				}
				
				if ( this.waveY === true ) {
					
					this.angleY = _MathHelper.rad_between_PI( this.angleY + this.acceleration );
					
					sinY = Math.sin( this.angleY );
					
					this.positionOffsetTarget.y = sinY > 0 ? sinY * rangeMax.y : -sinY * rangeMin.y;
					
				}
				
				if ( this.waveZ === true ) {
					
					this.angleZ = _MathHelper.rad_between_PI( this.angleZ + this.acceleration );
					
					sinZ = Math.sin( this.angleZ );
					
					this.positionOffsetTarget.z = sinZ > 0 ? sinZ * rangeMax.z : -sinZ * rangeMin.z;
					
				}
				
			}
			// random movement
			else {
				
				// direction
				
				if ( Math.random() <= this.directionChangeChance.x ) {
					
					this.direction.x *= -1;
					
				}
				
				if ( Math.random() <= this.directionChangeChance.y ) {
					
					this.direction.y *= -1;
					
				}
				
				if ( Math.random() <= this.directionChangeChance.z ) {
					
					this.direction.z *= -1;
					
				}
				
				this.positionOffsetTarget.set( 
					_MathHelper.clamp( this.positionOffsetTarget.x + this.acceleration * this.direction.x, rangeMin.x, rangeMax.x ),
					_MathHelper.clamp( this.positionOffsetTarget.y + this.acceleration * this.direction.y, rangeMin.y, rangeMax.y ),
					_MathHelper.clamp( this.positionOffsetTarget.z + this.acceleration * this.direction.z, rangeMin.z, rangeMax.z )
				);
				
			}
			
			_VectorHelper.lerp_snap( this.positionOffset, this.positionOffsetTarget, this.speedLerp, snapThreshold );
			
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
		
	}
	
	function apply () {
		
		var fa;
		
		if ( this.parent instanceof _PropertyUpdater.Instance !== true && this.object instanceof THREE.Object3D ) {
			
			fa = this.forApply;
			
			_ObjectHelper.object_orbit_source( this.object, fa.origin, fa.positionOffset );
			
		}
	}
	
} (KAIOPUA) );