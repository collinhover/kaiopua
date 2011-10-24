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
	var JConstraint=jigLib.JConstraint;
	var JConfig=jigLib.JConfig;
	var JPlane=jigLib.JPlane;
	var JSegment=jigLib.JSegment;
	var JBox=jigLib.JBox;
	var MaterialProperties=jigLib.MaterialProperties;
	var RigidBody=jigLib.RigidBody;
	var CollPointInfo=jigLib.CollPointInfo;
	var CollisionInfo=jigLib.CollisionInfo;
	
	/**
	 * @author Muzer(muzerly@gmail.com)
	 * 
	 * @name CollDetectBoxPlane
	 * @class CollDetectBoxPlane handles collisions between boxes and planes
	 * @extends CollDetectFunctor
	 * @requires CollDetectInfo
	 * @requires Vector3DUtil
	 * @constructor
	 **/
	var CollDetectBoxPlane=function(){
		this.name = "BoxPlane";
		this.type0 = "BOX";
		this.type1 = "PLANE";
	};
	jigLib.extend(CollDetectBoxPlane,jigLib.CollDetectFunctor);

	/**
	 * @function collDetect detects a collision and updates the info parameter
	 * @param {CollDetectInfo} info
	 * @param {array} collArray
	 * @type void
	 **/
	CollDetectBoxPlane.prototype.collDetect=function(info, collArr){
		var tempBody;
		if (info.body0.get_type() == "PLANE"){
			tempBody = info.body0;
			info.body0 = info.body1;
			info.body1 = tempBody;
		}

		var box = info.body0;
		var plane = info.body1;

		var centreDist= plane.pointPlaneDistance(box.get_currentState().position);

		if (centreDist > box.get_boundingSphere() + JConfig.collToll)
			return;
		
		var newPts = box.getCornerPoints(box.get_currentState());
		var oldPts = box.getCornerPoints(box.get_oldState());
		var collPts = [];
		var cpInfo;
		var newPt;
		var oldPt;
		var newDepth;
		var oldDepth;
		
		for (var i=0; i<8; i++){
			newPt = newPts[i];
			oldPt = oldPts[i];
			newDepth = -1 * plane.pointPlaneDistance(newPt);
			oldDepth = -1 * plane.pointPlaneDistance(oldPt);
			if (Math.max(newDepth, oldDepth) > -JConfig.collToll){
				cpInfo = new CollPointInfo();
				cpInfo.r0 = Vector3DUtil.subtract(oldPt, box.get_oldState().position);
				cpInfo.r1 = Vector3DUtil.subtract(oldPt, plane.get_oldState().position);
				cpInfo.initialPenetration = oldDepth;
				collPts.push(cpInfo);
			}
		}
		if (collPts.length > 0){
			var collInfo = new CollisionInfo();
			collInfo.objInfo = info;
			collInfo.dirToBody = plane.get_normal();
			collInfo.pointInfo = collPts;

			var mat = new MaterialProperties();
			mat.set_restitution(Math.sqrt(box.get_material().get_restitution() * plane.get_material().get_restitution()));
			mat.set_friction(Math.sqrt(box.get_material().get_friction() * plane.get_material().get_friction()));
			collInfo.mat = mat;
			collArr.push(collInfo);
			info.body0.collisions.push(collInfo);
			info.body1.collisions.push(collInfo);
		}
	};
	
	jigLib.CollDetectBoxPlane=CollDetectBoxPlane;
	
})(jigLib);