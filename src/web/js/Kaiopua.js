/*
Kaiopua.js
Main module, handles browser events.
*/

var KAIOPUA = (function (main) {
    
    var loader, shared, error,
        libList = [
            "js/lib/jquery-1.6.4.min.js",
            "js/lib/RequestAnimationFrame.js",
            "js/lib/signals.min.js"
        ],
        setupList = [
            "js/utils/Dev.js",
            "js/utils/Error.js",
            "js/utils/Loader.js"
        ];
    
    /*===================================================
    
    internal init
    
    =====================================================*/
    
    // load loader script
    $LAB.script( libList ).wait( init_basics )
        .script( setupList ).wait( init_setup );
    
    function init_basics () {
        
        // shared
        shared = main.shared = {
            mouse : { x: 0, y: 0 },
            screenWidth : $(window).width(),
            screenHeight : $(window).height(),
            originLink : window.location.pathname.toString(),
            
            frameRateMax : 60,
            frameRateMin : 20,
            refreshInterval : 1000 / 60,
            
            html: {
                staticMenu: $('#static_menu'),
                gameContainer: $('#game'),
                errorContainer: $('#error_container'),
                transitioner: $('#transitioner')
            },
            
            signals : {
        
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
            }
        };
        
        // add listeners for events
        // each listener dispatches shared signal
        $(document).bind( 'mousedown', onDocumentMouseDown );
        $(document).bind( 'mouseup', onDocumentMouseUp );
        $(document).bind( 'mousemove', onDocumentMouseMove );
        $(document).bind( 'mousewheel', onDocumentMouseWheel );
        
        $(document).bind( 'keydown', onDocumentKeyDown );
        $(document).bind( 'keyup', onDocumentKeyUp );
    
        $(window).bind( 'deviceorientation', onWindowDeviceOrientation );
        $(window).bind( 'MozOrientation', onWindowDeviceOrientation);
    
        $(window).bind( 'resize', onWindowResize );
        
        window.onerror = onError;
        shared.signals.error.add(onError);
        
        // resize once
        onWindowResize();
    }
    
    function init_setup () {
        
        // check for errors
        error = main.error;
        
        if (error.check()) {
            error.process();
        }
        // safe to start game
        else {
            console.log('no errors');
            /*
            require(["game/Game"], function (gameModule) {
                game = gameModule;
                game.init(); 
            });
            */
        }
    }
    
    /*===================================================
    
    functions
    
    =====================================================*/
    
    function onDocumentMouseDown( e ) {
        shared.signals.mousedown.dispatch( e );
        
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    
    function onDocumentMouseUp( e ) {
        shared.signals.mouseup.dispatch( e );
        
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    
    function onDocumentMouseMove( e ) {
        shared.mouse.x = e.clientX;
        shared.mouse.y = e.clientY;
        
        shared.signals.mousemoved.dispatch( e );
        
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
            
            e.mouse.x = x;
            e.mouse.y = y;
            
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
        
        if (typeof main.dev !== 'undefined') {
            dev.log_error(error, url, lineNumber);
        }
        
    }
    
    return main; 
    
}(KAIOPUA || {}));