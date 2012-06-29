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
        errorHash = 'error=',
        errorTypes = {
            general: {
                header: "Well, that was embarrasing.",
                explanation: "We're very sorry about the error, but any progress you've made has been saved. <a href='" + shared.originLink + "'>All you need to do is reload the page.</a>"
            },
            webgl_browser: {
                header: "Oops! We need WebGL!",
                explanation: "We are sorry, but it appears that your browser does not support WebGL. For more information visit <a href='http://get.webgl.org' target='_blank'>Get WebGL</a> or try upgrading to one of these friendly browsers:",
                browser_extra: true
            },
            webgl_other: {
                header: "Oops! We need WebGL!",
                explanation: "Although your browser seems to support WebGL, it appears as if your computer does not. For more information visit the <a href='http://get.webgl.org/troubleshooting/' target='_blank'>WebGL troubleshooting</a> page."
            },
            fourohfour: {
                header: "We can't seem to find that page.",
                explanation: "Sorry, but the page you were trying to view does not exist. This is probably the result of either a mistyped address or an out-of-date link."
            },
            forbidden: {
                header: "We're afraid we can't let you do that.",
                explanation: "Sorry, but the page you were trying to view is locked or hidden for a reason we can't tell you."
            }
        },
        webglNames = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"],
        browser_html = "<div class='browsers_each chrome'><a href='http://www.google.com/chrome/' target='_blank'>Chrome</a></div><div class='browsers_each firefox'><a href='http://www.mozilla.org/firefox/' target='_blank'>Firefox</a></div><div class='browsers_each safari'><a href='http://www.apple.com/safari/' target='_blank'>Safari</a></div>";
    
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
        if (!window.WebGLRenderingContext) {
            errorType = 'webgl_browser';
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
            if (context === null || typeof context === 'undefined') {
                errorType = 'webgl_other';
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
        shared.html.errorContainer.empty();
        errorCurrent = {};
        errorState = false;
    }
    
    // flag error
    function flag ( errorType ) {
        if (typeof errorType !== 'undefined') {
            window.location.hash = errorHash + errorType;
        }
    }
    
    // read flagged error
    function read () {
        var hashError, hashErrorIndex;
        
        // check url hash for error message
        hashError = window.location.hash.toString().replace(/#/, '');
        hashErrorIndex = hashError.indexOf(errorHash);
        if (hashErrorIndex != -1) {
            // get error type
            errorCurrent.type = hashError.replace(/error=/i, '');
            
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
            
            // trigger error event
			
			dojo.publish( 'onerror', [ errorCurrent.type, origin || 'Unknown Origin', lineNumber || 'N/A' ] );
			
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
        var errorType, header, explanation, nerdtalk, extra, article, articleHeight, footerModifier = 0, animSpeed = 500;
        
        // does id not match a specific error
        if ( errorTypes.hasOwnProperty( error ) ) {
           errorType = error;
        }
		else {
			errorType = 'general';
		}
    
        // header
        header = document.createElement('header');
		$(header).addClass( 'title_alt text_huge' );
        $(header).html(errorTypes[errorType].header);
        
        // explanation
        explanation = document.createElement('p');
        $(explanation).addClass("error_explanation");
        $(explanation).html(errorTypes[errorType].explanation);
        
        // extra
        if (errorTypes[errorType].browser_extra === true) {
            extra = document.createElement('div');
            $(extra).addClass("browsers");
            $(extra).html(browser_html);
        }
        
        // article
        article = document.createElement('article');
        $(article).addClass("error info_panel unselectable");
        $(article).attr('id', errorType);
        
        // add to display
        $(article).append(header);
        $(article).append(explanation);
        shared.html.errorContainer.append(article);
        
        // set height and negative margin-top
        // no need to position, css top/left at 50%
        articleHeight = $(header).outerHeight() + $(explanation).outerHeight();
        if (typeof shared.html.staticMenu !== 'undefined') {
            footerModifier = shared.html.staticMenu.outerHeight() * 0.5;   
        }
        
        // append extra if needed
        if(typeof extra !== 'undefined') {
            $(article).append(extra);
            articleHeight = articleHeight + $(extra).outerHeight();
            $(extra).fadeOut(0).fadeIn(animSpeed);
        }
		
		// error message, origin, and line number
		
		if ( typeof origin  !== 'undefined' && typeof lineNumber !== 'undefined' ) {
			
			nerdtalk = document.createElement('p');
			$(nerdtalk).addClass("nerdtalk");
			$(nerdtalk).html( "the error was -> '" + error + "' in " + origin + " at line # " + lineNumber);
			$(article).append(nerdtalk);
			articleHeight = articleHeight + $(nerdtalk).outerHeight();
            $(nerdtalk).fadeOut(0).fadeIn(animSpeed);
			
		}
        
        // fade and slide smoothly to new values
        $(header).fadeOut(0).fadeIn(animSpeed);
        $(explanation).fadeOut(0).fadeIn(animSpeed);
        $(article).animate({
            'height': articleHeight, 
            'margin-top': Math.round(-((articleHeight * 0.5) + footerModifier))
        }, animSpeed);
        
        // store
        errorCurrent.domElements = {
            article: article, 
            header: header, 
            explanation: explanation,
            extra: extra
        };
    }
    
} ( KAIOPUA ) );