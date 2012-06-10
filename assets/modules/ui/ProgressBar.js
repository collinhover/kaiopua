/*
 *
 * ProgressBar.js
 * UI element for displaying task progress.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/ui/ProgressBar.js",
		_ProgressBar = {},
		width = 320,
		barWidthPct = 0.75,
		barHeightPct = 0.03125,
		barRadiusPct = 0.5,
		barToFillSpacePct = 0.5,
		barMarginPct = 0.046875,
		headerHTML = "Loading...",
		messageHTML = 'Try meditating while you wait!';
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _ProgressBar,
		requirements: "assets/modules/ui/UIElement.js",
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( uie ) {
		console.log('internal progress bar', _ProgressBar);
		_UIElement = uie;
		
		// instance
		
		_ProgressBar.Instance = ProgressBar;
		_ProgressBar.Instance.prototype = new _UIElement.Instance();
		_ProgressBar.Instance.prototype.constructor = _ProgressBar.Instance;
		_ProgressBar.Instance.prototype.supr = _UIElement.Instance.prototype;
		
		_ProgressBar.Instance.prototype.update_progress = update_progress;
		_ProgressBar.Instance.prototype.clear_progress = clear_progress;
		
		Object.defineProperty( _ProgressBar.Instance.prototype, 'header', {
			get: function () { return $( this.childrenByID[ 'header' ].domElement ).html(); },
			set: function ( header ) {
				
				if ( typeof header === 'string' ) {
					
					$( this.childrenByID[ 'header' ].domElement ).html( header );
					
				}
				
			}
		});
		
		Object.defineProperty( _ProgressBar.Instance.prototype, 'message', {
			get: function () { return $( this.childrenByID[ 'message' ].domElement ).html(); },
			set: function ( message ) {
				
				if ( typeof message === 'string' ) {
					
					$( this.childrenByID[ 'message' ].domElement ).html( message );
					
				}
				
			}
		});
		
	}
	
	/*===================================================
    
    instance
    
    =====================================================*/
	
	function ProgressBar ( parameters ) {
		
		var bar,
			fill,
			header,
			message,
			barWidth,
			barHeight,
			barRadius,
			barToFillSpace,
			barMargin;
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.elementType = 'section';
		parameters.classes = 'info_panel';
		parameters.width = main.is_number( parameters.width ) ? parameters.width : width;
		parameters.alignment = 'center';
		
		// prototype constructor
		
		_UIElement.Instance.call( this, parameters );
		
		// properties
		
		barWidth = width * barWidthPct;
		barHeight = width * barHeightPct;
		barRadius = barHeight * barRadiusPct;
		barToFillSpace = barRadius * barToFillSpacePct;
		barMargin = width * barMarginPct;
		
		// bar
		
		bar = new _UIElement.Instance({
			id: 'bar',
			width: barWidth,
			cssmap: {
				'position' : 'relative',
				'border-style' : 'solid',
				'border-color' : '#FFFFFF',
				'border-width' : '1px',
				'border-radius' : barRadius + 'px',
				'padding' : barToFillSpace + 'px',
				'margin-top' : barMargin + 'px',
				'margin-bottom' : barMargin + 'px',
				'margin-left' : 'auto',
				'margin-right' : 'auto'
			}
		});
		
		// fill
		
		fill = new _UIElement.Instance({
			id: 'fill',
			width: 0,
			height: barHeight,
			cssmap: {
				'position' : 'relative',
				'background' : '#FFFFFF',
				'border-radius' : barRadius + 'px'
			}
		});
		
		// header
		header = new _UIElement.Instance({
			id: 'header',
			elementType: 'header',
			classes: 'text_large title_alt',
			width: barWidth,
			html: typeof parameters.headerHTML === 'string' ? parameters.headerHTML : headerHTML,
			cssmap: {
				'position' : 'relative',
				'margin-top' : barMargin + 'px',
				'margin-left' : 'auto',
				'margin-right' : 'auto'
			}
		});
		
		// message
		message = new _UIElement.Instance({
			id: 'message',
			elementType: 'p',
			width: barWidth,
			html: typeof parameters.messageHTML === 'string' ? parameters.messageHTML : messageHTML,
			cssmap: {
				'position' : 'relative',
				'margin-bottom' : barMargin + 'px',
				'margin-left' : 'auto',
				'margin-right' : 'auto'
			}
		});
		
		// display
		
		fill.parent = bar;
		header.parent = this;
		bar.parent = this;
		message.parent = this;
		
		// hide
		
		this.hide( { remove: false, time: 0 } );
		
	}
	
	function update_progress ( pct, message ) {
		
		var bar, fill;
		
		// update pct
		
		if ( main.is_number( pct ) && pct >= 0 ) {
			
			bar = this.childrenByID[ 'bar' ];
			fill = bar.childrenByID[ 'fill' ];
			
			fill.width = bar.width * pct;
			
		}
		else {
			
			this.clear_progress();
			
		}
		
		// set loading message
		
		this.message = message;
		
	}
	
	function clear_progress () {
		
		var bar = this.childrenByID[ 'bar' ],
			fill = bar.childrenByID[ 'fill' ];
		
		fill.width = 0;
		
	}
	
} (KAIOPUA) );