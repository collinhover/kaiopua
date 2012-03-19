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
		
		_Menu.Instance.prototype.hide_children = hide_children;
		_Menu.Instance.prototype.child_showing = child_showing;
		_Menu.Instance.prototype.child_hidden = child_hidden;
		_Menu.Instance.prototype.child_arrange_dependent = child_arrange_dependent;
		_Menu.Instance.prototype.child_arrange_independent = child_arrange_independent;
		
		_Menu.Instance.prototype.open = open;
		_Menu.Instance.prototype.close = close;
		
		_Menu.Instance.prototype.set_arrangement = set_arrangement;
		_Menu.Instance.prototype.update_arrangement = update_arrangement;
		_Menu.Instance.prototype.arrange_line = arrange_line;
		_Menu.Instance.prototype.arrange_circle = arrange_circle;
		_Menu.Instance.prototype.align_cascade = align_cascade;
		
		_Menu.Instance.prototype.themes = {};
		_Menu.Instance.prototype.themes.core = theme_core;
		
		Object.defineProperty( _Menu.Instance.prototype, 'buttonOpen', { 
			get : function () { return this._buttonOpen; },
			set : function ( button ) {
				
				var hadButtons = this.hasOpenCloseButtons;
				
				if ( button instanceof _Button.Instance ) {
					
					button.callback = this.open;
					button.context = this;
					
					this._buttonOpen = button;
					
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
					
					button.callback = this.close;
					button.context = this;
					
					this._buttonClose = button;
					
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
		
		parameters.pointerEvents = true;
		
		// prototype constructor
		
		_Button.Instance.call( this, parameters );
		
		// properties
		
		this.independent = [];
		
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
    
    show
    
    =====================================================*/
	
	function show () {
		
		// proto
		
		_Menu.Instance.prototype.supr.show.apply( this, arguments );
		
		// arrangement
		
		this.update_arrangement();
		
	}
	
	/*===================================================
    
    children
    
    =====================================================*/
	
	function hide_children ( children, excluding ) {
		
		var i, l,
			child,
			index;
		
		excluding = main.ensure_array( excluding );
		
		// if closed, modify children to hide and remove open button
		
		if ( this.isOpen !== true ) {
			
			excluding.push( this.buttonOpen );
			
		}
		
		// proto
		
		_Menu.Instance.prototype.supr.hide_children.call( this, children, excluding );
		
	}
	
	function child_showing ( child ) {
		
		// proto
		
		_Menu.Instance.prototype.supr.child_showing.apply( this, arguments );
		
		// if not open, hide all
		
		if ( this.isOpen === false && child !== this.buttonOpen ) {
			
			this.close( 0 );
			
		}
		else if ( this.isVisible ) {
			
			// set arrangement
			
			this.update_arrangement();
			
		}
		
	}
	
	function child_hidden ( child ) {
		
		// proto
		
		_Menu.Instance.prototype.supr.child_hidden.apply( this, arguments );
		
		if ( this.isVisible ) {
			
			// set arrangement
			
			this.update_arrangement();
			
			if ( this.parent instanceof _Menu.Instance && ( child === this.buttonOpen || child === this.buttonClose ) ) {
				
				this.parent.update_arrangement();
				
			}
			
		}
		
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
	
	function open ( time ) {
		
		this._isOpen = true;
		
		if ( this.buttonOpen instanceof _Button.Instance && this.buttonClose instanceof _Button.Instance ) {
			
			if ( this.parent instanceof _Menu.Instance ) {
				
				this.parentChildrenShowing = this.parent.childrenShowing.slice( 0 );
				
				this.parent.hide_children( undefined, this, time );
				
			}
			
			this.buttonOpen.hide( true, time, 0, function () {
				
				this.show_children( undefined, this.buttonClose, time );
				
				this.buttonClose.show( this, time );
				
			}, this );
			
		}
		else {
			
			this.show_children( undefined, undefined, time );
			
		}
		
	}
	
	function close ( time ) {
		
		// only close if both open and close buttons are valid
		
		if ( this.buttonOpen instanceof _Button.Instance && this.buttonClose instanceof _Button.Instance ) {
			
			this._isOpen = false;
			
			this.hide_children( undefined, this.buttonClose, time );
			
			this.buttonClose.hide( true, time, 0, function () {
				
				this.buttonOpen.show( this, time );
				
				if ( this.parent instanceof _Menu.Instance ) {
					
					this.parent.show_children( this.parentChildrenShowing, undefined, time );
					
				}
				
			}, this );
			
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
		
		if ( this.childrenShowing.length > 0 ) {
			
			this.set_arrangement( this.arrangement, this.arrangementParameters );
			
		}
		
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
		
		this._arrangement = 'line';
		this.arrangementParameters = this.arrangementParameters || {};
		
		// handle parameters
		
		parameters = parameters || {};
		
		degrees = this.arrangementParameters.degrees = parameters.degrees = _MathHelper.degree_between_180( parameters.degrees || this.arrangementParameters.degrees || 0 );
		circular = this.arrangementParameters.circular = parameters.circular = ( typeof parameters.circular === 'boolean' ? parameters.circular : ( typeof this.arrangementParameters.circular === 'boolean' ? this.arrangementParameters.circular : false ) );
		childrenPerLine = this.arrangementParameters.childrenPerLine = parameters.childrenPerLine;
		children = parameters.children;
		
		if ( main.type( children ) !== 'array' ) {
			
			parameters.children = children = [];
			
			for ( i = 0, l = this.childrenShowing.length; i < l; i++ ) {
				
				child = this.childrenShowing[ i ];
				
				// if child is not aligned or independent in menu
				
				if ( typeof child.alignment !== 'string' && this.independent.indexOf( child ) === -1 ) {
					
					children.push( child );
					
				}
				
			}
			
		}
		
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
			
			this.align_cascade();
			
		}
		
	}
	
	function arrange_circle ( parameters ) {
		
		var i, l,
			degreeStart,
			degrees,
			radius,
			spaceBySize,
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
			size,
			xmax = 0, xmin = 0, 
			ymax = 0, ymin = 0,
			widthTotal,
			heightTotal;
		
		// init persistant info
		// can only copy certain parameters due to recursion
		
		this._arrangement = 'circle';
		this.arrangementParameters = this.arrangementParameters || {};
		
		// handle parameters
		
		parameters = parameters || {};
		
		degreeStart = this.arrangementParameters.degreeStart = parameters.degreeStart = main.is_number( parameters.degreeStart ) ? parameters.degreeStart : ( main.is_number( this.arrangementParameters.degreeStart ) ? this.arrangementParameters.degreeStart : 180 );
		degrees = this.arrangementParameters.degrees = parameters.degrees = main.is_number( parameters.degrees ) ? parameters.degrees : ( main.is_number( this.arrangementParameters.degrees ) ? this.arrangementParameters.degrees : 360 );
		radius = this.arrangementParameters.radius = parameters.radius = main.is_number( parameters.radius ) ? parameters.radius : this.arrangementParameters.radius;
		spaceBySize = this.arrangementParameters.spaceBySize = parameters.spaceBySize = typeof parameters.spaceBySize === 'boolean' ? parameters.spaceBySize : this.arrangementParameters.spaceBySize;
		children = parameters.children;
		
		if ( main.type( children ) !== 'array' ) {
			
			parameters.children = children = [];
			
			for ( i = 0, l = this.childrenShowing.length; i < l; i++ ) {
				
				child = this.childrenShowing[ i ];
				
				// if child is not aligned or independent in menu
				
				if ( typeof child.alignment !== 'string' && this.independent.indexOf( child ) === -1 ) {
					
					children.push( child );
					
				}
				
			}
			
		}
		
		// default theta start to 180 degrees ( left side )
		
		thetaStart = _MathHelper.degree_to_rad( degreeStart % 360 );
		
		// add an additional subtending angle to degrees, up to +/- 360, to ensure children end at expected degrees
		
		degrees = _MathHelper.clamp( degrees + ( degrees / (children.length - 1) ), -360, 360 );
		
		radians = _MathHelper.degree_to_rad( degrees );
		
		// if radius not passed, determine exact to fit all children
		
		if ( main.is_number( radius ) !== true || radius === 0 ) {
			
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
			
			child._x = radius * thetaCos;
			child._y = radius * thetaSin;
			
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
		
		// set this dimensions
		
		widthTotal = xmax - xmin;
		heightTotal = ymax - ymin;
		
		this.width = widthTotal + this.spacingLeft + this.spacingRight;
		this.height = heightTotal + this.spacingTop + this.spacingBottom;
		
		// set positions of all children
		
		for ( i = 0, l = children.length; i < l; i++ ) {
			
			child = children[ i ];
			
			child.set_position( child.x + child.spacingLeft + this.spacingLeft - xmin, child.y + child.spacingTop + this.spacingTop - ymin );
			
		}
		
		// finished
		
		this.align_cascade();
		
	}
	
	function align_cascade () {
		
		var i, l,
			child;
		
		this.align();
		
		for ( i = 0, l = this.childrenShowing.length; i < l; i++ ) {
			
			child = this.childrenShowing[ i ];
			
			child.align();
			
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