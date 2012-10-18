/*
 *
 * PhysicsHelper.js
 * Contains utility functionality for physics.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/utils/PhysicsHelper.js",
		_PhysicsHelper = {},
		_VectorHelper,
		_RayHelper,
		utilVec31Pull,
		utilVec32Pull,
		utilVec33Pull,
		utilVec31RotateToSrc,
		utilVec32RotateToSrc,
		utilQ1RotateToSrc,
		utilQ2RotateToSrc,
		utilQ3RotateToSrc;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _PhysicsHelper,
		requirements: [
			"js/kaiopua/utils/VectorHelper.js",
			"js/kaiopua/utils/RayHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( vh, rh ) {
		console.log('internal physics helper', _PhysicsHelper);
		_VectorHelper = vh;
		_RayHelper = rh;
		
		// utility
		
		utilVec31Pull = new THREE.Vector3();
		utilVec32Pull = new THREE.Vector3();
		utilVec33Pull = new THREE.Vector3();
		utilVec31RotateToSrc = new THREE.Vector3();
		utilVec32RotateToSrc = new THREE.Vector3();
		utilQ1RotateToSrc = new THREE.Quaternion();
		utilQ2RotateToSrc = new THREE.Quaternion();
		utilQ3RotateToSrc = new THREE.Quaternion();
		
		// functions
		
		_PhysicsHelper.rotate_relative_to_source = rotate_relative_to_source;
		_PhysicsHelper.pull_to_source = pull_to_source;
		
	}
	
	/*===================================================
    
    rotate
    
    =====================================================*/
	
	/*===================================================
    
    rotate
    
    =====================================================*/
	
	function rotate_relative_to_source ( rotation, position, source, axisAway, axisForward, lerpDelta, updateRigidBody ) {
		
		var ca = shared.cardinalAxes,
			axisAwayNew = utilVec31RotateToSrc,
			axisAwayToAwayNewDist,
			angleToNew,
			axisToNew = utilVec32RotateToSrc,
			rotationTarget = utilQ1RotateToSrc,
			rotationTargetForMatrix = utilQ2RotateToSrc,
			qToNew = utilQ3RotateToSrc,
			axes;
		
		// if source is 3D object, cascade
		if ( source instanceof THREE.Object3D ) {
			
			source = source.position;
		
		}
		
		// default to universe gravity source
		
		if ( source instanceof THREE.Vector3 !== true ) {
			
			source = shared.universeGravitySource;
			
		}
		
		lerpDelta = main.is_number( lerpDelta ) ? lerpDelta : 1;
		
		axisAwayNew.sub( position, source ).normalize();
		
		// quaternion between axes
		
		qToNew = _VectorHelper.q_to_axis( axisAway, axisAwayNew, axisForward );
		
		if ( qToNew instanceof THREE.Quaternion ) {
			
			// apply as quaternion or matrix
			
			if ( rotation instanceof THREE.Quaternion ) {
				
				// quaternion rotations
				
				rotationTarget.multiply( qToNew, rotation );
				
				// normalized lerp to new rotation
				
				_VectorHelper.lerp_normalized( rotation, rotationTarget, lerpDelta );
				
			}
			else {
				
				// matrix rotations
				
				rotationTarget.setFromRotationMatrix( rotation );
				
				rotationTargetForMatrix.multiply( qToNew, rotationTarget );
				
				// normalized lerp to new rotation
				
				_VectorHelper.lerp_normalized( rotationTarget, rotationTargetForMatrix, lerpDelta );
				
				rotation.setRotationFromQuaternion( rotationTarget );
				
			}
			
			// update rigid body
			
			if ( updateRigidBody === true ) {
				
				qToNew.multiplyVector3( axisAway );
				
				if ( axisForward instanceof THREE.Vector3 ) {
					
					qToNew.multiplyVector3( axisForward );
					
				}
				
			}
			else if ( typeof updateRigidBody !== 'undefined' ) {
				
				// find new axes based on new rotation
				
				axes = updateRigidBody.axes;
				
				rotation.multiplyVector3( axes.up.copy( ca.up ) );
				rotation.multiplyVector3( axes.forward.copy( ca.forward ) );
				rotation.multiplyVector3( axes.right.copy( ca.right ) );
				
			}
			
		}
		
		return qToNew;
		
	}
	
	/*===================================================
    
    pull
    
    =====================================================*/
	
	function pull_to_source ( mesh, source, objectsToIntersect, distanceFrom/*, velocity, rigidBody */ ) {
		
		var i, l,
			position,
			difference = utilVec31Pull,
			direction = utilVec32Pull,
			shift = utilVec33Pull,
			object,
			colliders = [],
			intersection,
			intersectionDistance;
		
		// handle parameters
		
		position = mesh.position;
		
		// if source is 3D object, cascade
		if ( source instanceof THREE.Object3D ) {
			
			source = source.position;
		
		}
		
		// default to universe gravity source
		
		if ( source instanceof THREE.Vector3 !== true ) {
			
			source = shared.universeGravitySource;
			
		}
		
		// get normalized vector from position to source
		
		difference.sub( source, position );
		
		direction.copy( difference ).normalize();
		
		// if objects to intersect was passed, extract colliders from objects
		
		if ( main.is_array( objectsToIntersect ) ) {
			
			for ( i = 0, l = objectsToIntersect.length; i < l; i++ ) {
				
				object = objectsToIntersect[ i ];
				
				if( object instanceof _RayHelper.Collider ) {
					
					colliders.push( object );
					
				}
				else if ( typeof object.collider !== 'undefined' ) {
					
					colliders.push( object.collider );
					
				}
				else if ( typeof object.rigidBody !== 'undefined' ) {
					
					colliders.push( object.rigidBody.collider );
					
				}
				
			}
			
		}
		
		// cast ray from mesh to source
		
		intersection = _RayHelper.raycast( {
			origin: position,
			direction: direction,
			colliders: colliders
		} );
		
		// if intersection found
		
		if ( typeof intersection !== 'undefined' ) {
			
			// get distance
			
			intersectionDistance = intersection.distance;
			
		}
		else {
			
			intersectionDistance = difference.length();
			
		}
		
		// if distance from needed
		
		if ( main.is_number( distanceFrom ) ) {
			
			intersectionDistance -= distanceFrom;
			
		}
		
		// multiply direction by distance
			
		shift.copy( direction ).multiplyScalar( intersectionDistance );
		
		// add shift to position
		
		position.addSelf( shift );
		
		return shift;
		
	}
	
} (KAIOPUA) );