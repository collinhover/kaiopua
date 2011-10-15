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
	var JMatrix3D=jigLib.JMatrix3D;
	var JConstraint=jigLib.JConstraint;
	var JSegment=jigLib.JSegment;
	var JConfig=jigLib.JConfig;
	var JSphere=jigLib.JSphere;
	var MaterialProperties=jigLib.MaterialProperties;
	var PhysicsState=jigLib.PhysicsState;
	var EdgeData=jigLib.EdgeData;
	var SpanData=jigLib.SpanData;
	var CollPointInfo=jigLib.CollPointInfo;
	var CollisionInfo=jigLib.CollisionInfo;
	
	/**
	 * @author Muzer(muzerly@gmail.com)
	 * 
	 * @name CollDetectBoxBox
	 * @class CollDetectBoxBox handles collisions between boxes
	 * @extends CollDetectFunctor
	 * @property {number} combinationDist the combination distance
	 * @requires CollDetectInfo
	 * @requires Vector3DUtil
	 * @requires JNumber3D
	 * @requires JBox
	 * @requires PhysicsState
	 * @constructor
	 **/
	var CollDetectBoxBox=function(){
		this.name = "BoxBox";
		this.type0 = "BOX";
		this.type1 = "BOX";
	};
	jigLib.extend(CollDetectBoxBox,jigLib.CollDetectFunctor);
	
	CollDetectBoxBox.prototype.combinationDist=null;
	
	// I can't find any other reference to the MAX_SUPPORT_VERTS property anywhere!
	// CollDetectBoxBox.prototype.MAX_SUPPORT_VERTS = 10;
	
	/**
	 * @function disjoint tests for disjoint or intersection
	 * @param {SpanData} out the SpanData object to apply test results to
	 * @param {array} axis the axis expressed as a 3D vector
	 * @param {JBox} box0 the first box to use for testing
	 * @param {JBox} box1 the second box to use for testing
	 * @returns true if disjoint, false if intersecting
	 * @type boolean
	 **/
	CollDetectBoxBox.prototype.disjoint=function(out, axis, box0, box1){
		var obj0 = box0.getSpan(axis);
		var obj1 = box1.getSpan(axis);
		var obj0Min = obj0.min;
		var obj0Max = obj0.max;
		var obj1Min = obj1.min;
		var obj1Max = obj1.max;
		var mmin = Math.min;
		
		if (obj0Min > (obj1Max + JConfig.collToll + JNumber3D.NUM_TINY) || obj1Min > (obj0Max + JConfig.collToll + JNumber3D.NUM_TINY)){
			out.flag = true;
			return true;
		}
		if ((obj0Max > obj1Max) && (obj1Min > obj0Min)){
			out.depth = mmin(obj0Max - obj1Min, obj1Max - obj0Min);
		}else if ((obj1Max > obj0Max) && (obj0Min > obj1Min)){
			out.depth = mmin(obj1Max - obj0Min, obj0Max - obj1Min);
		}else{
			out.depth = (obj0Max < obj1Max) ? obj0Max : obj1Max;
			out.depth -= (obj0Min > obj1Min) ? obj0Min : obj1Min;
		}
		out.flag = false;
		return false;
	};
	
	
	/**
	 * @function addPoint conditionally adds one 3D vector to a collection of other 3D vectors
	 * @param {array} contactPoints a collection of points (3D vectors)
	 * @param {array} pt the point to add expressed as a 3D vector
	 * @param {number} combinationDistanceSq the maximum length squared allowed between pt and any of contactPoints
	 * @returns true if pt was added to contactPoints, false if combinationDistanceSq was ever exceeded
	 * @type boolean
	 **/
	CollDetectBoxBox.prototype.addPoint=function(contactPoints, pt, combinationDistanceSq){
		for(var i=0,cpsl=contactPoints.length;i<cpsl;i++){
			var contactPoint=contactPoints[i];
			if (Vector3DUtil.get_lengthSquared(Vector3DUtil.subtract(contactPoint, pt)) < combinationDistanceSq){
				contactPoint = JNumber3D.getDivideVector(Vector3DUtil.add(contactPoint, pt), 2);
				return false;
			}
		}
		contactPoints.push(pt);
		return true;
	};

				
	/**
	 * @function getSupportPoint
	 * @param {JBox} box
	 * @param {array} axis the axis expressed as a 3D vector
	 * @returns the point expressed as a 3D Vector
	 * @type {array}
	 **/
	CollDetectBoxBox.prototype.getSupportPoint=function(box, axis) {
		var orientationCol = box.get_currentState().getOrientationCols();
		var _as = Vector3DUtil.dotProduct(axis,orientationCol[0]);
		var _au = Vector3DUtil.dotProduct(axis,orientationCol[1]);
		var _ad = Vector3DUtil.dotProduct(axis,orientationCol[2]);
						
		var p = box.get_currentState().position.slice(0);
  
		var sideLengths=box.get_sideLengths();
		
		if (_as < -JNumber3D.NUM_TINY) {
			p = Vector3DUtil.add(p,JNumber3D.getScaleVector(orientationCol[0], 0.5 * sideLengths[0]));
		}else if (_as >= JNumber3D.NUM_TINY) {
			p = Vector3DUtil.subtract(p,JNumber3D.getScaleVector(orientationCol[0], 0.5 * sideLengths[0]));
		}
  
		if (_au < -JNumber3D.NUM_TINY) {
			p = Vector3DUtil.add(p,JNumber3D.getScaleVector(orientationCol[1], 0.5 * sideLengths[1]));
		}else if (_au > JNumber3D.NUM_TINY) {
			p = Vector3DUtil.subtract(p,JNumber3D.getScaleVector(orientationCol[1], 0.5 * sideLengths[1]));
		}
  
		if (_ad < -JNumber3D.NUM_TINY) {
			p = Vector3DUtil.add(p,JNumber3D.getScaleVector(orientationCol[2], 0.5 * sideLengths[2]));
		}else if (_ad > JNumber3D.NUM_TINY) {
			p = Vector3DUtil.subtract(p,JNumber3D.getScaleVector(orientationCol[2], 0.5 * sideLengths[2]));
		}
		return p;
	};

	/**
	 * @function getAABox2EdgeIntersectionPoints
	 * @param {array} contactPoint a 3D vector
	 * @param {array} origBoxSides a 3D vector
	 * @param {PhysicsState} origBoxState
	 * @param {array} edgePt0 a 3D vector
	 * @param {array} edgePt1 a 3D vector
	 * @type {number}
	 **/
	CollDetectBoxBox.prototype.getAABox2EdgeIntersectionPoints=function(contactPoint, origBoxSides, origBoxState, edgePt0, edgePt1){
		var jDir;
		var kDir;
		var dist0;
		var dist1;
		var frac;
		var num=0;
		var pt;
		var edgeDir = Vector3DUtil.subtract(edgePt1, edgePt0);
		Vector3DUtil.normalize(edgeDir);
		var ptArr=[];
		var faceOffsets=[];
		var edgePt0Arr = edgePt0;
		var edgePt1Arr = edgePt1;
		var edgeDirArr = edgeDir;
		var sidesArr = JNumber3D.getScaleVector(origBoxSides, 0.5);
		for (var iDir= 2; iDir >= 0; iDir--) {
			if (Math.abs(edgeDirArr[iDir]) < 0.1) {
				continue;
			}
			jDir = (iDir + 1) % 3;
			kDir = (iDir + 2) % 3;
			faceOffsets = [ -sidesArr[iDir], sidesArr[iDir]];
			for (var iFace= 1; iFace >= 0; iFace-- ) {
				dist0 = edgePt0Arr[iDir] - faceOffsets[iFace];
				dist1 = edgePt1Arr[iDir] - faceOffsets[iFace];
				frac = -1;
				if (dist0 * dist1 < -JNumber3D.NUM_TINY) {
					frac = -dist0 / (dist1 - dist0);
				}else if (Math.abs(dist0) < JNumber3D.NUM_TINY) {
					frac = 0;
				}else if (Math.abs(dist1) < JNumber3D.NUM_TINY) {
					frac = 1;
				}
				if (frac >= 0) {
					pt = Vector3DUtil.add(JNumber3D.getScaleVector(edgePt0, 1 - frac),JNumber3D.getScaleVector(edgePt1, frac));
					ptArr = pt;
					if ((ptArr[jDir] > -sidesArr[jDir] - JNumber3D.NUM_TINY) && (ptArr[jDir] < sidesArr[jDir] + JNumber3D.NUM_TINY) && (ptArr[kDir] > -sidesArr[kDir] - JNumber3D.NUM_TINY) && (ptArr[kDir] < sidesArr[kDir] + JNumber3D.NUM_TINY) ) {
						pt=pt.splice(0);
						JMatrix3D.multiplyVector(origBoxState.get_orientation(),pt);
						pt = Vector3DUtil.add(pt,origBoxState.position);
						this.addPoint(contactPoint, pt, combinationDist);
						if (++num == 2) {
							return num;
						}
					}
				}
			}
		}
		return num;
	};
				
	/**
	 * @function getBox2BoxEdgesIntersectionPoints
	 * @param {array} contactPoint a 3D vector
	 * @param {JBox} box0
	 * @param {JBox} box1
	 * @param {PhysicsState} newState
	 * @type {number}
	 **/
	CollDetectBoxBox.prototype.getBox2BoxEdgesIntersectionPoints=function(contactPoint, box0, box1, newState){
		var num = 0;
		var seg;
		var box0State = (newState) ? box0.get_currentState() : box0.get_oldState();
		var box1State= (newState) ? box1.get_currentState() : box1.get_oldState();
		var boxPts = box1.getCornerPointsInBoxSpace(box1State, box0State);
		
		var boxEdges = box1.get_edges();
		var edgePt0;
		var edgePt1;
		for(var i=0;i<boxEdges.length;i++){
		var boxEdge=boxEdges[i];
			edgePt0 = boxPts[boxEdge.ind0];
			edgePt1 = boxPts[boxEdge.ind1];
			num += this.getAABox2EdgeIntersectionPoints(contactPoint, box0.get_sideLengths(), box0State, edgePt0, edgePt1);
			if (num >= 8) {
				return num;
			}
		}
		return num;
	};

	/**
	 * @function getBoxBoxIntersectionPoints
	 * @param {array} contactPoint a 3D vector
	 * @param {JBox} box0
	 * @param {JBox} box1
	 * @param {PhysicsState} newState
	 * @type {number}
	 **/
	CollDetectBoxBox.prototype.getBoxBoxIntersectionPoints=function(contactPoint, box0, box1, newState){
		this.getBox2BoxEdgesIntersectionPoints(contactPoint, box0, box1, newState);
		this.getBox2BoxEdgesIntersectionPoints(contactPoint, box1, box0, newState);
		return Vector3DUtil.get_length(contactPoint);
	};
	
	/**
	 * @function collDetect detects a collision and updates the info parameter
	 * @param {CollDetectInfo} info
	 * @param {array} collArray
	 * @param {PhysicsState} newState
	 * @type {void}
	 **/
	CollDetectBoxBox.prototype.collDetect=function(info, collArr){
		var box0 = info.body0;
		var box1 = info.body1;

		if (!box0.hitTestObject3D(box1)) return;

		if (JConfig.aabbDetection && !box0.get_boundingBox().overlapTest(box1.get_boundingBox())) return;

		var numTiny= JNumber3D.NUM_TINY;
		var numHuge= JNumber3D.NUM_HUGE;

		var dirs0Arr = box0.get_currentState().getOrientationCols();
		var dirs1Arr = box1.get_currentState().getOrientationCols();

		// the 15 potential separating axes
		var axes = [dirs0Arr[0], dirs0Arr[1], dirs0Arr[2],
								dirs1Arr[0], dirs1Arr[1], dirs1Arr[2],
								Vector3DUtil.crossProduct(dirs0Arr[0],dirs1Arr[0]),
								Vector3DUtil.crossProduct(dirs0Arr[1],dirs1Arr[0]),
								Vector3DUtil.crossProduct(dirs0Arr[2],dirs1Arr[0]),
								Vector3DUtil.crossProduct(dirs0Arr[0],dirs1Arr[1]),
								Vector3DUtil.crossProduct(dirs0Arr[1],dirs1Arr[1]),
								Vector3DUtil.crossProduct(dirs0Arr[2],dirs1Arr[1]),
								Vector3DUtil.crossProduct(dirs0Arr[0],dirs1Arr[2]),
								Vector3DUtil.crossProduct(dirs0Arr[1],dirs1Arr[2]),
								Vector3DUtil.crossProduct(dirs0Arr[2],dirs1Arr[2])];

		var l2;
		// the overlap depths along each axis
		var overlapDepths = [];
		var i= 0;
		var axesLength = axes.length;

		// see if the boxes are separate along any axis, and if not keep a 
		// record of the depths along each axis
		for (i = 0; i < axesLength; i++){
			var _overlapDepth = overlapDepths[i] = new SpanData();
			_overlapDepth.depth = numHuge;

			l2 = Vector3DUtil.get_lengthSquared(axes[i]);
			if (l2 < numTiny) continue;
								
			var ax = axes[i].slice(0);
			Vector3DUtil.normalize(ax);
			if (this.disjoint(overlapDepths[i], ax, box0, box1)) return;
		}

		// The box overlap, find the separation depth closest to 0.
		var minDepth = numHuge;
		var minAxis = -1;
		axesLength = axes.length;
		for (i = 0; i < axesLength; i++){
			l2 = Vector3DUtil.get_lengthSquared(axes[i]);
			if (l2 < numTiny) continue;

			// If this axis is the minimum, select it
			if (overlapDepths[i].depth < minDepth){
				minDepth = overlapDepths[i].depth;
				minAxis =i;
			}
		}
						
		if (minAxis == -1) return;
						
		// Make sure the axis is facing towards the box0. if not, invert it
		var N= axes[minAxis].splice(0);
		if (Vector3DUtil.dotProduct(Vector3DUtil.subtract(box1.get_currentState().position,box0.get_currentState().position),N) > 0) 
			N = JNumber3D.getScaleVector(N, -1);
						
		var contactPointsFromOld = true;
		var contactPoints = [];
		var box0lengths=box0.get_sideLengths();
		var box1lengths=box1.get_sideLengths();
		combinationDist = 0.05 * Math.min(Math.min(box0lengths[0], box0lengths[1], box0lengths[2]), Math.min(box1lengths[0], box1lengths[1], box1lengths[2]));
		combinationDist += (JConfig.collToll * 3.464);
		combinationDist *= combinationDist;

		if (minDepth > -JNumber3D.NUM_TINY)
			this.getBoxBoxIntersectionPoints(contactPoints, box0, box1, false);
						
		if (contactPoints.length == 0){
			contactPointsFromOld = false;
			this.getBoxBoxIntersectionPoints(contactPoints, box0, box1, true);
		}
						
		var bodyDelta = Vector3DUtil.subtract(Vector3DUtil.subtract(box0.get_currentState().position,box0.get_oldState().position),Vector3DUtil.subtract(box1.get_currentState().position,box1.get_oldState().position));
		var bodyDeltaLen = Vector3DUtil.dotProduct(bodyDelta,N);
		var oldDepth = minDepth + bodyDeltaLen;
						
		var SATPoint = [];
		switch(minAxis){
			//-----------------------------------------------------------------
			// Box0 face, Box1 Corner collision
			//-----------------------------------------------------------------
		case 0:
		case 1:
		case 2:
			//-----------------------------------------------------------------
			// Get the lowest point on the box1 along box1 normal
			//-----------------------------------------------------------------
			SATPoint = this.getSupportPoint(box1, JNumber3D.getScaleVector(N, -1));
			break;
		//-----------------------------------------------------------------
		// We have a Box2 corner/Box1 face collision
		//-----------------------------------------------------------------
		case 3:
		case 4:
		case 5:
			//-----------------------------------------------------------------
			// Find with vertex on the triangle collided
			//-----------------------------------------------------------------
			SATPoint = this.getSupportPoint(box0, N);
			break;
		//-----------------------------------------------------------------
		// We have an edge/edge colliiosn
		//-----------------------------------------------------------------
		case 6:
		case 7:
		case 8:
		case 9:
		case 10:
		case 11:
		case 12:
		case 13:
		case 14:
			//-----------------------------------------------------------------
			// Retrieve which edges collided.
			//-----------------------------------------------------------------
			i = minAxis - 6;
			var ia = (i / 3)|0;
			var ib= i - ia * 3;
			//-----------------------------------------------------------------
			// find two P0, P1 point on both edges. 
			//-----------------------------------------------------------------
			var P0 = this.getSupportPoint(box0, N);
			var P1 = this.getSupportPoint(box1, JNumber3D.getScaleVector(N, -1));
	  
			//-----------------------------------------------------------------
			// Find the edge intersection. 
			//-----------------------------------------------------------------
	 
			//-----------------------------------------------------------------
			// plane along N and F, and passing through PB
			//-----------------------------------------------------------------
			var planeNormal = Vector3DUtil.crossProduct(N,dirs1Arr[ib]);
			var planeD = Vector3DUtil.dotProduct(planeNormal,P1);
	  
			//-----------------------------------------------------------------
			// find the intersection t, where Pintersection = P0 + t*box edge dir
			//-----------------------------------------------------------------
			var div = Vector3DUtil.dotProduct(dirs0Arr[ia],planeNormal);
	  
			//-----------------------------------------------------------------
			// plane and ray colinear, skip the intersection.
			//-----------------------------------------------------------------
			if (Math.abs(div) < JNumber3D.NUM_TINY) return;
	  
			var t = (planeD - Vector3DUtil.dotProduct(P0,planeNormal)) / div;
	  
			//-----------------------------------------------------------------
			// point on edge of box0
			//-----------------------------------------------------------------
			P0 = Vector3DUtil.add(P0,JNumber3D.getScaleVector(dirs0Arr[ia], t));
			SATPoint =Vector3DUtil.add(P0,JNumber3D.getScaleVector(N, 0.5 * minDepth));
			break;
		}

		var collPts;
		if (contactPoints.length > 0){
			collPts = [];

			var minDist = JNumber3D.NUM_HUGE;
			var maxDist = -JNumber3D.NUM_HUGE;
			var dist;
			var depth;
			var depthScale;
			var cpInfo;
			var contactPoint;

			for(var j=0;j<contactPoints.length;j++){
				contactPoint=contactPoints[j];

				dist = Vector3DUtil.get_length(Vector3DUtil.subtract(contactPoint,SATPoint));
						
				if (dist < minDist) minDist = dist;

				if (dist > maxDist) maxDist = dist;
			}

			if (maxDist < minDist + JNumber3D.NUM_TINY) maxDist = minDist + JNumber3D.NUM_TINY;

			i = 0;
							  
			for(var j=0;j<contactPoints.length;j++){
				contactPoint=contactPoints[j];
				dist = Vector3DUtil.get_length(Vector3DUtil.subtract(contactPoint,SATPoint));
				depthScale = (dist - minDist) / (maxDist - minDist);
				depth = (1 - depthScale) * oldDepth;
				cpInfo = new CollPointInfo();
						
				if (contactPointsFromOld) {
					cpInfo.r0 = Vector3DUtil.subtract(contactPoint,box0.get_oldState().position);
					cpInfo.r1 = Vector3DUtil.subtract(contactPoint,box1.get_oldState().position);
				} else {
					cpInfo.r0 = Vector3DUtil.subtract(contactPoint,box0.get_currentState().position);
					cpInfo.r1 = Vector3DUtil.subtract(contactPoint,box1.get_currentState().position);
				}
						
				cpInfo.initialPenetration = depth;
				collPts[i++] = cpInfo;
			}
		}else{
			cpInfo = new CollPointInfo();
			cpInfo.r0 = Vector3DUtil.subtract(SATPoint,box0.get_currentState().position);
			cpInfo.r1 = Vector3DUtil.subtract(SATPoint,box1.get_currentState().position);
			cpInfo.initialPenetration = oldDepth;

			collPts = [];
			collPts[0] = cpInfo;
		}
		var collInfo = new CollisionInfo();
		collInfo.objInfo = info;
		collInfo.dirToBody = N;
		collInfo.pointInfo = collPts;

		var mat = new MaterialProperties();
		mat.set_restitution(Math.sqrt(box0.get_material().get_restitution() * box1.get_material().get_restitution()));
		mat.set_friction(Math.sqrt(box0.get_material().get_friction() * box1.get_material().get_friction()));
		collInfo.mat = mat;
		collArr.push(collInfo);

		info.body0.collisions.push(collInfo);
		info.body1.collisions.push(collInfo);
	};

	jigLib.CollDetectBoxBox=CollDetectBoxBox;
	
})(jigLib);
