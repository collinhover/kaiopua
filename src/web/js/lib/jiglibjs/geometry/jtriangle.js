(function(jigLib){
	var Vector3DUtil=jigLib.Vector3DUtil;
	var JNumber3D=jigLib.JNumber3D;
	var CollOutData=jigLib.CollOutData;
	var PlaneData=jigLib.PlaneData;
	var SpanData=jigLib.SpanData;
	
	// Defines a 3d triangle. Each edge goes from the origin. Cross(edge0, edge1)  gives the triangle normal.
	
	// Points specified so that pt1-pt0 is edge0 and p2-pt0 is edge1
	var JTriangle=function(pt0, pt1, pt2){
		this.origin = pt0.slice(0);
		this.edge0 = Vector3DUtil.subtract(pt1,pt0);
		this.edge1 = Vector3DUtil.subtract(pt2,pt0);
	};
	
                
	// Edge2 goes from pt1 to pt2
	JTriangle.prototype.get_edge2=function() {
		return Vector3DUtil.subtract(this.edge1,this.edge0);
	};
                
	// Gets the triangle normal.
	JTriangle.prototype.get_normal=function(){
		var N = Vector3DUtil.crossProduct(this.edge0,this.edge1);
		Vector3DUtil.normalize(N);
                        
		return N;
	};
                
	// Gets the plane containing the triangle
	JTriangle.prototype.get_plane=function(){
		var pl = new PlaneData();
		pl.setWithNormal(this.origin, this.get_normal());
                        
		return pl;
	};
                
	// Returns the point parameterised by t0 and t1
	JTriangle.prototype.getPoint=function(t0, t1) {
		var d0,d1;
		d0 = this.edge0.slice(0);
		d1 = this.edge1.slice(0);
                        
		Vector3DUtil.scaleBy(d0,t0);
		Vector3DUtil.scaleBy(d1,t1);
                        
		return Vector3DUtil.add(Vector3DUtil.add(this.origin,d0),d1);
	};
	
	
	JTriangle.prototype.getCentre=function() {
		var result = Vector3DUtil.add(this.edge0,this.edge1);
		Vector3DUtil.scaleBy(result,0.333333);
                        
		return Vector3DUtil.add(this.origin,result);
	};
                
	// Same numbering as in the constructor
	JTriangle.prototype.getVertex=function(_id){
		switch(_id) {
			case 1: 
				return Vector3DUtil.add(this.origin,this.edge0);
			case 2:
				return Vector3DUtil.add(this.origin,this.edge1);
			default:
				return this.origin;
		}
	};
	
	JTriangle.prototype.getSpan=function(axis) {
		var d0,d1,d2;
		d0 = Vector3DUtil.dotProduct(this.getVertex(0),axis);
		d1 = Vector3DUtil.dotProduct(this.getVertex(1),axis);
		d2 = Vector3DUtil.dotProduct(this.getVertex(2),axis);
                        
		var result = new SpanData();
		result.min = Math.min(d0, d1, d2);
		result.max = Math.max(d0, d1, d2);
                        
		return result;
	};
	
	
	JTriangle.prototype.segmentTriangleIntersection=function(out, seg){
                        
		var u,v,t,a,f;
		var p,s,q;
                        
		p = Vector3DUtil.crossProduct(seg.delta,this.edge1);
		a =Vector3DUtil.dotProduct(this.edge0,p);
                        
		if (a > -JNumber3D.NUM_TINY && a < JNumber3D.NUM_TINY) {
			return false;
		}
		
		f = 1 / a;
		s = Vector3DUtil.subtract(seg.origin,this.origin);
		u = f * Vector3DUtil.dotProduct(s,p);
                        
		if (u < 0 || u > 1) return false;
                        
		q = Vector3DUtil.crossProduct(s,this.edge0);
		v = f * Vector3DUtil.dotProduct(seg.delta,q);
		if (v < 0 || (u + v) > 1) return false;
                        
		t = f * Vector3DUtil.dotProduct(this.edge1,q);
		if (t < 0 || t > 1) return false;
                        
		if (out) out.frac = t;
		return true;
	}
	
	
	JTriangle.prototype.pointTriangleDistanceSq=function(out, point){
                        
		var fA00,fA01,fA11,fB0,fB1,fC,fDet,fS,fT,fSqrDist;
                        
		var kDiff = Vector3DUtil.subtract(this.origin,point);
                    fA00 = Vector3DUtil.get_lengthSquared(this.edge0);
                    fA01 = Vector3DUtil.dotProduct(this.edge0,this.edge1);
                    fA11 = Vector3DUtil.get_lengthSquared(this.edge1);
                    fB0 = Vector3DUtil.dotProduct(kDiff,this.edge0);
                    fB1 = Vector3DUtil.dotProduct(kDiff,this.edge1);
                    fC = Vector3DUtil.get_lengthSquared(kDiff);
                    fDet = Math.abs(fA00 * fA11 - fA01 * fA01);
                    fS = fA01 * fB1 - fA11 * fB0;
                    fT = fA01 * fB0 - fA00 * fB1;
                        
                  if ( fS + fT <= fDet ){
                        if ( fS < 0 ){
                          if ( fT < 0 ){  // region 4
                                if ( fB0 < 0 ){
                                  fT = 0;
                                  if ( -fB0 >= fA00 ){
                                        fS = 1;
                                        fSqrDist = fA00+2*fB0+fC;
                                  }else{
                                        fS = -fB0/fA00;
                                        fSqrDist = fB0*fS+fC;
                                  }
                                }else{
                                  fS = 0;
                                  if ( fB1 >= 0 ){
                                        fT = 0;
                                        fSqrDist = fC;
                                  }else if ( -fB1 >= fA11 ){
                                        fT = 1;
                                        fSqrDist = fA11+2*fB1+fC;
                                  }else{
                                        fT = -fB1/fA11;
                                        fSqrDist = fB1*fT+fC;
                                  }
                                }
                          }else{  // region 3
                                fS = 0;
                                if ( fB1 >= 0 ){
                                  fT = 0;
                                  fSqrDist = fC;
                                }else if ( -fB1 >= fA11 ){
                                  fT = 1;
                                  fSqrDist = fA11+2*fB1+fC;
                                }else{
                                  fT = -fB1/fA11;
                                  fSqrDist = fB1*fT+fC;
                                }
                          }
                        }else if ( fT < 0 ){  // region 5
                          fT = 0;
                          if ( fB0 >= 0 ){
                                fS = 0;
                                fSqrDist = fC;
                          }else if ( -fB0 >= fA00 ){
                                fS = 1;
                                fSqrDist = fA00+2*fB0+fC;
                          }else{
                                fS = -fB0/fA00;
                                fSqrDist = fB0*fS+fC;
                          }
                        }else{  // region 0
                          // minimum at interior point
                          var fInvDet = 1/fDet;
                          fS *= fInvDet;
                          fT *= fInvDet;
                          fSqrDist = fS * (fA00 * fS + fA01 * fT + 2 * fB0) +fT * (fA01 * fS + fA11 * fT + 2 * fB1) + fC;
                        }
                  }else{
                        var fTmp0,fTmp1,fNumer,fDenom;

                        if ( fS < 0 ){  // region 2
                          fTmp0 = fA01 + fB0;
                          fTmp1 = fA11 + fB1;
                          if ( fTmp1 > fTmp0 ){
                                fNumer = fTmp1 - fTmp0;
                                fDenom = fA00-2*fA01+fA11;
                                if ( fNumer >= fDenom ){
                                  fS = 1;
                                  fT = 0;
                                  fSqrDist = fA00+2*fB0+fC;
                                }else{
                                  fS = fNumer/fDenom;
                                  fT = 1 - fS;
                                  fSqrDist = fS * (fA00 * fS + fA01 * fT + 2 * fB0) +fT * (fA01 * fS + fA11 * fT + 2 * fB1) + fC;
                                }
                          }else{
                                fS = 0;
                                if ( fTmp1 <= 0 ){
                                  fT = 1;
                                  fSqrDist = fA11+2*fB1+fC;
                                }else if ( fB1 >= 0 ){
                                  fT = 0;
                                  fSqrDist = fC;
                                }else {
                                  fT = -fB1/fA11;
                                  fSqrDist = fB1*fT+fC;
                                }
                          }
                        }else if ( fT < 0 ) { // region 6
                          fTmp0 = fA01 + fB1;
                          fTmp1 = fA00 + fB0;
                          if ( fTmp1 > fTmp0 ){
                                fNumer = fTmp1 - fTmp0;
                                fDenom = fA00-2*fA01+fA11;
                                if ( fNumer >= fDenom ){
                                  fT = 1;
                                  fS = 0;
                                  fSqrDist = fA11+2*fB1+fC;
                                }else{
                                  fT = fNumer/fDenom;
                                  fS = 1 - fT;
                                  fSqrDist = fS * (fA00 * fS + fA01 * fT + 2 * fB0) +fT * (fA01 * fS + fA11 * fT + 2 * fB1) + fC;
                                }
                          }else{
                                fT = 0;
                                if ( fTmp1 <= 0 ){
                                  fS = 1;
                                  fSqrDist = fA00+2*fB0+fC;
                                }else if ( fB0 >= 0 ){
                                  fS = 0;
                                  fSqrDist = fC;
                                }else{
                                  fS = -fB0/fA00;
                                  fSqrDist = fB0*fS+fC;
                                }
                          }
                        }else{  // region 1
                          fNumer = fA11 + fB1 - fA01 - fB0;
                          if ( fNumer <= 0 ){
                                fS = 0;
                                fT = 1;
                                fSqrDist = fA11+2*fB1+fC;
                          }else{
                                fDenom = fA00-2*fA01+fA11;
                                if ( fNumer >= fDenom ){
                                  fS = 1;
                                  fT = 0;
                                  fSqrDist = fA00 + 2 * fB0 + fC;
                                }else{
                                  fS = fNumer/fDenom;
                                  fT = 1 - fS;
                                  fSqrDist = fS * (fA00 * fS + fA01 * fT + 2 * fB0) +fT * (fA01 * fS + fA11 * fT + 2 * fB1) + fC;
                                }
                          }
                        }
                  }
                  out[0] = fS;
                  out[1] = fT;
                 
                  return Math.abs(fSqrDist);
                }
	
	
	jigLib.JTriangle=JTriangle;

})(jigLib);	