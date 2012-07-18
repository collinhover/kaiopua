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
		assetPath = "assets/modules/utils/ErrorHandler.js",
        _ErrorHandler = {},
        errorState = false,
        errorCurrent = {},
        errorStringBase = 'error',
		errorTypeGeneral = 'General',
        errorTypes = [ errorTypeGeneral, 'WebGLBrowser', 'WebGLComputer' ],
        webglNames = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
	
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
    
    // clear current errors
    clear();
    
    // check internal
    check_internal();
    
    function check_internal () {
        var canvas, context, errorType, i, l;
        
        // webgl browser check
        if ( !window.WebGLRenderingContext ) {
			
            errorType = 'WebGLBrowser';
			
        }
        else {
			
            canvas = document.createElement( 'canvas' );
            
            // try each browser's webgl type
            for (i = 0, l = webglNames.length; i < l; i += 1) {
				
                try {
					
                    context = canvas.getContext(webglNames[i]);
					
                }
                catch ( e ) {
                }
				
                if (context !== null && typeof context !== 'undefined') {
					
                    break;
					
                }
				
            }
            
            // if none found, there is another problem
            if ( context === null || typeof context === 'undefined') {
				
                errorType = 'WebGLComputer';
				
            }
        }
        
        // if error found, flag
        if (typeof errorType !== 'undefined') {
			
            flag(errorType);
			
        }
    }
    
    /*===================================================
    
    functions
    
    =====================================================*/
    
    // remove error state
    function clear () {
        shared.domElements.$errors.empty();
        errorCurrent = {};
        errorState = false;
    }
    
    // flag error
    function flag ( errorType ) {
        if (typeof errorType !== 'undefined') {
            window.location.hash = errorStringBase + '=' + errorType;
        }
    }
    
    // read flagged error
    function read () {
        var hashError, hashErrorIndex;
        
        // check url hash for error message
        hashError = window.location.hash.toString().replace( /#/, '', 1 );
        hashErrorIndex = hashError.indexOf( errorStringBase );
        if (hashErrorIndex != -1) {
            // get error type
            errorCurrent.type = hashError.replace( errorStringBase + '=', '', 1 );
            
            // set error state
            errorState = true;
        }
    }
    
    // check for errors
    function check () {
        // clear current errors
        clear();
        
        // read flagged errors
        read();
        
        return errorState;
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
            shared.signals.error.dispatch( errorCurrent.type, origin || 'Unknown Origin', lineNumber || 'N/A' );
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
    
    // show error to user
    function show ( error, origin, lineNumber ) {
		
        var errorType, $element;
        
        // if error type in list
		
        if ( errorTypes.indexOf( error ) !== -1 ) {
			
			errorType = error;
			
        }
		// else use general type
		else {
			
			errorType = errorTypeGeneral;
			
		}
		
		// find dom element
		
		$element = $( "#" + errorStringBase + errorType );
		
		// show
		
		main.dom_collapse( {
			element: $element,
			show: true
		} );
        
        // store
		
        errorCurrent.$element = $element;
		
    }
    
} ( KAIOPUA ) );