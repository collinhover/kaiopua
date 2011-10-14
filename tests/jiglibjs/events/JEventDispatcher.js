(function(jigLib){
	/**
	 * @author Jim Sangwine
	 * 
	 * @name JEventDispatcher
	 * @class JEventDispatcher The base class for event dispatchers
	 * @constructor
	 **/
	var JEventDispatcher=function() 
	{
		this._listeners={};
	};
	
	JEventDispatcher.prototype._listeners={};
	
	/**
	 * @function addEventListener adds a listener to this dispatcher
	 * @param type {string} the type of event
	 * @param listener {function} the event handler
	 **/
	JEventDispatcher.prototype.addEventListener=function(type,listener)
	{
		if (typeof listener != 'function')
			throw new Error('Invalid argument passed to JEventDispatcher.addEventListener - listener must be a function');
		
		if (typeof(this._listeners[type])=='undefined' || !this._listeners[type] instanceof Array)
			this._listeners[type]=[];
		
		this._listeners[type].push(listener);
	};
	
	/**
	 * @function removeEventListener drops a listener from this dispatcher
	 * @param type {string} the type of event
	 * @param listener {function} the event handler
	 **/
	JEventDispatcher.prototype.removeEventListener=function(type, listener)
	{
		if (!this._listeners[type] instanceof Array) return;
		
		var listeners = this._listeners[type];
		for (var i=0, num=listeners.length; i<num; i++)
		{
			if (listener === listeners[i])
			{
				listeners.splice(i, 1);
				break;
			}
		}
	};
	
	/**
	 * @function dispatchEvent fires an event
	 * @param event {JEvent} the event (should be an instance or subclass of JEvent)
	 **/
	JEventDispatcher.prototype.dispatchEvent=function(event)
	{
		//remove this for now do we want to be strict?
		//if (typeof event.type == 'undefined')
		//	throw new Error('Invalid argument passed to JEventDispatcher.dispatchEvent - use an instance or subclass of JEvent');
		
		var listeners = this._listeners[event.type];
		
		if (!listeners || listeners.length == 0)
			return;
		
		for (var i=0, num=listeners.length; i < num; i++)
		{
			listeners[i].call(this, event);
		}
	};
	
	jigLib.JEventDispatcher=JEventDispatcher;
})(jigLib);