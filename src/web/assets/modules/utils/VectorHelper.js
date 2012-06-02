/*
 *
 * VectorHelper.js
 * Contains utility functionality for basic hierarchy support.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/utils/VectorHelper.js",
		_VectorHelper = {},
		_MathHelper,
		utilVec31Axis,
		utilQ1Axis;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _VectorHelper,
		requirements: [
			"assets/modules/utils/MathHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( mh ) {
		console.log('internal vector helper', _VectorHelper);
		_MathHelper = mh;
		
		// utility
		
		utilVec31Axis = new THREE.Vector3();
		utilQ1Axis = new THREE.Quaternion();
		
		// functions
		
		_VectorHelper.rotate_vector3_relative_to = rotate_vector3_relative_to;
		_VectorHelper.rotate_vector3_to_mesh_rotation = rotate_vector3_to_mesh_rotation;
		_VectorHelper.q_to_axis = q_to_axis;
		_VectorHelper.get_orthonormal_vectors = get_orthonormal_vectors;
		_VectorHelper.get_rotation_to_normal = get_rotation_to_normal;
		_VectorHelper.lerp = lerp;
		_VectorHelper.lerp_normalized = lerp_normalized;
		_VectorHelper.lerp_snap = lerp_snap;
		
	}
	
	/*===================================================
    
    rotation
    
    =====================================================*/
	
	function rotate_vector3_to_mesh_rotation ( mesh, vec3, rotatedVec3 ) {
		
		var rotation;
		
		if ( mesh.useQuaternion === true ) {
			
			rotation = mesh.quaternion;
			
		}
		else {
			
			rotation = mesh.matrix;
			
		}
		
		return rotate_vector3_relative_to( rotation, vec3, rotatedVec3 );
		
	}
	
	function rotate_vector3_relative_to ( rotation, vec3, rotatedVec3 ) {
		
		if ( rotatedVec3 instanceof THREE.Vector3 ) {
			rotatedVec3.copy( vec3 );
		}
		else {
			rotatedVec3 = vec3.clone();
		}
		
		if ( rotation instanceof THREE.Quaternion || rotation instanceof THREE.Matrix4 ) {
			
			rotation.multiplyVector3( rotatedVec3 );
			
		}
		else if ( rotation instanceof THREE.Vector3 ) {
			
			rotatedVec3.x = rotation.x * vec3.x + rotation.x * vec3.y + rotation.x * vec3.z;
			rotatedVec3.y = rotation.y * vec3.x + rotation.y * vec3.y + rotation.y * vec3.z;
			rotatedVec3.z = rotation.z * vec3.x + rotation.z * vec3.y + rotation.z * vec3.z;
			
		}
		else if ( rotation instanceof THREE.Object3D ) {
			
			rotatedVec3 = rotate_vector3_to_mesh_rotation( rotation, vec3, rotatedVec3 );
			
		}
		
		return rotatedVec3;
		
	}
	
	function q_to_axis ( axisTo, axisFrom, axisFromRightAngle ) {
		
		var ca = shared.cardinalAxes,
			dist,
			axis = utilVec31Axis,
			angle,
			qToA = utilQ1Axis;
		
		// current axes
		
		axisFrom = axisFrom || ca.up;
		
		axisFromRightAngle = axisFromRightAngle || ca.forward;
		
		// find dist between current axis up and average of normals
		
		dist = _MathHelper.clamp( axisFrom.dot( axisTo ), -1, 1 );
		
		// if up axes are not same
		
		if ( dist !== 1 ) {
			
			// axis / angle
			
			angle = Math.acos( dist );
			axis.cross( axisFrom, axisTo ).normalize();
			
			// if new axis is exactly opposite of current
			// replace new axis with the forward axis
			
			if ( axis.length() === 0 ) {
				
				axis.copy( axisFromRightAngle );
				
			}
			
			// rotation change
			
			return qToA.setFromAxisAngle( axis, angle );
			
		}
		else {
			
			return false;
			
		}
		
	}
	
	/*===================================================
    
    orthonormals
    
    =====================================================*/
	
	function get_orthonormal_vectors ( v1 ) {
		
		// returns 2 orthographic ( perpendicular ) vectors to the first
		
		var i,
			min = 0,
			minAxis,
			v1absx = Math.abs( v1.x ),
			v1absy = Math.abs( v1.y ),
			v1absz = Math.abs( v1.z ),
			v2 = new THREE.Vector3(),
			v3 = new THREE.Vector3();
		
		// use Gram-Schmidt orthogonalisation to find first perpendicular vector
		
		min = Math.min( v1absx, v1absy, v1absz );
		
		// min is x
		if ( min === v1absx ) {
			
			minAxis = 'x';
			
		}
		// min is y
		else if ( min === v1absy ) {
			
			minAxis = 'y';
			
		}
		// min is z
		else {
			
			minAxis = 'z';
			
		}
		
		v2[ minAxis ] = 1;
		v2.x -= v1[ minAxis ] * v1.x;
		v2.y -= v1[ minAxis ] * v1.y;
		v2.z -= v1[ minAxis ] * v1.z;
		
		v3.cross( v1, v2 );
		
		return { v1: v1, v2: v2, v3: v3 };
		
	}
	
	function get_rotation_to_normal ( normal, normalAxis ) {
		
		// returns a 4x4 matrix that defines a rotation to a normal
		
		var vectors = get_orthonormal_vectors( normal ),
			v1 = vectors.v1,
			v2 = vectors.v2,
			v3 = vectors.v3,
			matrix;
		
		// normal on the x axis
		if ( normalAxis === 'x' ) {
			
			matrix = new THREE.Matrix4(
				v1.x, v2.x, v3.x, 0,
				v1.y, v2.y, v3.y, 0,
				v1.z, v2.z, v3.z, 0,
				0, 0, 0, 1
			);
			
		}
		// normal on the z axis
		else if ( normalAxis === 'z' ) {
			
			matrix = new THREE.Matrix4(
				v2.x, v3.x, v1.x, 0,
				v2.y, v3.y, v1.y, 0,
				v2.z, v3.z, v1.z, 0,
				0, 0, 0, 1
			);
			
		}
		// normal is on the y axis
		else {
			
			matrix = new THREE.Matrix4(
				v2.x, v1.x, v3.x, 0,
				v2.y, v1.y, v3.y, 0,
				v2.z, v1.z, v3.z, 0,
				0, 0, 0, 1
			);
			
		}
		
		return matrix;
		
	}
	
	/*===================================================
    
    lerp
    
    =====================================================*/
	
	function lerp ( from, to, alpha ) {
		
		from.x += ( to.x - from.x ) * alpha;
		from.y += ( to.y - from.y ) * alpha;
		from.z += ( to.z - from.z ) * alpha;
		
		if ( from.hasOwnProperty( 'w' ) ) {
			
			from.w += ( to.w - from.w ) * alpha;
			
		}
		
		return from;
		
	}
	
	function lerp_normalized ( from, to, alpha ) {
		
		return lerp( from, to, alpha ).normalize();
		
	}
	
	function lerp_snap ( from, to, alpha, threshold ) {
		
		if ( from.equals( to ) !== true ) {
			
			lerp( from, to, alpha );
			
			if ( from.distanceTo( to ) < threshold ) {
				
				from.copy( to );
				
			}
			
		}
		
		return from;
		
	}
	
} (KAIOPUA) );