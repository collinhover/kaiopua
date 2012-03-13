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
		
		_Button.Instance.prototype.enable = enable;
		_Button.Instance.prototype.disable = disable;
		
		_Button.Instance.prototype.enable_visual = enable_visual;
		_Button.Instance.prototype.disable_visual = disable_visual;
		_Button.Instance.prototype.make_circle = make_circle;
		_Button.Instance.prototype.make_rectangle = make_rectangle;
		
		_Button.Instance.prototype.trigger = trigger;
		
		_Button.Instance.prototype.generate_css_map = generate_css_map;
		
		Object.defineProperty( _Button.Instance.prototype, 'enabledSelf', { 
			get : function () { return this._enabled; }
		} );
		
		Object.defineProperty( _Button.Instance.prototype, 'enabled', { 
			get : function () { return ( this.parent instanceof _Button.Instance ? this.parent.enabled : this._enabled ); },
			set : function ( state ) {
				
				if ( state === true ) {
					
					this.enable();
					
				}
				else {
					
					this.disable();
					
				}
				
			}
		} );
		
	}
	
	/*===================================================
    
    ui
    
    =====================================================*/
	
	function Button ( parameters ) {
		
		var me = this;
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.classes = 'button ' + ( parameters.classes || '' );
		
		// prototype constructor
		
		_UIElement.Instance.call( this, parameters );
		
		// properties
		
		// add text
		
		this.text = new _UIElement.Instance( {
			id: this.id + '_text',
			text: this.id
		} );
		
		this.text.alignment = 'center';
		
		this.add( this.text );	
		
		// image
		
		if ( typeof parameters.image === 'string' ) {
			
			main.asset_require( parameters.image, function ( img ) {
				
				me.image = img;
				
			});
			
		}
		else if ( main.is_image( parameters.image ) ) {
		
			this.image = parameters.image;
			
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
		
		// enable / disable
		
		this.enabled = ( typeof parameters.enabled === 'boolean' ? parameters.enabled : true );
		
		// parent
		
		this.parent = undefined;
		
		// form
		
		if ( parameters.circle === true ) {
			
			this.make_circle();
		
		}
		else {
			
			this.make_rectangle();
			
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
		
		this.domElement.removeClass( 'item_disabled' );
		
		this.domElement.addClass( 'item_enabled' );
		
	}
	
	function disable_visual () {
		
		this.domElement.removeClass( 'item_enabled' );
		
		this.domElement.addClass( 'item_disabled' );
		
	}
	
	function make_circle () {
		
		// if width set explicitly
		
		if ( this.width !== 0 ) {
			
			this.add_do_remove( function () {
				
				var width = this.width,
					height = this.height,
					max = Math.max( width, height ),
					maxHalf = max * 0.5;
				
				// set dimensions equal
				
				this.height = this.width = max;
				
				// set radius to half
				
				this.domElement.css( {
					"border-radius": maxHalf + "px"
				} );
				
			}, this );
			
		}
		
	}
	
	function make_rectangle () {
		
		// set radius to base
		
		this.domElement.css( {
			"border-radius": this.cssmap[ "border-radius" ]
		} );
		
	}
	
	/*===================================================
    
    css
    
    =====================================================*/
	
	function generate_css_map ( cssmap ) {
		
		// proto
		
		cssmap = _Button.Instance.prototype.supr.generate_css_map.call( this, cssmap );
		
		return cssmap;

	}
	
} (KAIOPUA) );