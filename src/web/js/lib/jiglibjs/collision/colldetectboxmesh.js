(function(jigLib){
	var Vector3DUtil=jigLib.Vector3DUtil;
	var JNumber3D=jigLib.JNumber3D;
	var JConstraint=jigLib.JConstraint;
	var JConfig=jigLib.JConfig;
	var JSphere=jigLib.JSphere;
	var MaterialProperties=jigLib.MaterialProperties;
	var RigidBody=jigLib.RigidBody;
	var CollPointInfo=jigLib.CollPointInfo;
	var CollisionInfo=jigLib.CollisionInfo;
	var JBox=jigLib.JBox;
	var JIndexedTriangle=jigLib.JIndexedTriangle;
	var JSegment=jigLib.JSegment;
	var JTriangle=jigLib.JTriangle;
	var JTriangleMesh=jigLib.JTriangleMesh;
	var CollOutData=jigLib.CollOutData;
	var EdgeData=jigLib.EdgeData;
	var SpanData=jigLib.SpanDatadot
	;
	var SpanData=jigLib.SpanData;

	var CollDetectBoxMesh=function(){
		this.name = "BoxMesh";
		this.type0 = "BOX";
		this.type1 = "TRIANGLEMESH";
	};
	jigLib.extend(CollDetectBoxMesh,jigLib.CollDetectFunctor);
        
	CollDetectBoxMesh.prototype.disjoint=function(out, axis, box, triangle){
		var obj0 = box.getSpan(axis);
		var obj1 = triangle.getSpan(axis);
		var obj0Min=obj0.min,obj0Max=obj0.max,obj1Min=obj1.min,obj1Max=obj1.max,tiny=JNumber3D.NUM_TINY;
		
		
		if (obj0Min > (obj1Max + JConfig.collToll + tiny) || obj1Min > (obj0Max + JConfig.collToll + tiny)){
			out.flag = true;
			return true;
		}
		if ((obj0Max > obj1Max) && (obj1Min > obj0Min)){
			out.depth = Math.min(obj0Max - obj1Min, obj1Max - obj0Min);
		}else if ((obj1Max > obj0Max) && (obj0Min > obj1Min)){
			out.depth = Math.min(obj1Max - obj0Min, obj0Max - obj1Min);
		}else{
			out.depth = Math.min(obj0Max, obj1Max);
			out.depth -= Math.max(obj0Min, obj1Min);
		}
		out.flag = false;
		return false;
	};
	
                
	CollDetectBoxMesh.prototype.addPoint=function(contactPoints, pt, combinationDistanceSq){
		for(var i=0; i<contactPoints.length;i++){
			var contactPoint=contactPoints[i];
			if (Vector3DUtil.get_lengthSquared(Vector3DUtil.subtract(contactPoint,pt))< combinationDistanceSq){
				contactPoint = Vector3DUtil.add(contactPoint,pt);
				Vector3DUtil.scaleBy(contactPoint,0.5);
				return false;
			}
		}
		contactPoints.push(pt);
		return true;
	};
	
	
	CollDetectBoxMesh.prototype.getBoxTriangleIntersectionPoints=function(pts,box,triangle,combinationDistanceSq){
		var edges=box.get_edges();
		var boxPts=box.getCornerPoints(box.get_currentState());
                        
		var data;
		var edge;
		var seg;
		for(var i=0;i<12;i++){
			edge=edges[i];
			data=new CollOutData();
			seg=new JSegment(boxPts[edge.ind0],Vector3DUtil.subtract(boxPts[edge.ind1],boxPts[edge.ind0]));
			if(triangle.segmentTriangleIntersection(data,seg)){
				this.addPoint(pts,seg.getPoint(data.frac),combinationDistanceSq);
				if(pts.length>8) return pts.length;
			}
		}
                        
		var pt0,pt1;
		for(i=0;i<3;i++){
			pt0=triangle.getVertex(i);
			pt1=triangle.getVertex((i+1)%3);
			data=new CollOutData();
			if(box.segmentIntersect(data,new JSegment(pt0,Vector3DUtil.subtract(pt1,pt0)),box.get_currentState())){
				this.addPoint(pts,data.position,combinationDistanceSq);
				if(pts.length>8) return pts.length;
			}
			if(box.segmentIntersect(data,new JSegment(pt1,Vector3DUtil.subtract(pt0,pt1)),box.get_currentState())){
				this.addPoint(pts,data.position,combinationDistanceSq);
				if(pts.length>8) return pts.length;
			}
		}
		return pts.length;
	};
	
	
                
	CollDetectBoxMesh.prototype.doOverlapBoxTriangleTest=function(box,triangle,mesh,info,collArr){
                        
		var triEdge0,triEdge1,triEdge2,triNormal,D,N,boxOldPos,boxNewPos,meshPos,delta;
		var dirs0=box.get_currentState().getOrientationCols();
		var tri=new JTriangle(mesh.get_octree().getVertex(triangle.getVertexIndex(0)),mesh.get_octree().getVertex(triangle.getVertexIndex(1)),mesh.get_octree().getVertex(triangle.getVertexIndex(2)));
		triEdge0=Vector3DUtil.subtract(tri.getVertex(1),tri.getVertex(0));
		Vector3DUtil.normalize(triEdge0);
		triEdge1=Vector3DUtil.subtract(tri.getVertex(2),tri.getVertex(1));
		Vector3DUtil.normalize(triEdge1);
		triEdge2=Vector3DUtil.subtract(tri.getVertex(0),tri.getVertex(2));
		Vector3DUtil.normalize(triEdge2);
		var triNormal=triangle.get_plane().normal.slice(0);
                        
		var numAxes=13;
		var axes = [triNormal,dirs0[0],dirs0[1],dirs0[2],
					Vector3DUtil.crossProduct(dirs0[0],triEdge0),
					Vector3DUtil.crossProduct(dirs0[0],triEdge1),
					Vector3DUtil.crossProduct(dirs0[0],triEdge2),
					Vector3DUtil.crossProduct(dirs0[1],triEdge0),
					Vector3DUtil.crossProduct(dirs0[1],triEdge1),
					Vector3DUtil.crossProduct(dirs0[1],triEdge2),
					Vector3DUtil.crossProduct(dirs0[2],triEdge0),
					Vector3DUtil.crossProduct(dirs0[2],triEdge1),
					Vector3DUtil.crossProduct(dirs0[2],triEdge2)];
                        
		var overlapDepths=[];
		for(var i=0;i<numAxes;i++){
			overlapDepths[i]=new SpanData();
			if(this.disjoint(overlapDepths[i],axes[i],box,tri)){
				return false;
			}
		}
                        
		var minAxis=-1;
		var tiny=JNumber3D.NUM_TINY,minDepth=JNumber3D.NUM_HUGE,l2,invl,depth,combinationDist,oldDepth;

		for(i = 0; i < numAxes; i++){
			l2=Vector3DUtil.get_lengthSquared(axes[i]);
			if (l2 < tiny){
				continue;
			}
                                
			invl=1/Math.sqrt(l2);
			Vector3DUtil.scaleBy(axes[i],invl);
			overlapDepths[i].depth*=invl;
                                
			if (overlapDepths[i].depth < minDepth){
				minDepth = overlapDepths[i].depth;
				minAxis=i;
			}
		}
                        
		if (minAxis == -1) return false;
                        
		D=Vector3DUtil.subtract(box.get_currentState().position,tri.getCentre());
		N=axes[minAxis];
		depth=overlapDepths[minAxis].depth;
                        
		if(Vector3DUtil.dotProduct(D,N)<0){
			Vector3DUtil.negate(N);
		}
                        
		boxOldPos=box.get_oldState().position;
		boxNewPos=box.get_currentState().position;
		meshPos=mesh.get_currentState().position;
                        
		var pts=[];
		combinationDist=depth+0.05;
		this.getBoxTriangleIntersectionPoints(pts,box,tri,combinationDist*combinationDist);
                        
		delta=Vector3DUtil.subtract(boxNewPos,boxOldPos);
		oldDepth=depth+Vector3DUtil.dotProduct(delta,N);

		var numPts=pts.length;
		var collPts = [];
		if(numPts>0){
			var cpInfo;
			for (i=0; i<numPts; i++){
				cpInfo = new CollPointInfo();
				cpInfo.r0=Vector3DUtil.subtract(pts[i],boxNewPos);
				cpInfo.r1=Vector3DUtil.subtract(pts[i],meshPos);
				cpInfo.initialPenetration=oldDepth;
				collPts[i]=cpInfo;
			}
                                
			var collInfo = new CollisionInfo();
			collInfo.objInfo = info;
			collInfo.dirToBody = N;
			collInfo.pointInfo = collPts;
			
			var mat = new MaterialProperties();
			mat.set_restitution(0.5*(box.get_material().get_restitution() + mesh.get_material().get_restitution()));
			mat.set_friction(0.5*(box.get_material().get_friction() + mesh.get_material().get_friction()));
			collInfo.mat = mat;
			collArr.push(collInfo);
			info.body0.collisions.push(collInfo);
			info.body1.collisions.push(collInfo);
                                
			return true;
		}else{
			return false;
		}
	};
	
	
	 CollDetectBoxMesh.prototype.collDetectBoxStaticMeshOverlap=function(box,mesh,info,collArr){
		var boxRadius=box.get_boundingSphere();
		var boxCentre=box.get_currentState().position;
                        
		var potentialTriangles = [];
		var numTriangles=mesh.get_octree().getTrianglesIntersectingtAABox(potentialTriangles,box.get_boundingBox());
                        
		var collision=false;
		var dist;
		var meshTriangle;
		for (var iTriangle = 0 ; iTriangle < numTriangles ; ++iTriangle) {
			meshTriangle=mesh.get_octree().getTriangle(potentialTriangles[iTriangle]);
                                
			dist=meshTriangle.get_plane().pointPlaneDistance(boxCentre);
			if (dist > boxRadius || dist < 0){
				continue;
			}
                                
			if(this.doOverlapBoxTriangleTest(box,meshTriangle,mesh,info,collArr)){
				collision = true;
			}
		}
                        
		return collision;
	};
	

	CollDetectBoxMesh.prototype.collDetect=function(info, collArr){
		var tempBody;
		if (info.body0.type == "TRIANGLEMESH"){
			tempBody = info.body0;
			info.body0 = info.body1;
			info.body1 = tempBody;
		}
		var box = info.body0;
		var mesh = info.body1;
                        
		this.collDetectBoxStaticMeshOverlap(box,mesh,info,collArr);
	};
	
	jigLib.CollDetectBoxMesh=CollDetectBoxMesh;

})(jigLib);

                
                
                
                
