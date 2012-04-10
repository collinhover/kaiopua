/*
 *
 * Kaiopua.js
 * Main module.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
var KAIOPUA = (function (main) {
    
    var shared = main.shared = main.shared || {},
		_AssetLoader,
		_Game,
        lastGamma, lastBeta,
        libList = [
            "js/lib/jquery-1.7.1.min.js",
            "js/lib/RequestAnimationFrame.js",
            "js/lib/requestInterval.js",
            "js/lib/requestTimeout.js",
            "js/lib/signals.min.js",
			"js/lib/sylvester.js",
			"assets/modules/utils/AssetLoader.js"
        ],
        setupList = [
			"assets/modules/core/Game.js",
			//"assets/modules/utils/Dev.js"
        ];
	
	/*===================================================
    
	compatibility
    
    =====================================================*/
	
	// array indexOf
	
	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
			"use strict";
			if (this == null) {
				throw new TypeError();
			}
			var t = Object(this);
			var len = t.length >>> 0;
			if (len === 0) {
				return -1;
			}
			var n = 0;
			if (arguments.length > 0) {
				n = Number(arguments[1]);
				if (n != n) { // shortcut for verifying if it's NaN
					n = 0;
				} else if (n != 0 && n != Infinity && n != -Infinity) {
					n = (n > 0 || -1) * Math.floor(Math.abs(n));
				}
			}
			if (n >= len) {
				return -1;
			}
			var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
			for (; k < len; k++) {
				if (k in t && t[k] === searchElement) {
					return k;
				}
			}
			return -1;
		}
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
		shared.pathToAssets = 'assets/';
		shared.pathToModules = shared.pathToAssets + 'modules/';
		shared.pathToModels = shared.pathToAssets + 'models/';
		shared.pathToIcons = shared.pathToAssets + 'icons/';
		shared.pathToTextures = shared.pathToAssets + 'textures/';
        
        shared.frameRateMax = 60;
        shared.frameRateMin = 20;
        shared.time = new Date().getTime();
        shared.timeLast = shared.time;
        shared.timeDeltaExpected = 1000 / 60;
		shared.mouseWheelSpeed = 120;
		
		shared.multitouch = false;
		
        shared.galleryMode = false;
		shared.timeLastInteraction = 0;
		shared.timeLastInteractionMax = 300000;
		
        shared.html = {
            footerMenu: $('#footer_menu'),
            gameContainer: $('#game'),
            errorContainer: $('#errors')
        };
        
        shared.signals = {
			
			focuslose: new signals.Signal(),
			focusgain: new signals.Signal(),
    
            mousedown : new signals.Signal(),
            mouseup : new signals.Signal(),
            mousemoved : new signals.Signal(),
            mousewheel : new signals.Signal(),
			mouseenter : new signals.Signal(),
			mouseleave : new signals.Signal(),
    
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
		$(window).on( 'blur', on_focus_lose );
		$(window).on( 'focus', on_focus_gain );
		
        $(document).on( 'mousedown touchstart', on_mouse_down );
        $(document).on( 'mouseup touchend', on_mouse_up );
		$(document).on( 'click', on_mouse_click );
        $(document).on( 'mousemove touchmove', on_mouse_move );
		$(document).on( 'mouseenter touchenter', on_mouse_enter );
		$(document).on( 'mouseleave touchleave', on_mouse_leave );
        $(document).on( 'mousewheel DOMMouseScroll', on_mouse_wheel );
		$(shared.html.gameContainer).on( 'contextmenu', on_game_context_menu );
		
        $(document).on( 'keydown', on_key_down );
        $(document).on( 'keyup', on_key_up );
    
        $(window).on( 'deviceorientation', on_window_device_orientation );
        $(window).on( 'MozOrientation', on_window_device_orientation);
    
        $(window).on( 'resize', on_window_resize );
		
		window.onerror = on_error;
		
		// start updating
		
		
		
		// asset loader and setup
		
		_AssetLoader = main.get_asset_data( 'assets/modules/utils/AssetLoader.js' );
		
		_AssetLoader.add_loaded_locations( libList );
		
		main.asset_require( setupList, init_setup, true );
		
    }
    
    function init_setup ( g ) {
		
        // assets
        
        _Game = g;
        
        // resize once
        on_window_resize();
		
    }
	
	/*===================================================
    
    helper functions
    
    =====================================================*/
	
	// better type checking
	// trade off is performance
	
	main.type = function ( o ) {
		return o==null?o+'':Object.prototype.toString.call(o).slice(8,-1).toLowerCase();
	};
	
	main.is_object = function ( target ) {
		return target !== null && target !== undefined && Object.prototype.toString.call( target ) === '[object Object]';
	};
	
	main.is_array = function ( target ) {
		return Object.prototype.toString.call( target ) === '[object Array]';
	};
	
	main.is_number = function ( n ) {
		return isNaN( n ) === false && isFinite( n );
	};
	
	main.is_image = function ( target ) {
		return ( typeof target !== 'undefined' && target.hasOwnProperty('nodeName') && target.nodeName.toLowerCase() === 'img' );
	};
	
	main.is_touch_event = function ( e ) {
		
		var eOriginal = e.originalEvent;
		
		return eOriginal && eOriginal.touches && eOriginal.changedTouches;
		
	}
	
	// shared mouse
	
	main.get_mouse = function ( parameters, allowNew ) {
		
		return mouse = shared.mice[ 0 ] = shared.mice[ 0 ] || { 
			x: 0,
			lx: 0,
			y: 0,
			ly: 0,
			down: false 
		};
		
		parameters = parameters || {};
		
		var id = parameters.identifier = ( shared.multitouch === true && parameters.identifier ) ? parameters.identifier : 0,
			mouse;
		
		mouse = shared.mice[ id ] = ( allowNew !== true || id < shared.mice.length ) ? shared.mice[ id ] : { 
			x: 0,
			lx: 0,
			y: 0,
			ly: 0,
			down: false 
		};
		
		return mouse;
		
	}
	
	// object cloning/extending
	// copies both enumerable and non-enumerable properties
	// copies getters and setters correctly
	// optional: deep copying while avoiding infinite recursion
	// deep copy only makes one copy of any object, regardless of how many times / places it is referenced
	
	main.extend = function ( source, destination, deep, records ) {
		
		var i, l,
			propertyNames,
			name,
			descriptor,
			value,
			valueType,
			recordSources,
			recordCopies,
			recordSourceIndex,
			recordCopyIndex,
			recordSource,
			recordCopy;
		
		if ( typeof source !== 'undefined' ) {
			
			destination = destination || {};
			
			propertyNames = Object.getOwnPropertyNames( source );
			
			for ( i = 0, l = propertyNames.length; i < l; i++ ) {
				
				name = propertyNames[ i ];
				
				descriptor = Object.getOwnPropertyDescriptor( source, name );
				
				Object.defineProperty( destination, name, descriptor );
				
				// if deep copy
				
				if ( deep === true ) {
					
					// get descriptor that was just set
					
					descriptor = Object.getOwnPropertyDescriptor( destination, name );
					
					value = descriptor.value;
						
					valueType = main.type( value );
					
					// if the value of the descriptor is an object or array
					
					if ( valueType === 'object' || valueType === 'array' ) {
						
						records = records || { sources: [], copies: [] };
						
						recordSources = records.sources;
						
						recordCopies = records.copies;
						
						recordSourceIndex = recordSources.indexOf( value );
						
						// if value does not yet exist in records
						
						if ( recordSourceIndex === -1 ) {
							
							recordSource = recordSources[ recordSources.length ] = value;
							
							recordCopy = recordCopies[ recordCopies.length ] = ( valueType === 'object' ? {} : [] );
							
							// special case when object has a reference to itself
							
							if ( value === source ) {
								value[ name ] = recordCopy;
							}
							
							descriptor.value = main.extend( value, recordCopy, true, records );
							
						}
						else {
							
							descriptor.value = recordCopies[ recordSourceIndex ];
							
						}
						
						// set descriptor again with new deep copied value
					
						Object.defineProperty( destination, name, descriptor );
						
					}
					
				}
				
			}
			
		}
		
		return destination;
		
	};
	
	main.index_of_object_with_property_value = function ( array, property, value ) {
		
		var i, l,
			index = -1,
			object;
		
		if ( main.type( array ) === 'array' ) {
			
			for ( i = 0, l = array.length; i < l; i++ ) {
				
				object = array[ i ];
				
				if ( value === object[ property ] ) {
					
					index = i;
					
					break;
					
				}
				
			}
			
		}
		
		return index;
		
	}
	
	main.ensure_array = function ( target ) {
		
		target = target || [];
		
		if ( main.is_array ( target ) !== true ) {
			target = [target];
		}
		
		return target;
		
	};
	
	main.modify_array = function ( target, elements, remove ) {
		
		var i, l,
			element,
			index;
		
		if ( typeof target !== 'undefined' && typeof elements !== 'undefined' && typeof forEach === 'function' ) {
			
			elements = main.ensure_array( elements );
			
			// for each element
			
			for ( i = 0, l = elements.length; i < l; i++ ) {
				
				element = elements[ i ];
				
				index = target.indexof( element );
				
				if ( remove === true ) {
					
					if ( index !== -1 ) {
						
						target.splice( index, 1 );
						
					}
					
				}
				else {
					
					if ( index === -1 ) {
						
						target.push( element );
						
					}
					
				}
				
			}
			
		}
		
	};
	
	main.get_asset_path = function ( location ) {
		
		return location.path || location
		
	};
	
	main.get_ext = function ( location ) {
		
        var path, dotIndex, ext = '';
		
		path = main.get_asset_path( location );
        
        dotIndex = path.lastIndexOf('.');
        
        if ( dotIndex !== -1 ) {
            ext = path.substr( dotIndex + 1 ).toLowerCase();
        }
        
        return ext;
        
    };
	
	main.add_default_ext = function ( location ) {
		
		var path = main.remove_ext( location );
		
		path = path.replace(/\./g, "") + ".js";
		
		return path;
		
	};
	
	main.remove_ext = function ( location ) {
		
		var path, dotIndex;
		
        path = main.get_asset_path( location );
        
        dotIndex = path.lastIndexOf('.');
        
        if ( dotIndex !== -1 ) {
            path = path.substr( 0, dotIndex );
        }
		
		return path;
		
	};
	
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
		
	};
	
	main.is_image_ext = function ( ext ) {
		
		if ( ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'bmp' ) {
			return true;
		}
		else {
			return false;
		}
		
    };
	
	/*===================================================
    
    event functions
    
    =====================================================*/
	
	main.handle_touch_event = function ( e, eventActual ) {
		
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
    
    function on_mouse_down( e ) {
		
		var mouse;
		
		// is touch event
		
		if ( main.is_touch_event( e ) ) {
			
			main.handle_touch_event( e.originalEvent, on_mouse_down );
			
		}
		else {
			
			mouse = main.get_mouse( e, true );
			
			mouse.down = true;
		
			shared.signals.mousedown.dispatch( e );
			
		}
		
		shared.timeLastInteraction = 0;
        
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    
    function on_mouse_up( e ) {
		
		// is touch event
		
		if ( main.is_touch_event( e ) ){
			
			main.handle_touch_event( e.originalEvent, on_mouse_up );
		}
		else {
			
			mouse = main.get_mouse( e, true );
			
			mouse.down = false;
			
			shared.signals.mouseup.dispatch( e );
        
		}
		
		shared.timeLastInteraction = 0;
		
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
	
	function on_mouse_click ( e ) {
		
		if ( shared.galleryMode === true ) {
			
			e.preventDefault();
			e.stopPropagation();
			return false;
			
		}
		
	}
    
    function on_mouse_move( e ) {
		
		var mouse;
		
		// is touch event
		
		if ( main.is_touch_event( e ) ){
			
			main.handle_touch_event( e.originalEvent, on_mouse_move );
		}
		else {
			
			mouse = main.get_mouse( e, true );
			
			mouse.lx = mouse.x;
			mouse.ly = mouse.y;
			
			mouse.x = e.clientX;
			mouse.y = e.clientY;
			
			mouse.dx = mouse.x - mouse.lx;
			mouse.dy = mouse.y - mouse.ly;
			
			shared.signals.mousemoved.dispatch( e );
			
		}
		
		shared.timeLastInteraction = 0;
        
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
	
	function on_mouse_enter ( e ) {
		
		// is touch event
		
		if ( main.is_touch_event( e ) ){
			
			main.handle_touch_event( e.originalEvent, on_mouse_enter );
		}
		else {
			
			main.get_mouse( e, true );
			
			shared.signals.mouseenter.dispatch( e );
			
		}
        
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
	
	function on_mouse_leave ( e ) {
		
		var mouse;
		
		// is touch event
		
		if ( main.is_touch_event( e ) ){
			
			main.handle_touch_event( e.originalEvent, on_mouse_leave );
		}
		else {
			
			mouse = main.get_mouse( e, true );
			
			shared.signals.mouseleave.dispatch( e );
			
			if ( mouse.down === true ) {
				
				on_mouse_up( e );
				
			}
			
		}
        
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    
    function on_mouse_wheel( e ) {
		
		var eo = e.originalEvent || e;
		
		// normalize scroll across browsers
		// simple implementation, removes acceleration
		
		e.wheelDelta = eo.wheelDelta = ( ( eo.detail < 0 || eo.wheelDelta > 0 ) ? 1 : -1 ) * shared.mouseWheelSpeed;
		
        shared.signals.mousewheel.dispatch( e );
		
		shared.timeLastInteraction = 0;
        
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
				
				eCopy = main.extend( e, {} );
				
				eCopy.identifier = i;
				
				shared.signals.mousemoved.dispatch( eCopy );
			
			}
			
			lastGamma = gamma;
			lastBeta = beta;
			
			shared.timeLastInteraction = 0;
            
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
		
    }

    function on_key_down( e ) {
		
        shared.signals.keydown.dispatch( e );
		
		shared.timeLastInteraction = 0;
        
        /*
        e.preventDefault();
        e.stopPropagation();
        return false;
        */
    }

    function on_key_up( e ) {
		
        shared.signals.keyup.dispatch( e );
		
		shared.timeLastInteraction = 0;
        
        /*
        e.preventDefault();
        e.stopPropagation();
        return false;
        */
    }
	
	function on_focus_lose ( e ) {
		
		shared.signals.focuslose.dispatch( e );
		
		if ( typeof _Game !== 'undefined' ) {
			
			_Game.pause();
			
		}
		
	}
	
	function on_focus_gain ( e ) {
		
		shared.signals.focusgain.dispatch( e );
		
		if ( typeof _Game !== 'undefined' && _Game.started !== true ) {
			
			_Game.resume();
			
		}
		
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
		
		shared.signals.error.dispatch( error, url, lineNumber );
		
		return true;
		
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
		
		if ( assetNew instanceof KaiopuaAsset ) {
			
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
			
			// if asset at path and is not empty
			
			if ( asset instanceof KaiopuaAsset && asset.is_empty() === false ) {
				
				// if new asset is not empty
				
				if ( assetNew.is_empty() === false ) {
					
					// merge new asset into current
					
					asset.merge_asset_self( assetNew );
					
				}
				
			}
			// else replace current empty asset with new asset
			else {
				
				parent[ assetName ] = asset = assetNew;
				
			}
			
		}
		
		return asset;
		
	}
	
	main.get_asset_data = function ( location ) {
		
		var asset,
			data;
		
		// get asset at location
		
		asset = main.get_asset( location );
		
		// asset data, assume asset is data if not instance of asset
				
		data = ( asset instanceof KaiopuaAsset ) ? asset.data : asset;
		
		return data;
		
	}
	
	main.asset_register = function ( path, parameters ) {
		
		var assetNew,
			assetCurrent,
			assetCurrentWaiting;
		
		// initialize new asset
		
		assetNew = new KaiopuaAsset( path, parameters );
		
		// asset is usually only useful internally
		// so return asset data
		
		return assetNew.data;
		
	}
	
	main.asset_ready = function ( path, asset ) {
		
		var i, l;
		
		asset = asset || main.get_asset( path );
		
		if ( asset instanceof KaiopuaAsset ) {
			
			// ready and not waiting
			
			asset.ready = true;
			
			asset.wait = false;
			
			// dispatch signal
			
			if ( typeof shared.signals !== 'undefined' && typeof shared.signals.assetReady !== 'undefined' ) {
				
				shared.signals.assetReady.dispatch( path );
				
			}
			
		}
		
	}
	
	main.asset_require = function ( requirements, callbackList, waitForAssetsReady, loaderUIContainer, assetSource ) {
		
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
				
				// check if no more to wait for
				
				if ( assetsWaitingFor.length === 0 && assetsReady.length === requirements.length ) {
					
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
				
				callback = callbackList[ i ];
				
				callback.apply( this, assetsRequired );
				
			}
			
			// if source asset passed and needs auto ready update
			
			if ( assetSource instanceof KaiopuaAsset && assetSource.readyAutoUpdate === true ) {
				
				assetSource.on_ready();
				
			}
			
		};
		
		callback_outer = function () {
			
			var i, l,
				location,
				path,
				asset;
			
			// hide loader ui
			
			if ( typeof loaderUIContainer !== 'undefined' ) {
				
				_AssetLoader.hide_ui( { remove: true } );
				
			}
			
			// find all assets
			
			for ( i = 0, l = requirements.length; i < l; i++ ) {
				
				location = requirements[ i ];
				
				path = main.get_asset_path( location );
				
				// get asset
				
				asset = main.get_asset( location );
				
				// add data to required list
				
				if ( asset instanceof KaiopuaAsset ) {
					
					assetsRequired.push( asset.data );
					
				}
				
				// if needed ready
				
				if ( waitForAssetsReady === true ) {
					
					assetsWaitingFor.push( path );
					
					// check ready status
					
					if ( asset instanceof KaiopuaAsset && asset.ready === true ) {
						
						on_asset_ready( path );
						
					}
					// asset not ready, listen for ready signal if not already
					else if ( listeningForReadySignal === false ) {
						
						listeningForReadySignal = true;
						
						shared.signals.assetReady.add( on_asset_ready );
						
					}
					
				}
				
			}
			
			// if not waiting for assets to be ready
			
			if ( waitForAssetsReady !== true || requirements.length === 0 ) {
				
				on_all_assets_ready();
				
			}
			
		};
		
		// set loader manually if needed
		
		if ( typeof _AssetLoader === 'undefined' ) {
			
			_AssetLoader = main.get_asset_data( 'assets/modules/utils/AssetLoader.js' );
			
		}
		
		// show loader ui
		
		if ( typeof loaderUIContainer !== 'undefined' ) {
			
			_AssetLoader.show_ui( { parent: loaderUIContainer } );
			
		}
		
		// pass all requirements to loader
		
		_AssetLoader.load( requirements, callback_outer );
		
	}
	
	/*===================================================
    
    asset instance
    
    =====================================================*/
	
	function KaiopuaAsset ( path, parameters ) {
		
		var assetNew = this;
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.path = path;
		
		assetNew.merge_asset_self( parameters, true );
		
		// if asset has path
		
		if ( typeof assetNew.path !== 'undefined' ) {
			
			// store this new asset
			// returned asset from store is new asset merged into current asset if exists
			// or this new asset if no assets at path yet
			
			assetNew = main.set_asset( assetNew.path, assetNew );
			
			// regardless of storage results
			// handle this new asset's readiness and requirements
			
			if ( assetNew === this && this.readyAutoUpdate === true && ( this.requirements.length === 0 || this.wait !== true ) ) {
				
				this.on_ready();
				
			}
			
			if ( this.requirements.length > 0 ) {
				
				main.asset_require( this.requirements, this.callbacksOnReqs, this.wait, this.loaderUIContainer, this );
			
			}
			
		}
		
		return assetNew;
		
	}
	
	KaiopuaAsset.prototype = new Object();
	KaiopuaAsset.prototype.constructor = KaiopuaAsset;
	
	KaiopuaAsset.prototype.handle_requirements = function () {
		
		
		
	}
	
	KaiopuaAsset.prototype.merge_asset_self = function ( asset, includeRequirements ) {
		
		var readyCallbackIndex;
		
		// TODO:
		// make sure merging accounts for new requirements and loading
		
		if ( typeof asset !== 'undefined' ) {
			
			this.path = asset.path;
			
			// merge asset data into this data
			
			this.merge_asset_data_self( asset );
			
			// if either asset is waiting
			
			if ( typeof this.wait !== 'boolean' || this.wait === false ) {
			
				if ( asset.wait === true ) {
					
					this.wait = asset.wait;
					
				}
				else {
					
					this.wait = false;
					
				}
				
			}
			
			// if asset is not ready
			
			if ( this.ready !== true ) {
				
				this.ready = false;
				
			}
			
			// requirements basics
			
			if ( typeof this.readyAutoUpdate !== 'boolean' ) {
			
				if ( asset.hasOwnProperty( 'readyAutoUpdate' ) ) {
					
					this.readyAutoUpdate = asset.readyAutoUpdate;
					
				}
				else {
					
					this.readyAutoUpdate = true;
					
				}
				
			}
			
			this.requirements = main.ensure_array( this.requirements );
			
			this.callbacksOnReqs = main.ensure_array( this.callbacksOnReqs );
			
			// if should also copy requirements
			
			if ( includeRequirements === true ) {
			
				this.requirements = this.requirements.concat( main.ensure_array( asset.requirements ) );
				
				this.callbacksOnReqs = this.callbacksOnReqs.concat( main.ensure_array( asset.callbacksOnReqs ) );
				
				this.loaderUIContainer = this.loaderUIContainer || asset.loaderUIContainer;
				
			}
			
		}
		
	}
	
	KaiopuaAsset.prototype.merge_asset_data_self = function ( source ) {
		
		var dataSrc = source.data;
		
		// if source data exists
		
		if ( typeof dataSrc !== 'undefined' ) {
			
			// if this data does not exist or source data is image, set as data instead of merging, as merging causes issues
			
			if ( typeof this.data === 'undefined' || main.is_image( dataSrc ) ) {
				
				this.data = dataSrc;
				
			}
			else {
				
				// copy properties of source asset data into this data
				// order is important to ensure this data remains an instance of whatever it is
				
				main.extend( dataSrc, this.data );
				
			}
			
		}
		
	}
	
	KaiopuaAsset.prototype.is_empty = function () {
		
		var isEmpty = true;
		
		if ( typeof this.data !== 'undefined' || ( this.ready === false && this.requirements.length > 0 ) ) {
			
			isEmpty = false;
			
		}
		
		return isEmpty;
		
	}
	
	KaiopuaAsset.prototype.on_ready = function () {
		
		main.asset_ready( this.path, this );
		
	}
    
    return main; 
    
} ( KAIOPUA || {} ) );