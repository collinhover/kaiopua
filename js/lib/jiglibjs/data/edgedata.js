
(function(jigLib){
	/**
	 * @author katopz
	 * 
	 * @name EdgeData
	 * @class EdgeData describes an edge in terms of the numbers of it's connecting vertices - used by JBox 
	 * @property {number} ind0 the number of the vertex at the start of the edge
	 * @property {number} ind1 the number of the vertex at the end of the edge
	 * @constructor
	 **/
	var EdgeData=function(ind0, ind1){
		this.ind0 = ind0;
		this.ind1 = ind1;
	};
	
	jigLib.EdgeData=EdgeData;
})(jigLib);