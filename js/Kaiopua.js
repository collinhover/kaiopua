/*
Kaiopua.js
Main module, handles browser events.
*/

var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
        assets = main.assets = main.assets || {},
		assetloader,
		game,
		requiredAssets = [],
        lastGamma, lastBeta,
        libList = [
            "js/lib/jquery-1.7.1.min.js",
            "js/lib/RequestAnimationFrame.js",
            "js/lib/requestInterval.js",
            "js/lib/requestTimeout.js",
            "js/lib/signals.min.js",
			"assets/modules/utils/AssetLoader.js"
        ],
        setupList = [
			"assets/modules/core/Game.js"
        ];
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.extend = extend;
	main.ensure_array = ensure_array;
	
	main.get_asset_path = get_asset_path;
	main.get_ext = get_ext;
	
	main.add_default_ext = add_default_ext;
	main.remove_ext = remove_ext;
	main.is_image_ext = is_image_ext;
	
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
		
		// asset loader and setup
		
		assetloader = assets.modules.utils.AssetLoader;
		
		assetloader.add_loaded_locations( libList );
		
		assets_require( setupList, init_setup, true );
		
    }
    
    function init_setup ( g ) {
		
        // assets
        
        game = g;
        
        // resize once
        on_window_resize();
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
	
	function get_asset_path ( location ) {
		
		return location.path || location;
		
	}
	
	function get_ext ( location ) {
        var path, dotIndex, ext = '';
		
		path = get_asset_path( location );
        
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
		
        path = get_asset_path( location );
        
        dotIndex = path.lastIndexOf('.');
        
        if ( dotIndex !== -1 ) {
            path = path.substr( 0, dotIndex );
        }
		
		return path;
		
	}
	
	function get_alt_path ( location ) {
		
		var path, ext;
		
		path = get_asset_path( location );
		ext = get_ext( path );
		
		// if has no extension, add default
		
		if ( ext === '' ) {
			
			return add_default_ext( path );
			
		}
		// if has extension, remove
		else {
			
			return remove_ext( path );
			
		}
		
	}
	
	function is_image_ext ( ext ) {
		
		if ( ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'bmp' ) {
			return true;
		}
		else {
			return false;
		}
		
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
	
	function asset_data( location, data, initializeWhenNotFound, allowInitialization, attempts, originalPath ) {
		
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
		
		path = get_asset_path( location );
		
		cascade = asset_path_cascade( path );
		
		// get data
		
		for ( i = 0, l = cascade.length; i < l; i++ ) {
			
			// set as parent for next
			
			parent = asset;
			
			assetName = cascade[ i ];
			
			asset = parent[ assetName ];
			
			// if not a valid cascade point
			
			if ( typeof asset === 'undefined' ) {
				
				// if allowed to initialize a cascade point
				
				if ( allowInitialization === true ) {
					
					parent[ assetName ] = asset = {};
					
				}
				else {
					
					break;
				
				}
				
			}
			
		}
		
		// check attempts
		
		attempts = attempts || 1;
		
		// if no asset and this is first attempt at finding
		if ( typeof asset === 'undefined' ) {
			
			// try again with alternate path
			
			if ( attempts === 1 ) {
				
				return asset_data( get_alt_path( path ), data, initializeWhenNotFound, false, attempts + 1, path );
				
			}
			else if ( attempts === 2 && initializeWhenNotFound === true ) {
				
				return asset_data( originalPath, data, initializeWhenNotFound, true, attempts + 1, originalPath );
				
			}
			
		}
		
		// if data passed and asset found
		
		if ( typeof data !== 'undefined' && typeof asset !== 'undefined' ) {
			
			// copy data into asset object
			// overwrite if image
			
			if ( data.hasOwnProperty('nodeName') && data.nodeName.toLowerCase() === 'img' ) {
				
				asset = data;
				
			}
			// copy properties of existing asset into data and assign to asset
			// order is important to ensure data remains an instance of whatever it was before
			else {
				
				asset = main.extend( asset, data );
				
			}
			
			// store updated asset
			
			parent[ assetName ] = asset;
			
		}
		
		return asset;
		
	}
	
	function asset_register( path, data, notReady ) {
		
		var cascade,
			parent,
			assetName,
			asset,
			i, l;
		
		// initialize asset data
		
		asset = asset_data( path, data, true );
		
		// if asset was already tagged and ready state is false
		// set as not ready
		
		if ( typeof asset._kaiopua !== 'undefined' && asset._kaiopua.ready === false ) {
			
			notReady = true;
			
		}
		
		// tag asset
			
		asset_tag( asset );
		
		// if is ready now
		
		if ( notReady !== true ) {
			
			asset_ready( path, asset );
			
		}
		
		return asset;
		
	}
	
	function asset_tag ( asset ) {
		
		var ap;
			
		// add asset properties object
		
		ap = asset._kaiopua = asset._kaiopua || {};
		
		// set properties
		
		if ( ap.hasOwnProperty( 'ready' ) === false ) {
			
			ap.ready = false;
			
		}
		
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
		
		on_asset_ready = function ( path, secondAttempt ) {
			
			var indexWaiting;
			
			indexWaiting = assetsWaitingFor.indexOf( path );
			
			// if waiting for asset to be ready
			
			if ( indexWaiting !== -1 ) {
				
				assetsWaitingFor.splice( indexWaiting, 1 );
				
				assetsReady.push( path );
				console.log( '> an asset is ready! (' + assetsReady.length + ' / ' + requirements.length + ' - ' + path + ' )' );
				// check if no more to wait for
				
				if ( assetsWaitingFor.length === 0 && assetsReady.length === requirements.length ) {
					console.log( '> > ' + assetsReady.length + ' assets are ready!' );
					
					// remove signal
					
					if ( listeningForReadySignal === true ) {
						
						shared.signals.assetReady.remove( on_asset_ready );
						
						listeningForReadySignal = false;
						
					}
					
					on_all_assets_ready();
					
				}
				
			}
			// make one extra attempt with alternative path to check if waiting for asset to be ready
			else if ( secondAttempt !== true ) {
				
				on_asset_ready( get_alt_path( path ), true );
				
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
				
				assetloader.ui_hide( true );
				
			}
			
			if ( waitForAssetsReady === true ) {
				console.log( 'waiting for '+ requirements.length + ' assets to be ready!' );
				console.log(requirements);
			}
			
			// find all assets
			
			for ( i = 0, l = requirements.length; i < l; i++ ) {
				
				location = requirements[ i ];
				
				path = get_asset_path( location );
				
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
					
					if ( typeof asset === 'undefined' || ( typeof asset._kaiopua !== 'undefined' && asset._kaiopua.ready === true ) ) {
						
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
		
		if ( typeof assetloader === 'undefined' ) {
			
			assetloader = assets.modules.utils.AssetLoader;
			
		}
		
		// show loader ui
		
		if ( typeof loaderUIContainer !== 'undefined' ) {
			
			assetloader.ui_show( loaderUIContainer );
			
		}
		
		// pass all requirements to loader
		
		assetloader.load( requirements, callback_outer );
		
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
    
    return main; 
    
}(KAIOPUA || {}));