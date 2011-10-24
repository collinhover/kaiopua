(function(jigLib){
	/**
	 * @author Muzer(muzerly@gmail.com)
	 * 
	 * @name ITerrain
	 * @class ITerrain an interface for Terrain bodies
	 * @constructor
	 **/
	var ITerrain=function(){};
	
	/**
	 * @function get_minW minimum horizontal coordinate
	 * @type number
	 **/
	ITerrain.prototype.get_minW=function(){};
			
	/**
	 * @function get_minH minimum vertical coordinate
	 * @type number
	 **/
	ITerrain.prototype.get_minH=function(){};
			
	/**
	 * @function get_maxW maximum horizontal coordinate
	 * @type number
	 **/
	ITerrain.prototype.get_maxW=function(){};
			
	/**
	 * @function get_maxH maximum vertical coordinate
	 * @type number
	 **/
	ITerrain.prototype.get_maxH=function(){};
			
	/**
	 * @function get_dw the horizontal length of each segment
	 * @type number
	 **/
	ITerrain.prototype.get_dw=function(){};
			
	/**
	 * @function get_dh the vertical length of each segment
	 * @type number
	 **/
	ITerrain.prototype.get_dh=function(){};
			
	/**
	 * @function get_sw the number of segments horizontally
	 * @type number
	 **/
	ITerrain.prototype.get_sw=function(){};
			
	/**
	 * @function get_sh the number of segments vertically
	 * @type number
	 **/
	ITerrain.prototype.get_sh=function(){};
			
	/**
	 * @function get_heights the heights of all vertices
	 * @type array
	 **/
	ITerrain.prototype.get_heights=function(){};
	
	jigLib.ITerrain=ITerrain;
})(jigLib);