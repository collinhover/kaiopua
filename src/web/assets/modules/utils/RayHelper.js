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
		assetPath = "assets/modules/utils/RayHelper.js",
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
		utilVec31PointFace,
		utilVec32PointFace,
		utilVec33PointFace,
		utilVec31Triangle,
		utilVec32Triangle,
		utilVec33Triangle;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, {
		data: _RayHelper,
		requirements: [
			"assets/modules/utils/MathHelper.js",
			"assets/modules/utils/VectorHelper.js",
			"assets/modules/utils/SceneHelper.js"
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
		utilVec31PointFace = new THREE.Vector3();
		utilVec32PointFace = new THREE.Vector3();
		utilVec33PointFace = new THREE.Vector3();
		utilVec31Triangle = new THREE.Vector3();
		utilVec32Triangle = new THREE.Vector3();
		utilVec33Triangle = new THREE.Vector3();
		
		// functions
		
		_RayHelper.distance_from_intersection = distance_from_intersection;
		_RayHelper.closest_point_from_line_to_point = closest_point_from_line_to_point;
		
		_RayHelper.Collider = Collider;
		_RayHelper.PlaneCollider = PlaneCollider;
		_RayHelper.SphereCollider = SphereCollider;
		_RayHelper.BoxCollider = BoxCollider;
		_RayHelper.MeshCollider = MeshCollider;
		_RayHelper.ObjectColliderOBB = ObjectColliderOBB;
		
		_RayHelper.raycast = raycast;
		
	}
	
	/*===================================================
    
    helpers
    
    =====================================================*/
	
	function localize_ray ( ray, object, i ) {
		
		var scale,
			matrixObj,
			matrixObjCopy = utilMat41Localize,
			mt = utilMat42Localize,
			rt = utilRay1Localize;
		
		rt.origin.copy( ray.origin );
		rt.direction.copy( ray.direction );
		
		if ( object instanceof THREE.Mesh ) {
			
			scale = object.scale,
			matrixObj = object.matrixWorld,
			
			// get copy of object world matrix without scale applied
			// matrix with scale does not seem to invert correctly
			
			matrixObjCopy.extractPosition( matrixObj );
			matrixObjCopy.extractRotation( matrixObj, scale );
			
			// invert copy
			
			mt.getInverse( matrixObjCopy );
			
			mt.multiplyVector3( rt.origin );
			mt.rotateAxis( rt.direction );
			
			rt.direction.normalize();
			
		}

		return rt;

	}
	
	function distance_from_intersection ( point, origin, direction, length ) {
		
		return _VectorHelper.distance_to( point, closest_point_from_line_to_point( point, origin, direction, length ) );
		
	}
	
	function closest_point_from_line_to_point ( point, origin, direction, length ) {
		
		var dot,
			dotClamped,
			originToPoint = utilVec31LinePoint.sub( point, origin ),
			directionMagnitude = utilVec32LinePoint.copy( direction ).normalize(),
			pointClosest = utilVec33LinePoint;
		
		dot = originToPoint.dot( direction );
		
		// if line segment
		
		if( main.is_number( length ) && length > 0 ) {
			
			dotClamped = _MathHelper.clamp( dot / length, 0, 1 );
			
		}
		// else infinite ray
		else {
			
			length = 1;
			dotClamped = Math.max( 0, dot );
			
		}
		
		pointClosest.add( origin, directionMagnitude.multiplyScalar( dotClamped * length ) );
		
		return pointClosest;
		
	}
	
	var point_in_face3 = function ( p, a, b, c ) {
		
		// http://www.blackpawn.com/texts/pointinpoly/default.html
		
		var v0 = utilVec31PointFace.sub( c, a ),
			v1 = utilVec32PointFace.sub( b, a ),
			v2 = utilVec33PointFace.sub( p, a ),
			dot00 = v0.dot( v0 ),
			dot01 = v0.dot( v1 ),
			dot02 = v0.dot( v2 ),
			dot11 = v1.dot( v1 ),
			dot12 = v1.dot( v2 ),
			invDenom = 1 / ( dot00 * dot11 - dot01 * dot01 ),
			u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom,
			v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;
		
		return ( u >= 0 ) && ( v >= 0 ) && ( u + v < 1 );
		
	}
	
	function sort_intersections ( a, b ) {
		
		return a.distance - b.distance;
		
	}
	
	/*===================================================
	
	colliders
	
	=====================================================*/
	 
	function Collider () {
		
		this.normal = new THREE.Vector3();
		
	}

	function PlaneCollider ( point, normal ) {
		
		Collider.call( this );

		this.point = point;
		this.normal = normal;

	}
	PlaneCollider.prototype = new Collider();
	PlaneCollider.prototype.constructor = PlaneCollider;

	function SphereCollider ( center, radius ) {
		
		Collider.call( this );

		this.center = center;
		this.radius = radius;
		this.radiusSq = radius * radius;

	}
	SphereCollider.prototype = new Collider();
	SphereCollider.prototype.constructor = SphereCollider;

	function BoxCollider ( min, max ) {
		
		Collider.call( this );

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
		
		BoxCollider.call( this, min, max );
		
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
		
		BoxCollider.call( this, min, max );
		
		// store object
		
		this.object = object;

	}
	ObjectColliderOBB.prototype = new BoxCollider();
	ObjectColliderOBB.prototype.constructor = ObjectColliderOBB;

	function MeshCollider ( object, box ) {
		
		Collider.call( this );

		this.object = object;
		this.box = box || new ObjectColliderOBB( this.object );
		
	}
	MeshCollider.prototype = new Collider();
	MeshCollider.prototype.constructor = MeshCollider;
	
	/*===================================================
    
    raycasting
    
    =====================================================*/
	
	function raycast ( parameters ) {
		
		var i, l,
			j, k,
			ray,
			ignore,
			objects,
			object,
			children,
			colliders,
			camera,
			pointer,
			pointerPosition = utilVec31Casting,
			projector = utilProjector1Casting,
			octree,
			hierarchySearch,
			hierarchyIntersect,
			intersections = [],
			childIntersections,
			intersectionPotential,
			intersectedObject,
			intersectionDistance = Number.MAX_VALUE,
			intersection;
		
		// handle parameters
		
		parameters = parameters || {};
		
		objects = main.ensure_array( parameters.objects ).slice( 0 );
		colliders = main.ensure_array( parameters.colliders ).slice( 0 );
		octree = parameters.octree;
		hierarchySearch = parameters.hierarchySearch;
		hierarchyIntersect = parameters.hierarchyIntersect;
		camera = parameters.camera;
		pointer = parameters.pointer;
		ignore = parameters.ignore;
		
		// ray
		
		if ( parameters.ray instanceof THREE.Ray !== true ) {
			
			ray = parameters.ray = utilRay1Casting;
			
			// origin
			
			if ( parameters.origin instanceof THREE.Vector3 ) {
				
				ray.origin.copy( parameters.origin );
				
			}
			
			// direction
			
			if ( parameters.direction instanceof THREE.Vector3 ) {
				
				ray.direction.copy( parameters.direction );
				
			}
			
			// offset
			
			if ( parameters.offset instanceof THREE.Vector3 ) {
				
				ray.origin.addSelf( parameters.offset );
				
			}
			
		}
		
		// if using pointer
		
		if ( typeof pointer !== 'undefined' && typeof camera !== 'undefined' ) {
			
			// get corrected pointer position
			
			pointerPosition.x = ( pointer.x / shared.screenWidth ) * 2 - 1;
			pointerPosition.y = -( pointer.y / shared.screenHeight ) * 2 + 1;
			pointerPosition.z = 0.5;
			
			// unproject pointer position
			
			projector.unprojectVector( pointerPosition, camera );
			
			// set ray

			ray.origin.copy( camera.position );
			ray.direction.copy( pointerPosition.subSelf( camera.position ) );
			
		}
		
		// ray length
		
		if ( main.is_number( parameters.far ) && parameters.far > 0 ) {
			
			ray.far = parameters.far;
			
		}
		
		// normalize ray direction
		
		ray.direction.normalize();
		
		// if using octree search for potential colliders
		
		if ( typeof octree !== 'undefined' ) {
			
			colliders = colliders.concat( octree.search( ray.origin, ray.far, true, ray.direction ) );
			
		}
		
		// objects
		
		if ( objects.length > 0 ) {
		
			// account for hierarchy
			
			if ( hierarchySearch !== false ) {
				
				// if intersection of hierarchy allowed, add all object children to objects list
				
				if ( hierarchyIntersect === true ) {
					
					objects = _SceneHelper.extract_children_from_objects( objects, objects );
				
				}
				// else raycast children and add reference to ancestor
				else {
					
					for ( i = 0, l = objects.length; i < l; i++ ) {
						
						object = objects[ i ];
						
						children = _SceneHelper.extract_children_from_objects( object );
						
						childIntersections = raycast_objects( ray, children );
						
						for ( j = 0, k = childIntersections.length; j < k; j++ ) {
							
							childIntersections[ j ].ancestor = object;
							
						}
						
						intersections = intersections.concat( childIntersections );
						
					}
					
				}
				
			}
			
			// raycast objects
			
			intersections = intersections.concat( raycast_objects( ray, objects ) );
			
		}
		
		// colliders
		
		if ( colliders.length > 0 ) {
			
			// raycast_colliders is about 25% slower but supports casting non-planar quads
			
			intersections = intersections.concat( raycast_colliders( ray, colliders ) );
			//intersections = intersections.concat( ray.intersectOctreeObjects( colliders ) );
			
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
				
				for ( i = 0, l = intersections.length; i < l; i++ ) {
					
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

			collider = colliders[ i ];
			
			// ray cast collider
			
			intersection = raycast_collider( ray, collider );
			
			if ( intersection.distance < Number.MAX_VALUE ) {
				
				// redo raycast for any mesh collider with dynamic box
				
				if ( collider instanceof MeshCollider && collider.box ) {
					
					intersection = raycast_mesh( ray, collider );
					
				}
				
				// store
				
				if ( intersection.distance < Number.MAX_VALUE ) {
					
					intersections.push( intersection );
					
				}

			}

		}
		
		return intersections;

	}

	function raycast_collider ( ray, collider ) {
		
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
		else if ( collider instanceof MeshCollider && collider.box ) {
			
			return raycast_box( ray, collider.box );
			
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
				distance: Number.MAX_VALUE
			};

		if( t < 0 ) {
			
			ds = ( d - r.origin.dot( collider.normal ) ) / t;
			
			if( ds > 0 ) {
				
				intersection.distance = ds;
				
				return intersection;
				
			}
			
		}
		
		return intersection;

	}

	function raycast_sphere ( r, collider ) {

		var e = collider.center.clone().subSelf( r.origin ),
			a,
			t,
			intersection = {
				object: collider.object || collider,
				distance: Number.MAX_VALUE
			};
		
		if ( e.lengthSq < collider.radiusSq ) {
			
			intersection.distance = -1;
			
			return intersection;
		}
		
		a = e.dot( r.direction.clone() );
		
		if ( a <= 0 ) {
			
			return intersection;
			
		}

		t = collider.radiusSq - ( e.lengthSq() - a * a );
		
		if ( t >= 0 ) {
		
			intersection.distance = Math.abs( a ) - Math.sqrt( t );
			
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
			scale,
			xt = 0, yt = 0, zt = 0,
			xn = 0, yn = 0, zn = 0,
			ins = true,
			which,
			t,
			intersection = {
				object: object,
				distance: Number.MAX_VALUE,
				normal: new THREE.Vector3()
			};
		
		// account for object
		
		if ( typeof object !== 'undefined' ) {
			
			scale = object.scale;
			
			abMin.multiplySelf( scale );
			abMax.multiplySelf( scale );
			
		}
		
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
		
		if( which === 0 ) {
			
			var y = origin.y + direction.y * t;
			if ( y < abMin.y || y > abMax.y ) return intersection;
			var z = origin.z + direction.z * t;
			if ( z < abMin.z || z > abMax.z ) return intersection;
			intersection.normal.set( xn, 0, 0 );
			
		}
		else if ( which === 1 ) {
			
			var x = origin.x + direction.x * t;
			if ( x < abMin.x || x > abMax.x ) return intersection;
			var z = origin.z + direction.z * t;
			if ( z < abMin.z || z > abMax.z ) return intersection;
			intersection.normal.set( 0, yn, 0) ;
			
		}
		else if ( which === 2 ) {
			
			var x = origin.x + direction.x * t;
			if ( x < abMin.x || x > abMax.x ) return intersection;
			var y = origin.y + direction.y * t;
			if ( y < abMin.y || y > abMax.y ) return intersection;
			intersection.normal.set( 0, 0, zn );
			
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
			geometry = object.geometry,
			vertices = geometry.vertices,
			faces = collider.faces ? main.ensure_array( collider.faces ) : geometry.faces,
			rayLocal = localize_ray( ray, object ),
			collisionNormal = utilVec31CastMesh,
			faceDist,
			minDist = Number.MAX_VALUE,
			minFace,
			intersection = {
				object: object,
				distance: Number.MAX_VALUE,
				normal: new THREE.Vector3()
			};
		
		// for each face in collider
		
		for( i = 0, l = faces.length; i < l; i ++ ) {
			
			var face = faces[ i ];
			
			p0.copy( vertices[ face.a ] ).multiplySelf( scale );
			p1.copy( vertices[ face.b ] ).multiplySelf( scale );
			p2.copy( vertices[ face.c ] ).multiplySelf( scale );
			
			if ( face instanceof THREE.Face4 ) {
				
				p3.copy( vertices[ face.d ] ).multiplySelf( scale );
				
				faceDist = raycast_triangle( rayLocal, p0, p1, p3, minDist, collisionNormal, object );
				
				if( faceDist < minDist ) {
					
					minDist = faceDist;
					minFace = face;
					intersection.normal.copy( collisionNormal );
					
				}
				
				faceDist = raycast_triangle( rayLocal, p1, p2, p3, minDist, collisionNormal, object );
				
				if( faceDist < minDist ) {
					
					minDist = faceDist;
					minFace = face;
					intersection.normal.copy( collisionNormal );
					
				}
				
			}
			else {
				
				faceDist = raycast_triangle( rayLocal, p0, p1, p2, minDist, collisionNormal, object );
				
				if( faceDist < minDist ) {
					
					minDist = faceDist;
					minFace = face;
					intersection.normal.copy( collisionNormal );
					
				}
				
			}
			
		}
		
		intersection.distance = minDist;
		intersection.face = minFace;
		intersection.normal.normalize();
		
		return intersection;
		
	}

	function raycast_triangle ( ray, p0, p1, p2, mind, n, object ) {

		var e1 = utilVec31Triangle,
			e2 = utilVec32Triangle;
		
		n.set( 0, 0, 0 );

		// do not crash on quads, fail instead

		e1.sub( p1, p0 );
		e2.sub( p2, p1 );
		n.cross( e1, e2 )

		var dot = n.dot( ray.direction );
		if ( !( dot < 0 ) ) {
			
			if ( object.material.side === THREE.DoubleSide || object.material.side === THREE.BackSide ) {
			
				n.multiplyScalar (-1.0);
				dot *= -1.0;
			
			} else {
				
				return Number.MAX_VALUE;
			
			}
		
		}

		var d = n.dot( p0 );
		var t = d - n.dot( ray.origin );

		if ( !( t <= 0 ) ) return Number.MAX_VALUE;
		if ( !( t >= dot * mind ) ) return Number.MAX_VALUE;

		t = t / dot;

		var p = utilVec33Triangle.copy( ray.direction ).multiplyScalar( t ).addSelf( ray.origin ),
			u0, u1, u2, v0, v1, v2;

		if ( Math.abs( n.x ) > Math.abs( n.y ) ) {

			if ( Math.abs( n.x ) > Math.abs( n.z ) ) {

				u0 = p.y  - p0.y;
				u1 = p1.y - p0.y;
				u2 = p2.y - p0.y;

				v0 = p.z  - p0.z;
				v1 = p1.z - p0.z;
				v2 = p2.z - p0.z;

			} else {

				u0 = p.x  - p0.x;
				u1 = p1.x - p0.x;
				u2 = p2.x - p0.x;

				v0 = p.y  - p0.y;
				v1 = p1.y - p0.y;
				v2 = p2.y - p0.y;

			}

		} else {

			if( Math.abs( n.y ) > Math.abs( n.z ) ) {

				u0 = p.x  - p0.x;
				u1 = p1.x - p0.x;
				u2 = p2.x - p0.x;

				v0 = p.z  - p0.z;
				v1 = p1.z - p0.z;
				v2 = p2.z - p0.z;

			} else {

				u0 = p.x  - p0.x;
				u1 = p1.x - p0.x;
				u2 = p2.x - p0.x;

				v0 = p.y  - p0.y;
				v1 = p1.y - p0.y;
				v2 = p2.y - p0.y;

			}

		}

		var temp = u1 * v2 - v1 * u2;
		if( !(temp != 0) ) return Number.MAX_VALUE;
		//console.log("temp: " + temp);
		temp = 1 / temp;

		var alpha = ( u0 * v2 - v0 * u2 ) * temp;
		if( !(alpha >= 0) ) return Number.MAX_VALUE;
		//console.log("alpha: " + alpha);

		var beta = ( u1 * v0 - v1 * u0 ) * temp;
		if( !(beta >= 0) ) return Number.MAX_VALUE;
		//console.log("beta: " + beta);

		var gamma = 1 - alpha - beta;
		if( !(gamma >= 0) ) return Number.MAX_VALUE;
		//console.log("gamma: " + gamma);

		return t;

	}
	
} (KAIOPUA) );