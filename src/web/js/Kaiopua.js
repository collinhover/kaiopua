/*
Kaiopua.js
Main module, handles browser events.
*/

var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        assets = main.assets = main.assets || {},
		loader,
		error,
		game,
		requiredAssets = [],
        lastGamma, lastBeta,
        libList = [
            "js/lib/jquery-1.7.1.min.js",
            "js/lib/RequestAnimationFrame.js",
            "js/lib/requestInterval.js",
            "js/lib/requestTimeout.js",
            "js/lib/signals.min.js",
			"assets/modules/utils/Loader.js"
        ],
        setupList = [
            "assets/modules/utils/Error.js",
            "assets/modules/core/Game.js",
			"assets/modules/workers/UIHelper.js",
			"assets/modules/utils/Dev.js"
        ];
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.extend = extend;
	main.get_path = get_path;
	main.get_ext = get_ext;
	main.add_default_ext = add_default_ext;
	main.remove_ext = remove_ext;
	
	main.asset_register = asset_register;
	main.assets_require = assets_require;
	main.asset_data = asset_data;
	main.asset_ready = asset_ready;
	
    /*===================================================
    
    internal init
    
    =====================================================*/
    
	// force cache-busting
	$LAB.setGlobalDefaults({ CacheBust: true });
	
    // load scripts
    $LAB.script( libList ).wait( init_basics );
    
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
        
        shared.html = {
            staticMenu: $('#static_menu'),
            gameContainer: $('#game'),
            errorContainer: $('#error_container')
        };
        
        shared.signals = {
			
			focuslose: new signals.Signal(),
			focusgain: new signals.Signal(),
    
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
			
			assetReady : new signals.Signal(),
            
            error : new signals.Signal()
            
        };
        
        // add listeners for events
        // each listener dispatches shared signal
		$(window).bind( 'blur', on_focus_lose );
		$(window).bind( 'focus', on_focus_gain );
		
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
		
		// loader and setup
		
		loader = assets.modules.utils.Loader;
		
		loader.add_loaded_locations( libList );
		
		assets_require( setupList, init_setup );
		
    }
    
    function init_setup ( e, g ) {
		
        // assets
        
        error = e;
        game = g;
        
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
    
    asset handling
    
    =====================================================*/
	
	function asset_path_cascade( path ) {
		
		var cascade,
			part,
			dotIndex;
		
		// split path based on \ or /
		// each split is a parent module
		// last is actual module
		
		cascade = path.split(/[\\\/]/);
		
		for ( i = 0, l = cascade.length; i < l; i++ ) {
			
			part = cascade[ i ];
			
			// remove all non-alphanumeric
			
			part = part.replace(/[^\w\.-]+/g, "");
			
			// cannot be empty
			
			if ( part === '' ) {
				
				on_error ( 'Invalid asset cascade', 'Main', 'N/A' );
				
				return;
				
			}
			
			cascade[ i ] = part;
			
		}
		
		return cascade;
		
	}
	
	function asset_data( location, secondAttempt ) {
		
		var path,
			cascade,
			parent,
			assetName,
			asset,
			ext,
			i, l;
		
		// init parent and asset
		
		asset = parent = main;
		
		// cascade path
		
		path = get_path( location );
		
		cascade = asset_path_cascade( path );
		
		// get data
		
		for ( i = 0, l = cascade.length; i < l; i++ ) {
			
			// set as parent for next
			
			parent = asset;
			
			assetName = cascade[ i ];
			
			asset = parent[ assetName ];
			
			// if asset not found
			
			if ( typeof asset === 'undefined' ) {
				
				// if is parent of asset
				
				if ( i < l - 1 ) {
					
					break;
					
				}
				// else if this is first attempt at finding
				else if ( secondAttempt !== true ) {
					
					// get extension
					
					ext = get_ext( assetName );
					
					// if has no extension, try with default
					
					if ( ext === '' ) {
						
						return asset_data( add_default_ext( path ), true );
						
					}
					// if has extension, try without
					else {
						
						return asset_data( remove_ext( path ), true );
						
					}
					
				}
				
			}
			
		}
		
		return asset;
		
	}
	
	function asset_register( path, data, isReady ) {
		
		var cascade,
			parent,
			assetName,
			asset,
			i, l;
		
		// if data was passed
		
		if ( typeof data !== 'undefined' && data !== null ) {
			
			// init parent and asset
			
			asset = parent = main;
			
			// cascade path
			
			cascade = asset_path_cascade( path );
			
			// register
			
			for ( i = 0, l = cascade.length; i < l; i++ ) {
				
				// set as parent for next
				
				parent = asset;
				
				assetName = cascade[ i ];
				
				// register
				
				asset = parent[ assetName ] = parent[ assetName ] || {};
				
			}
			
			// copy properties into asset object
			// overwrite if image
			
			if ( data.hasOwnProperty('nodeName') && data.nodeName.toLowerCase() === 'img' ) {
				
				asset = data;
				
			}
			// copy properties of existing asset into data and assign to asset
			// order is important to ensure data remains an instance of whatever it was before
			else {
				
				asset = main.extend( asset, data );
				
			}
			
			// tag and store asset
			
			parent[ assetName ] = asset_tag( asset );
			
			// if is ready now
			
			if ( isReady === true ) {
				
				asset_ready( path, asset );
				
			}
			
		}
		
		// return asset
		
		return asset;
		
	}
	
	function asset_tag ( asset ) {
		
		var ap;
		
		// add asset properties object
		
		ap = asset._kaiopua = asset._kaiopua || {};
		
		// set properties
		
		ap.ready = false;
		
		return asset;
		
	}
	
	function asset_ready( path, data ) {
		
		var asset = data || asset_data( path );
		
		if ( typeof asset !== 'undefined' && asset._kaiopua.ready === false ) {
			
			asset._kaiopua.ready = true;
			
			if ( typeof shared.signals !== 'undefined' && typeof shared.signals.assetReady !== 'undefined' ) {
				
				shared.signals.assetReady.dispatch( path );
				
			}
			
		}
		
	}
	
	function assets_require( requirements, callbackList, waitForAssetsReady, loaderUIContainer ) {
		
		var callback_outer,
			on_asset_ready,
			on_all_assets_ready,
			assetsRequired = [],
			assetsWaitingFor = [],
			assetsReady = [],
			listeningForReadySignal = false;
		
		// get if arguments are not array
		
		requirements = ensure_array( requirements );
		
		callbackList = ensure_array( callbackList );
		
		// modify original callback to wrap in new function
		// that parses requirements and applies each asset as argument to callback
		// also handle if each asset required needs to be ready before triggering callback
		
		on_asset_ready = function ( path ) {
			
			var indexWaiting;
			
			// if needed ready
			
			indexWaiting = assetsWaitingFor.indexOf( path );
			
			if ( indexWaiting !== -1 ) {
				
				assetsWaitingFor.splice( indexWaiting, 1 );
				
				assetsReady.push( path );
				console.log( '> an asset is ready! (' + assetsReady.length + ' / ' + requirements.length + ' - ' + path + ' )' );
				// check if no more to wait for
				
				if ( assetsWaitingFor.length === 0 && assetsReady.length === requirements.length ) {
					console.log( '> > ' + assetsReady.length + ' assets are ready!' );
					listeningForReadySignal = false;
					
					on_all_assets_ready();
					
				}
				
			}
			
		};
		
		on_all_assets_ready = function () {
			
			var i, l,
				callback;
			
			// apply all required assets to original callbacks
			
			for ( i = 0, l = callbackList.length; i < l; i++ ) {
				console.log('///// calling asset required callback #' + (i + 1) + ' of ' + callbackList.length );
				callback = callbackList[ i ];
				
				callback.apply( this, assetsRequired );
				
			}
			
		};
		
		callback_outer = function () {
			
			var i, l,
				location,
				path,
				asset;
			
			// hide loader ui
			
			if ( typeof loaderUIContainer !== 'undefined' ) {
				
				loader.ui_hide( true );
				
			}
			
			if ( waitForAssetsReady === true ) {
				console.log( 'waiting for '+ requirements.length + ' assets to be ready!' );
				console.log(requirements);
			}
			
			// find all assets
			
			for ( i = 0, l = requirements.length; i < l; i++ ) {
				
				location = requirements[ i ];
				
				path = get_path( location );
				
				// get asset data
				
				asset = asset_data( location );
				
				if ( typeof asset !== 'undefined' ) {
					
					// add to required list
					
					assetsRequired.push( asset );
					
				}
				
				// if needed ready
				
				if ( waitForAssetsReady === true ) {
					
					assetsWaitingFor.push( path );
					
					// check ready status
					
					if ( typeof asset === 'undefined' || asset._kaiopua.ready === true ) {
						
						on_asset_ready( path );
						
					}
					// asset not ready, listen for ready signal if not already
					else if ( listeningForReadySignal === false ) {
						
						listeningForReadySignal = true;
						
						shared.signals.assetReady.add( on_asset_ready );
						
					}
					
					if ( typeof asset !== 'undefined' && asset._kaiopua.ready !== true ) {
						
						console.log( '< an asset is not ready, listening for asset ready signal ( ' + path + ' )' );
						
					}
					
				}
				
			}
			
			// if not waiting for assets to be ready
			
			if ( waitForAssetsReady !== true || requirements.length === 0 ) {
				
				on_all_assets_ready();
				
			}
			
		};
		
		// set loader manually if needed
		
		if ( typeof loader === 'undefined' ) {
			
			loader = assets.modules.utils.Loader;
			
		}
		
		// show loader ui
		
		if ( typeof loaderUIContainer !== 'undefined' ) {
			
			loader.ui_show( loaderUIContainer );
			
		}
		
		// pass all requirements to loader
		
		loader.load( requirements, callback_outer );
		
	}
	
	/*===================================================
    
    helper functions
    
    =====================================================*/
	
	// add object cloning/extending
	// with support for enumerable and non-enumerable properties
	// and correct copying of getters and setters
	// does not do deep copies
	
	function extend ( source, destination ) {
		
		var i, l,
			propertyNames,
			name,
			descriptor;
		
		if ( typeof source !== 'undefined' && typeof destination !== 'undefined' ) {
			
			propertyNames = Object.getOwnPropertyNames( source );
			
			for ( i = 0, l = propertyNames.length; i < l; i++ ) {
				
				name = propertyNames[ i ];
				
				descriptor = Object.getOwnPropertyDescriptor( source, name );
				
				Object.defineProperty( destination, name, descriptor );
				
			}
			
		}
		
		return destination;
		
	}
	
	function ensure_array ( target ) {
		
		target = target || [];
		
		if ( typeof target === 'string' || typeof target === 'function' || target.hasOwnProperty( 'length' ) === false ) {
			target = [target];
		}
		
		return target;
		
	}
	
	function get_path ( location ) {
		
		return location.path || location;
		
	}
	
	function get_ext ( location ) {
        var path, dotIndex, ext = '';
		
		path = get_path( location );
        
        dotIndex = path.lastIndexOf('.');
        
        if ( dotIndex !== -1 ) {
            ext = path.substr( dotIndex + 1 ).toLowerCase();
        }
        
        return ext;
    }
	
	function add_default_ext ( location ) {
		
		var path = remove_ext( location );
		
		path = path.replace(/\./g, "") + ".js";
		
		return path;
		
	}
	
	function remove_ext ( location ) {
		
		var path, dotIndex;
		
        path = get_path( location );
        
        dotIndex = path.lastIndexOf('.');
        
        if ( dotIndex !== -1 ) {
            path = path.substr( 0, dotIndex );
        }
		
		return path;
		
	}
    
    /*===================================================
    
    event functions
    
    =====================================================*/
	
	function on_focus_lose ( e ) {
		
		shared.signals.focuslose.dispatch( e );
		
		if ( typeof game !== 'undefined' ) {
			
			game.pause();
			
		}
		
	}
	
	function on_focus_gain ( e ) {
		
		shared.signals.focusgain.dispatch( e );
		
		if ( typeof game !== 'undefined' && game.started !== true ) {
			
			game.resume();
			
		}
		
	}
	
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
			
			mouse.lx = mouse.x;
			mouse.ly = mouse.y;
			
			mouse.x = e.clientX;
			mouse.y = e.clientY;
			
			mouse.dx = mouse.x - mouse.lx;
			mouse.dy = mouse.y - mouse.ly;
			
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
        
        if (typeof main.assets.modules.utils.dev !== 'undefined') {
            main.assets.modules.utils.dev.log_error(error, url, lineNumber);
        }
		else {
			throw error + " at " + lineNumber + " in " + url;
		}
        
    }
    
    return main; 
    
}(KAIOPUA || {}));