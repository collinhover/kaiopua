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
		_Messenger.widthPctMax = 0;
		_Messenger.heightPctMax = 0;
		_Messenger.pulseTimeShow = 1000;
		_Messenger.pulseTimeHide = 1000;
		_Messenger.pulseOpacityShow = 1;
		_Messenger.pulseOpacityHide = 0.2;
		
		_Messenger.container = new _UIElement.Instance( {
			id: 'messenger',
			alignment: 'center'
		} );
		
		_Messenger.head = new _UIElement.Instance( {
			id: 'head',
			cssmap: {
				'position' : 'relative',
				'text-align' : 'center'
			}
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
				'color' : '#ffffff',
				'margin' : '20px 0',
				'text-align' : 'center'
			}
		} );
	
		_Messenger.body = new _UIElement.Instance( {
			id: 'body',
			html: "Thanks for playing!",
			cssmap: {
				'position' : 'relative',
				'color' : '#ffffff',
				'text-align' : 'center'
			}
		} );
		
		_Messenger.confirm = new _UIElement.Instance( {
			id: 'confirm',
			html: "<p>press anything to continue</p>",
			classes: 'highlight text_small',
			cssmap: {
				'position' : 'relative',
				'margin-top' : '20px',
				'text-align' : 'center'
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
		
		var container = _Messenger.container,
			head = _Messenger.head,
			image = _Messenger.image,
			imageElement = image.domElement.get( 0 ),
			title = _Messenger.title,
			body = _Messenger.body,
			pImage,
			pTitle,
			pBody,
			callback;
		
		// hide current message
		
		_Messenger.hide_message();
		
		// handle parameters
		
		parameters = parameters || {};
		
		pHead = parameters.head;
		pImage = parameters.image;
		pTitle = parameters.title;
		pBody = parameters.body;
		active = parameters.active || false;
		
		// head
		
		if ( typeof pHead !== 'undefined' ) {
			
			head = update_message_element( head, pHead );
			
			head.show( { parent: container } );
			
		}
		else {
			
			head.hide( { remove: true, time: 0 } );
			
		}
		
		// image
		
		if ( typeof pImage === 'string' ) {
			
			imageElement.src = pImage;
			imageElement.onload = function () {
				image.align_once( image.alignment );
			}
			
			image.width = main.is_number( parameters.imageWidth ) ? parameters.imageWidth : ( main.is_number( parameters.imageSize ) ? parameters.imageSize : 'auto' );
			image.height = main.is_number( parameters.imageHeight ) ? parameters.imageHeight : ( main.is_number( parameters.imageSize ) ? parameters.imageSize : 'auto' );
			
			image.show( { parent: head } );
			
			head.show( { parent: container } );
			
		}
		else {
			
			image.hide( { remove: true, time: 0 } );
			
		}
		
		// title
		
		if ( typeof pTitle !== 'undefined' ) {
			
			title = update_message_element( title, pTitle );
			
			title.show( { parent: container } );
			
		}
		else {
			
			title.hide( { remove: true, time: 0 } );
			
		}
		
		// body
		
		if ( typeof pBody !== 'undefined' ) {
			
			body = update_message_element( body, pBody );
			
			body.show( { parent: container } );
			
		}
		else {
			
			body.hide( { remove: true, time: 0 } );
			
		}
		
		// if active message
		
		if ( active === true ) {
			
			_Game.pause( true );
			
			_GUI.transitioner.show( { opacity: parameters.transitionerOpacity } );
		
			callback = active_message_callback;
			
		}
		else {
			
			callback = passive_message_callback;
			
		}
		
		// ui
		
		container.width = 'auto';
		container.height = 'auto';
		
		container.show( { parent: _GUI.layers.uiPriority, callback: callback, callbackContext: this } );
		
		// set width/height
		if ( title.width < body.width ) {
			
			container.width = title.width;
			
		}
		
		if ( _Messenger.widthPctMax > 0 && container.width > shared.screenWidth * _Messenger.widthPctMax ) {
			
			container.width = _Messenger.widthPctMax * 100 + '%';
			
		}
		if ( _Messenger.heightPctMax > 0 && container.height > shared.screenHeight * _Messenger.heightPctMax ) {
			
			container.height = _Messenger.heightPctMax * 100 + '%';
			
		}
		
		// align
		
		container.align();
		
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
		else if ( main.type( parameters ) === 'array' ) {
			
			element.remove();
			
			element.add.apply( element, parameters );
			
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