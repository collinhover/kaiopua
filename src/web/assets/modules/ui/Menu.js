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
		
		_Menu.Instance.prototype.append_to = append_to;
		
		_Menu.Instance.prototype.open = open;
		_Menu.Instance.prototype.close = close;
		
		_Menu.Instance.prototype.show_children = show_children;
		_Menu.Instance.prototype.hide_children = hide_children;
		
		_Menu.Instance.prototype.arrange_line = arrange_line;
		_Menu.Instance.prototype.arrange_circle = arrange_circle;
		
		_Menu.Instance.prototype.themes = {};
		_Menu.Instance.prototype.themes.core = theme_core;
		
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
		
	}
	
	/*===================================================
    
    ui
    
    =====================================================*/
	
	function Menu ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.elementType = parameters.elementType || 'section';
		
		parameters.text = parameters.image = undefined;
		
		parameters.pointerEventsIgnore = true;
		
		// prototype constructor
		
		_Button.Instance.call( this, parameters );
		
		// remove button events from self
		
		this.domElement.off( '.btn' );
		
		// create new buttons for self
		console.log( this.id, 'menu parameters', parameters);
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
		
        
	}
	
	/*===================================================
    
    children
    
    =====================================================*/
	
	function append_to () {
		
		// proto
		
		_Menu.Instance.prototype.supr.append_to.apply( this, arguments );
		
		// if closed remove all
		
		if ( this.isOpen !== true ) {
			
			this.close();
			
		}
		
	}
	
	/*===================================================
    
    open / close
    
    =====================================================*/
	
	function open () {
		console.log( this.id, 'open!');
		this._isOpen = true;
			
		this.show_children();
		
	}
	
	function close () {
		
		// only close if both open and close buttons are valid
		
		if ( this.buttonOpen instanceof _Button.Instance && this.buttonClose instanceof _Button.Instance ) {
			console.log( this.id, 'close!');
			this._isOpen = false;
			
			this.hide_children();
			
			//this.domElement.append( this.buttonOpen.domElement );
			
		}
		
	}
	
	/*===================================================
    
    show / hide children
    
    =====================================================*/
	
	function show_children ( time, opacity, callback, callbackContext ) {
		
		var i, l,
			child;
		
		for ( i = 0, l = this.children.length; i < l; i++ ) {
			
			child = this.children[ i ];
			
			if ( child instanceof _UIElement.Instance ) {
				
				child.show( this, time, opacity, callback, callbackContext );
				
			}
			else {
				
				this.show( this, time, opacity, callback, callbackContext, child );
				
			}
			
		}
		
	}
	
	function hide_children ( time, opacity, callback, callbackContext ) {
		
		var i, l,
			child;
		
		for ( i = 0, l = this.children.length; i < l; i++ ) {
			
			child = this.children[ i ];
			
			if ( child instanceof _UIElement.Instance ) {
				
				child.hide( false, time, opacity, callback, callbackContext );
				
			}
			else {
				
				this.hide( false, time, opacity, callback, callbackContext, child );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    arrangements
    
    =====================================================*/
	
	function arrange_line ( degrees, circular, childrenPerLine, indexStart, widthTotal, heightTotal, bounds ) {
		
		var i, l, ib,
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
		
		// theta passed in degrees
		
		degrees = _MathHelper.degree_between_180( degrees );
		theta = main.is_number( degrees ) ? _MathHelper.degree_to_rad( degrees ) : 0;
		thetaCos = Math.cos(theta);
		thetaSin = Math.sin(theta);
		
		// index to start arranging
		
		indexStart = _MathHelper.clamp( ( main.is_number( indexStart ) ? indexStart : 0 ), 0, this.children.length );
		
		// if children per line passed as a string suggesting vertical or horizontal preference
		
		if ( childrenPerLine === 'v' ) {
			
			childrenPerLine = Math.floor( Math.sqrt( this.children.length ) );
			
		}
		else if ( childrenPerLine === 'h' ) {
			
			childrenPerLine = Math.ceil( Math.sqrt( this.children.length ) );
			
		}
		
		// if splitting into multiple lines
		if ( main.is_number( childrenPerLine ) && childrenPerLine > 0 && childrenPerLine < this.children.length ) {
			
			multiline = true;
			
		}
		// else all children on one line
		else {
			
			childrenPerLine = this.children.length;
			
		}
		
		indexEnd = Math.min( this.children.length, indexStart + childrenPerLine );
		
		// dimensions and bounds
		
		widthTotal = main.is_number( widthTotal ) ? widthTotal : 0;
		heightTotal = main.is_number( heightTotal ) ? heightTotal : 0;
		
		if ( main.type( bounds ) !== 'object' ) {
			
			bounds = {
				x: [],
				rx: [],
				y: [],
				ry: []
			};
			
			for ( i = 0, l = childrenPerLine; i < l; i++ ) {
				
				bounds.x[ i ] = bounds.rx[ i ] = bounds.y[ i ] = bounds.ry[ i ] = 0;
				
			}
			
		}
		
		// if arranging for rectangular children
		
		if ( circular !== true ) {
			
			thetaCosAbs = Math.abs( thetaCos );
			thetaSinAbs = Math.abs( thetaSin );
			
			thetaCosRnd = thetaCosAbs > thetaSinAbs ?  Math.round( thetaCos ) : ( thetaCos / sincos45 );
			thetaSinRnd = thetaSinAbs > thetaCosAbs ?  Math.round( thetaSin ) : ( thetaSin / sincos45 );
			
		}
		
		// arrange all children in line
		
		for ( i = indexStart, l = indexEnd; i < l; i++ ) {
			
			child = this.children[ i ];
			
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
		
		widthTotal = xmax - xmin;
		heightTotal = ymax - ymin;
		
		this.width = widthTotal + this.spacingLeft + this.spacingRight;
		this.height = heightTotal + this.spacingTop + this.spacingBottom;
		
		// set positions of children
		
		for ( i = indexStart, l = indexEnd; i < l; i++ ) {
			
			child = this.children[ i ];
			
			child.set_position( child.x + child.spacingLeft + this.spacingLeft - xmin, child.y + child.spacingTop + this.spacingTop - ymin );
			
		}
		
		// if is multiline
		
		if ( multiline === true && indexEnd < this.children.length ) {
			
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
			
			this.arrange_line( degrees, circular, childrenPerLine, indexEnd, widthTotal, heightTotal, bounds );
			
		}
		
	}
	
	function arrange_circle ( degreeStart, degrees, radius, spaceBySize ) {
		
		var i, l,
			degreesMax = 360 - ( 360 / this.children.length ),
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
		
		// default theta start to 180 degrees ( left side )
		
		thetaStart = main.is_number( degreeStart ) ? _MathHelper.degree_to_rad( degreeStart % 360 ) : Math.PI;
		
		if ( main.is_number( degrees ) !== true ) {
			
			degrees = 360;
			
		}
		
		// add an additional subtending angle to degrees, up to +/- 360, to ensure children end at expected degrees
		
		degrees = _MathHelper.clamp( degrees + ( degrees / (this.children.length - 1) ), -360, 360 );
		
		radians = _MathHelper.degree_to_rad( degrees );
		
		// if radius not passed, determine exact to fit all children
		
		if ( main.is_number( radius ) !== true || radius === 0 ) {
			
			radiansPer = radians / this.children.length;
			
			// find circumference from children
			// each addition to circumference is ( radius based on current child size ) * ( radians per child )
			// ( this assumes each child is roughly equal size, I think )
			
			for ( i = 0, l = this.children.length; i < l; i++ ) {
				
				child = this.children[ i ];
				
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
		
		for ( i = 0, l = this.children.length; i < l; i++ ) {
			
			child = this.children[ i ];
			
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
		
		for ( i = 0, l = this.children.length; i < l; i++ ) {
			
			child = this.children[ i ];
			
			child.set_position( child.x + child.spacingLeft + this.spacingLeft - xmin, child.y + child.spacingTop + this.spacingTop - ymin );
			
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