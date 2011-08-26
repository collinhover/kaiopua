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
	
	var JBox=jigLib.JBox;

	/**
	 * @author Muzer(muzerly@gmail.com)
	 * 
	 * @name JChassis
	 * @class JChassis represents vehicle chassis
	 * @extends JBox
	 * @property {JCar} _car the vehicle this chassis belongs to
	 * @constructor
	 * @param {JCar} car the vehicle this chassis belongs to
	 * @param {ISkin3D} skin the mesh
	 * @param {number} width the required chassis width
	 * @param {number} depth the required chassis depth
	 * @param {number} height the required chassis height
	 **/
	var JChassis=function(car, skin, width, depth, height){
		if(width==null) width=40;
		if(depth==null) depth=70;
		if(height==null) height=30;
		
		this.Super(skin, width, depth, height);

		this._car = car;
	};
	jigLib.extend(JChassis, jigLib.JBox);
	
	JChassis.prototype._car=null;
	
	/**
	 * @function addExternalForces applies wheel forces to the vehicle
	 * @param {number} dt a UNIX timestamp
	 * @type void
	 **/
	JChassis.prototype.addExternalForces=function(dt){
		this.clearForces();
		this.addGravity();
		this._car.addExternalForces(dt);
	};

	/**
	 * @function postPhysics runs after the PhysicsSystem has been applied
	 * @param {number} dt a UNIX timestamp
	 * @type void
	 **/
	JChassis.prototype.postPhysics=function(dt){
		this._car.postPhysics(dt);
	};
	
	jigLib.JChassis=JChassis;
	
})(jigLib);