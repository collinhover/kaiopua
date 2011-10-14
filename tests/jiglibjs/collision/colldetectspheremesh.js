(function(jigLib){
	var Vector3DUtil=jigLib.Vector3DUtil;
	var JConfig=jigLib.JConfig;
	var JIndexedTriangle=jigLib.JIndexedTriangle;
	var JSphere=jigLib.JSphere;
	var JTriangle=jigLib.JTriangle;
	var JTriangleMesh=jigLib.JTriangleMesh;
	var JNumber3D=jigLib.JNumber3D;
	var MaterialProperties=jigLib.MaterialProperties;
	var RigidBody=jigLib.RigidBody;
	var CollPointInfo=jigLib.CollPointInfo;
	

        var CollDetectSphereMesh=function() {
		this.name = "SphereMesh";
		this.type0 = "SPHERE";
		this.type1 = "TRIANGLEMESH";
	}	
	
	jigLib.extend(CollDetectSphereMesh,jigLib.CollDetectFunctor);
	
	
	CollDetectSphereMesh.prototype.collDetectSphereStaticMeshOverlap=function(sphere, mesh, info, collTolerance, collArr){
		var body0Pos = info.body0.get_oldState().position;
		var body1Pos = info.body1.get_oldState().position;

		var sphereTolR = collTolerance + sphere.get_radius();
		var sphereTolR2 = sphereTolR * sphereTolR;
                        
		var collNormal = [0,0,0];
		var collPts = []
                        
		var potentialTriangles = [];
		var numTriangles = mesh.get_octree().getTrianglesIntersectingtAABox(potentialTriangles, sphere.get_boundingBox());
		if(!numTriangles) return;
		
		var newD2,distToCentre,oldD2,dist,depth,tiny=JNumber3D.NUM_TINY;
		var meshTriangle;
		var vertexIndices;
		var arr;
		var triangle;
		for (var iTriangle = 0 ; iTriangle < numTriangles ; ++iTriangle) {
			meshTriangle = mesh.get_octree().getTriangle(potentialTriangles[iTriangle]);
			distToCentre = meshTriangle.get_plane().pointPlaneDistance(sphere.get_currentState().position);

			if (distToCentre <= 0) continue;
			if (distToCentre >= sphereTolR) continue;
                                
			vertexIndices = meshTriangle.get_vertexIndices();
			triangle = new JTriangle(mesh.get_octree().getVertex(vertexIndices[0]), mesh.get_octree().getVertex(vertexIndices[1]), mesh.get_octree().getVertex(vertexIndices[2]));
			arr = [];
			newD2 = triangle.pointTriangleDistanceSq(arr, sphere.get_currentState().position);
                                
			if (newD2 < sphereTolR2) {
				// have overlap - but actually report the old intersection
				oldD2 = triangle.pointTriangleDistanceSq(arr, sphere.get_oldState().position);
				dist = Math.sqrt(oldD2);
				
				depth = sphere.get_radius() - dist;
				var collisionN = (dist > tiny) ? (Vector3DUtil.subtract(sphere.get_oldState().position,triangle.getPoint(arr[0], arr[1]))) : triangle.get_normal().slice(0);
				Vector3DUtil.normalize(collisionN);
				// since impulse get applied at the old position
				var pt = Vector3DUtil.subtract(sphere.get_oldState().position,JNumber3D.getScaleVector(collisionN, sphere.get_radius()));
                                        
				var cpInfo = new CollPointInfo();
				cpInfo.r0 = Vector3DUtil.subtract(pt,body0Pos);
				cpInfo.r1 = Vector3DUtil.subtract(pt,body1Pos);
				cpInfo.initialPenetration = depth;
				collPts.push(cpInfo);
				collNormal = Vector3DUtil.add(collNormal,collisionN);
				Vector3DUtil.normalize(collNormal);
			}
		}
		var collInfo = new jigLib.CollisionInfo();
		collInfo.objInfo = info;
		collInfo.dirToBody = collNormal;
		collInfo.pointInfo = collPts;
                        
		var mat = new MaterialProperties();
		mat.set_restitution(0.5*(sphere.get_material().get_restitution() + mesh.get_material().get_restitution()));
		mat.set_friction(0.5*(sphere.get_material().get_friction() + mesh.get_material().get_friction()));
		collInfo.mat = mat;
		collArr.push(collInfo);
		info.body0.collisions.push(collInfo);
		info.body1.collisions.push(collInfo);
	};
	
	
	CollDetectSphereMesh.prototype.collDetect=function(info, collArr){
		var tempBody;
		if (info.body0._type == "TRIANGLEMESH"){
			tempBody = info.body0;
			info.body0 = info.body1;
			info.body1 = tempBody;
		}
                        
		var sphere = info.body0;
		var mesh = info.body1;
                        
		this.collDetectSphereStaticMeshOverlap(sphere, mesh, info, JConfig.collToll, collArr);
	}
	
	jigLib.CollDetectSphereMesh=CollDetectSphereMesh;

})(jigLib);	
	