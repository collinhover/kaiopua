/*
Kaiopua.js
Main module.
*/

var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
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
    
    helper functions
    
    =====================================================*/
	
	// add object cloning/extending
	// with support for enumerable and non-enumerable properties
	// and correct copying of getters and setters
	// does not do deep copies
	
	main.extend = function ( source, destination ) {
		
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
	
	main.ensure_array = function ( target ) {
		
		target = target || [];
		
		if ( typeof target === 'string' || typeof target === 'function' || target.hasOwnProperty( 'length' ) === false ) {
			target = [target];
		}
		
		return target;
		
	}
	
	main.get_asset_path = function ( location ) {
		
		return location.path || location;
		
	}
	
	main.get_ext = function ( location ) {
        var path, dotIndex, ext = '';
		
		path = main.get_asset_path( location );
        
        dotIndex = path.lastIndexOf('.');
        
        if ( dotIndex !== -1 ) {
            ext = path.substr( dotIndex + 1 ).toLowerCase();
        }
        
        return ext;
    }
	
	main.add_default_ext = function ( location ) {
		
		var path = main.remove_ext( location );
		
		path = path.replace(/\./g, "") + ".js";
		
		return path;
		
	}
	
	main.remove_ext = function ( location ) {
		
		var path, dotIndex;
		
        path = main.get_asset_path( location );
        
        dotIndex = path.lastIndexOf('.');
        
        if ( dotIndex !== -1 ) {
            path = path.substr( 0, dotIndex );
        }
		
		return path;
		
	}
	
	main.get_alt_path = function ( location ) {
		
		var path, ext;
		
		path = main.get_asset_path( location );
		ext = main.get_ext( path );
		
		// if has no extension, add default
		
		if ( ext === '' ) {
			
			return main.add_default_ext( path );
			
		}
		// if has extension, remove
		else {
			
			return main.remove_ext( path );
			
		}
		
	}
	
	main.is_image_ext = function ( ext ) {
		
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
	
	main.get_asset = function ( location, attempts ) {
		
		var path,
			cascade,
			parent,
			assetName,
			asset,
			i, l;
		
		// init parent and asset
		
		asset = parent = main;
		
		// cascade path
		
		path = main.get_asset_path( location );
		
		cascade = asset_path_cascade( path );
		
		// get asset
		
		for ( i = 0, l = cascade.length; i < l; i++ ) {
			
			// set as parent for next
			
			parent = asset;
			
			assetName = cascade[ i ];
			
			asset = parent[ assetName ];
			
			// if not a valid cascade point
			
			if ( typeof asset === 'undefined' ) {
				
				break;
				
			}
			
		}
		
		// check attempts
		
		attempts = attempts || 1;
		
		// if no asset and this is first attempt at finding
		if ( typeof asset === 'undefined' ) {
			
			// try again with alternate path
			
			if ( attempts === 1 ) {
				
				return main.get_asset( main.get_alt_path( path ), attempts + 1 );
				
			}
			
		}
		
		return asset;
		
	}
	
	main.set_asset = function ( location, assetNew ) {
		
		var path,
			cascade,
			parent,
			assetName,
			asset,
			data,
			dataNew,
			i, l;
		
		// if new asset passed
		
		if ( assetNew instanceof main.Asset ) {
			
			// init parent and asset
			
			asset = parent = main;
			
			// cascade path
			
			path = main.get_asset_path( location );
			
			cascade = asset_path_cascade( path );
			
			// setup asset path
			
			for ( i = 0, l = cascade.length; i < l; i++ ) {
				
				// set as parent for next
				
				parent = asset;
				
				// get name of current point in cascade
				
				assetName = cascade[ i ];
				
				// get or build asset
				
				asset = parent[ assetName ] = parent[ assetName ] || {};
				
			}
			
			// asset data, assume asset is data if not instance of asset
					
			data = ( asset instanceof main.Asset ) ? asset.data : asset;
			
			// get new data
				
			dataNew = assetNew.data;
			
			// if current data exists
			
			if ( typeof data !== 'undefined' ) {
				
				// if new asset has no data, keep current data
				
				if ( typeof dataNew === 'undefined' ) {
					
					assetNew.data = data;
					
				}
				// else if new data is not image
				if ( !( dataNew.hasOwnProperty('nodeName') && dataNew.nodeName.toLowerCase() === 'img' ) ) {
					
					// copy properties of existing asset data into new data
					// order is important to ensure new data remains an instance of whatever it is
					
					main.extend( data, dataNew );
					
				}
				
			}
			
			// set new asset as asset
			
			parent[ assetName ] = asset = assetNew;
			
		}
		
		return asset;
		
	}
	
	main.get_asset_data = function ( location ) {
		
		var asset,
			data;
		
		// get asset at location
		
		asset = main.get_asset( location );
		
		// asset data, assume asset is data if not instance of asset
				
		data = ( asset instanceof main.Asset ) ? asset.data : asset;
		
		return data;
		
	}
	
	main.asset_register = function ( path, parameters ) {//data, notReady ) {
		
		var asset;
		
		// handle parameters
		
		parameters = parameters || {};
		
		// initialize asset
		
		asset = new main.Asset( path, parameters );
		
		/*
		asset = main.get_asset_data( path, data, true );
		
		// if asset was already tagged and ready state is false
		// set as not ready
		
		if ( typeof asset._kaiopua !== 'undefined' && asset._kaiopua.ready === false ) {
			
			notReady = true;
			
		}
		
		// tag asset
			
		asset_tag( path, asset );
		
		// if is ready now
		
		if ( notReady !== true ) {
			
			main.asset_ready( path, asset );
			
		}
		*/
		
		// asset is usually only useful internally
		// so return asset data
		
		return asset.data;
		
	}
	
	main.asset_ready = function ( path, asset ) {
		
		var i, l,
			callbackList,
			callback;
		
		asset = asset || main.get_asset( path );
		
		if ( asset instanceof main.Asset && asset.ready !== true ) {
			console.log(' asset is ready, ', asset.path, asset );
			asset.ready = true;
			
			// do all callbacks on ready
			
			callbackList = asset.callbacksOnReady;
			
			if ( typeof callbackList !== 'undefined' ) {
				
				for ( i = 0, l = callbackList.length; i < l; i++ ) {
					console.log('////> calling asset on ready callback #' + (i + 1) + ' of ' + callbackList.length );
					
					callback = callbackList[ i ];
					
					callback.apply( this );
					
				}
			
			}
			
			if ( typeof shared.signals !== 'undefined' && typeof shared.signals.assetReady !== 'undefined' ) {
				
				shared.signals.assetReady.dispatch( path );
				
			}
			
		}
		
	}
	
	main.asset_require = function ( requirements, callbackList, waitForAssetsReady, loaderUIContainer ) {
		
		var callback_outer,
			on_asset_ready,
			on_all_assets_ready,
			assetsRequired = [],
			assetsWaitingFor = [],
			assetsReady = [],
			listeningForReadySignal = false;
		
		// get if arguments are not array
		
		requirements = main.ensure_array( requirements );
		
		callbackList = main.ensure_array( callbackList );
		
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
				
				on_asset_ready( main.get_alt_path( path ), true );
				
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
				asset,
				data;
			
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
				
				path = main.get_asset_path( location );
				
				// get asset
				
				asset = main.get_asset( location );
				
				// get data
				
				data = asset.data;
				
				if ( asset instanceof main.Asset ) {
					
					// add to required list
					
					assetsRequired.push( asset );
					
				}
				
				// if needed ready
				
				if ( waitForAssetsReady === true ) {
					
					assetsWaitingFor.push( path );
					
					// check ready status
					
					if ( asset instanceof main.Asset && asset.ready === true ) {
						
						on_asset_ready( path );
						
					}
					// asset not ready, listen for ready signal if not already
					else if ( listeningForReadySignal === false ) {
						
						listeningForReadySignal = true;
						
						shared.signals.assetReady.add( on_asset_ready );
						
					}
					
					if ( asset instanceof main.Asset && asset.ready !== true ) {
						
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
			
			assetloader = main.assets.modules.utils.AssetLoader.data;
			
		}
		
		// show loader ui
		
		if ( typeof loaderUIContainer !== 'undefined' ) {
			
			assetloader.ui_show( loaderUIContainer );
			
		}
		
		// pass all requirements to loader
		console.log('assetloader from req', assetloader);
		assetloader.load( requirements, callback_outer );
		
	}
	
	/*===================================================
    
    asset instance
    
    =====================================================*/
	
	main.Asset = function KaiopuaAsset ( path, parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		this.path = path;
		
		this.data = parameters.data || {};
		
		// set asset basics
		
		main.set_asset( this.path, this );
		
		// parameters
		
		this.requirements = main.ensure_array( parameters.requirements );
		
		this.callbacksOnReady = main.ensure_array( parameters.callbacksOnReady );
		
		this.wait = ( typeof parameters.wait === 'boolean' ) ? parameters.wait : false;
		
		// readiness
		
		if ( this.requirements.length === 0 || this.wait !== true ) {
			
			this.on_ready();
			
		}
		else {
			
			this.ready = false;
			
		}
		
		// if has requirements, handle
		
		if ( this.requirements.length > 0 ) {
			
			this.callbacksOnReqs = main.ensure_array( parameters.callbacksOnReqs );
			
			this.loaderUIContainer = parameters.loaderUIContainer;
			
			// add call back for ready auto update
			
			if ( parameters.readyAutoUpdate !== false ) {
				
				this.callbacksOnReqs.push( this.on_ready )
				
			}
			
			main.asset_require( this.requirements, this.callbacksOnReqs, this.wait, this.loaderUIContainer );
		
		}
		
		console.log('new asset!', this);
	}
	
	main.Asset.prototype = new Object();
	main.Asset.prototype.constructor = main.Asset;
	
	main.Asset.prototype.on_ready = function () {
		
		main.asset_ready( this.path, this );
		
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
		
		assetloader = main.get_asset_data( 'assets/modules/utils/AssetLoader' );
		console.log('assetLoader?', assetloader);
		assetloader.add_loaded_locations( libList );
		
		main.asset_require( setupList, init_setup, true );
		
    }
    
    function init_setup ( g ) {
		
        // assets
        
        game = g;
        
        // resize once
        on_window_resize();
		
    }
    
    return main; 
    
} ( KAIOPUA || {} ) );