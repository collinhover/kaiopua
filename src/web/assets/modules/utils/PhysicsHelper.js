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
		assetPath = "assets/modules/utils/PhysicsHelper.js",
		_PhysicsHelper = {},
		_VectorHelper,
		_RayHelper,
		utilVec31Pull,
		utilVec32Pull,
		utilVec33Pull,
		utilVec31RotateToSrc,
		utilVec32RotateToSrc,
		utilVec31SourceBase,
		utilQ1RotateToSrc,
		utilQ2RotateToSrc,
		utilQ3RotateToSrc;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _PhysicsHelper,
		requirements: [
			"assets/modules/utils/VectorHelper.js",
			"assets/modules/utils/RayHelper.js"
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
		utilVec31SourceBase = new THREE.Vector3();
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
	
	function rotate_relative_to_source ( object, source, axisAway, axisForward, lerpDelta, rigidBody ) {
		
		var ca = shared.cardinalAxes,
			position,
			rotation,
			axisAwayNew = utilVec31RotateToSrc,
			axisAwayToAwayNewDist,
			angleToNew,
			axisToNew = utilVec32RotateToSrc,
			rotationTarget = utilQ1RotateToSrc,
			rotationTargetForMatrix = utilQ2RotateToSrc,
			qToNew = utilQ3RotateToSrc,
			axes;
			
		// localize basics
		
		position = object.position;
		
		rotation = ( object.useQuaternion === true ? object.quaternion : object.matrix );
		
		// if source is 3D object, cascade
		if ( source instanceof THREE.Object3D ) {
			
			source = source.position;
		
		}
		
		// default to 0, 0, 0
		
		if ( source instanceof THREE.Vector3 !== true ) {
			
			source = utilVec31SourceBase;
			
		}
		
		lerpDelta = lerpDelta || 1;
		
		axisAwayNew.sub( position, source ).normalize();
		
		// quaternion between axes
		
		qToNew = _VectorHelper.q_to_axis( axisAwayNew, axisAway, axisForward );
		
		if ( qToNew instanceof THREE.Quaternion ) {
			
			// apply as quaternion or matrix
			
			if ( object.useQuaternion === true ) {
				
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
			
			if ( typeof rigidBody !== 'undefined' ) {
				
				/*
				quaternion = rigidBody.quaternion;
				
				rotationTarget.multiply( qToNew, quaternion );
				
				_VectorHelper.lerp_normalized( quaternion, rotationTarget, lerpDelta );
				*/
				// find new axes based on new rotation
				
				axes = rigidBody.axes;
				
				rotation.multiplyVector3( axes.up.copy( ca.up ) );
				
				rotation.multiplyVector3( axes.forward.copy( ca.forward ) );
				
				rotation.multiplyVector3( axes.right.copy( ca.right ) );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    pull
    
    =====================================================*/
	
	function pull_to_source ( mesh, source, objectsToIntersect, distanceFrom, velocity, rigidBody ) {
		
		var i, l,
			position,
			difference = utilVec31Pull,
			direction = utilVec32Pull,
			shift = utilVec33Pull,
			object,
			rigidBody,
			colliders = [],
			intersection,
			intersectionDistance;
		
		// handle parameters
		
		position = mesh.position;
		
		// if source is 3D object, cascade
		if ( source instanceof THREE.Object3D ) {
			
			source = source.position;
		
		}
		
		// default to 0, 0, 0
		
		if ( source instanceof THREE.Vector3 !== true ) {
			
			source = utilVec31SourceBase;
			
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
				else if ( typeof object.physics !== 'undefined' ) {
					
					colliders.push( object.physics.rigidBody.collider );
					
				}
				
			}
			
		}
		// else gather all colliders from links
		else {
			
			for ( i = 0, l = links.length; i < l; i++ ) {
				
				colliders.push( link[ i ].rigidBody.collider );
				
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
		
	}
	
} (KAIOPUA) );