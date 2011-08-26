(function(jigLib){
	/**
	 * @author Jim Sangwine
	 * 
	 * @name JEvent
	 * @class JEvent Base class for JigLib events
	 * @constant {string} COLLISION
	 * @constructor
	 * @param type {string}
	 **/
	var JEvent=function(type)
	{
		this.type=type;
	};
	
	JEvent.prototype.type=null;
	
	Event.EVENT='JigLibJSEvent';
	
	jigLib.JEvent=JEvent;
})(jigLib);