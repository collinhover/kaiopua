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
	var JCapsule=jigLib.JCapsule;
	var JTerrain=jigLib.JPlane;
	var MaterialProperties=jigLib.MaterialProperties;
	var RigidBody=jigLib.RigidBody;
	var CollPointInfo=jigLib.CollPointInfo;
	var CollisionInfo=jigLib.CollisionInfo;
	
	/**
	 * @author Muzer(muzerly@gmail.com)
	 * 
	 * @name CollDetectCapsulePlane
	 * @class CollDetectCapsulePlane handles collisions between capsules and planes
	 * @extends CollDetectFunctor
	 * @requires CollDetectInfo
	 * @requires Vector3DUtil
	 * @requires JNumber3D
	 * @requires MaterialProperties
	 * @constructor
	 **/
	var CollDetectCapsulePlane=function(){
		this.name = "CapsulePlane";
		this.type0 = "CAPSULE";
		this.type1 = "PLANE";
	};
	jigLib.extend(CollDetectCapsulePlane,jigLib.CollDetectFunctor);
	
	/**
	 * @function collDetect detects a collision and updates the info parameter
	 * @param {CollDetectInfo} info
	 * @param {array} collArray
	 * @type void
	 **/
	CollDetectCapsulePlane.prototype.collDetect=function(info, collArr){
		var tempBody;
		if (info.body0.get_type() == "PLANE"){
			tempBody = info.body0;
			info.body0 = info.body1;
			info.body1 = tempBody;
		}

		var capsule = info.body0;
		var plane = info.body1;

		var collPts = [];
		var cpInfo;

		var oldPos = capsule.getBottomPos(capsule.get_oldState());
		var oldDist = plane.pointPlaneDistance(oldPos);
		var newPos = capsule.getBottomPos(capsule.get_currentState());
		var newDist = plane.pointPlaneDistance(newPos);

		if (Math.min(oldDist, newDist) < capsule.get_radius() + JConfig.collToll){
			var oldDepth= capsule.get_radius() - oldDist;
			var worldPos= Vector3DUtil.subtract(oldPos, JNumber3D.getScaleVector(plane.get_normal(), capsule.get_radius()));

			cpInfo = new CollPointInfo();
			cpInfo.r0 = Vector3DUtil.subtract(worldPos, capsule.get_oldState().position);
			cpInfo.r1 = Vector3DUtil.subtract(worldPos, plane.get_oldState().position);
			cpInfo.initialPenetration = oldDepth;
			collPts.push(cpInfo);
		}

		oldPos = capsule.getEndPos(capsule.get_oldState());
		newPos = capsule.getEndPos(capsule.get_currentState());
		oldDist = plane.pointPlaneDistance(oldPos);
		newDist = plane.pointPlaneDistance(newPos);
		if (Math.min(oldDist, newDist) < capsule.get_radius() + JConfig.collToll){
			oldDepth = capsule.get_radius() - oldDist;
			worldPos = Vector3DUtil.subtract(oldPos, JNumber3D.getScaleVector(plane.get_normal(), capsule.get_radius()));

			cpInfo = new CollPointInfo();
			cpInfo.r0 = Vector3DUtil.subtract(worldPos, capsule.get_oldState().position);
			cpInfo.r1 = Vector3DUtil.subtract(worldPos, plane.get_oldState().position);
			cpInfo.initialPenetration = oldDepth;
			collPts.push(cpInfo);
		}

		if (collPts.length > 0){
			var collInfo= new CollisionInfo();
			collInfo.objInfo = info;
			collInfo.dirToBody = plane.get_normal();
			collInfo.pointInfo = collPts;

			var mat = new MaterialProperties();
			mat.set_restitution(Math.sqrt(capsule.get_material().get_restitution() * plane.get_material().get_restitution()));
			mat.set_friction(Math.sqrt(capsule.get_material().get_friction() * plane.get_material().get_friction()));
			collInfo.mat = mat;
			collArr.push(collInfo);

			info.body0.collisions.push(collInfo);
			info.body1.collisions.push(collInfo);
		}
	};
	
	jigLib.CollDetectCapsulePlane=CollDetectCapsulePlane;
	
})(jigLib);