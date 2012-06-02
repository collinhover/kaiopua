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
		_SceneHelper,
		utilRay1Casting,
		utilRay1Localize,
		utilProjector1Casting,
		utilMat41Localize,
		utilMat42Localize,
		utilVec31Box,
		utilVec32Box,
		utilVec31Casting,
		utilVec31Collision,
		utilVec31Triangle,
		utilVec32Triangle,
		utilVec33Triangle;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, {
		data: _RayHelper,
		requirements: [
			"assets/modules/utils/SceneHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( sh ) {
		console.log('internal ray helper', _RayHelper);
		
		// reqs
		
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
		utilVec31Collision = new THREE.Vector3();
		utilVec31Triangle = new THREE.Vector3();
		utilVec32Triangle = new THREE.Vector3();
		utilVec33Triangle = new THREE.Vector3();
		
		// functions
		
		_RayHelper.Collider = Collider;
		_RayHelper.PlaneCollider = PlaneCollider;
		_RayHelper.SphereCollider = SphereCollider;
		_RayHelper.BoxCollider = BoxCollider;
		_RayHelper.MeshCollider = MeshCollider;
		_RayHelper.ObjectColliderOBB = ObjectColliderOBB;
		
		_RayHelper.raycast = raycast;
		_RayHelper.raycast_physics = raycast_physics;
		_RayHelper.raycast_from_mouse = raycast_from_mouse;
		_RayHelper.raycast_objects = raycast_objects;
		
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
			ray,
			origin,
			direction,
			ignore,
			intersections = [],
			intersectionPotential,
			intersectedObject,
			intersectionDistance = Number.MAX_VALUE,
			intersection;
		
		// handle parameters
		
		parameters = parameters || {};
		
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
		
		// cast through physics
		
		if ( typeof parameters.colliders !== 'undefined' || typeof parameters.octree !== 'undefined' ) {
			
			intersections = intersections.concat( raycast_physics( parameters ) );
			
		}
		
		// cast through objects
		
		if ( typeof parameters.mouse !== 'undefined' ) {
			
			intersections = intersections.concat( raycast_from_mouse( parameters ) );
			
		}
		else if ( typeof parameters.objects !== 'undefined' ) {
			
			intersections = intersections.concat( raycast_objects( parameters ) );
			
		}
		
		// if all required
		
		if ( parameters.allIntersections === true ) {
			
			return intersections;
			
		}
		// else return nearest
		else {
			
			ignore = main.ensure_array( parameters.ignore );
			
			for ( i = 0, l = intersections.length; i < l; i++ ) {
				
				intersectionPotential = intersections[ i ];
				
				intersectedObject = intersectionPotential.mesh || intersectionPotential.object;
				
				if ( intersectionPotential.distance < intersectionDistance && ignore.indexOf( intersectedObject ) === -1 ) {
					
					intersection = intersectionPotential;
					intersectionDistance = intersectionPotential.distance;
					
				}
				
			}
			
			return intersection;
		
		}
		
	}
	
	function raycast_physics ( parameters ) {
		
		var i, l,
			ray = parameters.ray,
			octree = parameters.octree,
			distance = parameters.distance,
			colliders = parameters.colliders,
			intersections;
		
		// if using octree
		
		if ( typeof octree !== 'undefined' && distance > 0 ) {
			
			// search for potential colliders
			
			colliders = main.ensure_array( colliders ).slice( 0 ).concat( octree.search( ray.origin, distance, true ) );
			//console.log( ' RAYCAST, octree search results from position ', ray.origin.x, ray.origin.y, ray.origin.z, ' + dist ', distance, ' = # ', colliders.length, ' + colliders', colliders );
			
		}
		
		// ray cast colliders
		
		intersections = raycast_colliders( ray, colliders );
		//console.log( ' RAYCAST, intersections ', intersections );
		return intersections;
		
	}
	
	function raycast_from_mouse ( parameters ) {
		
		var ray = parameters.ray,
			camera = parameters.camera,
			mouse = parameters.mouse,
			mousePosition = utilVec31Casting,
			projector = utilProjector1Casting;
		
		// get corrected mouse position
		
		mousePosition.x = ( mouse.x / shared.screenWidth ) * 2 - 1;
		mousePosition.y = -( mouse.y / shared.screenHeight ) * 2 + 1;
		mousePosition.z = 0.5;
		
		// unproject mouse position
		
		projector.unprojectVector( mousePosition, camera );
		
		// set ray

		ray.origin.copy( camera.position );
		ray.direction.copy( mousePosition.subSelf( camera.position ) ).normalize();
		
		return raycast_objects( parameters );
		
	}
	
	function raycast_objects ( parameters ) {
		
		var ray = parameters.ray,
			objects = parameters.objects,
			hierarchical = parameters.hierarchical;
		
		// account for hierarchy and extract all children
		
		if ( hierarchical !== false ) {
			
			objects = _SceneHelper.extract_children_from_objects( objects, objects );
			
		}
		
		// find intersections
		
		return ray.intersectObjects( objects );
		
	}
	
	/*===================================================
    
    collisions
    
    =====================================================*/
	
	function raycast_colliders ( ray, colliders ) {

		var i, l,
			hits = [],
			d,
			collider,
			colliderRecast,
			ld = 0;
		
		if ( main.is_array( colliders ) ) {
			
			ray.direction.normalize();
			
			for ( i = 0, l = colliders.length; i < l; i++ ) {

				collider = colliders[ i ];
				
				// TODO: allow for return of face colliding with
				
				d = raycast_collider( ray, collider );
				
				if ( d < Number.MAX_VALUE ) {
					
					collider.distance = d;
					
					// redo raycast for any mesh collider with dynamic box
					
					if ( collider instanceof MeshCollider && collider.box ) {
						
						d = raycast_mesh( ray, collider );
						
						if ( d < Number.MAX_VALUE ) {
							collider.distance = d;
						}
						else {
							collider.distance = Number.MAX_VALUE;
						}
						
					}
					
					// check distance

					if ( d > ld )
						hits.push( collider );
					else
						hits.unshift( collider );

					ld = d;

				}

			}
			
		}
		
		return hits;

	}

	function raycast_collider ( ray, collider ) {
		
		// ensure collider properties
		
		if ( collider.normal instanceof THREE.Vector3 !== true ) {
			
			collider.normal = new THREE.Vector3();
			
		}
		
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
	
	function raycast_plane ( r, p ) {

		var t = r.direction.dot( p.normal );
		var d = p.point.dot( p.normal );
		var ds;

		if( t < 0 ) ds = ( d - r.origin.dot( p.normal ) ) / t;
		else return Number.MAX_VALUE;

		if( ds > 0 ) return ds;
		else return Number.MAX_VALUE;

	}

	function raycast_sphere ( r, s ) {

		var e = s.center.clone().subSelf( r.origin );
		if ( e.lengthSq < s.radiusSq ) return -1;

		var a = e.dot( r.direction.clone() );
		if ( a <= 0 ) return Number.MAX_VALUE;

		var t = s.radiusSq - ( e.lengthSq() - a * a );
		if ( t >= 0 ) return Math.abs( a ) - Math.sqrt( t );

		return Number.MAX_VALUE;

	}

	function raycast_box ( ray, ab ) {
		
		var object = ab.object,
			rt = localize_ray( ray, object ),
			abMin = utilVec31Box.copy( ab.min ),
			abMax = utilVec32Box.copy( ab.max ),
			origin = rt.origin,
			direction = rt.direction,
			scale;
		
		// account for object
		
		if ( typeof object !== 'undefined' ) {
			
			scale = object.scale;
			
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
		
	}
	
	function raycast_mesh ( ray, collider ) {
		
		var i, l,
			p0 = new THREE.Vector3(),
			p1 = new THREE.Vector3(),
			p2 = new THREE.Vector3(),
			p3 = new THREE.Vector3(),
			object = collider.object,
			scale = object.scale,
			geometry = object.geometry,
			vertices = geometry.vertices,
			faces = collider.faces ? main.ensure_array( collider.faces ) : geometry.faces,
			rayLocal = localize_ray( ray, object ),
			distMin = Number.MAX_VALUE,
			collisionNormal = utilVec31Collision,
			faceDist,
			faceClosest;
		
		// for each face in collider
		
		for( i = 0, l = faces.length; i < l; i ++ ) {
			
			var face = faces[ i ];
			
			p0.copy( vertices[ face.a ] ).multiplySelf( scale );
			p1.copy( vertices[ face.b ] ).multiplySelf( scale );
			p2.copy( vertices[ face.c ] ).multiplySelf( scale );
			
			if ( face instanceof THREE.Face4 ) {
				
				p3.copy( vertices[ face.d ] ).multiplySelf( scale );
				
				faceDist = raycast_triangle( rayLocal, p0, p1, p3, distMin, collisionNormal, object );
				
				if( faceDist < distMin ) {
					
					distMin = faceDist;
					faceClosest = face;
					collider.normal.copy( collisionNormal );
					collider.normal.normalize();
					
				}
				
				faceDist = raycast_triangle( rayLocal, p1, p2, p3, distMin, collisionNormal, object );
				
				if( faceDist < distMin ) {
					
					distMin = faceDist;
					faceClosest = face;
					collider.normal.copy( collisionNormal );
					collider.normal.normalize();
					
				}
				
			}
			else {
				
				faceDist = raycast_triangle( rayLocal, p0, p1, p2, distMin, collisionNormal, object );
				
				if( faceDist < distMin ) {
					
					distMin = faceDist;
					faceClosest = face;
					collider.normal.copy( collisionNormal );
					collider.normal.normalize();
					
				}
				
			}
			
		}
		
		return distMin;//{ distance: distMin, face: faceClosest };
		
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
			
			if ( object.doubleSided || object.flipSided ) {
			
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