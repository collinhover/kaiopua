(function(jigLib){
	var Vector3DUtil=jigLib.Vector3DUtil;
	var CollOutBodyData=jigLib.CollOutBodyData;
	var JSegment=jigLib.JSegment;
	var JNumber3D=jigLib.JNumber3D;
	var RigidBody=jigLib.RigidBody;
	var CollDetectInfo=jigLib.CollDetectInfo;
	

	var CollisionSystemAbstract=function(){
		this.collBody = [];
		this.detectionFunctors = {};
		this.detectionFunctors["BOX_BOX"] = new jigLib.CollDetectBoxBox();
		this.detectionFunctors["BOX_SPHERE"] = new jigLib.CollDetectSphereBox();
		this.detectionFunctors["BOX_CAPSULE"] = new jigLib.CollDetectCapsuleBox();
		this.detectionFunctors["BOX_PLANE"] = new jigLib.CollDetectBoxPlane();
		this.detectionFunctors["BOX_TERRAIN"] = new jigLib.CollDetectBoxTerrain();
		this.detectionFunctors["BOX_TRIANGLEMESH"] = new jigLib.CollDetectBoxMesh();
		this.detectionFunctors["SPHERE_BOX"] = new jigLib.CollDetectSphereBox();
		this.detectionFunctors["SPHERE_SPHERE"] = new jigLib.CollDetectSphereSphere();
		this.detectionFunctors["SPHERE_CAPSULE"] = new jigLib.CollDetectSphereCapsule();
		this.detectionFunctors["SPHERE_PLANE"] = new jigLib.CollDetectSpherePlane();
		this.detectionFunctors["SPHERE_TERRAIN"] = new jigLib.CollDetectSphereTerrain();
		this.detectionFunctors["SPHERE_TRIANGLEMESH"] = new jigLib.CollDetectSphereMesh();
		this.detectionFunctors["CAPSULE_CAPSULE"] = new jigLib.CollDetectCapsuleCapsule();
		this.detectionFunctors["CAPSULE_BOX"] = new jigLib.CollDetectCapsuleBox();
		this.detectionFunctors["CAPSULE_SPHERE"] = new jigLib.CollDetectSphereCapsule();
		this.detectionFunctors["CAPSULE_PLANE"] = new jigLib.CollDetectCapsulePlane();
		this.detectionFunctors["CAPSULE_TERRAIN"] = new jigLib.CollDetectCapsuleTerrain();
		this.detectionFunctors["PLANE_BOX"] = new jigLib.CollDetectBoxPlane();
		this.detectionFunctors["PLANE_SPHERE"] = new jigLib.CollDetectSpherePlane();
		this.detectionFunctors["PLANE_CAPSULE"] = new jigLib.CollDetectCapsulePlane();
		this.detectionFunctors["TERRAIN_SPHERE"] = new jigLib.CollDetectSphereTerrain();
		this.detectionFunctors["TERRAIN_BOX"] = new jigLib.CollDetectBoxTerrain();
		this.detectionFunctors["TERRAIN_CAPSULE"] = new jigLib.CollDetectCapsuleTerrain();
		this.detectionFunctors["TRIANGLEMESH_SPHERE"] = new jigLib.CollDetectSphereMesh();
		this.detectionFunctors["TRIANGLEMESH_BOX"] = new jigLib.CollDetectBoxMesh();
	};
	CollisionSystemAbstract.prototype.detectionFunctors={};
    CollisionSystemAbstract.prototype.collBody=null;
	CollisionSystemAbstract.prototype._numCollisionsChecks = 0;

    CollisionSystemAbstract.prototype.addCollisionBody=function(body){
		if (!this.findBody(body)) this.collBody.push(body);
		
	};
                
    CollisionSystemAbstract.prototype.removeCollisionBody=function(body){
		if (this.findBody(body))  this.collBody.splice(this.collBody.indexOf(body), 1);
	};

    CollisionSystemAbstract.prototype.removeAllCollisionBodies=function(){
		this.collBody=[];
	};
	
	
	// Detects collisions between the body and all the registered collision bodies
    CollisionSystemAbstract.prototype.detectCollisions=function(body, collArr){
		if (!body.isActive) return;
                        
		var info;
		var fu;
		for(var j=0;j<this.collBody.length;j++){
			var _collBody=this.collBody[j];
			if (body == _collBody){
				continue;
			}
			if (this.checkCollidables(body, _collBody) && this.detectionFunctors[body.get_type() + "_" + _collBody.get_type()] != undefined){
				info = new CollDetectInfo();
				info.body0 = body;
				info.body1 = _collBody;
				fu = this.detectionFunctors[info.body0.get_type() + "_" + info.body1.get_type()];
				fu.collDetect(info, collArr);
			}
		}
	};
                
	// Detects collisions between the all bodies
    CollisionSystemAbstract.prototype.detectAllCollisions=function(bodies, collArr){
	};

	CollisionSystemAbstract.prototype.collisionSkinMoved=function(colBody){
		// used for grid
	};
	
	
	CollisionSystemAbstract.prototype.segmentIntersect=function(out, seg, ownerBody){
		out.frac = JNumber3D.NUM_HUGE;
		out.position = [];
		out.normal = [];
		var obj = new CollOutBodyData();
		
		for(j=0;j<this.collBody.length;j++){
			var _collBody=this.collBody[j];
			if (_collBody != ownerBody && this.segmentBounding(seg, _collBody)){
				if (_collBody.segmentIntersect(obj, seg, _collBody.get_currentState())){
					if (obj.frac < out.frac){
						out.position = obj.position;
						out.normal = obj.normal;
						out.frac = obj.frac;
						out.rigidBody = _collBody;
					}
				}
			}
		}
                        
		if (out.frac > 1) return false;
                        
		if (out.frac < 0){
			out.frac = 0;
		}else if (out.frac > 1) {
			out.frac = 1;
		}
                        
		return true;
	};
	
	
	CollisionSystemAbstract.prototype.segmentBounding=function(seg, obj){
		var pos = seg.getPoint(0.5);
		var r = Vector3DUtil.get_length(seg.delta) / 2;

		if (obj.get_type() != "PLANE" && obj.get_type() != "TERRAIN" && obj.get_type() != "TRIANGLEMESH"){
			var num1 = Vector3DUtil.get_length(Vector3DUtil.subtract(pos, obj.get_currentState().position));
			var num2 = r + obj.get_boundingSphere();
			if (num1 <= num2){
				return true;
			}else{
				return false;
			}
		}else{
			return true;
		}
	};
	
	/*CollisionSystemAbstract.prototype.segmentBounding=function(seg, obj){
		var pos = seg.getPoint(0.5);
		var r = Vector3DUtil.get_length(seg.delta) / 2;
                        
		var num1 = Vector3DUtil.get_length(Vector3DUtil.subtract(pos,obj.get_currentState().position));
		var num2 = r + obj.get_boundingSphere();
                        
		if (num1 <= num2) return true;
                        else return false;
	};*/

	CollisionSystemAbstract.prototype.get_numCollisionsChecks=function(){
		return this._numCollisionsChecks;    
	};
	
	CollisionSystemAbstract.prototype.findBody=function(body){
		return this.collBody.indexOf(body) > -1;
	};
                
	CollisionSystemAbstract.prototype.checkCollidables=function(body0, body1){
		if (body0.get_nonCollidables().length == 0 && body1.get_nonCollidables().length == 0) return true;
                        
		if(body0.get_nonCollidables().indexOf(body1) > -1) return false;
                        
		if(body1.get_nonCollidables().indexOf(body0) > -1) return false;
                        
		return true;
	}
	
	jigLib.CollisionSystemAbstract=CollisionSystemAbstract;

})(jigLib);	