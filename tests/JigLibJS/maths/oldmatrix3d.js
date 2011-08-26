(function(jigLib){
	var Vector3DUtil=jigLib.Vector3DUtil;

	/**
	 * @author Paul Brunt
	 */
	var Matrix3D2=function(v){
		if(v) this.rawData=v;
			else this.rawData=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
	};
	Matrix3D2.prototype.rawData=null;

	Matrix3D2.prototype.get_determinant=function() {
		var m=this.rawData;
		return m[12] * m[9] * m[6] * m[3] - m[8] * m[13] * m[6] * m[3] - m[12] * m[5] * m[10] * m[3] + m[4] * m[13] * m[10] * m[3] + m[8] * m[5] * m[14] * m[3] - m[4] * m[9] * m[14] * m[3] - m[12] * m[9] * m[2] * m[7] + m[8] * m[13] * m[2] * m[7] + m[12] * m[1] * m[10] * m[7] - m[0] * m[13] * m[10] * m[7] - m[8] * m[1] * m[14] * m[7] + m[0] * m[9] * m[14] * m[7] + m[12] * m[5] * m[2] * m[11] - m[4] * m[13] * m[2] * m[11] - m[12] * m[1] * m[6] * m[11] + m[0] * m[13] * m[6] * m[11] + m[4] * m[1] * m[14] * m[11] - m[0] * m[5] * m[14] * m[11] - m[8] * m[5] * m[2] * m[15] + m[4] * m[9] * m[2] * m[15] + m[8] * m[1] * m[6] * m[15] - m[0] * m[9] * m[6] * m[15] - m[4] * m[1] * m[10] * m[15] + m[0] * m[5] * m[10] * m[15];
	};

	Matrix3D2.prototype.prepend=function(m){
		var mat1=this.rawData;
		var mat2=m.rawData;
		this.rawData=[
			mat2[0] * mat1[0]+mat2[4] * mat1[1]+mat2[8] * mat1[2]+mat2[12] * mat1[3],
			mat2[1] * mat1[0]+mat2[5] * mat1[1]+mat2[9] * mat1[2]+mat2[13] * mat1[3],
			mat2[2] * mat1[0]+mat2[6] * mat1[1]+mat2[10] * mat1[2]+mat2[14] * mat1[3],
			mat2[3] * mat1[0]+mat2[7] * mat1[1]+mat2[11] * mat1[2]+mat2[15] * mat1[3],

			mat2[0] * mat1[4]+mat2[4] * mat1[5]+mat2[8] * mat1[6]+mat2[12] * mat1[7],
			mat2[1] * mat1[4]+mat2[5] * mat1[5]+mat2[9] * mat1[6]+mat2[13] * mat1[7],
			mat2[2] * mat1[4]+mat2[6] * mat1[5]+mat2[10] * mat1[6]+mat2[14] * mat1[7],
			mat2[3] * mat1[4]+mat2[7] * mat1[5]+mat2[11] * mat1[6]+mat2[15] * mat1[7],

			mat2[0] * mat1[8]+mat2[4] * mat1[9]+mat2[8] * mat1[10]+mat2[12] * mat1[11],
			mat2[1] * mat1[8]+mat2[5] * mat1[9]+mat2[9] * mat1[10]+mat2[13] * mat1[11],
			mat2[2] * mat1[8]+mat2[6] * mat1[9]+mat2[10] * mat1[10]+mat2[14] * mat1[11],
			mat2[3] * mat1[8]+mat2[7] * mat1[9]+mat2[11] * mat1[10]+mat2[15] * mat1[11],

			mat2[0] * mat1[12]+mat2[4] * mat1[13]+mat2[8] * mat1[14]+mat2[12] * mat1[15],
			mat2[1] * mat1[12]+mat2[5] * mat1[13]+mat2[9] * mat1[14]+mat2[13] * mat1[15],
			mat2[2] * mat1[12]+mat2[6] * mat1[13]+mat2[10] * mat1[14]+mat2[14] * mat1[15],
			mat2[3] * mat1[12]+mat2[7] * mat1[13]+mat2[11] * mat1[14]+mat2[15] * mat1[15]];
		return;
	};

	Matrix3D2.prototype.append=function(m){
		var mat1=m.rawData;
		var mat2=this.rawData;
		this.rawData=[
			mat2[0] * mat1[0]+mat2[4] * mat1[1]+mat2[8] * mat1[2]+mat2[12] * mat1[3],
			mat2[1] * mat1[0]+mat2[5] * mat1[1]+mat2[9] * mat1[2]+mat2[13] * mat1[3],
			mat2[2] * mat1[0]+mat2[6] * mat1[1]+mat2[10] * mat1[2]+mat2[14] * mat1[3],
			mat2[3] * mat1[0]+mat2[7] * mat1[1]+mat2[11] * mat1[2]+mat2[15] * mat1[3],

			mat2[0] * mat1[4]+mat2[4] * mat1[5]+mat2[8] * mat1[6]+mat2[12] * mat1[7],
			mat2[1] * mat1[4]+mat2[5] * mat1[5]+mat2[9] * mat1[6]+mat2[13] * mat1[7],
			mat2[2] * mat1[4]+mat2[6] * mat1[5]+mat2[10] * mat1[6]+mat2[14] * mat1[7],
			mat2[3] * mat1[4]+mat2[7] * mat1[5]+mat2[11] * mat1[6]+mat2[15] * mat1[7],

			mat2[0] * mat1[8]+mat2[4] * mat1[9]+mat2[8] * mat1[10]+mat2[12] * mat1[11],
			mat2[1] * mat1[8]+mat2[5] * mat1[9]+mat2[9] * mat1[10]+mat2[13] * mat1[11],
			mat2[2] * mat1[8]+mat2[6] * mat1[9]+mat2[10] * mat1[10]+mat2[14] * mat1[11],
			mat2[3] * mat1[8]+mat2[7] * mat1[9]+mat2[11] * mat1[10]+mat2[15] * mat1[11],

			mat2[0] * mat1[12]+mat2[4] * mat1[13]+mat2[8] * mat1[14]+mat2[12] * mat1[15],
			mat2[1] * mat1[12]+mat2[5] * mat1[13]+mat2[9] * mat1[14]+mat2[13] * mat1[15],
			mat2[2] * mat1[12]+mat2[6] * mat1[13]+mat2[10] * mat1[14]+mat2[14] * mat1[15],
			mat2[3] * mat1[12]+mat2[7] * mat1[13]+mat2[11] * mat1[14]+mat2[15] * mat1[15]];
		return;
	};

	Matrix3D2.prototype.angleAxis=function(angle, axis) {
		var xmx,ymy,zmz,xmy,ymz,zmx,xms,yms,zms;

		//convert from degress to radians
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

		return new Matrix3D2(matrix);
	};

	Matrix3D2.prototype.translateMatrix=function(v){
		return new Matrix3D2([
			1,0,0,v[0],
			0,1,0,v[1],
			0,0,1,v[2],
			0,0,0,1
			]);
	};

	Matrix3D2.prototype.scaleMatrix=function(v){
		return new Matrix3D2([
			v[0],0,0,0,
			0,v[1],0,0,
			0,0,v[2],0,
			0,0,0,1
			]);
	};

	Matrix3D2.prototype.appendRotation=function(angle,axis,pivot){
		if(pivot){
			this.append(this.translateMatrix(Vector3DUtil.negate(pivot.slice(0))));
		}
		this.append(this.angleAxis(angle,axis));
		if(pivot){
			this.append(this.translateMatrix(pivot));
		}
	};

	Matrix3D2.prototype.prependRotation=function(angle,axis,pivot){
		if(pivot){
			this.prepend(this.translateMatrix(Vector3DUtil.negate(pivot.slice(0))));
		}
		this.prepend(this.angleAxis(angle,axis));
		if(pivot){
			this.prepend(this.translateMatrix(pivot));
		}
	};

	Matrix3D2.prototype.appendScale=function(x,y,z){
		this.append(this.scaleMatrix([x,y,z]));
	};

	Matrix3D2.prototype.prependScale=function(x,y,z){
		this.prepend(this.scaleMatrix([x,y,z]));
	};

	Matrix3D2.prototype.appendTranslation=function(x,y,z){
		this.append(this.translateMatrix([x,y,z]));
	};

	Matrix3D2.prototype.prependTranslation=function(x,y,z){
		this.prepend(this.translateMatrix([x,y,z]));
	};

	Matrix3D2.prototype.clone=function(){
		var d=this.rawData;
		return new Matrix3D2([d[0],d[1],d[2],d[3],d[4],d[5],d[6],d[7],d[8],d[9],d[10],d[11],d[12],d[13],d[14],d[15]]);
	};

	Matrix3D2.prototype.identity=function(){
		this.rawData=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
		return;
	};

	Matrix3D2.prototype.transpose=function(){
		var m=this.rawData;
		data=[m[0],m[4],m[8],m[12],
			  m[1],m[5],m[9],m[13],
			  m[2],m[6],m[10],m[14],
			  m[3],m[7],m[11],m[15]];
		this.rawData=data;
	};

	Matrix3D2.prototype.invert=function(){
		var m=this.clone();
		m.transpose();
		m=m.rawData;
		//cache the inverse, no point in a calc everytime
		var det=this.get_determinant();
		this.rawData=[
			(m[9] * m[14] * m[7] - m[13] * m[10] * m[7] + m[13] * m[6] * m[11] - m[5] * m[14] * m[11] - m[9] * m[6] * m[15] + m[5] * m[10] * m[15])/det,
			(m[12] * m[10] * m[7] - m[8] * m[14] * m[7] - m[12] * m[6] * m[11] + m[4] * m[14] * m[11] + m[8] * m[6] * m[15] - m[4] * m[10] * m[15])/det,
			(m[8] * m[13] * m[7] - m[12] * m[9] * m[7] + m[12] * m[5] * m[11] - m[4] * m[13] * m[11] - m[8] * m[5] * m[15] + m[4] * m[9] * m[15])/det,
			(m[12] * m[9] * m[6] - m[8] * m[13] * m[6] - m[12] * m[5] * m[10] + m[4] * m[13] * m[10] + m[8] * m[5] * m[14] - m[4] * m[9] * m[14])/det,
			(m[13] * m[10] * m[3] - m[9] * m[14] * m[3] - m[13] * m[2] * m[11] + m[1] * m[14] * m[11] + m[9] * m[2] * m[15] - m[1] * m[10] * m[15])/det,
			(m[8] * m[14] * m[3] - m[12] * m[10] * m[3] + m[12] * m[2] * m[11] - m[0] * m[14] * m[11] - m[8] * m[2] * m[15] + m[0] * m[10] * m[15])/det,
			(m[12] * m[9] * m[3] - m[8] * m[13] * m[3] - m[12] * m[1] * m[11] + m[0] * m[13] * m[11] + m[8] * m[1] * m[15] - m[0] * m[9] * m[15])/det,
			(m[8] * m[13] * m[2] - m[12] * m[9] * m[2] + m[12] * m[1] * m[10] - m[0] * m[13] * m[10] - m[8] * m[1] * m[14] + m[0] * m[9] * m[14])/det,
			(m[5] * m[14] * m[3] - m[13] * m[6] * m[3] + m[13] * m[2] * m[7] - m[1] * m[14] * m[7] - m[5] * m[2] * m[15] + m[1] * m[6] * m[15])/det,
			(m[12] * m[6] * m[3] - m[4] * m[14] * m[3] - m[12] * m[2] * m[7] + m[0] * m[14] * m[7] + m[4] * m[2] * m[15] - m[0] * m[6] * m[15])/det,
			(m[4] * m[13] * m[3] - m[12] * m[5] * m[3] + m[12] * m[1] * m[7] - m[0] * m[13] * m[7] - m[4] * m[1] * m[15] + m[0] * m[5] * m[15])/det,
			(m[12] * m[5] * m[2] - m[4] * m[13] * m[2] - m[12] * m[1] * m[6] + m[0] * m[13] * m[6] + m[4] * m[1] * m[14] - m[0] * m[5] * m[14])/det,
			(m[9] * m[6] * m[3] - m[5] * m[10] * m[3] - m[9] * m[2] * m[7] + m[1] * m[10] * m[7] + m[5] * m[2] * m[11] - m[1] * m[6] * m[11])/det,
			(m[4] * m[10] * m[3] - m[8] * m[6] * m[3] + m[8] * m[2] * m[7] - m[0] * m[10] * m[7] - m[4] * m[2] * m[11] + m[0] * m[6] * m[11])/det,
			(m[8] * m[5] * m[3] - m[4] * m[9] * m[3] - m[8] * m[1] * m[7] + m[0] * m[9] * m[7] + m[4] * m[1] * m[11] - m[0] * m[5] * m[11])/det,
			(m[4] * m[9] * m[2] - m[8] * m[5] * m[2] + m[8] * m[1] * m[6] - m[0] * m[9] * m[6] - m[4] * m[1] * m[10] + m[0] * m[5] * m[10])/det];
		return;
	};

	jigLib.Matrix3D2=Matrix3D2;

})(jigLib);