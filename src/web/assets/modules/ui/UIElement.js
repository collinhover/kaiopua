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
	
	main.asset_register( assetPath, { 
		data: _UIElement
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	_UIElement.Instance = UIElement;
	
	_UIElement.Instance.prototype.add = add;
	_UIElement.Instance.prototype.remove = remove;
	
	_UIElement.Instance.prototype.append_to = append_to;
	
	_UIElement.Instance.prototype.add_do_remove = add_do_remove;
	
	_UIElement.Instance.prototype.set_position = set_position;
	_UIElement.Instance.prototype.align = align;
	
	_UIElement.Instance.prototype.show = show;
	_UIElement.Instance.prototype.hide = hide;
	
	_UIElement.Instance.prototype.pointer_events_ignore = pointer_events_ignore;
	
	_UIElement.Instance.prototype.make_fullwindow = make_fullwindow;
	
	_UIElement.Instance.prototype.generate_dom_element = generate_dom_element;
	_UIElement.Instance.prototype.generate_css_map = generate_css_map;
	
	Object.defineProperty( _UIElement.Instance.prototype, 'parent', { 
		get : function () { return this._parent; },
		set : append_to
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
		get : function () { return this.domElement.position().left; },
		set : function ( x ) { 
			
			this.set_position( x, this.y );
		
		}
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'y', { 
		get : function () { return this.domElement.position().top; },
		set : function ( y ) { 
			
			this.set_position( this.x, y );
		
		}
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'onDisplay', { 
		get : function () { return Boolean( this.domElement.parents( "body" ).length ); }
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
		
		// generate and apply css map
		
		this.cssmap = this.generate_css_map( parameters.cssmap);
		
		this.domElement.css( this.cssmap );
		
		// items
		
		this.childrenByID = {};
        this.children = [];
		
		// signal on display
		
		this.signalOnDisplay = shared.signals[ "on_display_" + this.id ] = new signals.Signal();
		
		// timing
		
		this.timeShow = parameters.timeShow || 500;
        this.timeHide = parameters.timeHide || 250;
		
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
		
		if ( this.onDisplay ) {
			
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
	
	function append_to ( parent ) {
		
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
			
			// set all children correct parent
			
			for ( i = 0, l = this.children.length; i < l; i++ ) {
				
				child = this.children[ i ];
				
				if ( child instanceof _UIElement.Instance ) {
					
					child.parent = this;
					
				}
				
			}
			
			// dispatch on display signal
			
			if ( this.domElement.parents( "body" ).length !== 0 ) {
				
				this.signalOnDisplay.dispatch();
				
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
			
			// detach
			
			this.domElement.detach();
			
		}
		
	}
	
	function add_do_remove ( callback, context, data ) {
		
		var tempadded,
			callbackResult;
		
		// if not on display, add temporarily
		
		if ( this.onDisplay !== true ) {
			
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
    
    position
    
    =====================================================*/
	
	function set_position ( x, y ) {
		
		// transform
		//, ' w/2 ', this.widthHalf, ' h/2 ', this.heightHalf );
		this.domElement.css( 'transform', 'translate(' + x + 'px, ' + y + 'px )' );
		console.log('reposition', this.id, ' x ', x, ' y ', y, ' actual x', this.x, ' actual y', this.y );
	}
	
	function align () {
		
		var parent,
			w, h;
		
		// if on display
		
		if ( this.onDisplay ) {
			
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
			
			this.signalOnDisplay.addOnce( this.align, this );
			
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
			
			this.domElement.css( 'pointer-events', 'none' );
			
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
			
			this.domElement.css( 'pointer-events', 'auto' );
			
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
		
		this.domElement.css( {
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
		
		if ( parameters.hasOwnProperty('text') ) {
			
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
	
	function generate_css_map ( cssmap ) {
		
		cssmap = cssmap || {};
		
		cssmap[ "position" ] = cssmap[ "position" ] || "absolute";
		cssmap[ "display" ] = cssmap[ "display" ] || "block"
		cssmap[ "transform-origin" ] = cssmap[ "transform-origin" ] || "50% 50%"
		
		return cssmap;
		
	}
	
	function supported_css () {
		
		/*
	var prop = "transform",
      vendorProp, supportedProp, supports3d, supports2d, supportsFilter,
      
      // capitalize first character of the prop to test vendor prefix
      capProp = prop.charAt(0).toUpperCase() + prop.slice(1),
      prefixes = [ "Moz", "Webkit", "O", "MS" ],
      div = document.createElement( "div" );

  if ( prop in div.style ) {

    // browser supports standard CSS property name
    supportedProp = prop;
    supports3d = div.style.perspective !== undefined;
  } 
  else {

    // otherwise test support for vendor-prefixed property names
    for ( var i = 0; i < prefixes.length; i++ ) {
      vendorProp = prefixes[i] + capProp;

      if ( vendorProp in div.style ) {
        supportedProp = vendorProp;    
        if((prefixes[i] + 'Perspective') in div.style) {
          supports3d = true;
        }
        else {
          supports2d = true;
        }
        break;
      }
    }
  }
  
  if (!supportedProp) {
    supportsFilter = ('filter' in div.style);
    supportedProp = 'filter';
  }

  // console.log('supportedProp: '+supportedProp+', 2d: '+supports2d+', 3d: '+supports3d+', filter: '+supportsFilter);

  // avoid memory leak in IE
  div = null;
  
  // add property to $.support so it can be accessed elsewhere
  $.support[ prop ] = supportedProp;
  
  var transformProperty = supportedProp;
  
  */
		
	}
	
} (KAIOPUA) );