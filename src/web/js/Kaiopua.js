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
        shared.mouse = { x: 0, y: 0 };
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
        $(document).bind( 'mousedown touchstart', onDocumentMouseDown );
        $(document).bind( 'mouseup touchend', onDocumentMouseUp );
        $(document).bind( 'mousemove', onDocumentMouseMove );
        $(document).bind( 'mousewheel', onDocumentMouseWheel );
		$(shared.html.gameContainer).bind( 'contextmenu', onGameContextMenu );
        
        $(document).bind( 'keydown', onDocumentKeyDown );
        $(document).bind( 'keyup', onDocumentKeyUp );
    
        $(window).bind( 'deviceorientation', onWindowDeviceOrientation );
        $(window).bind( 'MozOrientation', onWindowDeviceOrientation);
    
        $(window).bind( 'resize', onWindowResize );
        
        window.onerror = onError;
        shared.signals.error.add(onError);
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
        onWindowResize();
    }
    
    /*===================================================
    
    functions
    
    =====================================================*/
    
    function onDocumentMouseDown( e ) {
		
		var eOriginal = e.originalEvent, i, l, fingers, touch;
		
		// is touch event
		
		if (typeof eOriginal !== "undefined" && typeof eOriginal.touches !== "undefined" && typeof eOriginal.changedTouches !== "undefined"){
			
			// for each finger involved in the event
			
			fingers = eOriginal.changedTouches;
			
			for( i = 0, l = fingers.length; i < l; i += 1 ) {
				
				touch = fingers[i];
				
				// send as individual mouse event
				
				onDocumentMouseDown( touch );
				
			}
		}
		else {
		
			shared.signals.mousedown.dispatch( e );
			
		}
        
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    
    function onDocumentMouseUp( e ) {
		
		var eOriginal = e.originalEvent, i, l, fingers, touch;
		
		// is touch event
		
		if (typeof eOriginal !== "undefined" && typeof eOriginal.touches !== "undefined" && typeof eOriginal.changedTouches !== "undefined"){
			
			// for each finger involved in the event
			
			fingers = eOriginal.changedTouches;
			
			for( i = 0, l = fingers.length; i < l; i += 1 ) {
				
				touch = fingers[i];
				
				// send as individual mouse event
				
				onDocumentMouseUp( touch );
				
			}
		}
		else {
			
			shared.signals.mouseup.dispatch( e );
        
		}
		
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    
    function onDocumentMouseMove( e ) {
		
		var eOriginal = e.originalEvent, i, l, fingers, touch;
		
		// is touch event
		
		if (typeof eOriginal !== "undefined" && typeof eOriginal.touches !== "undefined" && typeof eOriginal.changedTouches !== "undefined"){
			
			// for each finger involved in the event
			
			fingers = eOriginal.changedTouches;
			
			for( i = 0, l = fingers.length; i < l; i += 1 ) {
				
				touch = fingers[i];
				
				// send as individual mouse event
				
				onDocumentMouseMove( touch );
				
			}
		}
		else {
			
			shared.mouse.x = e.clientX;
			shared.mouse.y = e.clientY;
			
			shared.signals.mousemoved.dispatch( e );
			
		}
        
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    
    function onDocumentMouseWheel( e ) {
        shared.signals.mousewheel.dispatch( e );
        
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
	
	function onGameContextMenu( e ) {
        
        e.preventDefault();
        e.stopPropagation();
        return false;
		
    }
    
    function onWindowDeviceOrientation( e ) {
        var overThreshold, gamma, beta, x, y;
        
        if ( ! e.gamma && !e.beta ) {
                e.gamma = -(e.x * (180 / Math.PI));
                e.beta = -(e.y * (180 / Math.PI));
        } 
        else if( e.alpha === null && e.beta === null && e.gamma === null ) {
                $(window).unbind( "deviceorientation", onWindowDeviceOrientation );
                $(window).unbind( "MozOrientation", onWindowDeviceOrientation );
        }
        
        overThreshold = Math.abs(e.gamma) > 4 || Math.abs(e.beta) > 4;
        gamma = overThreshold ? e.gamma : 0;
        beta = overThreshold ? e.beta : 0;
        
        if ( lastGamma !== gamma || lastBeta !== beta) {
            x = Math.round( 1.5 * gamma ) + shared.mouse.x;
            y = ( - Math.round( 1.5 * beta ) ) + shared.mouse.y;
            
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
            
            shared.mouse.x = x;
            shared.mouse.y = y;
            
            lastGamma = gamma;
            lastBeta = beta;
            
            shared.signals.mousemoved.dispatch( e );
            
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }

    function onDocumentKeyDown( e ) {
        shared.signals.keydown.dispatch( e );
        
        /*
        e.preventDefault();
        e.stopPropagation();
        return false;
        */
    }

    function onDocumentKeyUp( e ) {
        shared.signals.keyup.dispatch( e );
        
        /*
        e.preventDefault();
        e.stopPropagation();
        return false;
        */
    }

    function onWindowResize( e ) {
        
        shared.screenWidth = $(window).width();
        shared.screenHeight = $(window).height();
        
        shared.signals.windowresized.dispatch(shared.screenWidth, shared.screenHeight);
        
        if (typeof e !== 'undefined') {
            e.preventDefault();
            e.stopPropagation();
        }
        return false;
    }
    
    function onError ( error, url, lineNumber ) {
        
        if (typeof main.game !== 'undefined') {
            main.game.pause();
        }
        
        if (typeof main.utils.dev !== 'undefined') {
            main.utils.dev.log_error(error, url, lineNumber);
        }
        
    }
    
    return main; 
    
}(KAIOPUA || {}));