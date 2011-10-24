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
	/**
	 * @author Muzer(muzerly@gmail.com)
	 * 
	 * @name BodyPair
	 * @class BodyPair a container for a pair of RigidBody objects
	 * @property {RigidBody} body0 the first body of the constrained pair
	 * @property {RigidBody} body1 the second body of the constrained pair
	 * @property {array} r a 3D vector
	 * @constructor
	 * @param {RigidBody} _body0 the first body of the constrained pair
	 * @param {RigidBody} _body1 the second body of the constrained pair
	 * @param {array} _r0 a 3D vector
	 * @param {array} _r1 a 3D vector
	 **/
	var BodyPair=function(_body0, _body1, r0, r1){
		if (_body0.id > _body1.id){
			this.body0 = _body0;
			this.body1 = _body1;
			this.r = r0;
		}else{
			this.body0 = _body1;
			this.body1 = _body0;
			this.r = r1;
		}
	};
	BodyPair.prototype.body0=null;
	BodyPair.prototype.body1=null;
	BodyPair.prototype.r=null;
	
	jigLib.BodyPair=BodyPair;
		
})(jigLib);