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
	var JSegment=jigLib.JSegment;
	var RigidBody=jigLib.RigidBody;
	var Vector3DUtil=jigLib.Vector3DUtil;
	var JNumber3D=jigLib.JNumber3D;
	var JConstraint=jigLib.JConstraint;
	
	var CollDetectBoxBox=jigLib.CollDetectBoxBox;
	var CollDetectBoxPlane=jigLib.CollDetectBoxPlane;
	var CollDetectBoxTerrain=jigLib.CollDetectBoxTerrain;
	
	var CollDetectCapsuleBox=jigLib.CollDetectCapsuleBox;
	var CollDetectCapsuleCapsule=jigLib.CollDetectCapsuleCapsule;
	var CollDetectCapsulePlane=jigLib.CollDetectCapsulePlane;
	var CollDetectCapsuleTerrain=jigLib.CollDetectCapsuleTerrain;
	
	var CollDetectSphereBox=jigLib.CollDetectSphereBox;
	var CollDetectSphereCapsule=jigLib.CollDetectSphereCapsule;
	var CollDetectSpherePlane=jigLib.CollDetectSpherePlane;
	var CollDetectSphereSphere=jigLib.CollDetectSphereSphere;
	var CollDetectSphereTerrain=jigLib.CollDetectSphereTerrain;
	
	var CollDetectInfo=jigLib.CollDetectInfo;
	 
	/**
	 * @author Muzer(muzerly@gmail.com)
	 * 
	 * @name CollisionSystem
	 * @class CollisionSystem
	 * @requires JSegment
	 * @requires RigidBody
	 * @requires Vector3DUtil
	 * @requires JNumber3D
	 * @requires JConstraint
	 * @requires CollDetectBoxBox
	 * @requires CollDetectBoxPlane
	 * @requires CollDetectBoxTerrain
	 * @requires CollDetectCapsuleBox
	 * @requires CollDetectCapsuleCapsule
	 * @requires CollDetectCapsulePlane
	 * @requires CollDetectCapsuleTerrain
	 * @requires CollDetectSphereBox
	 * @requires CollDetectSphereCapsule
	 * @requires CollDetectCapsulePlane
	 * @requires CollDetectCapsuleSphere
	 * @requires CollDetectCapsuleTerrain
	 * @property {object} detectionFunctors an associative collection of instances of the various collision detection classes
	 * @property {array} collBody a collection of rigid bodies to be operated on by the collision system
	 * @constructor
	 **/
	var CollisionSystem=function(){
		this.collBody = [];
		detectionFunctors = [];
		detectionFunctors["BOX"] = [];
		detectionFunctors["BOX"]["BOX"] = new CollDetectBoxBox();
		detectionFunctors["BOX"]["SPHERE"] = new CollDetectSphereBox();
		detectionFunctors["BOX"]["CAPSULE"] = new CollDetectCapsuleBox();
		detectionFunctors["BOX"]["PLANE"] = new CollDetectBoxPlane();
		detectionFunctors["BOX"]["TERRAIN"] = new CollDetectBoxTerrain();
		detectionFunctors["SPHERE"] = [];
		detectionFunctors["SPHERE"]["BOX"] = new CollDetectSphereBox();
		detectionFunctors["SPHERE"]["SPHERE"] = new CollDetectSphereSphere();
		detectionFunctors["SPHERE"]["CAPSULE"] = new CollDetectSphereCapsule();
		detectionFunctors["SPHERE"]["PLANE"] = new CollDetectSpherePlane();
		detectionFunctors["SPHERE"]["TERRAIN"] = new CollDetectSphereTerrain();
		detectionFunctors["CAPSULE"] = [];
		detectionFunctors["CAPSULE"]["CAPSULE"] = new CollDetectCapsuleCapsule();
		detectionFunctors["CAPSULE"]["BOX"] = new CollDetectCapsuleBox();
		detectionFunctors["CAPSULE"]["SPHERE"] = new CollDetectSphereCapsule();
		detectionFunctors["CAPSULE"]["PLANE"] = new CollDetectCapsulePlane();
		detectionFunctors["CAPSULE"]["TERRAIN"] = new CollDetectCapsuleTerrain();
		detectionFunctors["PLANE"] = [];
		detectionFunctors["PLANE"]["BOX"] = new CollDetectBoxPlane();
		detectionFunctors["PLANE"]["SPHERE"] = new CollDetectSpherePlane();
		detectionFunctors["PLANE"]["CAPSULE"] = new CollDetectCapsulePlane();
		detectionFunctors["TERRAIN"] = [];
		detectionFunctors["TERRAIN"]["SPHERE"] = new CollDetectSphereTerrain();
		detectionFunctors["TERRAIN"]["BOX"] = new CollDetectBoxTerrain();
		detectionFunctors["TERRAIN"]["CAPSULE"] = new CollDetectCapsuleTerrain();
		this.detectionFunctors=detectionFunctors;
	};
	CollisionSystem.prototype.detectionFunctors=null;
	CollisionSystem.prototype.collBody=null;
	
	/**
	 * @function addCollisionBody adds a rigid body to the colBody collection
	 * @param {RigidBody} body
	 * @type void
	 **/
	CollisionSystem.prototype.addCollisionBody=function(body){
		if (!this.findBody(body))
			this.collBody.push(body);
	};

	/**
	 * @function removeCollisionBody removes a rigid body from the colBody collection
	 * @param {RigidBody} body
	 * @type void
	 **/
	CollisionSystem.prototype.removeCollisionBody=function(body){
		if (this.findBody(body))
			this.collBody.splice(this.collBody.indexOf(body), 1);
	};

	/**
	 * @function removeAllCollisionBodies empties the colBody collection
	 * @type void
	 **/
	CollisionSystem.prototype.removeAllCollisionBodies=function(){
		this.collBody = [];
	};

	/**
	 * @function detectCollisions detects collisions between the body and all the registered collision bodies
	 * @param {RigidBody} body
	 * @param {array} collArr
	 * @type void
	 **/
	CollisionSystem.prototype.detectCollisions=function(body, collArr){
		if (!body.isActive)
			return;

		var info;
		var fu;

		for(var i=0, cbl=this.collBody.length; i<cbl; i++){
			var _collBody=this.collBody[i];
			if (body != _collBody && this.checkCollidables(body, _collBody) && this.detectionFunctors[body.get_type()][_collBody.get_type()] != undefined){
				info = new CollDetectInfo();
				info.body0 = body;
				info.body1 = _collBody;
				fu = detectionFunctors[info.body0.get_type()][info.body1.get_type()];
				fu.collDetect(info, collArr);
			}
		}
	};
	
	/**
	 * @function detectAllCollisions detects collisions between all bodies
	 * @param {array} bodies
	 * @param {array} collArr
	 * @type void
	 **/
	CollisionSystem.prototype.detectAllCollisions=function(bodies, collArr){
		var info;
		var fu;
		var bodyID;
		var bodyType;
						
		for(var i=0, bl=bodies.length; i<bl; i++){
			var _body=bodies[i];
			bodyID = _body.id;
			bodyType = _body.get_type();

			for(var j=0;j<this.collBody.length;j++){
				var _collBody=this.collBody[j];
				if (_body == _collBody){
					continue;
				}

				if (_collBody.isActive && bodyID > _collBody.id){
					continue;
				}

				if (this.checkCollidables(_body, _collBody) && this.detectionFunctors[bodyType][_collBody.get_type()] != undefined){
					info = new CollDetectInfo();
					info.body0 = _body;
					info.body1 = _collBody;
					fu = detectionFunctors[info.body0.get_type()][info.body1.get_type()];
					fu.collDetect(info, collArr);
				}
			}
		}
	};

	/**
	 * @function segmentIntersect
	 * @param {object} out
	 * @param {JSegment} seg
	 * @param {RigidBody} ownerBody
	 * @type boolean
	 **/
	CollisionSystem.prototype.segmentIntersect=function(out, seg, ownerBody){
		out.fracOut = JNumber3D.NUM_HUGE;
		out.posOut = [0,0,0,0];
		out.normalOut = [0,0,0,0];

		var obj= {};

		for(var i=0, cbl=this.collBody.length; i<cbl; i++){
			var _collBody=this.collBody[i];
			if (_collBody != ownerBody && this.segmentBounding(seg, _collBody)){
				if (_collBody.segmentIntersect(obj, seg, _collBody.get_currentState())){
					if (obj.fracOut < out.fracOut){
						out.posOut = obj.posOut;
						out.normalOut = obj.normalOut;
						out.fracOut = obj.fracOut;
						out.bodyOut = _collBody;
					}
				}
			}
		}

		if (out.fracOut > 1)
			return false;
		
		if (out.fracOut < 0)
			out.fracOut = 0;
		else if (out.fracOut > 1)
			out.fracOut = 1;
		
		return true;
	};

	/**
	 * @function segmentBounding
	 * @param {JSegment} seg
	 * @param {RigidBody} obj
	 * @type boolean
	 **/
	CollisionSystem.prototype.segmentBounding=function(seg, obj){
		var pos = seg.getPoint(0.5);
		var r = Vector3DUtil.get_length(seg.delta) / 2;

		if (obj.get_type() != "PLANE" && obj.get_type() != "TERRAIN"){
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

	/**
	 * @function findBody determines if a given rigid body is registered with the collision system
	 * @param {RigidBody} body
	 * @returns true if the body is registered, false if not
	 * @type boolean
	 **/
	CollisionSystem.prototype.findBody=function(body){
		for(var i=0, cbl=this.collBody.length; i<cbl; i++){
			var _collBody=this.collBody[i];
			if (body == _collBody)
				return true;
		}
		return false;
	};

	/**
	 * @function checkCollidables
	 * @param {RigidBody} body0
	 * @param {RigidBody} body1
	 * @type boolean
	 **/
	CollisionSystem.prototype.checkCollidables=function(body0, body1){
		if (body0.get_nonCollidables().length == 0 && body1.get_nonCollidables().length == 0){
			return true;
		}
		var nonCollidables=body0.get_nonCollidables();
		for(var i=0, ncl=nonCollidables.length; i<ncl; i++){
			var _body0=nonCollidables[i];
			if (body1 == _body0)
				return false;
		}
		nonCollidables=body1.get_nonCollidables();
		for(var i=0, ncl=nonCollidables.length; i<ncl; i++){
			var _body1=nonCollidables[i];
			if (body0 == _body1)
				return false;
		}
		return true;
	};
	 
	jigLib.CollisionSystem=CollisionSystem;
})(jigLib);