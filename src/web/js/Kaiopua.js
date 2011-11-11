/*
Kaiopua.js
Main module, handles browser events.
*/

var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        utils = main.utils = main.utils || {},
        loader, error, game,
        lastGamma, lastBeta,
        libList = [
            "js/lib/jquery-1.6.4.min.js",
            "js/lib/RequestAnimationFrame.js",
            "js/lib/requestInterval.js",
            "js/lib/requestTimeout.js",
            "js/lib/signals.min.js"
        ],
        setupList = [
            "js/utils/Dev.js",
            "js/utils/Error.js",
            "js/utils/Loader.js",
            "js/utils/UIHelper.js",
            "js/game/Game.js"
        ];
    
    /*===================================================
    
    internal init
    
    =====================================================*/
    
	// force cache-busting
	$LAB.setGlobalDefaults({ CacheBust: true });
	
    // load scripts
    $LAB.script( libList ).wait( init_basics )
        .script( setupList ).wait( init_setup );
    
    function init_basics () {
        
        // shared
        shared.mice = [];
        shared.screenWidth = $(window).width();
        shared.screenHeight = $(window).height();
        shared.originLink = window.location.pathname.toString();
        
        shared.frameRateMax = 60;
        shared.frameRateMin = 20;
        shared.time = new Date().getTime();
        shared.timeLast = shared.time;
        shared.refreshInterval = 1000 / 60;
        
        shared.html= {
            staticMenu: $('#static_menu'),
            gameContainer: $('#game'),
            errorContainer: $('#error_container')
        };
        
        shared.signals = {
    
            mousedown : new signals.Signal(),
            mouseup : new signals.Signal(),
            mousemoved : new signals.Signal(),
            mousewheel : new signals.Signal(),
    
            keydown : new signals.Signal(),
            keyup : new signals.Signal(),
    
            windowresized : new signals.Signal(),
            
            loadItemCompleted : new signals.Signal(),
            loadListCompleted : new signals.Signal(),
            loadAllCompleted : new signals.Signal(),
            
            error : new signals.Signal()
            
        };
        
        // add listeners for events
        // each listener dispatches shared signal
        $(document).bind( 'mousedown touchstart', on_mouse_down );
        $(document).bind( 'mouseup touchend', on_mouse_up );
        $(document).bind( 'mousemove touchmove', on_mouse_move );
		$(document).bind( 'mouseleave touchleave', on_mouse_leave );
        $(document).bind( 'mousewheel', on_mouse_wheel );
		$(shared.html.gameContainer).bind( 'contextmenu', on_game_context_menu );
        
        $(document).bind( 'keydown', on_key_down );
        $(document).bind( 'keyup', on_key_up );
    
        $(window).bind( 'deviceorientation', on_window_device_orientation );
        $(window).bind( 'MozOrientation', on_window_device_orientation);
    
        $(window).bind( 'resize', on_window_resize );
        
        window.onerror = on_error;
        shared.signals.error.add( on_error );
    }
    
    function init_setup () {
        
        // utils
        
        error = utils.error;
        loader = utils.loader;
        
        loader.init_ui();
        
        // game
        
        game = main.game;
        
        // check for errors
        
        if (error.check()) {
            error.process();
        }
        // safe to start game
        else {
            game.init();
        }
        
        // resize once
        on_window_resize();
    }
    
    /*===================================================
    
    event functions
    
    =====================================================*/
	
	function handle_touch_event ( e, eventActual ) {
		
		var i, l, fingers, touch;
		
		// for each finger involved in the event
		
		fingers = e.changedTouches;
		
		for( i = 0, l = fingers.length; i < l; i += 1 ) {
			
			touch = fingers[ touchIndex ];
			
			touch.button = 0;
			
			// send as individual event
			
			eventActual( touch );
			
		}
		
	}
	
	function handle_mouse_identifier ( e ) {
		
		var id = e.identifier = e.identifier || 0;
		
		if ( id >= shared.mice.length ) {
			shared.mice[ id ] = { 
				x: 0,
				lx: 0,
				y: 0,
				ly: 0,
				down: false 
			};
		}
		
	}
    
    function on_mouse_down( e ) {
		
		var eOriginal = e.originalEvent;
		
		// is touch event
		
		if (typeof eOriginal !== "undefined" && typeof eOriginal.touches !== "undefined" && typeof eOriginal.changedTouches !== "undefined"){
			
			handle_touch_event( eOriginal, on_mouse_down );
			
		}
		else {
			
			handle_mouse_identifier( e );
			
			shared.mice[ e.identifier ].down = true;
		
			shared.signals.mousedown.dispatch( e );
			
		}
        
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    
    function on_mouse_up( e ) {
		
		var eOriginal = e.originalEvent;
		
		// is touch event
		
		if (typeof eOriginal !== "undefined" && typeof eOriginal.touches !== "undefined" && typeof eOriginal.changedTouches !== "undefined"){
			
			handle_touch_event( eOriginal, on_mouse_up );
		}
		else {
			
			handle_mouse_identifier( e );
			
			shared.mice[ e.identifier ].down = false;
			
			shared.signals.mouseup.dispatch( e );
        
		}
		
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    
    function on_mouse_move( e ) {
		
		var eOriginal = e.originalEvent, mouse;
		
		// is touch event
		
		if (typeof eOriginal !== "undefined" && typeof eOriginal.touches !== "undefined" && typeof eOriginal.changedTouches !== "undefined"){
			
			handle_touch_event( eOriginal, on_mouse_move );
		}
		else {
			
			handle_mouse_identifier( e );
			
			mouse = shared.mice[ e.identifier ];
			
			mouse.x = e.clientX;
			mouse.y = e.clientY;
			
			shared.signals.mousemoved.dispatch( e );
			
		}
        
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
	
	function on_mouse_leave ( e ) {
		
		var eOriginal = e.originalEvent, mouse;
		
		// is touch event
		
		if (typeof eOriginal !== "undefined" && typeof eOriginal.touches !== "undefined" && typeof eOriginal.changedTouches !== "undefined"){
			
			handle_touch_event( eOriginal, on_mouse_leave );
		}
		else {
			
			handle_mouse_identifier( e );
			
			mouse = shared.mice[ e.identifier ];
			
			if ( mouse.down === true ) {
				
				on_mouse_up( e );
				
			}
			
		}
        
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    
    function on_mouse_wheel( e ) {
        shared.signals.mousewheel.dispatch( e );
        
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
	
	function on_game_context_menu( e ) {
        
        e.preventDefault();
        e.stopPropagation();
        return false;
		
    }
    
    function on_window_device_orientation( e ) {
        var i, l, mice, mouse, eCopy, overThreshold, gamma, beta, x, y;
        
        if ( ! e.gamma && !e.beta ) {
                e.gamma = -(e.x * (180 / Math.PI));
                e.beta = -(e.y * (180 / Math.PI));
        } 
        else if( e.alpha === null && e.beta === null && e.gamma === null ) {
                $(window).unbind( "deviceorientation", on_window_device_orientation );
                $(window).unbind( "MozOrientation", on_window_device_orientation );
        }
        
        overThreshold = Math.abs(e.gamma) > 4 || Math.abs(e.beta) > 4;
        gamma = overThreshold ? e.gamma : 0;
        beta = overThreshold ? e.beta : 0;
        
        if ( lastGamma !== gamma || lastBeta !== beta) {
			
			mice = shared.mice;
			
			for ( i = 0, l = mice.length; i < l; i += 1 ) {
				
				mouse = mice[ i ];
			
				x = Math.round( 1.5 * gamma ) + mouse.x;
				y = ( - Math.round( 1.5 * beta ) ) + mouse.y;
				
				if( Math.abs( x ) > window.innerWidth ) {
						if( x < 0 ) {
								x = -window.innerWidth;
						} 
						else {
								x = window.innerWidth;
						}
				}
				
				if( Math.abs( y ) > window.innerHeight ) {
						if( y < 0 ) {
								y = -window.innerHeight;
						} 
						else {
								y = window.innerHeight;
						}
				}
				
				mouse.x = x;
				mouse.y = y;
				
				eCopy = $.extend( {}, e );
				
				eCopy.identifier = i;
				
				shared.signals.mousemoved.dispatch( eCopy );
			
			}
			
			lastGamma = gamma;
			lastBeta = beta;
            
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }

    function on_key_down( e ) {
        shared.signals.keydown.dispatch( e );
        
        /*
        e.preventDefault();
        e.stopPropagation();
        return false;
        */
    }

    function on_key_up( e ) {
        shared.signals.keyup.dispatch( e );
        
        /*
        e.preventDefault();
        e.stopPropagation();
        return false;
        */
    }

    function on_window_resize( e ) {
        
        shared.screenWidth = $(window).width();
        shared.screenHeight = $(window).height();
        
        shared.signals.windowresized.dispatch(shared.screenWidth, shared.screenHeight);
        
        if (typeof e !== 'undefined') {
            e.preventDefault();
            e.stopPropagation();
        }
        return false;
    }
    
    function on_error ( error, url, lineNumber ) {
        
        if (typeof main.game !== 'undefined') {
            main.game.pause();
        }
        
        if (typeof main.utils.dev !== 'undefined') {
            main.utils.dev.log_error(error, url, lineNumber);
        }
        
    }
    
    return main; 
    
}(KAIOPUA || {}));