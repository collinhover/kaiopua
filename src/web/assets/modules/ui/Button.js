/*
 *
 * Button.js
 * Generic ui button.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/ui/Button.js",
		_Button = {},
		_UIElement;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Button,
		requirements: [
			"assets/modules/ui/UIElement.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( uie ) {
		console.log('internal button', _Button);
		
		_UIElement = uie;
		
		// instance
		
		_Button.Instance = Button;
		_Button.Instance.prototype = new _UIElement.Instance();
		_Button.Instance.prototype.constructor = _Button.Instance;
		_Button.Instance.prototype.supr = _UIElement.Instance.prototype;
		
		_Button.Instance.prototype.make_circle = make_circle;
		_Button.Instance.prototype.make_rectangle = make_rectangle;
		
		_Button.Instance.prototype.trigger = trigger;
		
		_Button.Instance.prototype.themes = {};
		_Button.Instance.prototype.themes.core = theme_core;
		
	}
	
	/*===================================================
    
    ui
    
    =====================================================*/
	
	function Button ( parameters ) {
		
		var me = this,
			textString,
			imgDomElement;
		
		// handle parameters
		
		parameters = parameters || {};
		
		textString = parameters.text;
		
		parameters.text = undefined;
		
		// prototype constructor
		
		_UIElement.Instance.call( this, parameters );
		
		// properties
		
		// add text
		
		if ( typeof textString === 'string' ) {
			
			this.text = new _UIElement.Instance( {
				id: this.id + '_text',
				text: textString
			} );
		
		}
		
		// image
		
		if ( parameters.image instanceof _UIElement.Instance ) {
			
			this.image = parameters.image;
			
		}
		else {
			
			if ( typeof parameters.image === 'string' ) {
				
				imgDomElement = new Image();
				imgDomElement.crossOrigin = '';
				imgDomElement.src = parameters.image;
				
			}
			else if ( main.is_image( parameters.image ) ) {
				
				imgDomElement = parameters.image;
				
			}
			
			if ( typeof imgDomElement !== 'undefined' ) {
				
				this.image = new _UIElement.Instance( {
					id: this.id + '_image',
					domElement: imgDomElement
				} );
			
			}
			
		}
		
		
		// if image
		
		if ( this.image instanceof _UIElement.Instance ) {
			
			this.image.alignOnce( parameters.imageAlignment || 'center' );
			
			this.add( this.image );
			
		}
		
		// if no image or force text with image, fallback to text
		
		if ( this.text instanceof _UIElement.Instance && ( this.image instanceof _UIElement.Instance === false || parameters.textWithImage === true ) ) {
			
			this.text.alignOnce( parameters.textAlignment || 'center' );
			
			this.add( this.text );
			
		}
		
		// data
		
		this.data = main.ensure_array( parameters.data );
		
		// callback
        
        this.callback = parameters.callback;
		
		// context
		
		this.context = parameters.context || this;
		
		// bubble
		
		this.bubble = ( typeof parameters.bubble === 'boolean' ? parameters.bubble : true );
        
        // listen for clicks
        
        $( this.domElement ).on( 'click', function ( e ) { me.trigger( e ); } );
		
		// parent
		
		this.parent = undefined;
		
		// form
		
		if ( parameters.circle === true ) {
			
			this.make_circle();
		
		}
		
	}
	
	/*===================================================
    
    trigger
    
    =====================================================*/
	
	function trigger ( e ) {
		
		if ( this.enabled === true && typeof this.callback !== 'undefined' ) {
			
			this.callback.apply( this.context, this.data );
			
		}
		
		if ( this.bubble === false ) {
			
			e.preventDefault();
			e.stopPropagation();
			return false;
			
		}
		
	}
	
	/*===================================================
    
    form
    
    =====================================================*/
	
	function make_circle () {
		
		// if width set explicitly
		
		if ( this.width !== 0 ) {
			
			var width = this.width,
				height = this.height,
				max = Math.max( width, height ),
				maxHalf = max * 0.5;
			
			// set dimensions equal
			
			this.height = this.width = max;
			
			// set radius to half
			
			this.apply_css( "border-radius", maxHalf + "px" );
			
		}
		
	}
	
	function make_rectangle () {
		
		// set radius to base
		
		this.apply_css( "border-radius", 0 );
		
	}
	
	/*===================================================
    
    css
    
    =====================================================*/
	
	function generate_cssmap ( cssmap ) {
		
		cssmap = cssmap || {};
		
		cssmap[ "cursor" ] = cssmap[ "cursor" ] || "pointer";
		cssmap[ "color" ] = cssmap[ "color" ] || "#333333";
		cssmap[ "font-size" ] = cssmap[ "font-size" ] || "24px";
		cssmap[ "font-family" ] = cssmap[ "font-family" ] || "'OpenSansRegular', Helmet, Freesans, sans-serif";
		cssmap[ "background-color" ] = cssmap[ "background-color" ] || "#eeeeee";
		cssmap[ "background-image" ] = cssmap[ "background-image" ] || "linear-gradient(top, #eeeeee 30%, #cccccc 100%)";
		cssmap[ "box-shadow" ] = cssmap[ "box-shadow" ] || "-2px 2px 10px rgba(0, 0, 0, 0.15)";
		
		// proto
		
		cssmap = _Button.Instance.prototype.supr.generate_cssmap.call( this, cssmap );
		
		return cssmap;

	}
	
	/*===================================================
    
    themes
    
    =====================================================*/
	
	function theme_core ( theme ) {
		
		var cssmap,
			enabled,
			disabled;
		
		theme = theme || {};
		
		// cssmap
		
		cssmap = theme.cssmap = theme.cssmap || {};
		
		cssmap[ "font-size" ] = cssmap[ "font-size" ] || "24px";
		cssmap[ "font-family" ] = cssmap[ "font-family" ] || "'OpenSansRegular', Helmet, Freesans, sans-serif";
		cssmap[ "box-shadow" ] = cssmap[ "box-shadow" ] || "-2px 2px 10px rgba(0, 0, 0, 0.15)";
		
		// enabled state
		
		enabled = theme.enabled = theme.enabled || {};
		
		enabled[ "cursor" ] = enabled[ "cursor" ] || "pointer";
		enabled[ "color" ] = enabled[ "color" ] || "#333333";
		enabled[ "background-color" ] = enabled[ "background-color" ] || "#eeeeee";
		enabled[ "background-image" ] = enabled[ "background-image" ] || "linear-gradient(top, #eeeeee 30%, #cccccc 100%)";
		
		// disabled state
		
		disabled = theme.disabled = theme.disabled || {};
		
		disabled[ "cursor" ] = disabled[ "cursor" ] || "default";
		disabled[ "color" ] = disabled[ "color" ] || "#777777";
		disabled[ "background-color" ] = disabled[ "background-color" ] || "#cccccc";
		disabled[ "background-image" ] = disabled[ "background-image" ] || "linear-gradient(top, #cccccc 30%,#aaaaaa 100%)";
		
		// proto
		
		theme = _Button.Instance.prototype.supr.themes.core.call( this, theme );
		
		return theme;
		
	}
	
} (KAIOPUA) );