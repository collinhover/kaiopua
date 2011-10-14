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
	var JMatrix3D=jigLib.JMatrix3D;
	var JNumber3D=jigLib.JNumber3D;
	var JConstraint=jigLib.JConstraint;
	var JConfig=jigLib.JConfig;
	var JSphere=jigLib.JSphere;
	var JSegment=jigLib.JSegment;
	var MaterialProperties=jigLib.MaterialProperties;
	var RigidBody=jigLib.RigidBody;
	var CollPointInfo=jigLib.CollPointInfo;
	var CollisionInfo=jigLib.CollisionInfo;
	
	/**
	 * @author Muzer(muzerly@gmail.com)
	 * 
	 * @name CollDetectSphereCapsule
	 * @class CollDetectSphereCapsule handles collisions between spheres and capsules
	 * @extends CollDetectFunctor
	 * @requires CollDetectInfo
	 * @requires CollPointInfo
	 * @requires CollisionInfo
	 * @requires Vector3DUtil
	 * @requires JNumber3D
	 * @requires JMatrix3D
	 * @requires JSegment
	 * @requires MaterialProperties
	 * @constructor
	 **/
	var CollDetectSphereCapsule=function(){
		this.name = "SphereCapsule";
		this.type0 = "SPHERE";
		this.type1 = "CAPSULE";
	};
	jigLib.extend(CollDetectSphereCapsule,jigLib.CollDetectFunctor);
	
	/**
	 * @function collDetect detects a collision and updates the info parameter
	 * @param {CollDetectInfo} info
	 * @param {array} collArray
	 * @type void
	 **/
	CollDetectSphereCapsule.prototype.collDetect=function(info, collArr){
		var tempBody;
		if (info.body0.get_type() == "CAPSULE"){
			tempBody = info.body0;
			info.body0 = info.body1;
			info.body1 = tempBody;
		}

		var sphere = info.body0;
		var capsule= info.body1;

		if (!sphere.hitTestObject3D(capsule)){
			return;
		}
						
		if (JConfig.aabbDetection && !sphere.get_boundingBox().overlapTest(capsule.get_boundingBox())) {
			return;
		}

		var oldSeg = new JSegment(capsule.getBottomPos(capsule.get_oldState()), JNumber3D.getScaleVector(capsule.get_oldState().getOrientationCols()[1], Vector3DUtil.get_length(capsule) + 2 * capsule.get_radius()));
		var newSeg = new JSegment(capsule.getBottomPos(capsule.get_currentState()), JNumber3D.getScaleVector(capsule.get_currentState().getOrientationCols()[1], Vector3DUtil.get_length(capsule) + 2 * capsule.get_radius()));
		var radSum = sphere.get_radius() + capsule.get_radius();

		var oldObj = {};
		var oldDistSq = oldSeg.pointSegmentDistanceSq(oldObj, sphere.get_oldState().position);
		var newObj = {};
		var newDistSq = newSeg.pointSegmentDistanceSq(newObj, sphere.get_currentState().position);

		if (Math.min(oldDistSq, newDistSq) < Math.pow(radSum + JConfig.collToll, 2)){
			var segPos = oldSeg.getPoint(oldObj.t);
			var delta = Vector3DUtil.subtract(sphere.get_oldState().position, segPos);

			var dist = Math.sqrt(oldDistSq);
			var depth = radSum - dist;

			if (dist > JNumber3D.NUM_TINY){
				delta = JNumber3D.getDivideVector(delta, dist);
			}else{
				delta = Vector3DUtil.Y_AXIS;
				JMatrix3D.multiplyVector(JMatrix3D.getRotationMatrix(0, 0, 1, 360 * Math.random()), delta);
			}

			var worldPos = Vector3DUtil.add(segPos, JNumber3D.getScaleVector(delta, capsule.get_radius() - 0.5 * depth));

			var collPts = [];
			var cpInfo = new CollPointInfo();
			cpInfo.r0 = Vector3DUtil.subtract(worldPos, sphere.get_oldState().position);
			cpInfo.r1 = Vector3DUtil.subtract(worldPos, capsule.get_oldState().position);
			cpInfo.initialPenetration = depth;
			collPts.push(cpInfo);

			var collInfo = new CollisionInfo();
			collInfo.objInfo = info;
			collInfo.dirToBody = delta;
			collInfo.pointInfo = collPts;

			var mat = new MaterialProperties();
			mat.set_restitution(Math.sqrt(sphere.get_material().get_restitution() * capsule.get_material().get_restitution()));
			mat.set_friction(Math.sqrt(sphere.get_material().get_friction() * capsule.get_material().get_friction()));
			collInfo.mat = mat;
			collArr.push(collInfo);

			info.body0.collisions.push(collInfo);
			info.body1.collisions.push(collInfo);
		}
	};
	
	jigLib.CollDetectSphereCapsule=CollDetectSphereCapsule;
	
})(jigLib);
