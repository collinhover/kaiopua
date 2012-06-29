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
		_Game,
		_ProgressBar,
		loader = {},
		eventHandles = {},
        lastGamma, lastBeta,
		assetCount = 0,
        libList = [
			"js/lib/dojo/dojo.js",
			"js/lib/less-1.3.0.min.js",
            "js/lib/jquery-1.7.2.min.js",
            "js/lib/RequestAnimationFrame.js",
            "js/lib/requestInterval.js",
            "js/lib/requestTimeout.js",
			"js/lib/Tween.js",
			"js/lib/sylvester.js"
        ],
		dojoExtras = [
			"dojo/touch",
			"dojox/gesture/tap",
			"dojox/gesture/swipe"
		],
        setupList = [
			"assets/modules/utils/MathHelper.js",
			"assets/modules/ui/ProgressBar",
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
        
		// load dojo extras
		
		require( dojoExtras, function () {
			
			// add listeners for events
			
			dojo.connect( 'onfocus', on_focus_gain );
			dojo.connect( 'onblur', on_focus_lose );
			
            dojo.connect( window, dojo.touch.press, on_input_press );
            dojo.connect( window, dojo.touch.move, on_input_move );
            dojo.connect( window, dojo.touch.release, on_input_release );
            dojo.connect( window, dojo.touch.cancel, on_input_cancel );
			
			dojo.connect( window, dojox.gesture.tap, on_input_tap );
            dojo.connect( window, dojox.gesture.tap.hold, on_input_tap_hold );
            dojo.connect( window, dojox.gesture.tap.doubletap, on_input_tap_double );
            dojo.connect( window, dojox.gesture.swipe, on_input_swipe );
            dojo.connect( window, dojox.gesture.swipe.end, on_input_swipe_end );
			
			dojo.connect( window, ( !dojo.isMozilla ? "onmousewheel" : "DOMMouseScroll" ), on_input_scroll );
			
			dojo.connect( window, 'onkeypress', on_key_press );
			dojo.connect( window, 'onkeyup', on_key_up );
			
			eventHandles[ 'onwindowdeviceorientation' ] = dojo.connect( window, ( !dojo.isMozilla ? "deviceorientation" : "MozOrientation" ), on_window_device_orientation );
			dojo.connect( window, 'onresize', on_window_resize );
			dojo.connect( window, 'onerror', on_error );
			
			// loader
			
			loader.active = false;
			loader.listCount = 0;
			loader.lists = [];
			loader.listLocations = {};
			loader.listLoaded = {};
			loader.listMessages = {};
			loader.listCallbacks = {};
			loader.loading = [];
			loader.loadingListIDs = [];
			loader.started = [];
			loader.loaded = [];
			loader.loadingOrLoaded = [];
			loader.listCurrent = '';
			loader.loadTypeBase = 'script';
			loader.tips = [];
			
			Object.defineProperty( main, 'loadingHeader', {
				set: function ( header ) { 
					
					if ( typeof loader.progressBar !== 'undefined' ) {
						
						loader.progressBar.header = header;
						
					}
					
				}
			});
			
			Object.defineProperty( main, 'loadingTips', {
				set: function ( tips ) { 
					
					if ( is_array( tips ) ) {
						
						loader.tips = tips.slice( 0 );
						
					}
					
				}
			});
			
			add_loaded_locations( libList );
			
			// public functions
			
			main.type = type;
			main.is_number = is_number;
			main.is_array = is_array;
			main.is_image = is_image;
			main.is_image_ext = is_image_ext;
			
			main.extend = extend;
			main.time_test = time_test;
			main.get_mouse = get_mouse;
			main.generate_dom_image = generate_dom_image;
			
			main.ensure_array = ensure_array;
			main.ensure_not_array = ensure_not_array;
			main.modify_array = modify_array;
			main.index_of_object_with_property_value = index_of_object_with_property_value;
			
			main.get_asset_path = get_asset_path;
			main.get_ext = get_ext;
			main.add_default_ext = add_default_ext;
			main.remove_ext = remove_ext;
			main.get_alt_path = get_alt_path;
			
			main.handle_touch_event = handle_touch_event;
			
			main.load = load;
			main.get_is_loaded = get_is_loaded;
			main.get_is_loading = get_is_loading;
			main.get_is_loading_or_loaded = get_is_loading_or_loaded;
			
			main.asset_register = asset_register;
			main.asset_require = asset_require;
			main.asset_ready = asset_ready;
			main.set_asset = set_asset;
			main.get_asset = get_asset;
			main.get_asset_data = get_asset_data;
			
			// load for setup
			
			asset_require( setupList, init_setup, true );
			
		} );
		
    }
    
    function init_setup ( mh, pb, g ) {
		console.log( 'init setup');
        // assets
        
		_MathHelper = mh;
		_ProgressBar = pb;
        _Game = g;
		
		// create progress bar for loading
		
		loader.progressBar = new _ProgressBar.Instance();
        
        // resize once
		
        on_window_resize();
		
		// begin global update loop
		
		update();
		
    }
	
	/*===================================================
    
    type checking
    
    =====================================================*/
	
	function type ( o ) {
		return o==null?o+'':Object.prototype.toString.call(o).slice(8,-1).toLowerCase();
	}
	
	function is_array ( target ) {
		return Object.prototype.toString.call( target ) === '[object Array]';
	}
	
	function is_number ( n ) {
		return !isNaN( n ) && isFinite( n );
	}
	
	function is_image ( target ) {
		return ( typeof target !== 'undefined' && target.hasOwnProperty('nodeName') && target.nodeName.toLowerCase() === 'img' );
	}
	
	function is_image_ext ( ext ) {
		
		if ( ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'bmp' ) {
			return true;
		}
		else {
			return false;
		}
		
    }
	
	function is_touch_event ( e ) {
		
		var eOriginal = e.originalEvent;
		
		return eOriginal && eOriginal.touches && eOriginal.changedTouches;
		
	}
	
	/*===================================================
    
    general helpers
    
    =====================================================*/
	
	// object cloning/extending
	// copies both enumerable and non-enumerable properties
	// copies getters and setters correctly
	// optional: deep copying while avoiding infinite recursion
	// deep copy only makes one copy of any object, regardless of how many times / places it is referenced
	
	function extend ( source, destination, deep, records ) {
		
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
				
				if ( destination.hasOwnProperty( name ) ) {
					
					delete destination[ name ];
					
				}
				
				Object.defineProperty( destination, name, descriptor );
				
				// if deep copy
				
				if ( deep === true ) {
					
					// get descriptor that was just set
					
					descriptor = Object.getOwnPropertyDescriptor( destination, name );
					
					value = descriptor.value;
						
					valueType = type( value );
					
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
							
							descriptor.value = extend( value, recordCopy, true, records );
							
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
		
	}
	
	function time_test ( fn, iterations, message ) {
		
		var i,
			ta, tb,
			result;
		
		iterations = is_number( iterations ) && iterations > 0 ? iterations : 1;
		
		message = typeof message === 'string' ? message : '';
		
		ta = new Date().getTime();
		
		for ( i = 0; i < iterations; i++ ) {
			
			result = fn.call();
			
		}
		
		tb = new Date().getTime();
		
		console.log( message, ' > time test ( x', iterations, '): ', (tb - ta) );
		
		return result;
		
	}
	
	function get_mouse ( parameters, allowNew ) {
		
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
	
	function generate_dom_image ( path, callback, context, image ) {
		
		var loadCallback = function () {
			
			if ( typeof callback === 'function' ) {
				
				callback.call( context, image );
				
			}
			
		};
		
		if ( is_image( image ) !== true ) {
			
			image = new Image();
			
		}
		
		image.crossOrigin = '';
		image.src = path;
		
		if ( image.complete ) {
			
			loadCallback();
		}
		else {
			
			image.onload = loadCallback;
			
		}
		
		return image;
		
    }
	
	/*===================================================
    
    array / object helpers
    
    =====================================================*/
	
	function ensure_array ( target ) {
		
		return target ? ( is_array ( target ) !== true ? [ target ] : target ) : [];
		
	}
	
	function ensure_not_array ( target, index ) {
		
		return is_array ( target ) === true ? target[ index || 0 ] : target;
		
	}
	
	function modify_array( target, elements, remove ) {
		
		var i, l,
			element,
			index;
		
		if ( typeof target !== 'undefined' && typeof elements !== 'undefined' && typeof forEach === 'function' ) {
			
			elements = ensure_array( elements );
			
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
		
	}
	
	function index_of_object_with_property_value( array, property, value ) {
		
		var i, l,
			index = -1,
			object;
		
		for ( i = 0, l = array.length; i < l; i++ ) {
			
			object = array[ i ];
			
			if ( value === object[ property ] ) {
				
				index = i;
				
				break;
				
			}
			
		}
		
		return index;
		
	}
	
	/*===================================================
    
	path / extension helpers
    
    =====================================================*/
	
	function get_asset_path( location ) {
		
		return location.path || location
		
	}
	
	function get_ext( location ) {
		
        var path, dotIndex, ext = '';
		
		path = get_asset_path( location );
        
        dotIndex = path.lastIndexOf('.');
        
        if ( dotIndex !== -1 ) {
            ext = path.substr( dotIndex + 1 ).toLowerCase();
        }
        
        return ext;
        
    }
	
	function add_default_ext( location ) {
		
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
	
	/*===================================================
	
	update
	
	=====================================================*/
	
	function update () {
		
		var timeDelta,
			timeDeltaMod;
        
		window.requestAnimationFrame( update );
		
		// handle time
		
		shared.timeLast = shared.time;
		
		shared.time = new Date().getTime();
		
		timeDelta = shared.time - shared.timeLast;
		
		// get time delta modifier from timeDelta vs expected refresh interval
		
		timeDeltaMod = _MathHelper.round( timeDelta / shared.timeDeltaExpected, 2 );
		
		if ( is_number( timeDeltaMod ) !== true ) {
			
			timeDeltaMod = 1;
			
		}
		
		// update time since last interaction
		
		shared.timeLastInteraction += timeDelta;
		
		// update tween
		
		TWEEN.update();
		
		// publish update
		
		dojo.publish( 'update', [ timeDelta, timeDeltaMod ] );
		
		// handle gallery mode
		
		if ( shared.galleryMode === true && shared.timeLastInteraction >= shared.timeLastInteractionMax && typeof _Game !== 'undefined' && _Game.started === true ) {
			
			_Game.stop();
			
		}
		
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
    
    function on_input_press( e ) {
		//console.log( 'press', e );
		var mouse;
		
		// is touch event
		
		if ( is_touch_event( e ) ) {
			
			handle_touch_event( e.originalEvent, on_input_press );
			
		}
		else {
			
			mouse = get_mouse( e, true );
			
			mouse.down = true;
		
			dojo.publish( 'oninputpress', [ e ] );
			
		}
		
		shared.timeLastInteraction = 0;
        
        e.preventDefault();
        e.stopPropagation();
        return false;
		
    }
    
    function on_input_release( e ) {
		//console.log( 'release', e );
		// is touch event
		
		if ( is_touch_event( e ) ){
			
			handle_touch_event( e.originalEvent, on_input_release );
		}
		else {
			
			mouse = get_mouse( e, true );
			
			mouse.down = false;
			
			dojo.publish( 'oninputrelease', [ e ] );
        
		}
		
		shared.timeLastInteraction = 0;
		
        e.preventDefault();
        e.stopPropagation();
        return false;
		
    }
    
    function on_input_move( e ) {
		//console.log( 'move', e );
		var mouse;
		
		// is touch event
		
		if ( is_touch_event( e ) ){
			
			handle_touch_event( e.originalEvent, on_input_move );
		}
		else {
			
			mouse = get_mouse( e, true );
			
			mouse.lx = mouse.x;
			mouse.ly = mouse.y;
			
			mouse.x = e.clientX;
			mouse.y = e.clientY;
			
			mouse.dx = mouse.x - mouse.lx;
			mouse.dy = mouse.y - mouse.ly;
			
			dojo.publish( 'oninputmove', [ e ] );
			
		}
		
		shared.timeLastInteraction = 0;
        
        e.preventDefault();
        e.stopPropagation();
        return false;
		
    }
	
	function on_input_cancel ( e ) {
		//console.log( 'cancel', e );
		var mouse;
		
		// is touch event
		
		if ( is_touch_event( e ) ){
			
			handle_touch_event( e.originalEvent, on_input_cancel );
		}
		else {
			
			mouse = get_mouse( e, true );
			
			dojo.publish( 'oninputcancel', [ e ] );
			
			if ( mouse.down === true ) {
				
				on_input_release( e );
				
			}
			
		}
        
        e.preventDefault();
        e.stopPropagation();
        return false;
		
    }
	
	function on_input_tap ( e ) {
		//console.log( 'tap', e );
		
        e.preventDefault();
        e.stopPropagation();
        return false;
		
	}
	
	function on_input_tap_double ( e ) {
		//console.log( 'tapdouble', e );
		
        e.preventDefault();
        e.stopPropagation();
        return false;
		
	}
	
	function on_input_tap_hold ( e ) {
		//console.log( 'taphold', e );
		
        e.preventDefault();
        e.stopPropagation();
        return false;
		
	}
	
	function on_input_swipe ( e ) {
		//console.log( 'swipe', e );
		
        e.preventDefault();
        e.stopPropagation();
        return false;
		
	}
	
	function on_input_swipe_end ( e ) {
		//console.log( 'swipeend', e );
		
        e.preventDefault();
        e.stopPropagation();
        return false;
		
	}
    
    function on_input_scroll( e ) {
		//console.log( 'scroll', e );
		var eo = e.originalEvent || e;
		
		// normalize scroll across browsers
		// simple implementation, removes acceleration
		
		e.wheelDelta = eo.wheelDelta = ( ( eo.detail < 0 || eo.wheelDelta > 0 ) ? 1 : -1 ) * shared.mouseWheelSpeed;
		e.button = 'mousewheel';
		
        dojo.publish( 'inputScroll', [ e ] );
		
		shared.timeLastInteraction = 0;
		/*
        e.preventDefault();
        e.stopPropagation();
        return false;
		*/
    }
    
    function on_window_device_orientation( e ) {
		
        var i, l, mice, mouse, eCopy, overThreshold, gamma, beta, x, y;
        
        if ( ! e.gamma && !e.beta ) {
                e.gamma = -(e.x * (180 / Math.PI));
                e.beta = -(e.y * (180 / Math.PI));
        }
        else if( e.alpha === null && e.beta === null && e.gamma === null ) {
			
			dojo.disconnect( eventHandles[ 'onwindowdeviceorientation' ] );
			
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
				
				eCopy = extend( e, {} );
				
				eCopy.identifier = i;
				
				dojo.publish( 'onwindowdeviceorientation', [ eCopy ] );
			
			}
			
			lastGamma = gamma;
			lastBeta = beta;
			
			shared.timeLastInteraction = 0;
            
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
		
    }
	
	function on_key_press ( e ) {
		//console.log( 'keypress', e );
		dojo.publish( 'onkeypress', [ e ] );
		
		shared.timeLastInteraction = 0;
		
		/*
        e.preventDefault();
        e.stopPropagation();
        return false;
        */
		
	}

    function on_key_up( e ) {
		//console.log( 'keyup', e );
		dojo.publish( 'onkeyup', [ e ] );
		
		shared.timeLastInteraction = 0;
        
        /*
        e.preventDefault();
        e.stopPropagation();
        return false;
        */
    }
	
	function on_focus_lose ( e ) {
		//console.log( 'blur', e );
		if ( typeof _Game !== 'undefined' ) {
			
			_Game.pause();
			
		}
		
	}
	
	function on_focus_gain ( e ) {
		//console.log( 'focus', e );
		if ( typeof _Game !== 'undefined' && _Game.started !== true ) {
			
			_Game.resume();
			
		}
		
	}

    function on_window_resize( e ) {
		//console.log( 'resize', e );
        shared.screenWidth = $(window).width();
        shared.screenHeight = $(window).height();
        
		dojo.publish( 'resize', [ shared.screenWidth, shared.screenHeight ] );
        
        if (typeof e !== 'undefined') {
            e.preventDefault();
            e.stopPropagation();
        }
        return false;
    }
	
	function on_error ( error, url, lineNumber ) {
		//console.log( 'error', error );
		dojo.publish( 'onerror', [ error, url, lineNumber ] );
		
		return true;
		
	}
	
	/*===================================================
	
	loading functions
	
	=====================================================*/
	
	function load ( locationsList, callbackList, listID, loadingMessage ) {
		
		var i, l,
			location,
			path,
			indexLoading,
			indexLoaded,
			allLocationsLoaded = true,
			assetData;
		
		if ( typeof locationsList !== 'undefined' ) {
			
			// get if list is not array
			
			if ( typeof locationsList === 'string' || locationsList.hasOwnProperty( 'length' ) === false ) {
				locationsList = [locationsList];
			}
			
			// make a copy of locations list
			
			locationsList = locationsList.slice( 0 );
			
			// handle list id
			
			if ( typeof listID !== 'string' ||  loader.listLocations.hasOwnProperty( listID )) {
				
				listID = loader.listCount;
				
			}
			
			// increase list count
			
			loader.listCount++;
			
			// permanent store of all loading
			
			for ( i = 0, l = locationsList.length; i < l; i++ ) {
				
				location = locationsList[ i ];
				
				path = get_asset_path( location );
				
				indexLoading = loader.loading.indexOf( path );
				indexLoaded = loader.loaded.indexOf( path );
				
				// if not already loading or loaded item
				// load new location
				if ( indexLoading === -1 && indexLoaded == -1 ) {
					
					loader.loading.push( path );
					
					loader.loadingListIDs.push( listID );
					
					newLocations = true;
					
				}
				
				// if not yet loaded, mark list for loading
				
				if ( indexLoaded === -1 ) {
					
					allLocationsLoaded = false;
					
				}
				
			}
			
			loader.loadingOrLoaded = loader.loaded.concat( loader.loading );
			
			// temporary store locations
			
			loader.listLocations[listID] = locationsList;
			
			// temporary store callback list
			
			if ( typeof callbackList === 'undefined' ) {
				callbackList = [];
			}
			else if ( typeof callbackList === 'function' || callbackList.hasOwnProperty( 'length' ) === false ) {
				callbackList = [callbackList];
			}
			
			loader.listCallbacks[listID] = callbackList;
			
			// store load message
			
			if ( typeof loadingMessage !== 'string' ) {
				
				loadingMessage = loader.tips[ Math.max(0, Math.min(loader.tips.length - 1, Math.round(Math.random() * loader.tips.length) - 1)) ];
			}
			
			loader.listMessages[listID] = loadingMessage;
			
			// init new loaded array
			
			loader.listLoaded[listID] = [];
			
			// add list ID to lists to load
				
			loader.lists.push(listID);
			
			// if all locations in list are already loaded, skip loading process
			
			if ( allLocationsLoaded === true ) {
				
				list_completed( listID );
				
			}
			else {
				
				// start loading
				
				load_next_list();
				
			}
			
		}
		
	}
	
	function load_next_list () {
		
		var i, l,
			locationsList,
			location,
			path;
		
		// if any lists to load
		
		if ( loader.active === false && loader.lists.length > 0 ) {
			
			loader.active = true;
			
			// get next list 
			
			loader.listCurrent = loader.lists[ 0 ];
			
			// update ui to reset fill
			
			if ( typeof loader.progressBar !== 'undefined' ) {
				loader.progressBar.update_progress( 0, loader.listMessages[loader.listCurrent] );
			}
			
			// get locations, make copy because already loaded items will be removed from list immediately
			
			locationsList = loader.listLocations[loader.listCurrent].slice( 0 );
			
			// for each item location
			
			for (i = 0, l = locationsList.length; i < l; i += 1) {
				
				location = locationsList[ i ];
				
				path = get_asset_path( location );
				
				// if already loaded
				
				if ( loader.loaded.indexOf( path ) !== -1 ) {
					
					// make duplicate complete event
					
					load_single_completed( location );
					
				}
				// if not started loading yet
				else if ( loader.started.indexOf( path ) === -1 ) {
					
					// load it
					
					loader.started.push( path );
					
					load_single( location );
					
				}
				
			}
			
		}
		else {
			
			// no longer loading
			
			loader.listCurrent = undefined;
			
			dojo.publish( 'Loader.allComplete' );
			
		}
		
	}
	
	function load_single ( location ) {
		var path, 
			ext, 
			loadType, 
			data,
			defaultCallback = function ( ) {
				load_single_completed( location, data );
			},
			modelCallback = function ( geometry ) {
				load_single_completed( location, geometry );
			};
		
		if ( typeof location !== 'undefined' ) {
			
			// load based on type of location and file extension
			
			// LAB handles scripts (js)
			// THREE handles models (ascii/bin js) and images (jpg/png/gif/bmp)
			
			// get type
			
			loadType = location.type || loader.loadTypeBase;
			
			// get location path
			
			path = get_asset_path( location );
			
			// get extension
			
			ext = get_ext( path );
			
			// ensure path has extension
			
			if ( ext === '' ) {
				
				path = add_default_ext( path );
				
			}
			
			// type and/or extension check
			
			if ( loadType === 'image' || is_image_ext( ext ) ) {
				
				// load
				
				data = generate_dom_image( path, function ( image ) {
					
					data = image;
					
					defaultCallback();
					
				} );
				
				// store empty image data in assets immediately
				
				asset_register( path, { data: data } );
				
			}
			else if ( loadType === 'model' || loadType === 'model_ascii' ) {
				
				// init loader if needed
				
				if ( typeof loader.threeJSON === 'undefined' ) {
					loader.threeJSON = new THREE.JSONLoader( true );
				}
				
				loader.threeJSON.load( path, modelCallback );
				
			}
			// default to script loading
			else {
				
				$LAB.script( path ).wait( defaultCallback );
				
			}
			
		}
		
	}
	
	function load_single_completed ( location, data ) {
		var i, l,
			listID,
			locationsList,
			loadedList,
			index,
			path,
			loadType,
			listsCompleted;
		
		// get location path and type
		
		path = get_asset_path( location );
		
		loadType = get_load_type( location );
		
		// register asset
		
		asset_register( path, { data: data } );
		
		// add as loaded
		
		add_loaded_locations( path );
		
		// event
		
		dojo.publish( 'Loader.itemComplete', [ path ] );
		
		// for each list loading
		
		for ( i = 0, l = loader.lists.length; i < l; i++ ) {
			
			listID = loader.lists[ i ];
			
			locationsList = loader.listLocations[ listID ];
			
			// get index in locations list
			
			index = locationsList.indexOf(location);
			
			// if is in list
			
			if ( index !== -1 ) {
				
				loadedList = loader.listLoaded[ listID ];
				
				// remove location from locations list
				
				locationsList.splice(index, index !== -1 ? 1 : 0);
				
				// add location to loaded list
				
				loadedList.push( location );
				
				// if is current list
				
				if ( listID === loader.listCurrent ) {
					
					// update progress bar
					if ( typeof loader.progressBar !== 'undefined' ) {
						loader.progressBar.update_progress( loadedList.length / ( locationsList.length + loadedList.length ) );
					}
					
				}
				
				// if current list is complete, defer until all checked
				
				if ( locationsList.length === 0 ) {
					
					listsCompleted = listsCompleted || [];
					
					listsCompleted.push( listID );
					
				}
				
			}
			
		}
		
		// complete any completed lists
		if ( typeof listsCompleted !== 'undefined' ) {
			
			for ( i = 0, l = listsCompleted.length; i < l; i++ ) {
				
				list_completed( listsCompleted[ i ] );
				
			}
			
		}
		
	}
	
	function list_completed( listID ) {
		var i, l, 
			callbackList, 
			callback,
			listIndex;
		
		// remove list from all lists to load
		
		listIndex = loader.lists.indexOf( listID );
		
		if ( listIndex !== -1 ) {
			
			loader.lists.splice( listIndex, 1 );
			
		}
		
		// do callbacks before clear
		
		callbackList = loader.listCallbacks[ listID ];
		
		for ( i = 0, l = callbackList.length; i < l; i++ ) {
			
			callback = callbackList[ i ];
			
			if ( typeof callback !== 'undefined' ) {
				
				callback.call( this );
				
			}
			
		}
		
		// event
		
		dojo.publish( 'Loader.listComplete', [ listID ] );
		
		// clear
		
		delete loader.listLocations[ listID ];
		
		delete loader.listCallbacks[ listID ];
		
		delete loader.listMessages[ listID ];
		
		delete loader.listLoaded[ listID ];
		
		loader.active = false;
		
		// start next list
		
		load_next_list();
		
	}
	
	function add_loaded_locations ( locationsList ) {
		
		var i, l,
			location,
			path,
			indexLoaded,
			indexLoading,
			locationAdded = false;
		
		locationsList = ensure_array( locationsList );
		
		// for each location
		
		for ( i = 0, l = locationsList.length; i < l; i++ ) {
			
			location = locationsList[ i ];
			
			path = get_asset_path( location );
			
			// update all loading
			
			indexLoading = loader.loading.indexOf( path );
			
			if ( indexLoading !== -1 ) {
				
				loader.loadingListIDs.splice( indexLoading, 1 );
				
				loader.loading.splice( indexLoading, 1 );
				
			}
			
			// update all loaded
			
			indexLoaded = loader.loaded.indexOf( path );
			
			if ( indexLoaded === -1 ) {
				
				loader.loaded.push( path );
				
				locationAdded = true;
				
			}
			
		}
		
		if ( locationAdded === true ) {
			
			loader.loadingOrLoaded = loader.loaded.concat( loader.loading );
			
		}
		
	}
	
	function get_is_path_in_list ( location, list ) {
		
		var path,
			index;
		
		path = get_asset_path( location );
		
		index = list.indexOf( path );
		
		if ( index !== -1 ) {
			
			return true;
			
		}
		else {
			
			return false;
			
		}
		
	}
	
	function get_is_loading_or_loaded ( location ) {
		
		return get_is_path_in_list( location, loader.loadingOrLoaded );
		
	}
	
	function get_is_loaded ( location ) {
		
		return get_is_path_in_list( location, loader.loaded );
		
	}
	
	function get_is_loading ( location ) {
		
		return get_is_path_in_list( location, loader.loading );
		
	}
	
	function get_load_type ( location ) {
		
		return location.type || loader.loadTypeBase;
		
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
	
	function get_asset ( location, attempts ) {
		
		var path,
			cascade,
			parent,
			assetName,
			asset,
			i, l;
		
		// init parent and asset
		
		asset = parent = main;
		
		// cascade path
		
		path = get_asset_path( location );
		
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
				
				return get_asset( get_alt_path( path ), attempts + 1 );
				
			}
			
		}
		
		return asset;
		
	}
	
	function set_asset ( location, assetNew ) {
		
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
			
			path = get_asset_path( location );
			
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
	
	function get_asset_data ( location ) {
		
		var asset,
			data;
		
		// get asset at location
		
		asset = get_asset( location );
		
		// asset data, assume asset is data if not instance of asset
				
		data = ( asset instanceof KaiopuaAsset ) ? asset.data : asset;
		
		return data;
		
	}
	
	function asset_register( path, parameters ) {
		
		var assetNew,
			dataNew,
			assetCurrent = get_asset( path );
		
		if ( assetCurrent instanceof KaiopuaAsset !== true || ( parameters && typeof parameters.data !== 'undefined' && parameters.data !== assetCurrent.data ) ) {
			
			// initialize new asset
			
			assetNew = new KaiopuaAsset( path, parameters );
			
			dataNew = assetNew.data;
			
		}
		else {
			
			dataNew = assetCurrent.data;
			
		}
		
		// asset is usually only useful internally, return data instead
		
		return dataNew;
		
	}
	
	function asset_ready ( path, asset ) {
		
		var i, l;
		
		asset = asset || get_asset( path );
		
		if ( asset instanceof KaiopuaAsset ) {
			
			// ready and not waiting
			
			asset.ready = true;
			
			asset.wait = false;
			
			// event
			
			dojo.publish( 'Asset.ready', [ path ] );
			
		}
		
	}
	
	function asset_require( requirements, callbackList, waitForAssetsReady, loaderUIContainer, assetSource ) {
		
		var callback_outer,
			on_asset_ready,
			on_all_assets_ready,
			assetsRequired = [],
			assetsWaitingFor = [],
			assetsReady = [],
			assetReadyHandle,
			listeningForReady = false;
		
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
				
				// check if no more to wait for
				
				if ( assetsWaitingFor.length === 0 && assetsReady.length === requirements.length ) {
					
					// no longer listening
					
					if ( listeningForReady === true ) {
						
						dojo.unsubscribe( assetReadyHandle );
						
						listeningForReady = false;
						
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
				
				loader.progressBar.hide( { remove: true } );
				
			}
			
			// find all assets
			
			for ( i = 0, l = requirements.length; i < l; i++ ) {
				
				location = requirements[ i ];
				
				path = get_asset_path( location );
				
				// get asset
				
				asset = get_asset( location );
				
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
					// asset not ready, listen for ready
					else if ( listeningForReady === false ) {
						
						listeningForReady = true;
						
						assetReadyHandle = dojo.subscribe( 'Asset.ready', on_asset_ready );
						
					}
					
				}
				
			}
			
			// if not waiting for assets to be ready
			
			if ( waitForAssetsReady !== true || requirements.length === 0 ) {
				
				on_all_assets_ready();
				
			}
			
		};
		
		// show loader ui
		
		if ( typeof loaderUIContainer !== 'undefined' ) {
			
			loader.progressBar.show( { parent: loaderUIContainer } );
			
		}
		
		// pass all requirements to loader
		
		load( requirements, callback_outer );
		
	}
	
	/*===================================================
    
    asset instance
    
    =====================================================*/
	
	function KaiopuaAsset ( path, parameters ) {
		
		var assetNew = this;
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.path = path;
		
		// properties
		
		assetNew.id = assetCount++;
		assetNew.merge_asset_self( parameters, true );
		
		// if asset has path
		
		if ( typeof assetNew.path !== 'undefined' ) {
			
			// store this new asset
			// returned asset from store is new asset merged into current asset if exists
			// or this new asset if no assets at path yet
			
			assetNew = set_asset( assetNew.path, assetNew );
			
			// regardless of storage results
			// handle this new asset's readiness and requirements
			
			if ( assetNew === this && this.readyAutoUpdate === true && ( this.requirements.length === 0 || this.wait !== true ) ) {
				
				this.on_ready();
				
			}
			
			if ( this.requirements.length > 0 ) {
				
				asset_require( this.requirements, this.callbacksOnReqs, this.wait, this.loaderUIContainer, this );
			
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
			
			this.requirements = ensure_array( this.requirements );
			
			this.callbacksOnReqs = ensure_array( this.callbacksOnReqs );
			
			// if should also copy requirements
			
			if ( includeRequirements === true ) {
			
				this.requirements = this.requirements.concat( ensure_array( asset.requirements ) );
				
				this.callbacksOnReqs = this.callbacksOnReqs.concat( ensure_array( asset.callbacksOnReqs ) );
				
				this.loaderUIContainer = this.loaderUIContainer || asset.loaderUIContainer;
				
			}
			
		}
		
	}
	
	KaiopuaAsset.prototype.merge_asset_data_self = function ( source ) {
		
		var dataSrc = source.data;
		
		// if source data exists
		
		if ( typeof dataSrc !== 'undefined' ) {
			
			// if this data does not exist or source data is image, set as data instead of merging, as merging causes issues
			
			if ( typeof this.data === 'undefined' || is_image( dataSrc ) ) {
				
				this.data = dataSrc;
				
			}
			else {
				
				// copy properties of source asset data into this data
				// order is important to ensure this data remains an instance of whatever it is
				
				extend( dataSrc, this.data );
				
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
		
		asset_ready( this.path, this );
		
	}
    
    return main; 
    
} ( KAIOPUA || {} ) );