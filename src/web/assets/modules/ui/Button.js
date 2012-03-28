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
		
		_Button.Instance.prototype.enter = enter;
		_Button.Instance.prototype.leave = leave;
		_Button.Instance.prototype.active = active;
		_Button.Instance.prototype.trigger = trigger;
		_Button.Instance.prototype.cooldown = cooldown;
		
		_Button.Instance.prototype.themes = {};
		_Button.Instance.prototype.themes.core = theme_core;
		_Button.Instance.prototype.themes.white = theme_white;
		_Button.Instance.prototype.themes.green = theme_green;
		_Button.Instance.prototype.themes.red = theme_red;
		
	}
	
	/*===================================================
    
    ui
    
    =====================================================*/
	
	function Button ( parameters ) {
		
		var me = this,
			imgDomElement;
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.theme = parameters.theme || 'white';
		
		// prototype constructor
		
		_UIElement.Instance.call( this, parameters );
		
		// properties
		
		// add text
		
		if ( typeof parameters.text === 'string' ) {
			
			this.text = new _UIElement.Instance( {
				id: this.id + '_text',
				html: parameters.text
			} );
		
		}
		
		// image
		
		if ( parameters.image instanceof _UIElement.Instance ) {
			
			this.image = parameters.image;
			
		}
		else if ( typeof parameters.image === 'string' ) {
				
			this.image = new _UIElement.Instance( {
				id: this.id + '_image',
				elementType: 'img',
				src: parameters.image,
				imgLoadCallback: function () {
					me.image.align_once( me.image.alignment || 'center' );
				},
				width: main.is_number( parameters.imageWidth ) ? parameters.imageWidth : parameters.imageSize,
				height: main.is_number( parameters.imageHeight ) ? parameters.imageHeight : parameters.imageSize
			} );
			
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
		
		this.bubble = ( typeof parameters.bubble === 'boolean' ? parameters.bubble : false );
		
		// cooldown
		
		this.timeCooldown = main.is_number( parameters.timeCooldown ) ? parameters.timeCooldown : 100;
		
		// parent
		
		this.parent = undefined;
		
		// events
		
		this.domElement.on( 'mouseenter.btn touchenter.btn', function ( e ) { me.enter( e ); } );
		this.domElement.on( 'mouseleave.btn touchleave.btn', function ( e ) { me.leave( e ); } );
		this.domElement.on( 'mousedown touchstart', function ( e ) { me.active( e ) } );
        this.domElement.on( 'mouseup.btn touchend.btn', function ( e ) { me.trigger( e ); } );
		
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
	
	function active ( e ) {
		
		if ( e && this.bubble === false ) {
			
			e.preventDefault();
			e.stopPropagation();
			return false;
			
		}
		
	}
	
	function trigger ( e ) {
		
		if ( typeof this.callback !== 'undefined' && this.enabled === true && this.hidden !== true && this.isVisible === true ) {
			
			this.callback.apply( this.context || window, main.ensure_array( this.data ) );
			
		}
		
		if ( e && this.bubble === false ) {
			
			e.preventDefault();
			e.stopPropagation();
			return false;
			
		}
		
	}
	
	function cooldown () {
		
		var me = this;
		
		if ( this.timeCooldown > 0 ) {
			
			this.disable();
			
			requestTimeout( function () { me.enable(); }, this.timeCooldown );
			
		}
		
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
		
		// enabled state
		
		or = overrides.enabled || {};
		
		enabled = theme.enabled = theme.enabled || {};
		
		enabled[ "cursor" ] = or[ "cursor" ] || "pointer";
		
		// disabled state
		
		or = overrides.disabled || {};
		
		disabled = theme.disabled = theme.disabled || {};
		
		disabled[ "cursor" ] = or[ "cursor" ] || "default";
		
		// enter state
		
		or = overrides.enter || {};
		
		enter = theme.enter = theme.enter || {};
		
		enter[ "color" ] = or[ "color" ] || "#222222";
		
		return theme;
		
	}
	
	function theme_white ( overrides ) {
		
		var supr = _Button.Instance.prototype.supr,
			theme = ( supr.themes[ 'white' ] || supr.themes.core ).call( this, overrides ),
			enter,
			or;
		
		// enter state
		
		or = overrides.enter || {};
		
		enter = theme.enter = theme.enter || {};
		
		enter[ "background-color" ] = or[ "background-color" ] || "#ffffff";
		
		return theme;
		
	}
	
	function theme_green ( overrides ) {
		
		var supr = _Button.Instance.prototype.supr,
			theme = ( supr.themes[ 'green' ] || supr.themes.core ).call( this, overrides ),
			enter,
			or;
		
		// enter state
		
		or = overrides.enter || {};
		
		enter = theme.enter = theme.enter || {};
		
		enter[ "background-color" ] = or[ "background-color" ] || "#66FFB2";
		
		return theme;
		
	}
	
	function theme_red ( overrides ) {
		
		var supr = _Button.Instance.prototype.supr,
			theme = ( supr.themes[ 'red' ] || supr.themes.core ).call( this, overrides ),
			enter,
			or;
		
		// enter state
		
		or = overrides.enter || {};
		
		enter = theme.enter = theme.enter || {};
		
		enter[ "background-color" ] = or[ "background-color" ] || "#FF8A8A";
		
		return theme;
		
	}
	
} (KAIOPUA) );