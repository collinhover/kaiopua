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
	
	main.asset_register( assetPath, { data: _UIElement } );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
		
	// public
	
	_UIElement.generate_dom_element = generate_dom_element;
	_UIElement.generate_tool_tip = generate_tool_tip;
	_UIElement.supported_css_property = supported_css_property;
	_UIElement.supported_css_value = supported_css_value;
	_UIElement.str_to_camel = str_to_camel;
	_UIElement.str_from_camel = str_from_camel;
	
	// css special cases
	
	_UIElement.cssSpecialCases = {};
	
	_UIElement.cssSpecialCases.pointerEvents = _UIElement.supported_css_property( 'pointer-events' );
	_UIElement.cssSpecialCases.lineargradient = ( function () {
		
		// get correct linear gradient value name
		
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
		
	} () );
	
	// instance
	
	_UIElement.Instance = UIElement;
	
	_UIElement.Instance.prototype.add = add;
	_UIElement.Instance.prototype.remove = remove;
	
	_UIElement.Instance.prototype.append_to = append_to;
	
	_UIElement.Instance.prototype.enable = enable;
	_UIElement.Instance.prototype.disable = disable;
	
	_UIElement.Instance.prototype.enable_visual = enable_visual;
	_UIElement.Instance.prototype.disable_visual = disable_visual;
	
	_UIElement.Instance.prototype.set_position = set_position;
	_UIElement.Instance.prototype.align = align;
	_UIElement.Instance.prototype.align_once = align_once;
	
	_UIElement.Instance.prototype.show = show;
	_UIElement.Instance.prototype.hide = hide;
	
	_UIElement.Instance.prototype.pulse = pulse;
	_UIElement.Instance.prototype.pulse_stop = pulse_stop;
	
	_UIElement.Instance.prototype.show_children = show_children;
	_UIElement.Instance.prototype.hide_children = hide_children;
	_UIElement.Instance.prototype.copy_children_and_exclude = copy_children_and_exclude;
	_UIElement.Instance.prototype.get_children_showing = get_children_showing;
	_UIElement.Instance.prototype.get_children_hidden = get_children_hidden;
	
	_UIElement.Instance.prototype.set_pointer_events = set_pointer_events;
	
	_UIElement.Instance.prototype.update_form = update_form;
	_UIElement.Instance.prototype.form_circle = form_circle;
	_UIElement.Instance.prototype.form_rectangle = form_rectangle;
	_UIElement.Instance.prototype.form_fullwindow = form_fullwindow;
	
	_UIElement.Instance.prototype.change_dom_element = change_dom_element;
	_UIElement.Instance.prototype.generate_dom_element = generate_dom_element;
	_UIElement.Instance.prototype.generate_tool_tip = generate_tool_tip;
	_UIElement.Instance.prototype.apply_css = apply_css;
	
	_UIElement.Instance.prototype.generate_theme = generate_theme;
	
	_UIElement.Instance.prototype.themes = {};
	_UIElement.Instance.prototype.themes.core = theme_core;
	_UIElement.Instance.prototype.themes.white = theme_white;
	
	Object.defineProperty( _UIElement.Instance.prototype, 'domElement', { 
		get : function () { return this._domElement; },
		set : function () { this.change_dom_element.apply( this, arguments ); }
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'parent', { 
		get : function () { return this._parent; },
		set : function ( parent ) { this.append_to( parent ); }
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'html', { 
		get : function () { return this.domElement.html(); },
		set : function ( html ) {
			
			this.domElement.html( html );
			
		}
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'width', { 
		get : function () { return this.domElement.width(); },
		set : function ( width ) {
			
			this.domElement.width( main.is_number( width ) ? Math.round( width ) : width );
			
		}
	} );

	Object.defineProperty( _UIElement.Instance.prototype, 'height', { 
		get : function () { return this.domElement.height(); },
		set : function ( height ) {
			
			this.domElement.height( main.is_number( height ) ? Math.round( height ) : height );
		
		}
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'widthHalf', { 
		get : function () { return this.width * 0.5; }
	} );

	Object.defineProperty( _UIElement.Instance.prototype, 'heightHalf', { 
		get : function () { return this.height * 0.5; }
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'outerWidth', { 
		get : function () { return this.width + this.spacingLeft + this.spacingRight; }
	} );

	Object.defineProperty( _UIElement.Instance.prototype, 'outerHeight', { 
		get : function () { return this.height + this.spacingTop + this.spacingBottom; }
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
	
	Object.defineProperty( _UIElement.Instance.prototype, 'pointerEvents', { 
		get : function () { return this._pointerEvents; },
		set : function ( state ) {
			
			var me = this;
			
			if ( typeof state === 'boolean' && ( this.hasOwnProperty( '_pointerEvents' ) !== true || this.pointerEvents !== state ) ) {
				
				this._pointerEvents = state;
				
				this.set_pointer_events( this._pointerEvents );
				
			}
			
		}
		
	});
	
	Object.defineProperty( _UIElement.Instance.prototype, 'enabledSelf', { 
		get : function () { return this._enabled; }
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'enabled', { 
		get : function () { return ( this._enabledOverride === false ? this._enabledOverride : ( this.enabledSelf !== false && this.parent instanceof _UIElement.Instance ? this.parent.enabled : this.enabledSelf ) ); },
		set : function ( state ) {
			
			if ( state === true ) {
				
				this.enable();
				
			}
			else {
				
				this.disable();
				
			}
			
		}
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'isVisibleSelf', { 
		get : function () { return this._isVisible; }
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'isVisible', { 
		get : function () { return ( this._isVisible !== false && this.parent instanceof _UIElement.Instance ? this.parent.isVisible : this._isVisible ); },
		set : function ( state ) {
			
			this._isVisible = state;
			
		}
	} );
	
	Object.defineProperty( _UIElement.Instance.prototype, 'hidden', { 
		get : function () { return this._hidden; },
		set : function ( state ) {
			
			this._hidden = state;
			
			this.set_pointer_events( state ? false : this.pointerEvents );//( this.hidden === false && this.isVisible === true && ( typeof this.parent === 'undefined' || this.parent.hidden === false ) ) ? this.pointerEvents : false );
			
		}
		
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
		
		// tooltip
		
		if ( typeof parameters.tooltip !== 'undefined' ) {
			
			this.tooltip = this.generate_tool_tip( parameters.tooltip, this );
			
		}
		
		// items
		
		this.childrenByID = {};
        this.children = [];
		this.childrenAlwaysVisible = [];
		
		// properties
		
		this.timeShow = main.is_number( parameters.timeShow ) ? parameters.timeShow : 500;
        this.timeHide = main.is_number( parameters.timeHide ) ? parameters.timeHide : 500;
		
		this.opacityShow = main.is_number( parameters.opacityShow ) ? parameters.opacityShow : 1;
		
		this.spacingTop = parameters.spacingTop || parameters.spacingVertical || parameters.spacing || 0;
		this.spacingBottom = parameters.spacingBottom || parameters.spacingVertical || parameters.spacing || 0;
		this.spacingLeft = parameters.spacingLeft || parameters.spacingHorizontal || parameters.spacing || 0;
		this.spacingRight = parameters.spacingRight || parameters.spacingHorizontal || parameters.spacing || 0;
		
		this.pointerEvents = this.pointerEventsWhileVisible = ( typeof parameters.pointerEvents === 'boolean' ) ? parameters.pointerEvents : true;
		
		// on display
		
		this.hidden = false;
		this.isVisible = Boolean( this.domElement.parents( "body" ).length );
		this.signalOnVisible = shared.signals[ "on_display_" + this.id ] = new signals.Signal();
		
		// position
		
		this.set_position( 0, 0 );
		
		// enable / disable
		
		this.enabled = ( typeof parameters.enabled === 'boolean' ? parameters.enabled : true );
		
		// width / height
		
		if ( parameters.hasOwnProperty('width') ) {
			
			this.width = parameters.width;
			
		}
		else if ( parameters.hasOwnProperty('size') ) {
			
			this.width = parameters.size;
			
		}
		
		if ( parameters.hasOwnProperty('height') ) {
			
			this.height = parameters.height;
			
		}
		else if ( parameters.hasOwnProperty('size') ) {
			
			this.height = parameters.size;
			
		}
		
		// form, default to rectangle
		
		if ( parameters.fullwindow === true ) {
			
			this.form_fullwindow();
		
		}
		
		if ( parameters.circle === true ) {
			
			this.form_circle();
		
		}
		
		if ( parameters.rectangle === true ) {
			
			this.form_rectangle();
			
		}
		
		// alignment
		
		this.alignment = parameters.alignment || false;
		
		// if dom element already has parent, set as parent
		
		if ( this.isVisible ) {
			
			this._parent = this.domElement.parent();
			
		}
		
	}
	
	/*===================================================
    
    children
    
    =====================================================*/
	
	function add () {
		
		var i, l,
			children,
			child;
		
		children = arguments;
		
		for ( i = 0, l = children.length; i < l; i++ ) {
			
			child = children[ i ];
			
			if ( child instanceof _UIElement.Instance && this.children.indexOf( child ) === -1 ) {
				
				this.children.push( child );
				
				this.childrenByID[ child.id ] = child;
				
				if ( child.parent !== this ) {
					
					child.parent = this;
					
				}
				
			}
			
		}
		
	}
	
	function remove () {
		
		var i, l,
			children,
			child,
			index;
		
		// default to removing all
		
		children = ( arguments.length > 0 ? arguments : this.children );
		
		for ( i = 0, l = children.length; i < l; i ++) {
			
			child = children[ i ];
			
			index = this.children.indexOf( child );
			
			if ( index !== -1 ) {
				
				this.children.splice( index, 1 );
				
				delete this.childrenByID[ child.id ];
				
				// if always visible
				
				index = this.childrenAlwaysVisible.indexOf( child );
				
				if ( index !== -1 ) {
					
					this.childrenAlwaysVisible.splice( index, 1 );
					
				}
				
				if ( child.parent === this ) {
					
					child.parent = child.parentLast;// undefined;
					
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
			
			//console.log( this, this.id, ' has PARENT', this.parent.id );
			
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
			
			// if visible
			
			if ( this.isVisible ) {
				
				// set all children correct parent
				
				for ( i = 0, l = this.children.length; i < l; i++ ) {
					
					child = this.children[ i ];
					
					child.append_to( this, this.isVisible );
					
				}
				
				// dispatch visible signal
				
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
		
		var i, l,
			child;
		
		this.apply_css( this.theme.enabled );
		
		this.theme.stateLast = this.theme.enabled;
		
		for ( i = 0, l = this.children.length; i < l; i++) {
			
			child = this.children[ i ];
			
			if ( child.parent === this && child.enabledSelf === true ) {
				
				child.enable_visual();
				
			}
			
		}
		
	}
	
	function disable_visual () {
		
		var i, l,
			child;
		
		this.apply_css( this.theme.disabled );
		
		this.theme.stateLast = this.theme.disabled;
		
		/*
		for ( i = 0, l = this.children.length; i < l; i++) {
			
			child = this.children[ i ];
			
			if ( child.parent === this ) {
				console.log(this.id, 'disable child visual', child.id );
				child.disable_visual();
				
			}
			
		}
		*/
		
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
	
	function align () {
		
		var parent,
			w, h;
		
		// if has alignment
		
		if ( typeof this.alignment === 'string' ) {
			
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
					
					this.set_position( w * 0.5 - this.widthHalf, h - this.height - this.spacingBottom );
					
				}
				else if ( this.alignment === 'topcenter' ) {
					
					this.set_position( w * 0.5 - this.widthHalf, this.spacingTop );
					
				}
				else if ( this.alignment === 'leftcenter' ) {
					
					this.set_position( this.spacingLeft, h * 0.5 - this.heightHalf );
					
				}
				else if ( this.alignment === 'rightcenter' ) {
					
					this.set_position( w - this.width - this.spacingRight, h * 0.5 - this.heightHalf );
					
				}
				else if ( this.alignment === 'bottomright' ) {
					
					this.set_position( w - this.width - this.spacingRight, h - this.height - this.spacingBottom );
					
				}
				else if ( this.alignment === 'bottomleft' ) {
					
					this.set_position( this.spacingLeft, h - this.height - this.spacingBottom );
					
				}
				else if ( this.alignment === 'topright' ) {
					
					this.set_position( w - this.width - this.spacingRight, this.spacingTop );
					
				}
				else if ( this.alignment === 'topleft' ) {
					
					this.set_position( this.spacingLeft, this.spacingTop );
					
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
		
	}
	
	function align_once ( alignment ) {
		
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
	
	/*===================================================
    
    show / hide self
    
    =====================================================*/
	
	function show ( parameters ) {
		
		var domElement,
			parent,
			time,
			opacity,
			callback,
			callbackContext,
			fadeCallback;
		//console.log( this.id, 'SHOW');
		// handle parameters
		
		parameters = parameters || {};
		
		domElement = parameters.domElement;
		
		parent = parameters.parent || this.parent || this.parentLast;
		
		time = main.is_number( parameters.time ) ? parameters.time : ( domElement ? 0 : this.timeShow );
		
		opacity = main.is_number( parameters.opacity ) ? parameters.opacity : ( domElement ? 1 : this.opacityShow );
		
		callback = parameters.callback;
		callbackContext = parameters.callbackContext;
		
		fadeCallback = function () { if ( typeof callback !== 'undefined' ) { callback.call( callbackContext ); } };
		
		// if dom element passed
		
		if ( domElement ) {
			
			domElement.stop( true ).fadeTo( time, opacity, fadeCallback );
			
		}
		// else use own
		else {
			
			// set parent
			
			if ( this.parent !== parent ) {
			
				this.parent = parent;
				
				// show children
				
				this.show_children( undefined, undefined, 0 );
				
			}
			
			// set hidden
				
			this.hidden = this.hiding = false;
			
			// override enabled
			
			this._enabledOverride = true;
			
			// show
			
			if ( this.domElement.css( 'opacity' ) !== opacity ) {
				
				this.domElement.stop( true ).fadeTo( time, opacity, fadeCallback );
				
			}
			else {
				
				fadeCallback();
				
			}
			
		}
		
	}
	
	function hide ( parameters ) {
		
		var me = this,
			domElement,
			remove,
			time,
			opacity,
			callback,
			callbackContext;
		//console.log( this.id, 'HIDE' );
		// handle parameters
		
		parameters = parameters || {};
		
		domElement = parameters.domElement;
		
		remove = parameters.remove;
		
		time = main.is_number( parameters.time ) ? parameters.time : ( domElement ? 0 : this.timeHide );
		
		opacity = main.is_number( parameters.opacity ) ? parameters.opacity : 0;
		
		callback = parameters.callback;
		callbackContext = parameters.callbackContext;
		
		// if dom element passed
		
		if ( domElement ) {
			
			domElement.stop( true ).fadeTo( time, opacity, function () { on_hidden( domElement, callback, callbackContext, remove ); } );
			
		}
		// else use own
		else {
			
			// override enabled
			
			this._enabledOverride = false;
			
			// hiding
			
			this.hiding = true;
			
			// hide
			
			if ( this.domElement.css( 'opacity' ) !== opacity ) {
				
				this.domElement.stop( true ).fadeTo( time, opacity, function () { on_hidden( me, callback, callbackContext, remove ); } );
				
			}
			else {
				
				on_hidden( this, callback, callbackContext, remove );
				
			}
			
		}
		
	}
	
	function on_hidden ( hideTarget, callback, callbackContext, remove ) {
		
		if ( hideTarget instanceof _UIElement.Instance ) {
			
			if ( remove === true ) {
				
				hideTarget.parent = undefined;
				
			}
			
			hideTarget.hidden = true;
			
			hideTarget.hiding = false;
			
		}
		else {
			
			if ( remove === true ) {
				
				hideTarget.detach();
				
			}
			
		}
		
		if ( typeof callback !== 'undefined' ) {
			
			callback.call( callbackContext );
			
		}
		
	}
	
	function pulse ( parameters ) {
		
		var timeShow,
			timeHide,
			opacityShow,
			opacityHide,
			callback,
			callbackContext;
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.iterations = main.is_number( parameters.iterations ) ? parameters.iterations : -1;
		parameters.count = main.is_number( parameters.count ) ? parameters.count : 0;
		parameters.count++;
		
		timeShow = main.is_number( parameters.timeShow ) ? parameters.timeShow : ( main.is_number( parameters.time ) ? parameters.time : this.timeShow );
		timeHide = main.is_number( parameters.timeHide ) ? parameters.timeHide : ( main.is_number( parameters.time ) ? parameters.time : this.timeHide );
		
		opacityShow = main.is_number( parameters.opacityShow ) ? parameters.opacityShow : 1;
		opacityHide = main.is_number( parameters.opacityHide ) ? parameters.opacityHide : 0;
		
		this.show( { 
			parent: parameters.parent,
			time: timeShow,
			opacity: opacityShow,
			callback: function () {
				this.hide( {
					remove: false,
					time: timeHide,
					opacity: opacityHide,
					callback: function () {
						
						if ( parameters.iterations === -1 || parameters.count < parameters.iterations ) {
							
							this.pulse( parameters );
							
						}
						
					},
					callbackContext: this
				} );
			},
			callbackContext: this
		} );
		
	}
	
	function pulse_stop () {
		
		this.domElement.stop( true );
		
	}
	
	/*===================================================
    
    show / hide children
    
    =====================================================*/
	
	function show_children ( parameters ) {
		
		var i, l,
			children,
			child;
		
		if ( this.children.length > 0 ) {
			
			// handle parameters
			
			parameters = parameters || {};
			
			parameters.parent = parameters.parent || this;
			
			// make copy of children passed
			
			children = this.copy_children_and_exclude( parameters.children, parameters.excluding );
			
			//console.log(this.id, 'SHOW children', children );
			// show all
			
			for ( i = 0, l = children.length; i < l; i++ ) {
				
				child = children[ i ];
				
				child.show( parameters );
				
			}
			
		}
		
	}
	
	function hide_children ( parameters ) {
		
		var i, l,
			children,
			child;
		
		if ( this.children.length > 0 ) {
			
			// handle parameters
			
			parameters = parameters || {};
			
			parameters.remove = typeof parameters.remove === 'boolean' ? parameters.remove : false;
			
			// make copy of children passed
			
			children = this.copy_children_and_exclude( parameters.children, this.childrenAlwaysVisible.concat( parameters.excluding || [] ) );
			
			// hide all
			//console.log(this.id, 'HIDE children', children );
			for ( i = 0, l = children.length; i < l; i++ ) {
				
				child = children[ i ];
				
				if ( child.hidden !== true && child.parent === this ) {
					
					child.hide( parameters );
					
				}
				
			}
			
		}
		
	}
	
	function copy_children_and_exclude ( children, excluding ) {
		
		var i, l,
			child,
			index,
			childrenMinusExcluded = [];
		
		children = main.ensure_array( children || this.children );
		
		excluding = main.ensure_array( excluding );
		
		for ( i = 0, l = children.length; i < l; i++ ) {
			
			child = children[ i ];
			
			if ( excluding.indexOf( child ) === -1 ) {
				
				childrenMinusExcluded.push( child );
				
			}
			
		}
		
		return childrenMinusExcluded;
		
	}
	
	function get_children_showing ( children ) {
		
		var i, l,
			child,
			showing = [];
		
		children = main.ensure_array( children || this.children );
		
		for ( i = 0, l = children.length; i < l; i++ ) {
			
			child = children[ i ];
			
			if ( child.hidden === false && child.parent === this ) {
				
				showing.push( child );
				
			}
			
		}
		
		return showing;
		
	}
	
	function get_children_hidden ( children ) {
		
		var i, l,
			child,
			hidden = [];
		
		children = main.ensure_array( children || this.children );
		
		for ( i = 0, l = children.length; i < l; i++ ) {
			
			child = children[ i ];
			
			if ( child.hidden === true && child.parent === this ) {
				
				hidden.push( child );
				
			}
			
		}
		
		return hidden;
		
	}
	
	/*===================================================
    
    pointer events
    
    =====================================================*/
	
	function set_pointer_events ( state ) {
		
		var i, l,
			child;
		
		// catch state
		
		if ( state === false || this.hiding === true || this.hidden === true || this.isVisible === false || ( typeof this.parent !== 'undefined' && ( this.parent.hiding === true || this.parent.hidden === true ) ) ) {
			
			// use native pointer-events when available
			
			if ( _UIElement.cssSpecialCases.pointerEvents ) {
				
				this.apply_css( _UIElement.cssSpecialCases.pointerEvents, 'none' );
				
			}
			else {
				
				// fallback in-case browser does not support pointer-events property
				// this method is incredibly slow, as it has to hide domElement, retrigger event to find what is under, then show again
				
				this.domElement.on( 
					'mousedown.pe touchstart.pe mouseup.pe touchend.pe click.pe mouseenter.pe touchenter.pe mouseleave.pe touchleave.pe', 
					function ( e ) { on_pointer_event( me, e ); }
				);
				
			}
			
		}
		else {
			
			// use native pointer-events when available
			
			if ( _UIElement.cssSpecialCases.pointerEvents ) {
				
				this.apply_css( _UIElement.cssSpecialCases.pointerEvents, 'auto' );
				
			}
			else {
			
				this.domElement.off( '.pe' );
			
			}
			
		}
		
		// cascade
		
		for ( i = 0, l = this.children.length; i < l; i++ ) {
			
			child = this.children[ i ];
			
			child.set_pointer_events( child.pointerEvents );
			
		}
		
	}
	
	function on_pointer_event ( uiElement, e ) {
		
		var opacity;
		
		if ( typeof e !== 'undefined' ) {
			
			e.preventDefault();
			e.stopPropagation();
			
			opacity = uiElement.domElement.css( 'opacity' );
			
			uiElement.domElement.stop( true ).hide();
			
			$( document.elementFromPoint( e.clientX, e.clientY ) ).trigger( e );
			
			uiElement.domElement.stop( true ).show();
			
		}
		
	}
	
	/*===================================================
    
    form
    
    =====================================================*/
	
	function update_form () {
		
		if ( this.form === 'circle' ) {
			
			this.form_circle();
			
		}
		
	}
	
	function form_circle () {
		
		// if width set explicitly
		
		if ( this.width !== 0 ) {
			
			this.form = 'circle';
			
			var width = this.width,
				height = this.height,
				max = Math.max( width, height ),
				maxHalf = max * 0.5;
			
			// match width/height
			
			this.width = this.height = max;
			
			// set radius to half
			
			this.apply_css( "border-radius", maxHalf + "px" );
			
		}
		
	}
	
	function form_rectangle () {
		
		this.form = 'rectangle';
		
		// if either dimension is set when the other is not
		
		if ( this.width !== 0 && this.height === 0 ) {
			
			this.height = this.width;
			
		}
		if ( this.width === 0 && this.height !== 0 ) {
			
			this.width = this.height;
			
		}
		
		// set radius to base
		
		this.apply_css( "border-radius", 0 );
		
	}
	
	function form_fullwindow () {
		
		this.form = 'fullwindow';
		
		this.apply_css( {
			"min-height": "100%",
			"width": "100%",
			"height": "100%",
			"top": "0px",
			"left": "0px",
			"overflow": "hidden"
		} );
		
	}
	
	/*===================================================
    
    dom element
    
    =====================================================*/
	
	function change_dom_element ( replacement, parameters ) {
		
		var current = this.domElement;
		
		// handle parameters
		
		parameters = parameters || {};
		
		// if current exists, hide and remove
		
		if ( typeof current !== 'undefined' ) {
			
			this.hide( { domElement: current, remove: true, time: ( this.hidden ? 0 : parameters.timeHide ) } );
			
		}
		
		// replace
		
		this._domElement = $( replacement );
		
		// parent
		
		if ( typeof this.parent !== 'undefined' ) {
			
			if ( this.parent instanceof _UIElement.Instance ) {
				
				this.parent.domElement.append( this.domElement );
				
			}
			else {
				
				$( this.parent ).append( this.domElement );
				
			}
			
		}
		
		// if this is showing
		
		if ( this.hiding !== true && this.hidden === false ) {
			
			this.hide( { domElement: this.domElement, time: 0 } );
			
			this.show( { domElement: this.domElement, time: parameters.timeShow } );
			
			this.align();
			
		}
		
		return current;
		
	}
	
	function generate_dom_element ( parameters ) {
		
		var me = this,
			elementType,
			domElement,
			imgElement;
		
		// handle parameters
        
        parameters = parameters || {};
		
		// element type
		
		elementType = parameters.elementType || 'div';
		
		// dom element
		
		domElement = document.createElement( elementType );
		
		// special cases
		
		// image
		
		if ( elementType === 'img' && typeof parameters.src === 'string' ) {
			
			/*
			main.asset_require( parameters.src, function ( img ) {
				
				main.extend( img, domElement );
				me.change_dom_element( img );
				
			} );
			*/
			domElement.onload = parameters.onload;
			domElement.crossOrigin = '';
			domElement.src = parameters.src;
			
		}
		
		// convert to jQuery
		
		domElement = $( domElement );
		
		// id
		
		domElement.attr( 'id', parameters.id );
		
		// html
		
		if ( typeof parameters.html === 'string' ) {
			
			domElement.html( parameters.html );
			
		}
		
		// classes
		
		if ( parameters.hasOwnProperty('classes') ) {
			
			domElement.addClass( parameters.classes );
			
		}
		
		return domElement;
		
	}
	
	function generate_tool_tip ( parameters, uielement ) {
		
		var tooltip;
		
		if ( typeof parameters === 'string' ) {
			
			tooltip = {};
			tooltip.source = tooltip.content = parameters;
			
		}
		else if ( typeof parameters.content === 'string' ) {
			
			tooltip = main.extend( parameters, {}, true );
			tooltip.source = tooltip.content;
			
		}
		
		if ( typeof tooltip.content !== 'undefined' ) {
			
			tooltip.defaultPosition = tooltip.defaultPosition || 'top';
			tooltip.maxWidth = tooltip.maxWidth || 'auto';
			tooltip.delay = tooltip.delay || 100;
			tooltip.contentDisabled = '<br/><p class="disabled">' + ( tooltip.contentDisabled || '(disabled)' ) + '</p>';
			tooltip.uielement = uielement;
			
			// on enter function to check if ui element is enabled/disabled and notify user
			
			tooltip.enter = function () {
				
				tooltip.content = tooltip.source;
				
				if ( tooltip.uielement instanceof _UIElement.Instance && tooltip.uielement.enabledSelf !== true ) {
					
					tooltip.content += tooltip.contentDisabled;
					
				}
				
			};
			
			// on click function to check if ui element is hiding/hidden to disable tooltip
			
			tooltip.click = function () {
				
				tooltip.disable = false;
				
				if ( tooltip.uielement instanceof _UIElement.Instance && ( tooltip.uielement.hiding === true || tooltip.uielement.hidden === true || tooltip.uielement.isVisible === false ) ) {
					
					tooltip.disable = true;
					
				}
				
			};
			
			// if ui element passed
			
			if ( uielement instanceof _UIElement.Instance ) {
				
				uielement.domElement.tipTip( tooltip );
				
			}
			
		}
		
		return tooltip;
		
	}
	
	/*===================================================
    
    css
    
    =====================================================*/
	
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
		
		if ( typeof propertyPrefixed === 'string' ) {
			
			propertySupported = _UIElement.str_from_camel( propertyPrefixed );
			
		}
		
		return propertySupported;
		
	}
	
	function supported_css_value ( value ) {
		
		var index;
		
		if ( typeof value === 'string' ) {
			
			// linear gradient
			
			index = value.indexOf( 'linear-gradient' );
			
			if ( index !== -1 ) {
				
				return _UIElement.cssSpecialCases.lineargradient + value.substr( index + 'linear-gradient'.length, value.length );
				
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
	
	function theme_core ( overrides ) {
		
		var theme,
			cssmap,
			or;
		
		// deep copy all overrides into theme
		
		theme = main.extend( overrides, {}, true );
		
		// cssmap
		
		or = overrides.cssmap || {};
		
		cssmap = theme.cssmap = theme.cssmap || {};
		
		cssmap[ "position" ] = or[ "position" ] || "absolute";
		cssmap[ "display" ] = or[ "display" ] || "block";
		cssmap[ "transform-origin" ] = or[ "transform-origin" ] || "50% 50%";
		
		// state last
		
		theme.stateLast = {};
		
		return theme;
		
	}
	
	function theme_white ( overrides ) {
		
		var theme = this.themes.core( overrides ),
			cssmap,
			enabled,
			disabled,
			or;
		
		// cssmap
		
		or = overrides.cssmap || {};
		
		cssmap = theme.cssmap = theme.cssmap || {};
		
		cssmap[ "box-shadow" ] = or[ "box-shadow" ] || "-2px 2px 10px rgba(0, 0, 0, 0.15)";
		
		// enabled state
		
		or = overrides.enabled || {};
		
		enabled = theme.enabled = theme.enabled || {};
		
		enabled[ "color" ] = or[ "color" ] || "#333333";
		enabled[ "background-color" ] = or[ "background-color" ] || "#eeeeee";
		//enabled[ "background-image" ] = or[ "background-image" ] || "linear-gradient(top, #eeeeee 30%, #cccccc 100%)";
		
		// disabled state
		
		or = overrides.disabled || {};
		
		disabled = theme.disabled = theme.disabled || {};
		
		disabled[ "color" ] = or[ "color" ] || "#777777";
		disabled[ "background-color" ] = or[ "background-color" ] || "#cccccc";
		//disabled[ "background-image" ] = or[ "background-image" ] || "linear-gradient(top, #cccccc 30%, #aaaaaa 100%)";
		
		return theme;
		
	}
	
} (KAIOPUA) );