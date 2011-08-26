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
	var JTerrain=jigLib.JTerrain;
	var MaterialProperties=jigLib.MaterialProperties;
	var RigidBody=jigLib.RigidBody;
	
	/**
	 * @author Muzer(muzerly@gmail.com)
	 * 
	 * @name CollDetectCapsuleTerrain
	 * @class CollDetectCapsuleTerrain handles collisions between capsules and terrain
	 * @extends CollDetectFunctor
	 * @requires CollDetectInfo
	 * @requires CollPointInfo
	 * @requires Vector3DUtil
	 * @requires JNumber3D
	 * @requires CollisionInfo
	 * @requires MaterialProperties
	 * @constructor
	 **/
	var CollDetectCapsuleTerrain=function(){
		this.name = "BoxTerrain";
		this.type0 = "CAPSULE";
		this.type1 = "TERRAIN";
	};
	jigLib.extend(CollDetectCapsuleTerrain,jigLib.CollDetectFunctor);

	/**
	 * @function collDetect detects a collision and updates the info parameter
	 * @param {CollDetectInfo} info
	 * @param {array} collArray
	 * @type void
	 **/
	CollDetectCapsuleTerrain.prototype.collDetect=function(info, collArr){
		var tempBody;
		if (info.body0.type == "TERRAIN"){
			tempBody = info.body0;
			info.body0 = info.body1;
			info.body1 = tempBody;
		}
						
		var capsule = info.body0;
		var terrain = info.body1;
						
		var collPts = [];
		var cpInfo;
						
		var averageNormal= [0,0,0,0];
		var pos1 = capsule.getBottomPos(capsule.oldState);
		var pos2 = capsule.getBottomPos(capsule.currentState);
		var obj1= terrain.getHeightAndNormalByPoint(pos1);
		var obj2 = terrain.getHeightAndNormalByPoint(pos2);
		if (Math.min(obj1.height, obj2.height) < JConfig.collToll + capsule.radius) {
			var oldDepth = capsule.radius - obj1.height;
			var worldPos = Vector3DUtil.subtract(pos1, JNumber3D.getScaleVector(obj2.normal, capsule.radius));
			cpInfo = new CollPointInfo();
			cpInfo.r0 = Vector3DUtil.subtract(worldPos, capsule.oldState.position);
			cpInfo.r1 = Vector3DUtil.subtract(worldPos, terrain.oldState.position);
			cpInfo.initialPenetration = oldDepth;
			collPts.push(cpInfo);
			averageNormal = Vector3DUtil.add(averageNormal, obj2.normal);
		}
						
		pos1 = capsule.getEndPos(capsule.oldState);
		pos2 = capsule.getEndPos(capsule.currentState);
		obj1 = terrain.getHeightAndNormalByPoint(pos1);
		obj2 = terrain.getHeightAndNormalByPoint(pos2);
		if (Math.min(obj1.height, obj2.height) < JConfig.collToll + capsule.radius) {
			oldDepth = capsule.radius - obj1.height;
			worldPos = Vector3DUtil.subtract(pos1, JNumber3D.getScaleVector(obj2.normal, capsule.radius));
			cpInfo = new CollPointInfo();
			cpInfo.r0 = Vector3DUtil.subtract(worldPos, capsule.oldState.position);
			cpInfo.r1 = Vector3DUtil.subtract(worldPos, terrain.oldState.position);
			cpInfo.initialPenetration = oldDepth;
			collPts.push(cpInfo);
			averageNormal = Vector3DUtil.add(averageNormal, obj2.normal);
		}
						
		if (collPts.length > 0){
			Vector3DUtil.normalize(averageNormal);
			var collInfo = new CollisionInfo();
			collInfo.objInfo = info;
			collInfo.dirToBody = averageNormal;
			collInfo.pointInfo = collPts;

			var mat = new MaterialProperties();
			mat.restitution = Math.sqrt(capsule.material.restitution * terrain.material.restitution);
			mat.friction = Math.sqrt(capsule.material.friction * terrain.material.friction);
			collInfo.mat = mat;
			collArr.push(collInfo);

			info.body0.collisions.push(collInfo);
			info.body1.collisions.push(collInfo);
		}
	};
	
	jigLib.CollDetectCapsuleTerrain=CollDetectCapsuleTerrain;
	
})(jigLib);