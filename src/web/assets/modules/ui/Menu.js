/*
 *
 * Menu.js
 * Handles collections of buttons.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/ui/Menu.js",
		_Menu = {},
		_UIElement,
		_Button,
		_MathHelper,
		sincos45 = Math.cos( Math.PI * 0.25 );
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Menu,
		requirements: [
			"assets/modules/ui/UIElement.js",
			"assets/modules/ui/Button.js",
			"assets/modules/utils/MathHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( uie, btn, mh ) {
		console.log('internal menu', _Menu);
		_UIElement = uie;
		_Button = btn;
		_MathHelper = mh;
		
		// instance
		
		_Menu.Instance = Menu;
		_Menu.Instance.prototype = new _Button.Instance();
		_Menu.Instance.prototype.constructor = _Menu.Instance;
		_Menu.Instance.prototype.supr = _Button.Instance.prototype;
		
		_Menu.Instance.prototype.show = show;
		_Menu.Instance.prototype.hide = hide;
		
		_Menu.Instance.prototype.show_children = show_children;
		_Menu.Instance.prototype.hide_children = hide_children;
		_Menu.Instance.prototype.child_arrange_dependent = child_arrange_dependent;
		_Menu.Instance.prototype.child_arrange_independent = child_arrange_independent;
		
		_Menu.Instance.prototype.open = open;
		_Menu.Instance.prototype.close = close;
		_Menu.Instance.prototype.close_self = close_self;
		_Menu.Instance.prototype.child_opening = child_opening;
		_Menu.Instance.prototype.child_closing = child_closing;
		
		_Menu.Instance.prototype.set_arrangement = set_arrangement;
		_Menu.Instance.prototype.update_arrangement = update_arrangement;
		_Menu.Instance.prototype.complete_arrangement = complete_arrangement;
		_Menu.Instance.prototype.get_children_for_arrangement = get_children_for_arrangement;
		_Menu.Instance.prototype.arrange_to_child = arrange_to_child;
		_Menu.Instance.prototype.arrange_line = arrange_line;
		_Menu.Instance.prototype.arrange_circle = arrange_circle;
		
		_Menu.Instance.prototype.themes = {};
		_Menu.Instance.prototype.themes.core = theme_core;
		
		Object.defineProperty( _Menu.Instance.prototype, 'buttonOpen', { 
			get : function () { return this._buttonOpen; },
			set : function ( button ) {
				
				var hadButtons = this.hasOpenCloseButtons;
				
				if ( button instanceof _Button.Instance ) {
					
					if ( typeof button.callback !== 'function' ) {
						
						button.callback = this.open;
						button.context = this;
						
					}
					
					if ( this._buttonOpen instanceof _Button.Instance ) {
						
						this.remove( this._buttonOpen );
						
					}
					
					this._buttonOpen = button;
					
					this.add( this._buttonOpen );
					
					if ( hadButtons === false && this.hasOpenCloseButtons ) {
						
						this.close();
						
					}
					
				}
			
			}
		} );
		
		Object.defineProperty( _Menu.Instance.prototype, 'buttonClose', { 
			get : function () { return this._buttonClose; },
			set : function ( button ) {
				
				var hadButtons = this.hasOpenCloseButtons;
				
				if ( button instanceof _Button.Instance ) {
					
					if ( typeof button.callback !== 'function' ) {
						
						button.callback = this.close;
						button.context = this;
						
					}
					
					if ( this._buttonClose instanceof _Button.Instance ) {
						
						this.remove( this._buttonClose );
						
					}
					
					this._buttonClose = button;
					
					this.add( this._buttonClose );
					
					if ( hadButtons === false && this.hasOpenCloseButtons ) {
						
						this.close();
						
					}
					
				}
			
			}
		} );
		
		Object.defineProperty( _Menu.Instance.prototype, 'hasOpenCloseButtons', { 
			get : function () { return this.buttonOpen instanceof _Button.Instance && this.buttonClose instanceof _Button.Instance; }
		} );
		
		Object.defineProperty( _Menu.Instance.prototype, 'isOpen', { 
			get : function () { return this._isOpen; },
			set : function ( state ) {
				
				if ( state === true ) {
					
					this.open();
					
				}
				else {
					
					this.close();
					
				}
				
			}
		} );
		
		Object.defineProperty( _Menu.Instance.prototype, 'arrangement', { 
			get : function () { return this._arrangement; },
			set : function ( type ) { this.set_arrangement( type ); }
		} );
		
	}
	
	/*===================================================
    
    ui
    
    =====================================================*/
	
	function Menu ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.elementType = parameters.elementType || 'section';
		
		parameters.text = parameters.image = undefined;
		
		parameters.pointerEvents = false;
		
		// prototype constructor
		
		_Button.Instance.call( this, parameters );
		
		// properties
		
		this.independent = [];
		
		this.openAlone = typeof parameters.openAlone === 'boolean' ? parameters.openAlone : true;
		
		// remove button events from self
		
		this.domElement.off( '.btn' );
		
		// create new buttons for self
		
		// open
		
		if ( parameters.buttonOpen instanceof _Button.Instance ) {
			
			this.buttonOpen = parameters.buttonOpen;
		
		}
		else if ( main.type( parameters.buttonOpen ) === 'object' ) {
			
			this.buttonOpen = new _Button.Instance( parameters.buttonOpen );
			
		}
		
		// close
		
		if ( parameters.buttonClose instanceof _Button.Instance ) {
			
			this.buttonClose = parameters.buttonClose;
		
		}
		else if ( main.type( parameters.buttonClose ) === 'object' ) {
			
			this.buttonClose = new _Button.Instance( parameters.buttonClose );
			
		}
		
		// if no close or open buttons, open automatically
		
		if ( this.buttonOpen instanceof _Button.Instance === false || this.buttonClose instanceof _Button.Instance === false ) {
			
			this.open();
			
		}
		// else set buttons properties and close
		else {
			
			this.close();
			
		}
		
		// set arrangement
		
		this.arrangement = parameters.arrangement || 'line';
        
	}
	
	/*===================================================
    
    show / hide
    
    =====================================================*/
	
	function show () {
		
		// proto
		
		_Menu.Instance.prototype.supr.show.apply( this, arguments );
		
		if ( this.isOpen ) {
			
			this.close( { time: 0 } );
			
		}
		
	}
	
	function hide () {
		
		// proto
		
		_Menu.Instance.prototype.supr.hide.apply( this, arguments );
		
		this.close();
		
	}
	
	/*===================================================
    
    children
    
    =====================================================*/
	
	function show_children ( parameters ) {
		
		// if closed, modify children to only include open button
		//console.log(this.id, 'menu show children, arguments', arguments );
		if ( this.hasOpenCloseButtons ) {
			
			// handle parameters
			
			parameters = parameters || {};
			
			// if closed, only show open button
			if ( this.isOpen === false ) {
				
				parameters.children = this.buttonOpen;
				
			}
			// if open, exclude open button from show
			else {
				
				parameters.excluding = [ this.buttonOpen ].concat( parameters.excluding || [] );
				
			}
		
		}
		
		// proto
		
		_Menu.Instance.prototype.supr.show_children.call( this, parameters );
		
		this.update_arrangement();
		
	}
	
	function hide_children ( parameters ) {
		
		//console.log(this.id, 'menu hide children, arguments', arguments );
		if ( this.hasOpenCloseButtons ) {
			
			// handle parameters
			
			parameters = parameters || {};
			
			// if closed, exclude open button from hide
			
			if ( this.isOpen === false ) {
				
				parameters.excluding = [ this.buttonOpen ].concat( parameters.excluding || [] );
				
			}
			
		}
		
		// proto
		
		_Menu.Instance.prototype.supr.hide_children.call( this, parameters );
		
		this.update_arrangement();
		
	}
	
	function child_arrange_dependent ( child ) {
		
		var index = this.independent.indexOf( child );
		
		if ( index !== -1 ) {
			
			this.independent.splice( index, 1 );
			
		}
		
	}
	
	function child_arrange_independent ( child ) {
		
		var index = this.independent.indexOf( child );
		
		if ( index === -1 ) {
			
			this.independent.push( child );
			
		}
		
	}
	
	/*===================================================
    
    open / close
    
    =====================================================*/
	
	function open ( time, callback, callbackContext ) {
		
		this._isOpen = true;
		//console.log( this.id, 'OPENING' );
		if ( this.hasOpenCloseButtons ) {
			
			if ( this.parent instanceof _Menu.Instance ) {
				
				this.parent.child_opening( this, time );
				
			}
			
			this.buttonOpen.hide( {
				remove: true, 
				time: time,
				callback: function () {
					
					this.show_children( { time: time } );
					
					this.buttonClose.show( { parent: this, time: time } );
					
					if ( typeof callback === 'function' ) {
						
						if ( typeof callbackContext !== 'undefined' ) {
							callback.call( callbackContext );
						}
						else {
							callback();
						}
						
					}
				
				},
				callbackContext: this
			} );
			
		}
		else {
			
			this.show_children( { time: time } );
			
		}
		
	}
	
	function close ( parameters, child ) {
		
		var i, l,
			children,
			subchild;
		
		parameters = parameters || {};
		
		child = child instanceof _UIElement.Instance ? child : this;
		
		children = this.copy_children_and_exclude( child.children, parameters.excluding );
		
		for ( i = 0, l = children.length; i < l; i++ ) {
			
			subchild = children[ i ];
			
			this.close( parameters, subchild );
			
		}
		
		if ( child instanceof _Menu.Instance ) {
			
			child.close_self( parameters.time );
			
		}
		
	}
	
	function close_self ( time ) {
		
		// only close if both open and close buttons are valid
		
		if ( this.hasOpenCloseButtons ) {
			console.log( this.id, 'CLOSING' );
			this._isOpen = false;
			
			this.hide_children( { time: time } );
			
			this.buttonClose.hide( {
				remove: true, 
				time: time,
				callback: function () {
					
					this.buttonOpen.show( { parent: this, time: time } );
					
					this.update_arrangement();
					
					if ( this.parent instanceof _Menu.Instance ) {
						
						this.parent.child_closing( this, time );
						
					}
					
				},
				callbackContext: this
			} );
			
		}
		
	}
	
	function child_opening ( child, time ) {
		
		this.childOpen = child;
		
		if ( child.openAlone ) {
			console.log( this.id, ' child, ', child.id, ', OPENING solo' );
			this.childrenShowingOrder = this.get_children_showing();
			
			this.hide_children( { excluding: child, time: time } );
			
		}
		else {
			console.log( this.id, ' child, ', child.id, ', OPENING with others' );
			this.close( { excluding: child, time: time } );
			
		}
		
	}
	
	function child_closing ( child, time ) {
		
		if ( this.isOpen && this.childOpen === child && this.childrenShowingOrder ) {
			console.log( this.id, ' child, ', child.id, ', CLOSING' );
			this.show_children( { children: this.childrenShowingOrder, time: time } );
			
			this.childrenShowingOrder = undefined;
			
			this.childOpen = undefined;
			
		}
		
	}
	
	/*===================================================
    
    arrangements
    
    =====================================================*/
	
	function set_arrangement( type, parameters ) {
		
		this._arrangement = type;
		this.arrangementParameters = parameters;
		
		// set by type, default to line
		
		if ( this.arrangement === 'circle' ) {
			
			this.arrange_circle();
			
		}
		else if ( this.arrangement === 'line' ) {
			
			this.arrange_line();
			
		}
		
	}
	
	function update_arrangement () {
		
		if ( this.get_children_showing().length > 0 ) {
			
			this.set_arrangement( this.arrangement, this.arrangementParameters );
			
		}
		
	}
	
	function get_children_for_arrangement () {
		
		var i, l,
			child,
			showing = this.get_children_showing(),
			arranging = [];
		
		for ( i = 0, l = showing.length; i < l; i++ ) {
			
			child = showing[ i ];
			
			// if child is not aligned or independent in menu
			
			if ( typeof child.alignment !== 'string' && this.independent.indexOf( child ) === -1 ) {
				
				arranging.push( child );
				
			}
			
		}
		
		return arranging;
	}
	
	function complete_arrangement () {
		
		var i, l,
			child;
		
		if ( this.parent instanceof _Menu.Instance ) {
			
			this.parent.update_arrangement();
			
		}
		
		this.align();
		
		children = this.get_children_showing();
		
		for ( i = 0, l = children.length; i < l; i++ ) {
			
			child = children[ i ];
			
			child.align();
			
		}
		
	}
	
	function arrange_to_child ( child ) {
		
		this.width = this.spacingLeft + this.spacingRight;
		this.height = this.spacingTop + this.spacingBottom;
		
		if ( child instanceof _UIElement.Instance ) {
		
			this.width += child.outerWidth;
			this.height += child.outerHeight;
			
			child.set_position( child.spacingLeft, child.spacingTop );
			
		}
		
		this.complete_arrangement();
		
	}
	
	function arrange_line ( parameters ) {
		
		var i, l, ib,
			children,
			degrees,
			circular,
			childrenPerLine,
			indexStart,
			widthTotal,
			heightTotal,
			bounds,
			theta,
			indexEnd,
			child,
			cw, ch,
			rw, rh,
			thetaCos,
			thetaSin,
			thetaCosAbs,
			thetaSinAbs,
			thetaCosRnd,
			thetaSinRnd,
			x, y,
			xmax = 0, xmin = 0, 
			ymax = 0, ymin = 0,
			multiline = false;
		
		// init persistant info
		// can only copy certain parameters due to recursion
		
		if ( this._arrangement !== 'line' || main.type( this.arrangementParameters ) !== 'object' ) {
			
			this._arrangement = 'line';
			this.arrangementParameters = {};
			
		}
		
		// handle parameters
		
		parameters = parameters || {};
		
		degrees = this.arrangementParameters.degrees = parameters.degrees = _MathHelper.degree_between_180( parameters.degrees || this.arrangementParameters.degrees || 0 );
		circular = this.arrangementParameters.circular = parameters.circular = ( typeof parameters.circular === 'boolean' ? parameters.circular : ( typeof this.arrangementParameters.circular === 'boolean' ? this.arrangementParameters.circular : false ) );
		childrenPerLine = this.arrangementParameters.childrenPerLine = parameters.childrenPerLine;
		children = parameters.children = parameters.children || this.get_children_for_arrangement();
		
		// if only 1 child, skip arrange and fit to child
		
		if ( children.length <= 1 ) {
			
			this.arrange_to_child( children[ 0 ] );
			
		}
		else {
			
			// theta passed in degrees
			
			theta = _MathHelper.degree_to_rad( degrees );
			thetaCos = Math.cos(theta);
			thetaSin = Math.sin(theta);
			
			// if children per line passed as a string suggesting vertical or horizontal preference
			
			if ( childrenPerLine === 'v' ) {
				
				childrenPerLine = Math.floor( Math.sqrt( children.length ) );
				
			}
			else if ( childrenPerLine === 'h' ) {
				
				childrenPerLine = Math.ceil( Math.sqrt( children.length ) );
				
			}
			
			// if splitting into multiple lines
			if ( main.is_number( childrenPerLine ) && childrenPerLine > 0 && childrenPerLine < children.length ) {
				
				multiline = true;
				
			}
			// else all children on one line
			else {
				
				childrenPerLine = children.length;
				
			}
			
			indexStart = parameters.indexStart = _MathHelper.clamp( ( main.is_number( parameters.indexStart ) ? parameters.indexStart : 0 ), 0, children.length );
			
			widthTotal = main.is_number( parameters.widthTotal ) ? parameters.widthTotal : 0;
			heightTotal = main.is_number( parameters.heightTotal ) ? parameters.heightTotal : 0;
			
			if ( main.type( parameters.bounds ) !== 'object' ) {
				
				bounds = parameters.bounds = {
					x: [],
					rx: [],
					y: [],
					ry: []
				};
				
				for ( i = 0, l = childrenPerLine; i < l; i++ ) {
					
					bounds.x[ i ] = bounds.rx[ i ] = bounds.y[ i ] = bounds.ry[ i ] = 0;
					
				}
				
			}
			else {
				
				bounds = parameters.bounds;
				
			}
			
			indexEnd = Math.min( children.length, indexStart + childrenPerLine );
			
			// if arranging for rectangular children
			
			if ( circular !== true ) {
				
				thetaCosAbs = Math.abs( thetaCos );
				thetaSinAbs = Math.abs( thetaSin );
				
				thetaCosRnd = thetaCosAbs > thetaSinAbs ?  Math.round( thetaCos ) : ( thetaCos / sincos45 );
				thetaSinRnd = thetaSinAbs > thetaCosAbs ?  Math.round( thetaSin ) : ( thetaSin / sincos45 );
				
			}
			
			// arrange all children in line
			
			for ( i = indexStart, l = indexEnd; i < l; i++ ) {
				
				child = children[ i ];
				
				cw = child.outerWidth;
				ch = child.outerHeight;
				
				ib = i - indexStart;
				
				if ( circular === true ) {
					
					rw = cw * thetaCos;
					rh = ch * thetaSin;
				
				}
				else {
					
					rw = _MathHelper.max_magnitude( cw * thetaCos, cw * thetaCosRnd );
					rh = _MathHelper.max_magnitude( ch * thetaSin, ch * thetaSinRnd );
					
				}
				
				child._x = bounds.rx[ ib - 1 ] || bounds.rx[ ib ];
				child._y = bounds.ry[ ib - 1 ] || bounds.ry[ ib ];
				
				bounds.x[ ib ] = child.x + cw;
				bounds.y[ ib ] = child.y + ch;
				bounds.rx[ ib ] = child.x + rw;
				bounds.ry[ ib ] = child.y + rh;
				
				// max/min
				
				if ( bounds.x[ ib ] > xmax ) {
					xmax = bounds.x[ ib ];
				}
				if ( child.x < xmin ) {
					xmin = child.x;
				}
				if ( bounds.y[ ib ] > ymax ) {
					ymax = bounds.y[ ib ];
				}
				if ( child.y < ymin ) {
					ymin = child.y;
				}
				
			}
			// set this dimensions
			
			widthTotal = parameters.widthTotal = xmax - xmin;
			heightTotal = parameters.heightTotal = ymax - ymin;
			
			this.width = widthTotal + this.spacingLeft + this.spacingRight;
			this.height = heightTotal + this.spacingTop + this.spacingBottom;
			
			// set positions of children
			
			for ( i = indexStart, l = indexEnd; i < l; i++ ) {
				
				child = children[ i ];
				
				child.set_position( child.x + child.spacingLeft + this.spacingLeft - xmin, child.y + child.spacingTop + this.spacingTop - ymin );
				
			}
			
			// if is continuing multiline
			
			if ( multiline === true && indexEnd < children.length ) {
				
				parameters.indexStart = indexEnd;
				
				if ( ( degrees < 45 && degrees > -45 ) || degrees > 135 || degrees < -135 ) {
					
					for ( i = 0, l = childrenPerLine; i < l; i++ ) {
						bounds.x[ i ] = 0;
						bounds.y[ i ] = bounds.y[ 0 ];
						bounds.rx[ i ] = 0;
						bounds.ry[ i ] = bounds.y[ 0 ];	
					}
					
				}
				else {
					
					for ( i = 0, l = childrenPerLine; i < l; i++ ) {
						bounds.x[ i ] = bounds.x[ 0 ];
						bounds.y[ i ] = 0;
						bounds.rx[ i ] = bounds.x[ 0 ];
						bounds.ry[ i ] = 0;
					}
					
				}
				
				this.arrange_line( parameters );
				
			}
			// finished
			else {
				
				this.complete_arrangement();
				
			}
			
		}
		
	}
	
	function arrange_circle ( parameters ) {
		
		var i, l,
			degreeStart,
			degrees,
			degreesAutoFit = false,
			direction,
			radius,
			spaceBySize,
			forceShape,
			children,
			radians,
			thetaStart,
			radiansPer,
			radiansActual,
			theta,
			thetaSin,
			thetaCos,
			circumference = 0,
			child,
			cw, ch,
			cwh, chh,
			size,
			xmax = 0, xmin = 0, 
			ymax = 0, ymin = 0,
			widthTotal,
			heightTotal;
		
		// init persistant info
		// can only copy certain parameters due to recursion
		
		if ( this._arrangement !== 'circle' || main.type( this.arrangementParameters ) !== 'object' ) {
			
			this._arrangement = 'circle';
			this.arrangementParameters = {};
			
		}
		
		// handle parameters
		
		parameters = parameters || {};
		
		degreeStart = this.arrangementParameters.degreeStart = parameters.degreeStart = main.is_number( parameters.degreeStart ) ? parameters.degreeStart : ( main.is_number( this.arrangementParameters.degreeStart ) ? this.arrangementParameters.degreeStart : 180 );
		degrees = this.arrangementParameters.degrees = parameters.degrees = main.is_number( parameters.degrees ) ? parameters.degrees : this.arrangementParameters.degrees;
		degreesAutoFit = this.arrangementParameters.degreesAutoFit = parameters.degreesAutoFit = typeof parameters.degreesAutoFit === 'boolean' ? parameters.degreesAutoFit : ( typeof this.arrangementParameters.degreesAutoFit === 'boolean' ? this.arrangementParameters.degreesAutoFit : false );
		direction = this.arrangementParameters.direction = parameters.direction = main.is_number( parameters.direction ) ? parameters.direction : ( main.is_number( this.arrangementParameters.direction ) ? this.arrangementParameters.direction : 1 );
		radius = this.arrangementParameters.radius = parameters.radius = main.is_number( parameters.radius ) ? parameters.radius : this.arrangementParameters.radius;
		spaceBySize = this.arrangementParameters.spaceBySize = parameters.spaceBySize = typeof parameters.spaceBySize === 'boolean' ? parameters.spaceBySize : this.arrangementParameters.spaceBySize;
		forceShapeOnOpen = this.arrangementParameters.forceShapeOnOpen = parameters.forceShapeOnOpen = typeof parameters.forceShapeOnOpen === 'boolean' ? parameters.forceShapeOnOpen : this.arrangementParameters.forceShapeOnOpen;
		children = parameters.children = parameters.children || this.get_children_for_arrangement();
		
		if ( children.length <= 1 && ( forceShapeOnOpen !== true || ( this.isOpen !== true && this.buttonClose.hidden === true ) ) ) {
			
			this.arrange_to_child( children[ 0 ] );
			
		}
		else {
			
			// default theta start to 180 degrees ( left side )
			
			thetaStart = _MathHelper.degree_to_rad( degreeStart % 360 );
			
			// if degrees not passed
			
			if ( main.is_number( degrees ) !== true || degrees === 0 ) {
				
				// if radius passed, determine exact degrees to fit all children
				
				if ( degreesAutoFit && radius >= 0 ) {
					
					radians = 0;
					
					for ( i = 0, l = children.length; i < l; i++ ) {
						
						child = children[ i ];
						
						radians += 2 * Math.asin( Math.max( child.outerWidth, child.outerHeight ) / ( 2 * radius ) );
						
					}
					
					degrees = _MathHelper.rad_to_degree( radians );
					
					// if children would go around more than once
					// clamp to once and zero radius to auto-fit of radius
					
					if ( Math.abs( degrees ) > 360 ) {
						
						degrees = 360;
						radius = 0;
						
					}
					
				}
				// else default to 360
				else {
					
					degrees = 360;
					
				}
				
			}
			
			// add an additional subtending angle to degrees, up to +/- 360, to ensure children end at expected degrees
			
			degrees = _MathHelper.clamp( degrees + ( degreesAutoFit ? 0 : ( degrees / Math.max( children.length - 1, 1 ) ) ), -360, 360 );
			
			radians = _MathHelper.degree_to_rad( degrees ) * direction;
			
			// if radius not passed, determine exact to fit all children
			
			if ( main.is_number( radius ) !== true || radius <= 0 ) {
				
				radiansPer = radians / children.length;
				
				// find circumference from children
				// each addition to circumference is ( radius based on current child size ) * ( radians per child )
				// ( this assumes each child is roughly equal size, I think )
				
				for ( i = 0, l = children.length; i < l; i++ ) {
					
					child = children[ i ];
					
					circumference += ( Math.max( child.outerWidth, child.outerHeight ) / ( 2 * Math.sin( radiansPer / 2 ) ) ) * radiansPer;
					
				}
				
				radius = circumference / radians;
				
			}
			else {
				
				circumference = 2 * Math.PI * radius;
				
			}
			
			// ensure circumference is positive
			
			if ( circumference < 0 ) {
			
				circumference = Math.abs( circumference );
				
			}
			
			// ensure radius is positive
			
			if ( radius < 0 ) {
			
				radius = Math.abs( radius );
				
			}
			
			// arrange all children in circle from theta start to theta end
			
			for ( i = 0, l = children.length; i < l; i++ ) {
				
				child = children[ i ];
				
				cw = child.outerWidth;
				ch = child.outerHeight;
				
				// get theta based on size
				// size is based on biggest dimension (because we dont have theta yet)
				
				if ( spaceBySize === true ) {
					
					size = Math.max( cw, ch );
					
					theta = thetaStart + ( size / radius );
					
				}
				// else space evenly
				else {
					
					theta = thetaStart + radians * ( i / l );//( l - 1 ) );
					
				}
				
				thetaSin = Math.sin( theta );
				thetaCos = Math.cos( theta );
				
				// temporarily directly modify child x/y
				
				child._x = radius + radius * thetaCos;
				child._y = radius + radius * thetaSin;
				
				// max/min
				
				if ( child.x + cw > xmax ) {
					xmax = child.x + cw;
				}
				if ( child.x < xmin ) {
					xmin = child.x;
				}
				if ( child.y + ch > ymax ) {
					ymax = child.y + ch;
				}
				if ( child.y < ymin ) {
					ymin = child.y;
				}
				
			}
			
			// set this dimensions and positions of all children
			
			this.width = radius * 2 + this.spacingLeft + this.spacingRight;
			this.height = radius * 2 + this.spacingTop + this.spacingBottom;
			
			for ( i = 0, l = children.length; i < l; i++ ) {
				
				child = children[ i ];
				
				child.set_position( child.x + child.spacingLeft + this.spacingLeft - child.outerWidthHalf, child.y + child.spacingTop + this.spacingTop - child.outerHeightHalf );
				
			}
			
			// finished
			
			this.complete_arrangement();
			
		}
		
	}
	
	/*===================================================
    
    themes
    
    =====================================================*/
	
	function theme_core ( overrides ) {
		
		var theme,
			cssmap,
			or;
		
		// proto
		
		theme = _Menu.Instance.prototype.supr.themes.core.call( this, overrides );
		
		// cssmap
		
		or = overrides.cssmap || {};
		
		cssmap = theme.cssmap = theme.cssmap || {};
		
		cssmap[ "cursor" ] = or[ "cursor" ] || "default";
		cssmap[ "background-color" ] = or[ "background-color" ] || "transparent";
		cssmap[ "background-image" ] = or[ "background-image" ] || "none";
		cssmap[ "box-shadow" ] = or[ "box-shadow" ] || "none";
		cssmap[ "border-radius" ] = or[ "border-radius" ] || "0";
		
		theme.enabled = or.enabled || {};
		theme.disabled = or.enabled || {};
		theme.enter = or.enter || {};
		theme.leave = or.leave  || {};
		
		return theme;
		
	}
	
} (KAIOPUA) );