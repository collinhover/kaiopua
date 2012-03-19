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
		
		_Button.Instance.prototype.update_form = update_form;
		_Button.Instance.prototype.form_circle = form_circle;
		_Button.Instance.prototype.form_rectangle = form_rectangle;
		
		_Button.Instance.prototype.enter = enter;
		_Button.Instance.prototype.leave = leave;
		_Button.Instance.prototype.trigger = trigger;
		_Button.Instance.prototype.cooldown = cooldown;
		
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
				imgDomElement.onload = function () {
					me.image.align_once( me.image.alignment || 'center' );
				}
				
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
			
			this.image.pointerEvents = false;
			
			this.image.align_once( parameters.imageAlignment || 'center' );
			
			this.add( this.image );
			
		}
		
		// if no image or force text with image, fallback to text
		
		if ( this.text instanceof _UIElement.Instance && ( this.image instanceof _UIElement.Instance === false || parameters.textWithImage === true ) ) {
			
			this.text.pointerEvents = false;
			
			this.text.align_once( parameters.textAlignment || 'center' );
			
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
		
		// cooldown
		
		this.timeCooldown = main.is_number( parameters.timeCooldown ) ? parameters.timeCooldown : 100;
		
		// parent
		
		this.parent = undefined;
		
		// form, default to rectangle
		
		if ( parameters.circle === true ) {
			
			this.form_circle();
		
		}
		else {
			
			this.form_rectangle();
			
		}
		
		// events
		
		this.domElement.on( 'mouseenter.btn touchenter.btn', function ( e ) { me.enter( e ); } );
		this.domElement.on( 'mouseleave.btn touchleave.btn', function ( e ) { me.leave( e ); } );
        this.domElement.on( 'click.btn', function ( e ) { me.trigger( e ); } );
		
	}
	
	/*===================================================
    
    enter / leave
    
    =====================================================*/
	
	function enter ( e ) {
		
		if ( this.enabled ) {
			
			this.apply_css( this.theme.enter );
			
		}
		
	}
	
	function leave ( e ) {
			
		this.apply_css( this.theme.stateLast );
		
	}
	
	/*===================================================
    
    trigger
    
    =====================================================*/
	
	function trigger ( e ) {
		
		var me = this;
		
		if ( typeof this.callback !== 'undefined' && this.enabled === true && this.hidden !== true && this.isVisible === true ) {
			
			this.callback.apply( this.context, this.data );
			
		}
		
		if ( this.bubble === false ) {
			
			e.preventDefault();
			e.stopPropagation();
			return false;
			
		}
		
	}
	
	function cooldown () {
		
		if ( this.timeCooldown > 0 ) {
			
			this.disable( false );
			
			requestTimeout( function () { me.enable(); }, this.timeCooldown );
			
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
	
	/*===================================================
    
    themes
    
    =====================================================*/
	
	function theme_core ( overrides ) {
		
		var theme,
			cssmap,
			enabled,
			disabled,
			enter,
			or;
		
		// proto
		
		theme = _Button.Instance.prototype.supr.themes.core.call( this, overrides );
		
		// cssmap
		
		or = overrides.cssmap || {};
		
		cssmap = theme.cssmap = theme.cssmap || {};
		
		cssmap[ "font-size" ] = or[ "font-size" ] || "24px";
		cssmap[ "font-family" ] = or[ "font-family" ] || "'OpenSansRegular', Helmet, Freesans, sans-serif";
		cssmap[ "box-shadow" ] = or[ "box-shadow" ] || "-2px 2px 10px rgba(0, 0, 0, 0.15)";
		
		// enabled state
		
		or = overrides.enabled || {};
		
		enabled = theme.enabled = theme.enabled || {};
		
		enabled[ "cursor" ] = or[ "cursor" ] || "pointer";
		enabled[ "color" ] = or[ "color" ] || "#333333";
		enabled[ "background-color" ] = or[ "background-color" ] || "#eeeeee";
		//enabled[ "background-image" ] = or[ "background-image" ] || "linear-gradient(top, #eeeeee 30%, #cccccc 100%)";
		
		// disabled state
		
		or = overrides.disabled || {};
		
		disabled = theme.disabled = theme.disabled || {};
		
		disabled[ "cursor" ] = or[ "cursor" ] || "default";
		disabled[ "color" ] = or[ "color" ] || "#777777";
		disabled[ "background-color" ] = or[ "background-color" ] || "#cccccc";
		//disabled[ "background-image" ] = or[ "background-image" ] || "linear-gradient(top, #cccccc 30%, #aaaaaa 100%)";
		
		// enter state
		
		or = overrides.enter || {};
		
		enter = theme.enter = theme.enter || {};
		
		enter[ "color" ] = or[ "color" ] || "#222222";
		enter[ "background-color" ] = or[ "background-color" ] || "#ffffff";
		//enter[ "background-image" ] = or[ "background-image" ] || "linear-gradient(top, #ffffff 30%, #dddddd 100%)";
		
		return theme;
		
	}
	
} (KAIOPUA) );