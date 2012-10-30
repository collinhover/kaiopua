/*
 *
 * Velocity.js
 * Velocity tracker in rigid bodies.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/physics/Velocity.js",
		_Velocity = {},
		_VectorHelper;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Velocity,
		requirements: [
			"js/kaiopua/utils/VectorHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( vh ) {
		console.log('internal Velocity', _Velocity);
		// modules
		
		_VectorHelper = vh;
		
		// properties
		
		_Velocity.options = {
			damping: 0.97,
			dampingPre: 1,
			dampingDecay: 0.95,
			speedDelta: 1,
			collisionAngleThreshold: Math.PI * 0.5,
			collisionAngleThresholdMax: Math.PI * 0.5,
			forceLengthMax: Number.MAX_VALUE
		};
		
		// instance
		
		_Velocity.Instance = Velocity;
		_Velocity.Instance.prototype.constructor = _Velocity.Instance;
		
		_Velocity.Instance.prototype.reset = reset;
		_Velocity.Instance.prototype.clear = clear;
		
		_Velocity.Instance.prototype.rotate = rotate;
		
		_Velocity.Instance.prototype.update = update;
		
	}
	
	/*===================================================
    
    instance
    
    =====================================================*/
	
	function Velocity ( parameters ) {
		
		var i, l,
			offsets,
			offset;
		
		// handle parameters
		
		parameters = parameters || {};
		
		// properties
		
		this.options = $.extend( true, {}, _Velocity.options, parameters.options );
		
		this.rigidBody = parameters.rigidBody;
		
		this.force = new THREE.Vector3();
		this.forceRotated = new THREE.Vector3();
		this.forceApplied = new THREE.Vector3();
		this.forceRecentMax = new THREE.Vector3();
		this.forceDelta = new THREE.Vector3();
		this.speedDelta = new THREE.Vector3();
		
		this.damping = new THREE.Vector3();
		this.dampingPre = new THREE.Vector3();
		
		this.offsets = [];
		this.offsetsRotated = [];
		
		this.relativeTo = parameters.relativeTo;
		this.relativeToQ = new THREE.Quaternion();
		this.rotatedRelativeTo = [];
		
		this.up = shared.cardinalAxes.up.clone();
		
		offsets = parameters.offsets;
		
		if ( offsets && offsets.length > 0 ) {
			
			for ( i = 0, l = offsets.length; i < l; i++ ) {
				
				offset = offsets[ i ];
				
				if ( offset instanceof THREE.Vector3 ) {
					
					this.offsets.push( offset.clone() );
					
				}
				
			}
			
		}
		else {
			
			this.offsets.push( new THREE.Vector3() );
			
		}
		
		for ( i = 0, l = this.offsets.length; i < l; i++ ) {
			
			this.offsetsRotated.push( this.offsets[ i ].clone() );
			
		}
		
		this.reset();
		
	}
	
	function reset () {
		
		this.clear();
		
		this.damping.set( 1, 1, 1 ).multiplyScalar( this.options.damping );
		this.dampingPre.set( 1, 1, 1 ).multiplyScalar( this.options.dampingPre );
		this.speedDelta.set( 1, 1, 1 ).multiplyScalar( this.options.speedDelta );
		
		this.intersection = this.collision = this.sliding = false;
		
	}
	
	function clear () {
		
		this.forceDelta.set( 0, 0, 0 );
		this.force.set( 0, 0, 0 );
		this.forceRotated.set( 0, 0, 0 );
		
		this.moving = false;
		
	}
	
	/*===================================================
    
    update
    
    =====================================================*/
	
	function update ( relativeToQNew ) {
		
		var i, l,
			offsetRotated,
			rigidBody = this.rigidBody,
			mesh,
			scaleMax = 1,
			forceLengthMax;
		
		// update relative to q
		
		if ( relativeToQNew instanceof THREE.Quaternion === false ) {
			
			relativeToQNew = _VectorHelper.retrieve_relative_to( this.relativeTo, this.up );
			
		}
		
		if ( relativeToQNew instanceof THREE.Quaternion ) {
			
			this.relativeToQ.copy( relativeToQNew );
			
		}
		
		// force delta
		
		this.forceDelta.multiplySelf( this.speedDelta );
		
		// add delta to forces
		
		this.force.addSelf( this.forceDelta );
		this.forceDelta.copy( _VectorHelper.rotate_relative_to( this.forceDelta, this.relativeToQ ) );
		this.forceRotated.addSelf( this.forceDelta );
		
		// check forces against max
		
		forceLengthMax = this.options.forceLengthMax;
		
		if ( forceLengthMax < Number.MAX_VALUE ) {
			
			_VectorHelper.clamp_length( this.force, forceLengthMax );
			_VectorHelper.clamp_length( this.forceRotated, forceLengthMax );
			
		}
		
		// rotate offsets
		
		if (  this.rigidBody ) {
			
			mesh = this.rigidBody.mesh;
			
			if ( mesh instanceof THREE.Object3D ) {
				
				scaleMax = Math.max( mesh.scale.x, mesh.scale.y, mesh.scale.z );
				
			}
			
		}
		
		for ( i = 0, l = this.offsets.length; i < l; i++ ) {
			
			offsetRotated = this.offsetsRotated[ i ];
			
			offsetRotated.copy( _VectorHelper.rotate_relative_to( this.offsets[ i ], this.relativeToQ ) );
			
			if ( scaleMax !== 1 ) {
				
				offsetRotated.multiplyScalar( scaleMax );
				
			}
			
		}
		
		// clear delta
		
		this.forceDelta.set( 0, 0, 0 );
		
		// pre damp, physics will handle post damping
		
		this.force.multiplySelf( this.dampingPre );
		this.forceRotated.multiplySelf( this.dampingPre );
		
	}
	
	/*===================================================
    
    utility
    
    =====================================================*/
	
	function rotate( rotation ) {
		
		var i, l;
			
		if ( rotation instanceof THREE.Quaternion || rotation instanceof THREE.Matrix4 ) {
			
			// rotate force and offsets
			
			rotation.multiplyVector3( this.forceRotated );
			
			for ( i = 0, l = this.offsetsRotated.length; i < l; i++ ) {
				
				rotation.multiplyVector3( this.offsetsRotated[ i ] );
				
			}
			
		}
		
	}
	
} ( KAIOPUA ) );