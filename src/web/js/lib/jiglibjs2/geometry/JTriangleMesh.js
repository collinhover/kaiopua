
(function(jiglib) {

	var JIndexedTriangle = jiglib.JIndexedTriangle,
		JOctree = jiglib.JOctree,
		JCapsule = jiglib.JCapsule,
		JBox = jiglib.JBox,
		JRay = jiglib.JRay,
		JAABox = jiglib.JAABox,
		JTerrain = jiglib.JTerrain,
		JPlane = jiglib.JPlane,
		JTriangle = jiglib.JTriangle,
		JSphere = jiglib.JSphere,
		JSegment = jiglib.JSegment,
		RigidBody = jiglib.RigidBody,
		Matrix3D = jiglib.Matrix3D,
		Vector3D = jiglib.Vector3D,
		CollOutData = jiglib.CollOutData,
		TriangleVertexIndices = jiglib.TriangleVertexIndices,
		JMatrix3D = jiglib.JMatrix3D,
		JMath3D = jiglib.JMath3D,
		JNumber3D = jiglib.JNumber3D,
		PhysicsState = jiglib.PhysicsState;
	
	// removed init position and init orientation from arguments, not useful
	// also added fallback/defaults for tris per cell and min cell size
	var JTriangleMesh = function(skin, maxTrianglesPerCell, minCellSize)
	{
		this._octree = null; // JOctree
		this._maxTrianglesPerCell = null; // int
		this._minCellSize = null; // Number
		this._skinVertices = null; // Vector3D

		jiglib.RigidBody.apply(this, [ skin ]);
		
		this._maxTrianglesPerCell = maxTrianglesPerCell || 20;
		this._minCellSize = minCellSize || 1;
		
		this.set_movable(false);
		
		if(skin){
			this.createMesh(skin.vertices,skin.indices);
			
			this._boundingBox=this._octree.boundingBox().clone();
			skin.transform = JMatrix3D.getAppendMatrix3D(this.get_currentState().orientation, JMatrix3D.getTranslationMatrix(this.get_currentState().position.x, this.get_currentState().position.y, this.get_currentState().position.z));
		}
		
		this._type = "TRIANGLEMESH";
		
	}

	jiglib.extend(JTriangleMesh, RigidBody);

	JTriangleMesh.prototype.createMesh = function(vertices, triangleVertexIndices)
	{
		
		var len=vertices.length;
		var vts=[];
		
		var transform = JMatrix3D.getTranslationMatrix(this.get_currentState().position.x, this.get_currentState().position.y, this.get_currentState().position.z);
		transform = JMatrix3D.getAppendMatrix3D(this.get_currentState().orientation, transform);
		
		var i = 0;
		for (var vertices_i = 0, vertices_l = vertices.length, _point; (vertices_i < vertices_l) && (_point = vertices[vertices_i]); vertices_i++){
			vts[i++] = transform.transformVector(_point);
		}
		
		this._octree = new JOctree();
		
		this._octree.addTriangles(vts, vts.length, triangleVertexIndices, triangleVertexIndices.length);
		this._octree.buildOctree(this._maxTrianglesPerCell, this._minCellSize);
		
		this._skinVertices = vts;
		
	}

	JTriangleMesh.prototype.get_octree = function()
	{

		return this._octree;
		
	}

	JTriangleMesh.prototype.segmentIntersect = function(out, seg, state)
	{

		var segBox = new JAABox();
		segBox.addSegment(seg);
		
		var potentialTriangles = [];
		var numTriangles = this._octree.getTrianglesIntersectingtAABox(potentialTriangles, segBox);
		
		var bestFrac = JMath3D.NUM_HUGE;
		var tri;
		var meshTriangle;
		for (var iTriangle = 0 ; iTriangle < numTriangles ; iTriangle++) {
			meshTriangle = this._octree.getTriangle(potentialTriangles[iTriangle]);
			
			tri = new JTriangle(this._octree.getVertex(meshTriangle.getVertexIndex(0)), this._octree.getVertex(meshTriangle.getVertexIndex(1)), this._octree.getVertex(meshTriangle.getVertexIndex(2)));
			
			if (tri.segmentTriangleIntersection(out, seg)) {
				if (out.frac < bestFrac) {
				bestFrac = out.frac;
				out.position = seg.getPoint(bestFrac);
				out.normal = meshTriangle.get_plane().get_normal();
				}
			}
		}
		out.frac = bestFrac;
		if (bestFrac < JMath3D.NUM_HUGE) {
			return true;
		}else {
			return false;
		}
		
	}

	JTriangleMesh.prototype.updateState = function()
	{

		jiglib.RigidBody.prototype.updateState.apply(this, [  ]);
		
		var vts=[];
		
		var transform = JMatrix3D.getTranslationMatrix(this.get_currentState().position.x, this.get_currentState().position.y, this.get_currentState().position.z);
		transform = JMatrix3D.getAppendMatrix3D(this.get_currentState().orientation, transform);
		
		var i = 0;
		for (var _skinVertices_i = 0, _skinVertices_l = this._skinVertices.length, _point; (_skinVertices_i < _skinVertices_l) && (_point = this._skinVertices[_skinVertices_i]); _skinVertices_i++){
			vts[i++] = transform.transformVector(_point);
		}
		
		this._octree.updateTriangles(vts);
		this._octree.buildOctree(this._maxTrianglesPerCell, this._minCellSize);
		
		this._boundingBox=this._octree.boundingBox().clone();
		
	}

	JTriangleMesh.prototype.getInertiaProperties = function(m)
	{

		return new Matrix3D();
		
	}

	JTriangleMesh.prototype.updateBoundingBox = function()
	{

		
	}



	jiglib.JTriangleMesh = JTriangleMesh; 

})(jiglib);

