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
	 * @name CollDetectFunctor
	 * @class CollDetectFunctor base class for collision detection classes
	 * @property {string} name the inheriting class's collision type e.g. BoxPlane
	 * @property {string} type0 the first geometry type in the collisions supported by the inheritng class e.g. Box
	 * @property {string} type1 the second geometry type in the collisions supported by the inheritng class e.g. Plane
	 * @constructor
	 **/
	var CollDetectFunctor=function(){
	};
	
	CollDetectFunctor.prototype.name=null;
	CollDetectFunctor.prototype.type0=null;
	CollDetectFunctor.prototype.type1=null;
	
	/**
	 * @function collDetect detects a collision and updates the info parameter - must be implemented by the inheriting class
	 * @param {CollDetectInfo} info
	 * @param {array} collArray
	 * @type void
	 **/
	CollDetectFunctor.prototype.collDetect=function(info,collArr){
	};
	
	jigLib.CollDetectFunctor=CollDetectFunctor;
	
})(jigLib);