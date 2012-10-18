/*
 *
 * RigidBody.js
 * Basic objects in physics world.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/physics/RigidBody.js",
		_RigidBody = {},
		_VectorHelper,
		_RayHelper,
		_ObjectHelper,
		_SceneHelper,
		bodyCount = 0;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _RigidBody,
		requirements: [
			"js/kaiopua/utils/VectorHelper.js",
			"js/kaiopua/utils/RayHelper.js",
			"js/kaiopua/utils/ObjectHelper.js",
			"js/kaiopua/utils/SceneHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( vh, rh, oh, sh ) {
		console.log('internal Rigid Body', _RigidBody);
		_VectorHelper = vh;
		_RayHelper = rh;
		_ObjectHelper = oh;
		_SceneHelper = sh;
		
		// properties
		
		_RigidBody.damping = 0.97;
		_RigidBody.dampingDecay = 0.95;
		_RigidBody.offsetPct = 0.4;
		_RigidBody.collisionAngleThresholdMax = Math.PI * 0.5;
		_RigidBody.gravityCollisionAngleThreshold = Math.PI * 0.3;
		_RigidBody.lerpDelta = 0.1;
		_RigidBody.lerpDeltaGravityChange = 0;
		_RigidBody.gravityBodyRadiusAdditionPct = 1;
		_RigidBody.gravityBodyChangeDelayTimeMax = 250;
		_RigidBody.gravityBodyChangeLerpDeltaTimeMax = 500;
		_RigidBody.gravityBodyChangeMagnitudeTimeMax = 500;
		_RigidBody.gravityBodyChangeGravityProjectionMod = 10;
		_RigidBody.gravityBodyChangeMovementProjectionMod = 20;
		_RigidBody.gravityBodyChangeForceMod = 0.5;
		_RigidBody.gravityBodyChangeMagnitude = new THREE.Vector3( 0, -0.1, 0 );
		
		// instance
		
		_RigidBody.Instance = RigidBody;
		_RigidBody.Instance.prototype = {};
		_RigidBody.Instance.prototype.constructor = _RigidBody.Instance;
		_RigidBody.Instance.prototype.clone = clone;
		
		_RigidBody.Instance.prototype.collider_dimensions = collider_dimensions;
		_RigidBody.Instance.prototype.collider_dimensions_scaled = collider_dimensions_scaled;
		_RigidBody.Instance.prototype.collider_radius = collider_radius;
		
		_RigidBody.Instance.prototype.bounds_in_direction = bounds_in_direction;
		
		_RigidBody.Instance.prototype.find_gravity_body = find_gravity_body;
		_RigidBody.Instance.prototype.change_gravity_body = change_gravity_body;
		
		Object.defineProperty( _RigidBody.Instance.prototype, 'grounded', { 
			get : function () { return Boolean( this.velocityGravity.collision ) && !this.velocityGravity.moving }
		});
		
		Object.defineProperty( _RigidBody.Instance.prototype, 'sliding', { 
			get : function () { return this.velocityGravity.sliding }
		});
		
		Object.defineProperty( _RigidBody.Instance.prototype, 'radiusGravity', { 
			get : function () {
				
				var scale = this.mesh.scale,
					scaleMax = Math.max( scale.x, scale.y, scale.z ),
					radiusGravity = this.radiusCore * scaleMax;
				
				if ( this.radiusGravityScaled === false ) {
					
					radiusGravity += this.radiusGravityAddition;
					
				}
				else {
					
					radiusGravity += this.radiusGravityAddition * scaleMax;
					
				}
				
				return radiusGravity;
				
			}
		});
		
	}
	
	/*===================================================
    
    rigid body
    
    =====================================================*/
	
	function RigidBody ( mesh, parameters ) {
		
		var i, l,
			geometry,
			vertices,
			vertex,
			bboxDimensions,
			bodyType,
			width,
			height,
			depth,
			needWidth,
			needHeight,
			needDepth,
			radius,
			radiusAvg,
			position,
			offsetPct,
			gravityBodyRadiusAdditionPct,
			gravityBodyRadiusAddition;
		
		// utility
		
		this.utilVec31Dimensions = new THREE.Vector3();
		this.utilVec31GravityBody = new THREE.Vector3();
		this.utilVec32GravityBody = new THREE.Vector3();
		this.utilVec33GravityBody = new THREE.Vector3();
		this.utilVec34GravityBody = new THREE.Vector3();
		this.utilVec35GravityBody = new THREE.Vector3();
		this.utilVec36GravityBody = new THREE.Vector3();
		this.utilVec31Bounds = new THREE.Vector3();
		this.utilQ1Bounds = new THREE.Quaternion();
		this.utilQ1Relative= new THREE.Quaternion();
		this.utilMat41Relative = new THREE.Matrix4();
		
		// handle parameters
		
		parameters = parameters || {};
		
		this.id = bodyCount++;
		
		this.mesh = mesh;
		
		geometry = parameters.geometry || mesh.geometry;
		
		position = mesh.position;
		
		// physics width/height/depth
		
		width = parameters.width;
		
		height = parameters.height;
		
		depth = parameters.depth;
		
		if ( main.is_number( width ) === false ) {
			
			needWidth = true;
			
		}
		
		if ( main.is_number( height ) === false ) {
			
			needHeight = true;
			
		}
		
		if ( main.is_number( depth ) === false ) {
			
			needDepth = true;
			
		}
		
		if ( needWidth === true || needHeight === true || needDepth === true ) {
			
			// model bounding box
			
			bboxDimensions = _ObjectHelper.dimensions( mesh );
			
			if ( needWidth === true ) {
				
				width = bboxDimensions.x;
				
			}
			
			if ( needHeight === true ) {
				
				height = bboxDimensions.y;
			
			}
			
			if ( needDepth === true ) {
				
				depth = bboxDimensions.z;
				
			}
			
		}
		
		this.mass = parameters.mass || width * height * depth;
		
		// create collider by body type
		
		bodyType = parameters.bodyType;
		
		if ( bodyType === 'mesh' ) {
			
			this.collider = new _RayHelper.MeshCollider( this.mesh );
			
		}
		else if ( bodyType === 'sphere' ) {
			
			radius = Math.max( width, height, depth ) * 0.5;
			
			this.collider = new _RayHelper.SphereCollider( this.mesh, position, radius );
			
		}
		else if ( bodyType === 'plane' ) {
			
			this.collider = new _RayHelper.PlaneCollider( this.mesh, position, parameters.normal || new THREE.Vector3( 0, 0, 1 ) );
			
		}
		// default box
		else {
			
			this.collider = new _RayHelper.ObjectColliderOBB( this.mesh );
			
		}
		
		// radius
		
		this.radius = this.collider_radius();
		
		// radius average
		
		this.radiusCore = 0;
		
		vertices = geometry.vertices;
		
		for ( i = 0, l = vertices.length; i < l; i++ ) {
			
			vertex = vertices[ i ];
			
			this.radiusCore += vertex.length();
			
		}
		
		this.radiusCore = this.radiusCore / vertices.length;
		
		// radius gravity
		
		if ( main.is_number( parameters.radiusGravityAddition ) ) {
			
			this.radiusGravityAddition = parameters.radiusGravityAddition;
			this.radiusGravityScaled = false;
			
		}
		else {
			
			gravityBodyRadiusAdditionPct = main.is_number( parameters.gravityBodyRadiusAdditionPct ) ? parameters.gravityBodyRadiusAdditionPct : _RigidBody.gravityBodyRadiusAdditionPct;
			this.radiusGravityAddition = this.radiusCore * gravityBodyRadiusAdditionPct;
			this.radiusGravityScaled = true;
			
		}
		
		// dynamic or static, set mass to 0 for a static object
		
		if ( parameters.hasOwnProperty('dynamic') ) {
			
			this.dynamic = parameters.dynamic;
			
		}
		else {
			
			this.mass = 0;
			this.dynamic = false;
			
		}
		
		// gravity source
		
		this.gravitySource = typeof parameters.gravitySource === 'boolean' ? parameters.gravitySource : false;
		this.gravityChildren = [];
		
		// gravity magnitude
		
		if ( parameters.gravityMagnitude instanceof THREE.Vector3 ) {
			
			this.gravityMagnitude = parameters.gravityMagnitude;
			
		}
		
		// gravity body
		
		this.gravityBodyChangeTime = 0;
		this.gravityBodyChangeDelayTime = 0;
		this.gravityBodyChangeDelayTimeMax = main.is_number( parameters.gravityBodyChangeDelayTimeMax ) ? parameters.gravityBodyChangeDelayTimeMax : _RigidBody.gravityBodyChangeDelayTimeMax;
		
		this.gravityBodyChangeGravityProjectionMod = main.is_number( parameters.gravityBodyChangeGravityProjectionMod ) ? parameters.gravityBodyChangeGravityProjectionMod : _RigidBody.gravityBodyChangeGravityProjectionMod;
		this.gravityBodyChangeMovementProjectionMod = main.is_number( parameters.gravityBodyChangeMovementProjectionMod ) ? parameters.gravityBodyChangeMovementProjectionMod : _RigidBody.gravityBodyChangeMovementProjectionMod;
		this.gravityBodyChangeForceMod = main.is_number( parameters.gravityBodyChangeForceMod ) ? parameters.gravityBodyChangeForceMod : _RigidBody.gravityBodyChangeForceMod;
		this.gravityBodyChangeMagnitude = parameters.gravityBodyChangeMagnitude instanceof THREE.Vector3 ? parameters.gravityBodyChangeMagnitude : _RigidBody.gravityBodyChangeMagnitude.clone();
		
		this.gravityBodyChangeLerpDeltaTimeMax = main.is_number( parameters.gravityBodyChangeLerpDeltaTimeMax ) ? parameters.gravityBodyChangeLerpDeltaTimeMax : _RigidBody.gravityBodyChangeLerpDeltaTimeMax;
		this.gravityBodyChangeMagnitudeTimeMax = main.is_number( parameters.gravityBodyChangeMagnitudeTimeMax ) ? parameters.gravityBodyChangeMagnitudeTimeMax : _RigidBody.gravityBodyChangeMagnitudeTimeMax;
		
		// lerp delta
		
		this.lerpDeltaLast = this.lerpDelta = main.is_number( parameters.lerpDelta ) ? parameters.lerpDelta : _RigidBody.lerpDelta;
		this.lerpDeltaGravityChange = main.is_number( parameters.lerpDeltaGravityChange ) ? parameters.lerpDeltaGravityChange : _RigidBody.lerpDeltaGravityChange;
		
		// axes
		
		this.axes = {
			up: shared.cardinalAxes.up.clone(),
			forward: shared.cardinalAxes.forward.clone(),
			right: shared.cardinalAxes.right.clone()
		};
		
		// velocity trackers
		
		offsetPct = parameters.offsetPct || _RigidBody.offsetPct;
		
		this.velocityMovement = new VelocityTracker( { 
			rigidBody: this,
			forceLengthMax: parameters.movementForceLengthMax,
			damping: parameters.movementDamping,
			dampingDecay: parameters.movementDampingDecay,
			collisionAngleThreshold: parameters.movementCollisionAngleThreshold,
			relativeTo: this.mesh,
			offsets: parameters.movementOffsets || [ 
				new THREE.Vector3( -width * offsetPct, 0, 0 ), // left waist side
				new THREE.Vector3( width * offsetPct, 0, 0 ), // right waist side
				new THREE.Vector3( 0, height * offsetPct, 0 ) // near head
			]
		} );
		
		this.velocityGravity = new VelocityTracker( { 
			rigidBody: this,
			forceLengthMax: parameters.gravityForceLengthMax,
			damping: parameters.gravityDamping,
			dampingDecay: parameters.gravityDampingDecay,
			collisionAngleThreshold: parameters.gravityCollisionAngleThreshold || _RigidBody.gravityCollisionAngleThreshold,
			offsets: parameters.gravityOffsets || [ 
				new THREE.Vector3( -width * offsetPct, 0, -depth * offsetPct ),
				new THREE.Vector3( width * offsetPct, 0, -depth * offsetPct ),
				new THREE.Vector3( width * offsetPct, 0, depth * offsetPct ),
				new THREE.Vector3( -width * offsetPct, 0, depth * offsetPct )
			]
		} );
		
		// safety net
		
		this.safe = true;
		this.safetynet = {
			position: new THREE.Vector3(),
			quaternion: new THREE.Quaternion()
		};
		this.onSafetyNetStarted = new signals.Signal();
		this.onSafetyNetEnd = new signals.Signal();
		
	}
	
	function clone ( mesh ) {
		
		var parameters = {};
		
		mesh = mesh || this.mesh;
		
		if ( this.collider instanceof _RayHelper.MeshCollider ) {
			
			parameters.bodyType = 'mesh';
			
		}
		else if ( this.collider instanceof _RayHelper.SphereCollider ) {
			
			parameters.bodyType = 'sphere';
			
		}
		else if ( this.collider instanceof _RayHelper.PlaneCollider ) {
			
			parameters.bodyType = 'plane';
			parameters.normal = this.collider.normal.clone();
			
		}
		else {
			
			parameters.bodyType = 'box';
			
		}
		
		parameters.dynamic = this.dynamic;
		parameters.mass = this.mass;
		parameters.movementDamping = this.velocityMovement.damping.clone();
		parameters.gravityDamping = this.velocityGravity.damping.clone();
		
		return new _RigidBody.Instance( mesh, parameters );
		
	}
	
	/*===================================================
    
    velocity
    
    =====================================================*/
	
	function VelocityTracker ( parameters ) {
		
		var i, l,
			offsets,
			offset;
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.damping = parameters.damping || _RigidBody.damping;
		
		// properties
		
		this.rigidBody = parameters.rigidBody;
		this.force = new THREE.Vector3();
		this.forceRotated = new THREE.Vector3();
		this.forceApplied = new THREE.Vector3();
		this.forceRecentMax = new THREE.Vector3();
		this.forceDelta = new THREE.Vector3();
		this.forceLengthMax = parameters.forceLengthMax || Number.MAX_VALUE;
		this.speedDelta = new THREE.Vector3( 1, 1, 1 );
		this.damping = new THREE.Vector3( 1, 1, 1 );
		this.dampingPre = new THREE.Vector3( 1, 1, 1 );
		this.dampingDecay = parameters.dampingDecay || _RigidBody.dampingDecay;
		this.offsets = [];
		this.offsetsRotated = [];
		this.collisionAngleThreshold = Math.min( parameters.collisionAngleThreshold || _RigidBody.collisionAngleThresholdMax, _RigidBody.collisionAngleThresholdMax );
		this.relativeTo = parameters.relativeTo;
		this.relativeToQ = new THREE.Quaternion();
		this.rotatedRelativeTo = [];
		this.up = shared.cardinalAxes.up.clone();
		this.moving = this.intersection = this.collision = this.sliding = false;
		this.timeWithoutIntersection = 0;
		
		if ( parameters.damping instanceof THREE.Vector3 ) {
			
			this.damping.copy( parameters.damping );
			
		}
		else {
			
			this.damping.multiplyScalar( main.is_number( parameters.damping ) ? parameters.damping : _RigidBody.damping );
			
		}
		
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
	
	VelocityTracker.prototype.update = function ( relativeToQNew ) {
		
		var i, l,
			offsetRotated,
			rigidBody = this.rigidBody,
			mesh,
			scaleMax = 1;
		
		// update relative to q
		
		if ( relativeToQNew instanceof THREE.Quaternion === false ) {
			
			relativeToQNew = retrieve_relative_to_q( this.relativeTo, this.up );
			
		}
		
		if ( relativeToQNew instanceof THREE.Quaternion ) {
			
			this.relativeToQ.copy( relativeToQNew );
			
		}
		
		// force delta
		
		this.forceDelta.multiplySelf( this.speedDelta );
		
		// add delta to forces
		
		this.force.addSelf( this.forceDelta );
		this.forceDelta.copy( rotate_vector3_relative_to( this.forceDelta, this.relativeToQ ) );
		this.forceRotated.addSelf( this.forceDelta );
		
		// check forces against max
		
		if ( this.forceLengthMax < Number.MAX_VALUE ) {
			
			_VectorHelper.clamp_length( this.force, this.forceLengthMax );
			_VectorHelper.clamp_length( this.forceRotated, this.forceLengthMax );
			
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
			
			offsetRotated.copy( rotate_vector3_relative_to( this.offsets[ i ], this.relativeToQ ) );
			
			if ( scaleMax !== 1 ) {
				
				offsetRotated.multiplyScalar( scaleMax );
				
			}
			
		}
		
		// clear delta
		
		this.forceDelta.set( 0, 0, 0 );
		
		// pre damp
		
		this.force.multiplySelf( this.dampingPre );
		this.forceRotated.multiplySelf( this.dampingPre );
		
	};
	
	VelocityTracker.prototype.rotate = function ( rotation ) {
		
		var i, l;
			
		if ( rotation instanceof THREE.Quaternion || rotation instanceof THREE.Matrix4 ) {
			
			// rotate force and offsets
			
			rotation.multiplyVector3( this.forceRotated );
			
			for ( i = 0, l = this.offsetsRotated.length; i < l; i++ ) {
				
				rotation.multiplyVector3( this.offsetsRotated[ i ] );
				
			}
			
		}
		
	};
	
	VelocityTracker.prototype.reset = function () {
		
		this.force.set( 0, 0, 0 );
		this.forceRotated.set( 0, 0, 0 );
		
		this.moving = false;
		
	};
	
	/*===================================================
    
    collider properties
    
    =====================================================*/
	
	function collider_dimensions () {
		
		var collider = this.collider,
			colliderMin,
			colliderMax,
			dimensions = this.utilVec31Dimensions;
		
		// handle collider type
		
		if ( typeof collider.min !== 'undefined' ) {
			
			colliderMin = collider.min;
			colliderMax = collider.max;
			
		}
		else if ( typeof collider.box !== 'undefined' ) {
			
			colliderMin = collider.box.min;
			colliderMax = collider.box.max;
			
		}
		else if ( typeof collider.radiusSq !== 'undefined' ) {
			
			colliderMin = new THREE.Vector3();
			colliderMax = new THREE.Vector3().addScalar( collider.radiusSq );
			
		}
		// collider type not supported
		else {
			
			return dimensions.set( 0, 0, 0 );
			
		}
		
		dimensions.sub( colliderMax, colliderMin );
		
		return dimensions;
		
	}
	
	function collider_dimensions_scaled () {
		
		return this.collider_dimensions().multiplySelf( this.mesh.scale );
		
	}
	
	function collider_radius () {
		
		var dimensions = this.collider_dimensions_scaled();
		
		return Math.max( dimensions.x, dimensions.y, dimensions.z ) * 0.5;
		
	}
	
	/*===================================================
    
	utility
    
    =====================================================*/
	
	function retrieve_relative_to_q ( to, up ) {
		
		var matrix;
		
		if ( to ) {
			
			if ( to instanceof THREE.Object3D ) {
				
				if ( to.useQuaternion === true ) {
					
					to = to.quaternion;
					
				}
				else {
					
					matrix = utilMat41Relative.extractRotation( to.matrix );
					to = utilQ1Relative.setFromRotationMatrix( matrix );
					
				}
				
			}
			
			if ( to instanceof THREE.Vector3 ) {;
				
				to = _VectorHelper.q_to_axis( up, to );
				
			}
			
		}
		
		return to;
		
	}
	
	function rotate_vector3_relative_to ( vec3, to, up ) {
		
		var vec3Rotated = utilVec31Rotated.copy( vec3 );
		
		if ( to instanceof THREE.Quaternion !== true ) {
			
			to = retrieve_relative_to_q( to, up );
		
		}
		
		if ( to instanceof THREE.Quaternion ) {
			
			to.multiplyVector3( vec3Rotated );
			
		}
		
		return vec3Rotated;
		
	}
	
	function bounds_in_direction ( direction ) {
		
		var boundsHalf = this.collider_dimensions_scaled().multiplyScalar( 0.5 ).subSelf( _ObjectHelper.center_offset( this.mesh ) ),
			localDirection = this.utilVec31Bounds,
			meshRotation = this.utilQ1Bounds;
		
		// get local direction
		// seems like extra unnecessary work
		// not sure if there is better way
		
		meshRotation.copy( this.mesh.quaternion ).inverse();
		
		localDirection.copy( direction ).normalize();
		
		meshRotation.multiplyVector3( localDirection );
		
		// set in direction
		
		boundsHalf.multiplySelf( localDirection );
		
		// rotate to match mesh
		
		return rotate_vector3_relative_to( boundsHalf, this.mesh );
		
	}
	
	/*===================================================
    
	gravity body find
    
    =====================================================*/
	
	function find_gravity_body ( bodiesGravity, timeDelta ) {
		
		var i, l,
			j, jl,
			gravityBodiesAttracting,
			gravityBodiesAttractingMeshes,
			gravityBodiesAttractingMeshesExcludingCurrent,
			gravityBody,
			gravityBodyPotential,
			gravityBodyChildren,
			gravityBodyChild,
			gravityMesh,
			gravityBodyDifference = this.utilVec31GravityBody,
			gravityBodyDistancePotential,
			gravityBodyDistance = Number.MAX_VALUE,
			gravityBodyChangeLerpDeltaPct, 
			matrixWorld,
			matrixWorldElements,
			matrixWorldAxis = this.utilVec32GravityBody,
			matrixWorldScale = this.utilVec33GravityBody,
			matrixWorldScaleMax,
			velocityGravity = this.velocityGravity,
			velocityGravityCollision,
			velocityGravityCollisionObject,
			velocityGravityCollisionGravityBody,
			velocityMovement = this.velocityMovement,
			velocityMovementCollision,
			velocityMovementCollisionObject,
			velocityMovementCollisionGravityBody,
			velocityGravityRotatedProjected = this.utilVec34GravityBody,
			velocityMovementRotatedProjected = this.utilVec35GravityBody,
			mesh = this.mesh,
			meshPosition,
			meshPositionProjected = this.utilVec36GravityBody;
		
		// get velocity collisions
		
		velocityGravityCollision = velocityGravity.collision;
		velocityMovementCollision = velocityMovement.collision;
		
		// get velocity collision rigid bodies
		
		if ( velocityGravityCollision ) {
			velocityGravityCollisionObject = velocityGravityCollision.object;
			velocityGravityCollisionGravityBody = extract_parent_gravity_body( velocityGravityCollisionObject );
		}
		if ( velocityMovementCollision ) {
			velocityMovementCollisionObject = velocityMovementCollision.object;
			velocityMovementCollisionGravityBody = extract_parent_gravity_body( velocityMovementCollisionObject );
		}
		
		// attempt to change gravity body
		
		// movement collision with new gravity body
		if ( velocityMovementCollisionGravityBody && this.gravityBody !== velocityMovementCollisionGravityBody ) {
			
			this.change_gravity_body( velocityMovementCollisionGravityBody );
			
		}
		// gravity collision with new gravity body
		else if ( velocityGravityCollisionGravityBody && this.gravityBody !== velocityGravityCollisionGravityBody ) {
			
			this.change_gravity_body( velocityGravityCollisionGravityBody );
			
		}
		// currently changing gravity body
		else if ( this.gravityBodyChanging === true ) {
			
			// lerp delta while changing
			
			if ( this.gravityBodyChangeTime < this.gravityBodyChangeMagnitudeTimeMax ) {
				
				gravityBodyChangeLerpDeltaPct = Math.min( this.gravityBodyChangeTime / this.gravityBodyChangeLerpDeltaTimeMax, 1 );
				this.lerpDelta = this.lerpDeltaGravityChange * ( 1 - gravityBodyChangeLerpDeltaPct ) + this.lerpDeltaLast * gravityBodyChangeLerpDeltaPct;
			
			}
			else {
				
				this.lerpDelta = this.lerpDeltaLast;
				
			}
			
			// gravity magnitude while changing
			
			if ( this.gravityBodyChangeTime >= this.gravityBodyChangeMagnitudeTimeMax ) {
				
				this.gravityMagnitude = this.gravityMagnitudeLast;
				
			}
			
			this.gravityBodyChangeTime += timeDelta;
			
			// if grounded, end change
			
			if ( this.grounded === true ) {
				
				change_gravity_body_end.call( this );
				
			}
			
		}
		// else if not grounded and no movement property or is jumping ( i.e. characters must jump to trigger gravity change to avoid unexpected shift )
		else if ( this.grounded === false && ( typeof mesh.jumping === 'undefined' || mesh.jumping === true ) ) {
			
			// record maximum force values
			
			if ( velocityGravity.forceRecentMax.lengthSq() < velocityGravity.force.lengthSq() ) {
				
				velocityGravity.forceRecentMax.copy( velocityGravity.force );
				
			}
			if ( velocityMovement.forceRecentMax.lengthSq() < velocityMovement.force.lengthSq() ) {
				
				velocityMovement.forceRecentMax.copy( velocityMovement.force );
				
			}
			
			// delay time, so dynamic body does not get stuck between two close gravity bodies
		
			this.gravityBodyChangeDelayTime += timeDelta;
			
			// if delay over max
			
			if ( this.gravityBodyChangeDelayTime >= this.gravityBodyChangeDelayTimeMax ) {
				
				this.gravityBodyChangeDelayTime = 0;
				
				// project mesh position along combined rotated recent max velocity
				
				meshPosition = mesh.matrixWorld.getPosition();
				
				mesh.quaternion.multiplyVector3( velocityGravityRotatedProjected.copy( velocityGravity.forceRecentMax ).multiplyScalar( this.gravityBodyChangeGravityProjectionMod ) );
				mesh.quaternion.multiplyVector3( velocityMovementRotatedProjected.copy( velocityMovement.forceRecentMax ).multiplyScalar( this.gravityBodyChangeMovementProjectionMod ) );
				
				meshPositionProjected.copy( meshPosition ).addSelf( velocityGravityRotatedProjected ).addSelf( velocityMovementRotatedProjected );
				
				// get all gravity bodies that overlap this with gravity radius
				
				gravityBodiesAttracting = [];
				gravityBodiesAttractingMeshes = [];
				
				for ( i = 0, l = bodiesGravity.length; i < l; i++ ) {
					
					gravityBodyPotential = bodiesGravity[ i ];
					gravityMesh = gravityBodyPotential.mesh;
					
					// if is current gravity body
					
					if ( this.gravityBody === gravityBodyPotential ) {
						
						gravityBodiesAttracting.push( gravityBodyPotential );
						gravityBodiesAttractingMeshes.push( gravityBodyPotential.mesh );
						
					}
					else {
						
						gravityBodyDifference.sub( meshPositionProjected, gravityMesh.matrixWorld.getPosition() );
						
						// if within gravity radius
						
						if ( gravityBodyDifference.length() <= gravityBodyPotential.radiusGravity ) {
							
							gravityBodiesAttracting.push( gravityBodyPotential );
							gravityBodiesAttractingMeshes.push( gravityBodyPotential.mesh );
							
						}
						
					}
					
				}
				
				// find closest gravity body
				
				if ( gravityBodiesAttracting.length === 1 ) {
					
					gravityBody = gravityBodiesAttracting[ 0 ];
				
				}
				else if ( gravityBodiesAttracting.length > 1 ) {
					
					for ( i = 0, l = gravityBodiesAttracting.length; i < l; i++ ) {
						
						gravityBodyPotential = gravityBodiesAttracting[ i ];
						gravityMesh = gravityBodyPotential.mesh;
						
						// for each child of gravity body, excluding all attracting meshes that are not this gravity mesh
						
						gravityBodiesAttractingMeshesExcludingCurrent = gravityBodiesAttractingMeshes.slice( 0, i ).concat( gravityBodiesAttractingMeshes.slice( i + 1 ) );
						
						gravityBodyChildren = _SceneHelper.extract_children_from_objects( gravityMesh, gravityMesh, gravityBodiesAttractingMeshesExcludingCurrent );
						
						for ( j = 0, jl = gravityBodyChildren.length; j < jl; j++ ) {
							
							gravityBodyChild = gravityBodyChildren[ j ];
							
							// child must be the gravity mesh or have a rigid body and not be a gravity source itself
							
							if ( gravityBodyChild === gravityMesh || ( gravityBodyChild.rigidBody && gravityBodyChild.rigidBody.gravitySource !== true ) ) {
								
								matrixWorld = gravityBodyChild.matrixWorld;
								
								// difference in position
								
								gravityBodyDifference.sub( meshPositionProjected, matrixWorld.getPosition() );
								
								// account for bounding radius of child scaled to world
								
								matrixWorldElements = matrixWorld.elements;

								matrixWorldScale.x = matrixWorldAxis.set( matrixWorldElements[0], matrixWorldElements[1], matrixWorldElements[2] ).length();
								matrixWorldScale.y = matrixWorldAxis.set( matrixWorldElements[4], matrixWorldElements[5], matrixWorldElements[6] ).length();
								matrixWorldScale.z = matrixWorldAxis.set( matrixWorldElements[8], matrixWorldElements[9], matrixWorldElements[10] ).length();
								matrixWorldScaleMax = Math.max( matrixWorldScale.x, matrixWorldScale.y, matrixWorldScale.z );
								
								gravityBodyDistancePotential = gravityBodyDifference.length() - ( gravityBodyChild.boundRadius * matrixWorldScaleMax );
								
								if ( gravityBodyDistancePotential < gravityBodyDistance ) {
									
									gravityBody = gravityBodyPotential;
									gravityBodyDistance = gravityBodyDistancePotential;
									
								}
								
							}
							
						}
						
					}
					
				}
				
				// swap to closest gravity body
				
				if ( gravityBody instanceof RigidBody && this.gravityBody !== gravityBody ) {
					
					this.change_gravity_body( gravityBody, true );
					
					velocityGravity.force.multiplyScalar( this.gravityBodyChangeForceMod );
					//velocityMovement.force.multiplyScalar( this.gravityBodyChangeForceMod );
					
				}
				
			}
			
		}
		else {
			
			velocityGravity.forceRecentMax.set( 0, 0, 0 );
			velocityMovement.forceRecentMax.set( 0, 0, 0 );
			
		}
		
	}
	
	function extract_parent_gravity_body ( object, last ) {
		
		var gravityBody;
		
		while( object ) {
			
			if ( object.rigidBody && object.rigidBody.gravitySource === true ) {
				
				gravityBody = object.rigidBody;
				
				if ( last !== true ) {
					
					break;
					
				}
				
			}
			
			object = object.parent;
			
		}
		
		return gravityBody;
		
	}
	
	/*===================================================
    
	gravity body change
    
    =====================================================*/
	
	function change_gravity_body ( gravityBody, ease ) {
		
		var index,
			gravityBodyLast = this.gravityBody;
		
		// if in middle of change already
		
		if ( this.gravityBodyChanging !== false ) {
			
			change_gravity_body_end.call( this );
		
		}
		
		// new gravity body
		
		this.gravityBody = gravityBody;
		
		if ( this.gravityBody instanceof RigidBody ) {
			
			// add to body's gravity children
			
			add_gravity_child.call( this.gravityBody, this );
			
			// if should ease change
			
			if ( ease === true ) {
				
				this.lerpDeltaLast = this.lerpDelta;
				this.lerpDelta = this.lerpDeltaGravityChange;
				
				if ( this.gravityMagnitude instanceof THREE.Vector3 ) {
					
					this.gravityMagnitudeLast = this.gravityMagnitude;
					
				}
				this.gravityMagnitude = this.gravityBodyChangeMagnitude;
				this.gravityBodyChangeTime = 0;
				
				this.gravityBodyChanging = true;
				
			}
			
		}
		// remove from previous gravity body
		else if ( gravityBodyLast instanceof RigidBody ) {
			
			remove_gravity_child.call( gravityBodyLast, this );
			
		}
		
	}
	
	function change_gravity_body_end () {
		
		this.gravityBodyChanging = false;
		
		this.lerpDelta = this.lerpDeltaLast;
		this.gravityMagnitude = this.gravityMagnitudeLast;
		
	}
	
	/*===================================================
    
	gravity children
    
    =====================================================*/
	
	function add_gravity_child ( gravityChild ) {
		
		var index;
		
		// remove from previous gravity body
		
		if ( gravityChild.gravityBody instanceof RigidBody ) {
			
			remove_gravity_child.call( gravityChild.gravityBody, gravityChild );
			
		}
		
		// add to new
		
		index = main.index_of_value( this.gravityChildren, gravityChild );
		
		if ( index === -1 ) {
			
			this.gravityChildren.push( gravityChild );
			
			// if at least 1 child
			
			if ( this.gravityChildren.length > 0 ) {
				
				// stop all morphs
				
				this.mesh.morphs.stop_all();
				
			}
			
		}
		
	}
	
	function remove_gravity_child ( gravityChild ) {
		
		var index;
		
		index = main.index_of_value( this.gravityChildren, gravityChild );
		
		if ( index !== -1 ) {
			
			this.gravityChildren.splice( index, 1 );
			
			// if no children
			
			if ( this.gravityChildren.length === 0 ) {
				
				// play idle morph
				
				this.mesh.morphs.play( 'idle', { loop: true, startDelay: true } );
				
			}
			
		}
		
	}
	
} (KAIOPUA) );