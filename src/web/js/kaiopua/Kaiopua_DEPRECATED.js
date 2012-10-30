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
		loader = {},
		worker = {},
        lastGamma, lastBeta,
        libsPrimaryList = [
            "js/lib/RequestAnimationFrame.js",
            "js/lib/RequestInterval.js",
            "js/lib/RequestTimeout.js",
            "js/lib/signals.min.js",
			"js/lib/sylvester.js",
			"js/lib/jquery-1.8.2.min.js"
        ],
		libsSecondaryList = [
			"js/lib/hammer.custom.js",
			"js/lib/bootstrap.min.js",
			"js/lib/jquery.easing-1.3.min.js",
			"js/lib/jquery.imagesloaded.min.js",
			"js/lib/jquery.throttle-debounce.custom.min.js",
			"js/lib/jquery.scrollbarwidth.min.js",
			"js/lib/jquery.placeholdme.js"
		],
		libsTertiaryList = [
			"js/lib/jquery.scrollTo-1.4.2.custom.js",
			"js/lib/jquery.multi-sticky.js"
		],
        setupList = [
			"js/kaiopua/core/Game.js"
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
    $LAB.script( libsPrimaryList ).wait().script( libsSecondaryList ).wait().script( libsTertiaryList ).wait( init_basics );
    
    function init_basics () {
		
        // shared
        shared.pointers = [];
        shared.originLink = window.location.pathname.toString();
		shared.pathToAsset = 'asset/';
		shared.pathToModules = shared.pathToAsset + 'modules/';
		shared.pathToModels = shared.pathToAsset + 'model/';
		shared.pathToIcons = shared.pathToAsset + 'icons/';
		shared.pathToAsset = shared.pathToAsset + 'texture/';
        
        shared.frameRateMax = 60;
        shared.frameRateMin = 20;
        shared.time = new Date().getTime();
        shared.timeLast = shared.time;
        shared.timeDeltaExpected = 1000 / 60;
		shared.timeDeltaModDec = Math.pow( 10, 2 );
		shared.pointerWheelSpeed = 120;
		shared.pointerHoldPositionShift = 10;
        shared.pointerTimeDeltaThreshold = shared.timeDeltaExpected * 0.5;
		shared.throttleTimeShort = shared.timeDeltaExpected * 3;
		shared.throttleTimeMedium = 100;
		shared.throttleTimeLong = 250;
		shared.throttleTimeLong = 250;
		shared.focused = true;
        shared.galleryMode = false;
		shared.timeSinceInteraction = 0;
		shared.timeSinceInteractionMax = 300000;
		
		shared.domFadeTime = 500;
		shared.domCollapseTime = 500;
		shared.domScrollTime = 500;
		shared.domFadeEasing = 'easeInOutCubic';
		shared.domCollapseEasing = 'easeInOutCubic';
		shared.domScrollEasing = 'easeInOutCubic';
		
        shared.domElements = {};
		shared.domElements.$statusInactive = $( '#statusInactive' );
		shared.domElements.$statusActive = $( '#statusActive' );
		shared.domElements.$statusItems = $('.status-item');
		
		shared.supports = {};
		shared.supports.pointerEvents = css_property_supported( 'pointer-events' );
       
        shared.signals = {
			
			onFocusLost: new signals.Signal(),
			onFocusGained: new signals.Signal(),
			
			onScrolled: new signals.Signal(),
    
            onKeyPressed : new signals.Signal(),
            onKeyReleased : new signals.Signal(),
    
            onWindowResized : new signals.Signal(),
			
			onUpdated: new signals.Signal(),
            
            onLoadItemCompleted : new signals.Signal(),
            onLoadListCompleted : new signals.Signal(),
            onLoadAllCompleted : new signals.Signal(),
			
			onAssetReady : new signals.Signal(),
            
            onError : new signals.Signal()
            
        };
        
        // add listeners for global events
        // each listener dispatches shared signal
		
        $( document )
			.on( 'keydown', on_key_pressed )
			.on( 'keyup', on_key_released );
		
		$( window )
			.on( 'blur', on_focus_lost )
			.on( 'focus', on_focus_gained )
			.on( 'orientationchange', on_window_device_orientation )
			.on( 'MozOrientation', on_window_device_orientation )
			.on( 'resize', $.throttle( shared.throttleTimeLong, on_window_resized ) );
		
		window.onerror = on_error;
		
		// begin updating
		
		update();
	
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
		
		add_loaded_locations( libsPrimaryList );
		add_loaded_locations( libsSecondaryList );
		add_loaded_locations( libsTertiaryList );
		
		// init worker
		
		worker.$domElement =  $("#worker");
		worker.$progressStarted = worker.$domElement.find( "#workerProgressBarStarted" );
		worker.$progressCompleted = worker.$domElement.find( "#workerProgressBarCompleted" );
		worker.taskCount = 0;
		worker.tasksStartedIds = [];
		worker.tasksStarted = {};
		worker.tasksCompleted = {};
		worker.collapseDelay = 1000;
		
		worker_reset();
		worker.$domElement.on( 'hidden.reset', function () {
			
			worker_reset();
			
		} );
		
		// public functions
		
		main.type = type;
		main.is_number = is_number;
		main.is_array = is_array;
		main.is_image = is_image;
		main.is_image_ext = is_image_ext;
		main.is_event = is_event;
		
		main.extend = extend;
		main.time_test = time_test;
		
		main.to_array = to_array;
		main.ensure_not_array = ensure_not_array;
		main.array_cautious_add = array_cautious_add;
		main.array_cautious_remove = array_cautious_remove;
		main.index_of_value = index_of_value;
		main.last_index_of_value = last_index_of_value;
		main.indices_of_value = indices_of_value;
		main.index_of_values = index_of_values;
		main.index_of_property = index_of_property;
		main.indices_of_property = indices_of_property;
		main.index_of_properties = index_of_properties;
		
		main.css_property_supported = css_property_supported;
		main.str_to_camel = str_to_camel;
		main.str_to_title = str_to_title;
		main.dom_extract = dom_extract;
		main.dom_generate_image = dom_generate_image;
		main.dom_ignore_pointer = dom_ignore_pointer;
		main.dom_fade = dom_fade;
		main.dom_collapse = dom_collapse;
		
		main.get_pointer = get_pointer;
		main.reposition_pointer = reposition_pointer;
		
		main.worker_reset = worker_reset;
		main.worker_start_task = worker_start_task;
		main.worker_complete_task = worker_complete_task;
		
		main.load = load;
		main.get_is_loaded = get_is_loaded;
		main.get_is_loading = get_is_loading;
		main.get_is_loading_or_loaded = get_is_loading_or_loaded;
		
		main.get_asset_path = get_asset_path;
		main.get_ext = get_ext;
		main.add_default_ext = add_default_ext;
		main.remove_ext = remove_ext;
		main.get_alt_path = get_alt_path;
		
		main.asset_register = asset_register;
		main.asset_require = asset_require;
		main.asset_ready = asset_ready;
		main.set_asset = set_asset;
		main.get_asset = get_asset;
		main.get_asset_data = get_asset_data;
		
		// resize once
		
		on_window_resized();
		
		// setup
		
		shared.domElements.$statusItems.each( function () {
			
			var $item = $( this );
			
			if ( $item.parent().is( shared.domElements.$statusActive ) && $item.is( '.hidden, .collapsed' ) ) {
				
				shared.domElements.$statusInactive.append( $item );
				
			}
			
		} ).on('show.active', function () {
			
			shared.domElements.$statusActive.append( this );
			
		}).on('hidden.active', function () {
			
			shared.domElements.$statusInactive.append( this );
			
		});
		
		$("#preloader").one( 'hidden', function () {
			
			$( this ).remove();
			
			// start loading setup
			
			asset_require( setupList, init_setup, true );
			
		} );
		
		dom_collapse( {
			element: $("#preloader"),
		} );
		
    }
    
    function init_setup ( g ) {
		
        // assets
        
        _Game = g;
		
    }
	
	function update () {
		
		var timeDelta,
			timeDeltaMod;
        
        window.requestAnimationFrame( update );
		
		// handle time
		
		shared.timeLast = shared.time;
		
		shared.time = new Date().getTime();
		
		timeDelta = shared.time - shared.timeLast;
		
		// get time delta modifier from timeDelta vs expected refresh interval
		
		timeDeltaMod = Math.round( ( timeDelta / shared.timeDeltaExpected ) * shared.timeDeltaModDec ) / shared.timeDeltaModDec;
		
		if ( is_number( timeDeltaMod ) !== true ) {
			
			timeDeltaMod = 1;
			
		}
		
		// signal
		
		shared.signals.onUpdated.dispatch( timeDelta, timeDeltaMod );
		
		// handle gallery mode
		
		shared.timeSinceInteraction += timeDelta;
		
		if ( shared.galleryMode === true && shared.timeSinceInteraction >= shared.timeSinceInteractionMax ) {
			
			if ( typeof _Game !== 'undefined' && _Game.started === true ) {
				
				_Game.stop();
				
			}
			
		}
		
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
		return !isNaN( n ) && isFinite( n ) && typeof n !== 'boolean';
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
	
	function is_event ( obj ) {
		return obj && ( obj.type && ( obj.target || obj.srcElement ) );
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
			
			destination = main.type( destination ) === 'object' ? destination : {};
			
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
						
						recordSourceIndex = index_of_value( recordSources, value );
						
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
	
	/*===================================================
    
    array / object helpers
    
    =====================================================*/
	
	function to_array ( target ) {
		
		return target ? ( is_array ( target ) !== true ? [ target ] : target ) : [];
		
	}
	
	function ensure_not_array ( target, index ) {
		
		return is_array ( target ) === true ? target[ index || 0 ] : target;
		
	}
	
	function array_cautious_add ( target, elements ) {
		
		var i, l,
			element,
			index,
			added = false;
		
		target = to_array( target );
		elements = to_array( elements );
		
		// for each element
		
		for ( i = 0, l = elements.length; i < l; i++ ) {
			
			element = elements[ i ];
			
			index = index_of_value( target, element );
			
			if ( index === -1 ) {
				
				target.push( element );
				
				added = true;
				
			}
			
		}
		
		return added;
		
	}
	
	function array_cautious_remove ( target, elements ) {
		
		var i, l,
			element,
			index,
			removed = false;
		
		target = to_array( target );
		elements = to_array( elements );
		
		// for each element
		
		for ( i = 0, l = elements.length; i < l; i++ ) {
			
			element = elements[ i ];
			
			index = index_of_value( target, element );
			
			if ( index !== -1 ) {
				
				target.splice( index, 1 );
				
				removed = true;
				
			}
			
		}
		
		return removed;
		
	}
	
	function index_of_value( array, value ) {
		
		for ( var i = 0, l = array.length; i < l; i++ ) {
			
			if ( value === array[ i ] ) {
				
				return i;
				
			}
			
		}
		
		return -1;
		
	}
	
	function last_index_of_value( array, value ) {
		
		for ( var i = array.length - 1; i >= 0; i-- ) {
			
			if ( value === array[ i ] ) {
				
				return i;
				
			}
			
		}
		
		return -1;
		
	}
	
	function indices_of_value( array, value ) {
		
		var indices = [];
		
		for ( var i = 0, l = array.length; i < l; i++ ) {
			
			if ( value === array[ i ] ) {
				
				indices.push( i );
				
			}
			
		}
		
		return indices;
		
	}
	
	function index_of_values( array, values ) {
		
		for ( var i = 0, l = array.length; i < l; i++ ) {
			
			if ( index_of_value( values, array[ i ] ) !== -1 ) {
				
				return i;
				
			}
			
		}
		
		return -1;
		
	}
	
	function index_of_property( array, property, value ) {
		
		for ( var i = 0, l = array.length; i < l; i++ ) {
			
			if ( value === array[ i ][ property ] ) {
				
				return i;
				
			}
			
		}
		
		return -1;
		
	}
	
	function indices_of_property( array, property, value ) {
		
		var indices = [];
		
		for ( var i = 0, l = array.length; i < l; i++ ) {
			
			if ( value === array[ i ][ property ] ) {
				
				indices.push( i );
				
			}
			
		}
		
		return indices;
		
	}
	
	function index_of_properties( array, properties, values ) {
		
		for ( var i = 0, il = array.length; i < il; i++ ) {
			
			for ( var j = 0, jl = properties.length; j < jl; j++ ) {
				
				if ( values[ j ] === array[ i ][ properties[ j ] ] ) {
					
					return i;
					
				}
				
			}
			
		}
		
		return -1;
		
	}
	
	/*===================================================
    
    css
    
    =====================================================*/
	
	function css_property_supported ( property ) {
		
		var i, l,
			propertyCamel,
			propertySupported;
		
		// format property to camel case
		
		propertyCamel = str_to_camel( property );
		
		// use modernizr to check for correct css
		
		propertySupported = Modernizr.prefixed( propertyCamel );
		
		// cast to opposite boolean twice and return if supported
		
		return !!propertySupported;
		
	}
	
	function str_to_camel ( str ) {
		
		// code based on camelize from prototype library
		
		var parts = str.split('-'), 
			len = parts.length, 
			camelized;
		
		if (len == 1) {
			
			return parts[0];
			
		}

		camelized = str.charAt(0) == '-' ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1) : parts[0];
		
		for (var i = 1; i < len; i++) {
			
			camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
			
		}
		
		return camelized;
		
	}
	
	function str_to_title ( str ) {
		
		return str.toLowerCase().replace( /\b[a-z]/g, function( letter ) {
			return letter.toUpperCase();
		} );
		
	}
	
	/*===================================================
    
    dom
    
    =====================================================*/
	
	function dom_extract ( element ) {
		
		return element instanceof $ ? element.get( 0 ) : element;
		
	}
	
	function dom_ignore_pointer ( $element, state ) {
		
		// use native pointer-events when available
		
		if ( shared.supports.pointerEvents ) {
			
			if ( state === true ) {
				
				$element.addClass( 'ignore-pointer-temporary' );
				
			}
			else {
				
				$element.removeClass( 'ignore-pointer-temporary' );
			
			}
			
		}
		else {
			
			// fallback in-case browser does not support pointer-events property
			// this method is incredibly slow, as it has to hide element, retrigger event to find what is under, then show again
			
			if ( state === true ) {
				
				$element.on( 'tap.pointer doubletap.pointer hold.pointer dragstart.pointer drag.pointer, dragend.pointer', 
					function ( e ) { 
						
						e.preventDefault();
						e.stopPropagation();
						
						$element.stop( true ).addClass( 'invisible' );
						
						$( document.elementFromPoint( e.clientX, e.clientY ) ).trigger( e );
						
						$element.stop( true ).removeClass( 'invisible' );
						
						return false;
						
					}
				);
				
			}
			else {
				
				$element.off( '.pointer' );
				
			}
			
		}
		
	}
	
	function dom_generate_image ( path, callback, context, image ) {
		
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
	
	function dom_fade( parameters ) {
		
		var $element,
			actions,
			time,
			opacity,
			easing,
			callback,
			isHidden,
			isCollapsed,
			fadeComplete = function () {
				
				$element.removeClass( 'hiding' );
				
				// if faded out completely, hide
				
				if ( opacity === 0 ) {
					
					$element.addClass( 'hidden' ).css( 'opacity', '' ).trigger( 'hidden' );
					
					// reenable all buttons and links
					
					dom_ignore_pointer( actions, false );
					
				}
				else {
					
					$element.trigger( 'shown' );
					
					if ( opacity === 1 ) {
						
						$element.css( 'opacity', '' );
						
					}
					
				}
				
				// do callback
				
				if ( typeof callback === 'function' ) {
					
					callback();
					
				}
				
			};
		
		// handle parameters
		
		parameters = parameters || {};
		
		$element = $( parameters.element );
		
		if ( $element.length > 0 ) {
			
			time = is_number( parameters.time ) ? parameters.time : shared.domFadeTime;
			opacity = is_number( parameters.opacity ) ? parameters.opacity : 0;
			easing = typeof parameters.easing === 'string' ? parameters.easing : shared.domFadeEasing;
			callback = parameters.callback;
			
			isHidden = $element.is( '.hidden' );
			isCollapsed = $element.is( '.collapsed' );
			
			// stop animations
			
			$element.stop( true ).removeClass( 'hiding hidden collapsed' );
			
			actions = $element.find( 'a, button' );
			
			dom_ignore_pointer( actions, false );
			
			// if should start at 0 opacity
			
			if ( isHidden === true || isCollapsed === true || parameters.initHidden === true ) {
				
				$element.fadeTo( 0, 0 ).css( 'height', '' );
				
			}
			
			// handle opacity
			
			if ( opacity === 0 ) {
				
				$element.addClass( 'hiding' ).trigger( 'hide' );
				
				// temporarily disable all buttons and links
				
				dom_ignore_pointer( actions, true );
				
			}
			else {
				
				$element.trigger( 'show' );
				
			}
			
			$element.fadeTo( time, opacity, easing, fadeComplete );
			
		}
		
	}
	
	function dom_collapse( parameters ) {
		
		var $elements,
			time,
			show,
			easing,
			callback;
		
		// handle parameters
		
		parameters = parameters || {};
		
		$elements = $( parameters.element );
		show = typeof parameters.show === 'boolean' ? parameters.show : false;
		time = is_number( parameters.time ) ? parameters.time : shared.domCollapseTime;
		easing = typeof parameters.easing === 'string' ? parameters.easing : shared.domCollapseEasing;
		callback = parameters.callback;
		
		// for each element
		
		$elements.each( function () {
			
			var $element = $( this ),
				isCollapsed,
				isHidden,
				heightCurrent,
				heightTarget = 0,
				collapseComplete = function () {
					
					// if shown or hidden
					
					if ( show === true ) {
						
						$element.css( 'height', '' ).trigger( 'shown' );
						
					}
					else {
						
						$element.addClass( 'hidden' ).trigger( 'hidden' );
						
						// enable pointer
						
						dom_ignore_pointer( $element, false );
						
					}
					
					// do callback
					
					if ( typeof callback === 'function' ) {
						
						callback();
						
					}
					
				};
			
			// if should start from hidden
			
			isHidden = $element.is( '.hiding, .hidden' );
			isCollapsed = $element.is( '.collapsed' );
			
			if ( isCollapsed !== true && ( isHidden === true || parameters.initHidden === true ) ) {
				
				$element.css( 'height', 0 ).css( 'opacity', '' );
				isCollapsed = true;
				
			}
			
			// if valid element and not already collapsing / collapsed to same state
			
			if ( isCollapsed === show ) {
				
				// stop any previous animation
				
				$element.stop( true ).removeClass( 'hiding hidden collapsed' );
				
				if ( show === true ) {
					
					// find correct current height and target height
					
					$element.placeholdme().appendTo( 'body' );
					
					heightCurrent = $element.height();
					$element.css( 'height', '' );
					heightTarget = $element.height();
					$element.css( 'height', heightCurrent );
					
					$element.placeholdme( 'revert' );
					
					// enable pointer
					
					dom_ignore_pointer( $element, false );
					
					// show
					
					$element.trigger( 'show' );
					
				}
				else {
					
					// temporarily ignore pointer
					
					dom_ignore_pointer( $element, true );
					
					$element.addClass( 'collapsed' ).trigger( 'hide' );
					
				}
				
				// animate
				
				$element.animate( { height: heightTarget }, { duration: time, easing: easing, complete: collapseComplete } );
				
			}
			
		} );
		
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
    
    event functions
    
    =====================================================*/
	
	function get_pointer ( parameters ) {
		
		parameters = parameters || {};
		
		var id = parameters.identifier = ( parameters.identifier ? parameters.identifier : 0 ),
			pointer = shared.pointers[ id ];

		if ( typeof pointer === 'undefined' ) {
			
			pointer = shared.pointers[ id ] = {};
			pointer.id = id;
			pointer.x = pointer.lx = shared.screenWidth * 0.5;
			pointer.y = pointer.ly = shared.screenHeight * 0.5;
			pointer.deltaX = pointer.deltaY = pointer.angle = pointer.distance = pointer.distanceX = pointer.distanceY = 0;
			pointer.direction = 'none';
			pointer.timeStamp = Date.now();
		
		}
		
		return pointer;
		
	}
	
	function reposition_pointer ( e ) {
		
		shared.timeSinceInteraction = 0;
		
		var pointer = main.get_pointer( e ),
			position,
			d,
			b,
			timeChange;
		
		if ( e ) {
			
			e.timeStamp = e.timeStamp || Date.now();
			timeChange = e.timeStamp - pointer.timeStamp;
			
			if ( timeChange >= shared.pointerTimeDeltaThreshold ) {
				
				pointer.timeStamp = e.timeStamp;
				
				// handle postion
				
				position = e.position;
				
				if ( is_array( position ) && position[ pointer.id ] ) {
					
					position = position[ pointer.id ];
					
				}
				
				if ( typeof position === 'undefined' || is_number( position.x ) !== true || is_number( position.y ) !== true ) {
					
					d = document;
					b = d.body;
					
					position = {
						x: e.pageX || e.clientX + ( d && d.scrollLeft || b && b.scrollLeft || 0 ) - ( d && d.clientLeft || b && b.clientLeft || 0 ),
						y: e.pageY || e.clientY + ( d && d.scrollTop || b && b.scrollTop || 0 ) - ( d && d.clientTop || b && b.clientTop || 0 )
					 };
					
				}
				
				if ( pointer.x !== position.x || pointer.y !== position.y ) {
					
					pointer.lx = pointer.x;
					pointer.ly = pointer.y;
					
					pointer.x = position.x;
					pointer.y = position.y;
					
					pointer.deltaX = pointer.x - pointer.lx;
					pointer.deltaY = pointer.y - pointer.ly;
					
					pointer.angle = e.angle || 0;
					pointer.distance = e.distance || 0;
					pointer.distanceX = e.distanceX || 0;
					pointer.distanceY = e.distanceY || 0;
					pointer.direction = e.direction || 'none';
					
				}
				
			}
			
		}
		
		return pointer;
		
	}
    
    function on_window_device_orientation( e ) {
        var i, l, pointers, pointer, eCopy, overThreshold, gamma, beta, x, y;
		
		shared.timeSinceInteraction = 0;
        
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
			
			pointers = shared.pointers;
			
			for ( i = 0, l = pointers.length; i < l; i += 1 ) {
				
				pointer = pointers[ i ];
			
				x = Math.round( 1.5 * gamma ) + pointer.x;
				y = ( - Math.round( 1.5 * beta ) ) + pointer.y;
				
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
				
				pointer.x = x;
				pointer.y = y;
				
				eCopy = extend( e, {} );
				
				eCopy.identifier = i;
				
				shared.signals.pointerDragged.dispatch( eCopy );
			
			}
			
			lastGamma = gamma;
			lastBeta = beta;
			
        }
		
    }

    function on_key_pressed( e ) {
		
		shared.timeSinceInteraction = 0;
		
        shared.signals.onKeyPressed.dispatch( e );
		
    }

    function on_key_released( e ) {
		
		shared.timeSinceInteraction = 0;
		
        shared.signals.onKeyReleased.dispatch( e );
		
    }
	
	function on_focus_lost ( e ) {
		
		shared.focused = false;
		
		shared.signals.onFocusLost.dispatch( e );
		
	}
	
	function on_focus_gained ( e ) {
		
		shared.focused = true;
		
		shared.signals.onFocusGained.dispatch( e );
		
	}

    function on_window_resized( e ) {
        
        shared.screenWidth = $(window).width();
        shared.screenHeight = $(window).height();
		
        shared.signals.onWindowResized.dispatch(shared.screenWidth, shared.screenHeight);
        
    }
	
	function on_error ( error, url, lineNumber ) {
		
		shared.signals.onError.dispatch( error, url, lineNumber );
		
		return true;
		
	}
	
	/*===================================================
	
	worker
	
	=====================================================*/
	
	function worker_reset () {
		
		worker.tasksStartedIds = [];
		worker.tasksStarted = {};
		worker.tasksCompleted = {};
		$().add( worker.$progressStarted ).add( worker.$progressCompleted ).children( '.work-task' ).remove();
		
	}
	
	function worker_start_task ( id ) {
		
		var $task;
		
		// if does not have task yet
		
		if ( typeof id === 'string' && id.length > 0 && worker.tasksStarted.hasOwnProperty( id ) !== true ) {
			
			worker.taskCount++;
			
			// clear collapse delay
			
			if ( typeof worker.collapseTimeoutHandle !== 'undefined' ) {
				
				window.clearTimeout( worker.collapseTimeoutHandle );
				worker.collapseTimeoutHandle = undefined;
				
			}
			
			// block ui
            
			main.dom_fade( {
				element: shared.domElements.$uiBlocker,
				opacity: 0.75
			} );
			
			// show if hidden
			
			main.dom_collapse( {
				element: worker.$domElement,
				show: true
			} );
			
			// init task
			
			$task = $( '<img src="img/bar_vertical_color_64.png" id="' + id + '" class="iconk-tiny iconk-widthFollow iconk-tight work-task">' );
			
			// store
			
			worker.tasksStartedIds.push( id );
			worker.tasksStarted[ id ] = $task;
			
			// add into worker started progress bar
			
			worker.$progressStarted.append( $task );
			
		}
		
	}
	
	function worker_complete_task ( id ) {
		
		var $taskStarted,
			$task,
			index;
		
		// if has task
		
		if ( typeof id === 'string' && id.length > 0 && worker.tasksStarted.hasOwnProperty( id ) ) {
			
			// remove previous
			
			index = index_of_value( worker.tasksStartedIds, id );
			if ( index !== -1 ) {
				worker.tasksStartedIds.splice( index, 1 );
			}
			
			worker.tasksStarted[ id ].remove();
			delete worker.tasksStarted[ id ];
			
			// init task
			
			$task = $( '<img src="img/bar_vertical_64.png" id="' + id + '" class="iconk-tiny iconk-widthFollow iconk-tight work-task">' );
			
			// store
			
			worker.tasksCompleted[ id ] = $task;
			
			// add into worker completed progress bar
			
			worker.$progressCompleted.append( $task );
			
			// check length of tasks started
			
			if ( worker.tasksStartedIds.length === 0 ) {
				
				// clear collapse delay
				
				if ( typeof worker.collapseTimeoutHandle !== 'undefined' ) {
					
					window.clearTimeout( worker.collapseTimeoutHandle );
					worker.collapseTimeoutHandle = undefined;
					
				}
				
				// new collapse delay
				
				worker.collapseTimeoutHandle = window.setTimeout( function () {
					
					// hide blocker
					
					main.dom_fade( {
						element: shared.domElements.$uiBlocker
					} );
					
					// collapse
					
					main.dom_collapse( {
						element: worker.$domElement
					} );
					
				}, worker.collapseDelay );
				
			}
			
		}
		
	}
	
	/*===================================================
	
	loading
	
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
				
				indexLoading = index_of_value( loader.loading, path );
				indexLoaded = index_of_value( loader.loaded, path );
				
				// if not already loading or loaded item
				// load new location
				if ( indexLoading === -1 && indexLoaded == -1 ) {
					
					loader.loading.push( path );
					
					loader.loadingListIDs.push( listID );
					
					worker_start_task( path );
					
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
				
				if ( index_of_value( loader.loaded, path ) !== -1 ) {
					
					// make duplicate complete event
					
					load_single_completed( location );
					
				}
				// if not started loading yet
				else if ( index_of_value( loader.started, path ) === -1 ) {
					
					// load it
					
					loader.started.push( path );
					
					load_single( location );
					
				}
				
			}
			
		}
		else {
			
			// no longer loading
			
			loader.listCurrent = undefined;
			
			shared.signals.onLoadAllCompleted.dispatch();
			
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
				
				data = dom_generate_image( path, function ( image ) {
					
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
		
		// complete task
		
		worker_complete_task( path );
		
		// register asset
		
		asset_register( path, { data: data } );
		
		// add as loaded
		
		add_loaded_locations( path );
		
		// shared signal
		
		if (typeof shared !== 'undefined') {
			
			shared.signals.onLoadItemCompleted.dispatch( path );
			
		}
		
		// for each list loading
		
		for ( i = 0, l = loader.lists.length; i < l; i++ ) {
			
			listID = loader.lists[ i ];
			
			locationsList = loader.listLocations[ listID ];
			
			// get index in locations list
			
			index = index_of_value( locationsList,location);
			
			// if is in list
			
			if ( index !== -1 ) {
				
				loadedList = loader.listLoaded[ listID ];
				
				// remove location from locations list
				
				locationsList.splice(index, index !== -1 ? 1 : 0);
				
				// add location to loaded list
				
				loadedList.push( location );
				
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
		
		listIndex = index_of_value( loader.lists, listID );
		
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
		
		// shared signal
		
		if (typeof shared !== 'undefined') {
			
			shared.signals.onLoadListCompleted.dispatch( listID );
			
		}
		
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
		
		locationsList = to_array( locationsList );
		
		// for each location
		
		for ( i = 0, l = locationsList.length; i < l; i++ ) {
			
			location = locationsList[ i ];
			
			path = get_asset_path( location );
			
			// update all loading
			
			indexLoading = index_of_value( loader.loading, path );
			
			if ( indexLoading !== -1 ) {
				
				loader.loadingListIDs.splice( indexLoading, 1 );
				
				loader.loading.splice( indexLoading, 1 );
				
			}
			
			// update all loaded
			
			indexLoaded = index_of_value( loader.loaded, path );
			
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
		
		index = index_of_value( list, path );
		
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
			
			// dispatch signal
			
			if ( typeof shared.signals !== 'undefined' && typeof shared.signals.onAssetReady !== 'undefined' ) {
				
				shared.signals.onAssetReady.dispatch( path );
				
			}
			
		}
		
	}
	
	function asset_require( requirements, callbackList, waitForAssetsReady, assetSource ) {
		
		var callback_outer,
			on_asset_ready,
			on_all_assets_ready,
			assetsRequired = [],
			assetsWaitingFor = [],
			assetsReady = [],
			listeningForReadySignal = false;
		
		// get if arguments are not array
		
		requirements = to_array( requirements );
		
		callbackList = to_array( callbackList );
		
		// modify original callback to wrap in new function
		// that parses requirements and applies each asset as argument to callback
		// also handle if each asset required needs to be ready before triggering callback
		
		on_asset_ready = function ( path, secondAttempt ) {
			
			var indexWaiting;
			
			indexWaiting = index_of_value( assetsWaitingFor, path );
			
			// if waiting for asset to be ready
			
			if ( indexWaiting !== -1 ) {
				
				assetsWaitingFor.splice( indexWaiting, 1 );
				
				assetsReady.push( path );
				
				// check if no more to wait for
				
				if ( assetsWaitingFor.length === 0 && assetsReady.length === requirements.length ) {
					
					// remove signal
					
					if ( listeningForReadySignal === true ) {
						
						shared.signals.onAssetReady.remove( on_asset_ready );
						
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
					// asset not ready, listen for ready signal if not already
					else if ( listeningForReadySignal === false ) {
						
						listeningForReadySignal = true;
						
						shared.signals.onAssetReady.add( on_asset_ready );
						
					}
					
				}
				
			}
			
			// if not waiting for assets to be ready
			
			if ( waitForAssetsReady !== true || requirements.length === 0 ) {
				
				on_all_assets_ready();
				
			}
			
		};
		
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
				
				asset_require( this.requirements, this.callbacksOnReqs, this.wait, this );
			
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
			
			this.requirements = to_array( this.requirements );
			
			this.callbacksOnReqs = to_array( this.callbacksOnReqs );
			
			// if should also copy requirements
			
			if ( includeRequirements === true ) {
			
				this.requirements = this.requirements.concat( to_array( asset.requirements ) );
				
				this.callbacksOnReqs = this.callbacksOnReqs.concat( to_array( asset.callbacksOnReqs ) );
				
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