(function(jigLib){
	var Vector3DUtil=jigLib.Vector3DUtil;
	var GLMatrix=jigLib.GLMatrix;
	
	/**
	 * @author Paul Brunt - rewritten by Jim Sangwine to use GLMatrix (http://code.google.com/p/glmatrix/)
	 * 
	 * @name Matrix3D
	 * @class Matrix3D a wrapper class for GLMatrix 
	 * @requires Vector3DUtil
	 * @requires GLMatrix
	 * @property {GLMatrix} glmatrix the internal GLMatrix object
	 * @constructor
	 **/
	var Matrix3D=function(v){
		if(v) this.glmatrix=GLMatrix.create(v);
		else this.glmatrix=GLMatrix.create([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
	};
	Matrix3D.prototype.glmatrix=null;
	
	/**
	 * @function get_determinant returns the determinant for this matrix
	 * @type number
	 **/
	Matrix3D.prototype.get_determinant=function() {
		return GLMatrix.determinant(this.glmatrix);
	};

	/**
	 * @function prepend prepends another matrix to this one
	 * @param {GLMatrix} m the matrix to prepend
	 * @type void
	 **/
	Matrix3D.prototype.prepend=function(m){
		GLMatrix.multiply(m.glmatrix, this.glmatrix, this.glmatrix);
	};
	
	/**
	 * @function append appends another matrix to this one
	 * @param {GLMatrix} m the matrix to append
	 * @type void
	 **/
	Matrix3D.prototype.append=function(m){
		GLMatrix.multiply(this.glmatrix, m.glmatrix);
	};
	
	/**
	 * @function angleAxis 
	 * @param {number} angle
	 * @param {array} axis 
	 * @type Matrix3D
	 **/
	Matrix3D.prototype.angleAxis=function(angle, axis) {
		var xmx,ymy,zmz,xmy,ymz,zmx,xms,yms,zms;

		//convert from degrees to radians
		angle=angle/(3.14159*2);

		var x = axis[0];
		var y = axis[1];
		var z = axis[2];

		var cos = Math.cos(angle);
		var cosi = 1.0 - cos;
		var sin = Math.sin(angle);

		xms = x * sin;yms = y * sin;zms = z * sin;
		xmx = x * x;ymy = y * y;zmz = z * z;
		xmy = x * y;ymz = y * z;zmx = z * x;

		var matrix=[(cosi * xmx) + cos,(cosi * xmy) - zms,(cosi * zmx) + yms,0,
					(cosi * xmy) + zms,(cosi * ymy) + cos,(cosi * ymz) - xms,0,
					(cosi * zmx) - yms,(cosi * ymz) + xms,(cosi * zmz) + cos,0,
					0,0,0,1];
		/*var matrix=[(cosi * xmx) + cos,(cosi * xmy) + zms,(cosi * zmx) - yms,0,
					(cosi * xmy) - zms,(cosi * ymy) + cos,(cosi * ymz) + xms,0,
					(cosi * zmx) + yms,(cosi * ymz) - xms,(cosi * zmz) + cos,0,
					0,0,0,1];   */
					
		
		return new Matrix3D(matrix);
	};
	
	/**
	 * @function rotate clones and rotates this matrix
	 * @param {number} angle
	 * @param {array} axis 
	 * @type Matrix3D
	 **/
	Matrix3D.prototype.rotate=function(angle, axis) {
		var mat=this.clone();
		GLMatrix.rotate(mat.glmatrix,angle,axis);
		return mat;
	};
	
	/**
	 * @function translateMatrix returns a translate matrix based on v
	 * @param {array} v translation expressed as a 3D vector
	 * @type Matrix3D
	 **/
	Matrix3D.prototype.translateMatrix=function(v){
		return new Matrix3D([ 
		         			1,0,0,v[0],
		         			0,1,0,v[1],
		         			0,0,1,v[2],
		         			0,0,0,1
		         			]);
		/*return new Matrix3D([
		         			1,0,0,0,
		         			0,1,0,0,
		         			0,0,1,0,
		         			v[0],v[1],v[2],1
		         			]);*/
	};
	
	/**
	 * @function scaleMatrix returns a scale matrix based on v
	 * @param {array} v scale expressed as a 3D vector
	 * @type Matrix3D
	 **/
	Matrix3D.prototype.scaleMatrix=function(v){
		return new Matrix3D([
		         			v[0],0,0,0,
		         			0,v[1],0,0,
		         			0,0,v[2],0,
		         			0,0,0,1
		         			]);
	};
	
	/**
	 * @function appendRotation appends rotation to this matrix
	 * @param {number} angle the rotation angle
	 * @param {array} axis the rotation axis expressed as a 3D vector
	 * @param {array} pivot the pivot point expressed as a 3D vector
	 * @type void
	 **/
	Matrix3D.prototype.appendRotation=function(angle,axis,pivot){
		angle=angle/(3.14159*2);
		Vector3DUtil.negate(axis);
		
		if (pivot)
		{
			var npivot=Vector3DUtil.negate(pivot.slice(0));
			this.appendTranslation(npivot[0], npivot[1], npivot[2]);
		}

		GLMatrix.rotate(this.glmatrix, angle, axis);

		if (pivot)
			this.appendTranslation(pivot[0], pivot[1], pivot[2]);
	};

	/**
	 * @function prependRotation prepends rotation to this matrix
	 * @param {number} angle the rotation angle
	 * @param {array} axis the rotation axis expressed as a 3D vector
	 * @param {array} pivot the pivot point expressed as a 3D vector
	 * @type void
	 **/
	Matrix3D.prototype.prependRotation=function(angle,axis,pivot){
		if(pivot)
			this.prepend(this.translateMatrix(Vector3DUtil.negate(pivot.slice(0))));

		this.prepend(this.angleAxis(angle,axis));
		if(pivot)
			this.prepend(this.translateMatrix(pivot));
	};
	
	/**
	 * @function appendScale appends scale to this matrix
	 * @param {number} x scale in the X axis
	 * @param {number} y scale in the Y axis
	 * @param {number} z scale in the Z axis
	 * @type void
	 **/
	Matrix3D.prototype.appendScale=function(x,y,z){
		GLMatrix.scale(this.glmatrix, [x,y,z]);
	};
	
	/**
	 * @function prependScale prepends scale to this matrix
	 * @param {number} x scale in the X axis
	 * @param {number} y scale in the Y axis
	 * @param {number} z scale in the Z axis
	 * @type void
	 **/
	Matrix3D.prototype.prependScale=function(x,y,z){
		this.prepend(this.scaleMatrix([x,y,z]));
	};
	
	/**
	 * @function appendTranslation appends translation to this matrix
	 * @param {number} x translation in the X axis
	 * @param {number} y translation in the Y axis
	 * @param {number} z translation in the Z axis
	 * @type void
	 **/
	Matrix3D.prototype.appendTranslation=function(x,y,z){
		this.append(this.translateMatrix([x,y,z]));
	};
	
	/**
	 * @function prependTranslation prepends translation to this matrix
	 * @param {number} x translation in the X axis
	 * @param {number} y translation in the Y axis
	 * @param {number} z translation in the Z axis
	 * @type void
	 **/
	Matrix3D.prototype.prependTranslation=function(x,y,z){
		this.prepend(this.translateMatrix([x,y,z]));
	};
	
	/**
	 * @function identity
	 * @type void
	 **/
	Matrix3D.prototype.identity=function(){
		GLMatrix.identity(this.glmatrix);
	};
	
	/**
	 * @function transpose transposes this matrix (making it compatible with the old Flex matrices)
	 * @type void
	 **/
	Matrix3D.prototype.transpose=function(){
		GLMatrix.transpose(this.glmatrix);
	};
	
	/**
	 * @function invert inverts this matrix
	 * @type void
	 **/
	Matrix3D.prototype.invert=function(){
		GLMatrix.inverse(this.glmatrix);
	};
	
	/**
	 * @function clone returns a clone of this matrix
	 * @type Matrix3D
	 **/
	Matrix3D.prototype.clone=function(){
		return new Matrix3D(this.glmatrix);
	};
	
	/**
	 * @function transformVector transforms (multiplies) this matrix by vector
	 * @param vector a 3D vector
	 * @returns
	 */
	Matrix3D.prototype.transformVector=function(vector){
		var x=vector[0];
		var y=vector[1];
		var z=vector[2];
		var m=this.glmatrix;
		return [m[0]*x+m[1]*y+m[2]*z+m[3],m[4]*x+m[5]*y+m[6]*z+m[7],m[8]*x+m[9]*y+m[10]*z+m[11]];
		
		//return GLMatrix.multiplyVec3(GLMatrix.transpose(this.glmatrix), vector); for some reason this is giving a very wrong answer!!!
	};
	
	jigLib.Matrix3D=Matrix3D;
	
})(jigLib);