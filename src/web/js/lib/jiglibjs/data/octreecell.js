(function(jigLib){
	var Vector3DUtil=jigLib.Vector3DUtil;
	var JAABox=jigLib.JAABox;
	var JNumber3D=jigLib.JNumber3D;
                
	var OctreeCell=function(aabox){
		this.childCellIndices = [-1,-1,-1,-1,-1,-1,-1,-1];
		this.triangleIndices = [];
                        
		this.clear();
                        
		if(aabox){
			this.AABox = aabox.clone();
		}else {
			this.AABox = new JAABox();
		}
		this._points = this.AABox.getAllPoints();
		this._egdes = this.AABox.get_edges();
	}
		
	OctreeCell.NUM_CHILDREN = 8;
                
	// indices of the children (if not leaf). Will be -1 if there is no child
        OctreeCell.prototype.childCellIndices=null;
	// indices of the triangles (if leaf)
        OctreeCell.prototype.triangleIndices=null;
	// Bounding box for the space we own
	OctreeCell.prototype.AABox=null;
                
        OctreeCell.prototype._points=null;
        OctreeCell.prototype._egdes=null;
	
	// Indicates if we contain triangles (if not then we should/might have children)
        OctreeCell.prototype.isLeaf=function() {
		return this.childCellIndices[0] == -1;
	}
                
	OctreeCell.prototype.clear=function(){
		for (var i = 0; i < this.NUM_CHILDREN; i++ ) {
			this.childCellIndices[i] = -1;
		}
		this.triangleIndices.splice(0, this.triangleIndices.length);
	}
                
	OctreeCell.prototype.get_points=function(){
		return this._points;
	}
	OctreeCell.prototype.get_egdes=function(){
		return this._egdes;
	}
	
	jigLib.OctreeCell=OctreeCell;

})(jigLib);		