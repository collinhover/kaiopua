/*
Physics.js
Physics module, handles physics in game using JigLibJS.
*/
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        game = main.game = main.game || {},
		core = game.core = game.core || {},
		physics = core.physics = core.physics || {},
		mathhelper,
		ready = false,
		system,
		cardinalAxes,
		gravitySource,
		gravityMagnitude,
		linksBaseName = 'vis_to_phys_link_',
		linksCount = 0,
		links = [],
		scaleSpeedExp = Math.log( 1.5 ),
		utilVec31Integrate,
		utilVec32Integrate,
		utilVec31Offset,
		utilVec31Raycast,
		utilVec31Velocity,
		utilQ1Integrate,
		utilQ2Integrate,
		utilQ3Integrate,
		utilQ4Offset,
		utilRay1Casting,
		line4;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	physics.init = init;
	physics.translate = translate;
	physics.add = add;
	physics.remove = remove;
	physics.start = start;
	physics.stop = stop;
	physics.update = update;
	physics.dimensions_from_collider = dimensions_from_collider;
	
	// getters and setters
	
	Object.defineProperty(physics, 'gravitySource', { 
		get : function () { return gravitySource; },
		set : set_gravity_source
	});
	
	Object.defineProperty(physics, 'gravityMagnitude', { 
		get : function () { return gravityMagnitude; },
		set : set_gravity_magnitude
	});
	
	Object.defineProperty(physics, 'system', { 
		get : function () { return system; }
	});
	
	/*===================================================
    
    external init
    
    =====================================================*/
	
	function init () {
		
		if ( ready !== true ) {
		
			init_system();
			
			ready = true;
		
		}
		
	}
	
	function init_system() {
		
		// system
		
		system = THREE.Collisions;
		set_gravity_source( new THREE.Vector3( 0, 0, 0 ) );
		set_gravity_magnitude( new THREE.Vector3( 0, -1, 0 ) );
		
		// set cardinal axes
		
		cardinalAxes = {
			up: new THREE.Vector3( 0, 1, 0 ),
			forward: new THREE.Vector3( 0, 0, 1 ),
			right: new THREE.Vector3( -1, 0, 0 )
		}
		
		// utility / conversion objects
		
		utilVec31Integrate = new THREE.Vector3();
		utilVec32Integrate = new THREE.Vector3();
		utilVec31Offset = new THREE.Vector3();
		utilVec31Raycast = new THREE.Vector3();
		utilVec31Velocity = new THREE.Vector3();
		utilQ1Integrate = new THREE.Quaternion();
		utilQ2Integrate = new THREE.Quaternion();
		utilQ3Integrate = new THREE.Quaternion();
		utilQ4Offset = new THREE.Quaternion();
		utilRay1Casting = new THREE.Ray();
		
		mathhelper = game.workers.mathhelper;
		
		// three collision fixes
		
		add_three_collision_fixes();
		
		// line testing
		
		var geom4 = new THREE.Geometry();
		geom4.vertices.push( new THREE.Vertex( new THREE.Vector3(-100, 0, 0) ) );
		geom4.vertices.push( new THREE.Vertex( new THREE.Vector3( 100, 0, 0) ) );
		
		var lineMat4 = new THREE.LineBasicMaterial( { color: 0xff00ff, opacity: 1, linewidth: 1 } );
		
		line4 = new THREE.Line(geom4, lineMat4);
		
		game.scene.add( line4 );
		
	}
	
	/*===================================================
    
    collision fixes
    
    =====================================================*/
	
	function add_three_collision_fixes () {
		
		var utilMat1RayLocal = new THREE.Matrix4(),
			utilVec31RayLocal = new THREE.Vector3(),
			utilVec31RayBox = new THREE.Vector3(),
			utilVec32RayBox = new THREE.Vector3();
		
		// temporary
		
		var v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3();
		var dot, intersect, distance;
		
		THREE.CollisionSystem.prototype.distanceFromIntersection = function ( origin, direction, position ) {
	
			v0.sub( position, origin );
			dot = v0.dot( direction );
	
			if ( dot <= 0 ) return null; // check if position behind origin.
	
			intersect = v1.add( origin, v2.copy( direction ).multiplyScalar( dot ) );
			distance = position.distanceTo( intersect );
	
			return distance;
	
		}
		
		THREE.Matrix4.prototype.extractRotation = function ( m ) {
	
			var vector = THREE.Matrix4.__v1;
	
			var scaleX = 1 / vector.set( m.n11, m.n21, m.n31 ).length();
			var scaleY = 1 / vector.set( m.n12, m.n22, m.n32 ).length();
			var scaleZ = 1 / vector.set( m.n13, m.n23, m.n33 ).length();
	
			this.n11 = m.n11 * scaleX;
			this.n21 = m.n21 * scaleX;
			this.n31 = m.n31 * scaleX;
	
			this.n12 = m.n12 * scaleY;
			this.n22 = m.n22 * scaleY;
			this.n32 = m.n32 * scaleY;
	
			this.n13 = m.n13 * scaleZ;
			this.n23 = m.n23 * scaleZ;
			this.n33 = m.n33 * scaleZ;
	
			return this;
	
		}
		
		// r46 ray

		THREE.Ray = function ( origin, direction ) {
		
			this.origin = origin || new THREE.Vector3();
			this.direction = direction || new THREE.Vector3();
		
			this.intersectScene = function ( scene ) {
		
				return this.intersectObjects( scene.children );
		
			};
		
			this.intersectObjects = function ( objects ) {
		
				var i, l, object,
				intersects = [];
		
				for ( i = 0, l = objects.length; i < l; i ++ ) {
		
					Array.prototype.push.apply( intersects, this.intersectObject( objects[ i ] ) );
		
				}
		
				intersects.sort( function ( a, b ) { return a.distance - b.distance; } );
		
				return intersects;
		
			};
		
			var a = new THREE.Vector3();
			var b = new THREE.Vector3();
			var c = new THREE.Vector3();
			var d = new THREE.Vector3();
		
			var origin = new THREE.Vector3();
			var direction = new THREE.Vector3();
			var vector = new THREE.Vector3();
			var normal = new THREE.Vector3();
			var intersectPoint = new THREE.Vector3()
		
			this.intersectObject = function ( object ) {
		
				var intersect, intersects = [];
		
				for ( var i = 0, l = object.children.length; i < l; i ++ ) {
		
					Array.prototype.push.apply( intersects, this.intersectObject( object.children[ i ] ) );
		
				}
		
				if ( object instanceof THREE.Particle ) {
		
					var distance = distanceFromIntersection( this.origin, this.direction, object.matrixWorld.getPosition() );
		
					if ( distance === null || distance > object.scale.x ) {
		
						return [];
		
					}
		
					intersect = {
		
						distance: distance,
						point: object.position,
						face: null,
						object: object
		
					};
		
					intersects.push( intersect );
		
				} else if ( object instanceof THREE.Mesh ) {
		
					// Checking boundingSphere
		
					var distance = distanceFromIntersection( this.origin, this.direction, object.matrixWorld.getPosition() );
		
					if ( distance === null || distance > object.geometry.boundingSphere.radius * Math.max( object.scale.x, Math.max( object.scale.y, object.scale.z ) ) ) {
		
						return intersects;
		
					}
		
					// Checking faces
		
					var f, fl, face, dot, scalar,
					geometry = object.geometry,
					vertices = geometry.vertices,
					objMatrix;
		
					object.matrixRotationWorld.extractRotation( object.matrixWorld );
		
					for ( f = 0, fl = geometry.faces.length; f < fl; f ++ ) {
		
						face = geometry.faces[ f ];
		
						origin.copy( this.origin );
						direction.copy( this.direction );
		
						objMatrix = object.matrixWorld;
		
						// check if face.centroid is behind the origin
		
						vector = objMatrix.multiplyVector3( vector.copy( face.centroid ) ).subSelf( origin );
						dot = vector.dot( direction );
		
						if ( dot <= 0 ) continue;
		
						//
		
						a = objMatrix.multiplyVector3( a.copy( vertices[ face.a ].position ) );
						b = objMatrix.multiplyVector3( b.copy( vertices[ face.b ].position ) );
						c = objMatrix.multiplyVector3( c.copy( vertices[ face.c ].position ) );
						
						normal = object.matrixRotationWorld.multiplyVector3( normal.copy( face.normal ) );
						dot = direction.dot( normal );
		
						if ( object.doubleSided || ( object.flipSided ? dot > 0 : dot < 0 ) ) { // Math.abs( dot ) > 0.0001
		
							scalar = normal.dot( vector.sub( a, origin ) ) / dot;
							intersectPoint.add( origin, direction.multiplyScalar( scalar ) );
		
							if ( face instanceof THREE.Face3 ) {
		
								if ( pointInFace3( intersectPoint, a, b, c ) ) {
		
									intersect = {
		
										distance: origin.distanceTo( intersectPoint ),
										point: intersectPoint.clone(),
										face: face,
										object: object
		
									};
		
									intersects.push( intersect );
		
								}
		
							} else if ( face instanceof THREE.Face4 ) {
								
								d = objMatrix.multiplyVector3( d.copy( vertices[ face.d ].position ) );
								
								if ( pointInFace3( intersectPoint, a, b, d ) || pointInFace3( intersectPoint, b, c, d ) ) {
		
									intersect = {
		
										distance: origin.distanceTo( intersectPoint ),
										point: intersectPoint.clone(),
										face: face,
										object: object
		
									};
		
									intersects.push( intersect );
		
								}
		
							}
		
						}
		
					}
		
				}
		
				return intersects;
		
			}
		
			var v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3();
			var dot, intersect, distance;
		
			function distanceFromIntersection( origin, direction, position ) {
		
				v0.sub( position, origin );
				dot = v0.dot( direction );
		
				if ( dot <= 0 ) return null; // check if position behind origin.
		
				intersect = v1.add( origin, v2.copy( direction ).multiplyScalar( dot ) );
				distance = position.distanceTo( intersect );
		
				return distance;
		
			}
		
			// http://www.blackpawn.com/texts/pointinpoly/default.html
		
			var dot00, dot01, dot02, dot11, dot12, invDenom, u, v;
		
			function pointInFace3( p, a, b, c ) {
		
				v0.sub( c, a );
				v1.sub( b, a );
				v2.sub( p, a );
		
				dot00 = v0.dot( v0 );
				dot01 = v0.dot( v1 );
				dot02 = v0.dot( v2 );
				dot11 = v1.dot( v1 );
				dot12 = v1.dot( v2 );
		
				invDenom = 1 / ( dot00 * dot11 - dot01 * dot01 );
				u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom;
				v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;
		
				return ( u >= 0 ) && ( v >= 0 ) && ( u + v < 1 );
		
			}
		
		};
		
		// localize ray to collider
		
		THREE.CollisionSystem.prototype.makeRayLocal = function( ray, m ) {
			
			var scale,
				mMat,
				mCopy;

			var rt = THREE.CollisionSystem.__r;
			rt.origin.copy( ray.origin );
			rt.direction.copy( ray.direction );
			
			if ( m instanceof THREE.Mesh ) {
				
				scale = m.scale,
				mMat = m.matrixWorld,
				mCopy = utilMat1RayLocal;
				
				// get copy of m world matrix without scale applied
				// matrix with scale does not seem to invert correctly
				
				mCopy.extractPosition( mMat );
				mCopy.extractRotation( mMat, scale );
				
				// invert copy
				
				var mt = THREE.CollisionSystem.__m;
				mt.getInverse( mCopy );
				
				mt.multiplyVector3( rt.origin );
				mt.rotateAxis( rt.direction );
				rt.direction.normalize();
				
			}

			return rt;

		};
		
		// ray mesh
		
		THREE.CollisionSystem.prototype.rayMesh = function( r, me ) {
			
			var i, l,
				p0 = new THREE.Vector3(),
				p1 = new THREE.Vector3(),
				p2 = new THREE.Vector3(),
				p3 = new THREE.Vector3(),
				mesh = me.mesh,
				scale = mesh.scale,
				geometry = mesh.geometry,
				vertices = geometry.vertices,
				rt = this.makeRayLocal( r, mesh );
			
			var d = Number.MAX_VALUE;
			var nearestface;
			
			for( i = 0, l = me.numFaces; i < l; i ++ ) {
				
				var face = geometry.faces[ i ];
				
				p0.copy( vertices[ face.a ].position ).multiplySelf( scale );
				p1.copy( vertices[ face.b ].position ).multiplySelf( scale );
				p2.copy( vertices[ face.c ].position ).multiplySelf( scale );
				
				if ( face instanceof THREE.Face4 ) {
					
					p3.copy( vertices[ face.d ].position ).multiplySelf( scale );
					
					var nd = this.rayTriangle( rt, p0, p1, p3, d, this.collisionNormal, mesh );
					
					if( nd < d ) {
						
						d = nd;
						nearestface = i;
						me.normal.copy( this.collisionNormal );
						me.normal.normalize();
						
					}
					
					nd = this.rayTriangle( rt, p1, p2, p3, d, this.collisionNormal, mesh );
					
					if( nd < d ) {
						
						d = nd;
						nearestface = i;
						me.normal.copy( this.collisionNormal );
						me.normal.normalize();
						
					}
					
				}
				else {
					
					var nd = this.rayTriangle( rt, p0, p1, p2, d, this.collisionNormal, mesh );
					
					if( nd < d ) {
						
						d = nd;
						nearestface = i;
						me.normal.copy( this.collisionNormal );
						me.normal.normalize();
						
					}
					
				}
				
			}
			
			return {dist: d, faceIndex: nearestface};
			
		};
		
		// ray box
		
		THREE.CollisionSystem.prototype.rayBox = function( ray, ab ) {
			
			var rt = this.makeRayLocal( ray, ab.mesh ),
				abMin = utilVec31RayBox.copy( ab.min ),
				abMax = utilVec32RayBox.copy( ab.max ),
				origin = rt.origin,
				direction = rt.direction,
				scale;
			
			//rt.origin.copy( ray.origin );
			//rt.direction.copy( ray.direction );
			
			if ( ab.dynamic && ab.mesh && ab.mesh.scale ) {
				
				scale = ab.mesh.scale;
				
				abMin.multiplySelf( scale );
				abMax.multiplySelf( scale );
				
			}
			
			var xt = 0, yt = 0, zt = 0;
			var xn = 0, yn = 0, zn = 0;
			var ins = true;
			
			if( origin.x < abMin.x ) {
				
				xt = abMin.x - origin.x;
				xt /= direction.x;
				ins = false;
				xn = -1;
				
			} else if( origin.x > abMax.x ) {
				
				xt = abMax.x - origin.x;
				xt /= direction.x;
				ins = false;
				xn = 1;
				
			}
			
			if( origin.y < abMin.y ) {
				
				yt = abMin.y - origin.y;
				yt /= direction.y;
				ins = false;
				yn = -1;
				
			} else if( origin.y > abMax.y ) {
				
				yt = abMax.y - origin.y;
				yt /= direction.y;
				ins = false;
				yn = 1;
				
			}
			
			if( origin.z < abMin.z ) {
				
				zt = abMin.z - origin.z;
				zt /= direction.z;
				ins = false;
				zn = -1;
				
			} else if( origin.z > abMax.z ) {
				
				zt = abMax.z - origin.z;
				zt /= direction.z;
				ins = false;
				zn = 1;
				
			}
			
			if( ins ) return -1;
			
			var which = 0;
			var t = xt;
			
			if( yt > t ) {
				
				which = 1;
				t = yt;
				
			}
			
			if ( zt > t ) {
				
				which = 2;
				t = zt;
				
			}
			
			switch( which ) {
				
				case 0:
					
					var y = origin.y + direction.y * t;
					if ( y < abMin.y || y > abMax.y ) return Number.MAX_VALUE;
					var z = origin.z + direction.z * t;
					if ( z < abMin.z || z > abMax.z ) return Number.MAX_VALUE;
					ab.normal.set( xn, 0, 0 );
					break;
					
				case 1:
					
					var x = origin.x + direction.x * t;
					if ( x < abMin.x || x > abMax.x ) return Number.MAX_VALUE;
					var z = origin.z + direction.z * t;
					if ( z < abMin.z || z > abMax.z ) return Number.MAX_VALUE;
					ab.normal.set( 0, yn, 0) ;
					break;
					
				case 2:
					
					var x = origin.x + direction.x * t;
					if ( x < abMin.x || x > abMax.x ) return Number.MAX_VALUE;
					var y = origin.y + direction.y * t;
					if ( y < abMin.y || y > abMax.y ) return Number.MAX_VALUE;
					ab.normal.set( 0, 0, zn );
					break;
					
			}
			
			return t;
			
		};
		
	}
	
	/*===================================================
    
    translate / add / remove
    
    =====================================================*/
	
	// translates a mesh + parameters into a new rigid body
	
	function translate ( mesh, parameters ) {
		
		var i, l,
			geometry,
			bbox,
			bboxDimensions,
			bodyType,
			rigidBody,
			collider,
			movable = false,
			width,
			height,
			depth,
			needWidth,
			needHeight,
			needDepth,
			radius,
			boxMax,
			boxMin,
			centerOffset,
			mass,
			position,
			rotation,
			velocityMovement,
			velocityGravity;
		
		geometry = parameters.geometry || mesh.geometry;
		
		// handle parameters
		
		parameters = parameters || {};
		
		bodyType = parameters.bodyType || 'box';
		
		if ( parameters.hasOwnProperty('movable') === true ) {
			
			movable = parameters.movable;
			
		}
		
		position = parameters.position || mesh.position;
		
		rotation = parameters.rotation || ( mesh.useQuaternion === true ? mesh.quaternion : mesh.rotation );
		
		// physics width/height/depth
		
		width = parameters.width;
		
		height = parameters.height;
		
		depth = parameters.depth;
		
		if ( mathhelper.is_number( width ) === false ) {
			
			needWidth = true;
			
		}
		
		if ( mathhelper.is_number( height ) === false ) {
			
			needHeight = true;
			
		}
		
		if ( mathhelper.is_number( depth ) === false ) {
			
			needDepth = true;
			
		}
		
		if ( needWidth === true || needHeight === true || needDepth === true ) {
			
			// model bounding box
			
			bboxDimensions = dimensions_from_bounding_box_scaled( mesh );
			
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
		
		mass = parameters.mass || width * height * depth;
		
		// create collider
		
		if ( bodyType === 'trimesh' ) {
			
			collider = THREE.CollisionUtils.MeshColliderWBox( mesh );
			
		}
		else if ( bodyType === 'sphere' ) {
			
			radius = Math.max( width, height, depth ) * 0.5;
			
			collider = new THREE.SphereCollider( position, radius );
			
		}
		else if ( bodyType === 'plane' ) {
			
			collider = new THREE.PlaneCollider( position, parameters.up || new THREE.Vector3( 0, 0, 1 ) );
			
		}
		// default box
		else {
			
			boxMax = new THREE.Vector3( width, height, depth ).multiplyScalar( 0.5 );
			boxMin = boxMax.clone().multiplyScalar( -1 );
			
			collider = new THREE.BoxCollider( boxMin, boxMax );
			
		}
		
		// store mesh directly in collider
		// fixes some collision bugs?
		
		collider.mesh = mesh;
		
		// create rigid body
		
		rigidBody = {
			mesh: mesh,
			collider: collider,
			movable: movable,
			mass: mass,
			rotationGravity: new THREE.Quaternion(),
			velocityMovement: generate_velocity_tracker( { 
				damping: parameters.movementDamping,
				offset: parameters.movementOffset
			} ),
			velocityGravity: generate_velocity_tracker( { 
				damping: parameters.gravityDamping,
				offset: parameters.gravityOffset
			} ),
			axes: {
				up: cardinalAxes.up.clone(),
				forward: cardinalAxes.forward.clone(),
				right: cardinalAxes.right.clone()
			}
		};
		
		// rigid body functions
		
		return rigidBody;
	}
	
	// adds mesh's rigid body to physics world
	// creates new rigid body if one is not passed
	
	function add ( mesh, parameters ) {
		
		var rigidBody;
		
		// parameters
		
		parameters = parameters || {};
		
		rigidBody = parameters.rigidBody || translate( mesh, parameters );
		
		rigidBody.name = parameters.name || rigidBody.name || linksBaseName + linksCount;
		
		// add to system
		//if ( typeof rigidBody.collider.min === 'undefined' ) 
		system.colliders.push( rigidBody.collider );
		
		// add to links
		
		linksCount ++;
		
		links.push( rigidBody );
		
		return rigidBody;
		
	}
	
	// removes mesh's rigid body from physics world
	
	function remove ( meshOrBodyOrName ) {
		
		var i, l,
			rigidBody,
			name,
			index;
			
		for ( i = 0, l = links.length; i < l; i ++ ) {
			
			rigidBody = links[ i ];
			
			if ( rigidBody === meshOrBodyOrName || rigidBody.mesh === meshOrBodyOrName || rigidBody.name === meshOrBodyOrName ) {
				
				links.splice( i, 1 );
				
				index = system.colliders.indexOf( rigidBody.collider );
				
				if ( index !== -1 ) {
				
					system.colliders.splice( index, 1 );
					
				}
				
				break;
				
			}
			
		}
		
	}
	
	/*===================================================
    
    utility functions
    
    =====================================================*/
	
	function set_gravity_source ( source ) {
		gravitySource = new THREE.Vector3( source.x, source.y, source.z );
	}
	
	function set_gravity_magnitude ( magnitude ) {
		gravityMagnitude = new THREE.Vector3( magnitude.x, magnitude.y, magnitude.z );
	}
	
	function generate_velocity_tracker ( parameters ) {
		var velocity = {};
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.damping = parameters.damping || 0.99;
		
		// init velocity
		
		velocity.force = new THREE.Vector3();
		velocity.forceRotated = new THREE.Vector3();
		velocity.damping = new THREE.Vector3().addScalar( parameters.damping );
		velocity.offset = parameters.offset && parameters.offset instanceof THREE.Vector3 ? parameters.offset : new THREE.Vector3();
		velocity.moving = false;
		
		return velocity;
	}
	
	function dimensions_from_bounding_box_scaled ( mesh ) {
		var geometry = mesh.geometry,
			scale = mesh.scale,
			bbox,
			dimensions;
		
		// if needs calculation
		
		if ( typeof geometry.boundingBox === 'undefined' || geometry.boundingBox === null ) {
			geometry.computeBoundingBox();
		}
		
		bbox = geometry.boundingBox;
		
		// get original dimensions and scale to mesh's scale
		
		dimensions = new THREE.Vector3( bbox.x[1] - bbox.x[0], bbox.y[1] - bbox.y[0], bbox.z[1] - bbox.z[0] ).multiplySelf( scale );
		
		return dimensions;
	}
	
	function dimensions_from_collider ( rigidBody ) {
		var collider = rigidBody.collider,
			colliderMin,
			colliderMax,
			dimensions = new THREE.Vector3();
		
		// get collider type by collider properties
		
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
			return dimensions;
		}
		
		dimensions.sub( colliderMax, colliderMin );
		
		return dimensions;
	}
	
	function dimensions_from_collider_scaled ( rigidBody ) {
		
		var mesh = rigidBody.mesh,
			scale = mesh.scale,
			dimensions = dimensions_from_collider( rigidBody ).multiplySelf( scale );
		
		return dimensions;
		
	}
	
	function center_offset_from_bounding_box ( mesh ) {
		
		var geometry = mesh.geometry,
			bbox,
			centerOffset;
		
		// if needs calculation
		
		if ( typeof geometry.boundingBox === 'undefined' || geometry.boundingBox === null ) {
			geometry.computeBoundingBox();
		}
		
		bbox = geometry.boundingBox;
		
		// get mesh's center offset
		
		centerOffset = new THREE.Vector3( bbox.x[0] + (bbox.x[1] - bbox.x[0]) * 0.5, bbox.y[0] + (bbox.y[1] - bbox.y[0]) * 0.5, bbox.z[0] + (bbox.z[1] - bbox.z[0]) * 0.5 );
		
		return centerOffset;
		
	}
	
	function offset_by_length_in_local_direction ( mesh, localDirection, length ) {
		
		var offset = new THREE.Vector3( length, length, length ),
			maxDim,
			localDirection,
			uV33 = utilVec31Offset,
			uQ4 = utilQ4Offset;
		
		// set in direction
		
		offset.multiplySelf( localDirection );
		
		// rotate to match mesh
		
		offset = rotate_vector3_to_mesh_rotation( mesh, offset );
		
		return offset;
		
	}
	
	function offset_from_dimensions_in_direction ( mesh, direction, dimensions ) {
		
		var offset,
			maxDim,
			localDirection,
			uV33 = utilVec31Offset,
			uQ4 = utilQ4Offset;
		
		// set all dimensions to max dimension
		
		//maxDim = Math.max( dimensions.x, dimensions.y, dimensions.z );
		
		//dimensions.set( maxDim, maxDim, maxDim );
		
		// copy half of dimensions and add 1 to avoid ray casting to self
		
		offset = dimensions.clone().multiplyScalar( 0.5 ).addScalar( 1 );
		
		// add center offset
		
		offset.addSelf( center_offset_from_bounding_box( mesh ) );
		
		// get local direction
		// seems like extra unnecessary work
		// not sure if there is better way
		
		uQ4.copy( mesh.quaternion ).inverse();
		
		localDirection = uV33.copy( direction );
		localDirection.normalize();
		
		uQ4.multiplyVector3( localDirection );
		
		// set in direction
		
		offset.multiplySelf( localDirection );
		
		// rotate to match mesh
		
		offset = rotate_vector3_to_mesh_rotation( mesh, offset );
		
		return offset;
	}
	
	function rotate_vector3_to_mesh_rotation ( mesh, vec3, rotatedVec3 ) {
		
		if ( rotatedVec3 instanceof THREE.Vector3 ) {
			rotatedVec3.copy( vec3 );
		}
		else {
			rotatedVec3 = vec3.clone();
		}
		
		if ( mesh.useQuaternion === true ) {
			
			mesh.quaternion.multiplyVector3( rotatedVec3 );
			
		}
		else {
			
			mesh.matrix.multiplyVector3( rotatedVec3 );
			
		}
		
		return rotatedVec3;
		
	}
	
	/*===================================================
    
    start/stop/update functions
    
    =====================================================*/
	
	function start () {
		
		time = timeLast = new Date().getTime();
		
		shared.signals.update.add( update );
		
	}
	
	function stop () {
		
		shared.signals.update.remove( update );
		
	}
	
	function update ( timeDelta ) {
		
		var i, l = 1,
			refreshInterval = shared.refreshInterval,
			currentInterval = timeDelta,
			timeStep;
		
		// handle time
		
		if ( currentInterval > refreshInterval ) {
			
			l = Math.ceil( currentInterval / refreshInterval );
			
		}
		
		// integrate
		
		//for ( i = 0; i < l; i ++ ) {
			
			currentInterval = refreshInterval;
			
			timeStep = currentInterval / 1000;
		
			integrate( timeStep );
			
		//}
		
	}
	
	/*===================================================
    
    integrate functions
    
    =====================================================*/
	
	function integrate ( timeStep ) {
		
		var i, l,
			uv31 = utilVec31Integrate, uv32 = utilVec32Integrate,
			uq1 = utilQ1Integrate, uq2 = utilQ2Integrate, uq3 = utilQ3Integrate,
			ca = cardinalAxes,
			lerpDelta = 0.1,
			rigidBody,
			mesh,
			scale,
			collider,
			position,
			rotation,
			axes,
			axisUp,
			axisUpNew,
			axisUpToUpNewDist,
			axisForward,
			axisRight,
			velocityGravity,
			velocityMovement,
			gravSrc,
			gravMag,
			gravUp,
			gravDown,
			upToUpNewAngle,
			upToUpNewAxis,
			upToUpNewQ,
			collisionGravity;
		
		// handle rotation and check velocity
		
		for ( i = 0, l = links.length; i < l; i ++ ) {
			
			rigidBody = links[ i ];
			
			// is movable
			
			if ( rigidBody.movable === true ) {
				
				// localize movable basics
				
				collider = rigidBody.collider;
				
				mesh = rigidBody.mesh;
				
				position = mesh.position;
				
				rotation = ( mesh.useQuaternion === true ? mesh.quaternion : mesh.matrix );
				
				rotationGravity = rigidBody.rotationGravity;
				
				velocityGravity = rigidBody.velocityGravity;
				
				velocityMovement = rigidBody.velocityMovement;
				
				axes = rigidBody.axes;
				
				axisUp = axes.up;
				
				axisForward = axes.forward;
				
				axisRight = axes.right;
				
				gravSrc = rigidBody.gravitySource || gravitySource;
				
				gravMag = rigidBody.gravityMagnitude || gravityMagnitude;
				
				// get normalized up vector between character and gravity source
				
				gravUp = uv31.sub( position, gravSrc ).normalize();
				
				// negate gravity up
				
				gravDown = gravUp.clone().negate();//axisUp.clone().negate();//
				
				// movement velocity
				
				handle_velocity( rigidBody, velocityMovement );
				
				// ray cast in the direction of gravity
				
				//collisionGravity = raycast_in_direction( rigidBody, gravDown, undefined, true );
				
				// handle collision to find new up orientation
				
				if( collisionGravity ) {
					
					// get normal of colliding face as new up axis
					// this causes severe jitter 
					// when crossing faces that are not close in angle
					// tried many things to fix...
					
					axisUpNew = gravUp;//collisionGravity.normal;
					
				} else {
					
					// TODO
					// assume object has fallen through world
					// reset to ground plane
					
					axisUpNew = gravUp;
					
				}
				
				// get new rotation based on gravity
				
				// find dist between axis up and new axis up
				
				axisUpToUpNewDist = Math.max( -1, Math.min( 1, axisUp.dot( axisUpNew ) ) );
				
				// if up axes are not same
				
				if ( axisUpToUpNewDist !== 1 ) {
					
					// axis / angle
					
					upToUpNewAngle = Math.acos( axisUpToUpNewDist );
					upToUpNewAxis = uv32.cross( axisUp, axisUpNew );
					upToUpNewAxis.normalize();
					
					// rotation change
					
					upToUpNewQ = uq3.setFromAxisAngle( upToUpNewAxis, upToUpNewAngle );
					
					// add to rotation
					
					uq1.multiply( upToUpNewQ, rotationGravity );
					
					THREE.Quaternion.nlerp( rotationGravity, uq1, rotationGravity, lerpDelta );
					
					if ( mesh.useQuaternion === true ) {
						
						// quaternion rotations
						
						uq1.multiply( upToUpNewQ, rotation );
						
						// normalized lerp to new rotation
						
						THREE.Quaternion.nlerp( rotation, uq1, rotation, lerpDelta );
					
					}
					else {
						
						// matrix rotations
						
						uq1.setFromRotationMatrix( rotation );
						
						uq2.multiply( upToUpNewQ, uq1 );
						
						rotation.setRotationFromQuaternion( uq2 );
						
					}
					
					// find new axes based on new rotation
					
					rotation.multiplyVector3( axisUp.copy( ca.up ) );
					
					rotation.multiplyVector3( axisForward.copy( ca.forward ) );
					
					rotation.multiplyVector3( axisRight.copy( ca.right ) );
					
				}
				
				// add non rotated gravity to gravity velocity
				
				velocityGravity.force.addSelf( gravMag );
				
				// check gravity velocity
				
				handle_velocity( rigidBody, velocityGravity );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    velocity functions
    
    =====================================================*/
	
	function handle_velocity ( rigidBody, velocity, offset ) {
		
		var mesh = rigidBody.mesh,
			position = mesh.position,
			scale = mesh.scale,
			scaleExp = scaleSpeedExp,
			scaleModded = utilVec31Velocity.copy( scale ),
			velocityForce = velocity.force,
			velocityForceRotated = velocity.forceRotated,
			velocityForceRotatedLength,
			velocityForceScalar,
			velocityOffset = velocity.offset,
			velocityDamping = velocity.damping,
			boundingOffset,
			boundingOffsetLength,
			collision,
			collisionDist;
		
		if ( rigidBody.movable !== true || velocityForce.isZero() === true ) {
			
			velocity.moving = false;
			
			return;
			
		} 
		else {
			
			velocity.moving = true;
			
		}
		
		// rotate velocity to mesh's rotation
		
		velocityForceRotated = rotate_vector3_to_mesh_rotation( mesh, velocityForce, velocityForceRotated );
		
		// scale velocity
		
		scaleModded.x = Math.pow( scaleModded.x, scaleExp );
		scaleModded.y = Math.pow( scaleModded.y, scaleExp );
		scaleModded.z = Math.pow( scaleModded.z, scaleExp );
		
		velocityForceRotated.multiplySelf( scaleModded );
		
		// get rotated length
		
		velocityForceRotatedLength = velocityForceRotated.length();
		
		// get bounding box offset
		
		boundingOffset = offset_from_dimensions_in_direction( mesh, velocityForceRotated, dimensions_from_collider_scaled( rigidBody ) );//dimensions_from_bounding_box_scaled( mesh ) );
		
		boundingOffsetLength = boundingOffset.length();
		
		// override offset
		
		if ( typeof offset !== 'undefined' ) {
		
			velocityOffset = offset;
			
		}
		
		// rotate offset if needed
		
		if ( velocityOffset.length() > 0 ) {
			
			velocityOffset = rotate_vector3_to_mesh_rotation( mesh, velocityOffset );
			
		}
		
		var castDistance = boundingOffsetLength + velocityForceRotatedLength;
		
		// get collision
		//for ( var i = 0; i < 2; i++ ) {
			collision = raycast_in_direction( rigidBody, velocityForceRotated, castDistance, velocityOffset );
		//}
		// modify velocity based on collision distances to avoid passing through or into objects
		
		if ( collision ) {
			
			collisionDist = collision.distance;
			
			// set the rotated velocity to be no more than collision distance
			
			if ( collisionDist - velocityForceRotatedLength <= boundingOffsetLength ) {
				
				velocityForceScalar = ( collisionDist - boundingOffsetLength ) / velocityForceRotatedLength;
				
				velocityForceRotated.multiplyScalar( velocityForceScalar );
				
				// set the base velocity to 0
				
				velocityForce.set( 0, 0, 0 );
				
				velocity.moving = false;
				
			}
			
		}
		
		// add velocity to position
		
		position.addSelf( velocityForceRotated );
		
		// damp velocity
		
		velocityForce.multiplySelf( velocityDamping );
		
		// return velocity
		
		return collision;
	}
	
	/*===================================================
    
    raycast functions
    
    =====================================================*/
	
	function raycast_in_direction ( rigidBody, direction, castDistance, offset, showLine ) {
		
		var i, l,
			mesh = rigidBody.mesh,
			position = mesh.position,
			ray = utilRay1Casting,
			rayPosition,
			rayDirection,
			collisions = [],
			collisionPotential,
			collisionMeshRecast,
			collisionDistance = Number.MAX_VALUE,
			collision,
			intersects,
			intersect;
		
		// if velocity is empty or rigidBody is not movable
		// no need to raycast
		
		if ( rigidBody.movable !== true || direction.isZero() === true ) {
			
			return;
			
		}
		
		// copy direction and normalize
		
		rayDirection = direction.clone();
		rayDirection.normalize();
		
		// set ray position
		
		rayPosition = position.clone();
		
		if ( typeof offset !== 'undefined' ) {
			
			rayPosition.addSelf( offset );
			
		}
		
		// set ray
		
		ray.origin = rayPosition;
		ray.direction = rayDirection;
		
		// ray cast individually using collision system r45
		for ( i = 0, l = system.colliders.length; i < l; i ++ ) {
			
			var collider = system.colliders[ i ];
			var cmesh = collider.mesh;
			
			if ( mesh === cmesh || typeof cmesh.parent == 'undefined' ) {
				continue;
			}
			
			var cmeshPos = cmesh.position.clone();
			
			/*
			// if parent is not scene, add parent position to position
			
			if ( cmesh.parent !== game.scene ) {
				
				cmeshPos.addSelf( cmesh.parent.position );
				console.log(cmesh.parent);
				
			}
			*/
			
			var d1l = cmeshPos.distanceTo( rayPosition );
			var d2l = cmesh.geometry.boundingSphere.radius * Math.max( cmesh.scale.x, cmesh.scale.y, cmesh.scale.z );
			
			var cdist = d1l - d2l;//system.distanceFromIntersection( rayPosition, rayDirection, cmesh.position );//cmesh.geometry.boundingSphere.radius * Math.max( cmesh.scale.x, cmesh.scale.y, cmesh.scale.z )
			
			castDistance = castDistance || Math.MAX_NUMBER;
			
			if ( cdist === null || cdist > castDistance ) {
				
				continue;

			}
			
			cdist = system.rayCast( ray, collider );
			
			if ( cdist < Number.MAX_VALUE ) {
				
				collider.distance = cdist;
				
				collisions.push( collider );
				
			}
			
		}
		
		// ray cast all
		
		//collisions = system.rayCastAll( ray );
		
		// find nearest collision
		if ( typeof collisions !== 'undefined' ) {
			
			for ( i = 0, l = collisions.length; i < l; i ++ ) {
				
				collisionPotential = collisions[ i ];
				
				// if is collider for this object, skip
				
				if ( collisionPotential.mesh === rigidBody.mesh ) {
					continue;
				}
				
				// cast ray again if collider is mesh
				// initial ray cast was to mesh collider's dynamic box
				
				if ( collisionPotential instanceof THREE.MeshCollider ) {
				
					collisionMeshRecast = system.rayMesh( ray, collisionPotential );
					
					if ( collisionMeshRecast.dist < Number.MAX_VALUE ) {
						collisionPotential.distance = collisionMeshRecast.dist;
						collisionPotential.faceIndex = collisionMeshRecast.faceIndex;
					}
					else {
						collisionPotential.distance = Number.MAX_VALUE;
					}
					
				}
				
				// if distance is less than last ( last starts at number max value )
				// store as collision
				
				if ( collisionPotential.distance < collisionDistance ) {
					
					collisionDistance = collisionPotential.distance;
					collision = collisionPotential;
					
				}
				
			}
			
		}
		
		// ray casting individually using ray intersect object r46
		/*for ( i = 0, l = system.colliders.length; i < l; i ++ ) {
			
			var collider = system.colliders[ i ];
			var cmesh = collider.mesh;
			
			if ( mesh === cmesh ) {
				continue;
			}
			
			intersects = ray.intersectObject( cmesh );
			
			var j, k;
			
			for ( j = 0, k = intersects.length; j < k; j ++ ) {
				
				intersect = intersects[ j ];
				
				if ( intersect.distance < collisionDistance ) {
					
					collisionDistance = intersect.distance;
					collision = intersect;
					
				}
				
			}
			
		}*/
		
		//collision = system.rayCastNearest( ray );
		//intersects = ray.intersectScene( game.scene );
		//console.log('intersects.length: ' + intersects.length);
		/*
		if ( typeof intersects !== 'undefined' ) {
			
			// loop through intersects for first object that is not self
			
			for ( i = 0, l = intersects.length; i < l; i ++ ) {
				
				intersect = intersects[ i ];
				
				if ( intersect.object !== mesh ) {
					
					// store as collision
					
					collision = intersect;
					
					break;
					
				}
				else {
					continue;
				}
				
			}
			
		}
		*/
		
		// test
		
		if ( showLine === true ) {
			
			if ( collision ) {
				
				console.log( 'collision with object at distance ' + collision.distance );
				
				var ls4 = rayDirection.clone().addSelf( rayPosition );
				var le4 = rayDirection.clone().multiplyScalar( collision.distance ).addSelf( rayPosition );
				
			}
			else {
				console.log('no collisions');
				
				var ls4 = rayDirection.clone().addSelf( rayPosition );
				var le4 = rayDirection.clone().multiplyScalar( 100 ).addSelf( rayPosition );
				
			}
			
			line4.geometry.vertices[0].position = ls4;
			line4.geometry.vertices[1].position = le4;
			line4.geometry.__dirtyVertices = true;
			line4.geometry.__dirtyElements = true;
		
		}
		
		return collision;
		
	}
	
	return main;
	
}(KAIOPUA || {}));