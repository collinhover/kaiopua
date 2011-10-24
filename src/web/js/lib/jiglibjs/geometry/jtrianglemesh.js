(function(jigLib){
	var Vector3DUtil=jigLib.Vector3DUtil;
	var JNumber3D=jigLib.JNumber3D;
	var JMatrix3D=jigLib.JMatrix3D;
	var JOctree=jigLib.JOctree;
	var CollOutData=jigLib.CollOutData;
	var TriangleVertexIndices=jigLib.TriangleVertexIndices;
	var PhysicsState=jigLib.PhysicsState;
	var RigidBody=jigLib.RigidBody;
	var ISkin3D=jigLib.ISkin3D;
	var JTriangle=jigLib.JTriangle;

	//removed init position and init orientation seems weird to have on trimesh but no other geom types
	var JTriangleMesh=function(skin, maxTrianglesPerCell, minCellSize){
		this.Super(skin);
		if(maxTrianglesPerCell==undefined) maxTrianglesPerCell=20;
		if(minCellSize==undefined) minCellSize=1;
                        
		this._maxTrianglesPerCell = maxTrianglesPerCell;
		this._minCellSize = minCellSize;
                        
		this.set_movable(false);
                        
		if(skin){
			this._skinVertices=skin.vertices;
			this.createMesh(this._skinVertices,skin.indices);
                                
			this._boundingBox=this._octree.boundingBox().clone();
			this._boundingSphere=this._boundingBox.getRadiusAboutCentre();
		}
                        
		this._type = "TRIANGLEMESH";
	};
	
	jigLib.extend(JTriangleMesh,jigLib.RigidBody);
	
	/*Internally set up and preprocess all numTriangles. Each index
                 should, of course, be from 0 to numVertices-1. Vertices and
                 triangles are copied and stored internally.*/
        JTriangleMesh.prototype.createMesh=function(vertices, triangleVertexIndices){
		this._skinVertices=vertices;
		var len=vertices.length;
		var vts=[];
                        
		var transform = JMatrix3D.getTranslationMatrix(this.get_currentState().position[0], this.get_currentState().position[1], this.get_currentState().position[2]);
		transform = JMatrix3D.getAppendMatrix3D(this.get_currentState().get_orientation(), transform);
                        
		var i = 0;
		for(var j=0;j<vertices.length;j++){
			var _point=vertices[j].slice(0);
			vts[i++] = transform.transformVector(_point);
		}

		this._octree = new JOctree();
                        
		this._octree.addTriangles(vts, vts.length, triangleVertexIndices, triangleVertexIndices.length);
		this._octree.buildOctree(this._maxTrianglesPerCell, this._minCellSize);
                        
	}
	
	
	
	JTriangleMesh.prototype.get_octree=function(){
		return this._octree;
	}
                
        /*JTriangleMesh.prototype.segmentIntersect=function(out, seg, state){
		var segBox = new jigLib.JAABox();
		segBox.addSegment(seg);
                        
		var potentialTriangles = [];
		var numTriangles = this._octree.getTrianglesIntersectingtAABox(potentialTriangles, segBox);
                        
		var bestFrac = JNumber3D.NUM_HUGE;
		var tri;
		var meshTriangle;
		for (var iTriangle = 0 ; iTriangle < numTriangles ; iTriangle++) {
			meshTriangle = this._octree.getTriangle(potentialTriangles[iTriangle]);
                                
			tri = new JTriangle(this._octree.getVertex(meshTriangle.getVertexIndex(0)), this._octree.getVertex(meshTriangle.getVertexIndex(1)), this._octree.getVertex(meshTriangle.getVertexIndex(2)));
                                
			if (tri.segmentTriangleIntersection(out, seg)) {
				if (out.frac < bestFrac) {
					bestFrac = out.frac;
					out.position = seg.getPoint(bestFrac);
					out.normal = meshTriangle.get_plane().normal;
				}
			}
		}
		out.frac = bestFrac;
		if (bestFrac < JNumber3D.NUM_HUGE) {
			return true;
		}else {
			return false;
		}
	}*/
	
	JTriangleMesh.prototype.segmentIntersect=function(out, seg, state){
                        
		var potentialTriangles = [];
		var numTriangles = this._octree.getTrianglesIntersectingSegment(potentialTriangles, seg);
                        
		var bestFrac = JNumber3D.NUM_HUGE;
		for (var iTriangle = 0 ; iTriangle < numTriangles ; iTriangle++) {
			var meshTriangle = potentialTriangles[iTriangle];
                                
			var tri = new JTriangle(this._octree.getVertex(meshTriangle.getVertexIndex(0)), this._octree.getVertex(meshTriangle.getVertexIndex(1)), this._octree.getVertex(meshTriangle.getVertexIndex(2)));
                                
			if (tri.segmentTriangleIntersection(out, seg)) {
				if (out.frac < bestFrac) {
					bestFrac = out.frac;
					out.position = seg.getPoint(bestFrac);
					out.normal = meshTriangle.get_plane().normal;
				}
			}
		}
		out.frac = bestFrac;
		if (bestFrac < JNumber3D.NUM_HUGE) {
			return true;
		}else {
			return false;
		}
	}
	
	JTriangleMesh.prototype.updateState=function(){
		this.Super.prototype.updateState.call(this);
                        
		var len=this._skinVertices.length;
		var vts=[];
		
		var transform = JMatrix3D.getTranslationMatrix(this.get_currentState().position[0], this.get_currentState().position[1], this.get_currentState().position[2]);
		transform = JMatrix3D.getAppendMatrix3D(this.get_currentState().get_orientation(), transform);

		var i = 0;
		for(j=0;j<this._skinVertices.length;j++){
			var _point=this._skinVertices[j].slice(0);
			vts[i++] = transform.transformVector(_point);
		}

		this._octree.updateTriangles(vts);
		this._octree.buildOctree(this._maxTrianglesPerCell, this._minCellSize);
                        
		this._boundingBox=this._octree.boundingBox().clone();
	}
                
                /*
                override public function getInertiaProperties(m:Number):Matrix3D
                {
                        return new Matrix3D();
                }
                
                override protected function updateBoundingBox():void {
                }*/
	
	
	
	jigLib.JTriangleMesh=JTriangleMesh;

})(jigLib);	