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
		assetPath = "assets/modules/physics/RigidBody.js",
		_RigidBody = {},
		_VectorHelper,
		_RayHelper,
		_ObjectHelper,
		bodyCount = 0;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _RigidBody,
		requirements: [
			"assets/modules/utils/VectorHelper.js",
			"assets/modules/utils/RayHelper.js",
			"assets/modules/utils/ObjectHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( vh, rh, oh ) {
		console.log('internal vector helper', _RigidBody);
		_VectorHelper = vh;
		_RayHelper = rh;
		_ObjectHelper = oh;
		
		// instance
		
		_RigidBody.Instance = RigidBody;
		_RigidBody.Instance.prototype = {};
		_RigidBody.Instance.prototype.constructor = _RigidBody.Instance;
		_RigidBody.Instance.prototype.clone = clone;
		_RigidBody.Instance.prototype.collider_dimensions = collider_dimensions;
		_RigidBody.Instance.prototype.collider_dimensions_scaled = collider_dimensions_scaled;
		_RigidBody.Instance.prototype.collider_radius = collider_radius;
		_RigidBody.Instance.prototype.offset_in_direction = offset_in_direction;
		
	}
	
	/*===================================================
    
    rigid body
    
    =====================================================*/
	
	function RigidBody ( mesh, parameters ) {
		
		bodyCount++;
		
		var geometry,
			bboxDimensions,
			bodyType,
			width,
			height,
			depth,
			needWidth,
			needHeight,
			needDepth,
			radius,
			position;
		
		// utility
		
		this.utilVec31Dimensions = new THREE.Vector3();
		this.utilVec31Offset = new THREE.Vector3();
		this.utilQ4Offset = new THREE.Quaternion();
		
		// handle parameters
		
		parameters = parameters || {};
		
		this.id = bodyCount;
		
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
			
			this.collider = new _RayHelper.SphereCollider( position, radius );
			
		}
		else if ( bodyType === 'plane' ) {
			
			this.collider = new _RayHelper.PlaneCollider( position, parameters.normal || new THREE.Vector3( 0, 0, 1 ) );
			
		}
		// default box
		else {
			
			this.collider = new _RayHelper.ObjectColliderOBB( this.mesh );
			
		}
		
		// radius
		
		this.radius = this.collider_radius();
		
		// dynamic or static, set mass to 0 for a static object
		
		if ( parameters.hasOwnProperty('dynamic') ) {
			
			this.dynamic = parameters.dynamic;
			
		}
		else {
			
			this.mass = 0;
			this.dynamic = false;
			
		}
		
		this.axes = {
			up: shared.cardinalAxes.up.clone(),
			forward: shared.cardinalAxes.forward.clone(),
			right: shared.cardinalAxes.right.clone()
		};
		
		this.velocityMovement = generate_velocity_tracker( { 
			damping: parameters.movementDamping,
			offset: parameters.movementOffset,
			relativeRotation: this.mesh
		} );
		this.velocityGravity = generate_velocity_tracker( { 
			damping: parameters.gravityDamping,
			offset: parameters.gravityOffset
		} );
		
		this.safe = true;
		this.safetynet = {
			position: new THREE.Vector3(),
			quaternion: new THREE.Quaternion()
		};
		this.safetynetstart = new signals.Signal();
		this.safetynetend = new signals.Signal();
		
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
		parameters.movementOffset = this.velocityMovement.offset.clone();
		parameters.gravityDamping = this.velocityGravity.damping.clone();
		parameters.gravityOffset = this.velocityGravity.offset.clone();
		
		return new _RigidBody.Instance( mesh, parameters );
		
	}
	
	/*===================================================
    
    velocity
    
    =====================================================*/
	
	function generate_velocity_tracker ( parameters ) {
		var velocity = {};
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.damping = parameters.damping || 0.99;
		
		// init velocity
		
		velocity.force = new THREE.Vector3();
		velocity.forceRotated = new THREE.Vector3();
		velocity.damping = parameters.damping instanceof THREE.Vector3 ? parameters.damping : new THREE.Vector3();
		velocity.offset = parameters.offset instanceof THREE.Vector3 ? parameters.offset : new THREE.Vector3();
		velocity.relativeRotation = parameters.relativeRotation;
		velocity.moving = false;
		velocity.intersection = false;
		velocity.timeWithoutIntersection = 0;
		
		if ( main.is_number( parameters.damping ) === true ) {
			
			velocity.damping.addScalar( parameters.damping );
			
		}
		
		return velocity;
	}
	
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
    
	offset
    
    =====================================================*/
	
	function offset_in_direction ( direction ) {
		
		var offset,
			localDirection = this.utilVec31Offset,
			meshRotation = this.utilQ4Offset;
		
		// copy half of dimensions
		
		offset = this.collider_dimensions_scaled().multiplyScalar( 0.5 );
		
		// add center offset
		
		offset.subSelf( _ObjectHelper.center_offset( this.mesh ) );
		
		// get local direction
		// seems like extra unnecessary work
		// not sure if there is better way
		
		meshRotation.copy( this.mesh.quaternion ).inverse();
		
		localDirection.copy( direction ).normalize();
		
		meshRotation.multiplyVector3( localDirection );
		
		// set in direction
		
		offset.multiplySelf( localDirection );
		
		// rotate to match mesh
		
		offset = _VectorHelper.rotate_vector3_to_mesh_rotation( this.mesh, offset );
		
		return offset;
		
	}
	
} (KAIOPUA) );