/*
 *
 * Messenger.js
 * UI to show messages to user.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/ui/Messenger.js",
		_Messenger = {},
		_UIElement,
		_Game,
		_GUI,
		active = false;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Messenger,
		requirements: [
			"assets/modules/ui/UIElement.js",
			"assets/modules/core/Game.js",
			"assets/modules/ui/GUI.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( uie, g, gui ) {
		console.log('internal messenger', _Messenger);
		
		_UIElement = uie;
		_Game = g;
		_GUI = gui;
		
		// properties
		
		_Messenger.timeLive = 2000;
		_Messenger.widthPctMax = 0.5;
		_Messenger.heightPctMax = 0.5;
		_Messenger.pulseTimeShow = 1000;
		_Messenger.pulseTimeHide = 1000;
		_Messenger.pulseOpacityShow = 1;
		_Messenger.pulseOpacityHide = 0.2;
		
		_Messenger.container = new _UIElement.Instance( {
			id: 'messenger',
			alignment: 'center'
		} );
	
		_Messenger.image = new _UIElement.Instance( {
			id: 'image',
			elementType: 'img',
			cssmap: {
				'position' : 'relative'
			}
		} );
	
		_Messenger.title = new _UIElement.Instance( {
			id: 'title',
			html: 'We <3 You',
			classes: 'title text_huge',
			cssmap: {
				'position' : 'relative',
				'color' : '#ffffff'
			}
		} );
	
		_Messenger.body = new _UIElement.Instance( {
			id: 'body',
			html: "Thanks for playing!",
			cssmap: {
				'position' : 'relative',
				'color' : '#ffffff'
			}
		} );
		
		_Messenger.confirm = new _UIElement.Instance( {
			id: 'confirm',
			html: "<p>press anything to continue</p>",
			classes: 'highlight text_small',
			cssmap: {
				'position' : 'relative',
				'margin-top' : '20px'
			}
		} );
		
		_Messenger.confirm.hide( { time: 0 } );
		
		// functions
		
		_Messenger.show_message = show_message;
		_Messenger.hide_message = hide_message;
		
	}
	
	/*===================================================
    
    message
    
    =====================================================*/
	
	function show_message ( parameters ) {
		
		var image,
			imageElement,
			title,
			body,
			callback;
		
		// hide current message
		
		_Messenger.hide_message();
		
		// handle parameters
		
		parameters = parameters || {};
		
		image = parameters.image;
		
		title = parameters.title;
		
		body = parameters.body;
		
		active = parameters.active || false;
		
		// image
		
		if ( typeof image === 'string' ) {
			
			imageElement = _Messenger.image.domElement.get( 0 );
			
			imageElement.src = image;
			imageElement.onload = function () {
				_Messenger.image.align_once( _Messenger.image.alignment );
			}
			
			_Messenger.image.width = main.is_number( parameters.imageWidth ) ? parameters.imageWidth : ( main.is_number( parameters.imageSize ) ? parameters.imageSize : 'auto' );
			_Messenger.image.height = main.is_number( parameters.imageHeight ) ? parameters.imageHeight : ( main.is_number( parameters.imageSize ) ? parameters.imageSize : 'auto' );
			
			_Messenger.image.show( { parent: _Messenger.container } );
			
		}
		else {
			
			_Messenger.image.hide( { remove: true, time: 0 } );
			
		}
		
		// title
		
		if ( typeof title !== 'undefined' ) {
			
			_Messenger.title = update_message_element( _Messenger.title, title );
			
			_Messenger.title.show( { parent: _Messenger.container } );
			
		}
		else {
			
			_Messenger.title.hide( { remove: true, time: 0 } );
			
		}
		
		// body
		
		if ( typeof body !== 'undefined' ) {
			
			_Messenger.body = update_message_element( _Messenger.body, body );
			
			_Messenger.body.show( { parent: _Messenger.container } );
			
		}
		else {
			
			_Messenger.body.hide( { remove: true, time: 0 } );
			
		}
		
		// if active message
		
		if ( active === true ) {
			
			_Game.pause( true );
			
			_GUI.transitioner.show( { opacity: parameters.transitionerOpacity } );
			
			// container
		
			callback = active_message_callback;
			
		}
		else {
			
			callback = passive_message_callback;
			
		}
		
		// ui
		
		_Messenger.container.width = 'auto';
		_Messenger.container.height = 'auto';
		
		_Messenger.container.show( { parent: _GUI.layers.ui, callback: callback, callbackContext: this } );
		
		// check width/height
		
		if ( _Messenger.container.width > shared.screenWidth * _Messenger.widthPctMax ) {
			
			_Messenger.container.width = shared.screenWidth * _Messenger.widthPctMax;
			
		}
		if ( _Messenger.container.height > shared.screenHeight * _Messenger.heightPctMax ) {
			
			_Messenger.container.height = shared.screenHeight * _Messenger.heightPctMax;
			
		}
		
		// align
		
		_Messenger.container.align();
		
	}
	
	function hide_message () {
		
		// signals
		
		shared.signals.keyup.remove( hide_message );
		shared.signals.mouseup.remove( hide_message );
		
		// clear timeout
		
		if ( typeof _Messenger.liveTimeoutID !== 'undefined' ) {
			
			clearRequestTimeout( _Messenger.liveTimeoutID );
			
		}
		
		// was active message
		
		if ( active === true ) {
			
			active = false;
			
			_Game.resume();
			
		}
		
		// confirm
		
		_Messenger.confirm.hide( { remove: true } );
		
		// container
		
		_Messenger.container.hide( { remove: true } );
		
	}
	
	function update_message_element ( element, parameters ) {
		
		if ( typeof parameters === 'string' ) {
			
			element.html = parameters;
			
		}
		else {
			
			// hide/remove previous
			
			element.hide( { remove: true } );
			
			// create new
			
			parameters.id = 'title';
			
			element = new _UIElement.Instance( parameters );
			
		}
		
		return element;
		
	}
	
	/*===================================================
    
    active
    
    =====================================================*/
	
	function active_message_callback () {
		
		_Messenger.confirm.pulse( { 
			parent: _Messenger.container,
			timeShow: _Messenger.pulseTimeShow,
			timeHide: _Messenger.pulseTimeHide,
			opacityShow: _Messenger.pulseOpacityShow,
			opacityHide: _Messenger.pulseOpacityHide
		} );
		
		// signals
		
		shared.signals.keyup.add( hide_message );
		shared.signals.mouseup.add( hide_message );
		
	}
	
	/*===================================================
    
	passive
    
    =====================================================*/
	
	function passive_message_callback () {
		
		_Messenger.liveTimeoutID = requestTimeout( hide_message, _Messenger.timeLive );
		
	}
	
} (KAIOPUA) );