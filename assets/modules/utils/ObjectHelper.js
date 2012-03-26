/*
 *
 * ObjectHelper.js
 * Contains utility functionality for basic models.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/utils/ObjectHelper.js",
		_ObjectHelper = {},
		_MathHelper,
		utilVec31Follow,
		utilVec32Follow,
		utilVec31Bounds,
		utilVec32Bounds,
		utilVec31Dimensions,
		utilVec31Axis,
		utilVec31Offset,
		utilVec31OffsetRot,
		utilVec32OffsetRot,
		utilVec33OffsetRot,
		utilVec34OffsetRot,
		utilVec35OffsetRot,
		utilVec36OffsetRot,
		utilVec37OffsetRot,
		utilVec38OffsetRot,
		utilVec39OffsetRot,
		utilVec41OffsetRot,
		utilQ1Follow,
		utilQ2Follow,
		utilQ3Follow,
		utilQ4Follow,
		utilQ1Axis,
		utilQ1CenterRot,
		utilQ2CenterRot,
		utilMat41Follow,
		utilMat41Bounds,
		utilMat41Center,
		utilMat41CenterRot;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	_ObjectHelper.extract_children_from_objects = extract_children_from_objects;
	_ObjectHelper.extract_parents_from_objects = extract_parents_from_objects;
	
	_ObjectHelper.object_apply_matrix = object_apply_matrix;
	_ObjectHelper.object_push_bounds = object_push_bounds;
	
	_ObjectHelper.dimensions = dimensions;
	
	_ObjectHelper.center_offset = center_offset;
	_ObjectHelper.object_center = object_center;
	
	_ObjectHelper.q_to_axis = q_to_axis;
	_ObjectHelper.rotation_offset = rotation_offset;
	_ObjectHelper.object_center_rotation = object_center_rotation;
	
	_ObjectHelper.object_follow_object = object_follow_object;
	
	main.asset_register( assetPath, {
		data: _ObjectHelper,
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
		console.log('internal object helper');
		_MathHelper = mh;
		
		// utility
		
		utilVec31Follow = new THREE.Vector3();
		utilVec32Follow = new THREE.Vector3();
		utilVec31Bounds = new THREE.Vector3();
		utilVec32Bounds = new THREE.Vector3();
		utilVec31Dimensions = new THREE.Vector3();
		utilVec31Axis = new THREE.Vector3();
		utilVec31Offset = new THREE.Vector3();
		utilVec31OffsetRot = new THREE.Vector3();
		utilVec32OffsetRot = new THREE.Vector3();
		utilVec33OffsetRot = new THREE.Vector3();
		utilVec34OffsetRot = new THREE.Vector3();
		utilVec35OffsetRot = new THREE.Vector3();
		utilVec36OffsetRot = new THREE.Vector3();
		utilVec37OffsetRot = new THREE.Vector3();
		utilVec38OffsetRot = new THREE.Vector3();
		utilVec39OffsetRot = new THREE.Vector3();
		utilVec41OffsetRot = new THREE.Vector4();
		utilQ1Follow = new THREE.Quaternion();
		utilQ2Follow = new THREE.Quaternion();
		utilQ3Follow = new THREE.Quaternion();
		utilQ4Follow = new THREE.Quaternion();
		utilQ1Axis = new THREE.Quaternion();
		utilQ1CenterRot = new THREE.Quaternion();
		utilQ2CenterRot = new THREE.Quaternion();
		utilMat41Follow = new THREE.Matrix4();
		utilMat41Bounds = new THREE.Matrix4();
		utilMat41Center = new THREE.Matrix4();
		utilMat41CenterRot = new THREE.Matrix4();
		
	}
	
	/*===================================================
    
    hierarchy support
    
    =====================================================*/
	
	function extract_children_from_objects ( objects, cascade ) {
		
		var i, l,
			object;
		
		objects = main.ensure_array( objects );
		
		for ( i = 0, l = objects.length; i < l; i++ ) {
			
			cascade = extract_child_cascade( objects[ i ], cascade );
			
		}
		
		return cascade;
		
	}
	
	function extract_child_cascade ( object, cascade ) {
		
		var i, l,
			children;
		
		cascade = main.ensure_array( cascade );
			
		if ( typeof object !== 'undefined' ) {
			
			children = object.children;
			
			cascade = cascade.concat( children );
			
			for ( i = 0, l = children.length; i < l; i++ ) {
				
				cascade = extract_child_cascade( children[ i ], cascade );
				
			}
			
		}
		
		return cascade;
		
	}
	
	function extract_parents_from_objects ( objects, cascade ) {
		
		var i, l;
		
		objects = main.ensure_array( objects );
		
		for ( i = 0, l = objects.length; i < l; i++ ) {
			
			cascade = extract_parent_cascade( objects[ i ], cascade );
			
		}
		
		return cascade;
		
	}
	
	function extract_parent_cascade ( object, cascade ) {
		
		var i, l;
		
		cascade = cascade || [];
		
		while( typeof object.parent !== 'undefined' ) {
			
			cascade.push( object.parent );
			
			object = object.parent;
			
		}
		
		return cascade;
		
	}
	
	/*===================================================
    
    apply matrix
    
    =====================================================*/
	
	function object_apply_matrix ( object, matrix ) {
		
		var i, l,
			j, k,
			geometry = object instanceof THREE.Mesh ? object.geometry : object,
			morphTargets = geometry.morphTargets,
			morphTarget,
			vertices,
			vertex;
		
		// apply offset matrix to geometry
		
		geometry.applyMatrix( matrix );
		
		// adjust morph targets
		
		for ( i = 0, l = morphTargets.length; i < l; i++ ) {
			
			morphTarget = morphTargets[ i ];
			
			vertices = morphTarget.vertices;
			
			for ( j = 0, k = vertices.length; j < k; j++ ) {
				
				vertex = vertices[ j ];
				
				matrix.multiplyVector3( vertex.position );
				
			}
			
		}
		
		// force recompute bounds
		
		geometry.computeBoundingSphere();
		
		geometry.computeBoundingBox();
		
		// additional adjustments if object is mesh
		
		if ( object instanceof THREE.Mesh ) {
			
			object.boundRadius = geometry.boundingSphere.radius;
			
		}
		
	}
	
	function dimensions ( object, ignoreScale ) {
		
		var mesh = object instanceof THREE.Mesh ? object : false,
			geometry = mesh ? mesh.geometry : object,
			dimensions = utilVec31Dimensions,
			bbox;
		
		// if needs calculation
		
		if ( typeof geometry.boundingBox !== 'undefined' ) {
			geometry.computeBoundingBox();
		}
		
		bbox = geometry.boundingBox;
		
		if ( bbox ) {
			
			// get original dimensions
			
			dimensions.set( bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y, bbox.max.z - bbox.min.z );
			
			// scale to mesh's scale
			
			if ( ignoreScale !== true && mesh ) {
				
				dimensions.multiplySelf( mesh.scale );
				
			}
			
		}
		else {
			
			dimensions.set( 0, 0, 0 );
			
		}
		
		return dimensions;
		
	}
	
	/*===================================================
    
    bounds
    
    =====================================================*/
	
	function object_push_bounds ( object, bounds ) {
		
		var geometry = object instanceof THREE.Mesh ? object.geometry : object,
			objectWorldMatrix = object instanceof THREE.Mesh ? object.matrixWorld : utilMat41Bounds,
			objectBounds,
			objectMin = utilVec31Bounds,
			objectMax = utilVec32Bounds,
			min = bounds.min,
			max = bounds.max;
		
		if ( !geometry.boundingBox ) {
			
			geometry.computeBoundingBox();
			
		}
		
		objectBounds = geometry.boundingBox;
		objectMin.copy( objectBounds.min );
		objectMax.copy( objectBounds.max );
		
		objectWorldMatrix.multiplyVector3( objectMin );
		objectWorldMatrix.multiplyVector3( objectMax );
		
		if ( objectMin.x < min.x ) {
			
			min.x = objectMin.x;
			
		}
		
		if ( objectMax.x > max.x ) {
			
			max.x = objectMax.x;
			
		}
		
		if ( objectMin.y < min.y ) {
			
			min.y = objectMin.y;
			
		}
		
		if ( objectMax.y > max.y ) {
			
			max.y = objectMax.y;
			
		}
		
		if ( objectMin.z < min.z ) {
			
			min.z = objectMin.z;
			
		}
		
		if ( objectMax.z > max.z ) {
			
			max.z = objectMax.z;
			
		}
		
		return bounds;
		
	}
	
	/*===================================================
    
    center offset
    
    =====================================================*/
	
	function center_offset ( object ) {
		
		var geometry = object instanceof THREE.Mesh ? object.geometry : object,
			offset = utilVec31Offset,
			bbox;
		
		if ( !geometry.boundingBox ) {
			
			geometry.computeBoundingBox();
			
		}
		
		bbox = geometry.boundingBox;
		
		offset.add( bbox.min, bbox.max ).multiplyScalar( -0.5 );
		
		return offset;
		
	}
	
	function object_center ( object ) {
		
		var offset = center_offset( object ),
			offsetMat4 = utilMat41Center.setTranslation( offset.x, offset.y, offset.z );
		
		// apply offset
		
		object_apply_matrix( object, offsetMat4 );
		
		// additional adjustments if object is mesh
		
		if ( object instanceof THREE.Mesh ) {
			
			// adjust position
			
			object.position.subSelf( offset );
			
		}
		
		return offset;
		
	}
	
	/*===================================================
    
    rotation offset
    
    =====================================================*/
	
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
			
			qToA.setFromAxisAngle( axis, angle );
			
		}
		else {
			
			qToA.set( 0, 0, 0, 1 );
			
		}
		
		return qToA;
		
	}
	
	function rotation_offset ( object, axisUp, axisForward ) {
		
		var i, l,
			geometry = object instanceof THREE.Mesh ? object.geometry : object,
			faces = geometry.faces,
			vertices = geometry.vertices,
			face,
			vpa, vpb, vpc, vpd,
			nvpa = utilVec31OffsetRot,
			nvpb = utilVec32OffsetRot,
			nvpc = utilVec33OffsetRot,
			nvpd = utilVec34OffsetRot,
			len = Math.sqrt( 1 / 2 ),
			expectedPosA = utilVec35OffsetRot.set( len, -len, 0 ), // ( -len, len, 0 )
			expectedPosB = utilVec36OffsetRot.set( len, len, 0 ), // ( -len, -len, 0 )
			expectedPosC = utilVec37OffsetRot.set( -len, len, 0 ), // ( len, -len, 0 )
			expectedPosD = utilVec38OffsetRot.set( -len, -len, 0 ), // ( len, len, 0 )
			v4VEAvg = utilVec41OffsetRot.set( 0, 0, 0, 0 ),
			normalAvg = utilVec39OffsetRot.set( 0, 0, 0 ),
			ca = shared.cardinalAxes,
			offset;
		
		// for all face normals
		
		for ( i = 0, l = faces.length; i < l; i++ ) {
			
			face = faces[ i ];
			
			normalAvg.addSelf( face.normal );
			
			vpa = vertices[ face.a ].position;
			vpb = vertices[ face.b ].position;
			vpc = vertices[ face.c ].position;
			
			nvpa.copy( vpa ).normalize();
			nvpb.copy( vpb ).normalize();
			nvpc.copy( vpc ).normalize();
			
			v4VEAvg.addSelf( q_to_axis( nvpa, expectedPosA ) );
			v4VEAvg.addSelf( q_to_axis( nvpb, expectedPosB ) );
			v4VEAvg.addSelf( q_to_axis( nvpc, expectedPosC ) );
			
			if ( face instanceof THREE.Face4 ) {
				
				vpd = vertices[ face.d ].position;
				
				nvpd.copy( vpd ).normalize();
				v4VEAvg.addSelf( q_to_axis( nvpd, expectedPosD ) );
				
			}
			
		}
		
		// find averages
		
		normalAvg.normalize();
		
		v4VEAvg.normalize();
		
		// handle axes
		// use physics axis if available, or default to global up
		
		axisUp = axisUp || ( ( typeof object.physics !== 'undefined' ) ? object.physics.axes.up : ca.up );
		axisForward = axisForward || ( ( typeof object.physics !== 'undefined' ) ? object.physics.axes.forward : ca.forward );
			
		// find quaternion to go from average of normals to current axis up 
		
		offset = q_to_axis( axisUp, normalAvg, axisForward );
		
		// rotate offset to re-orient faces as square (not diamond)
		// TODO: seems to tilt slightly off the more this rotates
		offset.multiplySelf( v4VEAvg );
		/*
		var vectors = _MathHelper.get_orthonormal_vectors( normalAvg.clone() ),
			xlg = new THREE.Geometry(),
			ylg = new THREE.Geometry(),
			zlg = new THREE.Geometry(),
			xline,
			yline,
			zline;
		
		offset.multiplyVector3( vectors.v1 );
		offset.multiplyVector3( vectors.v2 );
		offset.multiplyVector3( vectors.v3 );
		
		xlg.vertices.push( new THREE.Vertex( new THREE.Vector3() ) );
		xlg.vertices.push( new THREE.Vertex( vectors.v3.multiplyScalar( 100 ) ) );
		
		ylg.vertices.push( new THREE.Vertex( new THREE.Vector3() ) );
		ylg.vertices.push( new THREE.Vertex( vectors.v1.multiplyScalar( 100 ) ) );
		
		zlg.vertices.push( new THREE.Vertex( new THREE.Vector3() ) );
		zlg.vertices.push( new THREE.Vertex( vectors.v2.multiplyScalar( 100 ) ) );
		
		xline = new THREE.Line( xlg, new THREE.LineBasicMaterial( { color: 0xFF0000, linewidth: 8 } ), THREE.LinePieces ),
		yline = new THREE.Line( ylg, new THREE.LineBasicMaterial( { color: 0x00FF00, linewidth: 8 } ), THREE.LinePieces ),
		zline = new THREE.Line( zlg, new THREE.LineBasicMaterial( { color: 0x0000FF, linewidth: 8 } ), THREE.LinePieces );
		
		object.add( xline );
		object.add( yline );
		object.add( zline );
		*/
		return offset;
		
	}
	
	function object_center_rotation ( object ) {
		
		var offset = rotation_offset( object ),
			offsetMat4 = utilMat41CenterRot.setRotationFromQuaternion( offset ),
			objectMatQ = utilQ1CenterRot;
			objectNewQ = utilQ2CenterRot;
		
		// apply offset to object
		
		object_apply_matrix( object, offsetMat4 );
		
		// additional adjustments if object is mesh
		
		if ( object instanceof THREE.Mesh ) {
			
			if ( object.useQuaternion === true ) {
				
				// quaternion rotations
				
				objectNewQ.multiply( offset.inverse(), object.quaternion );
				
				object.quaternion.copy( objectNewQ );
			
			}
			else {
				
				// matrix rotations
				
				objectMatQ.setFromRotationMatrix( object.matrix );
				
				objectNewQ.multiply( offset.inverse(), objectMatQ );
				
				object.matrix.setRotationFromQuaternion( objectNewQ );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    follow
    
    =====================================================*/
	
	function object_follow_object ( follower, leader, rotationBase, rotationOffset, positionOffset ) {
		
		var leaderScale = leader.scale,
			leaderScaleMax = Math.max( leaderScale.x, leaderScale.y, leaderScale.z ),
			leaderMatrixWorld = leader.matrixWorld,
			leaderQWorld = utilQ1Follow.setFromRotationMatrix( leaderMatrixWorld ),
			leaderPWorld = utilVec31Follow.copy( leaderMatrixWorld.getPosition() ),
			followerP = follower.position,
			followerQ = follower.quaternion,
			followerBaseRot = utilQ2Follow,
			followerOffsetRot = utilQ3Follow,
			followerOffsetPos = utilVec32Follow,
			parentInverseMatrix = utilMat41Follow,
			parentInverseQ = utilQ4Follow,
			skipBaseRot,
			skipOffsetRot,
			skipOffsetPos;
		
		// follower base rotation
		
		if ( rotationBase instanceof THREE.Quaternion ) {
			
			followerBaseRot.copy( rotationBase );
			
		}
		else if ( rotationBase instanceof THREE.Vector3 ) {
			
			followerBaseRot.setFromEuler( rotationBase ).normalize();
			
		}
		else {
			
			followerBaseRot.set( 0, 0, 0, 1 );
			
			skipBaseRot = true;
			
		}
		
		// follower offset rotation
		
		if ( rotationOffset instanceof THREE.Quaternion ) {
			
			followerOffsetRot.copy( rotationOffset );
			
		}
		else if ( rotationOffset instanceof THREE.Vector3 ) {
			
			followerOffsetRot.setFromEuler( rotationOffset ).normalize();
			
		}
		else {
			
			followerOffsetRot.set( 0, 0, 0, 1 );
			
			skipOffsetRot = true;
			
		}
		
		// follower offset position
		
		if ( positionOffset instanceof THREE.Vector3 ) {
		
			followerOffsetPos.set( positionOffset.x, positionOffset.y, positionOffset.z ).multiplyScalar( leaderScaleMax );
			
		}
		else {
			
			skipOffsetPos = true;
			
		}
		
		// modify offset position
		
		if ( skipOffsetPos !== true ) {
			
			if ( skipBaseRot !== true ) {
				
				followerBaseRot.multiplyVector3( followerOffsetPos );
				
			}
			
			if ( skipOffsetRot !== true ) {
				
				followerOffsetRot.multiplyVector3( followerOffsetPos );
				
			}
			
			if ( follower.parent !== leader ) {
				
				leaderQWorld.multiplyVector3( followerOffsetPos );
				
			}
			
		}
		
		// if parents are not the same
		
		if ( follower.parent instanceof THREE.Object3D && follower.parent !== leader && follower.parent !== leader.parent ) {
			
			// get inverse position and rotation
			
			parentInverseMatrix.getInverse( follower.parent.matrixWorld );
			parentInverseQ.setFromRotationMatrix( parentInverseMatrix );
			
			// modify offset position and leader world position
			// to account for follower being affected by parent matrix
			
			if ( skipOffsetPos !== true ) {
				
				parentInverseQ.multiplyVector3( followerOffsetPos );
				
			}
			
			parentInverseQ.multiplyVector3( leaderPWorld );
			
			// copy inverse as base
			
			followerP.copy( parentInverseMatrix.getPosition() );
			followerQ.copy( parentInverseQ );
			
		}
		// reset pos / rot
		else {
			
			followerP.set( 0, 0, 0 );
			followerQ.set( 0, 0, 0, 1 );
			
		}
		
		// position
		
		if ( follower.parent !== leader ) {
			
			followerP.addSelf( leaderPWorld );
			
		}
		
		if ( skipOffsetPos !== true ) {
			
			followerP.addSelf( followerOffsetPos );
			
		}
		
		// rotation
		
		if ( follower.parent !== leader ) {
			
			followerQ.multiplySelf( leaderQWorld );
			
		}
		
		if ( skipOffsetRot !== true ) {
			
			followerQ.multiplySelf( followerOffsetRot );
			
		}
		
		if ( skipBaseRot !== true ) {
			
			followerQ.multiplySelf( followerBaseRot );
			
		}
		
	}
    
} ( KAIOPUA ) );