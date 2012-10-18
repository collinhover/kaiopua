/*
 *
 * ErrorHandler.js
 * Handles compatibility checks and user viewable errors.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/utils/ErrorHandler.js",
        _ErrorHandler = {},
        errorState = false,
        errorCurrent = {},
        errorStringBase = 'error',
		errorStringSearch = errorStringBase + '=',
		errorTypeGeneral = 'General',
        errorTypes = [ errorTypeGeneral, 'WebGLBrowser', 'WebGLComputer' ],
        webGLNames = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
	
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    _ErrorHandler.check = check;
    _ErrorHandler.generate = generate;
    _ErrorHandler.process = process;
    _ErrorHandler.clear = clear;
	
	Object.defineProperty( _ErrorHandler, 'errorState', { 
		get : function () { return errorState; }
	} );
	
	main.asset_register( assetPath, { data: _ErrorHandler } );
    
    /*===================================================
    
    internal init
    
    =====================================================*/
	
	( function () {
		
		var i, l,
			errorName,
			canvas, 
			context, 
			errorType;
		
		// signals
		
		shared.signals = shared.signals || {};
		
		shared.signals.onError = new signals.Signal();
		
		// ui
		
		shared.domElements = shared.domElements || {};
		
		for ( i = 0, l = errorTypes.length; i < l; i++ ) {
			
			errorName = errorStringBase + errorTypes[ i ];
			
			shared.domElements[ '$' + errorName ] = $( '#' + errorName );
			
		}
		
		// clean url
		
		history.pushState( { "pState": shared.originLink }, '', shared.originLink );
		
		// webgl browser check
		if ( !window.WebGLRenderingContext ) {
			
			errorType = 'WebGLBrowser';
			
		}
		else {
			
			canvas = document.createElement( 'canvas' );
			
			// try each browser's webgl type
			
			for (i = 0, l = webGLNames.length; i < l; i += 1) {
				
				try {
					
					context = canvas.getContext( webGLNames[i] );
					
				}
				catch ( e ) {
				
				}
				
				if ( context ) {
					
					break;
					
				}
				
			}
			
			// if none found, there is another problem
			if ( !context ) {
				
				errorType = 'WebGLComputer';
				
			}
			
		}
		
		// if error found, flag
		if ( typeof errorType === 'string' ) {
			
			flag( errorType );
			
		}
		
	}() );
    
    /*===================================================
    
    functions
    
    =====================================================*/
	
	// check for errors
    function check () {
		
        // clear current errors
        clear();
        
        // read flagged errors
        read();
        
        return errorState;
		
    }
    
    // remove error state
    function clear () {
		
        if ( typeof errorCurrent.$element !== 'undefined' ) {
			
			main.dom_collapse( {
				element: errorCurrent.$element
			} );
			
		}
        errorCurrent = {};
        errorState = false;
		
    }
	
	// read flagged error
    function read () {
		
        var hashError, 
			hashErrorIndex;
        
        // check url hash for error message
		
        hashError = window.location.hash.toString().replace( /#/, '' );
        hashErrorIndex = hashError.indexOf( errorStringSearch );
		
        if (hashErrorIndex != -1) {
			
            // get error type
            errorCurrent.type = hashError.replace( errorStringSearch, '' );
            
            // set error state
            errorState = true;
			
        }
		
    }
	
	// generate error
    function generate ( error, origin, lineNumber ) {
		
        if (typeof error !== 'undefined') {
			
            // flag error
            flag( error );
            
            // check for flagged errors
            check();
            
            // process errors
            process( origin, lineNumber );
			
        }
		
    }
    
    // flag error
    function flag ( errorType ) {
		
        if (typeof errorType !== 'undefined') {
			
            window.location.hash = errorStringSearch + errorType;
			
        }
		
    }
    
    // process error state
    function process ( origin, lineNumber ) {
		
        if (errorState === true) {
			
            // show current
			
            show( errorCurrent.type, origin, lineNumber );
            
            // set url back to origin link with history states
            // always hide unnecessary information from users
			
            history.pushState( { "pState": shared.originLink }, '', shared.originLink );
            
            // trigger shared error signal
			
            shared.signals.onError.dispatch( errorCurrent.type, origin || 'Unknown Origin', lineNumber || 'N/A' );
			
        }
		
    }
    
    // show error to user
    function show ( error, origin, lineNumber ) {
		
        var errorType, $element;
        
        // if error type in list
		
        if ( main.index_of_value( errorTypes, error ) !== -1 ) {
			
			errorType = error;
			
        }
		// else use general type
		else {
			
			errorType = errorTypeGeneral;
			
		}
		
		// find dom element
		
		errorCurrent.$element = shared.domElements[ '$' + errorStringBase + errorType ];
		
		// add error info if general error
		
		if ( errorType === errorTypeGeneral ) {
			
			// format origin
			
			if ( typeof origin === 'string' ) {
				
				index = origin.search( /\/(?![\s\S]*\/)/ );
				if ( index !== -1 ) {
					origin = origin.slice( index + 1 );
				}
				
				index = origin.search( /\?(?![\s\S]*\?)/ );
				if ( index !== -1 ) {
					origin = origin.slice( 0, index );
				}
				
			}
			
			errorCurrent.$element.find( "#errorMessage" ).html( error );
			errorCurrent.$element.find( "#errorFile" ).html( origin );
			errorCurrent.$element.find( "#errorLine" ).html( lineNumber );
			
		}
		
		// show
		
		main.dom_collapse( {
			element: errorCurrent.$element,
			show: true
		} );
        
    }
    
} ( KAIOPUA ) );