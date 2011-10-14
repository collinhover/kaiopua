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
	
	/**
	 * @author Muzer(muzerly@gmail.com)
	 * 
	 * @name JRay
	 * @class JRay
	 * @extends RigidBody
	 * @requires Vector3DUtil
	 * @requires JNumber3D
	 * @property {array} origin the origin of the ray expressed as a 3D vector
	 * @property {array} dir the direction of the ray expressed as a 3D vector
	 * @constructor
	 * @param {array} _origin the origin of the ray expressed as a 3D vector
	 * @param {array} _dir the direction of the ray expressed as a 3D vector
	 **/
	var JRay=function(_origin, _dir){
		this.origin = _origin;
		this.dir = _dir;
	};
	JRay.prototype.origin=null;
	JRay.prototype.dir=null;
	
	/**
	 * @function getOrigin gets the origin
	 * @param {number} t
	 * @type array
	 **/
	JRay.prototype.getOrigin=function(t){
		return Vector3DUtil.add(this.origin, JNumber3D.getScaleVector(this.dir, t));
	};
	
	jigLib.JRay=JRay;
	
})(jigLib);
