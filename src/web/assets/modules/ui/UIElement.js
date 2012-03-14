/*
 *
 * UIElement.js
 * Generic ui item.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/ui/UIElement.js",
		_UIElement = {},
		idBase = 'ui_element',
		uiElementCount = 0;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { data: _UIElement });
	
	/*===================================================
    
    internal init
    
    =====================================================*/
		
	// public
	
	_UIElement.generate_dom_element = generate_dom_element;
	_UIElement.supported_css_property = supported_css_property;
	_UIElement.supported_css_value = supported_css_value;
	_UIElement.str_to_camel = str_to_camel;
	_UIElement.str_from_camel = str_from_camel;
	
	// instance
	
	_UIElement.Instance = UIElement;
	
	_UIElement.Instance.prototype.add = add;
	_UIElement.Instance.prototype.remove = remove;
	
	_UIElement.Instance.prototype.append_to = append_to;
	_UIElement.Instance.prototype.add_do_remove = add_do_remove;
	
	_UIElement.Instance.prototype.enable = enable;
	_UIElement.Instance.prototype.disable = disable;
	
	_UIElement.Instance.prototype.enable_visual = enable_visual;
	_UIElement.Instance.prototype.disable_visual = disable_visual;
	
	_UIElement.Instance.prototype.set_position = set_position;
	_UIElement.Instance.prototype.alignOnce = alignOnce;
	_UIElement.Instance.prototype.align = align;
	
	_UIElement.Instance.prototype.show = show;
	_UIElement.Instance.prototype.hide = hide;
	
	_UIElement.Instance.prototype.pointer_events_ignore = pointer_events_ignore;
	
	_UIElement.Instance.prototype.make_fullwindow = make_fullwindow;
	
	_UIElement.Instance.prototype.generate_dom_element = generate_dom_element;
	_UIElement.Instance.prototype.apply_css = apply_css;
	
	_UIElement.Instance.prototype.generate_theme = generate_theme;
	
	_UIElement.Instance.prototype.themes = {};
	_UIElement.Instance.prototype.themes.core = theme_core;
	
	Object.defineProperty( _UIElement.Instance.prototype, 'parent', { 
		get : function () { return this._parent; },
		set : append_to
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'enabledSelf', { 
		get : function () { return this._enabled; }
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'enabled', { 
		get : function () { return ( this.parent instanceof _UIElement.Instance ? this.parent.enabled : this._enabled ); },
		set : function ( state ) {
			
			if ( state === true ) {
				
				this.enable();
				
			}
			else {
				
				this.disable();
				
			}
			
		}
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'width', { 
		get : function () { return this.domElement.width(); },
		set : function ( width ) {
			
			this.domElement.width( width );
			
		}
	} );

	Object.defineProperty( _UIElement.Instance.prototype, 'height', { 
		get : function () { return this.domElement.height(); },
		set : function ( height ) {
			
			this.domElement.height( height );
		
		}
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'widthHalf', { 
		get : function () { return this.width * 0.5; }
	} );

	Object.defineProperty( _UIElement.Instance.prototype, 'heightHalf', { 
		get : function () { return this.height * 0.5; }
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'outerWidth', { 
		get : function () { return this.domElement.outerWidth(); }
	} );

	Object.defineProperty( _UIElement.Instance.prototype, 'outerHeight', { 
		get : function () { return this.domElement.outerHeight(); }
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'outerWidthHalf', { 
		get : function () { return this.outerWidth * 0.5; }
	} );

	Object.defineProperty( _UIElement.Instance.prototype, 'outerHeightHalf', { 
		get : function () { return this.outerHeight * 0.5; }
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'x', { 
		get : function () { return this._x; },
		set : function ( x ) { 
			
			this.set_position( x, this._y );
		
		}
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'y', { 
		get : function () { return this._y; },
		set : function ( y ) { 
			
			this.set_position( this._x, y );
		
		}
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'alignment', { 
		get : function () { return this._alignment; },
		set : function ( location ) {
			
			if ( typeof location === 'string' ) {
				
				this._alignment = location.toLowerCase();
				
				shared.signals.windowresized.add( this.align, this );
				
				this.align();
				
			}
			else {
				
				this._alignment = false;
				
				shared.signals.windowresized.remove( this.align, this );
				
			}
			
		}
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'pointerEventsIgnore', { 
		get : function () { return this._pointerEventsIgnore; },
		set : pointer_events_ignore
	});
	
	/*===================================================
    
    ui
    
    =====================================================*/
	
	function UIElement ( parameters ) {
		
		var themeOverrides;
		
		// increase element count
		
		uiElementCount++;
        
        // handle parameters
        
        parameters = parameters || {};
		
		// id
		
		if ( typeof parameters.id !== 'string' ) {
			
			parameters.id = idBase + uiElementCount;
			
		}
		
		this.id = parameters.id;
        
        // init dom element
		
		if ( typeof parameters.domElement !== 'undefined' ) {
			
			this.domElement = $( parameters.domElement );
			
		}
		else {
			
			this.domElement = this.generate_dom_element( parameters );
			
		}
		
		// generate and apply theme
		
		if ( typeof parameters.themeOverrides !== 'undefined' ) {
			
			themeOverrides = parameters.themeOverrides;
			
		}
		else {
			
			themeOverrides = {
				cssmap: parameters.cssmap
			};
			
		}
		
		this.theme = this.generate_theme( parameters.theme, themeOverrides );
		
		// generate and apply css map
		
		//this.cssmap = this.generate_cssmap( parameters.cssmap);
		
		this.apply_css( this.theme.cssmap );
		
		// items
		
		this.childrenByID = {};
        this.children = [];
		
		// on display
		
		this.isVisible = Boolean( this.domElement.parents( "body" ).length );
		this.signalOnVisible = shared.signals[ "on_display_" + this.id ] = new signals.Signal();
		
		// timing
		
		this.timeShow = parameters.timeShow || 500;
        this.timeHide = parameters.timeHide || 250;
		
		// position
		
		this.set_position( 0, 0 );
		
		// enable / disable
		
		this.enabled = ( typeof parameters.enabled === 'boolean' ? parameters.enabled : true );
		
		// initialize pointer events property
		
		this.pointerEventsOnlyWithChildren = parameters.pointerEventsOnlyWithChildren;
		
		this.pointerEventsIgnore = ( this.pointerEventsOnlyWithChildren === true ) ? false : parameters.pointerEventsIgnore;
		
		// width / height
		
		if ( parameters.hasOwnProperty('width') ) {
			
			this.width = parameters.width;
			
		}
		
		if ( parameters.hasOwnProperty('height') ) {
			
			this.height = parameters.height;
			
		}
		
		// form
		
		if ( parameters.fullwindow === true ) {
			
			this.make_fullwindow();
		
		}
		
		// if dom element already has parent, set as parent
		
		if ( this.isVisible ) {
			
			this.parent = this.domElement.parent();
			
		}
		
	}
	
	/*===================================================
    
    children
    
    =====================================================*/
	
	function add ( children ) {
		
		var i, l,
			child;
		
		children = main.ensure_array( children );
		
		for ( i = 0, l = children.length; i < l; i++ ) {
			
			child = children[ i ];
			
			if ( this.children.indexOf( child ) === -1 ) {
				
				this.children.push( child );
				
				if ( child instanceof _UIElement.Instance ) {
					
					this.childrenByID[ child.id ] = child;
					
					if ( child.parent !== this ) {
						
						child.parent = this;
						
					}
					
				}
				
			}
			
		}
		
	}
	
	function remove ( children ) {
		
		var i, l,
			child,
			index;
		
		// default to removing all
		
		children = main.ensure_array( children || this.children );
		
		for ( i = 0, l = children.length; i < l; i ++) {
			
			child = children[ i ];
			
			index = this.children.indexOf( child );
			
			if ( index !== -1 ) {
				
				this.children.splice( index, 1 );
				
				if ( child instanceof _UIElement.Instance ) {
					
					delete this.childrenByID[ child.id ];
					
					if ( child.parent === this ) {
						
						child.parent = undefined;
						
					}
					
				}
				
			}
			
		}
		
	}
	
	/*===================================================
    
    append
    
    =====================================================*/
	
	function append_to ( parent, visible ) {
		
		var i, l,
			domElement,
			child;
		
		// if new parent
		
		if ( this.parent !== parent ) {
			
			// store last
			
			this.parentLast = this.parent;
			
			// store new
			
			this._parent = parent;
			
		}
		
		// if parent is ui element
		
		if ( this.parent instanceof _UIElement.Instance ) {
			
			// if not on parent child list
			
			if ( this.parent.children.indexOf( this ) === -1 ) {
				
				this.parent.add( this );
				
			}
			
			// get parent dom element
			
			domElement = this.parent.domElement;
			
		}
		else {
			
			domElement = $( this.parent );
			
		}
		
		// if valid dom element
		
		if ( typeof domElement !== 'undefined' && domElement.length ) {
			
			// append
			
			domElement.append( this.domElement );
			
			// set is visible
			
			this.isVisible = ( typeof visible === 'boolean' ? visible : Boolean( domElement.parents( "body" ).length ) );
			
			// set all children correct parent
			
			for ( i = 0, l = this.children.length; i < l; i++ ) {
				
				child = this.children[ i ];
				
				if ( child instanceof _UIElement.Instance ) {
					
					child.append_to( this, this.isVisible );
					
				}
				
			}
			
			// dispatch on display signal
			
			if ( this.domElement.parents( "body" ).length !== 0 ) {
				
				this.signalOnVisible.dispatch();
				
			}
			
		}
		else {
			
			// if last parent was ui element
		
			if ( this.parentLast instanceof _UIElement.Instance ) {
				
				// if was on parent child list
				
				if ( this.parentLast.children.indexOf( this ) === -1 ) {
					
					this.parentLast.remove( this );
					
				}
				
			}
			
			// set is visible
			
			this.isVisible = false;
			
			// detach
			
			this.domElement.detach();
			
		}
		
	}
	
	function add_do_remove ( callback, context, data ) {
		
		var tempadded,
			callbackResult;
		
		// if not on display, add temporarily
		
		if ( this.isVisible !== true ) {
			
			tempadded = true;
			
			$( document.body ).append( this.domElement );
			
		}
		
		// do callback
		
		callbackResult = callback.apply( context, data );
		
		// if added temporarily
		
		if ( tempadded === true ) {
			
			// if had parent, append to
			
			if ( this.parent instanceof _UIElement.Instance ) {
				
				this.parent.domElement.append( this.domElement );
				
			}
			else if ( typeof this.parent !== 'undefined' ) {
				
				$( this.parent ).append( this.domElement );
				
			}
			
		}
		
		return callbackResult;
		
	}
	
	/*===================================================
    
    enable / disable
    
    =====================================================*/
	
	function enable () {
		
		this._enabled = true;
		
		this.enable_visual();
		
	}
	
	function disable () {
		
		this._enabled = false;
		
		this.disable_visual();
		
	}
	
	/*===================================================
    
    visual state
    
    =====================================================*/
	
	function enable_visual () {
		
		this.apply_css( this.theme.enabled );
		
	}
	
	function disable_visual () {
		
		this.apply_css( this.theme.disabled );
		
	}
	
	/*===================================================
    
    position
    
    =====================================================*/
	
	function set_position ( x, y ) {
		
		// internal trackers for x and y
		// non-integer values of x/y cause terrible text rendering
		// around 250x faster than calling jQuery position().top/left
		
		this._x = Math.round( x );
		this._y = Math.round( y );
		
		// transform
		// use direct manipulation of dom element css due to repeated application
		// apply_css ensures correct css property/value for user's browser, but is 3x slower
		
		this.domElement.css( 'transform', 'translate(' + this._x + 'px, ' + this._y + 'px )' );
		//this.apply_css( 'transform', 'translate(' + x + 'px, ' + y + 'px )' );
		
	}
	
	function alignOnce ( alignment ) {
		
		if ( this.isVisible ) {
			
			this.alignment = alignment;
			
			this.alignment = false;
			
		}
		else {
			
			this.signalOnVisible.addOnce( function () {
				
				this.alignment = alignment;
				
				this.alignment = false;
				
			}, this );
			
		}
		
	}
	
	function align () {
		
		var parent,
			w, h;
		
		// if on display
		
		if ( this.isVisible ) {
			
			// get basic width and height of parent
			
			parent = this.domElement.parent();
			
			if ( parent.length ) {
				
				w = parent.width();
				h = parent.height();
				
			}
			else {
				
				w = shared.screenWidth;
				h = shared.screenHeight;
				
			}
			
			// align by type
			
			if ( this.alignment === 'center' ) {
				
				this.set_position( w * 0.5 - this.widthHalf, h * 0.5 - this.heightHalf );
				
			}
			else if ( this.alignment === 'bottomcenter' ) {
				
				this.set_position( w * 0.5 - this.widthHalf, h - this.height );
				
			}
			else if ( this.alignment === 'topcenter' ) {
				
				this.set_position( w * 0.5 - this.widthHalf, 0 );
				
			}
			else if ( this.alignment === 'leftcenter' ) {
				
				this.set_position( 0, h * 0.5 - this.heightHalf );
				
			}
			else if ( this.alignment === 'rightcenter' ) {
				
				this.set_position( w - this.width, h * 0.5 - this.heightHalf );
				
			}
			else if ( this.alignment === 'bottomright' ) {
				
				this.set_position( w - this.width, h - this.height );
				
			}
			else if ( this.alignment === 'bottomleft' ) {
				
				this.set_position( 0, h - this.height );
				
			}
			else if ( this.alignment === 'topright' ) {
				
				this.set_position( w - this.width, 0 );
				
			}
			else if ( this.alignment === 'topleft' ) {
				
				this.set_position( 0, 0 );
				
			}
			// invalid type
			else {
				
				this.alignment = false;
				
			}
			
		}
		else {
			
			this.signalOnVisible.addOnce( this.align, this );
			
		}
		
	}
	
	/*===================================================
    
    show / hide
    
    =====================================================*/
	
	function show ( parent, time, opacity, callback, callbackContext ) {
		
		var me = this;
		
		// show self
		
		if ( time === 0 ) {
			
			this.domElement.stop( true ).show();
			
			on_show();
			
		} 
		else {
			
			// animate opacity
			
			if ( typeof opacity === 'undefined' ) {
				
				opacity = 1;
				
			}
			
			this.domElement.stop( true ).fadeTo( time || this.timeShow, opacity, function () { on_show( me, callback, callbackContext ); } );
			
		}
		
		// try appending
		
		this.parent = parent || this.parent || this.parentLast;
		
	}
	
	function on_show ( uiElement, callback, callbackContext ) {
		
		if ( typeof callback !== 'undefined' ) {
			
			callback.call( callbackContext );
			
		}
		
	}
	
	function hide ( remove, time, opacity, callback, callbackContext ) {
		
		var me = this;
		
		if ( time === 0 ) {
			
			this.domElement.stop( true ).hide();
			
			on_hide();
			
		} 
		else {
			
			if ( typeof opacity === 'undefined' ) {
				
				opacity = 0;
				
			}
			
			this.domElement.stop( true ).fadeTo( time || this.timeHide, opacity, function () { on_hide( me, remove, callback, callbackContext ); } );
			
		}
		
	}
	
	function on_hide ( uiElement, remove, callback, callbackContext ) {
		
		if ( typeof callback !== 'undefined' ) {
			
			callback.call( callbackContext );
			
		}
		
		if ( remove === true ) {
			
			uiElement.parent = undefined;
			
		}
		
	}
	
	/*===================================================
    
    pointer events
    
    =====================================================*/
	
	function pointer_events_ignore ( state ) {
		
		var me = this;
		
		if ( state === false ) {
			
			this._pointerEventsIgnore = false;
			
			// use pointer-events when available, easier and works better
			
			this.apply_css( 'pointer-events', 'none' );
			
			// fallback in-case browser does not support pointer-events property
			// TODO: add actual support for mouse enter and leave, currently won't work
			
			this.domElement.on( 
				'mousedown.pei touchstart.pei mouseup.pei touchend.pei mousemove.pei touchmove.pei mouseenter.pei touchenter.pei mouseleave.pei touchleave.pei mousewheel.pei click.pei', 
				function ( e ) { on_pointer_event( me, e ); }
			);
			
		}
		else {
			
			this._pointerEventsIgnore = true;
			
			this.domElement.off( '.pei' );
			
			this.apply_css( 'pointer-events', 'auto' );
			
		}
		
	}
	
	function on_pointer_event ( uiElement, e ) {
		
		if ( typeof e !== 'undefined' && uiElement.pointerEventsOnlyWithChildren !== true || uiElement.domElement.children().length === 0 ) {
			
			uiElement.domElement.hide();
			
			$( document.elementFromPoint( e.clientX, e.clientY ) ).trigger( e );
			
			uiElement.domElement.show();
			
		}
		
	}
	
	/*===================================================
    
    form
    
    =====================================================*/
	
	function make_fullwindow () {
		
		this.apply_css( {
			"min-height": "100%",
			"width": "100%",
			"height": "100%",
			"position": "fixed",
			"top": "0px",
			"left": "0px",
			"overflow": "hidden"
		} );
		
	}
	
	/*===================================================
    
    dom element
    
    =====================================================*/
	
	function generate_dom_element ( parameters ) {
		
		var domElement;
		
		// handle parameters
        
        parameters = parameters || {};
		
		// basic
		
		domElement = $( document.createElement( parameters.elementType || 'div' ) );
		
		// id
		
		domElement.attr( 'id', parameters.id );
		
		// text
		
		if ( typeof parameters.text === 'string' ) {
			
			domElement.html( parameters.text );
			
		}
		
		// classes
		
		if ( parameters.hasOwnProperty('classes') ) {
			
			domElement.addClass( parameters.classes );
			
		}
		
		return domElement;
		
	}
	
	/*===================================================
    
    css
    
    =====================================================*/
	
	Modernizr.addTest('lineargradient', function () {
		
		// get correct linear gradient property name
		
		var test = document.createElement('div'),
			prefixes = ' -webkit- -moz- -o- -ms- -khtml- '.split(' '),
			strBGImg = 'background-image:',
			strLinGrad = 'linear-gradient',
			strGradVal = '(left top,#9f9, white);',
			strStyle,
			index,
			strPropertyName = strLinGrad;

		test.style.cssText = (strBGImg + prefixes.join( ( strLinGrad + strGradVal ) + strBGImg ) ).slice( 0, -strBGImg.length );
		
		strStyle = test.style.backgroundImage.toString();
		
		index = strStyle.indexOf( strLinGrad );
		
		if ( index !== -1 ) {
			
			strPropertyName = strStyle.substr( 0, index + strLinGrad.length );
			
		}
		
		return strPropertyName;
		
	} );
	
	function apply_css( property, value ) {
		
		var map;
		
		if ( typeof property === 'string' ) {
			
			this.domElement.css( _UIElement.supported_css_property( property ), _UIElement.supported_css_value( value ) );
			
		}
		else if ( property !== null && typeof property === 'object' ) {
			
			map = property;
			
			for ( property in map ) {
				
				if ( map.hasOwnProperty( property ) ) {
					
					this.apply_css( property, map[ property ] );
					
				}
				
			}
			
		}
		
	}
	
	function supported_css_property ( property ) {
		
		var i, l,
			propertyCamel,
			propertyPrefixed,
			propertySupported;
		
		// format property to camel case
		
		propertyCamel = _UIElement.str_to_camel( property );
		
		// use modernizr to check for correct css
		
		propertyPrefixed = Modernizr.prefixed( propertyCamel );
		
		// convert back to original hyphenated
		
		propertySupported = _UIElement.str_from_camel( propertyPrefixed );
		
		return propertySupported;
		
	}
	
	function supported_css_value ( value ) {
		
		var index;
		
		if ( typeof value === 'string' ) {
			
			// linear gradient
			
			index = value.indexOf( 'linear-gradient' );
			
			if ( index !== -1 ) {
				
				return Modernizr.lineargradient + value.substr( index + 'linear-gradient'.length, value.length );
				
			}
			
		}
		
		return value;
		
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
	
	function str_from_camel ( str ) {
		
		return str.replace( /([A-Z])/g, function( match, m1 ) { return '-' + m1.toLowerCase(); } ).replace( /^ms-/,'-ms-' );
		
	}
	
	/*===================================================
    
    themes
    
    =====================================================*/
	
	function generate_theme ( theme, overrides ) {
		
		return ( this.themes[ theme ] || this.themes.core ).call( this, overrides );
		
	}
	
	function theme_core ( theme ) {
		
		var cssmap;
		
		theme = theme || {};
		
		// cssmap
		
		cssmap = theme.cssmap = theme.cssmap || {};
		
		cssmap[ "overflow" ] = cssmap[ "overflow" ] || "hidden";
		cssmap[ "position" ] = cssmap[ "position" ] || "absolute";
		cssmap[ "display" ] = cssmap[ "display" ] || "block";
		cssmap[ "transform-origin" ] = cssmap[ "transform-origin" ] || "50% 50%";
		
		return theme;
		
	}
	
} (KAIOPUA) );