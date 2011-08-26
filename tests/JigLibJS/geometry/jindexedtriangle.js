(function(jigLib){
	var Vector3DUtil=jigLib.Vector3DUtil;
	var JNumber3D=jigLib.JNumber3D;
	var PlaneData=jigLib.PlaneData;
	var JAABox=jigLib.JAABox;
	
        /// Support for an indexed triangle - assumes ownership by something that 
        /// has an array of vertices and an array of tIndexedTriangle
	var JIndexedTriangle=function(){
		counter = 0;
		this._vertexIndices = [];
		this._vertexIndices[0] = -1;
		this._vertexIndices[1] = -1;
		this._vertexIndices[2] = -1;
		this._plane = new PlaneData();
		this._boundingBox = new JAABox();
	};
	
	JIndexedTriangle.prototype.counter=0;
        /// Set the indices into the relevant vertex array for this triangle. Also sets the plane and bounding box
	JIndexedTriangle.prototype.setVertexIndices=function(i0, i1, i2, vertexArray){
		this._vertexIndices[0] = i0;
		this._vertexIndices[1] = i1;
		this._vertexIndices[2] = i2;
                        
		this._plane.setWithPoint(vertexArray[i0], vertexArray[i1], vertexArray[i2]);
                        
		this._boundingBox.clear();
		this._boundingBox.addPoint(vertexArray[i0]);
		this._boundingBox.addPoint(vertexArray[i1]);
		this._boundingBox.addPoint(vertexArray[i2]);
	};
	
	JIndexedTriangle.prototype.updateVertexIndices=function(vertexArray){
		var i0,i1,i2;
		i0=this._vertexIndices[0];
		i1=this._vertexIndices[1];
		i2=this._vertexIndices[2];
                        
		this._plane.setWithPoint(vertexArray[i0], vertexArray[i1], vertexArray[i2]);
                        
		this._boundingBox.clear();
		this._boundingBox.addPoint(vertexArray[i0]);
		this._boundingBox.addPoint(vertexArray[i1]);
		this._boundingBox.addPoint(vertexArray[i2]);
	};
	
	
	 // Get the indices into the relevant vertex array for this triangle.
        JIndexedTriangle.prototype.get_vertexIndices=function(){
		return this._vertexIndices;
	};
                
	// Get the vertex index association with iCorner (which should be 0, 1 or 2)
	JIndexedTriangle.prototype.getVertexIndex=function(iCorner){
		return this._vertexIndices[iCorner];
	};
                
	// Get the triangle plane
        JIndexedTriangle.prototype.get_plane=function(){
		return this._plane;
	};
                
        JIndexedTriangle.prototype.get_boundingBox=function(){
		return this._boundingBox;
	};
	
	
	jigLib.JIndexedTriangle=JIndexedTriangle;

})(jigLib);
	