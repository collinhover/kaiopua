(function(jigLib){
	var Vector3DUtil=jigLib.Vector3DUtil;
	var JNumber3D=jigLib.JNumber3D;
	var EdgeData=jigLib.EdgeData;
	var JIndexedTriangle=jigLib.JIndexedTriangle;
	var JTriangle=jigLib.JTriangle;
	var JSegment=jigLib.JSegment;
	var OctreeCell=jigLib.OctreeCell;
	var TriangleVertexIndices=jigLib.TriangleVertexIndices;
	var JAABox=jigLib.JAABox;
        
	var JOctree=function(){
		this._testCounter = 0;
		this._cells = [];
		this._vertices = [];
		this._triangles = [];
		this._cellsToTest = [];
		this._boundingBox = new JAABox();
	};
	
	
	JOctree.prototype.get_trianglesData=function(){
		return this._triangles;
	};
                
        JOctree.prototype.getTriangle=function(iTriangle) {
		return this._triangles[iTriangle];
	};
                
        JOctree.prototype.get_verticesData=function(){
		return this._vertices;
	};
        JOctree.prototype.getVertex=function(iVertex){
		return this._vertices[iVertex];
	};
                
        JOctree.prototype.boundingBox=function(){
		return this._boundingBox;
	};
                
	JOctree.prototype.clear=function(){
		this._cells=[];
		this._vertices=[];
		this._triangles=[];
	}
	
                
	// Add the triangles - doesn't actually build the octree
	JOctree.prototype.addTriangles=function(vertices, numVertices, triangleVertexIndices, numTriangles){
		this.clear();
		this._vertices=vertices.slice(0);
		
		var NLen,tiny=JNumber3D.NUM_TINY;
		var i0,i1,i2;
		var dr1,dr2,N;
		var indexedTriangle;
		for(var i=0;i<triangleVertexIndices.length;i++){
			var tri=triangleVertexIndices[i];
			var i0 = triangleVertexIndices[i][0];
			var i1 = triangleVertexIndices[i][1];
			var i2 = triangleVertexIndices[i][2];
                                
			dr1 = Vector3DUtil.subtract(vertices[i1],vertices[i0]);
			dr2 = Vector3DUtil.subtract(vertices[i2],vertices[i0]);
			N = Vector3DUtil.crossProduct(dr1,dr2);
			NLen = Vector3DUtil.get_length(N);
                                
			if (NLen > tiny){
				indexedTriangle = new JIndexedTriangle();
				indexedTriangle.setVertexIndices(i0, i1, i2, this._vertices);
				this._triangles.push(indexedTriangle);
			}
		}
	}
	
	
	/* Builds the octree from scratch (not incrementally) - deleting
                 any previous tree.  Building the octree will involve placing
                 all triangles into the root cell.  Then this cell gets pushed
                 onto a stack of cells to examine. This stack will get parsed
                 and every cell containing more than maxTrianglesPerCell will
                 get split into 8 children, and all the original triangles in
                 that cell will get partitioned between the children. A
                 triangle can end up in multiple cells (possibly a lot!) if it
                 straddles a boundary. Therefore when intersection tests are
                 done tIndexedTriangle::m_counter can be set/tested using a
                 counter to avoid properly testing the triangle multiple times
                 (the counter _might_ wrap around, so when it wraps ALL the
                 triangle flags should be cleared! Could do this
                 incrementally...).*/
	JOctree.prototype.buildOctree=function(maxTrianglesPerCell, minCellSize){
		this._boundingBox.clear();
                        
		for(var i=0;i<this._vertices.length;i++){
			var vt=this._vertices[i];
			this._boundingBox.addPoint(vt);
		}
                        
		this._cells=[];
		this._cells.push(new OctreeCell(this._boundingBox));
                        
		var numTriangles = this._triangles.length;
		for (var i = 0; i < numTriangles; i++ ) {
			this._cells[0].triangleIndices[i] = i;
		}
                        
		var cellsToProcess = [];
		cellsToProcess.push(0);
                        
		var iTri;
		var cellIndex;
		var childCell;
		while (cellsToProcess.length != 0) {
			cellIndex = cellsToProcess.pop();
			if (this._cells[cellIndex].triangleIndices.length <= maxTrianglesPerCell || this._cells[cellIndex].AABox.getRadiusAboutCentre() < minCellSize) {
				continue;
			}
			
			for (var i = 0; i < OctreeCell.NUM_CHILDREN; i++ ) {
				this._cells[cellIndex].childCellIndices[i] = this._cells.length;
				cellsToProcess.push(this._cells.length);
				this._cells.push(new OctreeCell(this.createAABox(this._cells[cellIndex].AABox, i)));
                                        
				childCell = this._cells[this._cells.length - 1];
				numTriangles = this._cells[cellIndex].triangleIndices.length;
				for (var j=0; j < numTriangles; j++ ) {
					iTri = this._cells[cellIndex].triangleIndices[j];
					if (this.doesTriangleIntersectCell(this._triangles[iTri], childCell)){
						childCell.triangleIndices.push(iTri);
					}
				}
			}
			this._cells[cellIndex].triangleIndices=[];
		}
	}
                
	JOctree.prototype.updateTriangles=function(vertices){
		//this._vertices.concat(vertices);
		this._vertices=vertices.slice(0);
		for(var i=0;i<this._triangles.length;i++){
			var triangle=this._triangles[i];
			triangle.updateVertexIndices(this._vertices);
		}
	}
	
	JOctree.prototype.getTrianglesIntersectingSegment=function(triangles, seg){
		if (this._cells.length == 0) return 0;
                        
		this._cellsToTest=[];
		this._cellsToTest.push(0);
                                               
		var cellIndex,nTris,cell,triangle;
		
		this.incrementTestCounter();
		while (this._cellsToTest.length != 0) {
			cellIndex = this._cellsToTest.pop();
			cell = this._cells[cellIndex];
                                
			if (!cell.AABox.segmentAABoxOverlap(seg)) {
				continue;
			}
			
			if (cell.isLeaf()) {
				nTris = cell.triangleIndices.length;
				for (var i = 0 ; i < nTris ; i++) {
					triangle = this.getTriangle(cell.triangleIndices[i]);
					if (triangle.counter != this._testCounter) {
						triangle.counter = this._testCounter;
						if (triangle.get_boundingBox().segmentAABoxOverlap(seg)) {
							triangles.push(triangle);
						}
					}
				}
			}else {
				for (var i = 0 ; i < OctreeCell.NUM_CHILDREN ; i++) {
					this._cellsToTest.push(cell.childCellIndices[i]);
				}
			}
		}
		return triangles.length;
	}
                
	/* Gets a list of all triangle indices that intersect an AABox. The vector passed in resized,
                 so if you keep it between calls after a while it won't grow any more, and this
                 won't allocate more memory.
                 Returns the number of triangles (same as triangles.size())*/
	JOctree.prototype.getTrianglesIntersectingtAABox=function(triangles, aabb){
		if (this._cells.length == 0) return 0;
                        
		this._cellsToTest=[];
		this._cellsToTest.push(0);
                        
		this.incrementTestCounter();
                        
		var cellIndex,nTris,cell,triangle;
		while (this._cellsToTest.length != 0) {
			cellIndex = this._cellsToTest.pop();
			cell = this._cells[cellIndex];
                                
			if (!aabb.overlapTest(cell.AABox)) {
				continue;
			}
			if (cell.isLeaf()) {
				nTris = cell.triangleIndices.length;
				for (var i = 0 ; i < nTris ; i++) {
					triangle = this.getTriangle(cell.triangleIndices[i]);
					if (triangle.counter != this._testCounter) {
						triangle.counter = this._testCounter;
						if (aabb.overlapTest(triangle.get_boundingBox())) {
							triangles.push(cell.triangleIndices[i]);
						}
					}
				}
			}else {
				for (var i = 0 ; i < OctreeCell.NUM_CHILDREN ; i++) {
					this._cellsToTest.push(cell.childCellIndices[i]);
				}
			}
		}
		return triangles.length;
	}
                
	JOctree.prototype.dumpStats=function(){
		var maxTris = 0,numTris,cellIndex,cell;
                        
		var cellsToProcess = [];
		cellsToProcess.push(0);
                        
		while (cellsToProcess.length != 0) {
			cellIndex = cellsToProcess.pop();
                                
			cell = cell[cellIndex];
			if (cell.isLeaf()) {
                                        
				numTris = cell.triangleIndices.length;
				if (numTris > maxTris) {
					maxTris = numTris;
				}
			}else {
				for (var i = 0 ; i < OctreeCell.NUM_CHILDREN ; i++) {
					if ((cell.childCellIndices[i] >= 0) && (cell.childCellIndices[i] < this._cells.length)) {
						cellsToProcess.push(cell.childCellIndices[i]);
					}
				}
			}
		}
	}
	
	
	// Create a bounding box appropriate for a child, based on a parents AABox
	JOctree.prototype.createAABox=function(aabb, _id){
		var dims = JNumber3D.getScaleVector(Vector3DUtil.subtract(aabb.get_maxPos(),aabb.get_minPos()), 0.5);
		var offset;
		switch(_id) {
			case 0:
				offset = [1, 1, 1];
				break;
			case 1:
				offset = [1, 1, 0];
				break;
			case 2:
				offset = [1, 0, 1];
				break;
			case 3:
				offset = [1, 0, 0];
				break;
			case 4:
				offset = [0, 1, 1];
				break;
			case 5:
				offset = [0, 1, 0];
				break;
			case 6:
				offset = [0, 0, 1];
				break;
			case 7:
				offset = [0, 0, 0];
				break;
			default:
				offset = [0, 0, 0];
				break;
		}
                        		
		var result = new JAABox();
		result.set_minPos(Vector3DUtil.add(aabb.get_minPos(),[offset[0] * dims[0], offset[1] * dims[1], offset[2] * dims[2]]));
		result.set_maxPos(Vector3DUtil.add(result.get_minPos(),dims));
		Vector3DUtil.scaleBy(dims,0.00001);
		result.set_minPos(Vector3DUtil.subtract(result.get_minPos(),dims));
		result.set_maxPos(Vector3DUtil.add(result.get_maxPos(),dims));
                        
		return result;
	}	
	
	
	// Returns true if the triangle intersects or is contained by a cell
	JOctree.prototype.doesTriangleIntersectCell=function(triangle, cell){
		if (!triangle.get_boundingBox().overlapTest(cell.AABox)) {
			return false;
		}
		if (cell.AABox.isPointInside(this.getVertex(triangle.getVertexIndex(0))) ||
			cell.AABox.isPointInside(this.getVertex(triangle.getVertexIndex(1))) ||
			cell.AABox.isPointInside(this.getVertex(triangle.getVertexIndex(2)))) {
			return true;
		}

		var tri = new JTriangle(this.getVertex(triangle.getVertexIndex(0)), this.getVertex(triangle.getVertexIndex(1)), this.getVertex(triangle.getVertexIndex(2)));
		var edge;
		var seg;
		var edges = cell.get_egdes();
		var pts = cell.get_points();
		for (var i = 0; i < 12; i++ ) {
			edge = edges[i];
			seg = new JSegment(pts[edge.ind0], Vector3DUtil.subtract(pts[edge.ind1],pts[edge.ind0]));
			if (tri.segmentTriangleIntersection({}, seg)) {
				return true;
			}
		}
                        
		var pt0;
		var pt1;
		for (i = 0; i < 3; i++ ) {
			pt0 = tri.getVertex(i);
			pt1 = tri.getVertex((i + 1) % 3);
			if (cell.AABox.segmentAABoxOverlap(new JSegment(pt0, Vector3DUtil.subtract(pt1,pt0)))) {
				return true;
			}
		}
		return false;
	}
	
                
	/* Increment our test counter, wrapping around if necessary and zapping the triangle counters.
                 Const because we only modify mutable members.*/
	JOctree.prototype.incrementTestCounter=function(){
		++this._testCounter;
		if (this._testCounter == 0) {
			var numTriangles = this._triangles.length;
			for (var i = 0; i < numTriangles; i++) {
				this._triangles[i].counter = 0;
			}
			this._testCounter = 1;
		}
	}
	
	
	jigLib.JOctree=JOctree;

})(jigLib);
	
	