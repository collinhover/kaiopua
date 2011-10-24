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
	var RigidBody=jigLib.RigidBody;
	
	/**
	 * @author Muzer(muzerly@gmail.com)
	 * 
	 * @name JPlane
	 * @class JPlane
	 * @extends RigidBody
	 * @requires Vector3DUtil
	 * @requires JMatrix3D
	 * @requires JNumber3D
	 * @property {array} _initNormal the length of this JCapsule
	 * @property {array} _normal the radius of this JCapsule
	 * @property {number} _distance
	 * @constructor
	 * @param {ISkin3D} skin
	 * @param {array} initNormal
	 **/
	var JPlane=function(skin, initNormal){
		this.Super(skin);
		if (initNormal == undefined) {
			this._initNormal = [0, 0, -1, 0];
			this._normal = this._initNormal.slice(0);
		}else{
			this._initNormal = initNormal.slice(0);
			this._normal = this._initNormal.slice(0);
		}
						
		this._distance = 0;
		this._type = "PLANE";
		this._movable=false;
	};
	jigLib.extend(JPlane,jigLib.RigidBody);
	
	JPlane.prototype._initNormal=null;
	JPlane.prototype._normal=null;
	JPlane.prototype._distance=null;

	/**
	 * @function get_normal gets the normal
	 * @type array
	 **/
	JPlane.prototype.get_normal=function(){
		return this._normal;
	};

	/**
	 * @function get_normal gets the distance
	 * @type number
	 **/
	JPlane.prototype.get_distance=function(){
		return this._distance;
	};
	
	/**
	 * @function set_normal sets the normal
	 * @param {array} value The plane normal
	 **/
	JPlane.prototype.set_normal=function(value){
		this._normal=value;
		this._initNormal=value;
	};

	/**
	 * @function set_normal sets the distance
	 * @param {number} value The plane distance
	 **/
	JPlane.prototype.set_distance=function(value){
		this._distance=value;
	};

	/**
	 * @function pointPlaneDistance gets the distance from a given point
	 * @param {array} pt the point expressed as a 3D vector
	 * @type array
	 **/
	JPlane.prototype.pointPlaneDistance=function(pt){
		return Vector3DUtil.dotProduct(this._normal, pt) - this._distance;
	};

	/**
	 * @function segmentIntersect tests for intersection with a JSegment
	 * @param {object} out
	 * @param {JSegment} seg
	 * @param {PhysicsState} state
	 * @type boolean
	 **/
	JPlane.prototype.segmentIntersect=function(out, seg, state){
		out.frac = 0;
		out.position = [0,0,0,0];
		out.normal = [0,0,0,0];

		var frac = 0;

		var t;

		var denom = Vector3DUtil.dotProduct(this._normal, seg.delta);
		if (Math.abs(denom) > JNumber3D.NUM_TINY){
			t = -1 * (Vector3DUtil.dotProduct(this._normal, seg.origin) - this._distance) / denom;

			if (t < 0 || t > 1){
				return false;
			}else{
				frac = t;
				out.frac = frac;
				out.position = seg.getPoint(frac);
				out.normal = this._normal.slice(0);
				Vector3DUtil.normalize(out.normal);
				return true;
			}
		}else{
			return false;
		}
	};

	/**
	 * @function updateState updates the current PhysicsState
	 * @type void
	 **/
	JPlane.prototype.updateState=function(){
		this.Super.prototype.updateState.call(this);
		this._normal = this._initNormal.slice(0);
		JMatrix3D.multiplyVector(this._currState._orientation, this._normal);
		//_normal = _currState.orientation.transformVector(new Vector3D(0, 0, -1));
		this._distance = Vector3DUtil.dotProduct(this._currState.position, this._normal);
	};

	jigLib.JPlane=JPlane;

})(jigLib);
