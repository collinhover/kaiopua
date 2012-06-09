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
		
		// properties
		
		_RigidBody.lerpDelta = 0.1;
		_RigidBody.lerpDeltaGravityChange = 0;
		_RigidBody.gravityBodyRadiusAdditionPct = 1;
		_RigidBody.gravityBodyChangeDelayTimeMax = 250;
		_RigidBody.gravityBodyChangeLerpDeltaTimeMax = 500;
		_RigidBody.gravityBodyChangeMagnitudeTimeMax = 500;
		_RigidBody.gravityBodyChangeGravityProjectionMod = 5;
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
		_RigidBody.Instance.prototype.offset_in_direction = offset_in_direction;
		_RigidBody.Instance.prototype.find_gravity_body = find_gravity_body;
		_RigidBody.Instance.prototype.change_gravity_body = change_gravity_body;
		
		Object.defineProperty( _RigidBody.Instance.prototype, 'grounded', { 
			get : function () { return Boolean( this.velocityGravity.collision ) && !this.velocityGravity.moving }
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
		
		bodyCount++;
		
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
			gravityBodyRadiusAdditionPct,
			gravityBodyRadiusAddition;
		
		// utility
		
		this.utilVec31Dimensions = new THREE.Vector3();
		this.utilVec31GravityBody = new THREE.Vector3();
		this.utilVec32GravityBody = new THREE.Vector3();
		this.utilVec33GravityBody = new THREE.Vector3();
		this.utilVec34GravityBody = new THREE.Vector3();
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
		
		this.velocityMovement = new VelocityTracker( { 
			damping: parameters.movementDamping,
			offset: parameters.movementOffset,
			relativeRotation: this.mesh
		} );
		this.velocityGravity = new VelocityTracker( { 
			damping: parameters.gravityDamping,
			offset: parameters.gravityOffset
		} );
		
		// safety net
		
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
	
	function VelocityTracker ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.damping = parameters.damping || 0.99;
		
		// properties
		
		this.force = new THREE.Vector3();
		this.forceRotated = new THREE.Vector3();
		this.damping = parameters.damping instanceof THREE.Vector3 ? parameters.damping : new THREE.Vector3();
		this.offset = parameters.offset instanceof THREE.Vector3 ? parameters.offset : new THREE.Vector3();
		this.relativeRotation = parameters.relativeRotation;
		this.moving = false;
		this.intersection = false;
		this.timeWithoutIntersection = 0;
		
		if ( main.is_number( parameters.damping ) === true ) {
			
			this.damping.addScalar( parameters.damping );
			
		}
		
		this.reset();
		
	}
	
	VelocityTracker.prototype.reset = function () {
		
		this.force.set( 0, 0, 0 );
		
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
	
	/*===================================================
    
	gravity body find
    
    =====================================================*/
	
	function find_gravity_body ( bodiesGravity, timeDelta ) {
		
		var i, l,
			bodiesGravityAttracting,
			gravityBodyPotential,
			gravityMesh,
			gravityMeshScale,
			gravityBodyDifference = this.utilVec31GravityBody,
			gravityBodyDistancePotential,
			gravityBody,
			gravityBodyDistance = Number.MAX_VALUE,
			gravityBodyChangeLerpDeltaPct, 
			velocityGravityCollision,
			velocityGravityCollisionRigidBody,
			velocityMovementCollision,
			velocityMovementCollisionRigidBody,
			velocityGravityRotatedProjected = this.utilVec32GravityBody,
			velocityMovementRotatedProjected = this.utilVec33GravityBody,
			meshPosition,
			meshPositionProjected = this.utilVec34GravityBody;
		
		// get velocity collisions
		
		velocityGravityCollision = this.velocityGravity.collision;
		velocityMovementCollision = this.velocityMovement.collision;
		
		// get velocity collision rigid bodies
		
		if ( velocityGravityCollision ) {
			velocityGravityCollisionRigidBody = velocityGravityCollision.object.rigidBody;
		}
		if ( velocityMovementCollision ) {
			velocityMovementCollisionRigidBody = velocityMovementCollision.object.rigidBody;
		}
		
		// attempt to change gravity body
		
		// movement collision with new gravity body
		if ( velocityMovementCollisionRigidBody && velocityMovementCollisionRigidBody.gravitySource === true && this.gravityBody !== velocityMovementCollisionRigidBody ) {
			
			this.change_gravity_body( velocityMovementCollisionRigidBody );
			
		}
		// gravity collision with new gravity body
		else if ( velocityGravityCollisionRigidBody && velocityGravityCollisionRigidBody.gravitySource === true && this.gravityBody !== velocityGravityCollisionRigidBody ) {
			
			this.change_gravity_body( velocityGravityCollisionRigidBody );
			
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
		// else if not grounded
		else if ( this.grounded === false ) {
			
			// delay time, so dynamic body does not get stuck between two close gravity bodies
		
			this.gravityBodyChangeDelayTime += timeDelta;
			
			// if delay over max
			
			if ( this.gravityBodyChangeDelayTime >= this.gravityBodyChangeDelayTimeMax ) {
				
				this.gravityBodyChangeDelayTime = 0;
				
				// project mesh position along combined rotated velocity
				
				meshPosition = this.mesh.matrixWorld.getPosition();
				
				velocityGravityRotatedProjected.copy( this.velocityGravity.forceRotated ).multiplyScalar( this.gravityBodyChangeGravityProjectionMod );
				velocityMovementRotatedProjected.copy( this.velocityMovement.forceRotated ).multiplyScalar( this.gravityBodyChangeMovementProjectionMod );
				
				meshPositionProjected.copy( meshPosition ).addSelf( velocityGravityRotatedProjected ).addSelf( velocityMovementRotatedProjected );
				
				// get all gravity bodies that overlap this with gravity radius
				
				bodiesGravityAttracting = [];
				
				for ( i = 0, l = bodiesGravity.length; i < l; i++ ) {
					
					gravityBodyPotential = bodiesGravity[ i ];
					
					if ( gravityBodyPotential !== this.gravityBody ) {
						
						gravityMesh = gravityBodyPotential.mesh;
						gravityMeshScale = gravityMesh.scale;
						
						gravityBodyDifference.sub( meshPositionProjected, gravityMesh.matrixWorld.getPosition() );

						// if within gravity radius, store in attracting list
						
						if ( gravityBodyDifference.length() <= gravityBodyPotential.radiusGravity ) {
							
							bodiesGravityAttracting.push( gravityBodyPotential );
							
						}
						
					}
					
				}
				
				// find closest gravity body
				
				if ( bodiesGravityAttracting.length === 1 ) {
					
					gravityBody = bodiesGravityAttracting[ 0 ];
				
				}
				else if ( bodiesGravityAttracting.length > 1 ) {
					
					for ( i = 0, l = bodiesGravityAttracting.length; i < l; i++ ) {
						
						gravityBodyPotential = bodiesGravityAttracting[ i ];
						gravityMesh = gravityBodyPotential.mesh;
						gravityMeshScale = gravityMesh.scale;
						
						gravityBodyDifference.sub( meshPositionProjected, gravityMesh.matrixWorld.getPosition() );
						gravityBodyDistancePotential = gravityBodyDifference.length() - ( gravityBodyPotential.radiusCore * Math.max( gravityMeshScale.x, gravityMeshScale.y, gravityMeshScale.z ) );
						
						if ( gravityBodyDistancePotential < gravityBodyDistance ) {
							
							gravityBody = gravityBodyPotential;
							gravityBodyDistance = gravityBodyDistancePotential;
							
						}
						
					}
					
				}
				
				// swap to closest gravity body
				
				if ( gravityBody instanceof RigidBody && this.gravityBody !== gravityBody ) {
					
					// test
					if ( this.gbcline ) this.mesh.remove( this.gbcline );
					this.gbclineGeom = new THREE.Geometry();
					this.gbclineGeom.vertices.push( new THREE.Vector3(), new THREE.Vector3().add( this.velocityGravity.force.clone().multiplyScalar( this.gravityBodyChangeGravityProjectionMod ), this.velocityMovement.force.clone().multiplyScalar( this.gravityBodyChangeMovementProjectionMod ) ) );
					this.gbcline = new THREE.Line( this.gbclineGeom, new THREE.LineBasicMaterial( { color: 0xFF0000, linewidth: 8 } ), THREE.LinePieces );
					this.mesh.add( this.gbcline );
					// test
					
					this.change_gravity_body( gravityBody, true );
					
					this.velocityGravity.force.multiplyScalar( this.gravityBodyChangeForceMod );
					//this.velocityMovement.force.multiplyScalar( this.gravityBodyChangeForceMod );
					
				}
				
			}
			
		}
		
		
	}
	
	/*===================================================
    
	gravity body change
    
    =====================================================*/
	
	function change_gravity_body ( gravityBody, ease ) {
		
		var index;
		
		// if in middle of change already
		
		if ( this.gravityBodyChanging !== false ) {
			
			change_gravity_body_end.call( this );
			
		}
		
		// remove from previous gravity body
		
		if ( this.gravityBody instanceof RigidBody ) {
			
			remove_gravity_child.call( this.gravityBody, this );
			
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
		
		index = this.gravityChildren.indexOf( gravityChild );
		
		if ( index === -1 ) {
			
			this.gravityChildren.push( gravityChild );
			
			// if at least 1 child
			
			if ( this.gravityChildren.length > 0 ) {
				
				// stop all morphs
				
				this.mesh.morphs.stopAll();
				
			}
			
		}
		
	}
	
	function remove_gravity_child ( gravityChild ) {
		
		var index;
		
		index = this.gravityChildren.indexOf( gravityChild );
		
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