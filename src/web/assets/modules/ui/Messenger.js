/*
 *
 * Messenger.js
 * Handler to show messages to user.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/ui/Messenger.js",
		_Messenger = {},
		_Game,
		queue,
		open = false,
		active = false,
		priority = false,
		confirmRequired = false;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Messenger,
		requirements: [
			"assets/modules/core/Game.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( g ) {
		console.log('internal messenger', _Messenger);
		
		_Game = g;
		
		// properties
		
		_Messenger.timeLive = 2000;
		_Messenger.pulseTimeShow = 1000;
		_Messenger.pulseTimeHide = 1000;
		_Messenger.pulseOpacityShow = 1;
		_Messenger.pulseOpacityHide = 0.2;
		
		// ui
		
		
		// functions
		
		_Messenger.show_message = show_message;
		_Messenger.hide_message = hide_message;
		_Messenger.reset = reset;
		
		Object.defineProperty( _Messenger, 'active', { 
			get : function () { return active; }
		} );
		
		// reset
		
		shared.signals.gameStopped.add( reset, _Messenger );
		
		reset();
		
	}
	
	/*===================================================
    
    reset
    
    =====================================================*/
	
	function reset () {
		
		// clear queue
		
		queue = [];
		
		// hide current
		
		hide_current_message();
		
		// remove signal
		
		shared.signals.gameResumed.remove( step_message_queue );
		
	}
	
	/*===================================================
    
    message
    
    =====================================================*/
	
	function get_is_show_safe () {
		
		return open === true || _Game.paused !== true;
		
	}
	
	function show_message ( parameters ) {
		
		// add message into queue
		
		queue.push( parameters );
		
		// if only 1 message, show immediately
		
		if ( queue.length === 1 ) {
			
			step_message_queue();
			
		}
		
	}
	
	function step_message_queue () {
		
		if ( get_is_show_safe() ) {
			
			if ( _Messenger.container.hiding !== true ) {
				
				if ( active === true ) {
					
					hide_current_message( { callback: step_message_queue } );
					
				}
				else {
					
					show_next_message();
					
				}
				
			}
			
		}
		else {
			
			shared.signals.gameResumed.addOnce( step_message_queue );
			
		}
		
	}
	
	function show_next_message () {
		
		var parameters,
			callback;
		
		// if message in queue
		
		if ( queue.length > 0 ) {
			
			// set open
			
			open = true;
			
			// handle parameters
			
			parameters = queue[ 0 ] || {};
			
			priority = typeof parameters.priority === 'boolean' ? parameters.priority : false;
			active = true;
			
			// if priority message
			
			if ( priority === true ) {
				
				_Game.pause( true );
			
				callback = priority_message_callback;
				
			}
			else {
				
				_Game.resume();
				
				callback = passive_message_callback;
				
			}
			
			// show
			
			
			
		}
		
	}
	
	function hide_message () {
		
		step_message_queue();
		
	}
	
	function hide_current_message ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		// clear current from queue
		
		queue.shift();
		
		// signals
		
		shared.signals.keyReleased.remove( hide_message );
		shared.signals.gamePointerTapped.remove( hide_message );
		
		// clear timeout
		
		if ( typeof _Messenger.liveTimeoutHandle !== 'undefined' ) {
			
			clearRequestTimeout( _Messenger.liveTimeoutHandle );
			
		}
		
		// active
		
		active = false;
		
		// was priority message
		
		if ( priority === true ) {
			
			priority = false;
			
			if ( queue.length === 0 ) {
				
				_Game.resume();
				
			}
			
		}
		
		// open
		
		if ( queue.length === 0 ) {
			
			open = false;
			
		}
		
		// hide
		
	}
	
	/*===================================================
    
    priority
    
    =====================================================*/
	
	function priority_message_callback () {
		
		// pulse
		
		
		
		// signals
		
		if ( confirmRequired !== true ) {
			
			shared.signals.keyReleased.add( hide_message );
			shared.signals.gamePointerTapped.add( hide_message );
			
		}
		
	}
	
	/*===================================================
    
	passive
    
    =====================================================*/
	
	function passive_message_callback () {
		
		_Messenger.liveTimeoutHandle = requestTimeout( hide_message, _Messenger.timeLive );
		
	}
	
} (KAIOPUA) );