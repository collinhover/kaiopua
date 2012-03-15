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
		
		_Menu.Instance.prototype.arrange_line = arrange_line;
		_Menu.Instance.prototype.arrange_grid = arrange_grid;
		_Menu.Instance.prototype.arrange_circle = arrange_circle;
		
		_Menu.Instance.prototype.themes = {};
		_Menu.Instance.prototype.themes.core = theme_core;
		
	}
	
	/*===================================================
    
    ui
    
    =====================================================*/
	
	function Menu ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.elementType = parameters.elementType || 'section';
		
		parameters.text = parameters.image = undefined;
		
		// prototype constructor
		
		_Button.Instance.call( this, parameters );
		
		// create new button for self
		
		if ( parameters.button instanceof _Button.Instance ) {
			
			this.button = parameters.button;
		
		}
		else if ( main.type( parameters.button ) === 'object' ) {
			
			this.button = new _Button.Instance( parameters.button );
			
		}
		
		// remove button events from self
		
		this.domElement.off( '.btn' );
        
	}
	
	/*===================================================
    
    arrangements
    
    =====================================================*/
	
	function arrange_line ( degrees, circular ) {
		
		var i, l,
			theta,
			child,
			cw, ch,
			rw, rh,
			rwabs, rhabs,
			thetaCos,
			thetaSin,
			thetaCosAbs,
			thetaSinAbs,
			thetaCosRnd,
			thetaSinRnd,
			x, y,
			rx, ry,
			widthMax = 0,
			heightMax = 0,
			widthTotal = 0,
			heightTotal = 0,
			xbound = 0,
			ybound = 0;
		
		// handle theta, assumes passed in degrees
		
		theta = main.type( degrees ) === 'number' ? _MathHelper.degree_to_rad( _MathHelper.degree_between_180( degrees ) ) : 0;
		
		thetaCos = Math.cos(theta);
		thetaSin = Math.sin(theta);
		
		// if arranging for rectangular children
		
		if ( circular !== true ) {
			
			thetaCosAbs = Math.abs( thetaCos );
			thetaSinAbs = Math.abs( thetaSin );
			
			thetaCosRnd = thetaCosAbs > thetaSinAbs ?  Math.round( thetaCos ) : ( thetaCos / sincos45 );
			thetaSinRnd = thetaSinAbs > thetaCosAbs ?  Math.round( thetaSin ) : ( thetaSin / sincos45 );
			
		}
		
		// arrange all children in line
		
		for ( i = 0, l = this.children.length; i < l; i++ ) {
			
			child = this.children[ i ];
			
			cw = child.outerWidth;
			ch = child.outerHeight;
			
			widthMax = ( cw > widthMax ) ? cw : widthMax;
			heightMax = ( ch > heightMax ) ? ch : heightMax;
			
			if ( circular === true ) {
				
				rw = cw * thetaCos;
				rh = ch * thetaSin;
			
			}
			else {
				
				rw = _MathHelper.max_magnitude( cw * thetaCos, cw * thetaCosRnd );
				rh = _MathHelper.max_magnitude( ch * thetaSin, ch * thetaSinRnd );
				
			}
			
			rwabs = Math.abs( rw );
			rhabs = Math.abs( rh );
			
			child.set_position( xbound + child.spacingLeft, ybound + child.spacingTop );
			
			xbound += rw;
			ybound += rh;
			
			widthTotal += rwabs;
			heightTotal += rhabs;
			
		}
		
		// account for final child
		
		widthTotal += widthMax - rwabs;
		heightTotal += heightMax - rhabs;
		
		// set this width and height
		
		this.width = widthTotal + this.spacingLeft + this.spacingRight;
		this.height = heightTotal + this.spacingTop + this.spacingBottom;
		
		// shift all children based on x/y bounds
		
		xbound = ( xbound < 0 ) ? xbound - rw : 0;
		ybound = ( ybound < 0 ) ? ybound - rh : 0;
		
		for ( i = 0, l = this.children.length; i < l; i++ ) {
			
			child = this.children[ i ];
			
			child.set_position( child.x + this.spacingLeft - xbound, child.y + this.spacingTop - ybound );
			
		}
		
	}
	
	function arrange_grid ( m, n ) {
		
		// m rows, n cols
		
	}
	
	function arrange_circle () {
		
		
		
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