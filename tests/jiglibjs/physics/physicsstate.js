(function(jigLib){
	var Matrix3D=jigLib.Matrix3D;
	var JMatrix3D=jigLib.JMatrix3D;
	
	/**
	 * @author katopz
	 * Devin Reimer (blog.almostlogical.com)
	 * 
	 * @name PhysicsState
	 * @class PhysicsState 
	 * @requires Matrix3D
	 * @requires JMatrix3D
	 * @property {array} position
	 * @property {Matrix3D} 
	 * @property {array} linVelocity
	 * @property {array} rotVelocity
	 * @property {array} orientationCols
	 * @constructor
	 **/
	var PhysicsState=function(){
		this._orientation = new Matrix3D();
	};
	
	PhysicsState.prototype.position = [0,0,0,0];
	PhysicsState.prototype._orientation;
	PhysicsState.prototype.linVelocity = [0,0,0,0];
	PhysicsState.prototype.rotVelocity = [0,0,0,0];
	PhysicsState.prototype.orientationCols = [[0,0,0,0],[0,0,0,0],[0,0,0,0]];
	
	/**
	 * @function get_orientation getter for _orientation
	 * @type Matrix3D
	 **/
	PhysicsState.prototype.get_orientation=function(){ return this._orientation; };
	
	/**
	 * @function set_orientation setter for _orientation
	 * @param {array} val
	 **/
	PhysicsState.prototype.set_orientation=function(val){
		this._orientation = val;			 
		var _rawData = this._orientation.glmatrix;
						
		this.orientationCols[0][0] = _rawData[0];
		this.orientationCols[0][1] = _rawData[1];
		this.orientationCols[0][2] = _rawData[2];
		
		this.orientationCols[1][0] = _rawData[4];
		this.orientationCols[1][1] = _rawData[5];
		this.orientationCols[1][2] = _rawData[6];
		
		this.orientationCols[2][0] = _rawData[8];
		this.orientationCols[2][1] = _rawData[9];
		this.orientationCols[2][2] = _rawData[10];
	};
		
	/**
	 * @function getOrientationCols here for backwards compatibility should use this.orientationCols unless you need a clone
	 * @type array
	 **/
	PhysicsState.prototype.getOrientationCols=function(){
		return JMatrix3D.getCols(this._orientation);
	};
	
	jigLib.PhysicsState=PhysicsState;
	
})(jigLib);