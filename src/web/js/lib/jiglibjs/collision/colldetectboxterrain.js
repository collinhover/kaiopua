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
	var JTerrain=jigLib.JTerrain;
	var JBox=jigLib.JBox;
	var MaterialProperties=jigLib.MaterialProperties;
	var RigidBody=jigLib.RigidBody;
	
	/**
	 * @author Muzer(muzerly@gmail.com)
	 * 
	 * @name CollDetectBoxTerrain
	 * @class CollDetectBoxTerrain handles collisions between boxes and terrain
	 * @extends CollDetectFunctor
	 * @requires CollDetectInfo
	 * @requires CollPointInfo
	 * @requires Vector3DUtil
	 * @requires MaterialProperties
	 * @constructor
	 **/
	var CollDetectBoxTerrain=function(){
		this.name = "BoxTerrain";
		this.type0 = "BOX";
		this.type1 = "TERRAIN";
	};
	jigLib.extend(CollDetectBoxTerrain,jigLib.CollDetectFunctor);
	
	/**
	 * @function collDetect detects a collision and updates the info parameter
	 * @param {CollDetectInfo} info
	 * @param {array} collArray
	 * @type void
	 **/
	CollDetectBoxTerrain.prototype.collDetect=function(info, collArr){
		var tempBody;
		if (info.body0.type == "TERRAIN"){
			tempBody = info.body0;
			info.body0 = info.body1;
			info.body1 = tempBody;
		}
						
		var box = info.body0;
		var terrain = info.body1;
						
		var oldPts = box.getCornerPoints(box.oldState);
		var newPts = box.getCornerPoints(box.currentState);
		var collNormal = [0,0,0,0];
						
		var obj;
		var dist;
		var newPt;
		var oldPt;
						
		var collPts = [];
		var cpInfo;
						
		for (var i = 0; i < 8; i++ ) {
			newPt = newPts[i];
			obj = terrain.getHeightAndNormalByPoint(newPt);
								
			if (obj.height < JConfig.collToll) {
				oldPt = oldPts[i];
				dist = terrain.getHeightByPoint(oldPt);
				collNormal = Vector3DUtil.add(collNormal, obj.normal);
				cpInfo = new CollPointInfo();
				cpInfo.r0 = Vector3DUtil.subtract(oldPt, box.oldState.position);
				cpInfo.r1 = Vector3DUtil.subtract(oldPt, terrain.oldState.position);
				cpInfo.initialPenetration = -dist;
				collPts.push(cpInfo);
			}
		}
						
		if (collPts.length > 0) {
			Vector3DUtil.normalize(collNormal);
			var collInfo = new CollisionInfo();
			collInfo.objInfo = info;
			collInfo.dirToBody = collNormal;
			collInfo.pointInfo = collPts;
			var mat = new MaterialProperties();
			mat.restitution = Math.sqrt(box.material.restitution * terrain.material.restitution);
			mat.friction = Math.sqrt(box.material.friction * terrain.material.friction);
			collInfo.mat = mat;
			collArr.push(collInfo);
			info.body0.collisions.push(collInfo);
			info.body1.collisions.push(collInfo);
		};
	};
	
	jigLib.CollDetectBoxTerrain=CollDetectBoxTerrain;
	
})(jigLib);