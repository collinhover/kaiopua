(function(jigLib){
	var Vector3DUtil=jigLib.Vector3DUtil;
	
	/**
	 * @author Muzer(muzerly@gmail.com)
	 * 
	 * @name JNumber3D
	 * @class JNumber3D
	 * @requires Vector3DUtil
	 * @constant {number} NUM_TINY
	 * @constant {number} NUM_HUGE
	 * @constructor
	 **/
	var JNumber3D={};
	
	JNumber3D.NUM_TINY = 0.00001;
	JNumber3D.NUM_HUGE = 100000;

	/* this method is redundant since we are already using arrays for 3D Vector storage
	JNumber3D.toArray=function(v){
		return v;//[v[0], v[1], v[2]];
	};
	*/
	
	/**
	 * @function getScaleVector clones a 3D vector and scales it's elements by s
	 * @param {array} v a 3D vector
	 * @param {number} s the scale to apply
	 * @type array
	 **/
	JNumber3D.getScaleVector=function(v, s){
		return [v[0]*s,v[1]*s,v[2]*s,v[3]];
	};

	/**
	 * @function getScaleVector clones a a 3D vector and divides it's elements by w
	 * @param {array} v a 3D vector
	 * @param {number} w the divisor
	 * @type array
	 **/
	JNumber3D.getDivideVector=function(v, w){
		return (w) ? [v[0] / w, v[1] / w, v[2] / w, 0] : [0, 0, 0, 0];
	};
	
	/**
	 * @function getNormal
	 * @param {array} v0 a 3D vector
	 * @param {array} v1 a 3D vector
	 * @param {array} v2 a 3D vector
	 * @type array
	 **/
	JNumber3D.getNormal=function(v0, v1, v2){
		// Vector3DUtil.subtract is non-destructive so we don't need to clone here...
		// var E = v1.slice(0);
		// var F = v2.slice(0);
		
		// replacing with a 1 liner...
		// var N = Vector3DUtil.crossProduct(Vector3DUtil.subtract(v1, v0), Vector3DUtil.subtract(v2, v1));
		// Vector3DUtil.normalize(N);
		// return N;
		
		return Vector3DUtil.normalize(Vector3DUtil.crossProduct(Vector3DUtil.subtract(v1, v0), Vector3DUtil.subtract(v2, v1)));
	};

	/**
	 * @function copyFromArray copies an array into a 3D vector
	 * @deprecated JigLibJS uses array for 3D vector storage so this method is redundant - use array.slice(0) instead
	 * @param {array} v a 3D vector
	 * @param {array} arr the array to copy to v
	 * @type void
	 **/
	JNumber3D.copyFromArray=function(v, arr){
		if (arr.length >= 3) v=arr.slice(0);
	};

	/**
	 * @function getLimiteNumber ensures num falls between min and max
	 * @param {number} num the number to limit
	 * @param {number} min the minimum allowable value for num
	 * @param {number} max the maximum allowable value for num
	 * @type number
	 **/
	JNumber3D.getLimiteNumber=function(num, min, max){
		var n = num;
		if (n < min) n = min;
		else if (n > max) n = max;

		return n;
	};
	
	jigLib.JNumber3D=JNumber3D;
	
})(jigLib);
