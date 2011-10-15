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
	var JCapsule=jigLib.JCapsule;
	var JSegment=jigLib.JSegment;
	var JBox=jigLib.JBox;
	var MaterialProperties=jigLib.MaterialProperties;
	var RigidBody=jigLib.RigidBody;
	var CollPointInfo=jigLib.CollPointInfo;
	var CollisionInfo=jigLib.CollisionInfo;
	
	/**
	 * @author Muzer(muzerly@gmail.com)
	 * 
	 * @name CollDetectCapsuleBox
	 * @class CollDetectCapsuleBox handles collisions between capsules and boxes
	 * @extends CollDetectFunctor
	 * @requires CollDetectInfo
	 * @requires CollPointInfo
	 * @requires Vector3DUtil
	 * @requires JNumber3D
	 * @requires JSegment
	 * @requires MaterialProperties
	 * @constructor
	 **/
	var CollDetectCapsuleBox=function(){
		this.name = "CapsuleBox";
		this.type0 = "CAPSULE";
		this.type1 = "BOX";
	};
	jigLib.extend(CollDetectCapsuleBox,jigLib.CollDetectFunctor);

	/**
	 * @function collDetect detects a collision and updates the info parameter
	 * @param {CollDetectInfo} info
	 * @param {array} collArray
	 * @type void
	 **/
	CollDetectCapsuleBox.prototype.collDetect=function(info, collArr){
		var tempBody;
		if (info.body0.get_type() == "BOX"){
			tempBody = info.body0;
			info.body0 = info.body1;
			info.body1 = tempBody;
		}

		var capsule = info.body0;
		var box = info.body1;

		if (!capsule.hitTestObject3D(box)){
			return;
		}
		if (JConfig.aabbDetection && !capsule.get_boundingBox().overlapTest(box.get_boundingBox())) {
			return;
		}

		var collPts = [];
		var cpInfo;

		var averageNormal = [0,0,0,0];
		var oldSeg = new JSegment(capsule.getEndPos(capsule.get_oldState()), JNumber3D.getScaleVector(capsule.get_oldState().getOrientationCols()[1], -Vector3DUtil.get_length(capsule)));
		var newSeg = new JSegment(capsule.getEndPos(capsule.get_currentState()), JNumber3D.getScaleVector(capsule.get_currentState().getOrientationCols()[1], -Vector3DUtil.get_length(capsule)));
		var radius = capsule.get_radius();

		var oldObj = {};
		var oldDistSq= oldSeg.segmentBoxDistanceSq(oldObj, box, box.get_oldState());
		var newObj = {};
		var newDistSq = newSeg.segmentBoxDistanceSq(newObj, box, box.get_currentState());
		var arr = box.get_oldState().getOrientationCols();

		if (Math.min(oldDistSq, newDistSq) < Math.pow(radius + JConfig.collToll, 2)){
			var segPos = oldSeg.getPoint(Number(oldObj.pfLParam));
			var boxPos = box.get_oldState().position.slice(0);
			boxPos = Vector3DUtil.add(boxPos, JNumber3D.getScaleVector(arr[0], oldObj.pfLParam0));
			boxPos = Vector3DUtil.add(boxPos, JNumber3D.getScaleVector(arr[1], oldObj.pfLParam1));
			boxPos = Vector3DUtil.add(boxPos, JNumber3D.getScaleVector(arr[2], oldObj.pfLParam2));

			var dist = Math.sqrt(oldDistSq);
			var depth = radius - dist;

			var dir;
			if (dist > JNumber3D.NUM_TINY){
				dir = Vector3DUtil.subtract(segPos, boxPos);
				Vector3DUtil.normalize(dir);
			}else if (Vector3DUtil.get_length(Vector3DUtil.subtract(segPos, box.get_oldState().position)) > JNumber3D.NUM_TINY){
				dir = Vector3DUtil.subtract(segPos, box.get_oldState().position);
				Vector3DUtil.normalize(dir);
			}else{
				dir = Vector3DUtil.Y_AXIS;
				JMatrix3D.multiplyVector(JMatrix3D.getRotationMatrix(0, 0, 1, 360 * Math.random()), dir);
			}
			averageNormal = Vector3DUtil.add(averageNormal, dir);

			cpInfo = new CollPointInfo();
			cpInfo.r0 = Vector3DUtil.subtract(boxPos, capsule.get_oldState().position);
			cpInfo.r1 = Vector3DUtil.subtract(boxPos, box.get_oldState().position);
			cpInfo.initialPenetration = depth;
			collPts.push(cpInfo);
		}


		oldSeg = new JSegment(capsule.getBottomPos(capsule.get_oldState()), JNumber3D.getScaleVector(capsule.get_oldState().getOrientationCols()[1], Vector3DUtil.get_length(capsule)));
		newSeg = new JSegment(capsule.getBottomPos(capsule.get_currentState()), JNumber3D.getScaleVector(capsule.get_currentState().getOrientationCols()[1], Vector3DUtil.get_length(capsule)));

		oldObj = {};
		oldDistSq = oldSeg.segmentBoxDistanceSq(oldObj, box, box.get_oldState());
		newObj = {};
		newDistSq = newSeg.segmentBoxDistanceSq(newObj, box, box.get_currentState());

		if (Math.min(oldDistSq, newDistSq) < Math.pow(radius + JConfig.collToll, 2)){
			segPos = oldSeg.getPoint(Number(oldObj.pfLParam));
			boxPos = box.get_oldState().position.slice(0);
			boxPos = Vector3DUtil.add(boxPos, JNumber3D.getScaleVector(arr[0], oldObj.pfLParam0));
			boxPos = Vector3DUtil.add(boxPos, JNumber3D.getScaleVector(arr[1], oldObj.pfLParam1));
			boxPos = Vector3DUtil.add(boxPos, JNumber3D.getScaleVector(arr[2], oldObj.pfLParam2));

			dist = Math.sqrt(oldDistSq);
			depth = radius - dist;

			if (dist > JNumber3D.NUM_TINY){
				dir = Vector3DUtil.subtract(segPos, boxPos);
				Vector3DUtil.normalize(dir);
			}else if (Vector3DUtil.get_length(Vector3DUtil.subtract(segPos, box.get_oldState().position)) > JNumber3D.NUM_TINY){
				dir = Vector3DUtil.subtract(segPos, box.get_oldState().position);
				Vector3DUtil.normalize(dir);
			}else{
				dir = Vector3DUtil.Y_AXIS;
				JMatrix3D.multiplyVector(JMatrix3D.getRotationMatrix(0, 0, 1, 360 * Math.random()), dir);
			}
			averageNormal = Vector3DUtil.add(averageNormal, dir);

			cpInfo = new CollPointInfo();
			cpInfo.r0 = Vector3DUtil.subtract(boxPos, capsule.get_oldState().position);
			cpInfo.r1 = Vector3DUtil.subtract(boxPos, box.get_oldState().position);
			cpInfo.initialPenetration = depth;
			collPts.push(cpInfo);
		}

		if (collPts.length > 0){
			averageNormal.normalize();
			var collInfo = new CollisionInfo();
			collInfo.objInfo = info;
			collInfo.dirToBody = averageNormal;
			collInfo.pointInfo = collPts;

			var mat = new MaterialProperties();
			mat.set_restitution(Math.sqrt(capsule.get_material().get_restitution() * box.get_material().get_restitution()));
			mat.set_friction(Math.sqrt(capsule.get_material().get_friction() * box.get_material().get_friction()));
			collInfo.mat = mat;
			collArr.push(collInfo);

			info.body0.collisions.push(collInfo);
			info.body1.collisions.push(collInfo);
		}
	};
	
	jigLib.CollDetectCapsuleBox=CollDetectCapsuleBox;
	
})(jigLib);
