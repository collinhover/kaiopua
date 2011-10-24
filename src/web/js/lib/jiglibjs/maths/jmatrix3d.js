(function(jigLib){
	var Vector3DUtil=jigLib.Vector3DUtil;
	var Matrix3D=jigLib.Matrix3D;
	
	/**
	 * @author Muzer(muzerly@gmail.com)
	 * 
	 * @name JMatrix3D
	 * @class JMatrix3D
	 * @requires Vector3DUtil
	 * @requires Matrix3D
	 * @constructor
	 **/
	var JMatrix3D={};
	
	/**
	 * @function getTranslationMatrix returns a translate matrix
	 * @param {number} x translation amount in the X axis
	 * @param {number} y translation amount in the Y axis
	 * @param {number} z translation amount in the Z axis
	 * @type Matrix3D
	 **/
	JMatrix3D.getTranslationMatrix=function(x, y, z){
		var matrix3D = new Matrix3D();
		matrix3D.appendTranslation(x, y, z);
		return matrix3D;
	};
	
	/**
	 * @function getScaleMatrix returns a scale matrix
	 * @param {number} x scale amount in the X axis
	 * @param {number} y scale amount in the Y axis
	 * @param {number} z scale amount in the Z axis
	 * @type Matrix3D
	 **/
	JMatrix3D.getScaleMatrix=function(x, y, z){
		var matrix3D = new Matrix3D();
		matrix3D.prependScale(x, y, z);
		return matrix3D;
	};
				
	/**
	 * @function getRotationMatrix returns a rotation matrix
	 * @param {number} x axis X
	 * @param {number} y axis Y
	 * @param {number} z axis Z
	 * @param {number} degree rotation amount in degrees
	 * @param {array} pivotPoint the pivot point expressed as a 3D vector
	 * @type Matrix3D
	 **/
	JMatrix3D.getRotationMatrix=function(x, y, z, degree, pivotPoint){
		var matrix3D = new Matrix3D();
		matrix3D.appendRotation(degree, Vector3DUtil.create(x,y,z,0), pivotPoint);
		return matrix3D;
	};
				
	/**
	 * @function getInverseMatrix returns an inverted clone of a given Matrix3D
	 * @param {Matrix3D} m the matrix to invert
	 * @type Matrix3D
	 **/
	JMatrix3D.getInverseMatrix=function(m){
		var matrix3D = m.clone();
		matrix3D.invert();
		return matrix3D;
	};
	
	/**
	 * @function getTransposeMatrix returns a transposed clone of a given Matrix3D
	 * @param {Matrix3D} m the matrix to transpose
	 * @type Matrix3D
	 **/
	JMatrix3D.getTransposeMatrix=function(m){
		var matrix3D = m.clone();
		matrix3D.transpose();
		return matrix3D;
	};

	/**
	 * @function getAppendMatrix3D returns the result of one matrix appended to another
	 * @param {Matrix3D} a the original matrix
	 * @param {Matrix3D} b the matrix to append to a
	 * @type Matrix3D
	 **/
	JMatrix3D.getAppendMatrix3D=function(a, b){
		var matrix3D = a.clone();
		matrix3D.append(b);
		return matrix3D;
	};

	/**
	 * @function getPrependMatrix returns the result of one matrix prepended to another
	 * @param {Matrix3D} a the original matrix
	 * @param {Matrix3D} b the matrix to prepend to a
	 * @type Matrix3D
	 **/
	JMatrix3D.getPrependMatrix=function(a, b){
		var matrix3D = a.clone();
		matrix3D.prepend(b);
		return matrix3D;
	};
				
	/**
	 * @function getSubMatrix returns the result of one matrix subtracted from another
	 * @param {Matrix3D} a the original matrix
	 * @param {Matrix3D} b the matrix to subtract from a
	 * @type Matrix3D
	 **/
	JMatrix3D.getSubMatrix=function(a, b){
		var num = [16];
		for (var i = 0; i < 16; i++ ) {
			num[i] = a.glmatrix[i] - b.glmatrix[i];
		}
		return new Matrix3D(num);
	};
	
	/**
	 * @function getRotationMatrixAxis generates a rotation matrix for a given axis and amount
	 * @param {number} degree the rotation amount in degrees
	 * @param {array} rotateAxis the rotation axis
	 * @type Matrix3D
	 **/
	JMatrix3D.getRotationMatrixAxis=function(degree, rotateAxis){
				var matrix3D = new Matrix3D();
				matrix3D.appendRotation(degree, rotateAxis?rotateAxis:Vector3DUtil.X_AXIS);
				return matrix3D;
	};
				
	/**
	 * @function getCols returns the columns Matrix3D in a multidimensional array
	 * @param {Matrix3D} matrix3D the Matrix3D
	 * @type array
	 **/
	JMatrix3D.getCols=function(matrix3D){
		var _rawData =  matrix3D.glmatrix;
		var cols = [];
						
		/*
		cols[0] = Vector3DUtil.create(_rawData[0], _rawData[1], _rawData[2], 0);
		cols[1] = Vector3DUtil.create(_rawData[4], _rawData[5], _rawData[6], 0);
		cols[2] = Vector3DUtil.create(_rawData[8], _rawData[9], _rawData[10], 0);
		
		*/
		cols[0] = Vector3DUtil.create(_rawData[0], _rawData[4], _rawData[8], 0);
		cols[1] = Vector3DUtil.create(_rawData[1], _rawData[5], _rawData[9], 0);
		cols[2] = Vector3DUtil.create(_rawData[2], _rawData[6], _rawData[10], 0);
						
		return cols;
	};

	/**
	 * @function multiplyVector performs in-place multiplication of a 3D vector by a given Matrix3D
	 * @param {Matrix3D} matrix3D the Matrix3D to use in multiplying the vector
	 * @param {array} v the 3D vector to multiply
	 * @type void
	 **/
	JMatrix3D.multiplyVector=function(matrix3D, v){
		var vx = v[0];
		var vy = v[1];
		var vz = v[2];

		if (vx == 0 && vy == 0 && vz == 0) { return; }
						
		var _rawData =  matrix3D.glmatrix;
		
		/*
		How did this work in AS3? it looks wrong!
		v[0] = vx * _rawData[0] + vy * _rawData[4] + vz * _rawData[8]  + _rawData[12];
		v[1] = vx * _rawData[1] + vy * _rawData[5] + vz * _rawData[9]  + _rawData[13];
		v[2] = vx * _rawData[2] + vy * _rawData[6] + vz * _rawData[10] + _rawData[14];
		 */
		
		v[0] = vx * _rawData[0] + vy * _rawData[1] + vz * _rawData[2]  + _rawData[3];
		v[1] = vx * _rawData[4] + vy * _rawData[5] + vz * _rawData[6]  + _rawData[7];
		v[2] = vx * _rawData[8] + vy * _rawData[9] + vz * _rawData[10] + _rawData[11];
	};
	
	jigLib.JMatrix3D=JMatrix3D;
	
})(jigLib);
	