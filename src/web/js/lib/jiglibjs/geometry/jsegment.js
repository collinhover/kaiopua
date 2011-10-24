/*
   Copyright (c) 2007 Danny Chapman
   http://www.rowlhouse.co.uk

   This software is provided 'as-is', without any express or implied
   warranty. In no event will the authors be held liable for any damages
   arising from the use of this software.
   Permission is granted to anyone to use this software for any purpose,
   including commercial applications, and to alter it and redistribute it
   freely, subject to the following restrictions:
   1. The origin of this software must not be misrepresented; you must not
   claim that you wrote the original software. If you use this software
   in a product, an acknowledgment in the product documentation would be
   appreciated but is not required.
   2. Altered source versions must be plainly marked as such, and must not be
   misrepresented as being the original software.
   3. This notice may not be removed or altered from any source
   distribution.
 */

(function(jigLib){
	var Vector3DUtil=jigLib.Vector3DUtil;
	var JNumber3D=jigLib.JNumber3D;
	var JRay=jigLib.JRay;
	 
	/**
	 * @author Muzer(muzerly@gmail.com)
	 * 
	 * @name JSegment
	 * @class JSegment
	 * @extends RigidBody
	 * @requires Vector3DUtil
	 * @requires JNumber3D
	 * @requires JRay
	 * @property {array} origin the origin of the segment expressed as a 3D vector
	 * @property {array} delta the delta of the segment expressed as a 3D vector
	 * @constructor
	 * @param {array} _origin the origin of the segment expressed as a 3D vector
	 * @param {array} _delta the delta of the segment expressed as a 3D vector
	 **/
	var JSegment=function(_origin, _delta){
		this.origin = _origin;
		this.delta = _delta;
	};
	JSegment.prototype.origin=null;
	JSegment.prototype.delta=null;
	
	/**
	 * @function getPoint gets the point of the segment expressed as a 3D vector
	 * @param {number} t
	 * @type array
	 **/
	JSegment.prototype.getPoint=function(t){
		return Vector3DUtil.add(this.origin, JNumber3D.getScaleVector(this.delta, t));
	};

	/**
	 * @function getEnd gets the end of the segment expressed as a 3D vector
	 * @type array
	 **/
	JSegment.prototype.getEnd=function(){
		return Vector3DUtil.add(this.origin, this.delta);
	};

	/**
	 * @function clone returns a copy
	 * @type JSegment
	 **/
	JSegment.prototype.clone=function(){
		return new JSegment(this.origin, this.delta);
	};
	
	/**
	 * @function segmentSegmentDistanceSq
	 * @param {object} out
	 * @param {JSegment} seg
	 * @type number
	 **/
	JSegment.prototype.segmentSegmentDistanceSq=function(out, seg){
		out.t0 = 0;
		out.t1 = 0;

		var kDiff = Vector3DUtil.subtract(this.origin, seg.origin);
		var fA00 = Vector3DUtil.get_lengthSquared(this.delta);
		var fA01 = -Vector3DUtil.dotProduct(this.delta, seg.delta);
		var fA11 = Vector3DUtil.get_lengthSquared(seg.delta);
		var fB0 = Vector3DUtil.dotProduct(kDiff, this.delta);
		var fC = Vector3DUtil.get_lengthSquared(kDiff);
		var fDet = Math.abs(fA00 * fA11 - fA01 * fA01);
		var fB1;
		var fS;
		var fT;
		var fSqrDist;
		var fTmp;

		if (fDet >= JNumber3D.NUM_TINY){
			fB1 = -Vector3DUtil.dotProduct(kDiff, seg.delta);
			fS = fA01 * fB1 - fA11 * fB0;
			fT = fA01 * fB0 - fA00 * fB1;

			if (fS >= 0){
				if (fS <= fDet){
					if (fT >= 0){
						if (fT <= fDet){
							var fInvDet = 1 / fDet;
							fS *= fInvDet;
							fT *= fInvDet;
							fSqrDist = fS * (fA00 * fS + fA01 * fT + 2 * fB0) + fT * (fA01 * fS + fA11 * fT + 2 * fB1) + fC;
						}else{
							fT = 1;
							fTmp = fA01 + fB0;
							if (fTmp >= 0){
								fS = 0;
								fSqrDist = fA11 + 2 * fB1 + fC;
							}else if (-fTmp >= fA00){
								fS = 1;
								fSqrDist = fA00 + fA11 + fC + 2 * (fB1 + fTmp);
							}else{
								fS = -fTmp / fA00;
								fSqrDist = fTmp * fS + fA11 + 2 * fB1 + fC;
							}
						}
					}else{
						fT = 0;
						if (fB0 >= 0){
							fS = 0;
							fSqrDist = fC;
						}else if (-fB0 >= fA00){
							fS = 1;
							fSqrDist = fA00 + 2 * fB0 + fC;
						}else{
							fS = -fB0 / fA00;
							fSqrDist = fB0 * fS + fC;
						}
					}
				}else{
					if (fT >= 0){
						if (fT <= fDet){
							fS = 1;
							fTmp = fA01 + fB1;
							if (fTmp >= 0){
								fT = 0;
								fSqrDist = fA00 + 2 * fB0 + fC;
							}else if (-fTmp >= fA11){
								fT = 1;
								fSqrDist = fA00 + fA11 + fC + 2 * (fB0 + fTmp);
							}else{
								fT = -fTmp / fA11;
								fSqrDist = fTmp * fT + fA00 + 2 * fB0 + fC;
							}
						}else{
							fTmp = fA01 + fB0;
							if (-fTmp <= fA00){
								fT = 1;
								if (fTmp >= 0){
									fS = 0;
									fSqrDist = fA11 + 2 * fB1 + fC;
								}else{
									fS = -fTmp / fA00;
									fSqrDist = fTmp * fS + fA11 + 2 * fB1 + fC;
								}
							}else{
								fS = 1;
								fTmp = fA01 + fB1;
								if (fTmp >= 0){
									fT = 0;
									fSqrDist = fA00 + 2 * fB0 + fC;
								}else if (-fTmp >= fA11){
									fT = 1;
									fSqrDist = fA00 + fA11 + fC + 2 * (fB0 + fTmp);
								}else{
									fT = -fTmp / fA11;
									fSqrDist = fTmp * fT + fA00 + 2 * fB0 + fC;
								}
							}
						}
					}else{
						if (-fB0 < fA00){
							fT = 0;
							if (fB0 >= 0){
								fS = 0;
								fSqrDist = fC;
							}else{
								fS = -fB0 / fA00;
								fSqrDist = fB0 * fS + fC;
							}
						}else{
							fS = 1;
							fTmp = fA01 + fB1;
							if (fTmp >= 0){
								fT = 0;
								fSqrDist = fA00 + 2 * fB0 + fC;
							}else if (-fTmp >= fA11){
								fT = 1;
								fSqrDist = fA00 + fA11 + fC + 2 * (fB0 + fTmp);
							}else{
								fT = -fTmp / fA11;
								fSqrDist = fTmp * fT + fA00 + 2 * fB0 + fC;
							}
						}
					}
				}
			}else{
				if (fT >= 0){
					if (fT <= fDet){
						fS = 0;
						if (fB1 >= 0){
							fT = 0;
							fSqrDist = fC;
						}else if (-fB1 >= fA11){
							fT = 1;
							fSqrDist = fA11 + 2 * fB1 + fC;
						}else{
							fT = -fB1 / fA11;
							fSqrDist = fB1 * fT + fC;
						}
					}else{
						fTmp = fA01 + fB0;
						if (fTmp < 0){
							fT = 1;
							if (-fTmp >= fA00){
								fS = 1;
								fSqrDist = fA00 + fA11 + fC + 2 * (fB1 + fTmp);
							}else{
								fS = -fTmp / fA00;
								fSqrDist = fTmp * fS + fA11 + 2 * fB1 + fC;
							}
						}else{
							fS = 0;
							if (fB1 >= 0){
								fT = 0;
								fSqrDist = fC;
							}else if (-fB1 >= fA11){
								fT = 1;
								fSqrDist = fA11 + 2 * fB1 + fC;
							}else{
								fT = -fB1 / fA11;
								fSqrDist = fB1 * fT + fC;
							}
						}
					}
				}else{
					if (fB0 < 0){
						fT = 0;
						if (-fB0 >= fA00){
							fS = 1;
							fSqrDist = fA00 + 2 * fB0 + fC;
						}else{
							fS = -fB0 / fA00;
							fSqrDist = fB0 * fS + fC;
						}
					}else{
						fS = 0;
						if (fB1 >= 0){
							fT = 0;
							fSqrDist = fC;
						}else if (-fB1 >= fA11){
							fT = 1;
							fSqrDist = fA11 + 2 * fB1 + fC;
						}else{
							fT = -fB1 / fA11;
							fSqrDist = fB1 * fT + fC;
						}
					}
				}
			}
		}else{
			if (fA01 > 0){
				if (fB0 >= 0){
					fS = 0;
					fT = 0;
					fSqrDist = fC;
				}else if (-fB0 <= fA00){
					fS = -fB0 / fA00;
					fT = 0;
					fSqrDist = fB0 * fS + fC;
				}else{
					fB1 = -Vector3DUtil.dotProduct(kDiff, seg.delta);
					fS = 1;
					fTmp = fA00 + fB0;
					if (-fTmp >= fA01){
						fT = 1;
						fSqrDist = fA00 + fA11 + fC + 2 * (fA01 + fB0 + fB1);
					}else{
						fT = -fTmp / fA01;
						fSqrDist = fA00 + 2 * fB0 + fC + fT * (fA11 * fT + 2 * (fA01 + fB1));
					}
				}
			}else{
				if (-fB0 >= fA00){
					fS = 1;
					fT = 0;
					fSqrDist = fA00 + 2 * fB0 + fC;
				}else if (fB0 <= 0) {
					fS = -fB0 / fA00;
					fT = 0;
					fSqrDist = fB0 * fS + fC;
				}else{
					fB1 = -Vector3DUtil.dotProduct(kDiff, seg.delta);
					fS = 0;
					if (fB0 >= -fA01){
						fT = 1;
						fSqrDist = fA11 + 2 * fB1 + fC;
					}else{
						fT = -fB0 / fA01;
						fSqrDist = fC + fT * (2 * fB1 + fA11 * fT);
					}
				}
			}
		}

		out.t0 = fS;
		out.t1 = fT;
		return Math.abs(fSqrDist);
	};

	/**
	 * @function pointSegmentDistanceSq
	 * @param {object} out
	 * @param {array} pt
	 * @type number
	 **/
	JSegment.prototype.pointSegmentDistanceSq=function(out, pt){
		out.t = 0;

		var kDiff = Vector3DUtil.subtract(pt,  this.origin);
		var fT = Vector3DUtil.dotProduct(kDiff, this.delta);

		if (fT <= 0){
			fT = 0;
		}else{
			var fSqrLen = Vector3DUtil.get_lengthSquared(this._delta);
			if (fT >= fSqrLen){
				fT = 1;
				kDiff = Vector3DUtil.subtract(kDiff, this._delta);
			}else{
				fT /= fSqrLen;
				kDiff = Vector3DUtil.subtract(kDiff, JNumber3D.getScaleVector(this._delta, fT));
			}
		}

		out.t = fT;
		return Vector3DUtil.get_lengthSquared(kDiff);
	};

	/**
	 * @function segmentBoxDistanceSq
	 * @param {object} out
	 * @param {JBox} rkBox
	 * @param {PhysicsState} boxState
	 * @type number
	 **/
	JSegment.prototype.segmentBoxDistanceSq=function(out, rkBox, boxState){
		out.pfLParam = 0;
		out.pfLParam0 = 0;
		out.pfLParam1 = 0;
		out.pfLParam2 = 0;

		var obj = {};
		var kRay = new JRay(this.origin, this.delta);
		var fSqrDistance = this.sqrDistanceLine(obj, kRay, rkBox, boxState);
		if (obj.num >= 0){
			if (obj.num <= 1){
				out.pfLParam = obj.num;
				out.pfLParam0 = obj.num0;
				out.pfLParam1 = obj.num1;
				out.pfLParam2 = obj.num2;
				return Math.max(fSqrDistance, 0);
			}else{
				fSqrDistance = this.sqrDistancePoint(out, Vector3DUtil.add(this.origin, this.delta), rkBox, boxState);
				out.pfLParam = 1;
				return Math.max(fSqrDistance, 0);
			}
		}else{
			fSqrDistance = this.sqrDistancePoint(out, this.origin, rkBox, boxState);
			out.pfLParam = 0;
			return Math.max(fSqrDistance, 0);
		}
	};

	/**
	 * @function sqrDistanceLine
	 * @param {object} out
	 * @param {JRay} rkLine
	 * @param {JBox} rkBox
	 * @param {PhysicsState} boxState
	 * @type number
	 **/
	JSegment.prototype.sqrDistanceLine=function(out, rkLine, rkBox, boxState){
		var orientationCols = boxState.getOrientationCols();
		out.num = 0;
		out.num0 = 0;
		out.num1 = 0;
		out.num2 = 0;

		var kDiff = Vector3DUtil.subtract(rkLine.origin, boxState.position);
		var kPnt = Vector3DUtil.create( Vector3DUtil.dotProduct(kDiff, orientationCols[0]),
										Vector3DUtil.dotProduct(kDiff, orientationCols[1]),
										Vector3DUtil.dotProduct(kDiff, orientationCols[2]), 
										0);

		var kDir = Vector3DUtil.create( Vector3DUtil.dotProduct(rkLine.dir, orientationCols[0]),
										Vector3DUtil.dotProduct(rkLine.dir, orientationCols[1]),
										Vector3DUtil.dotProduct(rkLine.dir, orientationCols[2]), 
							            0);
						
		var kPntArr = kPnt.slice(0);
		var kDirArr = kDir.slice(0);
						
		var bReflect = [1,1,1,0];
		for (var i = 0; i < 3; i++){
			if (kDirArr[i] < 0){
				kPntArr[i] = -kPntArr[i];
				kDirArr[i] = -kDirArr[i];
				bReflect[i] = true;
			}else{
				bReflect[i] = false;
			}
		}

		JNumber3D.copyFromArray(kPnt, kPntArr);
		JNumber3D.copyFromArray(kDir, kDirArr);
						
		var obj = {};
		obj.rkPnt = kPnt.slice(0);
		obj.pfLParam = 0;
		obj.rfSqrDistance = 0;

		if (kDir[0] > 0){
			if (kDir[1] > 0){
				if (kDir[2] > 0){
					this.caseNoZeros(obj, kDir, rkBox);
					out.num = obj.pfLParam;
				}else{
					this.case0(obj, 0, 1, 2, kDir, rkBox);
					out.num = obj.pfLParam;
				}
			}else{
				if (kDir[2] > 0){
					this.case0(obj, 0, 2, 1, kDir, rkBox);
					out.num = obj.pfLParam;
				}else{
					this.case00(obj, 0, 1, 2, kDir, rkBox);
					out.num = obj.pfLParam;
				}
			}
		}else{
			if (kDir[1] > 0){
				if (kDir[2] > 0){
					this.case0(obj, 1, 2, 0, kDir, rkBox);
					out.num = obj.pfLParam;
				}else{
					this.case00(obj, 1, 0, 2, kDir, rkBox);
					out.num = obj.pfLParam;
				}
			}else{
				if (kDir[2] > 0){
					this.case00(obj, 2, 0, 1, kDir, rkBox);
					out.num = obj.pfLParam;
				}else{
					this.case000(obj, rkBox);
					out.num = 0;
				}
			}
		}

		kPntArr = obj.rkPnt.slice(0);
		for (i = 0; i < 3; i++){
			if (bReflect[i]) kPntArr[i] = -kPntArr[i];
		}
		JNumber3D.copyFromArray(obj.rkPnt, kPntArr);

		out.num0 = obj.rkPnt[0];
		out.num1 = obj.rkPnt[1];
		out.num2 = obj.rkPnt[2];

		return Math.max(obj.rfSqrDistance, 0);
	};
	
	/**
	 * @function sqrDistancePoint
	 * @param {object} out
	 * @param {array} rkPoint
	 * @param {JBox} rkBox
	 * @param {PhysicsState} boxState
	 * @type number
	 **/
	JSegment.prototype.sqrDistancePoint=function(out, rkPoint, rkBox, boxState){
		var orientationVector = boxState.getOrientationCols();
		var kDiff = Vector3DUtil.subtract(rkPoint, boxState.position);
		var kClosest = Vector3DUtil.create( Vector3DUtil.dotProduct(kDiff, orientationVector[0]),
							                Vector3DUtil.dotProduct(kDiff, orientationVector[1]),
							                Vector3DUtil.dotProduct(kDiff, orientationVector[2]), 
							                0);

		var fSqrDistance = 0;
		var fDelta;
		var boxHalfSide = rkBox.getHalfSideLengths();

		if (kClosest[0] < -boxHalfSide[0]){
			fDelta = kClosest[0] + boxHalfSide[0];
			fSqrDistance += (fDelta * fDelta);
			kClosest[0] = -boxHalfSide[0];
		}else if (kClosest[0] > boxHalfSide[0]){
			fDelta = kClosest[0] - boxHalfSide[0];
			fSqrDistance += (fDelta * fDelta);
			kClosest[0] = boxHalfSide[0];
		}

		if (kClosest[1] < -boxHalfSide[1]){
			fDelta = kClosest[1] + boxHalfSide[1];
			fSqrDistance += (fDelta * fDelta);
			kClosest[1] = -boxHalfSide[1];
		}else if (kClosest[1] > boxHalfSide[1]){
			fDelta = kClosest[1] - boxHalfSide[1];
			fSqrDistance += (fDelta * fDelta);
			kClosest[1] = boxHalfSide[1];
		}

		if (kClosest[2] < -boxHalfSide[2]){
			fDelta = kClosest[2] + boxHalfSide[2];
			fSqrDistance += (fDelta * fDelta);
			kClosest[2] = -boxHalfSide[2];
		}else if (kClosest[2] > boxHalfSide[2]){
			fDelta = kClosest[2] - boxHalfSide[2];
			fSqrDistance += (fDelta * fDelta);
			kClosest[2] = boxHalfSide[2];
		}

		out.pfLParam0 = kClosest[0];
		out.pfLParam1 = kClosest[1];
		out.pfLParam2 = kClosest[2];

		return Math.max(fSqrDistance, 0);
	};

	/**
	 * @function face
	 * @param {object} out
	 * @param {number} i0
	 * @param {number} i1
	 * @param {number} i2
	 * @param {array} rkDir
	 * @param {JBox} rkBox
	 * @param {array} rkPmE
	 * @type void
	 **/
	JSegment.prototype.face=function(out, i0, i1, i2, rkDir, rkBox, rkPmE){
		var kPpE = [0,0,0,0];
		var fLSqr;
		var fInv;
		var fTmp;
		var fParam;
		var fT;
		var fDelta;

		var boxHalfSide = rkBox.getHalfSideLengths();
		var boxHalfArr = boxHalfSide;
		var rkPntArr = out.rkPnt;
		var rkDirArr = rkDir;
		var kPpEArr = kPpE;
		var rkPmEArr = rkPmE;

		kPpEArr[i1] = rkPntArr[i1] + boxHalfArr[i1];
		kPpEArr[i2] = rkPntArr[i2] + boxHalfArr[i2];
		JNumber3D.copyFromArray(rkPmE, kPpEArr);

		if (rkDirArr[i0] * kPpEArr[i1] >= rkDirArr[i1] * rkPmEArr[i0]){
			if (rkDirArr[i0] * kPpEArr[i2] >= rkDirArr[i2] * rkPmEArr[i0]){
				rkPntArr[i0] = boxHalfArr[i0];
				fInv = 1 / rkDirArr[i0];
				rkPntArr[i1] -= (rkDirArr[i1] * rkPmEArr[i0] * fInv);
				rkPntArr[i2] -= (rkDirArr[i2] * rkPmEArr[i0] * fInv);
				out.pfLParam = -rkPmEArr[i0] * fInv;
				JNumber3D.copyFromArray(out.rkPnt, rkPntArr);
			}else{
				fLSqr = rkDirArr[i0] * rkDirArr[i0] + rkDirArr[i2] * rkDirArr[i2];
				fTmp = fLSqr * kPpEArr[i1] - rkDirArr[i1] * (rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i2] * kPpEArr[i2]);
				if (fTmp <= 2 * fLSqr * boxHalfArr[i1]){
					fT = fTmp / fLSqr;
					fLSqr += (rkDirArr[i1] * rkDirArr[i1]);
					fTmp = kPpEArr[i1] - fT;
					fDelta = rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i1] * fTmp + rkDirArr[i2] * kPpEArr[i2];
					fParam = -fDelta / fLSqr;
					out.rfSqrDistance += (rkPmEArr[i0] * rkPmEArr[i0] + fTmp * fTmp + kPpEArr[i2] * kPpEArr[i2] + fDelta * fParam);

					out.pfLParam = fParam;
					rkPntArr[i0] = boxHalfArr[i0];
					rkPntArr[i1] = fT - boxHalfArr[i1];
					rkPntArr[i2] = -boxHalfArr[i2];
					JNumber3D.copyFromArray(out.rkPnt, rkPntArr);
				}else{
					fLSqr += (rkDirArr[i1] * rkDirArr[i1]);
					fDelta = rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i1] * rkPmEArr[i1] + rkDirArr[i2] * kPpEArr[i2];
					fParam = -fDelta / fLSqr;
					out.rfSqrDistance += (rkPmEArr[i0] * rkPmEArr[i0] + rkPmEArr[i1] * rkPmEArr[i1] + kPpEArr[i2] * kPpEArr[i2] + fDelta * fParam);

					out.pfLParam = fParam;
					rkPntArr[i0] = boxHalfArr[i0];
					rkPntArr[i1] = boxHalfArr[i1];
					rkPntArr[i2] = -boxHalfArr[i2];
					JNumber3D.copyFromArray(out.rkPnt, rkPntArr);
				}
			}
		}else{
			if (rkDirArr[i0] * kPpEArr[i2] >= rkDirArr[i2] * rkPmEArr[i0])
			{
				fLSqr = rkDirArr[i0] * rkDirArr[i0] + rkDirArr[i1] * rkDirArr[i1];
				fTmp = fLSqr * kPpEArr[i2] - rkDirArr[i2] * (rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i1] * kPpEArr[i1]);
				if (fTmp <= 2 * fLSqr * boxHalfArr[i2]){
					fT = fTmp / fLSqr;
					fLSqr += (rkDirArr[i2] * rkDirArr[i2]);
					fTmp = kPpEArr[i2] - fT;
					fDelta = rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i1] * kPpEArr[i1] + rkDirArr[i2] * fTmp;
					fParam = -fDelta / fLSqr;
					out.rfSqrDistance += (rkPmEArr[i0] * rkPmEArr[i0] + kPpEArr[i1] * kPpEArr[i1] + fTmp * fTmp + fDelta * fParam);

					out.pfLParam = fParam;
					rkPntArr[i0] = boxHalfArr[i0];
					rkPntArr[i1] = -boxHalfArr[i1];
					rkPntArr[i2] = fT - boxHalfArr[i2];
					JNumber3D.copyFromArray(out.rkPnt, rkPntArr);
				}else{
					fLSqr += (rkDirArr[i2] * rkDirArr[i2]);
					fDelta = rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i1] * kPpEArr[i1] + rkDirArr[i2] * rkPmEArr[i2];
					fParam = -fDelta / fLSqr;
					out.rfSqrDistance += (rkPmEArr[i0] * rkPmEArr[i0] + kPpEArr[i1] * kPpEArr[i1] + rkPmEArr[i2] * rkPmEArr[i2] + fDelta * fParam);

					out.pfLParam = fParam;
					rkPntArr[i0] = boxHalfArr[i0];
					rkPntArr[i1] = -boxHalfArr[i1];
					rkPntArr[i2] = boxHalfArr[i2];
					JNumber3D.copyFromArray(out.rkPnt, rkPntArr);
				}
			}else{
				fLSqr = rkDirArr[i0] * rkDirArr[i0] + rkDirArr[i2] * rkDirArr[i2];
				fTmp = fLSqr * kPpEArr[i1] - rkDirArr[i1] * (rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i2] * kPpEArr[i2]);
				if (fTmp >= 0){
					if (fTmp <= 2 * fLSqr * boxHalfArr[i1]){
						fT = fTmp / fLSqr;
						fLSqr += (rkDirArr[i1] * rkDirArr[i1]);
						fTmp = kPpEArr[i1] - fT;
						fDelta = rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i1] * fTmp + rkDirArr[i2] * kPpEArr[i2];
						fParam = -fDelta / fLSqr;
						out.rfSqrDistance += (rkPmEArr[i0] * rkPmEArr[i0] + fTmp * fTmp + kPpEArr[i2] * kPpEArr[i2] + fDelta * fParam);

						out.pfLParam = fParam;
						rkPntArr[i0] = boxHalfArr[i0];
						rkPntArr[i1] = fT - boxHalfArr[i1];
						rkPntArr[i2] = -boxHalfArr[i2];
						JNumber3D.copyFromArray(out.rkPnt, rkPntArr);
					}else{
						fLSqr += (rkDirArr[i1] * rkDirArr[i1]);
						fDelta = rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i1] * rkPmEArr[i1] + rkDirArr[i2] * kPpEArr[i2];
						fParam = -fDelta / fLSqr;
						out.rfSqrDistance += (rkPmEArr[i0] * rkPmEArr[i0] + rkPmEArr[i1] * rkPmEArr[i1] + kPpEArr[i2] * kPpEArr[i2] + fDelta * fParam);

						out.pfLParam = fParam;
						rkPntArr[i0] = boxHalfArr[i0];
						rkPntArr[i1] = boxHalfArr[i1];
						rkPntArr[i2] = -boxHalfArr[i2];
						JNumber3D.copyFromArray(out.rkPnt, rkPntArr);
					}
					return;
				}

				fLSqr = rkDirArr[i0] * rkDirArr[i0] + rkDirArr[i1] * rkDirArr[i1];
				fTmp = fLSqr * kPpEArr[i2] - rkDirArr[i2] * (rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i1] * kPpEArr[i1]);
				if (fTmp >= 0){
					if (fTmp <= 2 * fLSqr * boxHalfArr[i2]){
						fT = fTmp / fLSqr;
						fLSqr += (rkDirArr[i2] * rkDirArr[i2]);
						fTmp = kPpEArr[i2] - fT;
						fDelta = rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i1] * kPpEArr[i1] + rkDirArr[i2] * fTmp;
						fParam = -fDelta / fLSqr;
						out.rfSqrDistance += (rkPmEArr[i0] * rkPmEArr[i0] + kPpEArr[i1] * kPpEArr[i1] + fTmp * fTmp + fDelta * fParam);

						out.pfLParam = fParam;
						rkPntArr[i0] = boxHalfArr[i0];
						rkPntArr[i1] = -boxHalfArr[i1];
						rkPntArr[i2] = fT - boxHalfArr[i2];
						JNumber3D.copyFromArray(out.rkPnt, rkPntArr);
					}else{
						fLSqr += (rkDirArr[i2] * rkDirArr[i2]);
						fDelta = rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i1] * kPpEArr[i1] + rkDirArr[i2] * rkPmEArr[i2];
						fParam = -fDelta / fLSqr;
						out.rfSqrDistance += (rkPmEArr[i0] * rkPmEArr[i0] + kPpEArr[i1] * kPpEArr[i1] + rkPmEArr[i2] * rkPmEArr[i2] + fDelta * fParam);

						out.pfLParam = fParam;
						rkPntArr[i0] = boxHalfArr[i0];
						rkPntArr[i1] = -boxHalfArr[i1];
						rkPntArr[i2] = boxHalfArr[i2];
						JNumber3D.copyFromArray(out.rkPnt, rkPntArr);
					}
					return;
				}

				fLSqr += (rkDirArr[i2] * rkDirArr[i2]);
				fDelta = rkDirArr[i0] * rkPmEArr[i0] + rkDirArr[i1] * kPpEArr[i1] + rkDirArr[i2] * kPpEArr[i2];
				fParam = -fDelta / fLSqr;
				out.rfSqrDistance += (rkPmEArr[i0] * rkPmEArr[i0] + kPpEArr[i1] * kPpEArr[i1] + kPpEArr[i2] * kPpEArr[i2] + fDelta * fParam);

				out.pfLParam = fParam;
				rkPntArr[i0] = boxHalfArr[i0];
				rkPntArr[i1] = -boxHalfArr[i1];
				rkPntArr[i2] = -boxHalfArr[i2];
				JNumber3D.copyFromArray(out.rkPnt, rkPntArr);
			}
		}
	};
	
	/**
	 * @function caseNoZeros
	 * @param {object} out
	 * @param {array} rkDir
	 * @param {JBox} rkBox
	 * @type void
	 **/
	JSegment.prototype.caseNoZeros=function(out, rkDir, rkBox){
		var boxHalfSide = rkBox.getHalfSideLengths();
		var kPmE = Vector3DUtil.create(out.rkPnt[0] - boxHalfSide[0], out.rkPnt[1] - boxHalfSide[1], out.rkPnt[2] - boxHalfSide[2], 0);

		var fProdDxPy = rkDir[0] * kPmE[1];
		var fProdDyPx = rkDir[1] * kPmE[0];
		var fProdDzPx;
		var fProdDxPz;
		var fProdDzPy;
		var fProdDyPz;

		if (fProdDyPx >= fProdDxPy){
			fProdDzPx = rkDir[2] * kPmE[0];
			fProdDxPz = rkDir[0] * kPmE[2];
			if (fProdDzPx >= fProdDxPz)
				this.face(out, 0, 1, 2, rkDir, rkBox, kPmE);
			else
				this.face(out, 2, 0, 1, rkDir, rkBox, kPmE);
		}else{
			fProdDzPy = rkDir[2] * kPmE[1];
			fProdDyPz = rkDir[1] * kPmE[2];
			if (fProdDzPy >= fProdDyPz)
				this.face(out, 1, 2, 0, rkDir, rkBox, kPmE);
			else
				this.face(out, 2, 0, 1, rkDir, rkBox, kPmE);
		}
	};

	/**
	 * @function case0
	 * @param {object} out
	 * @param {number} i0
	 * @param {number} i1
	 * @param {number} i2
	 * @param {array} rkDir
	 * @param {JBox} rkBox
	 * @type void
	 **/
	JSegment.prototype.case0=function(out, i0, i1, i2, rkDir, rkBox){
		var boxHalfSide = rkBox.getHalfSideLengths();
		var boxHalfArr = boxHalfSide.slice(0);
		var rkPntArr = out.rkPnt.slice(0);
		var rkDirArr = rkDir.slice(0);
		var fPmE0 = rkPntArr[i0] - boxHalfArr[i0];
		var fPmE1 = rkPntArr[i1] - boxHalfArr[i1];
		var fProd0 = rkDirArr[i1] * fPmE0;
		var fProd1 = rkDirArr[i0] * fPmE1;
		var fDelta;
		var fInvLSqr;
		var fInv;

		if (fProd0 >= fProd1){
			rkPntArr[i0] = boxHalfArr[i0];

			var fPpE1 = rkPntArr[i1] + boxHalfArr[i1];
			fDelta = fProd0 - rkDirArr[i0] * fPpE1;
			if (fDelta >= 0){
				fInvLSqr = 1 / (rkDirArr[i0] * rkDirArr[i0] + rkDirArr[i1] * rkDirArr[i1]);
				out.rfSqrDistance += (fDelta * fDelta * fInvLSqr);

				rkPntArr[i1] = -boxHalfArr[i1];
				out.pfLParam = -(rkDirArr[i0] * fPmE0 + rkDirArr[i1] * fPpE1) * fInvLSqr;
			}else{
				fInv = 1 / rkDirArr[i0];
				rkPntArr[i1] -= (fProd0 * fInv);
				out.pfLParam = -fPmE0 * fInv;
			}
			JNumber3D.copyFromArray(out.rkPnt, rkPntArr);
		}else{
			rkPntArr[i1] = boxHalfArr[i1];

			var fPpE0 = rkPntArr[i0] + boxHalfArr[i0];
			fDelta = fProd1 - rkDirArr[i1] * fPpE0;
			if (fDelta >= 0){
				fInvLSqr = 1 / (rkDirArr[i0] * rkDirArr[i0] + rkDirArr[i1] * rkDirArr[i1]);
				out.rfSqrDistance += (fDelta * fDelta * fInvLSqr);

				rkPntArr[i0] = -boxHalfArr[i0];
				out.pfLParam = -(rkDirArr[i0] * fPpE0 + rkDirArr[i1] * fPmE1) * fInvLSqr;
			}else{
				fInv = 1 / rkDirArr[i1];
				rkPntArr[i0] -= (fProd1 * fInv);
				out.pfLParam = -fPmE1 * fInv;
			}
			JNumber3D.copyFromArray(out.rkPnt, rkPntArr);
		}

		if (rkPntArr[i2] < -boxHalfArr[i2]){
			fDelta = rkPntArr[i2] + boxHalfArr[i2];
			out.rfSqrDistance += (fDelta * fDelta);
			rkPntArr[i2] = -boxHalfArr[i2];
		}else if (rkPntArr[i2] > boxHalfArr[i2]){
			fDelta = rkPntArr[i2] - boxHalfArr[i2];
			out.rfSqrDistance += (fDelta * fDelta);
			rkPntArr[i2] = boxHalfArr[i2];
		}
		JNumber3D.copyFromArray(out.rkPnt, rkPntArr);
	};

	/**
	 * @function case00
	 * @param {object} out
	 * @param {number} i0
	 * @param {number} i1
	 * @param {number} i2
	 * @param {array} rkDir
	 * @param {JBox} rkBox
	 * @type void
	 **/
	JSegment.prototype.case00=function(out, i0, i1, i2, rkDir, rkBox){
		var fDelta = 0;
		var boxHalfSide = rkBox.getHalfSideLengths();
		var boxHalfArr = boxHalfSide.slice(0);
		var rkPntArr = out.rkPnt.slice(0);
		var rkDirArr = rkDir.slice(0);
		out.pfLParam = (boxHalfArr[i0] - rkPntArr[i0]) / rkDirArr[i0];

		rkPntArr[i0] = boxHalfArr[i0];

		if (rkPntArr[i1] < -boxHalfArr[i1]){
			fDelta = rkPntArr[i1] + boxHalfArr[i1];
			out.rfSqrDistance += (fDelta * fDelta);
			rkPntArr[i1] = -boxHalfArr[i1];
		}else if (rkPntArr[i1] > boxHalfArr[i1]) {
			fDelta = rkPntArr[i1] - boxHalfArr[i1];
			out.rfSqrDistance += (fDelta * fDelta);
			rkPntArr[i1] = boxHalfArr[i1];
		}

		if (rkPntArr[i2] < -boxHalfArr[i2]){
			fDelta = rkPntArr[i2] + boxHalfArr[i2];
			out.rfSqrDistance += (fDelta * fDelta);
			rkPntArr[i2] = -boxHalfArr[i2];
		}else if (rkPntArr[i2] > boxHalfArr[i2]){
			fDelta = rkPntArr[i2] - boxHalfArr[i2];
			out.rfSqrDistance += (fDelta * fDelta);
			rkPntArr[i2] = boxHalfArr[i2];
		}

		JNumber3D.copyFromArray(out.rkPnt, rkPntArr);
	};

	/**
	 * @function case000
	 * @param {object} out
	 * @param {JBox} rkBox
	 * @type void
	 **/
	JSegment.prototype.case000=function(out, rkBox){
		var fDelta = 0;
		var boxHalfSide = rkBox.getHalfSideLengths();

		if (out.rkPnt[0] < -boxHalfSide[0]){
			fDelta = out.rkPnt[0] + boxHalfSide[0];
			out.rfSqrDistance += (fDelta * fDelta);
			out.rkPnt[0] = -boxHalfSide[0];
		}else if (out.rkPnt[0] > boxHalfSide[0]){
			fDelta = out.rkPnt[0] - boxHalfSide[0];
			out.rfSqrDistance += (fDelta * fDelta);
			out.rkPnt[0] = boxHalfSide[0];
		}

		if (out.rkPnt[1] < -boxHalfSide[1]){
			fDelta = out.rkPnt[1] + boxHalfSide[1];
			out.rfSqrDistance += (fDelta * fDelta);
			out.rkPnt[1] = -boxHalfSide[1];
		}else if (out.rkPnt[1] > boxHalfSide[1]){
			fDelta = out.rkPnt[1] - boxHalfSide[1];
			out.rfSqrDistance += (fDelta * fDelta);
			out.rkPnt[1] = boxHalfSide[1];
		}

		if (out.rkPnt[2] < -boxHalfSide[2]){
			fDelta = out.rkPnt[2] + boxHalfSide[2];
			out.rfSqrDistance += (fDelta * fDelta);
			out.rkPnt[2] = -boxHalfSide[2];
		}else if (out.rkPnt[2] > boxHalfSide[2]){
			fDelta = out.rkPnt[2] - boxHalfSide[2];
			out.rfSqrDistance += (fDelta * fDelta);
			out.rkPnt[2] = boxHalfSide[2];
		}
	};
	
	jigLib.JSegment=JSegment;
	
 })(jigLib);
