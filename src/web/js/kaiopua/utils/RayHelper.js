/*
 *
 * RayHelper.js
 * Contains utility functionality for basic type checking.
 * 
 * based on collision code by bartek drozdz / http://everyday3d.com/
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/utils/RayHelper.js",
		_RayHelper = {},
		_MathHelper,
		_VectorHelper,
		_SceneHelper,
		utilRay1Casting,
		utilRay1Localize,
		utilProjector1Casting,
		utilMat41Localize,
		utilMat42Localize,
		utilVec31Box,
		utilVec32Box,
		utilVec31Casting,
		utilVec32Casting,
		utilVec33Casting,
		utilVec31CastMesh,
		utilVec32CastMesh,
		utilVec33CastMesh,
		utilVec34CastMesh,
		utilVec35CastMesh,
		utilVec36CastMesh,
		utilVec37CastMesh,
		utilVec38CastMesh,
		utilVec39CastMesh,
		utilVec31LinePoint,
		utilVec32LinePoint,
		utilVec33LinePoint,
		utilVec31PointTriangle,
		utilVec32PointTriangle,
		utilVec33PointTriangle,
		utilVec31Sphere,
		utilVec31Triangle,
		utilVec32Triangle,
		utilVec33Triangle;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, {
		data: _RayHelper,
		requirements: [
			"js/kaiopua/utils/MathHelper.js",
			"js/kaiopua/utils/VectorHelper.js",
			"js/kaiopua/utils/SceneHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( mh, vh, sh ) {
		console.log('internal ray helper', _RayHelper);
		
		// reqs
		
		_MathHelper = mh;
		_VectorHelper = vh;
		_SceneHelper = sh;
		
		// utility
		
		utilRay1Casting = new THREE.Ray();
		utilRay1Localize = new THREE.Ray();
		utilProjector1Casting = new THREE.Projector();
		utilMat41Localize = new THREE.Matrix4();
		utilMat42Localize = new THREE.Matrix4();
		utilVec31Box = new THREE.Vector3();
		utilVec32Box = new THREE.Vector3();
		utilVec31Casting = new THREE.Vector3();
		utilVec32Casting = new THREE.Vector3();
		utilVec33Casting = new THREE.Vector3();
		utilVec31CastMesh = new THREE.Vector3();
		utilVec32CastMesh = new THREE.Vector3();
		utilVec33CastMesh = new THREE.Vector3();
		utilVec34CastMesh = new THREE.Vector3();
		utilVec35CastMesh = new THREE.Vector3();
		utilVec36CastMesh = new THREE.Vector3();
		utilVec37CastMesh = new THREE.Vector3();
		utilVec38CastMesh = new THREE.Vector3();
		utilVec39CastMesh = new THREE.Vector3();
		utilVec31LinePoint = new THREE.Vector3();
		utilVec32LinePoint = new THREE.Vector3();
		utilVec33LinePoint = new THREE.Vector3();
		utilVec31PointTriangle = new THREE.Vector3();
		utilVec32PointTriangle = new THREE.Vector3();
		utilVec33PointTriangle = new THREE.Vector3();
		utilVec31Sphere = new THREE.Vector3();
		utilVec31Triangle = new THREE.Vector3();
		utilVec32Triangle = new THREE.Vector3();
		utilVec33Triangle = new THREE.Vector3();
		utilVec34Triangle = new THREE.Vector3();
		
		// functions
		
		_RayHelper.Collider = Collider;
		_RayHelper.PlaneCollider = PlaneCollider;
		_RayHelper.SphereCollider = SphereCollider;
		_RayHelper.BoxCollider = BoxCollider;
		_RayHelper.MeshCollider = MeshCollider;
		_RayHelper.ObjectColliderOBB = ObjectColliderOBB;
		
		_RayHelper.extract_collider = extract_collider;
		_RayHelper.localize_ray = localize_ray;
		
		_RayHelper.raycast = raycast;
		
	}
	
	/*===================================================
    
    helpers
    
    =====================================================*/
	
	function localize_ray ( ray, object ) {
		
		var scale,
			matrixObj,
			matrixObjCopy = utilMat41Localize,
			mt = utilMat42Localize,
			rt = utilRay1Localize;
		
		rt.origin.copy( ray.origin );
		rt.direction.copy( ray.direction );
		rt.near = ray.near;
		rt.far = ray.far;
		rt.precision = ray.precision;
		
		if ( object instanceof THREE.Mesh ) {
			
			matrixObj = object.matrixWorld;
			/*
			scale = object.scale;
			
			// get copy of object world matrix without scale applied
			// matrix with scale does not seem to invert correctly
			
			matrixObjCopy.extractPosition( matrixObj );
			matrixObjCopy.extractRotation( matrixObj );
			*/
			// invert copy
			
			mt.getInverse( matrixObj );//matrixObjCopy );
			
			mt.multiplyVector3( rt.origin );
			mt.rotateAxis( rt.direction );
			
			rt.direction.normalize();
			
		}

		return rt;

	}
	
	function point_outside_triangle ( p, a, b, c ) {
		
		// slight imprecision (i.e. point can be on edge or very slightly outside triangle) adds a lot of stability

		var v0 = utilVec31PointTriangle.sub( c, a );
		var v1 = utilVec32PointTriangle.sub( b, a );
		var v2 = utilVec33PointTriangle.sub( p, a );

		var dot00 = v0.dot( v0 );
		var dot01 = v0.dot( v1 );
		var dot02 = v0.dot( v2 );
		var dot11 = v1.dot( v1 );
		var dot12 = v1.dot( v2 );

		var invDenom = 1 / ( dot00 * dot11 - dot01 * dot01 );
		var u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom;
		if ( u < -0.01 || u > 1.01 ) return true;
		var v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;
		return v < -0.01 || v > 1.01 || u + v > 1.01;

	}
	
	function sort_intersections ( a, b ) {
		
		return a.distance - b.distance;
		
	}
	
	/*===================================================
	
	colliders
	
	=====================================================*/
	 
	function Collider ( object ) {
		
		this.object = object;
		this.normal = new THREE.Vector3();
		
	}

	function PlaneCollider ( object, point, normal ) {
		
		Collider.call( this, object );

		this.point = point;
		this.normal.copy( normal );

	}
	PlaneCollider.prototype = new Collider();
	PlaneCollider.prototype.constructor = PlaneCollider;

	function SphereCollider ( object, center, radius ) {
		
		Collider.call( this, object );

		this.center = center;
		this.radius = radius;
		this.radiusSq = radius * radius;

	}
	SphereCollider.prototype = new Collider();
	SphereCollider.prototype.constructor = SphereCollider;

	function BoxCollider ( object, min, max ) {
		
		Collider.call( this, object );

		this.min = min;
		this.max = max;

	}
	BoxCollider.prototype = new Collider();
	BoxCollider.prototype.constructor = BoxCollider;

	// @params object THREE.Mesh
	// @returns CBox static Axis-Aligned Bounding Box
	//
	// The AABB is calculated based on current
	// position of the object (assumes it won't move)

	function ObjectColliderAABB ( object ) {
		
		var geometry = object.geometry,
			bbox,
			min,
			max;
		
		if ( !geometry.boundingBox ) {
			
			geometry.computeBoundingBox();
			
		}
		
		bbox = geometry.boundingBox;
		min = bbox.min.clone();
		max = bbox.max.clone();
		
		// proto
		
		BoxCollider.call( this, object, min, max );
		
		// add object position
		
		this.min.addSelf( object.position );
		this.max.addSelf( object.position );

	}
	ObjectColliderAABB.prototype = new BoxCollider();
	ObjectColliderAABB.prototype.constructor = ObjectColliderAABB;

	// @params object THREE.Mesh
	// @returns CBox dynamic Object Bounding Box
	
	function ObjectColliderOBB ( object ) {
		
		var geometry = object.geometry,
			bbox,
			min,
			max;
		
		if ( !geometry.boundingBox ) {
			
			geometry.computeBoundingBox();
			
		}
		
		bbox = geometry.boundingBox;
		min = bbox.min.clone();
		max = bbox.max.clone();
		
		// proto
		
		BoxCollider.call( this, object, min, max );

	}
	ObjectColliderOBB.prototype = new BoxCollider();
	ObjectColliderOBB.prototype.constructor = ObjectColliderOBB;

	function MeshCollider ( object, box ) {
		
		Collider.call( this, object );
		
		this.box = box || new ObjectColliderOBB( this.object );
		
	}
	MeshCollider.prototype = new Collider();
	MeshCollider.prototype.constructor = MeshCollider;
	
	function extract_collider( source ) {
		
		// collider
		if ( source instanceof Collider ) {
			
			return source;
			
		}
		// octree object
		if ( source.object && source.object.rigidBody && ( typeof source.faces === 'undefined' || source.faces.length === 0 ) ) {
			
			return source.object.rigidBody.collider;
			
		}
		// object 3d
		else if ( source.rigidBody ) {
			
			return source.rigidBody.collider;
			
		}
		// rigid body
		else if ( source.collider ) {
			
			return source.collider;
			
		}
		
		return source;
		
	}
	
	/*===================================================
    
    raycasting
    
    =====================================================*/
	
	function raycast ( parameters ) {
		
		var i, il,
			j, jl,
			k, kl,
			ray = utilRay1Casting,
			origin = utilVec31Casting,
			offsets,
			offset,
			offsetNone = utilVec32Casting,
			offsetColliders,
			offsetObjects,
			ignore,
			objects,
			object,
			children,
			colliders,
			camera,
			pointer,
			pointerPosition = utilVec33Casting,
			projector = utilProjector1Casting,
			octrees,
			hierarchySearch,
			hierarchyIntersect,
			intersections = [],
			childIntersections,
			intersectionPotential,
			intersectedObject,
			intersection;
		
		// handle parameters
		
		parameters = parameters || {};
		
		offsets = main.is_array( parameters.offsets ) && parameters.offsets.length > 0 ? parameters.offsets : [ offsetNone ];
		objects = main.to_array( parameters.objects ).slice( 0 );
		colliders = main.to_array( parameters.colliders ).slice( 0 );
		octrees = main.to_array( parameters.octrees );
		hierarchySearch = parameters.hierarchySearch;
		hierarchyIntersect = parameters.hierarchyIntersect;
		camera = parameters.camera;
		pointer = parameters.pointer;
		ignore = parameters.ignore;
		
		// if using pointer
		
		if ( typeof pointer !== 'undefined' && typeof camera !== 'undefined' ) {
			
			// get corrected pointer position
			
			pointerPosition.x = ( pointer.x / shared.screenWidth ) * 2 - 1;
			pointerPosition.y = -( pointer.y / shared.screenHeight ) * 2 + 1;
			pointerPosition.z = 0.5;
			
			// unproject pointer position
			
			projector.unprojectVector( pointerPosition, camera );
			
			// set ray

			origin.copy( camera.position );
			ray.direction.copy( pointerPosition.subSelf( camera.position ) );
			
		}
		else {
			
			origin.copy( parameters.origin || parameters.ray.origin );
			ray.direction.copy( parameters.direction || parameters.ray.direction );
			
		}
		
		// normalize ray direction
		
		ray.direction.normalize();
		
		// ray length
		
		if ( main.is_number( parameters.far ) && parameters.far > 0 ) {
			
			ray.far = parameters.far;
			
		}
		else {
			
			ray.far = Number.MAX_VALUE;
			
		}
		
		// for each offset
		
		for ( i = 0, il = offsets.length; i < il; i++ ) {
			
			// offset ray
			
			offset = offsets[ i ];
			
			ray.origin.copy( origin ).addSelf( offset );
			
			// objects
			
			offsetObjects = objects.slice( 0 );
			
			if ( offsetObjects.length > 0 ) {
			
				// account for hierarchy
				
				if ( hierarchySearch !== false ) {
					
					// if intersection of hierarchy allowed, add all object children to objects list
					
					if ( hierarchyIntersect === true ) {
						
						offsetObjects = _SceneHelper.extract_children_from_objects( offsetObjects, offsetObjects );
					
					}
					// else raycast children and add reference to ancestor
					else {
						
						for ( j = 0, jl = offsetObjects.length; j < jl; j++ ) {
							
							object = offsetObjects[ j ];
							
							children = _SceneHelper.extract_children_from_objects( object );
							
							childIntersections = raycast_objects( ray, children );
							
							for ( k = 0, kl = childIntersections.length; k < kl; k++ ) {
								
								childIntersections[ k ].ancestor = object;
								
							}
							
							intersections = intersections.concat( childIntersections );
							
						}
						
					}
					
				}
				
				// raycast objects
				
				intersections = intersections.concat( raycast_objects( ray, offsetObjects ) );
				
			}
			
			// colliders
			
			offsetColliders = colliders.slice( 0 );
			
			for ( j = 0, jl = octrees.length; j < jl; j++ ) {
				
				offsetColliders = offsetColliders.concat( octrees[ j ].search( ray.origin, ray.far, true, ray.direction ) );
				
			}
			
			if ( offsetColliders.length > 0 ) {
				
				// TODO: improve performance of raycast_colliders
				// raycast_colliders supports casting non-planar quads
				// but is about 25 - 40% slower than alternative, which should not be the case just because of non-planar quads 
				
				intersections = intersections.concat( raycast_colliders( ray, offsetColliders ) );
				//intersections = intersections.concat( ray.intersectOctreeObjects( offsetColliders ) );
				
			}
			
		}
		
		// sort intersections
		
		intersections.sort( sort_intersections );
		
		// if all required
		
		if ( parameters.allIntersections === true ) {
			
			return intersections;
			
		}
		// else return nearest
		else {
			
			// if any objects to ignore
			
			if ( main.is_array( ignore ) ) {
				
				for ( i = 0, il = intersections.length; i < il; i++ ) {
					
					intersectionPotential = intersections[ i ];
					
					intersectedObject = intersectionPotential.object || intersectionPotential.mesh;
					
					if ( main.index_of_value( ignore, intersectedObject ) === -1 ) {
						
						intersection = intersectionPotential;
						break;
						
					}
					
				}
			
			}
			// else use first
			else {
				
				intersection = intersections[ 0 ];
				
			}
			
			// if needs object only
			
			if ( parameters.objectOnly === true && intersection ) {
				
				if ( hierarchyIntersect !== true && intersection.ancestor ) {
					
					intersection = intersection.ancestor;
					
				}
				else {
					
					intersection = intersection.object;
					
				}
				
			}
			
			return intersection;
		
		}
		
	}
	
	/*===================================================
    
    collisions
    
    =====================================================*/
	
	function raycast_objects ( ray, objects ) {
		
		var i, l,
			intersections = [],
			intersection,
			object;
		
		for ( i = 0, l = objects.length; i < l; i++ ) {

			object = objects[ i ];
			
			// ray cast object
			
			intersection = raycast_mesh( ray, object );
			
			// store
			
			if ( intersection.distance < Number.MAX_VALUE ) {
				
				intersections.push( intersection );
				
			}
			
		}
		
		return intersections;
		
	}
	
	function raycast_colliders ( ray, colliders ) {

		var i, l,
			intersections = [],
			intersection,
			distance,
			collider;
		
		for ( i = 0, l = colliders.length; i < l; i++ ) {
			
			//console.log( ' > raycast collider, ray ', ray.far, ' BEFORE: ', colliders[ i ],  ' + AFTER: ', extract_collider( colliders[ i ] ) );
			collider = extract_collider( colliders[ i ] );
			
			// ray cast collider
			
			intersection = raycast_collider( ray, collider  );
			
			if ( intersection.distance < Number.MAX_VALUE ) {
				
				intersections.push( intersection );
				
			}

		}
		
		return intersections;

	}

	function raycast_collider ( ray, collider ) {
		
		var intersection;
		
		// cast by type
		
		if ( collider instanceof PlaneCollider ) {
			
			return raycast_plane( ray, collider );
			
		}
		else if ( collider instanceof SphereCollider ) {
			
			return raycast_sphere( ray, collider );
			
		}
		else if ( collider instanceof BoxCollider ) {
			
			return raycast_box( ray, collider );
			
		}
		else if ( collider instanceof MeshCollider ) {
			
			intersection = raycast_box( ray, collider.box );
			
			if ( intersection.distance < Number.MAX_VALUE ) {
				
				intersection = raycast_mesh( ray, collider );
				
			}
			
			return intersection;
			
		}
		else {
			
			return raycast_mesh( ray, collider );
			
		}

	}
	
	function raycast_plane ( r, collider ) {

		var t = r.direction.dot( collider.normal ),
			d = collider.point.dot( collider.normal ),
			ds,
			intersection = {
				object: collider.object || collider,
				distance: Number.MAX_VALUE,
				normal: new THREE.Vector3(),
				point: new THREE.Vector3()
			};

		if( t < 0 ) {
			
			ds = ( d - r.origin.dot( collider.normal ) ) / t;
			
			if( ds > 0 ) {
				
				intersection.distance = ds;
				intersection.normal.copy( collider.normal );
				intersection.point.copy( r.direction ).multiplyScalar( intersection.distance ).addSelf( r.origin );
				
				return intersection;
				
			}
			
		}
		
		return intersection;

	}

	function raycast_sphere ( r, collider ) {

		var difference = utilVec31Sphere.sub( collider.center, r.origin ),
			diffLengthSq = difference.lengthSq(),
			a,
			t,
			distance,
			intersection = {
				object: collider.object || collider,
				distance: Number.MAX_VALUE,
				normal: new THREE.Vector3(),
				point: new THREE.Vector3()
			};
		
		// inside
		
		if ( diffLengthSq < collider.radiusSq ) {
			
			// TODO: distance and normal to closest side
			//intersection.distance = -1;
			//intersection.normal.set( 0, yn, 0);
			
			return intersection;
		}
		
		a = difference.dot( r.direction.clone() );
		
		if ( a <= 0 ) {
			
			return intersection;
			
		}

		t = collider.radiusSq - ( diffLengthSq - a * a );
		
		if ( t >= 0 ) {
		
			distance = Math.abs( a ) - Math.sqrt( t );
			
			if ( distance <= r.far ) {
				
				intersection.distance = distance;
				intersection.normal.copy( difference ).multiplyScalar( -1 ).normalize();
				intersection.point.copy( r.direction ).multiplyScalar( intersection.distance ).addSelf( r.origin );
				
			}
			
		}

		return intersection;

	}
	
	function raycast_box ( ray, collider ) {
		
		var object = collider.object || collider,
			rt = localize_ray( ray, object ),
			abMin = utilVec31Box.copy( collider.min ),
			abMax = utilVec32Box.copy( collider.max ),
			origin = rt.origin,
			direction = rt.direction,
			far = rt.far,
			scale,
			xt = 0, yt = 0, zt = 0,
			xn = 0, yn = 0, zn = 0,
			ins = true,
			which,
			t,
			intersection = {
				object: object,
				distance: Number.MAX_VALUE,
				normal: new THREE.Vector3(),
				point: new THREE.Vector3()
			};
		
		// account for object
		
		if ( typeof object !== 'undefined' ) {
			
			scale = object.scale;
			
			abMin.multiplySelf( scale );
			abMax.multiplySelf( scale );
			
		}
		
		// x
		
		if( origin.x < abMin.x ) {
			
			xt = abMin.x - origin.x;
			xt /= direction.x;
			if ( xt > far ) return intersection;
			ins = false;
			xn = -1;
			
		}
		else if ( origin.x > abMax.x ) {
			
			xt = abMax.x - origin.x;
			xt /= direction.x;
			if ( xt > far ) return intersection;
			ins = false;
			xn = 1;
			
		}
		
		// y
		
		if( origin.y < abMin.y ) {
			
			yt = abMin.y - origin.y;
			yt /= direction.y;
			if ( yt > far ) return intersection;
			ins = false;
			yn = -1;
			
		}
		else if( origin.y > abMax.y ) {
			
			yt = abMax.y - origin.y;
			yt /= direction.y;
			if ( yt > far ) return intersection;
			ins = false;
			yn = 1;
			
		}
		
		// z
		
		if( origin.z < abMin.z ) {
			
			zt = abMin.z - origin.z;
			zt /= direction.z;
			if ( zt > far ) return intersection;
			ins = false;
			zn = -1;
			
		}
		else if( origin.z > abMax.z ) {
			
			zt = abMax.z - origin.z;
			zt /= direction.z;
			if ( zt > far ) return intersection;
			ins = false;
			zn = 1;
			
		}
		
		// inside
		
		if( ins ) {
			
			// TODO: distance and normal to closest side
			//intersection.distance = -1;
			//intersection.normal.set( 0, yn, 0);
			intersection.point.sub( abMax, abMin );
			
			return intersection;
			
		}
		
		// find side
		
		which = 0;
		t = xt;
		
		if( yt > t ) {
			
			which = 1;
			t = yt;
			
		}
		
		if ( zt > t ) {
			
			which = 2;
			t = zt;
			
		}
		
		// find normal and point
		
		if( which === 0 ) {
			
			var y = origin.y + direction.y * t;
			if ( y < abMin.y || y > abMax.y )  return intersection;
			var z = origin.z + direction.z * t;
			if ( z < abMin.z || z > abMax.z ) return intersection;
			
			intersection.normal.set( xn, 0, 0 );
			intersection.point.set( origin.x + direction.x * t, y, z );
			
		}
		else if ( which === 1 ) {
			
			var x = origin.x + direction.x * t;
			if ( x < abMin.x || x > abMax.x ) return intersection;
			var z = origin.z + direction.z * t;
			if ( z < abMin.z || z > abMax.z ) return intersection;
			
			intersection.normal.set( 0, yn, 0) ;
			intersection.point.set( x, origin.y + direction.y * t, z );
			
		}
		else if ( which === 2 ) {
			
			var x = origin.x + direction.x * t;
			if ( x < abMin.x || x > abMax.x ) return intersection;
			var y = origin.y + direction.y * t;
			if ( y < abMin.y || y > abMax.y ) return intersection;
			
			intersection.normal.set( 0, 0, zn );
			intersection.point.set( x, y, origin.z + direction.z * t );
			
		}
		
		intersection.distance = t;
		
		return intersection;
		
	}
	
	function raycast_mesh ( ray, collider ) {
		
		var i, l,
			p0 = new THREE.Vector3(),
			p1 = new THREE.Vector3(),
			p2 = new THREE.Vector3(),
			p3 = new THREE.Vector3(),
			object = collider.object || collider,
			scale = object.scale,
			side = object.material.side,
			geometry = object.geometry,
			vertices = geometry.vertices,
			faces,
			face,
			rayLocal = localize_ray( ray, object ),
			collision,
			distance,
			distanceMin = Number.MAX_VALUE,
			faceMin,
			intersection = {
				object: object,
				distance: Number.MAX_VALUE,
				normal: new THREE.Vector3(),
				point: new THREE.Vector3()
			};
		
		// handle faces
		
		if ( collider.faces ) {
			
			faces = main.to_array( collider.faces );
			
		}
		
		if ( typeof faces === 'undefined' || faces.length === 0 ) {
			
			faces = geometry.faces;
			
		}
		
		// for each face in collider
		
		for( i = 0, l = faces.length; i < l; i ++ ) {
			
			face = faces[ i ];
			
			p0.copy( vertices[ face.a ] ).multiplySelf( scale );
			p1.copy( vertices[ face.b ] ).multiplySelf( scale );
			p2.copy( vertices[ face.c ] ).multiplySelf( scale );
			
			if ( face instanceof THREE.Face4 ) {
				
				p3.copy( vertices[ face.d ] ).multiplySelf( scale );
				
				collision = raycast_triangle( rayLocal, p0, p1, p3, object, distanceMin, side );
				distance = collision.distance;
				
				if( distance < distanceMin ) {
					
					distanceMin = distance;
					faceMin = face;
					intersection.normal.copy( collision.normal );
					intersection.point.copy( collision.point );
					
				}
				
				collision = raycast_triangle( rayLocal, p1, p2, p3, object, distanceMin, side );
				distance = collision.distance;
				
				if( distance < distanceMin ) {
					
					distanceMin = distance;
					faceMin = face;
					intersection.normal.copy( collision.normal );
					intersection.point.copy( collision.point );
					
				}
				
			}
			else {
				
				collision = raycast_triangle( rayLocal, p0, p1, p2, object, distanceMin, side, face.normal );
				distance = collision.distance;
				
				if( distance < distanceMin ) {
					
					distanceMin = distance;
					faceMin = face;
					intersection.normal.copy( collision.normal );
					intersection.point.copy( collision.point );
					
				}
				
			}
			
		}
		
		intersection.distance = distanceMin;
		intersection.face = faceMin;
		intersection.normal.normalize();
		
		return intersection;
		
	}
	
	function raycast_triangle ( ray, p0, p1, p2, object, distanceMin, side, normal ) {
		
		var e1 = utilVec31Triangle,
			e2 = utilVec32Triangle,
			origin = ray.origin,
			direction = ray.direction,
			dotDirectionNormal,
			planeDistance,
			dotOriginNormal,
			point,
			distance;
		
		// calculate normal if not provided
		
		if ( normal instanceof THREE.Vector3 !== true ) {
			
			e1.sub( p1, p0 );
			e2.sub( p2, p1 );
			
			normal = utilVec33Triangle.cross( e1, e2 );
			
		}
		else {
			
			normal = utilVec33Triangle.copy( normal );
			
		}
		
		// angle between ray direction and triangle normal
		
		if ( side === THREE.BackSide ) {
			
			normal.multiplyScalar( -1 );
			
		}
		
		dotDirectionNormal = direction.dot( normal );
		
		// ray and triangle are parallel ( = ) or facing similar direction ( > )
		
		if ( !( dotDirectionNormal < 0 ) ) {
			
			if ( side === THREE.DoubleSide ) {
				
				normal.multiplyScalar( -1 );
				dotDirectionNormal *= -1;
				
			}
			else {
				
				return { distance: Number.MAX_VALUE };
				
			}
		
		}
		
		// distance along ray from origin to triangle plane
		
		planeDistance = normal.dot( p0 );
		dotOriginNormal = origin.dot( normal );
		
		distance = planeDistance - dotOriginNormal;
		
		// distance > 0 would take us behind ray, as dotDirectionNormal must be negative
		// so distance should be negative or zero at this point
		
		if ( distance > 0 || distance < dotDirectionNormal * ray.far || distance < dotDirectionNormal * distanceMin ) {
			
			return { distance: Number.MAX_VALUE };
			
		}
		
		// complete distance

		distance = distance / dotDirectionNormal;
		
		// ray has point in plane of triangle, now we need to know if point is inside triangle
		
		point = utilVec34Triangle.copy( direction ).multiplyScalar( distance ).addSelf( origin );
		
		if ( point_outside_triangle( point, p0, p1, p2 ) ) {
			
			return { distance: Number.MAX_VALUE };
			
		}
		
		return { distance: distance, point: point, normal: normal };

	}
	
} (KAIOPUA) );