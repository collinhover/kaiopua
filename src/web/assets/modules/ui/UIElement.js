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
		data: _UIElement,
		requirements: [
			"js/jquery.transform2d.min.js",
			"js/jquery.tipTip.min.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal () {
		console.log('internal ui element', _UIElement);
		
		// properties
		
		_UIElement.timeShow = 500;
		_UIElement.timeHide = 500;
		
		_UIElement.sizes = {};
		_UIElement.sizes.iconLargeContainer = 100;
		_UIElement.sizes.iconMediumContainer = 60;
		_UIElement.sizes.iconSmallContainer = 32;
		_UIElement.sizes.iconLarge = 64;
		_UIElement.sizes.iconMedium = 32;
		_UIElement.sizes.iconSmall = 16;
		_UIElement.sizes.spacing = 10;
		
		_UIElement.generate_dom_element = generate_dom_element;
		_UIElement.generate_tool_tip = generate_tool_tip;
		_UIElement.supported_css_property = supported_css_property;
		_UIElement.supported_css_value = supported_css_value;
		_UIElement.str_to_camel = str_to_camel;
		_UIElement.str_from_camel = str_from_camel;
		
		// css special cases
		
		_UIElement.cssSpecialCases = {};
		
		_UIElement.cssSpecialCases.transform = _UIElement.supported_css_property( 'transform' );
		_UIElement.cssSpecialCases.transformOrigin = _UIElement.supported_css_property( 'transform-origin' );
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
		
		// firefox <12 css3 transform bug, see https://bugzilla.mozilla.org/show_bug.cgi?id=591718, fixed as of Jan 2012
		
		_UIElement.transformCSSUpdateMissing = ( function () {
			
			var domElement = $( document.createElement('div') ),
				leftExpected = 100,
				topExpected = 100,
				bodyOffset,
				offset,
				leftActual,
				topActual,
				result;
			
			// try transform
			
			domElement.css( {
				'width': '100px',
				'height': '100px',
				'position': 'absolute',
				'transform': 'translate(' + leftExpected + 'px, ' + topExpected + 'px)'
			} );
			
			$( document.body ).prepend( domElement );
			
			offset = domElement.position();
			leftActual = offset.left;
			topActual = offset.top;
			
			result = ( leftActual === leftExpected && topActual === topExpected );
			
			domElement.detach();
			
			return result;

		} () );
		
		// fix for firefox <12 css3 transform bug
		
		_UIElement.matrix_from_css_str = function ( str ) {
			
			var strArr = str.match(/matrix\(([^\)]+)\)/i)[1].split(','),
				mat = new Matrix.create( [
					[ +strArr[0], +strArr[2], parseFloat( strArr[4] ) ],
					[ +strArr[1], +strArr[3], parseFloat( strArr[5] ) ],
					[ 0, 0, 1 ]
				] );
		
			return mat;
			
		};
		
		_UIElement.transformIdentityMatrix = _UIElement.matrix_from_css_str( 'matrix(1,0,0,1,0,0)' );
		
		_UIElement.translate_matrix_2d = function ( mat, tx, ty ) {
			
			var elements = mat.elements;
			
			elements[ 0 ][ 2 ] += tx;
			elements[ 1 ][ 2 ] += ty;
			
			return mat;
		};
		
		_UIElement.get_local_transformation_matrix = function ( domElement ) {
			
			var element = domElement instanceof jQuery ? domElement[ 0 ] : domElement,
				transformProp = _UIElement.cssSpecialCases.transform,
				originProp = _UIElement.cssSpecialCases.transformOrigin,
				style = window.getComputedStyle( element, null ),
				transformStyle = style[ transformProp ],
				originStyle = style[ originProp ],
				transformMatrix = ( transformStyle ? _UIElement.matrix_from_css_str( transformStyle ) : _UIElement.transformIdentityMatrix.dup() ),
				originMatrix,
				result;
			
			// finding element's local transformation matrix based on the transform style
			
			// Firefox gives 50% 50% when there is no transform!? and pixels (50px 30px) otherwise
			if ( !originStyle || originStyle.indexOf('%') !== -1 ) {
				
				originStyle = [ 0, 0 ];
				
			}
			else {
				
				originStyle = originStyle.replace(/px/gi, '').split(' ');
				
			}
			
			originMatrix = _UIElement.matrix_from_css_str( 'matrix(1,0,0,1,' + originStyle[ 0 ] + ',' + originStyle[ 1 ] + ')' );
			
			result = originMatrix.multiply( transformMatrix ).multiply( originMatrix.inverse() );
			
			return _UIElement.translate_matrix_2d( result, -window.pageXOffset, -window.pageYOffset );
			
		};
		
		_UIElement.transform_css_update = function ( uielement ) {
			
			var domElement,
				width,
				height,
				transformationMatrix,
				topleft,
				topright,
				bottomleft,
				bottomright,
				bbox;
			
			// if update needed
			
			if ( _UIElement.transformCSSUpdateMissing !== true && uielement instanceof _UIElement.Instance ) {
				
				domElement = uielement.domElement;
				width = uielement.width;
				height = uielement.height;
				
				// get correct transformation matrix
				
				transformationMatrix = _UIElement.get_local_transformation_matrix( domElement );
				
				// get bounding box
				
				topleft = transformationMatrix.multiply( Vector.create( [ 0, 0, 1 ] ) ).elements;
				topright = transformationMatrix.multiply( Vector.create( [ width, 0, 1 ] ) ).elements;
				bottomleft = transformationMatrix.multiply( Vector.create( [ 0, height, 1 ] ) ).elements;
				bottomright = transformationMatrix.multiply( Vector.create( [ width, height, 1 ] ) ).elements;
				
				bbox = {
					'transform': 'none',
					'left': Math.min( topleft[ 0 ], topright[ 0 ], bottomleft[ 0 ], bottomright[ 0 ] ) + 'px',
					'top': Math.min( topleft[ 1 ], topright[ 1 ], bottomleft[ 1 ], bottomright[ 1 ] ) + 'px'
				}
				
				// update css
				
				domElement.css( bbox );
				
			}

		};
		
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
		
		_UIElement.Instance.prototype.sort_children_by_order = sort_children_by_order;
		_UIElement.Instance.prototype.get_child_order = get_child_order;
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
		_UIElement.Instance.prototype.themes.green = theme_green;
		_UIElement.Instance.prototype.themes.red = theme_red;
		
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
					
					shared.signals.onWindowResized.add( this.align, this );
					
					this.align();
					
				}
				else {
					
					this._alignment = false;
					
					shared.signals.onWindowResized.remove( this.align, this );
					
				}
				
			}
		} );
		
		Object.defineProperty( _UIElement.Instance.prototype, 'alignmentGuide', { 
			get : function () { return this._alignmentGuide; },
			set : function ( uielement ) {
				
				if ( uielement instanceof _UIElement.Instance && uielement !== this ) {
					
					this._alignmentGuide = uielement;
					
				}
				else {
					
					this._alignmentGuide = false;
					
				}
				
			}
		} );
		
		Object.defineProperty( _UIElement.Instance.prototype, 'pointerEvents', { 
			get : function () { return this._pointerEvents; },
			set : function ( state ) {
				
				if ( typeof state === 'boolean' && ( this.hasOwnProperty( '_pointerEvents' ) !== true || this.pointerEvents !== state ) ) {
					
					this._pointerEvents = state;
					
					this.set_pointer_events( this._pointerEvents );
					
				}
				
			}
		} );
		
		Object.defineProperty( _UIElement.Instance.prototype, 'indicator', { 
			get : function () { return this._indicator; },
			set : function ( state ) {
				
				var me = this;
				
				// show indicator
				
				if ( state === true ) {
					
					// if needs indicator
					
					if ( this._indicator instanceof _UIElement.Instance === false  ) {
						
						var indicatorImage = new _UIElement.Instance( {
							elementType: 'img',
							src: shared.pathToIcons + 'alertcircle_64.png',
							size: _UIElement.sizes.iconSmall,
							pointerEvents: false
						} );
						indicatorImage.align_once( 'center' );
						
						this._indicator = new _UIElement.Instance( {
							id: 'indicator',
							size: _UIElement.sizes.iconSmallContainer,
							circle: true,
							theme: 'white',
							pointerEvents: false,
							alignment: 'topleft',
							alignmentGuide: this,
							spacingTop: -_UIElement.sizes.iconSmallContainer * 0.25,
							spacingLeft: -_UIElement.sizes.iconSmallContainer * 0.25
						} );
						
						this._indicator.add( indicatorImage );
						
					}
					
					this._indicator.pulse( { parent: this } );
					
					this.domElement.on( 'mouseenter.indicator touchenter.indicator mousedown.indicator touchstart.indicator mouseup.indicator touchend.indicator', function () { me.indicator = false } );
					
				}
				// default to off
				else {
					
					if ( this._indicator instanceof _UIElement.Instance ) {
						
						this.domElement.off( '.indicator' );
						
						this._indicator.hide( { remove: true, time: 0 } );
						
					}
					
				}
				
			}
		} );
		
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
				
				this.set_pointer_events( state ? false : this.pointerEvents );
				
			}
		} );
		
	}
	
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
		
		this.children = [];
		this.childrenOrder = {};
		this.childrenByID = {};
		this.childrenAlwaysVisible = [];
		
		// properties
		
		this.timeShow = main.is_number( parameters.timeShow ) ? parameters.timeShow : _UIElement.timeShow;
        this.timeHide = main.is_number( parameters.timeHide ) ? parameters.timeHide : _UIElement.timeHide;
		
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
		
		this.alignmentGuide = parameters.alignmentGuide || false;
		
		this.alignmentOutside = typeof parameters.alignmentOutside === 'boolean' ? parameters.alignmentOutside : false;
		
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
			argument,
			child;
		
		// run through arguments passed
		
		for ( i = 0, l = arguments.length; i < l; i++ ) {
			
			argument = arguments[ i ];
			
			// if is valid child
			
			if ( argument instanceof _UIElement.Instance ) {
				
				child = argument;
				
				if ( this.children.indexOf( child ) === -1 ) {
				
					this.children.push( child );
					
					this.childrenOrder[ child.id ] = -1;
					
					this.childrenByID[ child.id ] = child;
					
					if ( child.parent !== this ) {
						
						child.parent = this;
						
					}
					
				}
				
				// if child adding after this already showing
				// and child is not hidden + never been shown
				
				if ( this.isVisible === true && child.hidden === false && child.hasOwnProperty( 'showing' ) === false ) {
					
					child.show( { time: 0 } );
					
				}
				
			}
			// else if is number, assume is order for previous child
			if ( i > 0 && main.is_number( argument ) ) {
				
				this.childrenOrder[ child.id ] = argument;
				
			}
			
		}
		
		// sort children
		
		this.sort_children_by_order();
		
	}
	
	function remove () {
		
		var i, l,
			children,
			child,
			index;
		
		// default to removing all
		
		children = ( arguments.length > 0 ? arguments : this.children );
		
		for ( i = children.length - 1, l = 0; i >= l; i-- ) {
			
			child = children[ i ];
			
			index = this.children.indexOf( child );
			
			if ( index !== -1 ) {
				
				this.children.splice( index, 1 );
				
			}
			
			delete this.childrenOrder[ child.id ];
			
			delete this.childrenByID[ child.id ];
			
			// if always visible
			
			index = this.childrenAlwaysVisible.indexOf( child );
			
			if ( index !== -1 ) {
				
				this.childrenAlwaysVisible.splice( index, 1 );
				
			}
			
			if ( child.parent === this ) {
				
				child.parent = undefined;
				
			}
			
		}
		
		if ( children === this.children ) {
			
			this.domElement.empty();
			
		}
		else {
			
			// sort children
			
			this.sort_children_by_order();
			
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
				
				if ( this.parentLast.children.indexOf( this ) !== -1 ) {
					
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
		
	}
	
	/*===================================================
    
    position
    
    =====================================================*/
	
	function set_position ( x, y ) {
		
		var transformValue;
		
		// internal trackers for x and y
		// non-integer values of x/y cause terrible text rendering
		// around 250x faster than calling jQuery position().top/left
		
		this._x = Math.round( x );
		this._y = Math.round( y );
		
		// if css transform supported
		
		if ( _UIElement.cssSpecialCases.transform ) {
			// set transform value
			
			transformValue = 'translate(' + this._x + 'px, ' + this._y + 'px )';
			
			// use direct manipulation of dom element css due to repeated application
			// apply_css ensures correct css property/value for user's browser, but is 3x slower
			
			this.domElement.css( 'transform', transformValue );
			//this.apply_css( 'transform', transformValue );
			
			// ensure update css from transform
			
			_UIElement.transform_css_update( this );
			
		}
		// else use left/top
		else {
			
			if ( this._x !== x ) {
				this.domElement.css( 'left', this._x + 'px' );
			}
			if ( this._y !== y ) {
				this.domElement.css( 'top', this._y + 'px' );
			}
			
		}
		
	}
	
	function align () {
		
		var alignment,
			parent,
			x, y,
			w, h;
		
		// if has alignment
		
		if ( typeof this.alignment === 'string' ) {
			
			// if on display
			
			if ( this.isVisible ) {
				
				alignment = this.alignment;
				
				// if has align to
				
				if ( this.alignmentGuide instanceof _UIElement.Instance ) {
					
					parent = this.alignmentGuide.domElement;
					
				}
				else {
				
					parent = this.domElement.parent();
					
				}
				
				// get basic width and height of parent
				
				if ( parent.length ) {
					
					w = parent.width();
					h = parent.height();
					
				}
				else {
					
					w = shared.screenWidth;
					h = shared.screenHeight;
					
				}
				
				if ( alignment === 'center' ) {
					
					x = w * 0.5 - this.widthHalf;
					y = h * 0.5 - this.heightHalf;
					
				}
				else if ( alignment === 'lefttop' ) {
					
					x = this.spacingLeft;
					
					if ( this.alignmentOutside === true ) {
						
						y = -this.height - this.spacingTop;
						
					}
					else {
						
						y = this.spacingTop;
						
					}
					
				}
				else if ( alignment === 'righttop' ) {
					
					x = w - this.width - this.spacingRight;
					
					if ( this.alignmentOutside === true ) {
						
						y = -this.height - this.spacingTop;
						
					}
					else {
						
						y = this.spacingTop;
						
					}
					
				}
				else if ( alignment === 'leftbottom' ) {
					
					x = this.spacingLeft;
					
					if ( this.alignmentOutside === true ) {
						
						y = h + this.spacingBottom;
						
					}
					else {
						
						y = h - this.height - this.spacingBottom;
						
					}
					
				}
				else if ( alignment === 'rightbottom' ) {
					
					x = w - this.width - this.spacingRight;
					
					if ( this.alignmentOutside === true ) {
						
						y = h + this.spacingBottom;
						
					}
					else {
						
						y = h - this.height - this.spacingBottom;
						
					}
					
				}
				else if ( alignment === 'bottomcenter' ) {
					
					x = w * 0.5 - this.widthHalf;
					
					if ( this.alignmentOutside === true ) {
						
						y = h + this.spacingBottom;
						
					}
					else {
						
						y = h - this.height - this.spacingBottom;
						
					}
					
				}
				else if ( alignment === 'topcenter' ) {
					
					x = w * 0.5 - this.widthHalf;
					
					if ( this.alignmentOutside === true ) {
						
						y = -this.height - this.spacingTop;
						
					}
					else {
						
						y = this.spacingTop;
						
					}
					
				}
				else if ( alignment === 'leftcenter' ) {
					
					if ( this.alignmentOutside === true ) {
						
						x = -this.width - this.spacingLeft;
						
					}
					else {
					
						x = this.spacingLeft;
						
					}
					
					y = h * 0.5 - this.heightHalf;
					
				}
				else if ( alignment === 'rightcenter' ) {
					
					if ( this.alignmentOutside === true ) {
						
						x = w + this.spacingRight;
						
					}
					else {
					
						x = w - this.width - this.spacingRight;
						
					}
					
					y = h * 0.5 - this.heightHalf;
					
				}
				else if ( alignment === 'bottomright' ) {
					
					y = h - this.height - this.spacingBottom;
					
					if ( this.alignmentOutside === true ) {
						
						x = w + this.spacingRight;
						
					}
					else {
					
						x = w - this.width - this.spacingRight;
						
					}
					
				}
				else if ( alignment === 'bottomleft' ) {
					
					y = h - this.height - this.spacingBottom;
					
					if ( this.alignmentOutside === true ) {
						
						x = -this.width - this.spacingLeft;;
						
					}
					else {
						
						x = this.spacingLeft;
						
					}
					
				}
				else if ( alignment === 'topright' ) {
					
					y = this.spacingTop;
					
					if ( this.alignmentOutside === true ) {
						
						x = w + this.spacingRight;
						
					}
					else {
						
						x = w - this.width - this.spacingRight;
						
					}
					
				}
				else if ( alignment === 'topleft' ) {
					
					y = this.spacingTop;
					
					if ( this.alignmentOutside === true ) {
						
						x = -this.width - this.spacingLeft;
						
					}
					else {
						
						x = this.spacingLeft;
						
					}
					
				}
				
				// position
				
				this.set_position( x, y );
				
			}
			else {
				
				this.signalOnVisible.addOnce( this.align, this );
				
			}
			
		}
		
	}
	
	function align_once ( alignment, outside, guide ) {
		
		if ( this.isVisible ) {
			
			// align
			
			this.alignmentOutside = outside;
			this.alignmentGuide = guide;
			this.alignment = alignment;
			
			// reset
			
			this.alignmentOutside = this.alignmentGuide = this.alignment = false;
			
		}
		else {
			
			this.signalOnVisible.addOnce( function () {
				
				this.align_once( alignment, outside, guide );
				
			}, this );
			
		}
		
	}
	
	/*===================================================
    
    show / hide self
    
    =====================================================*/
	
	function show ( parameters ) {
		
		var me = this,
			domElement,
			parent,
			time,
			opacity,
			callback,
			context;
		//console.log( this.id, 'SHOW');
		// handle parameters
		
		parameters = parameters || {};
		
		domElement = parameters.domElement;
		
		parent = parameters.parent || this.parent || this.parentLast;
		
		time = main.is_number( parameters.time ) ? parameters.time : ( domElement ? 0 : this.timeShow );
		
		opacity = main.is_number( parameters.opacity ) ? parameters.opacity : ( domElement ? 1 : this.opacityShow );
		
		callback = parameters.callback;
		context = parameters.context;
		
		// if dom element passed
		
		if ( domElement ) {
			
			domElement.stop( true ).fadeTo( time, opacity, function () { on_show( domElement, callback, context ) } );
			
		}
		// else use own
		else {
			
			// set parent
			
			if ( this.parent !== parent ) {
				
				this.parent = parent;
				
				// show children
				
				this.show_children( { time: 0 } );
				
			}
			
			// showing
			
			this.showing = true;
				
			this.hidden = this.hiding = false;
			
			// override enabled
			
			this._enabledOverride = true;
			
			// show
			
			if ( this.domElement.css( 'opacity' ) !== opacity ) {
				
				this.domElement.stop( true ).fadeTo( time, opacity, function () { on_show( me, callback, context ) } );
				
			}
			else {
				
				on_show( me, callback, context );
				
			}
			
		}
		
	}
	
	function on_show ( target, callback, context ) {
		
		if ( target instanceof _UIElement.Instance ) {
			
			target.showing = false;
			
		}
		
		if ( typeof callback !== 'undefined' ) {
			
			callback.call( context );
			
		}
		
	}
	
	function hide ( parameters ) {
		
		var me = this,
			domElement,
			remove,
			time,
			opacity,
			callback,
			context;
		//console.log( this.id, 'HIDE' );
		// handle parameters
		
		parameters = parameters || {};
		
		domElement = parameters.domElement;
		
		remove = parameters.remove;
		
		time = main.is_number( parameters.time ) ? parameters.time : ( domElement ? 0 : this.timeHide );
		
		opacity = main.is_number( parameters.opacity ) ? parameters.opacity : 0;
		
		callback = parameters.callback;
		context = parameters.context;
		
		// if dom element passed
		
		if ( domElement ) {
			
			domElement.stop( true ).fadeTo( time, opacity, function () { on_hidden( domElement, callback, context, remove ); } );
			
		}
		// else use own
		else {
			
			// override enabled
			
			this._enabledOverride = false;
			
			// hiding
			
			this.showing = false;
			
			this.hiding = true;
			
			// hide
			
			if ( this.domElement.css( 'opacity' ) !== opacity ) {
				
				this.domElement.stop( true ).fadeTo( time, opacity, function () { on_hidden( me, callback, context, remove ); } );
				
			}
			else {
				
				on_hidden( this, callback, context, remove );
				
			}
			
		}
		
	}
	
	function on_hidden ( target, callback, context, remove ) {
		
		if ( target instanceof _UIElement.Instance ) {
			
			if ( remove === true ) {
				
				target.parent = undefined;
				
			}
			
			target.hidden = true;
			
			target.hiding = false;
			
		}
		else {
			
			if ( remove === true ) {
				
				target.detach();
				
			}
			
		}
		
		if ( typeof callback !== 'undefined' ) {
			
			callback.call( context );
			
		}
		
	}
	
	function pulse ( parameters ) {
		
		var timeShow,
			timeHide,
			opacityShow,
			opacityHide,
			callback,
			context;
		
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
				this.show( {
					remove: false,
					time: timeHide,
					opacity: opacityHide,
					callback: function () {
						
						if ( parameters.iterations === -1 || parameters.count < parameters.iterations ) {
							
							this.pulse( parameters );
							
						}
						
					},
					context: this
				} );
			},
			context: this
		} );
		
	}
	
	function pulse_stop () {
		
		this.domElement.stop( true );
		
	}
	
	/*===================================================
    
    show / hide children
    
    =====================================================*/
	
	function sort_children_by_order ( children ) {
		
		var me = this,
			childrenOrder = this.childrenOrder,
			ordera, orderb;
		
		children = children || this.children;
		
		children.sort( function ( a, b ) {
			
			ordera = childrenOrder[ a.id ];
			orderb = childrenOrder[ b.id ];
			
			if ( ordera === -1 ) {
				ordera = children.length;
			}
			if ( orderb === -1 ) {
				orderb = children.length;
			}
			
			return ordera - orderb;
			
		} );
		
		return children;
		
	}
	
	function get_child_order ( child ) {
		
		var order = this.childrenOrder[ child.id ];
		
		return main.is_number( order ) ? order : -1;
		
	}
	
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
			
			// sort children
			
			children = this.sort_children_by_order( children );
			
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
	
	function set_pointer_events ( state, override ) {
		
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
			
			child.set_pointer_events( state === false && override === true ? state : child.pointerEvents, override );
			
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
			"position": "absolute",
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
		
		var elementType,
			domElement,
			imgCallback,
			imgContext;
		
		// handle parameters
        
        parameters = parameters || {};
		
		// element type
		
		elementType = parameters.elementType || 'div';
		
		// dom element
		
		// image
		
		if ( elementType === 'img' && typeof parameters.src === 'string' ) {
			
			if ( this instanceof _UIElement.Instance ) {
				
				imgCallback = this.align;
				imgContext = this;
				
			}
			
			domElement = main.dom_generate_image( parameters.src, imgCallback, imgContext );
			
		}
		// all other types
		else {
			
			domElement = document.createElement( elementType );
			
		}
		
		// convert to jQuery
		
		domElement = $( domElement );
		
		// id
		
		domElement.attr( 'id', parameters.id );
		
		// html
		
		if ( typeof parameters.html !== 'undefined' ) {
			
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
			tooltip.maxWidth = main.is_number( tooltip.maxWidth ) ? tooltip.maxWidth : 'auto';
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
			
			propertySupported = propertyPrefixed;//_UIElement.str_from_camel( propertyPrefixed );
			
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
		//cssmap[ "display" ] = or[ "display" ] || "block";
		cssmap[ "transform-origin" ] = or[ "transform-origin" ] || "50% 50%";
		
		// state last
		
		theme.stateLast = {};
		
		return theme;
		
	}
	
	function theme_white ( overrides ) {
		
		var theme = this.themes.core.call( this, overrides ),
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
		disabled[ "background-color" ] = or[ "background-color" ] || "#bbbbbb";
		//disabled[ "background-image" ] = or[ "background-image" ] || "linear-gradient(top, #cccccc 30%, #aaaaaa 100%)";
		
		return theme;
		
	}
	
	function theme_green ( overrides ) {
		
		var theme = this.themes.white.call( this, overrides ),
			enabled,
			disabled,
			or;
		
		// enabled state
		
		or = overrides.enabled || {};
		
		enabled = theme.enabled = theme.enabled || {};
		
		enabled[ "background-color" ] = or[ "background-color" ] || "#5FEDA6";
		
		// disabled state
		
		or = overrides.disabled || {};
		
		disabled = theme.disabled = theme.disabled || {};
		
		disabled[ "background-color" ] = or[ "background-color" ] || "#48B57F";
		
		return theme;
		
	}
	
	function theme_red ( overrides ) {
		
		var theme = this.themes.white.call( this, overrides ),
			enabled,
			disabled,
			or;
		
		// enabled state
		
		or = overrides.enabled || {};
		
		enabled = theme.enabled = theme.enabled || {};
		
		enabled[ "background-color" ] = or[ "background-color" ] || "#ED8181";
		
		// disabled state
		
		or = overrides.disabled || {};
		
		disabled = theme.disabled = theme.disabled || {};
		
		disabled[ "background-color" ] = or[ "background-color" ] || "#BA6565";
		
		return theme;
		
	}
	
} (KAIOPUA) );