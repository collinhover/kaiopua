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
	var JSegment=jigLib.JSegment;
	
	/**
	 * @author Muzer(muzerly@gmail.com)
	 * 
	 * @name JCapsule
	 * @class JCapsule
	 * @extends RigidBody
	 * @requires Vector3DUtil
	 * @requires JMatrix3D
	 * @requires JNumber3D
	 * @requires JSegment
	 * @property {number} _length the length of this JCapsule
	 * @property {number} _radius the radius of this JCapsule
	 * @constructor
	 * @param {ISkin3D} skin
	 * @param {number} r the radius
	 * @param {number} l the length
	 **/
	var JCapsule=function(skin, r, l) {
		this.Super(skin);
		this._type = "CAPSULE";
		this._radius = r;
		this._length = l;
		this._boundingSphere = this.getBoundingSphere(r, l);
		this.set_mass(1);
		this.updateBoundingBox();
	};
	jigLib.extend(JCapsule,jigLib.RigidBody);
	
	JCapsule.prototype._length=null;
	JCapsule.prototype._radius=null;
	
	/**
	 * @function set_radius sets the radius
	 * @param {number} r the new radius
	 * @type void
	 **/
	JCapsule.prototype.set_radius=function(r){
		this._radius = r;
		this._boundingSphere = getBoundingSphere(this._radius, this._length);
		this.setInertia(this.getInertiaProperties(this.get_mass()));
		this.updateBoundingBox();
		this.setActive();
	};
	
	/**
	 * @function get_radius gets the radius
	 * @type number
	 **/
	JCapsule.prototype.get_radius=function(){
		return this._radius;
	};
				 
	/**
	 * @function set_length sets the length
	 * @param {number} l the new length
	 * @type void
	 **/
	JCapsule.prototype.set_length=function(l){
		this._length = l;
		this._boundingSphere = getBoundingSphere(this._radius, this._length);
		this.setInertia(this.getInertiaProperties(this.get_mass()));
		this.updateBoundingBox();
		this.setActive();
	};
	
	/**
	 * @function get_length gets the length
	 * @type number
	 **/
	JCapsule.prototype.get_length=function(){
		return this._length;
	};
	
	/**
	 * @function getBottomPos gets the bottom position expressed as a 3D vector
	 * @param {PhysicsState} state
	 * @type array
	 **/
	JCapsule.prototype.getBottomPos=function(state){
		var temp = state.getOrientationCols()[1];
		//Vector3DUtil.normalize(temp);
		return Vector3DUtil.add(state.position, JNumber3D.getScaleVector(temp, -this._length / 2 - this._radius));
	};
				 
	/**
	 * @function getEndPos gets the end position expressed as a 3D vector
	 * @param {PhysicsState} state
	 * @type array
	 **/
	JCapsule.prototype.getEndPos=function(state){
		var temp = state.getOrientationCols()[1];
		//Vector3DUtil.normalize(temp);
		return Vector3DUtil.add(state.position, JNumber3D.getScaleVector(temp, this._length / 2 + this._radius));
	};
				 
	/**
	 * @function segmentIntersect tests a segment for intersection
	 * @param {object} out
	 * @param {JSegment} seg
	 * @param {PhysicsState} state
	 * @type boolean
	 **/
	JCapsule.prototype.segmentIntersect=function(out, seg, state){
		out.frac = 0;
		out.position = [0,0,0,0];
		out.normal = [0,0,0,0];
						
		var Ks = seg.delta;
		var kss = Vector3DUtil.dotProduct(Ks, Ks);
		var radiusSq = this._radius * this._radius;
						
		var cols = state.getOrientationCols();
		var cylinderAxis = new JSegment(getBottomPos(state), cols[1]);
		var Ke = cylinderAxis.delta;
		var Kg = Vector3DUtil.subtract(cylinderAxis.origin, seg.origin);
		var kee = Vector3DUtil.dotProduct(Ke, Ke);
		if (Math.abs(kee) < JNumber3D.NUM_TINY) {
			return false;
		}
						
		var kes = Vector3DUtil.dotProduct(Ke, Ks);
		var kgs = Vector3DUtil.dotProduct(Kg, Ks);
		var keg = Vector3DUtil.dotProduct(Ke, Kg);
		var kgg = Vector3DUtil.dotProduct(Kg, Kg);
						
		var distSq = Vector3DUtil.get_lengthSquared(Vector3DUtil.subtract(Kg, JNumber3D.getDivideVector(JNumber3D.getScaleVector(Ke, keg), kee)));
		if (distSq < radiusSq) {
			out.fracOut = 0;
			out.posOut = seg.origin.slice(0);
			out.normalOut = Vector3DUtil.subtract(out.posOut, getBottomPos(state));
			out.normalOut = Vector3DUtil.subtract(out.normalOut, JNumber3D.getScaleVector(cols[1], Vector3DUtil.dotProduct(out.normalOut, cols[1])));
			Vector3DUtil.normalize(out.normalOut);
			return true;
		}
						
		var ar = kee * kss - (kes * kes);
		if (Math.abs(a) < JNumber3D.NUM_TINY) {
			return false;
		}
		var b = 2 * (keg * kes - kee * kgs);
		var c = kee * (kgg - radiusSq) - (keg * keg);
		var blah = (b * b) - 4 * a * c;
		if (blah < 0) {
			return false;
		}
		var t = ( -b - Math.sqrt(blah)) / (2 * a);
		if (t < 0 || t > 1) {
			return false;
		}
		out.frac = t;
		out.position = seg.getPoint(t);
		out.normal = Vector3DUtil.subtract(out.posOut, getBottomPos(state));
		out.normal = Vector3DUtil.subtract(out.normal, JNumber3D.getScaleVector(cols[1], Vector3DUtil.dotProduct(out.normal, cols[1])));
		Vector3DUtil.normalize(out.normal);
		return true;
	};

	/**
	 * @function getInertiaProperties
	 * @param {number} m
	 * @type JMatrix3D
	 **/
	JCapsule.prototype.getInertiaProperties=function(m){
		var cylinderMass = m * Math.PI * this._radius * this._radius * this._length / this.getVolume();
		var Ixx = 0.25 * cylinderMass * this._radius * this._radius + (1 / 12) * cylinderMass * this._length * this._length;
		var Iyy = 0.5 * cylinderMass * this._radius * this._radius;
		var Izz= Ixx;
						 
		var endMass = m - cylinderMass;
		Ixx += (0.4 * endMass * this._radius * this._radius + endMass * Math.pow(0.5 * this._length, 2));
		Iyy += (0.2 * endMass * this._radius * this._radius);
		Izz += (0.4 * endMass * this._radius * this._radius + endMass * Math.pow(0.5 * this._length, 2));
						
						 /*
						var inertiaTensor:JMatrix3D = new JMatrix3D();
						inertiaTensor.n11 = Ixx;
						inertiaTensor.n22 = Iyy;
						inertiaTensor.n33 = Izz;
						*/
						
		return JMatrix3D.getScaleMatrix(Ixx, Iyy, Izz);
	};
				
	/**
	 * @function updateBoundingBox updates the bounding box for this JCapsule
	 * @type void
	 **/
	JCapsule.prototype.updateBoundingBox=function(){
		this._boundingBox.clear();
		this._boundingBox.addCapsule(this);
	};
				
	/**
	 * @function getBoundingSphere gets the bounding sphere for any JCapsule based on it's radius and length
	 * @param {number} r the radius
	 * @param {number} l the length
	 * @type number
	 **/
	JCapsule.prototype.getBoundingSphere=function(r, l){
		return Math.sqrt(Math.pow(l / 2, 2) + r * r) + r;
	};
				
	/**
	 * @function getVolume gets the vollume for this JCapsule
	 * @type number
	 **/
	JCapsule.prototype.getVolume=function(){
		return (4 / 3) * Math.PI * this._radius * this._radius * this._radius + this._length * Math.PI * this._radius * this._radius;
	};
	
	jigLib.JCapsule=JCapsule;
	
})(jigLib);
