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
	var JConfig=jigLib.JConfig;
	var MaterialProperties=jigLib.MaterialProperties;
	var CollPointInfo=jigLib.CollPointInfo;
	var CollisionInfo=jigLib.CollisionInfo;

	/**
	 * @author Muzer(muzerly@gmail.com)
	 * 
	 * @name CollDetectSphereBox
	 * @class CollDetectSphereBox handles collisions between spheres and boxes
	 * @extends CollDetectFunctor
	 * @requires CollDetectInfo
	 * @requires CollPointInfo
	 * @requires CollisionInfo
	 * @requires Vector3DUtil
	 * @requires JNumber3D
	 * @requires JConfig
	 * @requires MaterialProperties
	 * @constructor
	 **/
	var CollDetectSphereBox=function(){
		this.name = "SphereBox";
		this.type0 = "SPHERE";
		this.type1 = "BOX";
	};
	jigLib.extend(CollDetectSphereBox,jigLib.CollDetectFunctor);
	
				
	/**
	 * @function collDetect detects a collision and updates the info parameter
	 * @param {CollDetectInfo} info
	 * @param {array} collArray
	 * @type void
	 **/
	CollDetectSphereBox.prototype.collDetect=function(info, collArr){
		var tempBody;
		if(info.body0.get_type()=="BOX") {
			tempBody=info.body0;
			info.body0=info.body1;
			info.body1=tempBody;
		}
						
		var sphere = info.body0;
		var box = info.body1;		
		if (!sphere.hitTestObject3D(box)) 
			return;

		if (JConfig.aabbDetection && !sphere.get_boundingBox().overlapTest(box.get_boundingBox())) 
			return;
		
		//var spherePos:Vector3D = sphere.get_oldState().position;
		//var boxPos:Vector3D = box.get_oldState().position;

		var oldBoxPoint={};
		var newBoxPoint={};
						
		var oldDist = box.getDistanceToPoint(box.get_oldState(), oldBoxPoint, sphere.get_oldState().position);
		var newDist = box.getDistanceToPoint(box.get_currentState(), newBoxPoint, sphere.get_currentState().position);
						
		var oldDepth = sphere.get_radius() - oldDist;
		var newDepth = sphere.get_radius() - newDist;
		if (Math.max(oldDepth, newDepth) > -JConfig.collToll) {
			var dir;
			var collPts = [];
			if (oldDist < -JNumber3D.NUM_TINY) {
				dir = Vector3DUtil.subtract(Vector3DUtil.subtract(oldBoxPoint.pos, 
																  sphere.get_oldState().position), 
											oldBoxPoint.pos);
				Vector3DUtil.normalize(dir);
			}else if (oldDist > JNumber3D.NUM_TINY) {
				dir = Vector3DUtil.subtract(sphere.get_oldState().position, oldBoxPoint.pos);
				Vector3DUtil.normalize(dir);
			}else{
				dir = Vector3DUtil.subtract(sphere.get_oldState().position, box.get_oldState().position);
				Vector3DUtil.normalize(dir);
			}
								
			var cpInfo = new CollPointInfo();
			cpInfo.r0 = Vector3DUtil.subtract(oldBoxPoint.pos, sphere.get_oldState().position);
			cpInfo.r1 = Vector3DUtil.subtract(oldBoxPoint.pos, box.get_oldState().position);
			cpInfo.initialPenetration = oldDepth;
			collPts.push(cpInfo);
								
			var collInfo=new CollisionInfo();
			collInfo.objInfo=info;
			collInfo.dirToBody = dir;
			collInfo.pointInfo = collPts;
								
			var mat = new MaterialProperties();
			mat.set_restitution(Math.sqrt(sphere.get_material().get_restitution() * box.get_material().get_restitution()));
			mat.set_friction(Math.sqrt(sphere.get_material().get_friction() * box.get_material().get_friction()));
			collInfo.mat = mat;
			collArr.push(collInfo);
								
			info.body0.collisions.push(collInfo);
			info.body1.collisions.push(collInfo);
		}
	};
	
	jigLib.CollDetectSphereBox=CollDetectSphereBox;
	
})(jigLib);