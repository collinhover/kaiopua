/**
 * @author bartek drozdz / http://everyday3d.com/
 * @author collin hover / http://collinhover.com/
 */

/*===================================================

colliders

=====================================================*/
 
 THREE.Collider = function () {
	 
 };

THREE.PlaneCollider = function( point, normal ) {
	
	THREE.Collider.call( this );

	this.point = point;
	this.normal = normal;

};
THREE.PlaneCollider.prototype = new THREE.Collider();
THREE.PlaneCollider.prototype.constructor = THREE.PlaneCollider;

THREE.SphereCollider = function( center, radius ) {
	
	THREE.Collider.call( this );

	this.center = center;
	this.radius = radius;
	this.radiusSq = radius * radius;

};
THREE.SphereCollider.prototype = new THREE.Collider();
THREE.SphereCollider.prototype.constructor = THREE.SphereCollider;

THREE.BoxCollider = function( min, max ) {
	
	THREE.Collider.call( this );

	this.min = min;
	this.max = max;

	this.normal = new THREE.Vector3();

};
THREE.BoxCollider.prototype = new THREE.Collider();
THREE.BoxCollider.prototype.constructor = THREE.BoxCollider;

// @params object THREE.Mesh
// @returns CBox static Axis-Aligned Bounding Box
//
// The AABB is calculated based on current
// position of the object (assumes it won't move)

THREE.ObjectColliderAABB = function( object ) {
	
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
	
	THREE.BoxCollider.call( this, min, max );
	
	// add object position
	
	this.min.addSelf( object.position );
	this.max.addSelf( object.position );

};
THREE.ObjectColliderAABB.prototype = new THREE.BoxCollider();
THREE.ObjectColliderAABB.prototype.constructor = THREE.ObjectColliderAABB;

// @params object THREE.Mesh
// @returns CBox dynamic Object Bounding Box

THREE.ObjectColliderOBB = function( object ) {
	
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
	
	THREE.BoxCollider.call( this, min, max );
	
	// store object
	
	this.object = object;

};
THREE.ObjectColliderOBB.prototype = new THREE.BoxCollider();
THREE.ObjectColliderOBB.prototype.constructor = THREE.ObjectColliderOBB;

THREE.MeshCollider = function( object, box ) {
	
	THREE.Collider.call( this );

	this.object = object;
	this.box = box || new THREE.ObjectColliderOBB( this.object );

	this.normal = new THREE.Vector3();
	
};
THREE.MeshCollider.prototype = new THREE.Collider();
THREE.MeshCollider.prototype.constructor = THREE.MeshCollider;

/*===================================================

system

=====================================================*/

THREE.CollisionSystem = function() {

	this.collisionNormal = new THREE.Vector3();
	this.colliders = [];
	this.hits = [];

};

THREE.Collisions = new THREE.CollisionSystem();

THREE.CollisionSystem.prototype.merge = function( collisionSystem ) {

	Array.prototype.push.apply( this.colliders, collisionSystem.colliders );
	Array.prototype.push.apply( this.hits, collisionSystem.hits );

};

THREE.CollisionSystem.prototype.rayCastColliders = function( ray, colliders ) {

	ray.direction.normalize();

	this.hits = [];

	var i, l, 
		d,
		collider,
		colliderRecast,
		ld = 0;
	
	colliders = colliders || this.colliders;
	
	for ( i = 0, l = colliders.length; i < l; i++ ) {

		collider = colliders[ i ];
		
		// TODO: allow for return of face colliding with
		
		d = this.rayCast( ray, collider );
		
		if ( d < Number.MAX_VALUE ) {
			
			collider.distance = d;
			
			// redo raycast for any mesh collider with dynamic box
			
			if ( collider instanceof THREE.MeshCollider && collider.box ) {
				
				d = this.rayMesh( ray, collider );
				
				if ( d < Number.MAX_VALUE ) {
					collider.distance = d;
				}
				/*
				colliderRecast = this.rayMesh( ray, collider );
				
				if ( colliderRecast.distance < Number.MAX_VALUE ) {
					collider.distance = colliderRecast.distance;
					collider.face = colliderRecast.face;
				}
				*/
				else {
					collider.distance = Number.MAX_VALUE;
				}
				
			}
			
			// check distance

			if ( d > ld )
				this.hits.push( collider );
			else
				this.hits.unshift( collider );

			ld = d;

		}

	}
	
	return this.hits;

};

THREE.CollisionSystem.prototype.rayCast = function( ray, collider ) {
	
	// ensure collider properties
	
	if ( collider.normal instanceof THREE.Vector3 !== true ) {
		
		collider.normal = new THREE.Vector3();
		
	}
	
	// cast by type

	if ( collider instanceof THREE.PlaneCollider ) {
		
		return this.rayPlane( ray, collider );
		
	}
	else if ( collider instanceof THREE.SphereCollider ) {
		
		return this.raySphere( ray, collider );
		
	}
	else if ( collider instanceof THREE.BoxCollider ) {
		
		return this.rayBox( ray, collider );
		
	}
	else if ( collider instanceof THREE.MeshCollider && collider.box ) {
		
		return this.rayBox( ray, collider.box );
		
	}
	else {
		console.log( 'physics cast rayMesh with ', collider );
		return this.rayMesh( ray, collider );
		
	}

};

/*
// ORIGINAL RAYMESH

THREE.CollisionSystem.prototype.rayMesh = function( r, me ) {

	var rt = this.makeRayLocal( r, me.mesh );

	var d = Number.MAX_VALUE;
    var nearestface;

	for( var i = 0; i < me.numFaces; i++ ) {
        var face = me.mesh.geometry.faces[i];
        var p0 = me.mesh.geometry.vertices[ face.a ];
        var p1 = me.mesh.geometry.vertices[ face.b ];
        var p2 = me.mesh.geometry.vertices[ face.c ];
        var p3 = face instanceof THREE.Face4 ? me.mesh.geometry.vertices[ face.d ] : null;

        if (face instanceof THREE.Face3) {
            var nd = this.rayTriangle( rt, p0, p1, p2, d, this.collisionNormal, me.mesh );

            if( nd < d ) {

                d = nd;
                nearestface = i;
                me.normal.copy( this.collisionNormal );
                me.normal.normalize();

            }
        
        }
        
        else if (face instanceof THREE.Face4) {
            
            var nd = this.rayTriangle( rt, p0, p1, p3, d, this.collisionNormal, me.mesh );
            
            if( nd < d ) {

                d = nd;
                nearestface = i;
                me.normal.copy( this.collisionNormal );
                me.normal.normalize();

            }
            
            nd = this.rayTriangle( rt, p1, p2, p3, d, this.collisionNormal, me.mesh );
            
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
*/

THREE.CollisionSystem.prototype.rayMesh = function( ray, collider ) {
	
	var i, l,
		p0 = new THREE.Vector3(),
		p1 = new THREE.Vector3(),
		p2 = new THREE.Vector3(),
		p3 = new THREE.Vector3(),
		object = collider.object,
		scale = object.scale,
		geometry = object.geometry,
		vertices = geometry.vertices,
		faces = collider.faces ? ( Object.prototype.toString.call( collider.faces ) !== '[object Array]' ? [ collider.faces ] : collider.faces ) : geometry.faces,// TODO: make check less ugly
		rayLocal = this.makeRayLocal( ray, object ),
		distMin = Number.MAX_VALUE,
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
			
			faceDist = this.rayTriangle( rayLocal, p0, p1, p3, distMin, this.collisionNormal, object );
			
			if( faceDist < distMin ) {
				
				distMin = faceDist;
				faceClosest = face;
				collider.normal.copy( this.collisionNormal );
				collider.normal.normalize();
				
			}
			
			faceDist = this.rayTriangle( rayLocal, p1, p2, p3, distMin, this.collisionNormal, object );
			
			if( faceDist < distMin ) {
				
				distMin = faceDist;
				faceClosest = face;
				collider.normal.copy( this.collisionNormal );
				collider.normal.normalize();
				
			}
			
		}
		else {
			
			faceDist = this.rayTriangle( rayLocal, p0, p1, p2, distMin, this.collisionNormal, object );
			
			if( faceDist < distMin ) {
				
				distMin = faceDist;
				faceClosest = face;
				collider.normal.copy( this.collisionNormal );
				collider.normal.normalize();
				
			}
			
		}
		
	}
	console.log( ' RAYMESH, collider ', collider, ', faces #', faces.length, ' + distMin ', distMin, ' + faceClosest', faceClosest );
	return distMin;//{ distance: distMin, face: faceClosest };
	
};

THREE.CollisionSystem.prototype.rayTriangle = function( ray, p0, p1, p2, mind, n, object ) {

	var e1 = THREE.CollisionSystem.__v1,
		e2 = THREE.CollisionSystem.__v2;
	
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

	var p = THREE.CollisionSystem.__v3;

	p.copy( ray.direction );
	p.multiplyScalar( t );
	p.addSelf( ray.origin );

	var u0, u1, u2, v0, v1, v2;

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

};

/*
// ORIGINAL

THREE.CollisionSystem.prototype.makeRayLocal = function( ray, m ) {

	var mt = THREE.CollisionSystem.__m;
	THREE.Matrix4.makeInvert( m.matrixWorld, mt );

	var rt = THREE.CollisionSystem.__r;
	rt.origin.copy( ray.origin );
	rt.direction.copy( ray.direction );

	mt.multiplyVector3( rt.origin );
	mt.rotateAxis( rt.direction );
	rt.direction.normalize();

	return rt;

};
*/

THREE.CollisionSystem.prototype.makeRayLocal = function( ray, object, i ) {
	
	var scale,
		matrixObj,
		matrixObjCopy,
		mt = THREE.CollisionSystem.__m,
		rt = THREE.CollisionSystem.__r;
	
	rt.origin.copy( ray.origin );
	rt.direction.copy( ray.direction );
	
	if ( object instanceof THREE.Mesh ) {
		
		scale = object.scale,
		matrixObj = object.matrixWorld,
		matrixObjCopy = THREE.CollisionSystem.__mRayLocal;
		
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

};

/*
// ORIGINAL
THREE.CollisionSystem.prototype.rayBox = function( ray, ab ) {

	var rt;

	if ( ab.dynamic && ab.mesh && ab.mesh.matrixWorld ) {

		rt = this.makeRayLocal( ray, ab.mesh );

	} else {

		rt = THREE.CollisionSystem.__r;
		rt.origin.copy( ray.origin );
		rt.direction.copy( ray.direction );

	}

	var xt = 0, yt = 0, zt = 0;
	var xn = 0, yn = 0, zn = 0;
	var ins = true;

	if( rt.origin.x < ab.min.x ) {

		xt = ab.min.x - rt.origin.x;
		//if(xt > ray.direction.x) return return Number.MAX_VALUE;
		xt /= rt.direction.x;
		ins = false;
		xn = -1;

	} else if( rt.origin.x > ab.max.x ) {

		xt = ab.max.x - rt.origin.x;
		//if(xt < ray.direction.x) return return Number.MAX_VALUE;
		xt /= rt.direction.x;
		ins = false;
		xn = 1;

	}

	if( rt.origin.y < ab.min.y ) {

		yt = ab.min.y - rt.origin.y;
		//if(yt > ray.direction.y) return return Number.MAX_VALUE;
		yt /= rt.direction.y;
		ins = false;
		yn = -1;

	} else if( rt.origin.y > ab.max.y ) {

		yt = ab.max.y - rt.origin.y;
		//if(yt < ray.direction.y) return return Number.MAX_VALUE;
		yt /= rt.direction.y;
		ins = false;
		yn = 1;

	}

	if( rt.origin.z < ab.min.z ) {

		zt = ab.min.z - rt.origin.z;
		//if(zt > ray.direction.z) return return Number.MAX_VALUE;
		zt /= rt.direction.z;
		ins = false;
		zn = -1;

	} else if( rt.origin.z > ab.max.z ) {

		zt = ab.max.z - rt.origin.z;
		//if(zt < ray.direction.z) return return Number.MAX_VALUE;
		zt /= rt.direction.z;
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

			var y = rt.origin.y + rt.direction.y * t;
			if ( y < ab.min.y || y > ab.max.y ) return Number.MAX_VALUE;
			var z = rt.origin.z + rt.direction.z * t;
			if ( z < ab.min.z || z > ab.max.z ) return Number.MAX_VALUE;
			ab.normal.set( xn, 0, 0 );
			break;

		case 1:

			var x = rt.origin.x + rt.direction.x * t;
			if ( x < ab.min.x || x > ab.max.x ) return Number.MAX_VALUE;
			var z = rt.origin.z + rt.direction.z * t;
			if ( z < ab.min.z || z > ab.max.z ) return Number.MAX_VALUE;
			ab.normal.set( 0, yn, 0) ;
			break;

		case 2:

			var x = rt.origin.x + rt.direction.x * t;
			if ( x < ab.min.x || x > ab.max.x ) return Number.MAX_VALUE;
			var y = rt.origin.y + rt.direction.y * t;
			if ( y < ab.min.y || y > ab.max.y ) return Number.MAX_VALUE;
			ab.normal.set( 0, 0, zn );
			break;

	}

	return t;

};
*/

THREE.CollisionSystem.prototype.rayBox = function( ray, ab ) {
	
	var object = ab.object,
		rt = this.makeRayLocal( ray, object ),
		abMin = THREE.CollisionSystem.__v1RayBox.copy( ab.min ),
		abMax = THREE.CollisionSystem.__v2RayBox.copy( ab.max ),
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
	
};

THREE.CollisionSystem.prototype.rayPlane = function( r, p ) {

	var t = r.direction.dot( p.normal );
	var d = p.point.dot( p.normal );
	var ds;

	if( t < 0 ) ds = ( d - r.origin.dot( p.normal ) ) / t;
	else return Number.MAX_VALUE;

	if( ds > 0 ) return ds;
	else return Number.MAX_VALUE;

};

THREE.CollisionSystem.prototype.raySphere = function( r, s ) {

	var e = s.center.clone().subSelf( r.origin );
	if ( e.lengthSq < s.radiusSq ) return -1;

	var a = e.dot( r.direction.clone() );
	if ( a <= 0 ) return Number.MAX_VALUE;

	var t = s.radiusSq - ( e.lengthSq() - a * a );
	if ( t >= 0 ) return Math.abs( a ) - Math.sqrt( t );

	return Number.MAX_VALUE;

};

THREE.CollisionSystem.__v1 = new THREE.Vector3();
THREE.CollisionSystem.__v2 = new THREE.Vector3();
THREE.CollisionSystem.__v3 = new THREE.Vector3();
THREE.CollisionSystem.__nr = new THREE.Vector3();
THREE.CollisionSystem.__m = new THREE.Matrix4();
THREE.CollisionSystem.__r = new THREE.Ray();

THREE.CollisionSystem.__mRayLocal = new THREE.Matrix4(),
THREE.CollisionSystem.__v1RayLocal = new THREE.Vector3(),
THREE.CollisionSystem.__v1RayBox = new THREE.Vector3(),
THREE.CollisionSystem.__v2RayBox = new THREE.Vector3();
