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
	var JSphere=jigLib.JSphere;
	var JTerrain=jigLib.JTerrain;
	var MaterialProperties=jigLib.MaterialProperties;
	var RigidBody=jigLib.RigidBody;
	
	/**
	 * @author Muzer(muzerly@gmail.com)
	 *
	 * @name CollDetectSphereTerrain
	 * @class CollDetectSphereTerrain handles collisions between spheres and terrain
	 * @extends CollDetectFunctor
	 * @requires CollDetectInfo
	 * @requires CollPointInfo
	 * @requires CollisionInfo
	 * @requires Vector3DUtil
	 * @requires JNumber3D
	 * @requires MaterialProperties
	 * @constructor
	 **/
	var CollDetectSphereTerrain=function(){ 
		this.name = "SphereTerrain";
		this.type0 = "SPHERE";
		this.type1 = "TERRAIN";
	};
	jigLib.extend(CollDetectSphereTerrain,jigLib.CollDetectFunctor);
	
	/**
	 * @function collDetect detects a collision and updates the info parameter
	 * @param {CollDetectInfo} info
	 * @param {array} collArray
	 * @type void
	 **/
	CollDetectSphereTerrain.prototype.collDetect=function(info, collArr){
		var tempBody;
		if (info.body0.type == "TERRAIN"){
			tempBody = info.body0;
			info.body0 = info.body1;
			info.body1 = tempBody;
		}

		var sphere = info.body0;
		var terrain = info.body1;
						
		var obj = terrain.getHeightAndNormalByPoint(sphere.currentState.position);
		if (obj.height < JConfig.collToll + sphere.radius) {
			var dist = terrain.getHeightByPoint(sphere.oldState.position);
			var depth = sphere.radius - dist;
								
			var Pt = Vector3DUtil.subtract(sphere.oldState.position, JNumber3D.getScaleVector(obj.normal, sphere.radius));
								
			var collPts = [];
			var cpInfo = new CollPointInfo();
			cpInfo.r0 = Vector3DUtil.subtract(Pt, sphere.oldState.position);
			cpInfo.r1 = Vector3DUtil.subtract(Pt, terrain.oldState.position);
			cpInfo.initialPenetration = depth;
			collPts.push(cpInfo);
								
			var collInfo = new CollisionInfo();
			collInfo.objInfo = info;
			collInfo.dirToBody = obj.normal;
			collInfo.pointInfo = collPts;
			var mat = new MaterialProperties();
			mat.restitution = Math.sqrt(sphere.material.restitution * terrain.material.restitution);
			mat.friction = Math.sqrt(sphere.material.friction * terrain.material.friction);
			collInfo.mat = mat;
			collArr.push(collInfo);
			info.body0.collisions.push(collInfo);
			info.body1.collisions.push(collInfo);
		}
	};
	jigLib.CollDetectSphereTerrain=CollDetectSphereTerrain;
})(jigLib);