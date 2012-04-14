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
		_Game,
		_UIElement,
		_Button,
		_GUI,
		queue,
		priority = false,
		active = false,
		confirmRequired = false;
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Messenger,
		requirements: [
			"assets/modules/core/Game.js",
			"assets/modules/ui/UIElement.js",
			"assets/modules/ui/Button.js",
			"assets/modules/ui/GUI.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( g, uie, btn, gui ) {
		console.log('internal messenger', _Messenger);
		
		_Game = g;
		_UIElement = uie;
		_Button = btn;
		_GUI = gui;
		
		// properties
		
		_Messenger.timeLive = 2000;
		_Messenger.widthPctMax = 0;
		_Messenger.heightPctMax = 0;
		_Messenger.pulseTimeShow = 1000;
		_Messenger.pulseTimeHide = 1000;
		_Messenger.pulseOpacityShow = 1;
		_Messenger.pulseOpacityHide = 0.2;
		
		// core
		
		_Messenger.container = new _UIElement.Instance( {
			id: 'messenger',
			alignment: 'center',
			pointerEvents: false
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
				'position' : 'relative',
				'display' : 'block'
			},
			alignment: 'center'
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
		
		_Messenger.confirm = new _Button.Instance( {
			id: 'confirm',
			html: "press anything to continue",
			theme: 'core',
			cssmap: {
				'position' : 'relative',
				'margin-top' : '20px',
				'text-align' : 'center'
			}
		} );
		
		// functions
		
		_Messenger.show_message = show_message;
		_Messenger.hide_message = hide_message;
		_Messenger.reset = reset;
		
		Object.defineProperty( _Messenger, 'active', { 
			get : function () { return active; }
		} );
		
		// reset
		
		shared.signals.gamestop.add( reset, _Messenger );
		
		reset();
		
	}
	
	/*===================================================
    
    reset
    
    =====================================================*/
	
	function reset () {
		
		// clear queue
		
		queue = [];
		
		// hide current
		
		hide_current_message();
		
	}
	
	/*===================================================
    
    message
    
    =====================================================*/
	
	function show_message ( parameters ) {
		
		// add message into queue
		
		queue.push( parameters );
		
		// if only 1 message, show immediately
		
		if ( queue.length == 1 ) {
			
			step_message_queue();
			
		}
		
	}
	
	function step_message_queue () {
		
		// if game paused
		
		if ( active !== true && _Game.paused === true ) {
			
			shared.signals.resumed.addOnce( step_message_queue );
			
		}
		else {
			
			// hide current and show next
			
			hide_current_message( { callback: show_next_message } );
			
		}
		
	}
	
	function show_next_message () {
		
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
		
		// if message in queue
		
		if ( queue.length > 0 ) {
			
			// handle parameters
			
			parameters = queue.shift() || {};
			
			pHead = parameters.head;
			pImage = parameters.image;
			pTitle = parameters.title;
			pBody = parameters.body;
			priority = typeof parameters.priority === 'boolean' ? parameters.priority : false;
			active = true;
			
			// head
			
			if ( typeof pHead !== 'undefined' ) {
				
				head = _Messenger.head = update_message_element( head, pHead );
				
				head.show( { parent: container, time: 0 } );
				
			}
			
			// image
			
			if ( typeof pImage === 'string' ) {
				
				imageElement.src = pImage;
				
				image.width = main.is_number( parameters.imageWidth ) ? parameters.imageWidth : ( main.is_number( parameters.imageSize ) ? parameters.imageSize : 'auto' );
				image.height = main.is_number( parameters.imageHeight ) ? parameters.imageHeight : ( main.is_number( parameters.imageSize ) ? parameters.imageSize : 'auto' );
				
				image.align_once( image.alignment );
				
				image.show( { parent: head, time: 0 } );
				
				head.show( { parent: container, time: 0 } );
				
			}
			
			// title
			
			if ( typeof pTitle !== 'undefined' ) {
				
				title = _Messenger.title = update_message_element( title, pTitle );
				
				title.show( { parent: container, time: 0 } );
				
			}
			
			// body
			
			if ( typeof pBody !== 'undefined' ) {
				
				body = _Messenger.body = update_message_element( body, pBody );
				
				body.show( { parent: container, time: 0 } );
				
			}
			
			// confirm
			
			if ( parameters.confirmRequired === true ) {
				
				confirmRequired = parameters.confirmRequired;
				
				_Messenger.confirm.html = "<p class='highlight text_small'>click HERE to continue</p>";
				
				_Messenger.confirm.callback = hide_message;
				_Messenger.confirm.context = _Messenger;
				
			}
			else {
				
				confirmRequired = false;
				
				_Messenger.confirm.html = "<p class='highlight text_small'>press anything to continue</p>";
				
				_Messenger.confirm.callback = _Messenger.confirm.context = undefined;
				
			}
			
			// if priority message
			
			if ( priority === true ) {
				
				_Game.pause( true );
				
				_GUI.transitioner.show( { opacity: parameters.transitionerOpacity } );
				
				_Messenger.confirm.show( { parent: container, time: 0 } );
			
				callback = priority_message_callback;
				
			}
			else {
				
				_Game.resume();
				
				callback = passive_message_callback;
				
			}
			
			// ui
			
			container.width = 'auto';
			container.height = 'auto';
			
			container.show( { parent: _GUI.layers.uiPriority, callback: callback, context: this } );
			
			// set width/height
			
			if ( _Messenger.widthPctMax > 0 && container.width > shared.screenWidth * _Messenger.widthPctMax ) {
				
				container.width = Math.round( _Messenger.widthPctMax * 100 ) + '%';
				
			}
			if ( _Messenger.heightPctMax > 0 && container.height > shared.screenHeight * _Messenger.heightPctMax ) {
				
				container.height = Math.round( _Messenger.heightPctMax * 100 ) + '%';
				
			}
			
			// align
			
			container.align();
			
		}
		
	}
	
	function hide_message () {
		
		step_message_queue();
		
	}
	
	function hide_current_message ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		// signals
		
		shared.signals.keyup.remove( hide_message );
		shared.signals.mouseup.remove( hide_message );
		
		// clear timeout
		
		if ( typeof _Messenger.liveTimeoutID !== 'undefined' ) {
			
			clearRequestTimeout( _Messenger.liveTimeoutID );
			
		}
		
		// active
		
		active = false;
		
		// was priority message
		
		if ( priority === true ) {
			
			priority = false;
			
			if ( queue.length === 0 ) {
				
				_Game.resume();
				
			}
			
		}
		
		// container
		
		_Messenger.container.hide( { 
			remove: true,
			callback: function () {
				
				// clear all elements
				
				_Messenger.head.remove();
				_Messenger.image.remove();
				_Messenger.title.remove();
				_Messenger.body.remove();
				_Messenger.container.remove();
				
				if ( typeof parameters.callback === 'function' ) { 
					
					parameters.callback.apply( parameters.context, parameters.data );
					
				}
				
			}
		} );
		
	}
	
	function update_message_element ( element, parameters ) {
		
		var type;
		
		// hide/remove previous
		
		element.remove();
		
		element.hide( { remove: true, time: 0 } );
		
		// handle parameters
		
		if ( parameters instanceof _UIElement.Instance ) {
			
			element = parameters;
			
		}
		else if ( typeof parameters === 'string' ) {
			
			element.html = parameters;
			
		}
		else {
			
			type = main.type( parameters );
			
			if ( type === 'array' ) {
				
				element.add.apply( element, parameters );
				
			}
			else if ( type === 'object' ) {
				
				element = new _UIElement.Instance( parameters );
				
			}
			
		}
		
		return element;
		
	}
	
	/*===================================================
    
    priority
    
    =====================================================*/
	
	function priority_message_callback () {
		
		_Messenger.confirm.pulse( { 
			parent: _Messenger.container,
			timeShow: _Messenger.pulseTimeShow,
			timeHide: _Messenger.pulseTimeHide,
			opacityShow: _Messenger.pulseOpacityShow,
			opacityHide: _Messenger.pulseOpacityHide
		} );
		
		// signals
		
		if ( confirmRequired !== true ) {
			
			shared.signals.keyup.add( hide_message );
			shared.signals.mouseup.add( hide_message );
			
		}
		
	}
	
	/*===================================================
    
	passive
    
    =====================================================*/
	
	function passive_message_callback () {
		
		_Messenger.liveTimeoutID = requestTimeout( hide_message, _Messenger.timeLive );
		
	}
	
} (KAIOPUA) );