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
		utilVec31Follow,
		utilVec32Follow,
		utilVec31Offset,
		utilQ1Follow,
		utilQ2Follow,
		utilQ3Follow,
		utilMat41Follow,
		utilMat42Center;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	_ObjectHelper.extract_children_from_objects = extract_children_from_objects;
	_ObjectHelper.extract_parents_from_objects = extract_parents_from_objects;
	
	_ObjectHelper.center_offset = center_offset;
	_ObjectHelper.object_center = object_center;
	
	_ObjectHelper.object_follow_object = object_follow_object;
	
	main.asset_register( assetPath, { data: _ObjectHelper } );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	init_internal();
	
	function init_internal () {
		console.log('internal object helper');
		// utility
		
		utilVec31Follow = new THREE.Vector3();
		utilVec32Follow = new THREE.Vector3();
		utilVec31Offset = new THREE.Vector3();
		utilQ1Follow = new THREE.Quaternion();
		utilQ2Follow = new THREE.Quaternion();
		utilQ3Follow = new THREE.Quaternion();
		utilMat41Follow = new THREE.Matrix4();
		utilMat42Center = new THREE.Matrix4();
		
	}
	
	/*===================================================
    
    hierarchy support
    
    =====================================================*/
	
	function extract_children_from_objects ( objects, cascade ) {
		
		var i, l;
		
		objects = main.ensure_array( objects );
		
		for ( i = 0, l = objects.length; i < l; i++ ) {
			
			cascade = extract_child_cascade( objects[ i ], cascade );
			
		}
		
		return cascade;
		
	}
	
	function extract_child_cascade ( object, cascade ) {
		
		var i, l,
			children = object.children;
		
		cascade = ( cascade || [] ).concat( children );
		
		for ( i = 0, l = children.length; i < l; i++ ) {
			
			cascade = extract_child_cascade( children[ i ], cascade );
			
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
    
    center
    
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
		
		var i, l,
			j, k,
			geometry = object instanceof THREE.Mesh ? object.geometry : object,
			morphTargets = geometry.morphTargets,
			morphTarget,
			vertices,
			vertex,
			offset = center_offset( geometry ),
			offsetMat4 = utilMat42Center.setTranslation( offset.x, offset.y, offset.z );
		
		// apply offset matrix to geometry
		
		geometry.applyMatrix( offsetMat4 );
		
		// adjust morph targets
		
		for ( i = 0, l = morphTargets.length; i < l; i++ ) {
			
			morphTarget = morphTargets[ i ];
			
			vertices = morphTarget.vertices;
			
			for ( j = 0, k = vertices.length; j < k; j++ ) {
				
				vertex = vertices[ j ];
				
				offsetMat4.multiplyVector3( vertex.position );
				
			}
			
		}
		
		// force recompute bounds
		
		geometry.computeBoundingSphere();
		
		geometry.computeBoundingBox();
		
		// additional adjustments if object is mesh
		
		if ( object instanceof THREE.Mesh ) {
			
			object.boundRadius = geometry.boundingSphere.radius;
			
			// adjust position
			
			object.position.subSelf( offset );
			
		}
		
		return offset;
		
	}
	
	/*===================================================
    
    follow
    
    =====================================================*/
	
	function object_follow_object ( leader, follower, rotationBase, rotationOffset, positionOffset ) {
		
		var leaderScale = leader.scale,
			leaderScaleMax = Math.max( leaderScale.x, leaderScale.y, leaderScale.z ),
			leaderMatrixWorld = leader.matrixWorld,
			leaderQWorld = utilQ3Follow.setFromRotationMatrix( leaderMatrixWorld ),
			leaderPWorld = utilVec32Follow.copy( leaderMatrixWorld.getPosition() ),
			followerP = follower.position,
			followerQ = follower.quaternion,
			followerOffsetPos = utilVec31Follow,
			followerOffsetRot = utilQ1Follow,
			parentInverseMatrix = utilMat41Follow,
			parentInverseQ = utilQ2Follow;
		
		// set offset base position
		
		followerOffsetPos.set( positionOffset.x, positionOffset.y, positionOffset.z ).multiplyScalar( leaderScaleMax );
		
		// set offset rotation
		
		followerOffsetRot.setFromEuler( rotationOffset ).normalize();
		
		// modify offset position
		
		rotationBase.multiplyVector3( followerOffsetPos );
		
		followerOffsetRot.multiplyVector3( followerOffsetPos );
		
		leaderQWorld.multiplyVector3( followerOffsetPos );
		
		// if parents are not the same
		
		if ( follower.parent instanceof THREE.Object3D && follower.parent !== leader.parent ) {
			
			// get inverse position and rotation
			
			parentInverseMatrix.getInverse( follower.parent.matrixWorld );
			parentInverseQ.setFromRotationMatrix( parentInverseMatrix );
			
			// modify offset position and leader world position
			// to account for follower being affected by parent matrix
			
			parentInverseQ.multiplyVector3( followerOffsetPos );
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
		
		followerP.addSelf( leaderPWorld ).addSelf( followerOffsetPos );
		
		// rotation
		
		followerQ.multiplySelf( leaderQWorld ).multiplySelf( followerOffsetRot ).multiplySelf( rotationBase );
		
	}
    
} ( KAIOPUA ) );