/*
 * Hammer.JS
 * version 0.6.1
 * author: Eight Media
 * https://github.com/EightMedia/hammer.js
 *
 * Reworked by Collin Hover / collinhover.com
 * HAMMER is new global, and HAMMER.Instance( element ) gives an element touch gesture capabilities
 * This solves issues where a HAMMERed child of a HAMMERed element was causing broken behavior or no event bubbling
 *
 */
var HAMMER = ( function ( main ) {
	
	var options = {
			// prevent the default event or not... might be buggy when false
			prevent_default    : false,
			css_hacks          : true,

			swipe              : true,
			swipe_time         : 200,   // ms
			swipe_min_distance : 20, // pixels

			drag               : true,
			drag_vertical      : true,
			drag_horizontal    : true,
			// minimum distance before the drag event starts
			drag_min_distance  : 20, // pixels

			// pinch zoom and rotation
			transform          : true,
			scale_treshold     : 0.1,
			rotation_treshold  : 15, // degrees

			tap                : true,
			tap_double         : true,
			tap_max_interval   : 300,
			tap_max_distance   : 10,
			tap_double_distance: 20,

			hold               : true,
			hold_timeout       : 500
		},
		_distance = 0,// holds the distance that has been moved
		_angle = 0,// holds the exact angle that has been moved
		_direction = 0,// holds the direction that has been moved
		_pos = { },// holds position movement for sliding
		_fingers = 0,// how many fingers are on the screen
		_first = false,
		_gesture,
		_prev_gesture,
		_prev_tap_pos = {x: 0, y: 0},
		_prev_tap_end_time,
		_touch_start_time,
		_hold_timer,
		_offset = {},
		_has_touch = ('ontouchstart' in window),
		_event_name_start = _has_touch ? 'touchstart' : 'mousedown',
		_event_name_move = _has_touch ? 'touchmove' : 'mousemove',
		_event_name_end = _has_touch ? 'touchend' : 'mouseup',
		_event_name_cancel = _has_touch ? 'touchcancel' : '',
		_hammer_instances = [],
		_events_triggerable = [],
		_event_objects = {},
		_hold_instances = [],
		_hammer_count = 0,
		_gestures = {
			// hold gesture
			// fired on touchstart
			hold : function( event )
			{
				// only when one finger is on the screen
				if(options.hold) {
					_gesture = 'hold';
					
					// clear previous hold
					
					if ( typeof _hold_timer !== 'undefined' ) {
						clearTimeout(_hold_timer);
						_hold_timer = undefined;
					}
					
					// init new hold timer
					
					_hold_timer = setTimeout( function() {
						
						var i, il,
							hammerInstance,
							eventObject;
						
						if(_gesture == 'hold') {
							
							eventObject = {
								originalEvent   : event,
								position        : _pos.start
							};
							
							// for each hold instance
							
							for ( i = 0, il = _hold_instances.length; i < il; i++ ) {
								
								hammerInstance = _hold_instances[ i ];
								
								triggerEvent( hammerInstance, "hold", eventObject );
								
							}
							
						}
						
					}, options.hold_timeout);
					
				}
			},

			// swipe gesture
			// fired on touchend
			swipe : function( event )
			{
				if(!_pos.move) {
					return;
				}

				// get the distance we moved
				var _distance_x = _pos.move[0].x - _pos.start[0].x;
				var _distance_y = _pos.move[0].y - _pos.start[0].y;
				_distance = Math.sqrt(_distance_x*_distance_x + _distance_y*_distance_y);

				// compare the kind of gesture by time
				var now = new Date().getTime();
				var touch_time = now - _touch_start_time;

				if(options.swipe && (options.swipe_time > touch_time) && (_distance > options.swipe_min_distance)) {
					// calculate the angle
					_angle = getAngle(_pos.start[0], _pos.move[0]);
					_direction = getDirectionFromAngle(_angle);

					_gesture = 'swipe';

					var position = { x: _pos.move[0].x - _offset.left,
						y: _pos.move[0].y - _offset.top };
					
					_events_triggerable.push( 'swipe' );
					_event_objects.swipe = {
						originalEvent   : event,
						position        : position,
						direction       : _direction,
						distance        : _distance,
						distanceX       : _distance_x,
						distanceY       : _distance_y,
						angle           : _angle
					};
					
				}
			},
			
			// drag gesture
			// fired on mousemove
			drag : function( event )
			{
				// get the distance we moved
				var _distance_x = _pos.move[0].x - _pos.start[0].x;
				var _distance_y = _pos.move[0].y - _pos.start[0].y;
				_distance = Math.sqrt(_distance_x * _distance_x + _distance_y * _distance_y);
				
				// drag
				// minimal movement required
				if(options.drag && (_distance > options.drag_min_distance) || _gesture == 'drag') {
					// calculate the angle
					_angle = getAngle(_pos.start[0], _pos.move[0]);
					_direction = getDirectionFromAngle(_angle);

					// check the movement and stop if we go in the wrong direction
					var is_vertical = (_direction == 'up' || _direction == 'down');
					if(((is_vertical && !options.drag_vertical) || (!is_vertical && !options.drag_horizontal))
						&& (_distance > options.drag_min_distance)) {
						return;
					}

					_gesture = 'drag';

					var position = { x: _pos.move[0].x - _offset.left,
						y: _pos.move[0].y - _offset.top };
					
					_event_objects.drag = {
						originalEvent   : event,
						position        : position,
						direction       : _direction,
						distance        : _distance,
						distanceX       : _distance_x,
						distanceY       : _distance_y,
						angle           : _angle
					};
					
					// on the first time trigger the start event
					if(_first) {
						//$( document ).on( 
						//$event.add( document, "mousemove mouseup", drag.handler, dd );
						_events_triggerable.push( 'dragstart' );
						_event_objects.dragstart = _event_objects.drag;

						_first = false;
						
						// disable text selection
						
						allowTextSelect( false );
						
					}
					
					// allow drag to trigger

					_events_triggerable.push( 'drag' );
					
				}
			},
			
			// transform gesture
			// fired on touchmove
			transform : function( event )
			{
				if(options.transform) {
					if(countFingers(event) != 2) {
						return false;
					}

					var rotation = calculateRotation(_pos.start, _pos.move);
					var scale = calculateScale(_pos.start, _pos.move);

					if(_gesture != 'drag' &&
						(_gesture == 'transform' || Math.abs(1-scale) > options.scale_treshold || Math.abs(rotation) > options.rotation_treshold)) {
						_gesture = 'transform';

						_pos.center = {  x: ((_pos.move[0].x + _pos.move[1].x) / 2) - _offset.left,
							y: ((_pos.move[0].y + _pos.move[1].y) / 2) - _offset.top };

						_events_triggerable.push( 'transform' );
						_event_objects.transform = {
							originalEvent   : event,
							position        : _pos.center,
							scale           : scale,
							rotation        : rotation
						};

						// on the first time trigger the start event
						if(_first) {
							
							_events_triggerable.push( 'transformstart' );
							_event_objects.transformstart = _event_objects.transform;
							
							_first = false;
							
						}

						return true;
					}
				}

				return false;
			},
			
			// tap and double tap gesture
			// fired on touchend
			tap : function( event )
			{
				
				// compare the kind of gesture by time
				var now = new Date().getTime();
				var touch_time = now - _touch_start_time;
				
				// dont fire when hold is fired
				if(options.hold && !(options.hold && options.hold_timeout > touch_time)) {
					return;
				}

				// when previous event was tap and the tap was max_interval ms ago
				var is_double_tap = (function(){
					if (_prev_tap_pos &&
						options.tap_double &&
						_prev_gesture == 'tap' &&
						(_touch_start_time - _prev_tap_end_time) < options.tap_max_interval)
					{
						var x_distance = Math.abs(_prev_tap_pos[0].x - _pos.start[0].x);
						var y_distance = Math.abs(_prev_tap_pos[0].y - _pos.start[0].y);
						return (_prev_tap_pos && _pos.start && Math.max(x_distance, y_distance) < options.tap_double_distance);
					}
					return false;
				})();
				
				if(is_double_tap) {
					_gesture = 'double_tap';
					_prev_tap_end_time = null;
					
					_events_triggerable.push( 'doubletap' );
					_event_objects.doubletap = {
						originalEvent   : event,
						position        : _pos.start
					};
					
				}
				// single tap is single touch
				else {
					var x_distance = (_pos.move) ? Math.abs(_pos.move[0].x - _pos.start[0].x) : 0;
					var y_distance =  (_pos.move) ? Math.abs(_pos.move[0].y - _pos.start[0].y) : 0;
					_distance = Math.max(x_distance, y_distance);
					
					if(_distance < options.tap_max_distance) {
						_gesture = 'tap';
						_prev_tap_end_time = now;
						_prev_tap_pos = _pos.start;
						
						if(options.tap) {
							_events_triggerable.push( 'tap' );
							_event_objects.tap = {
								originalEvent   : event,
								position        : _pos.start
							};
						}
					}
				}

			}

		};
	
	
	// public properties
	
	main.options = options;
	
	/**
	 * option setter/getter
	 * @param   string  key
	 * @param   mixed   value
	 * @return  mixed   value
	 */
	main.option = function(key, val) {
		if( typeof val !== 'undefined' ) {
			options[key] = val;
		}

		return options[key];
	};
	
	// 
	/**
	 * toggles text selection attributes ON (true) or OFF (false)
	 * based on jquery.event.drag by Three Dub Media
	 * @param   boolean  state
	 */
	function allowTextSelect ( state ) {
		
		$( document )[ state ? "off" : "on" ]( "selectstart", killEvent )
		$( 'html' )[ state ? "removeClass" : "addClass" ]( "unselectable" );
		document.unselectable = state ? "off" : "on";
		
	}
	
	/**
	 * angle to direction define
	 * @param  float    angle
	 * @return string   direction
	 */
	function getDirectionFromAngle( angle )
	{
		var directions = {
			down: angle >= 45 && angle < 135, //90
			left: angle >= 135 || angle <= -135, //180
			up: angle < -45 && angle > -135, //270
			right: angle >= -45 && angle <= 45 //0
		};

		var direction, key;
		for(key in directions){
			if(directions[key]){
				direction = key;
				break;
			}
		}
		return direction;
	}
	
	/**
	 * count the number of fingers in the event
	 * when no fingers are detected, one finger is returned (mouse pointer)
	 * @param  event
	 * @return int  fingers
	 */
	function countFingers( event )
	{
		// there is a bug on android (until v4?) that touches is always 1,
		// so no multitouch is supported, e.g. no, zoom and rotation...
		return event.touches ? event.touches.length : 1;
	}
	
	/**
	 * get the x and y positions from the event object
	 * @param  event
	 * @return array  [{ x: int, y: int }]
	 */
	function getXYfromEvent( event )
	{
		event = event || window.event;

		// no touches, use the event pageX and pageY
		if(!_has_touch) {
			var doc = document,
				body = doc.body;

			return [{
				x: event.pageX || event.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && doc.clientLeft || 0 ),
				y: event.pageY || event.clientY + ( doc && doc.scrollTop || body && body.scrollTop || 0 ) - ( doc && doc.clientTop || body && doc.clientTop || 0 )
			}];
		}
		// multitouch, return array with positions
		else {
			var pos = [], src, touches = event.touches.length > 0 ? event.touches : event.changedTouches;
			for(var t=0, len=touches.length; t<len; t++) {
				src = touches[t];
				pos.push({ x: src.pageX, y: src.pageY });
			}
			return pos;
		}
	}
	
	/**
	 * calculate the angle between two points
	 * @param   object  pos1 { x: int, y: int }
	 * @param   object  pos2 { x: int, y: int }
	 */
	function getAngle( pos1, pos2 )
	{
		return Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x) * 180 / Math.PI;
	}


	/**
	 * calculate the scale size between two fingers
	 * @param   object  pos_start
	 * @param   object  pos_move
	 * @return  float   scale
	 */
	function calculateScale(pos_start, pos_move)
	{
		if(pos_start.length == 2 && pos_move.length == 2) {
			var x, y;

			x = pos_start[0].x - pos_start[1].x;
			y = pos_start[0].y - pos_start[1].y;
			var start_distance = Math.sqrt((x*x) + (y*y));

			x = pos_move[0].x - pos_move[1].x;
			y = pos_move[0].y - pos_move[1].y;
			var end_distance = Math.sqrt((x*x) + (y*y));

			return end_distance / start_distance;
		}

		return 0;
	}


	/**
	 * calculate the rotation degrees between two fingers
	 * @param   object  pos_start
	 * @param   object  pos_move
	 * @return  float   rotation
	 */
	function calculateRotation(pos_start, pos_move)
	{
		if(pos_start.length == 2 && pos_move.length == 2) {
			var x, y;

			x = pos_start[0].x - pos_start[1].x;
			y = pos_start[0].y - pos_start[1].y;
			var start_rotation = Math.atan2(y, x) * 180 / Math.PI;

			x = pos_move[0].x - pos_move[1].x;
			y = pos_move[0].y - pos_move[1].y;
			var end_rotation = Math.atan2(y, x) * 180 / Math.PI;

			return end_rotation - start_rotation;
		}

		return 0;
	}
	
	/**
	 * cancel event
	 * @param   object  event
	 * @return  void
	 */
	function cancelEvent(event)
	{
		event = event || window.event;
		if(event.preventDefault){
			event.preventDefault();
			event.stopPropagation();
		}else{
			event.returnValue = false;
			event.cancelBubble = true;
		}
	}
	
	function killEvent () {
		return false;
	}
	
	/**
	 * reset the internal vars to the start values
	 */
	function reset()
	{
		
		_fingers = 0;
		_distance = 0;
		_angle = 0;
		_gesture = null;
		
		resetEventTriggerLists();
		_hold_instances = [];
		
	}
	
	/**
	 * reset all valid events
	 */
	function resetEventTriggerLists () {
		
		_events_triggerable = [];
		_event_objects = {};
		
	}
	
	/**
	 * find if element is (inside) given parent element
	 * @param   object  element
	 * @param   object  parent
	 * @return  bool    inside
	 */
	function isInsideHammer(parent, child) {
		// get related target for IE
		if(!child && window.event && window.event.toElement){
			child = window.event.toElement;
		}

		if(parent === child){
			return true;
		}

		// loop over parentNodes of child until we find hammer element
		if(child){
			var node = child.parentNode;
			while(node !== null){
				if(node === parent){
					return true;
				};
				node = node.parentNode;
			}
		}
		return false;
	}
	
	/**
	 * attach event
	 * @param   node    element
	 * @param   string  types
	 * @param   object  callback
	 */
	function addEvent( element, types, callback ) {
		
		types = types.split(" ");
		
		for(var t= 0,len=types.length; t<len; t++) {
			if(element.addEventListener){
				element.addEventListener(types[t], callback, false);
			}
			else if(document.attachEvent){
				element.attachEvent("on"+ types[t], callback);
			}
		}
		
	}
	
	/**
	 * trigger all valid events
	 * @param object hammerInstance
	 */
	function triggerEvents ( hammerInstance ) {
		
		var i, il = _events_triggerable.length,
			eventName,
			eventObject;
		
		if ( il > 0 ) {
			
			for ( i = 0; i < il; i++ ) {
				
				eventName = _events_triggerable[ i ];
				eventObject = _event_objects[ eventName ];
				
				triggerEvent( hammerInstance, eventName, eventObject );
				
			}
			
		}
		
	}
	
	/**
	 * trigger an event/callback by name with params
	 * @param object hammerInstance
	 * @param string eventName
	 * @param object eventObject
	 */
	function triggerEvent( hammerInstance, eventName, eventObject )
	{
		
		// update event object
		
		eventObject.touches = getXYfromEvent(eventObject.originalEvent);
		eventObject.type = eventName;

		// trigger callback
		
		if( typeof hammerInstance["on"+ eventName] === 'function' ) {
			
			// if event does not yet have a target
			
			if ( !eventObject.target ) {
				
				eventObject.target = hammerInstance.element;
				
			}
			
			hammerInstance["on"+ eventName].call( hammerInstance, eventObject );
			
		}
		
	}
	
	/**
	 * handle an event/callback for a hammmer instance
	 * @param object hammerInstance
	 * @param event 
	 */
	function handleEvents ( hammerInstance, event ) {
	
		var element = hammerInstance.element,
			type = event.type,
			index;
		
		// start
		
		if ( type === _event_name_start ) {
			
			// one calculation per bubbling
			
			if ( event.hammer !== true ) {
				
				event.hammer = true;
				
				// reset lists
				
				resetEventTriggerLists();
				_hold_instances = [];
				
				// event properties
				
				_pos.start = getXYfromEvent(event);
				_fingers = countFingers(event);
				_first = true;
				_touch_start_time = new Date().getTime();
				hammerInstance.event_start = event;
				
				// borrowed from jquery offset https://github.com/jquery/jquery/blob/master/src/offset.js
				var box = element.getBoundingClientRect();
				var clientTop  = element.clientTop  || document.body.clientTop  || 0;
				var clientLeft = element.clientLeft || document.body.clientLeft || 0;
				var scrollTop  = window.pageYOffset || element.scrollTop  || document.body.scrollTop;
				var scrollLeft = window.pageXOffset || element.scrollLeft || document.body.scrollLeft;

				_offset = {
					top: box.top + scrollTop - clientTop,
					left: box.left + scrollLeft - clientLeft
				};

				_mousedown = true;
				
				// add global listeners to properly handle events
				
				$( window ).on( _event_name_move + ' ' + _event_name_end + ' ' + _event_name_cancel, hammerInstance.handleEventsInternal );

				// hold gesture
				
				_gestures.hold( event );
				
			}
			
			// add instance to list
			
			_hammer_instances.push( hammerInstance );
			_hold_instances.push( hammerInstance );
			
			// trigger hammer events
			
			triggerEvents( hammerInstance, event );
			
			if(options.prevent_default) {
				cancelEvent(event);
			}
			
		}
		// move
		else if ( type === _event_name_move ) {
			
			if ( _mousedown === true ) {
				
				// one calculation per bubbling
				
				if ( event.hammer !== true ) {
					
					event.hammer = true;
					
					// reset lists
					
					resetEventTriggerLists();
					
					// event properties
					
					_pos.move = getXYfromEvent(event);

					if(!_gestures.transform( event )) {
						_gestures.drag( event );
					}
					
				}
				
				// trigger hammer events
				
				triggerEvents( hammerInstance, event );
				
				if(options.prevent_default) {
					cancelEvent(event);
				}
			}
			
		}
		// end
		else if ( type === _event_name_end || type === _event_name_cancel ) {//case 'mouseout':
			
			if ( hammerInstance.mousedown === true ) {
				
				// one calculation per bubbling
				
				if ( event.hammer !== true ) {
					
					event.hammer = true;
					
					// reset lists
					
					resetEventTriggerLists();
					
					// remove global listeners
					
					$( window ).off( _event_name_move + ' ' + _event_name_end + ' ' + _event_name_cancel, hammerInstance.handleEventsInternal );
					
					// event properties
					
					if( _gesture !== 'transform' && event.touches && event.touches.length > 0 ) {
						return false;
					}
					
					if ( typeof _hold_timer !== 'undefined' ) {
						clearTimeout(_hold_timer);
						_hold_timer = undefined;
					}
					
					var dragging = _gesture == 'drag';
					
					// calculate swipe
					
					_gestures.swipe( event );
					
					// drag gesture
					// dragstart is triggered, so dragend is possible
					if(dragging) {
						
						_events_triggerable.push( 'dragend' );
						_event_objects.dragend = {
							originalEvent   : event,
							direction       : _direction,
							distance        : _distance,
							angle           : _angle
						};
						
						// enable text selection
						
						allowTextSelect( true );
						
					}
					// transform
					// transformstart is triggered, so transformed is possible
					else if(_gesture == 'transform') {
						_events_triggerable.push( 'transformend' );
						_event_objects.transformend = {
							originalEvent   : event,
							position        : _pos.center,
							scale           : calculateScale(_pos.start, _pos.move),
							rotation        : calculateRotation(_pos.start, _pos.move)
						};
					}
					else {
						_gestures.tap( hammerInstance.event_start );
					}

					_prev_gesture = _gesture;

					// release event
					_events_triggerable.push( 'release' );
					_event_objects.release = {
						originalEvent   : event,
						gesture         : _gesture
					};
					
					// reset hammerInstance
					
					hammerInstance.reset();
					
				}
				
				// trigger hammer events
				
				triggerEvents( hammerInstance, event );
				
				if(options.prevent_default) {
					cancelEvent(event);
				}
				
				// remove from instances list
				
				index = _hammer_instances.indexOf( hammerInstance );
				
				if ( index !== -1 ) {
					
					_hammer_instances.splice( index, 1 );
					
					// if no more instances
					
					if ( _hammer_instances.length === 0 ) {
						
						// reset vars
						reset();
						
					}
					
				}
				
			}
			
		}
		
	}
	
	/**
	 * create a hammer instance and gives an element touch events, use "new HAMMER.Instance( element )"
	 * @param node element
	 */
	main.Instance = function HammerInstance ( element ) {
		
		var me = this;
		
		me.id = _hammer_count++;
		me.element = element;
		
		me.handleEventsInternal = function ( event ) {
			
			handleEvents( me, event );
			
		};
		
		me.reset = function () {
			
			me.event_start = undefined;
			
		}

		// some css hacks
		
		if( options.css_hacks === true ) {
			
			var vendors = ['webkit','moz','ms','o',''];
			var css_props = {
				"userSelect": "none",
				"touchCallout": "none",
				"userDrag": "none",
				"tapHighlightColor": "rgba(0,0,0,0)"
			};

			var prop = '';
			for(var i = 0; i < vendors.length; i++) {
				for(var p in css_props) {
					prop = p;
					if(vendors[i]) {
						prop = vendors[i] + prop.substring(0, 1).toUpperCase() + prop.substring(1);
					}
					element.style[ prop ] = css_props[p];
				}
			}
			
		}

		// bind events
		
		addEvent( element, _event_name_start/* + ' ' + _event_name_move + ' ' + _event_name_end + ' ' + _event_name_cancel*/, me.handleEventsInternal );
		/*addEvent( element, "mouseout", function(event) {
			if(!isInsideHammer(element, event.relatedTarget)) {
				handleEvents(event);
			}
		} );*/
		
	}
	
	return main;
	
} ( HAMMER || {} ) );

/*
 * adds jQuery to Hammer.JS
 * version 0.9
 * author: Damien Antipa
 * https://github.com/dantipa/hammer.js
 *
 * Reworked by Collin Hover / collinhover.com
 */
(function ($) {
    var hammerEvents = ['hold','tap','doubletap','transformstart','transform','transformend','dragstart','drag','dragend','swipe','release'];

    $.each(hammerEvents, function(i, eventName) {

        $.event.special[eventName] = {
			
			setup: function(data, namespaces, eventHandle) {
                var $target = $(this),
                    hammer;

                if (!$target.data('hammerjs')) {
                    $target.data('hammerjs', new HAMMER.Instance(this));
                }

                hammer = $target.data('hammerjs');

                hammer['on'+ eventName] = function ( event ) {
					// we trigger handlers only here, as original/native event will bubble
					// if we allow hammer events to bubble (i.e. using trigger instead of triggerHandler)
					// when the original event bubbles it will trigger another new hammer event that bubbles up
					// and containers will trigger their own hammer event once for every child that triggers a hammer event (this is bad)
					console.log( 'hammer trigger event for ', eventName, event, event.target );
                    $target.trigger( $.Event( eventName, event ) );
                };
				
            },

            teardown: function(namespaces) {
                var $target = $(this),
                    hammer = $target.data('hammerjs');
				
                if(hammer && hammer['on'+ eventName]) {
                    delete hammer['on'+ eventName];
                }
            }
        };
    });
}(jQuery));