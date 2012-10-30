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
		assetPath = "js/kaiopua/utils/ObjectHelper.js",
		_ObjectHelper = {},
		_MathHelper,
		_SceneHelper,
		_VectorHelper,
		_RayHelper,
		utilVec31Follow,
		utilVec32Follow,
		utilVec31Orbit,
		utilVec32Orbit,
		utilVec31Bounds,
		utilVec32Bounds,
		utilVec31FaceBounds,
		utilVec31Dimensions,
		utilVec31Offset,
		utilVec31OffsetRot,
		utilVec31NormalizeFaces,
		utilVec32NormalizeFaces,
		utilVec33NormalizeFaces,
		utilVec34NormalizeFaces,
		utilVec35NormalizeFaces,
		utilVec36NormalizeFaces,
		utilVec41NormalizeFaces,
		utilQ1Follow,
		utilQ2Follow,
		utilQ3Follow,
		utilQ4Follow,
		utilQ1Orbit,
		utilQ2Orbit,
		utilQ1ApplyQ,
		utilQ2ApplyQ,
		utilQ1NormalizeFaces,
		utilMat41Follow,
		utilMat41Bounds,
		utilMat41Center,
		utilMat41ApplyQ;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, {
		data: _ObjectHelper,
		requirements: [
			"js/kaiopua/utils/MathHelper.js",
			"js/kaiopua/utils/SceneHelper.js",
			"js/kaiopua/utils/VectorHelper.js",
			"js/kaiopua/utils/RayHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( mh, sh, vh, rh ) {
		console.log('internal object helper', _ObjectHelper);
		var len = Math.sqrt( 1 / 2 ),
			ca = shared.cardinalAxes,
			right = ca.right,
			forward = ca.forward;
		
		// helpers
		
		_MathHelper = mh;
		_SceneHelper = sh;
		_VectorHelper = vh;
		_RayHelper = rh;
		
		// utility
		
		utilVec31Follow = new THREE.Vector3();
		utilVec32Follow = new THREE.Vector3();
		utilVec31Orbit = new THREE.Vector3();
		utilVec32Orbit = new THREE.Vector3();
		utilVec31Bounds = new THREE.Vector3();
		utilVec32Bounds = new THREE.Vector3();
		utilVec31FaceBounds = new THREE.Vector3();
		utilVec31Dimensions = new THREE.Vector3();
		utilVec31Offset = new THREE.Vector3();
		utilVec31OffsetRot = new THREE.Vector3();
		utilVec31NormalizeFaces = new THREE.Vector3();
		utilVec32NormalizeFaces = new THREE.Vector3();
		utilVec33NormalizeFaces = new THREE.Vector3();
		utilVec34NormalizeFaces = new THREE.Vector3();
		utilVec35NormalizeFaces = new THREE.Vector3();
		utilVec36NormalizeFaces = new THREE.Vector3();
		utilQ1ApplyQ = new THREE.Quaternion();
		utilQ2ApplyQ = new THREE.Quaternion();
		utilQ1NormalizeFaces = new THREE.Quaternion();
		utilQ1Follow = new THREE.Quaternion();
		utilQ2Follow = new THREE.Quaternion();
		utilQ3Follow = new THREE.Quaternion();
		utilQ4Follow = new THREE.Quaternion();
		utilQ1Orbit = new THREE.Quaternion();
		utilQ2Orbit = new THREE.Quaternion();
		utilMat41Follow = new THREE.Matrix4();
		utilMat41Bounds = new THREE.Matrix4();
		utilMat41Center = new THREE.Matrix4();
		utilMat41ApplyQ = new THREE.Matrix4();
		
		// properties
		
		_ObjectHelper.vertexExpectedA = new THREE.Vector3( right.x * -len, 0, forward.z * len ),//( right.x * len, 0, forward.z * -len ),
		_ObjectHelper.vertexExpectedB = new THREE.Vector3( right.x * -len, 0, forward.z * -len ),//( right.x * len, 0, forward.z * len ),
		_ObjectHelper.vertexExpectedC = new THREE.Vector3( right.x * len, 0, forward.z * -len ),//( right.x * -len, 0, forward.z * len ),
		_ObjectHelper.vertexExpectedD = new THREE.Vector3( right.x * len, 0, forward.z * len );//( right.x * -len, 0, forward.z * -len );
		_ObjectHelper.faceVerticesExpected = [
			_ObjectHelper.vertexExpectedA,
			_ObjectHelper.vertexExpectedB,
			_ObjectHelper.vertexExpectedC,
			_ObjectHelper.vertexExpectedD
		];
		
		// functions
		
		_ObjectHelper.clone_material = clone_material;
		_ObjectHelper.clone_geometry = clone_geometry;
		_ObjectHelper.clone_morphs = clone_morphs;
		_ObjectHelper.clone_list = clone_list;
		
		_ObjectHelper.update_world_matrix = update_world_matrix;
		
		_ObjectHelper.apply_matrix = apply_matrix;
		_ObjectHelper.apply_quaternion = apply_quaternion;
		
		_ObjectHelper.dimensions = dimensions;
		
		_ObjectHelper.push_bounds = push_bounds;
		_ObjectHelper.face_bounding_radius = face_bounding_radius;
		
		_ObjectHelper.center_offset = center_offset;
		_ObjectHelper.center = center;
		
		_ObjectHelper.rotation_offset = rotation_offset;
		_ObjectHelper.center_rotation = center_rotation;
		
		_ObjectHelper.normalize_faces = normalize_faces
		
		_ObjectHelper.object_follow_object = object_follow_object;
		_ObjectHelper.object_orbit_source = object_orbit_source;
		
		_ObjectHelper.temporary_change = temporary_change;
		_ObjectHelper.revert_change = revert_change;
		
		_ObjectHelper.tween = tween;
		_ObjectHelper.tween_stop = tween_stop;
		
	}
	
	/*===================================================
    
    cloning
    
    =====================================================*/
	
	function clone_material ( material ) {
		
		var pMat,
			cMaterial;
		
		// shallow copy material
		
		pMat = main.extend( material, {} );
		
		// special properties not handled by shallow copy
		
		if ( material.color instanceof THREE.Color ) {
			
			pMat.color = material.color.getHex();
			
		}
		if ( material.ambient instanceof THREE.Color ) {
			
			pMat.ambient = material.ambient.getHex();
			
		}
		if ( material.specular instanceof THREE.Color ) {
			
			pMat.specular = material.specular.getHex();
			
		}
		
		// new material by type
		
		if ( material instanceof THREE.MeshBasicMaterial ) {
			
			cMaterial = new THREE.MeshBasicMaterial( pMat );
			
		}
		else if ( material instanceof THREE.MeshLambertMaterial ) {
			
			cMaterial = new THREE.MeshLambertMaterial( pMat );
			
		}
		else if ( material instanceof THREE.MeshPhongMaterial ) {
			
			cMaterial = new THREE.MeshPhongMaterial( pMat );
			
		}
		else if ( material instanceof THREE.MeshFaceMaterial ) {
			
			cMaterial = new THREE.MeshFaceMaterial( pMat );
			
		}
		else {
			
			cMaterial = new THREE.Material( pMat );
			
		}
		
		return cMaterial;
		
	}
	
	function clone_geometry ( geometry ) {
		console.log( 'CLONE geometry ', geometry );
		var i, l,
			j, k,
			vertices = geometry.vertices,
			faces = geometry.faces,
			uvs = geometry.faceVertexUvs[ 0 ],
			vertex,
			face,
			uv,
			cGeometry = new THREE.Geometry();
		
		// materials
		
		if ( geometry.materials ) {
			
			for ( i = 0, l = geometry.materials.length; i < l; i++ ) {
				
				cGeometry.materials.push( geometry.materials[ i ].clone() );
				
			}

		}

		// vertices
		
		cGeometry.vertices = clone_list( vertices );

		// faces
		
		cGeometry.faces = clone_list( faces );

		// uvs

		for ( i = 0, l = uvs.length; i < l; i++ ) {

			uv = uvs[ i ], uvCopy = [];

			for ( j = 0, k = uv.length; j < k; j++ ) {

				uvCopy.push( new THREE.UV( uv[ j ].u, uv[ j ].v ) );

			}

			cGeometry.faceVertexUvs[ 0 ].push( uvCopy );

		}
		
		// morphs
		
		cGeometry.morphTargets = clone_morphs( geometry.morphTargets );
		cGeometry.morphColors = clone_morphs( geometry.morphColors );

		return cGeometry;

	}
	
	function clone_morphs ( morphs ) {
		
		var i, l,
			c = [],
			morph,
			cMorph;
		
		for ( i = 0, l = morphs.length; i < l; i++ ) {
			
			morph = morphs[ i ];
			
			cMorph = {
				name: morph.name
			};
			
			if ( morph.hasOwnProperty( 'vertices' ) ) {
				
				cMorph.vertices = clone_list( morph.vertices );
				
			}
			
			if ( morph.hasOwnProperty( 'colors' ) ) {
				
				cMorph.colors = clone_list( morph.colors );
				
			}
			
			if ( morph.hasOwnProperty( 'normals' ) ) {
				
				cMorph.normals = clone_list( morph.normals );
				
			}
			
			c.push( cMorph );
			
		}
		
		return c;
		
	}
	
	function clone_list ( list ) {
		
		var i, l,
			element,
			c = [];
		
		for ( i = 0, l = list.length; i < l; i++ ) {
			
			element = list[ i ];
			
			c.push( element.clone() );
			
		}
		
		return c;
		
	}
	
	/*===================================================
    
    update
    
    =====================================================*/
	
	function update_world_matrix ( object ) {
		
		var i, l,
			parentCascade,
			parent,
			parentUpdate
		
		// search all parents between object and root for world matrix update
		
		parentCascade = _SceneHelper.extract_parents_from_objects( object, object );
		
		for ( i = 0, l = parentCascade.length; i < l; i++ ) {
			
			parent = parentCascade[ i ];
			
			if ( parent.matrixWorldNeedsUpdate === true ) {
				
				parentUpdate = parent;
				
			}
			
		}
		
		// update world matrix starting at uppermost parent that needs update
		
		if ( typeof parentUpdate !== 'undefined' ) {
			
			parentUpdate.updateMatrixWorld();
			
		}
		
	}
	
	/*===================================================
    
    apply
    
    =====================================================*/
	
	function apply_matrix ( object, matrix ) {
		
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
				
				matrix.multiplyVector3( vertex );
				
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
	
	function apply_quaternion ( object, quaternion, invisible, reverse ) {
		
		var matrix = utilMat41ApplyQ.setRotationFromQuaternion( quaternion ),
			objectQ = utilQ1ApplyQ;
			objectNewQ = utilQ2ApplyQ;
		
		// apply matrix to object
		
		apply_matrix( object, matrix );
		
		// additional adjustments if object is mesh
		
		if ( invisible === true && object instanceof THREE.Mesh ) {
			
			// get object quaternion
			
			if ( object.useQuaternion === true ) {
				
				objectQ = object.quaternion;
				
			}
			else {
				
				objectQ.setFromRotationMatrix( object.matrix );
				
			}
			
			// multiply
			
			if ( reverse === true ) {
				
				objectNewQ.multiply( objectQ, quaternion.inverse() );
				
			}
			else {
				
				objectNewQ.multiply( quaternion.inverse(), objectQ );
				
			}
			
			// apply
			
			if ( object.useQuaternion === true ) {
				
				object.quaternion.copy( objectNewQ );
			
			}
			else {
				
				object.matrix.setRotationFromQuaternion( objectNewQ );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    dimensions
    
    =====================================================*/
	
	function dimensions ( object, ignoreScale ) {
		
		var mesh = object instanceof THREE.Mesh ? object : false,
			geometry = mesh ? mesh.geometry : object,
			dimensions = utilVec31Dimensions,
			bbox;
		
		// if needs calculation
		
		if ( !geometry.boundingBox ) {
			
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
	
	function push_bounds ( object, bounds ) {
		
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
	
	function face_bounding_radius ( object, face ) {
		
		var geometry = object instanceof THREE.Mesh ? object.geometry : object,
			vertices = geometry.vertices,
			centroid = face.centroid,
			va = vertices[ face.a ], vb = vertices[ face.b ], vc = vertices[ face.c ], vd,
			centroidToVert = utilVec31FaceBounds,
			radius;
		
		// handle face type
		
		if ( face instanceof THREE.Face4 ) {
			
			vd = vertices[ face.d ];
			
			centroid.add( va, vb ).addSelf( vc ).addSelf( vd ).divideScalar( 4 );
			
			radius = Math.max( centroidToVert.sub( centroid, va ).length(), centroidToVert.sub( centroid, vb ).length(), centroidToVert.sub( centroid, vc ).length(), centroidToVert.sub( centroid, vd ).length() );
			
		}
		else {
			
			centroid.add( va, vb ).addSelf( vc ).divideScalar( 3 );
			
			radius = Math.max( centroidToVert.sub( centroid, va ).length(), centroidToVert.sub( centroid, vb ).length(), centroidToVert.sub( centroid, vc ).length() );
			
		}
		
		return radius;
		
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
	
	function center ( object ) {
		
		var offset = center_offset( object ),
			offsetMat4 = utilMat41Center.makeTranslation( offset.x, offset.y, offset.z );
		
		// apply offset
		
		apply_matrix( object, offsetMat4 );
		
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
	
	function rotation_offset ( object, axisUp, axisForward ) {
		
		var i, l,
			geometry = object instanceof THREE.Mesh ? object.geometry : object,
			faces = geometry.faces,
			vertices = geometry.vertices,
			face,
			normalAvg = utilVec31OffsetRot.set( 0, 0, 0 ),
			ca = shared.cardinalAxes,
			offset;
		
		// for all face normals
		
		for ( i = 0, l = faces.length; i < l; i++ ) {
			
			face = faces[ i ];
			
			normalAvg.addSelf( face.normal );
			
		}
		
		// find average
		
		normalAvg.normalize();
		
		// handle axes
		// use rigidBody axis if available, or default to global up
		
		axisUp = axisUp || ( ( typeof object.rigidBody !== 'undefined' ) ? object.rigidBody.axes.up : ca.up );
		axisForward = axisForward || ( ( typeof object.rigidBody !== 'undefined' ) ? object.rigidBody.axes.forward : ca.forward );
		
		// find quaternion to go from average of normals to current axis up
		
		return _VectorHelper.q_to_axis( normalAvg, axisUp, axisForward );
		
	}
	
	function center_rotation ( object ) {
		
		var offset = rotation_offset( object );
		
		if ( offset instanceof THREE.Quaternion ) {
			
			apply_quaternion( object, offset, true );
			
		}
		
	}
	
	/*===================================================
    
    face normalization
    
    =====================================================*/
	
	function normalize_faces ( object ) {
		
		// faces must lie along xz axis with normal in y direction
		// TODO: account for faces with other orientations
		
		var i, l,
			j, k,
			m, n,
			geometry = object instanceof THREE.Mesh ? object.geometry : object,
			vertices = geometry.vertices,
			faces = geometry.faces,
			face,
			vertexOrder,
			vertexOrderNew,
			vertexOrderIndices,
			vertexOrderIndicesMin,
			vertexOrderScoresList,
			vertexOrderScores,
			faceVertices,
			faceVerticesIndices,
			faceVerticesNormalized = [
				utilVec31NormalizeFaces,
				utilVec32NormalizeFaces,
				utilVec33NormalizeFaces,
				utilVec34NormalizeFaces
			],
			faceVerticesExpected = _ObjectHelper.faceVerticesExpected,
			vertex,
			vertexId,
			vertexAltId,
			vertexLastId,
			vertexScoreId,
			vertexIndex,
			vertexOrderIndex,
			vertexNormalized,
			vertexExpected,
			faceVertexNormals,
			faceVertexColors,
			faceVertexTangents,
			distance,
			angle,
			axis = utilVec35NormalizeFaces,
			score,
			scoreMin,
			vrotAvg = utilQ1NormalizeFaces,
			vrotAxis = utilVec36NormalizeFaces.set( 0, 1, 0 ),
			vrotAxisDot;
		
		// for all faces
		
		for ( i = 0, l = faces.length; i < l; i++ ) {
			
			face = faces[ i ];
			
			// face properties
			
			if ( face instanceof THREE.Face4 ) {
				vertexOrder = [ 'a', 'b', 'c', 'd' ];
			}
			else {
				vertexOrder = [ 'a', 'b', 'c' ];
			}
			vertexOrderNew = [];
			vertexOrderIndices = [];
			vertexOrderIndicesMin = [];
			vertexOrderScoresList = {};
			faceVertices = [];
			faceVerticesIndices = [];
			faceVertexNormals = [];
			faceVertexColors = [];
			faceVertexTangents = [];
			
			// for each face vertex
			
			scoreMin = Number.MAX_VALUE;
			
			for ( j = 0, k = vertexOrder.length; j < k; j++ ) {
				
				vertexId = vertexOrder[ j ];
				
				vertexIndex = faceVerticesIndices[ j ] = face[ vertexId ];
				faceVertexNormals[ j ] = face.vertexNormals[ j ];
				faceVertexColors[ j ] = face.vertexColors[ j ];
				faceVertexTangents[ j ] = face.vertexTangents[ j ];
				
				vertex = faceVertices[ j ] = vertices[ vertexIndex ];
				
				// normalize vertex
				
				vertexNormalized = faceVerticesNormalized[ j ].copy( vertex ).normalize();
				
				// init order scores for vertex
				
				vertexOrderScores = vertexOrderScoresList[ vertexId ] = {};
				
				// find score to go from vertex to each expected
				
				for ( m = 0, n = vertexOrder.length; m < n; m++ ) {
					
					vertexAltId = vertexOrder[ m ];
					vertexExpected = faceVerticesExpected[ m ];
					
					// only check expected that are to left or right of vertex
					
					if ( ( m >= j - 1 && m <= j + 1 ) || ( j === 0 && m === k - 1 ) || ( j === k - 1 && m === 0 ) ) {
						
						// get angle
						
						distance = _MathHelper.clamp( vertexNormalized.dot( vertexExpected ), -1, 1 );
						angle = Math.acos( distance );
						
						// get axis between vertex and expected
						
						axis.cross( vertexNormalized, vertexExpected ).normalize();
						
						// dot expected axis with actual axis
						
						vrotAxisDot = vrotAxis.dot( axis );
						
						// score from angle and dot
						
						vertexOrderScores[ vertexAltId ] = score = angle + Math.acos( vrotAxisDot );
						
						// find minimum score amongst all face vertices
						
						if ( score < scoreMin ) {
							
							scoreMin = score;
							vertexOrderIndex = m;
							
						}
						
					}
					else {
						
						vertexOrderScores[ vertexAltId ] = Number.MAX_VALUE;
						
					}
					
				}
				
				// add index to vertex order indices
				
				vertexOrderIndicesMin.push( j );
				
			}
			
			// reorder vertex order indices by score with minimum value
			
			vertexOrderIndicesMin = [].concat( vertexOrderIndicesMin.slice( vertexOrderIndex ), vertexOrderIndicesMin.slice( 0, vertexOrderIndex ) );
			
			// sort vertices by scores, starting at score id with minimum value
			
			for ( j = 0, k = vertexOrder.length; j < k; j++ ) {
				
				vertexIndex = vertexOrderIndicesMin[ j ];
				
				vertexScoreId = vertexOrder[ vertexIndex ];
				
				scoreMin = Number.MAX_VALUE;
				
				for ( m = 0, n = vertexOrder.length; m < n; m++ ) {
					
					vertexId = vertexOrder[ m ];
					
					// if vertex id has not been placed in new order yet
					
					if ( main.index_of_value( vertexOrderNew, vertexId ) === -1 ) {
						
						vertexOrderScores = vertexOrderScoresList[ vertexId ];
						
						score = vertexOrderScores[ vertexScoreId ];
						
						// if score is less than min and last vertex is to left of this vertex ( ex: da or bc )
						
						if ( score < scoreMin && ( j === 0 || vertexAltId === ( m === 0 ? vertexOrder[ vertexOrder.length - 1 ] : vertexOrder[ m - 1 ] ) ) ) {
							
							scoreMin = score;
							vertexOrderNew[ vertexIndex ] = vertexId;
							vertexOrderIndices[ vertexIndex ] = m;
							
						}
						
					}
					
				}
				
				// store last vertex
				
				vertexAltId = vertexOrderNew[ vertexIndex ];
				
			}
			//console.log( 'face', face, 'vertexOrderScoresList', vertexOrderScoresList, 'vertexOrder', vertexOrder, 'vertexOrderNew', vertexOrderNew, ' vertexOrderIndices ', vertexOrderIndices );
			// update face by sorted vertices
			
			angle = 0;
			
			for ( j = 0, k = vertexOrder.length; j < k; j++ ) {
				
				vertexId = vertexOrder[ j ];
				vertexOrderIndex = vertexOrderIndices[ j ];
				vertexIndex = faceVerticesIndices[ vertexOrderIndex ];
				
				// vertex index
				
				face[ vertexId ] = vertexIndex;
				
				// normals
				
				face.vertexNormals[ j ] = faceVertexNormals[ vertexIndex ];
				
				// colors
				
				if ( face.vertexColors.length > j ) {
					
					face.vertexColors[ j ] = faceVertexColors[ vertexIndex ];
					
				}
				
				// tangents
				
				if ( face.vertexTangents.length > j ) {
					
					face.vertexTangents[ j ] = faceVertexTangents[ vertexIndex ];
					
				}
				
				// modify object to account for sorting
				
				vertexNormalized = faceVerticesNormalized[ vertexOrderIndex ];
				vertexExpected = faceVerticesExpected[ j ];
				
				distance = _MathHelper.clamp( vertexNormalized.dot( vertexExpected ), -1, 1 );
				angle += Math.acos( distance );
				
			}
			
		}
		
		// normalize angle
		
		angle = angle / Math.max( 1, vertices.length );
		
		// apply
		
		vrotAvg.setFromAxisAngle( vrotAxis, angle - Math.PI * 0.5 );
		
		apply_quaternion( object, vrotAvg, true, true );
		
		/*
		var vectors = _VectorHelper.get_orthonormal_vectors( normalAvg.clone() ),
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
		
	}
	
	/*===================================================
    
    follow
    
    =====================================================*/
	
	function object_follow_object ( follower, leader, positionOffset, rotationBase, rotationOffset ) {
		
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
	
	/*===================================================
    
    orbit
    
    =====================================================*/
	
	function object_orbit_source ( object, source, positionOffset, rotationBase, rotationOffset ) {
		
		var sPos = utilVec31Orbit,
			oPos = object.position,
			oQ = object.quaternion,
			oBaseRot = utilQ1Orbit,
			oOffsetRot = utilQ2Orbit,
			oOffsetPos = utilVec32Orbit,
			skipBaseRot,
			skipOffsetRot,
			skipOffsetPos;
		
		// offset position
		
		if ( positionOffset instanceof THREE.Vector3 ) {
		
			oOffsetPos.copy( positionOffset );
			
		}
		else {
			
			skipOffsetPos = true;
			
		}
		
		// base rotation
		
		if ( rotationBase instanceof THREE.Quaternion ) {
			
			oBaseRot.copy( rotationBase );
			
		}
		else if ( rotationBase instanceof THREE.Vector3 ) {
			
			oBaseRot.setFromEuler( rotationBase ).normalize();
			
		}
		else {
			
			skipBaseRot = true;
			
		}
		
		// offset rotation
		
		if ( rotationOffset instanceof THREE.Quaternion ) {
			
			oOffsetRot.copy( rotationOffset );
			
		}
		else if ( rotationOffset instanceof THREE.Vector3 ) {
			
			oOffsetRot.setFromEuler( rotationOffset ).normalize();
			
		}
		else {
			
			skipOffsetRot = true;
			
		}
		
		// rotation
		
		if ( skipBaseRot !== true || skipOffsetRot !== true ) {
			
			oQ.set( 0, 0, 0, 1 );
		
			// modify offset position
			
			if ( skipBaseRot !== true ) {
				
				oBaseRot.multiplyVector3( oOffsetPos );
				
				oQ.multiplySelf( oOffsetRot );
				
			}
			
			if ( skipOffsetRot !== true ) {
				
				oOffsetRot.multiplyVector3( oOffsetPos );
				
				oQ.multiplySelf( oBaseRot );
				
			}
		
		}
		
		// position
		
		if ( source instanceof THREE.Object3D ) {
			
			oPos.copy( source.position );
			
		}
		else {
			
			oPos.copy( source );
			
		}
		
		if ( skipOffsetPos !== true ) {
			
			// add offset position
			
			oPos.addSelf( oOffsetPos );
			
		}
		
	}
	
	/*===================================================
    
    temporary changes
    
    =====================================================*/
	
	function temporary_change ( object, parameters ) {
		
		var stack = object.changeStack = object.changeStack || [],
			changedProperties = object.changedProperties = object.changedProperties || {},
			changedBy,
			layer = {id: Math.random()},
			property,
			value,
			changed;
		
		for ( property in parameters ) {
			
			if ( parameters.hasOwnProperty( property ) && property !== 'id' ) {
				
				value = parameters[ property ];
				
				// retain current value
				
				layer[ property ] = object[ property ];
				
				// assign new
				
				object[ property ] = value;
				
				changedBy = changedProperties[ property ] = changedProperties[ property ] || [];
				changedBy.push( layer );
				
				changed = true;
				
			}
			
		}
		
		if ( changed === true ) {
			
			stack.push( layer );
			
			return layer;
			
		}
		
	}
	
	function revert_change ( object, layer, override ) {
		
		var i,
			stack = object.changeStack,
			changedProperties = object.changedProperties,
			changedBy,
			index = -1,
			indexChangedBy,
			property,
			value;
		
		if ( typeof stack !== 'undefined' && typeof changedProperties !== 'undefined' ) {
			
			// true signals to revert all
			
			if ( layer === true ) {
				
				for ( i = stack.length - 1; i >= 0; i-- ) {
					
					revert_change( object, i, true );
					
				}
				
			}
			else {
				
				if ( main.is_number( layer ) ) {
					
					index = layer;
					
				}
				else if ( typeof layer !== 'undefined' ) {
					
					index = main.last_index_of_value( stack, layer );
					
				}
				else {
					
					index = stack.length - 1;
					
				}
				
				if ( index !== -1 ) {
					
					layer = stack[ index ];
					
					for ( property in layer ) {
						
						if ( layer.hasOwnProperty( property ) && property !== 'id' ) {
							
							// find out where this layer is in terms of changing property
							
							changedBy = changedProperties[ property ];
							indexChangedBy = override === true ? changedBy.length - 1 : main.last_index_of_value( changedBy, layer );
							
							// revert value when layer is last that made a change
							
							if ( indexChangedBy !== -1 ) {
								
								if ( indexChangedBy === changedBy.length - 1 ) {
									
									object[ property ] = layer[ property ];
									
								}
								// else change layer above's revert values to layer below this one
								else {
									
									changedBy[ indexChangedBy + 1 ][ property ] = changedBy[ Math.max( indexChangedBy - 1, 0 ) ][ property ];
									
								}
								
								changedBy.splice( indexChangedBy, 1 );
								
							}
							
						}
						
					}
					
					stack.splice( index, 1 );
					
				}
				
			}
			
		}
		
	}
	
	/*===================================================
    
	tween
    
    =====================================================*/
	
	function tween ( object, to, parameters ) {
		
		var i, l,
			properties = [],
			property;
		
		parameters = parameters || {};
		
		tween_stop( object, to );
		
		tween = new TWEEN.Tween( object )
			.to( to, parameters.duration )
			.easing( parameters.easing || TWEEN.Easing.Quadratic.InOut )
			.delay( parameters.delay || 0 )
			.onStart( parameters.onStart )
			.onStop( parameters.onStop )
			.onUpdate( parameters.onUpdate )
			.onComplete( parameters.onComplete );
		
		if ( parameters.start !== false ) {
			
			tween.start();
			
		}
			
		return tween;
		
	}
	
	function tween_stop ( object, to ) {
		
		var i,
			tweens = TWEEN.getAll(),
			tween,
			tweenObject,
			tweenTarget,
			property;
		
		for ( i = tweens.length - 1; i >= 0; i-- ) {
			
			tween = tweens[ i ];
			tweenObject = tween.getObject();
			
			if ( object === tweenObject ) {
				
				if ( typeof to !== 'undefined' ) {
					
					tweenTarget = tween.getTarget();
					
					for ( property in to ) {
						
						if ( to.hasOwnProperty( property ) && tweenTarget && tweenTarget.hasOwnProperty( property ) ) {
							
							tween.stop();
							break;
							
						}
						
					}
					
				}
				else {
					
					tween.stop();
					
				}
				
			}
			
		}
		
	}
    
} ( KAIOPUA ) );