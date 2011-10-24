(function(jigLib){
	/**
		 * Represents a mesh from a 3D engine inside JigLib.
		 * Its implementation shold allow to get and set a Matrix3D on
		 * the original object.
		 *
		 * In the implementation, JMatrix3D should be translated into
		 * the type proper for a given engine.
		 *
		 * @author bartekd
		 */
	var Matrix3D=jigLib.Matrix3D;
	
	/**
	 * @author bartekd
	 * 
	 * @name ISkin3D
	 * @class ISkin3D an interface representing a mesh from a 3D engine inside JigLib. 
	 * Implementations should allow getting and setting a Matrix3D on the original object. 
	 * Matrix3D should be translated into a type compatible with the engine.
	 * 
	 * @requires Matrix3D
	 * @property {Matrix3D} matrix
	 * @constructor
	 **/
	function ISkin3D(){
		this.matrix=new Matrix3D();
	};
	
	ISkin3D.prototype.matrix=null;
	
	/**
	 * @function get_transform gets the transform matrix
	 * @type Matrix3D
	 **/
	ISkin3D.prototype.get_transform=function(){
		return this.matrix;
	};
	
	/**
	 * @function set_transform sets the transform matrix
	 * @param {Matrix3D} value
	 * @type void
	 **/
	ISkin3D.prototype.set_transform=function(value){
		this.matrix=value;
	};
	
	jigLib.ISkin3D=ISkin3D;
	
})(jigLib);