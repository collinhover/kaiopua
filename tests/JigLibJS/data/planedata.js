(function(jigLib){

	var Vector3DUtil=jigLib.Vector3DUtil;
	var JMath3D=jigLib.JMath3D;
	
	
	/**
	 * @name PlaneData
	 * @class PlaneData stores information about a contact between 2 objects
	 * @requires Vector3DUtil
	 * @property {array} position the position of the plane expressed as a 3D vector
	 * @property {array} normal the normal direction of the plane expressed as a 3D vector
	 * @property {number} distance the dot product of position and normal
	 * @constructor
	 * @param {array} pos the position of the plane expressed as a 3D vector
	 * @param {nor} the normal direction of the plane expressed as a 3D vector
	 **/
	var PlaneData=function(pos, nor){
		if(!pos) pos=[0,0,0];
		if(!nor) nor=[0,1,0];
		this.position = pos.slice(0);
		this.normal = nor.slice(0);
		this.distance = Vector3DUtil.dotProduct(this.position, this.normal);
	};
	PlaneData.prototype.position=null;
	PlaneData.prototype.normal=null;
	PlaneData.prototype.distance=null;
	
	
	/**
	 * @function pointPlaneDistance determines the distance between a given point and the plane
	 * @param {array} pt a 3D vector
	 * @type number
	 **/
	PlaneData.prototype.pointPlaneDistance=function(pt){
		return Vector3DUtil.dotProduct(this.normal, pt) - this.distance;
	};
	
                
        PlaneData.prototype.setWithNormal=function(pos, nor){
		this.position = pos.slice(0);
		this.normal = nor.slice(0);
		this.distance = Vector3DUtil.dotProduct(this.position, this.normal);
	};
	
        PlaneData.prototype.setWithPoint=function(pos0, pos1, pos2){
                        this.position = pos0.slice(0);
                        
                        var dr1 = Vector3DUtil.subtract(pos1,pos0);
                        var dr2 = Vector3DUtil.subtract(pos2,pos0);
                        this.normal = Vector3DUtil.crossProduct(dr1,dr2);
                        
                        var nLen = Vector3DUtil.get_length(this.normal);
                        if (nLen < JMath3D.NUM_TINY) {
                                this.normal = new Vector3D(0, 1, 0);
                                this.distance = 0;
                        }else {
                                Vector3DUtil.scaleBy(this.normal,1 / nLen);
                                this.distance = Vector3DUtil.dotProduct(pos0,this.normal);
                        }
                }
	
		
	jigLib.PlaneData=PlaneData;
	
})(jigLib);