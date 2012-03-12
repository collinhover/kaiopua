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
		idBase = 'ui_element';
	
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
	
	_UIElement.Instance.prototype.add_items = add_items;
	_UIElement.Instance.prototype.add_item = add_item;
	_UIElement.Instance.prototype.remove_items = remove_items;
	_UIElement.Instance.prototype.remove_item = remove_item;
	
	_UIElement.Instance.prototype.append_to = append_to;
	
	_UIElement.Instance.prototype.add_do_remove = add_do_remove;
	
	_UIElement.Instance.prototype.set_position = set_position;
	_UIElement.Instance.prototype.center = center;
	
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
			
			//width = width - ( this.domElement.outerWidth() - this.domElement.width() );
			
			this.domElement.width( width );
			
		}
	} );

	Object.defineProperty( _UIElement.Instance.prototype, 'height', { 
		get : function () { return this.domElement.height(); },
		set : function ( height ) {
			
			//height = height - ( this.domElement.outerHeight() - this.domElement.height() );
			
			this.domElement.height( height );
		
		}
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'widthHalf', { 
		get : function () { return this.domElement.width() * 0.5; }
	} );

	Object.defineProperty( _UIElement.Instance.prototype, 'heightHalf', { 
		get : function () { return this.domElement.height() * 0.5; }
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'x', { 
		get : function () { return this.domElement.position().left + (this.domElement.outerWidth() * 0.5); },
		set : function ( x ) { 
			
			this.set_position( x, this.y );
		
		}
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'y', { 
		get : function () { return this.domElement.position().top + ( this.domElement.outerHeight() * 0.5 ); },
		set : function ( y ) { 
			
			this.set_position( this.x, y );
		
		}
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'centerAutoUpdate', { 
		get : function () { return this._centerAutoUpdate; },
		set : function ( state ) {
			
			if ( state === false ) {
				
				this._centerAutoUpdate = false;
			
				shared.signals.windowresized.remove( this.center, this );
				
			}
			else {
				
				this._centerAutoUpdate = true;
				
				shared.signals.windowresized.add( this.center, this );
				
				this.add_do_remove( function () {
					
					this.center( shared.screenWidth, shared.screenHeight );
				
				}, this );
				
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
        
        // handle parameters
        
        parameters = parameters || {};
		
		// generate css base
		
		parameters.cssmap = this.cssmap = this.generate_css_map( parameters );
        
        // init dom element
		
		if ( typeof parameters.domElement !== 'undefined' ) {
			
			this.domElement = $( parameters.domElement );
			
		}
		else {
			
			this.domElement = this.generate_dom_element( parameters );
			
		}
		
		// id
		
		this.id = this.domElement.attr( 'id' );
		
		// items
		
		this.items = {};
        this.itemsList = [];
		
		// timing
		
		this.timeShow = parameters.timeShow || 500;
        this.timeHide = parameters.timeHide || 250;
		
		// initialize pointer events property
		
		this.pointerEventsOnlyWithChildren = parameters.pointerEventsOnlyWithChildren;
		
		this.pointerEventsIgnore = ( this.pointerEventsOnlyWithChildren === true ) ? false : parameters.pointerEventsIgnore;
		
		// init by not keeping centered
		
		this.centerAutoUpdate = false;
		
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
		
	}
	
	/*===================================================
    
    items
    
    =====================================================*/
	
	function add_items ( itemsList ) {
		
		var i, l;
		
		itemsList = main.ensure_array( itemsList );
		
		for ( i = 0, l = itemsList.length; i < l; i++ ) {
			
			this.addItem( itemsList[i] );
			
		}
		
	}
	
	function add_item ( item ) {
		
		if ( this.itemsList.indexOf( item ) === -1 ) {
			
			this.itemsList.push( item );
			
			if ( item instanceof _UIElement.Instance ) {
				
				this.items[ item.id ] = item;
				
				item.parent = this;
				
			}
			
		}
		
	}
	
	function remove_items ( itemsList ) {
		
		var i, l,
			removed = [];
		
		// default to removing all
		
		itemsList = itemsList || this.itemsList;
		
		for ( i = 0, l = itemsList.length; i < l; i ++) {
			
			removed.push( this.removeItem( itemsList[ i ] ) );
			
		}
		
		return removed;
		
	}
	
	function remove_item( item ) {
		
		var index = this.itemsList.indexOf( item );
		
		if ( index !== -1 ) {
			
			this.itemsList.splice( index, 1 );
			
			if ( item instanceof _UIElement.Instance ) {
				
				delete this.items[ item.id ];
				
				item.parent = undefined;
				
			}
			
		}
		
		return item;
		
	}
	
	/*===================================================
    
    append
    
    =====================================================*/
	
	function append_to ( parent ) {
		
		var i, l,
			domElement,
			item;
		
		// if new parent
		
		if ( this.parent !== parent ) {
			
			// store last
			
			this.parentLast = this.parent;
			
			// store new
			
			this._parent = parent;
			
		}
		
		// get parent dom element
		
		if ( this.parent instanceof _UIElement.Instance ) {
			
			domElement = this.parent.domElement;
			
		}
		else {
			
			domElement = $( this.parent );
			
		}
		
		// if valid dom element
		
		if ( typeof domElement !== 'undefined' && domElement.length ) {
			
			// append
			
			domElement.append( this.domElement );
			
			// set all items correct parent
			
			for ( i = 0, l = this.itemsList.length; i < l; i++ ) {
				
				item = this.itemsList[ i ];
				
				if ( item instanceof _UIElement.Instance ) {
					
					item.parent = this;
					
				}
				
			}
			
			// update center
			
			if ( this.centerAutoUpdate === true ) {
				
				this.center();
				
			}
			
		}
		else {
			
			this.domElement.detach();
			
		}
		
	}
	
	function add_do_remove ( callback, context, data ) {
		
		var tempadded,
			callbackResult;
		
		// if not on display, add temporarily
		
		if ( this.domElement.parents( "body" ).length === 0 ) {
			
			tempadded = true;
			
			this.parent = document.body;
			
		}
		
		// do callback
		
		callbackResult = callback.apply( context, data );
		
		// if added temporarily
		
		if ( tempadded === true ) {
			
			// if had parent, append to
			
			this.parent = this.parentLast;
			
		}
		
		return callbackResult;
		
	}
	
	/*===================================================
    
    position
    
    =====================================================*/
	
	function set_position ( x, y ) {
		
		// transform
		console.log('reposition', this.id, ' x ', x, ' y ', y, ' w/2 ', this.widthHalf, ' h/2 ', this.heightHalf );
		this.domElement.css( 'transform', 'translate(' + ( x - this.widthHalf ) + 'px, ' + ( y - this.heightHalf ) + 'px )' );
		
	}
	
	function center ( W, H ) {
		
		var parent = this.domElement.parent(),	
			pW,
			pH;
		
		if ( parent.length ) {
			
			pW = parent.width();
			pH = parent.height();
			
		}
		else {
			
			pW = ( typeof W !== 'undefined' ) ? W : shared.screenWidth;
			pH = ( typeof H !== 'undefined' ) ? H : shared.screenHeight;
			
		}
		
		this.set_position( pW * 0.5, pH * 0.5 );
		
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
		
		this.parent = parent || this.parentLast;
		
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
			"height": "auto",
			"position": "fixed",
			"top": "0px",
			"left": "0px"
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
		
		domElement.attr( 'id', parameters.id || parameters.text || idBase );
		
		// text
		
		if ( parameters.hasOwnProperty('text') ) {
			
			domElement.html( parameters.text );
			
		}
		
		// classes
		
		if ( parameters.hasOwnProperty('classes') ) {
			
			domElement.addClass( parameters.classes );
			
		}
		
		// css
		
		domElement.css( parameters.cssmap );
		
		return domElement;
		
	}
	
	/*===================================================
    
    css
    
    =====================================================*/
	
	function generate_css_map ( parameters ) {
		
		// proto
		
		var cssmap;
		
		cssmap = parameters.cssmap || {};
		
		cssmap[ "position" ] = cssmap[ "position" ] || "relative";
		cssmap[ "display" ] = cssmap[ "display" ] || "block";
		cssmap[ "transform-origin" ] = cssmap[ "transform-origin" ] || "50% 50%";
		
		return cssmap;
		
	}
	
} (KAIOPUA) );